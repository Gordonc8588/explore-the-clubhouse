import { verifyAdminSessionToken } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { computeReschedulePricing, issueRefundAfterModification } from "@/lib/booking-modify";
import { sendBookingModifiedEmail } from "@/lib/email";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get("admin-session")?.value);
}

const adminActor = process.env.ADMIN_EMAIL || "admin";

/**
 * POST /api/admin/bookings/[id]/reschedule
 * Move a booking to a different set of days (incl. a different week), keeping the
 * SAME number of days. The DB move is atomic via apply_booking_modification; a
 * price drop is refunded synchronously. A price INCREASE is not yet supported
 * (needs the deferred-payment upcharge flow — Phase 4).
 * Body: { newClubId, clubDayIds: string[], reason? }
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
    const { newClubId, clubDayIds, reason } = await request.json();

    if (!newClubId || !Array.isArray(clubDayIds) || clubDayIds.length === 0) {
      return NextResponse.json(
        { error: "newClubId and clubDayIds are required" },
        { status: 400 }
      );
    }
    // Guard against duplicate day selections.
    if (new Set(clubDayIds).size !== clubDayIds.length) {
      return NextResponse.json({ error: "Each day can only be chosen once." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Current days — to enforce a 1:1 reschedule and carry the time slot across.
    const { data: currentDays, error: cdError } = await supabase
      .from("booking_days")
      .select("time_slot, club_day_id")
      .eq("booking_id", bookingId);
    if (cdError || !currentDays || currentDays.length === 0) {
      return NextResponse.json({ error: "Booking days not found" }, { status: 404 });
    }
    if (clubDayIds.length !== currentDays.length) {
      return NextResponse.json(
        {
          error: `Reschedule keeps the same number of days (${currentDays.length}). To add or remove days, use the add/remove flow (coming soon).`,
        },
        { status: 400 }
      );
    }
    // We carry a single time slot across; fail safe rather than defaulting a
    // mixed-slot booking to full_day (which would over-consume capacity).
    const slots = new Set(currentDays.map((d) => d.time_slot));
    if (slots.size > 1) {
      return NextResponse.json(
        { error: "This booking mixes morning/afternoon/full-day slots, which reschedule can't map yet." },
        { status: 400 }
      );
    }
    const commonSlot = [...slots][0];

    // Authoritative re-price (same engine as checkout, snapshotted discount).
    const pricing = await computeReschedulePricing(supabase, bookingId, newClubId, clubDayIds.length);
    if (pricing.error || !pricing.booking || !pricing.targetOption) {
      return NextResponse.json({ error: pricing.error || "Could not price this change" }, { status: 400 });
    }
    const booking = pricing.booking;
    const newTotalPence = pricing.newTotalPence ?? 0;
    const delta = pricing.deltaPence ?? 0;

    // No-op guard: same week + identical day-set → nothing to do (avoids a
    // spurious customer email + audit row).
    const currentDayIdsSorted = [...currentDays.map((d) => d.club_day_id)].sort();
    const requestedSorted = [...clubDayIds].sort();
    if (
      newClubId === booking.club_id &&
      JSON.stringify(currentDayIdsSorted) === JSON.stringify(requestedSorted)
    ) {
      return NextResponse.json(
        { error: "These are the days already booked — nothing to reschedule." },
        { status: 400 }
      );
    }

    if (delta > 0) {
      return NextResponse.json(
        {
          error: `This change increases the price by £${(delta / 100).toFixed(2)}. Charging extra isn't supported yet — that's coming in the next phase.`,
        },
        { status: 400 }
      );
    }

    // Target club name + new dates for the confirmation email.
    const { data: targetClub } = await supabase
      .from("clubs")
      .select("name")
      .eq("id", newClubId)
      .single();
    const { data: newDayRows } = await supabase
      .from("club_days")
      .select("date")
      .in("id", clubDayIds)
      .order("date", { ascending: true });
    const newDates = (newDayRows || []).map((d) => d.date);

    // Atomic DB move (capacity-checked, self-excluding) + audit row.
    const days = clubDayIds.map((id: string) => ({ club_day_id: id, time_slot: commonSlot }));
    const { data: modId, error: rpcError } = await supabase.rpc("apply_booking_modification", {
      p_booking_id: bookingId,
      p_new_club_id: newClubId,
      p_new_option_id: pricing.targetOption.id,
      p_new_children: booking.num_children,
      p_new_total: newTotalPence,
      p_days: days,
      p_modification_type: "reschedule",
      p_admin_actor: adminActor,
      p_direction: delta < 0 ? "refund" : "none",
      p_delta_pence: delta,
      p_reason: reason || null,
      p_old_state: { total_pence: booking.total_amount },
      p_new_state: { club_id: newClubId, total_pence: newTotalPence, dates: newDates },
    });

    if (rpcError) {
      if (rpcError.code === "23514") {
        return NextResponse.json({ error: rpcError.message }, { status: 400 });
      }
      console.error("apply_booking_modification (reschedule) failed:", rpcError);
      return NextResponse.json({ error: "Couldn't reschedule — please try again." }, { status: 500 });
    }

    // Booking is now moved. If it got cheaper, refund the difference (DB-first
    // ordering: a failed refund leaves a consistent, cheaper booking to retry).
    let refundedPence = 0;
    let refundWarning: string | null = null;
    if (delta < 0) {
      const r = await issueRefundAfterModification(supabase, {
        bookingId,
        paymentIntentId: booking.stripe_payment_intent_id,
        modId: (modId as string) ?? null,
        wantPence: -delta,
        keyPrefix: "reschedule-refund",
        reason: "reschedule",
        subject: "Booking moved",
      });
      refundedPence = r.refundedPence;
      refundWarning = r.warning;
    }

    // Confirmation email (states the actual refund, if any).
    try {
      await sendBookingModifiedEmail(booking as never, {
        newDates,
        newClubName: targetClub?.name || "Holiday Club",
        oldTotalPence: booking.total_amount,
        newTotalPence,
        deltaPence: delta,
        refundedPence,
      });
    } catch (e) {
      console.error("Failed to send reschedule email:", e);
    }

    return NextResponse.json({
      success: true,
      newTotalPence,
      refundedPence,
      warning: refundWarning,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/bookings/[id]/reschedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
