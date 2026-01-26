import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendBookingConfirmation, sendAdminNotification } from '@/lib/email';

/**
 * Manual payment verification endpoint for local development.
 * In production, webhooks handle this automatically.
 *
 * This endpoint checks the Stripe checkout session status and updates
 * the booking accordingly if payment was successful.
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get the booking with its Stripe session ID
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, booking_options(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Already paid
    if (booking.status === 'paid') {
      return NextResponse.json({
        success: true,
        status: 'already_paid',
        message: 'Booking is already marked as paid'
      });
    }

    if (!booking.stripe_checkout_session_id) {
      return NextResponse.json(
        { error: 'No Stripe session found for this booking' },
        { status: 400 }
      );
    }

    // Retrieve the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(
      booking.stripe_checkout_session_id
    );

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        success: false,
        status: 'unpaid',
        message: `Payment status: ${session.payment_status}. Complete payment in Stripe checkout first.`,
        checkoutUrl: session.url,
      });
    }

    // Payment is complete - update the booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError || !updatedBooking) {
      console.error('Failed to update booking:', updateError);
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 }
      );
    }

    // Send confirmation emails
    const { data: club } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', updatedBooking.club_id)
      .single();

    if (club) {
      console.log(`[VerifyPayment] Sending confirmation emails for booking ${bookingId}`);
      const timeSlot = booking.booking_options?.time_slot;

      // Send customer confirmation
      const confirmResult = await sendBookingConfirmation(updatedBooking, club, timeSlot);
      if (confirmResult.success) {
        console.log(`[VerifyPayment] Sent confirmation to ${updatedBooking.parent_email}`);
      } else {
        console.error(`[VerifyPayment] Failed to send confirmation: ${confirmResult.error}`);
      }

      // Send admin notification
      const adminResult = await sendAdminNotification(updatedBooking, club);
      if (adminResult.success) {
        console.log(`[VerifyPayment] Sent admin notification`);
      } else {
        console.error(`[VerifyPayment] Failed to send admin notification: ${adminResult.error}`);
      }
    } else {
      console.error(`[VerifyPayment] Club not found for booking ${bookingId}`);
    }

    // Create booking_days records if needed
    const metadata = session.metadata || {};
    const selectedDates = metadata.selectedDates ? JSON.parse(metadata.selectedDates) : [];
    const timeSlot = booking.booking_options?.time_slot || 'full_day';

    if (selectedDates.length > 0) {
      const { data: clubDays } = await supabase
        .from('club_days')
        .select('id, date')
        .eq('club_id', booking.club_id)
        .in('date', selectedDates);

      if (clubDays && clubDays.length > 0) {
        const bookingDaysToInsert = clubDays.map((day) => ({
          booking_id: bookingId,
          club_day_id: day.id,
          time_slot: timeSlot,
        }));

        await supabase.from('booking_days').insert(bookingDaysToInsert);
      }
    } else if (booking.booking_options?.option_type === 'full_week') {
      const { data: allClubDays } = await supabase
        .from('club_days')
        .select('id')
        .eq('club_id', booking.club_id)
        .eq('is_available', true);

      if (allClubDays && allClubDays.length > 0) {
        const bookingDaysToInsert = allClubDays.map((day) => ({
          booking_id: bookingId,
          club_day_id: day.id,
          time_slot: timeSlot,
        }));

        await supabase.from('booking_days').insert(bookingDaysToInsert);
      }
    }

    return NextResponse.json({
      success: true,
      status: 'verified',
      message: 'Payment verified and booking updated to paid status',
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
