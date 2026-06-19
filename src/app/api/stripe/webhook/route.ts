import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendBookingConfirmation, sendAdminNotification, sendBookingModifiedEmail, sendSeatingFailureAlert, sendDisputeAlert, type SendEmailResult } from '@/lib/email';
import { computeEditPricing } from '@/lib/booking-modify';
import { trackPurchaseConversion } from '@/lib/meta-conversions';
import type { Booking, Club } from '@/types/database';

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
      // Out-of-band refund sync: a refund issued in the Stripe Dashboard (or a bank
      // reversal) reconciles back into the booking ledger + status. Both events route
      // through the same idempotent reconcile (it reads Stripe's authoritative
      // cumulative amount, so redelivery / in-app overlap can't double-count).
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await reconcileBookingRefunds(charge.payment_intent as string | null);
        break;
      }
      case 'refund.updated': {
        const refund = event.data.object as Stripe.Refund;
        await reconcileBookingRefunds(refund.payment_intent as string | null);
        break;
      }
      case 'charge.dispute.created': {
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
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

  // 3. Seat the booking — atomically + capacity-checked via the locked RPC, so a
  // concurrent paid checkout for the last seat can't overbook a day (staff ratios).
  // The RPC is idempotent (no-op if the booking already has days), which also closes
  // the latent double-insert-on-redelivery bug.
  const selectedDatesArray: string[] = JSON.parse(selectedDates || '[]');
  let daysToSeat: { club_day_id: string; time_slot: string }[] = [];

  if (selectedDatesArray.length > 0) {
    const { data: clubDays } = await supabase
      .from('club_days')
      .select('id')
      .eq('club_id', clubId)
      .in('date', selectedDatesArray);
    daysToSeat = (clubDays || []).map((day) => ({ club_day_id: day.id, time_slot: timeSlot }));
  } else if (bookingOption?.option_type === 'full_week') {
    // Full week books ALL club days (including days marked unavailable for standalone booking).
    const { data: allClubDays } = await supabase
      .from('club_days')
      .select('id')
      .eq('club_id', clubId);
    daysToSeat = (allClubDays || []).map((day) => ({ club_day_id: day.id, time_slot: timeSlot }));
  }

  if (daysToSeat.length > 0) {
    const { error: seatError } = await supabase.rpc('create_initial_booking_days', {
      p_booking_id: bookingId,
      p_club_id: clubId,
      p_days: daysToSeat,
      p_num_children: booking.num_children,
    });

    if (seatError) {
      // SQLSTATE 23514 (check_violation) = the day filled up in the pay window. Owner
      // policy: refuse + alert admin — leave the booking paid-but-unseated for manual
      // resolution and do NOT send the parent a confirmation with no days.
      if (seatError.code === '23514') {
        console.error(`[Webhook] Booking ${bookingId} paid but could not be seated: ${seatError.message}`);
        await handleSeatingFailure(supabase, booking, clubId, seatError.message);
        return;
      }
      // Transient/unexpected DB error — throw so Stripe redelivers and retries.
      console.error(`[Webhook] create_initial_booking_days failed for ${bookingId}:`, seatError);
      throw new Error(`Failed to seat booking ${bookingId}: ${seatError.message}`);
    }
    console.log(`[Webhook] Seated booking ${bookingId} with ${daysToSeat.length} day(s)`);
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

/**
 * The public-checkout capacity guard refused a PAID booking (a day filled up in the
 * pay window). Owner policy: refuse + alert admin. The booking is left paid-but-
 * unseated for manual resolution (add capacity & seat, or refund via Cancel/Refund).
 * Writes a durable audit row and alerts the admin at most once per booking.
 */
async function handleSeatingFailure(
  supabase: ReturnType<typeof createAdminClient>,
  booking: Booking,
  clubId: string,
  detail: string,
): Promise<void> {
  // Alert once: fast-path SELECT, then rely on the one_seating_failed_per_booking
  // partial unique index to make it atomic under concurrent Stripe redelivery.
  const { data: existing } = await supabase
    .from('booking_modifications')
    .select('id')
    .eq('booking_id', booking.id)
    .eq('modification_type', 'seating_failed')
    .limit(1)
    .maybeSingle();
  if (existing) {
    console.log(`[Webhook] seating failure for booking ${booking.id} already recorded — skipping duplicate alert`);
    return;
  }

  const { error: insErr } = await supabase.from('booking_modifications').insert({
    booking_id: booking.id,
    admin_actor: 'webhook',
    modification_type: 'seating_failed',
    direction: 'none',
    status: 'failed',
    reason: `Paid but not seated: ${detail}`,
  });
  // 23505 = a concurrent delivery already recorded (and alerted for) this failure.
  if (insErr?.code === '23505') {
    console.log(`[Webhook] seating failure for booking ${booking.id} recorded concurrently — skipping duplicate alert`);
    return;
  }
  if (insErr) {
    // Audit row failed for another reason — still alert (better a stray email than a silent miss).
    console.error(`[Webhook] failed to record seating failure for booking ${booking.id}:`, insErr);
  }

  const { data: club } = await supabase.from('clubs').select('*').eq('id', clubId).single();
  await sendWithRetry(
    () => sendSeatingFailureAlert(booking, (club as Club) ?? null, detail),
    'seating failure alert',
    'admin',
  );
}

/**
 * Reconcile a booking's refund ledger + status from Stripe's authoritative state.
 * Triggered by charge.refunded / refund.updated so refunds issued OUTSIDE the app
 * (Stripe Dashboard, bank reversal) sync back. Idempotent: it reads Stripe's
 * cumulative amount_refunded (absolute, not a delta) across EVERY payment intent on
 * the booking, so redelivery or overlap with an in-app refund can't double-count.
 */
async function reconcileBookingRefunds(paymentIntentId: string | null): Promise<void> {
  if (!stripe || !paymentIntentId) return;
  const supabase = createAdminClient();

  // Map the intent → booking (booking_payments covers original + upcharge intents;
  // fall back to the booking's own original intent for pre-ledger bookings).
  let bookingId: string | null = null;
  const { data: pay } = await supabase
    .from('booking_payments')
    .select('booking_id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();
  if (pay) {
    bookingId = pay.booking_id;
  } else {
    const { data: b } = await supabase
      .from('bookings')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle();
    if (b) bookingId = b.id;
  }
  if (!bookingId) {
    console.warn(`[Webhook] refund for intent ${paymentIntentId} matched no booking — ignoring`);
    return;
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, stripe_payment_intent_id')
    .eq('id', bookingId)
    .single();
  if (!booking) return;

  // Every payment intent on this booking (ledger rows + the booking's own original).
  // This DB read DEFINES the set we reconcile over — if it fails, the intent set is
  // incomplete and any status/ledger write would be from a partial view (same
  // corruption class as a failed Stripe read), so throw to force a redelivery.
  const { data: pays, error: paysErr } = await supabase
    .from('booking_payments')
    .select('stripe_payment_intent_id')
    .eq('booking_id', bookingId);
  if (paysErr) {
    throw new Error(`reconcile: failed to load booking_payments for ${bookingId} — retrying on redelivery`);
  }
  const intentIds = new Set<string>();
  for (const p of pays || []) if (p.stripe_payment_intent_id) intentIds.add(p.stripe_payment_intent_id);
  if (booking.stripe_payment_intent_id) intentIds.add(booking.stripe_payment_intent_id);

  let totalCaptured = 0;
  let totalRefunded = 0;
  let readFailed = false;
  // Genuinely OUT-OF-BAND refunds only: in-app refunds always carry our metadata
  // (bookingId/modificationId), so we exclude them here — they're audited by the
  // route that issued them, and matching on metadata closes the window where an
  // in-app refund's stripe_refund_id stamp hasn't landed yet.
  const outOfBandRefunds: { id: string; amount: number; intent: string }[] = [];
  for (const intentId of intentIds) {
    try {
      const pi = await stripe.paymentIntents.retrieve(intentId);
      if (pi.status !== 'succeeded' || !pi.latest_charge) continue;
      const charge = await stripe.charges.retrieve(pi.latest_charge as string);
      totalCaptured += charge.amount_captured;
      totalRefunded += charge.amount_refunded;
      const refunds = await stripe.refunds.list({ charge: charge.id, limit: 100 });
      for (const r of refunds.data) {
        const issuedByApp = !!(r.metadata?.bookingId || r.metadata?.modificationId);
        if (r.status === 'succeeded' && !issuedByApp) {
          outOfBandRefunds.push({ id: r.id, amount: r.amount, intent: intentId });
        }
      }
    } catch (e) {
      readFailed = true;
      console.error(`[Webhook] reconcile: failed to read intent ${intentId} for booking ${bookingId}:`, e);
    }
  }

  // Money decisions require a COMPLETE view. If ANY intent read failed, the totals are
  // partial — never write status/ledger from a partial sum (it would corrupt
  // amount_refunded_pence or wrongly flip a multi-intent booking to 'refunded'). Throw
  // so the webhook returns non-200 and Stripe redelivers/retries once the transient clears.
  if (readFailed) {
    throw new Error(`reconcile: incomplete Stripe read for booking ${bookingId} — retrying on redelivery`);
  }

  // Write Stripe's absolute cumulative back to the ledger (idempotent).
  const updates: Record<string, unknown> = {
    amount_refunded_pence: totalRefunded,
    updated_at: new Date().toISOString(),
  };
  // A FULL refund (every captured penny returned) flips an ACTIVE booking to refunded.
  // Partial refunds leave the status untouched (still active for the remaining days).
  if (
    totalCaptured > 0 &&
    totalRefunded >= totalCaptured &&
    (booking.status === 'paid' || booking.status === 'complete')
  ) {
    updates.status = 'refunded';
  }
  await supabase.from('bookings').update(updates).eq('id', bookingId);

  // Audit each genuinely out-of-band refund once. The uniq_booking_mod_refund_id
  // partial index makes this race-proof: a concurrent reconcile (charge.refunded +
  // refund.updated both fire, and redelivery is at-least-once) that loses the insert
  // gets a unique violation (23505), which we treat as already-recorded.
  const { data: known } = await supabase
    .from('booking_modifications')
    .select('stripe_refund_id')
    .eq('booking_id', bookingId)
    .not('stripe_refund_id', 'is', null);
  const knownIds = new Set((known || []).map((k) => k.stripe_refund_id as string));
  for (const r of outOfBandRefunds) {
    if (knownIds.has(r.id)) continue;
    knownIds.add(r.id); // guard against same-batch duplicates
    const { error: insErr } = await supabase.from('booking_modifications').insert({
      booking_id: bookingId,
      admin_actor: 'stripe',
      modification_type: 'out_of_band_refund',
      direction: 'refund',
      status: 'applied',
      refund_amount_pence: r.amount,
      reason: 'Refund issued outside the app (Stripe Dashboard or bank reversal)',
      stripe_payment_intent_id: r.intent,
      stripe_refund_id: r.id,
      applied_at: new Date().toISOString(),
    });
    if (insErr) {
      if (insErr.code === '23505') {
        console.log(`[Webhook] out-of-band refund ${r.id} recorded concurrently — skipping duplicate`);
      } else {
        console.error(`[Webhook] failed to record out-of-band refund ${r.id} for booking ${bookingId}:`, insErr);
      }
      continue;
    }
    console.log(`[Webhook] Recorded out-of-band refund ${r.id} (${r.amount}p) for booking ${bookingId}`);
  }
}

/**
 * A Stripe dispute / chargeback was opened. We do NOT auto-refund (Stripe holds the
 * disputed funds; refunding on top would double-pay). Record an audit row + alert the
 * admin to respond in the Dashboard. Best-effort dedup against redelivery by dispute id.
 */
async function handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  const paymentIntentId = (dispute.payment_intent as string | null) ?? null;
  if (!paymentIntentId) {
    console.warn(`[Webhook] dispute ${dispute.id} has no payment_intent — ignoring`);
    return;
  }
  const supabase = createAdminClient();

  // Map the intent → booking (covers upcharge intents too).
  let bookingId: string | null = null;
  const { data: pay } = await supabase
    .from('booking_payments')
    .select('booking_id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();
  if (pay) {
    bookingId = pay.booking_id;
  } else {
    const { data: b } = await supabase
      .from('bookings')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle();
    if (b) bookingId = b.id;
  }
  if (!bookingId) {
    console.warn(`[Webhook] dispute ${dispute.id} (intent ${paymentIntentId}) matched no booking — ignoring`);
    return;
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, clubs(*)')
    .eq('id', bookingId)
    .single();
  if (!booking) return;

  // Dedup on the dispute id: fast-path SELECT, then rely on the
  // uniq_booking_mod_dispute_id partial unique index to make it atomic under
  // concurrent Stripe redelivery (alert at most once per dispute).
  const { data: existing } = await supabase
    .from('booking_modifications')
    .select('id')
    .eq('stripe_dispute_id', dispute.id)
    .limit(1)
    .maybeSingle();
  if (existing) {
    console.log(`[Webhook] dispute ${dispute.id} already recorded — skipping duplicate alert`);
    return;
  }

  const currency = (dispute.currency || 'gbp').toUpperCase();
  const { error: insErr } = await supabase.from('booking_modifications').insert({
    booking_id: bookingId,
    admin_actor: 'stripe',
    modification_type: 'dispute',
    direction: 'none',
    status: 'pending',
    reason: `Dispute ${dispute.id} opened (${dispute.reason}); ${(dispute.amount / 100).toFixed(2)} ${currency}`,
    stripe_payment_intent_id: paymentIntentId,
    stripe_dispute_id: dispute.id,
  });
  // 23505 = a concurrent delivery already recorded (and alerted for) this dispute.
  if (insErr?.code === '23505') {
    console.log(`[Webhook] dispute ${dispute.id} recorded concurrently — skipping duplicate alert`);
    return;
  }
  if (insErr) {
    console.error(`[Webhook] failed to record dispute ${dispute.id} for booking ${bookingId}:`, insErr);
  }

  await sendWithRetry(
    () =>
      sendDisputeAlert(booking as Booking, (booking.clubs as Club) ?? null, {
        amountPence: dispute.amount,
        reason: dispute.reason || 'unknown',
        disputeId: dispute.id,
      }),
    'dispute alert',
    'admin',
  );
  console.log(`[Webhook] Recorded dispute ${dispute.id} for booking ${bookingId}`);
}
