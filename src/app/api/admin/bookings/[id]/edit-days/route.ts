import { verifyAdminSessionToken } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { computeEditPricing, getRefundState, createUpchargeRequest, issueRefundAfterModification } from "@/lib/booking-modify";
import { sendBookingModifiedEmail } from "@/lib/email";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get("admin-session")?.value);
}

const adminActor = process.env.ADMIN_EMAIL || "admin";

/**
 * POST /api/admin/bookings/[id]/edit-days
 * Change the SET of days within the booking's current week (add or remove).
 * Body: { clubDayIds: string[], reason?, preview?: boolean }
 *
 * Re-prices via the cheapest valid option (full-week ⇄ per-day handled
 * automatically). preview=true returns the numbers only. On apply, a price drop
 * is refunded; a price increase is blocked here (it needs the Phase 4b
 * payment-link flow).
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
    const { clubDayIds, reason, preview } = await request.json();

    if (!Array.isArray(clubDayIds) || clubDayIds.length === 0) {
      return NextResponse.json({ error: "Pick at least one day." }, { status: 400 });
    }
    if (new Set(clubDayIds).size !== clubDayIds.length) {
      return NextResponse.json({ error: "Each day can only be chosen once." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const pricing = await computeEditPricing(supabase, bookingId, clubDayIds);
    if (pricing.error || !pricing.booking || !pricing.targetOption) {
      return NextResponse.json({ error: pricing.error || "Could not price this change" }, { status: 400 });
    }
    const booking = pricing.booking;
    const newTotalPence = pricing.newTotalPence ?? 0;
    const delta = pricing.deltaPence ?? 0;

    if (preview) {
      let refundablePence: number | null = null;
      if (delta < 0) {
        const rs = await getRefundState(booking.stripe_payment_intent_id);
        refundablePence = rs.ok ? rs.refundablePence ?? 0 : null;
      }
      return NextResponse.json({
        oldTotalPence: pricing.oldTotalPence,
        newTotalPence,
        deltaPence: delta,
        direction: delta > 0 ? "charge" : delta < 0 ? "refund" : "none",
        refundablePence,
        optionName: pricing.targetOption.name,
      });
    }

    // --- Apply ---
    // Current days — for slot carry-over, the no-op guard, and detecting adds.
    const { data: currentDays, error: cdError } = await supabase
      .from("booking_days")
      .select("time_slot, club_day_id")
      .eq("booking_id", bookingId);
    if (cdError || !currentDays || currentDays.length === 0) {
      return NextResponse.json({ error: "Booking days not found" }, { status: 404 });
    }

    const currentSorted = [...currentDays.map((d) => d.club_day_id)].sort();
    const requestedSorted = [...clubDayIds].sort();
    if (JSON.stringify(currentSorted) === JSON.stringify(requestedSorted)) {
      return NextResponse.json({ error: "These are the days already booked — nothing to change." }, { status: 400 });
    }

    const slots = new Set(currentDays.map((d) => d.time_slot));
    if (slots.size > 1) {
      return NextResponse.json(
        { error: "This booking mixes morning/afternoon/full-day slots, which this editor can't map yet." },
        { status: 400 }
      );
    }
    const commonSlot = [...slots][0];

    const { data: newDayRows } = await supabase
      .from("club_days")
      .select("date")
      .in("id", clubDayIds)
      .order("date", { ascending: true });
    const newDates = (newDayRows || []).map((d) => d.date);

    const days = clubDayIds.map((cid: string) => ({ club_day_id: cid, time_slot: commonSlot }));

    // Price went UP → collect the difference via the shared hosted-payment-link flow;
    // the webhook applies the change once paid (booking unchanged until then).
    if (delta > 0) {
      const result = await createUpchargeRequest(supabase, {
        booking,
        targetOptionId: pricing.targetOption.id,
        clubId: booking.club_id,
        numChildren: booking.num_children,
        newTotalPence,
        deltaPence: delta,
        days,
        newDates,
        reason: reason || null,
        adminActor,
      });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json({
        upcharge: true,
        checkoutUrl: result.checkoutUrl,
        deltaPence: delta,
        modificationId: result.modificationId,
      });
    }

    const { data: modId, error: rpcError } = await supabase.rpc("apply_booking_modification", {
      p_booking_id: bookingId,
      p_new_club_id: booking.club_id,
      p_new_option_id: pricing.targetOption.id,
      p_new_children: booking.num_children,
      p_new_total: newTotalPence,
      p_days: days,
      p_modification_type: "reduce_days",
      p_admin_actor: adminActor,
      p_direction: delta < 0 ? "refund" : "none",
      p_delta_pence: delta,
      p_reason: reason || null,
      p_old_state: { total_pence: booking.total_amount, day_ids: currentSorted },
      p_new_state: { total_pence: newTotalPence, dates: newDates, option: pricing.targetOption.name },
    });

    if (rpcError) {
      if (rpcError.code === "23514") {
        return NextResponse.json({ error: rpcError.message }, { status: 400 });
      }
      console.error("apply_booking_modification (edit-days) failed:", rpcError);
      return NextResponse.json({ error: "Couldn't update the days — please try again." }, { status: 500 });
    }

    // Refund the difference (DB-first; a failed refund leaves a consistent cheaper booking).
    let refundedPence = 0;
    let refundWarning: string | null = null;
    if (delta < 0) {
      const r = await issueRefundAfterModification(supabase, {
        bookingId,
        paymentIntentId: booking.stripe_payment_intent_id,
        modId: (modId as string) ?? null,
        wantPence: -delta,
        keyPrefix: "editdays-refund",
        reason: "reduce_days",
        subject: "Days updated",
      });
      refundedPence = r.refundedPence;
      refundWarning = r.warning;
    }

    try {
      const { data: club } = await supabase.from("clubs").select("name").eq("id", booking.club_id).single();
      await sendBookingModifiedEmail(booking as never, {
        newDates,
        newClubName: club?.name || "Holiday Club",
        oldTotalPence: booking.total_amount,
        newTotalPence,
        deltaPence: delta,
        refundedPence,
      });
    } catch (e) {
      console.error("Failed to send edit-days email:", e);
    }

    return NextResponse.json({ success: true, newTotalPence, refundedPence, warning: refundWarning });
  } catch (error) {
    console.error("Error in POST /api/admin/bookings/[id]/edit-days:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
