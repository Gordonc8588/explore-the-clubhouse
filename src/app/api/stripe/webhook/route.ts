import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendBookingConfirmation, sendAdminNotification } from '@/lib/email';

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
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
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
    // For full week, insert all available club days
    const { data: allClubDays } = await supabase
      .from('club_days')
      .select('id')
      .eq('club_id', clubId)
      .eq('is_available', true);

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

  // 4. Update promo code usage if applicable
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

  // 5. Get club details for email
  console.log(`[Webhook] Fetching club with id: ${clubId}`);
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single();

  if (clubError) {
    console.error(`[Webhook] Failed to fetch club ${clubId}:`, clubError);
  }

  // 6. Send confirmation emails
  if (club) {
    console.log(`[Webhook] Found club: ${club.name}, sending emails...`);
    // Send customer confirmation email
    const confirmationResult = await sendBookingConfirmation(booking, club);
    if (confirmationResult.success) {
      console.log(`[Webhook] Sent confirmation email to ${booking.parent_email} (messageId: ${confirmationResult.messageId})`);
    } else {
      console.error(`[Webhook] Failed to send confirmation email to ${booking.parent_email}: ${confirmationResult.error}`);
    }

    // Send admin notification email
    const adminResult = await sendAdminNotification(booking, club);
    if (adminResult.success) {
      console.log(`[Webhook] Sent admin notification email (messageId: ${adminResult.messageId})`);
    } else {
      console.error(`[Webhook] Failed to send admin notification: ${adminResult.error}`);
    }
  } else {
    console.error(`[Webhook] Club not found for id ${clubId}, skipping confirmation emails`);
  }

  console.log(`[Webhook] Successfully processed checkout.session.completed for booking ${bookingId}`);
}
