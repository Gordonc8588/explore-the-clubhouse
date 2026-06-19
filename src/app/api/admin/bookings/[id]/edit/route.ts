import { verifyAdminSessionToken } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  computeUnifiedPricing,
  getRefundState,
  issueRefundAfterModification,
  createUpchargeRequest,
} from "@/lib/booking-modify";
import { sendBookingModifiedEmail } from "@/lib/email";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get("admin-session")?.value);
}

const adminActor = process.env.ADMIN_EMAIL || "admin";

/**
 * POST /api/admin/bookings/[id]/edit
 * Unified "Edit booking" endpoint — stages a FULL proposed new state (target week,
 * day set, number of children), re-prices it server-authoritatively, and routes by
 * the signed delta. A thin caller of the proven core (computeUnifiedPricing +
 * apply_booking_modification RPC + issueRefundAfterModification + createUpchargeRequest);
 * no pricing/capacity/refund logic is reimplemented here.
 *
 * Body: { newClubId?, clubDayIds: string[], numChildren?, reason?, preview?: boolean }
 *
 * Money routing:
 *  - delta === 0  → apply (no money)
 *  - delta  <  0  → apply (DB-first), then refund the difference
 *  - delta  >  0  → ONLY same-week + same-children day additions use the payment-link
 *                   flow (the webhook re-prices against the current week/children, so
 *                   cross-week / children-increase up-charges are blocked here — Safe v1).
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
    const { clubDayIds, reason, preview } = body as {
      clubDayIds?: unknown;
      reason?: string;
      preview?: boolean;
    };
    const newClubId: string | null = typeof body.newClubId === "string" ? body.newClubId : null;
    const numChildrenRaw = body.numChildren;
    const numChildren: number | null =
      numChildrenRaw === undefined || numChildrenRaw === null ? null : Number(numChildrenRaw);

    if (!Array.isArray(clubDayIds) || clubDayIds.length === 0) {
      return NextResponse.json({ error: "Pick at least one day." }, { status: 400 });
    }
    if (!clubDayIds.every((d) => typeof d === "string")) {
      return NextResponse.json({ error: "Invalid day selection." }, { status: 400 });
    }
    if (new Set(clubDayIds).size !== clubDayIds.length) {
      return NextResponse.json({ error: "Each day can only be chosen once." }, { status: 400 });
    }
    if (numChildren !== null && (!Number.isInteger(numChildren) || numChildren < 1)) {
      return NextResponse.json({ error: "Number of children must be a whole number of at least 1." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Authoritative re-price of the full proposed state (cheapest valid option).
    const pricing = await computeUnifiedPricing(supabase, bookingId, {
      newClubId,
      clubDayIds: clubDayIds as string[],
      numChildren,
    });
    if (pricing.error || !pricing.booking || !pricing.targetOption) {
      return NextResponse.json({ error: pricing.error || "Could not price this change" }, { status: 400 });
    }
    const booking = pricing.booking;
    const newTotalPence = pricing.newTotalPence ?? 0;
    const delta = pricing.deltaPence ?? 0;
    const effectiveClubId = newClubId || booking.club_id;
    const effectiveChildren = pricing.proposedNumChildren ?? booking.num_children;
    const weekChanged = effectiveClubId !== booking.club_id;
    const childrenChanged = effectiveChildren !== booking.num_children;

    // Current days — slot carry-over, change detection, and the no-op guard.
    const { data: currentDays, error: cdError } = await supabase
      .from("booking_days")
      .select("time_slot, club_day_id")
      .eq("booking_id", bookingId);
    if (cdError || !currentDays || currentDays.length === 0) {
      return NextResponse.json({ error: "Booking days not found" }, { status: 404 });
    }
    // Carry a single time slot across; fail safe rather than defaulting a mixed-slot
    // booking to full_day (which would over-consume capacity).
    const slots = new Set(currentDays.map((d) => d.time_slot));
    if (slots.size > 1) {
      return NextResponse.json(
        { error: "This booking mixes morning/afternoon/full-day slots, which this editor can't map yet." },
        { status: 400 }
      );
    }
    const commonSlot = [...slots][0];

    const currentSorted = [...currentDays.map((d) => d.club_day_id)].sort();
    const requestedSorted = [...(clubDayIds as string[])].sort();
    const daySetChanged = JSON.stringify(currentSorted) !== JSON.stringify(requestedSorted);

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
        dayCount: pricing.dayCount,
        numChildren: effectiveChildren,
        weekChanged,
        childrenChanged,
        // True when a price increase can't be collected by this editor yet (Safe v1).
        chargeUnsupported: delta > 0 && (weekChanged || childrenChanged),
      });
    }

    // --- Apply ---
    if (!weekChanged && !childrenChanged && !daySetChanged) {
      return NextResponse.json({ error: "Nothing has changed — adjust the week, days, or number of children first." }, { status: 400 });
    }

    // Don't mutate a booking that has a live add-days payment link. A synchronous edit
    // underneath an unpaid link can be silently reverted when the parent later pays it
    // (the webhook re-applies the frozen day-set), and staging a new charge would collide
    // with the one-open-request rule. Require resolving the pending request first.
    const { data: openCharge } = await supabase
      .from("booking_modifications")
      .select("id")
      .eq("booking_id", bookingId)
      .eq("status", "pending")
      .eq("direction", "charge")
      .limit(1)
      .maybeSingle();
    if (openCharge) {
      return NextResponse.json(
        { error: "There's a pending payment request for this booking. Cancel it first, then edit." },
        { status: 400 }
      );
    }

    const { data: newDayRows } = await supabase
      .from("club_days")
      .select("date")
      .in("id", clubDayIds as string[])
      .order("date", { ascending: true });
    const newDates = (newDayRows || []).map((d) => d.date);
    const days = (clubDayIds as string[]).map((cid) => ({ club_day_id: cid, time_slot: commonSlot }));

    // Price INCREASE → deferred payment link, but only for the proven same-week,
    // same-children case (the webhook re-prices against current week/children).
    if (delta > 0) {
      if (weekChanged || childrenChanged) {
        return NextResponse.json(
          {
            error:
              "Charging extra for a different week or a higher number of children isn't available yet. For a price increase, keep the same week and number of children and add days only — or apply the change in steps.",
          },
          { status: 400 }
        );
      }
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

    // delta <= 0 → apply the whole new state atomically (capacity-checked) in one tx.
    const { data: modId, error: rpcError } = await supabase.rpc("apply_booking_modification", {
      p_booking_id: bookingId,
      p_new_club_id: effectiveClubId,
      p_new_option_id: pricing.targetOption.id,
      p_new_children: effectiveChildren,
      p_new_total: newTotalPence,
      p_days: days,
      p_modification_type: "edit",
      p_admin_actor: adminActor,
      p_direction: delta < 0 ? "refund" : "none",
      p_delta_pence: delta,
      p_reason: reason || null,
      p_old_state: {
        total_pence: booking.total_amount,
        club_id: booking.club_id,
        num_children: booking.num_children,
        day_ids: currentSorted,
      },
      p_new_state: {
        club_id: effectiveClubId,
        option: pricing.targetOption.name,
        num_children: effectiveChildren,
        total_pence: newTotalPence,
        dates: newDates,
      },
    });

    if (rpcError) {
      if (rpcError.code === "23514") {
        return NextResponse.json({ error: rpcError.message }, { status: 400 });
      }
      console.error("apply_booking_modification (edit) failed:", rpcError);
      return NextResponse.json({ error: "Couldn't apply the change — please try again." }, { status: 500 });
    }

    // Refund the difference (DB-first; a failed refund leaves a consistent, cheaper booking).
    let refundedPence = 0;
    let warning: string | null = null;
    if (delta < 0) {
      const r = await issueRefundAfterModification(supabase, {
        bookingId,
        paymentIntentId: booking.stripe_payment_intent_id,
        modId: (modId as string) ?? null,
        wantPence: -delta,
        keyPrefix: "edit-refund",
        reason: "edit",
        subject: "Change applied",
      });
      refundedPence = r.refundedPence;
      warning = r.warning;
    }

    // Confirmation email (states the actual refund, if any).
    try {
      const { data: targetClub } = await supabase.from("clubs").select("name").eq("id", effectiveClubId).single();
      await sendBookingModifiedEmail(booking as never, {
        newDates,
        newClubName: targetClub?.name || "Holiday Club",
        oldTotalPence: booking.total_amount,
        newTotalPence,
        deltaPence: delta,
        refundedPence,
      });
    } catch (e) {
      console.error("Failed to send edit email:", e);
    }

    return NextResponse.json({ success: true, newTotalPence, refundedPence, warning });
  } catch (error) {
    console.error("Error in POST /api/admin/bookings/[id]/edit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
