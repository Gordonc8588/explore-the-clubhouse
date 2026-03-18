import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { sendCancellationEmail } from "@/lib/email";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

/**
 * POST /api/admin/bookings/[id]/cancel
 * Cancel a booking, optionally refund via Stripe, and send cancellation email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const { refund = false } = await request.json();

    const supabase = createAdminClient();

    // Fetch booking with club details
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`*, clubs(*)`)
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status === "cancelled" || booking.status === "refunded") {
      return NextResponse.json(
        { error: `Booking is already ${booking.status}` },
        { status: 400 }
      );
    }

    let refundId: string | null = null;

    // Process Stripe refund if requested and booking was paid
    if (refund && booking.stripe_payment_intent_id) {
      if (!stripe) {
        return NextResponse.json(
          { error: "Stripe is not configured" },
          { status: 500 }
        );
      }

      try {
        const stripeRefund = await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
        });
        refundId = stripeRefund.id;
      } catch (stripeError: any) {
        console.error("Stripe refund error:", stripeError);
        return NextResponse.json(
          { error: `Stripe refund failed: ${stripeError.message}` },
          { status: 500 }
        );
      }
    }

    // Update booking status
    const newStatus = refund ? "refunded" : "cancelled";
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking status:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking status" },
        { status: 500 }
      );
    }

    // Send cancellation email to parent
    try {
      await sendCancellationEmail(
        booking,
        booking.clubs as any,
        refund
      );
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
      // Don't fail the request if email fails - the cancellation itself succeeded
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      refundId,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/bookings/[id]/cancel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
