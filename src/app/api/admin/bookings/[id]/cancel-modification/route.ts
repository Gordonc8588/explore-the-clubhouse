import { verifyAdminSessionToken } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get("admin-session")?.value);
}

/**
 * POST /api/admin/bookings/[id]/cancel-modification
 * Abandon a PENDING add-days payment request: expire the Stripe Checkout session
 * and mark the modification 'expired'. Body: { modificationId }
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
    const { modificationId } = await request.json();
    if (!modificationId) {
      return NextResponse.json({ error: "modificationId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: mod } = await supabase
      .from("booking_modifications")
      .select("id, booking_id, status, stripe_checkout_session_id")
      .eq("id", modificationId)
      .single();

    if (!mod || mod.booking_id !== bookingId) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (mod.status !== "pending") {
      return NextResponse.json({ error: `This request is already ${mod.status}.` }, { status: 400 });
    }

    // Has the parent already paid this request?
    let paid = false;
    let paymentIntentId: string | null = null;
    if (stripe && mod.stripe_checkout_session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(mod.stripe_checkout_session_id);
        paid = session.payment_status === "paid";
        paymentIntentId = (session.payment_intent as string) || null;
      } catch (e) {
        console.error("Failed to retrieve checkout session:", e);
      }
    }

    // Atomically claim the row (pending → refunded/expired) so we can't collide
    // with the webhook applying it concurrently.
    const newStatus = paid ? "refunded" : "expired";
    const { data: claimed } = await supabase
      .from("booking_modifications")
      .update({ status: newStatus, stripe_payment_intent_id: paymentIntentId })
      .eq("id", modificationId)
      .eq("status", "pending")
      .select("id");

    if (!claimed || claimed.length === 0) {
      // The webhook applied (or otherwise moved) it first — report truthfully.
      const { data: fresh } = await supabase
        .from("booking_modifications")
        .select("status")
        .eq("id", modificationId)
        .single();
      return NextResponse.json(
        { error: `This request was just ${fresh?.status ?? "updated"} — reload to see the latest.` },
        { status: 409 }
      );
    }

    if (paid && stripe && paymentIntentId) {
      // Parent already paid — refund it (shared idempotency key with the webhook,
      // so the two paths can never double-refund).
      try {
        await stripe.refunds.create(
          { payment_intent: paymentIntentId, metadata: { modificationId, reason: "cancelled_after_paid" } },
          { idempotencyKey: `mod-refund-${modificationId}` }
        );
      } catch (e) {
        console.error("Failed to refund after cancel:", e);
        return NextResponse.json(
          { error: "Cancelled, but the refund didn't go through — refund it in Stripe.", refundFailed: true },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, refunded: true });
    }

    // Not paid — expire the hosted session so the link stops working.
    if (stripe && mod.stripe_checkout_session_id) {
      try {
        await stripe.checkout.sessions.expire(mod.stripe_checkout_session_id);
      } catch (e) {
        console.error("Failed to expire checkout session:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/admin/bookings/[id]/cancel-modification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
