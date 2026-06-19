import { verifyAdminSessionToken } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { sendCancellationEmail, sendRefundEmail } from "@/lib/email";
import { getRefundState } from "@/lib/booking-modify";
import { cookies } from "next/headers";
import type Stripe from "stripe";
import type { BookingStatus } from "@/types/database";

async function isAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get("admin-session")?.value);
}

const adminActor = process.env.ADMIN_EMAIL || "admin";

/**
 * GET /api/admin/bookings/[id]/cancel
 * Returns the money state the cancel/refund modal needs.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: bookingId } = await params;
    const supabase = createAdminClient();

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("status, total_amount, amount_refunded_pence, stripe_payment_intent_id")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const refundState = await getRefundState(booking.stripe_payment_intent_id);

    return NextResponse.json({
      status: booking.status,
      totalAmountPence: booking.total_amount,
      hasPayment: !!booking.stripe_payment_intent_id,
      paymentStatus: refundState.paymentStatus ?? null,
      // Prefer the live Stripe ceiling; fall back to the stored ledger.
      alreadyRefundedPence: refundState.alreadyRefundedPence ?? booking.amount_refunded_pence,
      refundablePence: refundState.ok
        ? refundState.refundablePence
        : Math.max(0, booking.total_amount - (booking.amount_refunded_pence || 0)),
      refundError: refundState.ok ? null : refundState.error,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/bookings/[id]/cancel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

type CancelAction = "cancel" | "cancel_refund" | "partial_refund";

/**
 * POST /api/admin/bookings/[id]/cancel
 * Body: { action, refundAmountPence?, reason? }
 *  - cancel:         no refund, status -> cancelled
 *  - cancel_refund:  refund the full remaining balance, status -> refunded
 *  - partial_refund: refund a specific amount, status UNCHANGED (booking still active)
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
    const body = await request.json();
    const action: CancelAction = body.action;
    const reason: string | null = body.reason || null;

    if (!["cancel", "cancel_refund", "partial_refund"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`*, clubs(*)`)
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "refunded") {
      return NextResponse.json({ error: "Booking has already been fully refunded" }, { status: 400 });
    }

    // -------- Cancel with no refund --------
    if (action === "cancel") {
      if (booking.status === "cancelled") {
        return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
      }

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", bookingId);
      if (updateError) {
        return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
      }

      await supabase.from("booking_modifications").insert({
        booking_id: bookingId,
        admin_actor: adminActor,
        modification_type: "cancel",
        direction: "none",
        status: "applied",
        old_total_pence: booking.total_amount,
        new_total_pence: booking.total_amount,
        delta_pence: 0,
        reason,
        applied_at: new Date().toISOString(),
      });

      try {
        await sendCancellationEmail(booking, booking.clubs as never, false);
      } catch (e) {
        console.error("Failed to send cancellation email:", e);
      }

      return NextResponse.json({ success: true, status: "cancelled", moneyMoved: false, dbApplied: true });
    }

    // -------- Refund paths (cancel_refund / partial_refund) --------
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    // RECONCILE-FIRST: if a prior attempt already refunded in Stripe but failed to
    // finalize the booking record (money moved, DB write failed), FINISH the DB side
    // now — never issue a second refund. This makes a retry safe and is what the
    // "Finish refund" UI button drives.
    {
      const { data: dangling } = await supabase
        .from("booking_modifications")
        .select("*")
        .eq("booking_id", bookingId)
        .eq("direction", "refund")
        .eq("status", "pending")
        .not("stripe_refund_id", "is", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (dangling) {
        const rs = await getRefundState(booking.stripe_payment_intent_id);
        // Absolute cumulative refund per Stripe (idempotent — re-running is a no-op).
        const refundedTotalPence = rs.ok
          ? rs.alreadyRefundedPence ?? 0
          : (booking.amount_refunded_pence || 0) + (dangling.refund_amount_pence || 0);
        const reconciledStatus: BookingStatus =
          dangling.modification_type === "refund" ? "refunded" : booking.status;

        await supabase
          .from("bookings")
          .update({
            status: reconciledStatus,
            amount_refunded_pence: refundedTotalPence,
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookingId);
        await supabase
          .from("booking_modifications")
          .update({ status: "applied", applied_at: new Date().toISOString() })
          .eq("id", dangling.id);

        return NextResponse.json({
          success: true,
          reconciled: true,
          status: reconciledStatus,
          moneyMoved: false,
          dbApplied: true,
          refundId: dangling.stripe_refund_id,
          refundedPence: dangling.refund_amount_pence ?? 0,
        });
      }
    }

    const refundState = await getRefundState(booking.stripe_payment_intent_id);
    if (!refundState.ok) {
      return NextResponse.json({ error: refundState.error }, { status: 400 });
    }
    const ceiling = refundState.refundablePence ?? 0;
    if (ceiling <= 0) {
      return NextResponse.json({ error: "This payment has already been fully refunded in Stripe" }, { status: 400 });
    }

    // Determine the amount and resulting status.
    let refundPence: number;
    let newStatus: BookingStatus;
    let isPartial: boolean;
    if (action === "cancel_refund") {
      refundPence = ceiling; // refund everything still refundable
      newStatus = "refunded";
      isPartial = false;
    } else {
      // partial_refund
      refundPence = Math.round(Number(body.refundAmountPence));
      if (!Number.isFinite(refundPence) || refundPence < 1) {
        return NextResponse.json({ error: "Enter a refund amount of at least £0.01" }, { status: 400 });
      }
      if (refundPence > ceiling) {
        return NextResponse.json(
          { error: `Refund exceeds the £${(ceiling / 100).toFixed(2)} still available to refund.` },
          { status: 400 }
        );
      }
      newStatus = booking.status; // stays active (paid/complete)
      isPartial = true;
    }

    // Ledger row BEFORE the money moves, so a partial failure is self-describing.
    const { data: modRow } = await supabase
      .from("booking_modifications")
      .insert({
        booking_id: bookingId,
        admin_actor: adminActor,
        modification_type: action === "cancel_refund" ? "refund" : "partial_refund",
        direction: "refund",
        status: "pending",
        old_total_pence: booking.total_amount,
        new_total_pence: booking.total_amount,
        delta_pence: 0,
        refund_amount_pence: refundPence,
        reason,
        stripe_payment_intent_id: booking.stripe_payment_intent_id,
      })
      .select()
      .single();

    // Deterministic idempotency key: stable across retries of the SAME intended
    // refund (alreadyRefunded only changes once a refund actually succeeds).
    const idempotencyKey = `refund-${bookingId}-${refundState.alreadyRefundedPence}-${refundPence}`;

    let stripeRefund: Stripe.Refund;
    try {
      stripeRefund = await stripe.refunds.create(
        {
          payment_intent: booking.stripe_payment_intent_id as string,
          amount: refundPence,
          metadata: { bookingId, modificationId: modRow?.id ?? "", reason: reason ?? "" },
        },
        { idempotencyKey }
      );
    } catch (stripeError) {
      const msg = stripeError instanceof Error ? stripeError.message : "Unknown error";
      console.error("Stripe refund error:", stripeError);
      if (modRow?.id) {
        await supabase.from("booking_modifications").update({ status: "failed", reason: `${reason ?? ""} [stripe: ${msg}]` }).eq("id", modRow.id);
      }
      return NextResponse.json({ error: `Stripe refund failed: ${msg}`, moneyMoved: false, dbApplied: false }, { status: 500 });
    }

    // Stamp the refund id on the ledger row BEFORE the booking update, so that if
    // the booking update fails, reconcile-first can finish the DB on a later retry
    // WITHOUT issuing a second refund.
    if (modRow?.id) {
      await supabase
        .from("booking_modifications")
        .update({ stripe_refund_id: stripeRefund.id })
        .eq("id", modRow.id);
    }

    // amount_refunded_pence = live Stripe cumulative total (absolute → idempotent).
    const newRefundedTotal = (refundState.alreadyRefundedPence ?? 0) + refundPence;
    const { error: bookingUpdateError } = await supabase
      .from("bookings")
      .update({
        status: newStatus,
        amount_refunded_pence: newRefundedTotal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (bookingUpdateError) {
      console.error("Booking update failed AFTER refund:", bookingUpdateError);
      // Ledger row stays 'pending' WITH the refund id → reconcile-first will finish it.
      return NextResponse.json({
        success: false,
        moneyMoved: true,
        dbApplied: false,
        refundId: stripeRefund.id,
        refundedPence: refundPence,
        error: `Refunded £${(refundPence / 100).toFixed(2)} (ref ${stripeRefund.id}) but the booking record didn't finish updating. Click "Finish refund" to complete it — no further money will move.`,
      }, { status: 500 });
    }

    // Booking updated — finalize the ledger row.
    if (modRow?.id) {
      await supabase
        .from("booking_modifications")
        .update({ status: "applied", applied_at: new Date().toISOString() })
        .eq("id", modRow.id);
    }

    // A full cancellation also refunds any upcharge payments (separate intents),
    // so add-days money is never orphaned.
    if (action === "cancel_refund") {
      const { data: upcharges } = await supabase
        .from("booking_payments")
        .select("stripe_payment_intent_id")
        .eq("booking_id", bookingId)
        .eq("kind", "upcharge");
      let upchargeRefundedPence = 0;
      for (const up of upcharges || []) {
        try {
          const ups = await getRefundState(up.stripe_payment_intent_id);
          const amt = ups.refundablePence ?? 0;
          if (ups.ok && amt > 0) {
            const r = await stripe.refunds.create(
              { payment_intent: up.stripe_payment_intent_id, amount: amt, metadata: { bookingId } },
              { idempotencyKey: `cancel-upcharge-refund-${up.stripe_payment_intent_id}` }
            );
            upchargeRefundedPence += amt;
            // Audit row for the upcharge refund so the ledger stays coherent.
            await supabase.from("booking_modifications").insert({
              booking_id: bookingId,
              admin_actor: adminActor,
              modification_type: "refund",
              direction: "refund",
              status: "applied",
              refund_amount_pence: amt,
              reason: "Upcharge refunded on full cancellation",
              stripe_payment_intent_id: up.stripe_payment_intent_id,
              stripe_refund_id: r.id,
              applied_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error("Failed to refund upcharge intent on full cancel:", e);
        }
      }
      // Keep amount_refunded_pence booking-wide cumulative (original + upcharges).
      if (upchargeRefundedPence > 0) {
        await supabase
          .from("bookings")
          .update({ amount_refunded_pence: newRefundedTotal + upchargeRefundedPence })
          .eq("id", bookingId);
      }
    }

    // Email the parent the ACTUAL amount.
    try {
      const remainingChargedPence = Math.max(0, booking.total_amount - newRefundedTotal);
      await sendRefundEmail(booking, booking.clubs as never, refundPence, isPartial, remainingChargedPence, reason);
    } catch (e) {
      console.error("Failed to send refund email:", e);
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      moneyMoved: true,
      dbApplied: true,
      refundId: stripeRefund.id,
      refundedPence: refundPence,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/bookings/[id]/cancel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
