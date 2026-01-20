import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { updateBooking } from '../checkout/route';

// =============================================================================
// TYPES
// =============================================================================

interface BookingDay {
  id: string;
  booking_id: string;
  club_day_id: string;
  time_slot: 'full_day' | 'morning' | 'afternoon';
  created_at: string;
}

interface SessionMetadata {
  booking_id: string;
  club_id: string;
  club_slug: string;
  option_id: string;
  selected_dates: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  num_children: string;
  promo_code: string;
  promo_code_id: string;
  total_amount: string;
}

// =============================================================================
// MOCK DATA STORE
// =============================================================================

// Mock booking days storage - in production, this would be in the database
const mockBookingDays: Map<string, BookingDay[]> = new Map();

// Mock promo code usage tracking - in production, update promo_codes.times_used
const promoCodeUsage: Map<string, number> = new Map();

/**
 * Store booking days in mock storage
 * In production, this would insert into the booking_days table
 */
function storeBookingDays(bookingId: string, days: BookingDay[]): void {
  mockBookingDays.set(bookingId, days);
  console.log(`[Webhook] Stored ${days.length} booking days for booking ${bookingId}`);
}

/**
 * Update promo code usage count
 * In production, this would increment promo_codes.times_used
 */
function incrementPromoCodeUsage(promoCodeId: string): void {
  const currentUsage = promoCodeUsage.get(promoCodeId) || 0;
  promoCodeUsage.set(promoCodeId, currentUsage + 1);
  console.log(`[Webhook] Incremented promo code ${promoCodeId} usage to ${currentUsage + 1}`);
}

/**
 * Send confirmation email (placeholder)
 * In production, this would integrate with an email service like SendGrid, Resend, etc.
 */
async function sendConfirmationEmail(
  email: string,
  bookingId: string,
  parentName: string,
  clubSlug: string
): Promise<void> {
  // TODO: Implement email sending with a service like SendGrid, Resend, or AWS SES
  console.log(`[Webhook] Confirmation email placeholder:`);
  console.log(`  To: ${email}`);
  console.log(`  Booking ID: ${bookingId}`);
  console.log(`  Parent: ${parentName}`);
  console.log(`  Club: ${clubSlug}`);
  console.log(`  Note: Email sending not yet implemented`);
}

// =============================================================================
// WEBHOOK HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    console.error('[Webhook] Stripe is not configured');
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  // Get the webhook secret
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret is not configured' },
      { status: 500 }
    );
  }

  // Get the raw body and signature
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('[Webhook] No stripe-signature header found');
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Webhook] Signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 }
    );
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  // Handle the event
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
    return NextResponse.json(
      { error: `Webhook handler failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Handle checkout.session.completed event
 * This is called when a customer successfully completes payment
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log(`[Webhook] Processing checkout.session.completed for session ${session.id}`);

  // Extract metadata from the session
  const metadata = session.metadata as unknown as SessionMetadata;

  if (!metadata?.booking_id) {
    console.error('[Webhook] No booking_id in session metadata');
    throw new Error('Missing booking_id in session metadata');
  }

  const {
    booking_id,
    club_id,
    club_slug,
    selected_dates,
    parent_name,
    parent_email,
    promo_code_id,
  } = metadata;

  console.log(`[Webhook] Processing booking ${booking_id} for club ${club_slug}`);

  // 1. Update booking status to 'paid'
  const updatedBooking = updateBooking(booking_id, {
    status: 'paid',
    stripe_payment_intent_id: session.payment_intent as string,
  });

  if (!updatedBooking) {
    // In production with a real database, we might need to create the booking
    // if it doesn't exist (e.g., if the checkout route used a different data store)
    console.error(`[Webhook] Booking ${booking_id} not found`);
    throw new Error(`Booking ${booking_id} not found`);
  }

  console.log(`[Webhook] Updated booking ${booking_id} status to 'paid'`);

  // 2. Create booking_days records
  const selectedDatesArray: string[] = JSON.parse(selected_dates || '[]');

  if (selectedDatesArray.length > 0) {
    const bookingDays: BookingDay[] = selectedDatesArray.map((date, index) => ({
      id: `booking-day-${booking_id}-${index}`,
      booking_id: booking_id,
      // In production, we'd look up the club_day_id from the club_days table
      // based on club_id and date. For now, we create a placeholder ID.
      club_day_id: `club-day-${club_id}-${date}`,
      // In production, we'd get the time_slot from the booking option
      time_slot: 'full_day' as const,
      created_at: new Date().toISOString(),
    }));

    storeBookingDays(booking_id, bookingDays);
    console.log(`[Webhook] Created ${bookingDays.length} booking day records`);
  }

  // 3. Update promo code usage if applicable
  if (promo_code_id) {
    incrementPromoCodeUsage(promo_code_id);
    console.log(`[Webhook] Updated promo code usage for ${promo_code_id}`);
  }

  // 4. Trigger confirmation email
  await sendConfirmationEmail(
    parent_email,
    booking_id,
    parent_name,
    club_slug
  );

  console.log(`[Webhook] Successfully processed checkout.session.completed for booking ${booking_id}`);
}
