import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendBookingConfirmation, sendAdminNotification, sendBookingModifiedEmail, type SendEmailResult } from '@/lib/email';
import { computeEditPricing } from '@/lib/booking-modify';
import { trackPurchaseConversion } from '@/lib/meta-conversions';

interface SessionMetadata {
  bookingId: string;
  clubId: string;
  clubSlug: string;
  bookingOptionId: string;
  selectedDates: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childrenCount: string;
  promoCodeId: string;
  subtotal: string;
  discountAmount: string;
  total: string;
  // UTM attribution
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export async function POST(request: NextRequest) {
  if (!stripe) {
    console.error('[Webhook] Stripe is not configured');
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('[Webhook] No stripe-signature header found');
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Webhook] Signature verification failed: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.kind === 'modification') {
          await handleModificationPaid(session);
        } else {
          await handleCheckoutSessionCompleted(session);
        }
        break;
      }
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Webhook] Error processing event ${event.type}: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook handler failed` }, { status: 500 });
  }
}

/**
 * Retry an email send once after a short delay if the first attempt fails.
 */
async function sendWithRetry(
  sendFn: () => Promise<SendEmailResult>,
  emailType: string,
  recipient: string,
): Promise<SendEmailResult> {
  const result = await sendFn();
  if (result.success) return result;

  console.warn(`[Webhook] ${emailType} email to ${recipient} failed (${result.error}), retrying in 1s...`);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const retryResult = await sendFn();
  if (!retryResult.success) {
    console.error(`[Webhook] ${emailType} email to ${recipient} failed after retry: ${retryResult.error}`);
  }
  return retryResult;
}

/**
 * Refund a captured upcharge exactly once. Uses a per-modification idempotency
 * key shared with the cancel path, so no two routes can double-refund. RE-THROWS
 * on failure so the webhook returns non-200 and Stripe redelivers (retry-safe).
 */
async function refundUpchargeOnce(modificationId: string, paymentIntentId: string | null, reason: string): Promise<void> {
  if (!stripe || !paymentIntentId) return;
  try {
    await stripe.refunds.create(
      { payment_intent: paymentIntentId, metadata: { modificationId, reason } },
      { idempotencyKey: `mod-refund-${modificationId}` }
    );
  } catch (e) {
    console.error(`[Webhook] refund (${reason}) for modification ${modificationId} failed — will retry on redelivery:`, e);
    throw e;
  }
}

/**
 * A parent paid the hosted Checkout link for an add-days upcharge. Re-prices at
 * pay time, then applies the stored modification via an ATOMIC claim inside the
 * RPC (mutually exclusive with cancel + idempotent against redelivery). If the
 * price drifted, capacity is gone, or the request was cancelled, the upcharge is
 * refunded instead of applied.
 */
async function handleModificationPaid(session: Stripe.Checkout.Session): Promise<void> {
  const modificationId = session.metadata?.modificationId;
  if (!modificationId) {
    console.error('[Webhook] modification session missing modificationId');
    return;
  }
  const paymentIntentId = session.payment_intent as string;
  const supabase = createAdminClient();

  const { data: mod } = await supabase
    .from('booking_modifications')
    .select('*')
    .eq('id', modificationId)
    .single();
  if (!mod) {
    console.error(`[Webhook] modification ${modificationId} not found`);
    return;
  }

  // Already finalised. Idempotent no-op — EXCEPT a cancelled request the parent
  // nevertheless paid (race with cancel): refund to avoid orphaned money.
  if (mod.status !== 'pending') {
    if (mod.status === 'expired' && paymentIntentId) {
      await refundUpchargeOnce(modificationId, paymentIntentId, 'cancelled_but_paid');
    } else {
      console.log(`[Webhook] modification ${modificationId} already ${mod.status} — no-op`);
    }
    return;
  }

  const ns = (mod.new_state || {}) as {
    club_id: string;
    option_id: string;
    num_children: number;
    total_pence: number;
    days: { club_day_id: string; time_slot: string }[];
    dates: string[];
  };

  // Re-price at pay time. If the price drifted since the link was created (an
  // option or discount was edited), do NOT apply — refund and fail.
  const clubDayIds = (ns.days || []).map((d) => d.club_day_id);
  const fresh = await computeEditPricing(supabase, mod.booking_id, clubDayIds);
  if (fresh.error || fresh.newTotalPence !== ns.total_pence) {
    console.error(`[Webhook] modification ${modificationId} price drift (frozen ${ns.total_pence}, now ${fresh.newTotalPence ?? 'error'}) — refunding`);
    await refundUpchargeOnce(modificationId, paymentIntentId, 'price_changed');
    await supabase
      .from('booking_modifications')
      .update({ status: 'failed', stripe_payment_intent_id: paymentIntentId })
      .eq('id', modificationId)
      .eq('status', 'pending');
    return;
  }

  // Atomic claim + apply: the RPC flips pending → applied in the same transaction
  // as the day-set change, and returns NULL if the row is no longer pending.
  const { data: appliedId, error: rpcError } = await supabase.rpc('apply_booking_modification', {
    p_booking_id: mod.booking_id,
    p_new_club_id: ns.club_id,
    p_new_option_id: ns.option_id,
    p_new_children: ns.num_children,
    p_new_total: ns.total_pence,
    p_days: ns.days,
    p_modification_type: 'add_days',
    p_admin_actor: 'webhook',
    p_direction: 'charge',
    p_delta_pence: mod.delta_pence,
    p_reason: mod.reason,
    p_old_state: { total_pence: mod.old_total_pence },
    p_new_state: ns,
    p_modification_id: modificationId,
  });

  if (rpcError) {
    // Capacity gone in the pay window (or another failure). Refund first; if the
    // refund throws, refundUpchargeOnce re-throws so Stripe redelivers and retries
    // — we do NOT mark 'failed' until the refund is confirmed.
    console.error(`[Webhook] modification ${modificationId} apply failed:`, rpcError);
    await refundUpchargeOnce(modificationId, paymentIntentId, 'apply_failed');
    await supabase
      .from('booking_modifications')
      .update({ status: 'failed', stripe_payment_intent_id: paymentIntentId })
      .eq('id', modificationId)
      .eq('status', 'pending');
    return;
  }

  if (!appliedId) {
    // Claim returned NULL: cancelled/expired or already applied between read and now.
    const { data: freshMod } = await supabase
      .from('booking_modifications')
      .select('status')
      .eq('id', modificationId)
      .single();
    if (freshMod?.status !== 'applied' && paymentIntentId) {
      await refundUpchargeOnce(modificationId, paymentIntentId, 'not_applied');
    }
    return;
  }

  // Applied (status flipped inside the RPC). Record the payment + email the parent.
  await supabase
    .from('booking_modifications')
    .update({ stripe_payment_intent_id: paymentIntentId })
    .eq('id', modificationId);

  await supabase
    .from('booking_payments')
    .upsert(
      { booking_id: mod.booking_id, stripe_payment_intent_id: paymentIntentId, amount_pence: mod.delta_pence, kind: 'upcharge' },
      { onConflict: 'stripe_payment_intent_id', ignoreDuplicates: true }
    );

  const { data: booking } = await supabase.from('bookings').select('*').eq('id', mod.booking_id).single();
  const { data: club } = await supabase.from('clubs').select('name').eq('id', ns.club_id).single();
  if (booking) {
    await sendWithRetry(
      () =>
        sendBookingModifiedEmail(booking, {
          newDates: ns.dates || [],
          newClubName: club?.name || 'Holiday Club',
          oldTotalPence: mod.old_total_pence ?? booking.total_amount,
          newTotalPence: ns.total_pence,
          deltaPence: mod.delta_pence ?? 0,
          refundedPence: 0,
          chargedPence: mod.delta_pence ?? 0,
        }),
      'modification paid',
      booking.parent_email,
    );
  }
  console.log(`[Webhook] Applied add-days modification ${modificationId} for booking ${mod.booking_id}`);
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log(`[Webhook] Processing checkout.session.completed for session ${session.id}`);

  const metadata = session.metadata as unknown as SessionMetadata;

  if (!metadata?.bookingId) {
    console.error('[Webhook] No bookingId in session metadata');
    throw new Error('Missing bookingId in session metadata');
  }

  const {
    bookingId,
    clubId,
    clubSlug,
    bookingOptionId,
    selectedDates,
    promoCodeId,
  } = metadata;

  console.log(`[Webhook] Processing booking ${bookingId} for club ${clubSlug}`);

  const supabase = createAdminClient();

  // 1. Update booking status to 'paid'
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .update({
      status: 'paid',
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (bookingError || !booking) {
    console.error(`[Webhook] Failed to update booking ${bookingId}:`, bookingError);
    throw new Error(`Failed to update booking ${bookingId}`);
  }

  console.log(`[Webhook] Updated booking ${bookingId} status to 'paid'`);

  // 1b. Record the original payment (idempotent) so later full refunds can cover
  // every captured intent (the booking may gain upcharge intents over time).
  if (session.payment_intent) {
    await supabase
      .from('booking_payments')
      .upsert(
        {
          booking_id: bookingId,
          stripe_payment_intent_id: session.payment_intent as string,
          amount_pence: booking.total_amount,
          kind: 'original',
        },
        { onConflict: 'stripe_payment_intent_id', ignoreDuplicates: true }
      );
  }

  // 2. Get the booking option to determine time_slot
  const { data: bookingOption } = await supabase
    .from('booking_options')
    .select('time_slot, option_type')
    .eq('id', bookingOptionId)
    .single();

  const timeSlot = bookingOption?.time_slot || 'full_day';

  // 3. Create booking_days records
  const selectedDatesArray: string[] = JSON.parse(selectedDates || '[]');

  if (selectedDatesArray.length > 0) {
    // Get club_day IDs for the selected dates
    const { data: clubDays } = await supabase
      .from('club_days')
      .select('id, date')
      .eq('club_id', clubId)
      .in('date', selectedDatesArray);

    if (clubDays && clubDays.length > 0) {
      const bookingDaysToInsert = clubDays.map((day) => ({
        booking_id: bookingId,
        club_day_id: day.id,
        time_slot: timeSlot,
      }));

      const { error: daysError } = await supabase
        .from('booking_days')
        .insert(bookingDaysToInsert);

      if (daysError) {
        console.error(`[Webhook] Failed to create booking days:`, daysError);
      } else {
        console.log(`[Webhook] Created ${bookingDaysToInsert.length} booking day records`);
      }
    }
  } else if (bookingOption?.option_type === 'full_week') {
    // For full week, insert ALL club days (including days marked unavailable for standalone booking)
    const { data: allClubDays } = await supabase
      .from('club_days')
      .select('id')
      .eq('club_id', clubId);

    if (allClubDays && allClubDays.length > 0) {
      const bookingDaysToInsert = allClubDays.map((day) => ({
        booking_id: bookingId,
        club_day_id: day.id,
        time_slot: timeSlot,
      }));

      const { error: daysError } = await supabase
        .from('booking_days')
        .insert(bookingDaysToInsert);

      if (daysError) {
        console.error(`[Webhook] Failed to create booking days:`, daysError);
      } else {
        console.log(`[Webhook] Created ${bookingDaysToInsert.length} booking day records for full week`);
      }
    }
  }

  // 3b. Query the actual booked dates for emails
  const { data: bookedDays } = await supabase
    .from('booking_days')
    .select('club_days(date)')
    .eq('booking_id', bookingId);

  const bookedDates: string[] = (bookedDays || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((bd: any) => bd.club_days?.date)
    .filter((d: unknown): d is string => typeof d === 'string')
    .sort();

  // 4. Get club details for email (moved earlier to send emails before analytics)
  console.log(`[Webhook] Fetching club with id: ${clubId}`);
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single();

  if (clubError) {
    console.error(`[Webhook] Failed to fetch club ${clubId}:`, clubError);
  }

  // 5. Send confirmation emails (prioritised before analytics/promo tracking)
  if (club) {
    console.log(`[Webhook] Found club: ${club.name}, sending emails...`);
    // Send customer confirmation email with retry
    const confirmationResult = await sendWithRetry(
      () => sendBookingConfirmation(booking, club, timeSlot, bookedDates),
      'confirmation',
      booking.parent_email,
    );
    if (confirmationResult.success) {
      console.log(`[Webhook] Sent confirmation email to ${booking.parent_email} (messageId: ${confirmationResult.messageId})`);
    } else {
      console.error(`[Webhook] Failed to send confirmation email to ${booking.parent_email} after retries: ${confirmationResult.error}`);
    }

    // Send admin notification email with retry
    const adminResult = await sendWithRetry(
      () => sendAdminNotification(booking, club, bookedDates),
      'admin notification',
      'admin',
    );
    if (adminResult.success) {
      console.log(`[Webhook] Sent admin notification email (messageId: ${adminResult.messageId})`);
    } else {
      console.error(`[Webhook] Failed to send admin notification after retries: ${adminResult.error}`);
    }
  } else {
    console.error(`[Webhook] Club not found for id ${clubId}, skipping confirmation emails`);
  }

  // 6. Update promo code usage if applicable
  if (promoCodeId) {
    const { error: promoError } = await supabase
      .rpc('increment_promo_usage', { promo_id: promoCodeId });

    // Fallback if RPC doesn't exist
    if (promoError) {
      await supabase
        .from('promo_codes')
        .update({ times_used: supabase.rpc('increment', { x: 1 }) })
        .eq('id', promoCodeId);
    }
    console.log(`[Webhook] Updated promo code usage for ${promoCodeId}`);
  }

  // 7. Track purchase conversion via Meta Conversions API (server-side)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://exploretheclubhouse.co.uk';
  const metaResult = await trackPurchaseConversion({
    bookingId: booking.id,
    email: booking.parent_email,
    phone: booking.parent_phone,
    value: booking.total_amount,
    clubId: clubId,
    clubName: club?.name || 'Holiday Club',
    numChildren: booking.num_children,
    eventSourceUrl: `${siteUrl}/book/${clubSlug}`,
  });

  if (metaResult.success) {
    console.log(`[Webhook] Meta Conversions API purchase tracked for booking ${bookingId}`);
  } else if (metaResult.error !== 'Meta Conversions API not configured') {
    console.error(`[Webhook] Meta Conversions API error: ${metaResult.error}`);
  }

  // 8. Store analytics event for first-party tracking
  await supabase.from('analytics_events').insert({
    event_name: 'purchase',
    event_data: {
      booking_id: bookingId,
      club_id: clubId,
      club_name: club?.name,
      value: booking.total_amount,
      num_children: booking.num_children,
      promo_code_id: promoCodeId || null,
    },
    utm_source: metadata.utmSource || null,
    utm_medium: metadata.utmMedium || null,
    utm_campaign: metadata.utmCampaign || null,
  });

  console.log(`[Webhook] Successfully processed checkout.session.completed for booking ${bookingId}`);
}
