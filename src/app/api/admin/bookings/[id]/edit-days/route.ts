import { verifyAdminSessionToken } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { computeEditPricing, getRefundState } from "@/lib/booking-modify";
import { sendBookingModifiedEmail, sendModificationPaymentRequestEmail } from "@/lib/email";
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

    // Price went UP → don't change the booking. Collect the difference via a hosted
    // Checkout link and apply it in the webhook once paid (deferred upcharge).
    if (delta > 0) {
      if (!stripe) {
        return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
      }

      // Best-effort capacity pre-check on newly-added days (the RPC re-checks
      // authoritatively at apply time).
      const currentSet = new Set(currentSorted);
      const addedIds = clubDayIds.filter((cid: string) => !currentSet.has(cid));
      for (const cid of addedIds) {
        const { data: avail } = await supabase.rpc("get_club_day_availability", { day_id: cid });
        const a = avail?.[0];
        if (a) {
          const remaining =
            commonSlot === "afternoon"
              ? a.afternoon_capacity - a.afternoon_booked
              : commonSlot === "morning"
                ? a.morning_capacity - a.morning_booked
                : Math.min(a.morning_capacity - a.morning_booked, a.afternoon_capacity - a.afternoon_booked);
          if (remaining < booking.num_children) {
            return NextResponse.json({ error: "One of the new days doesn't have enough space." }, { status: 400 });
          }
        }
      }

      // Only one open payment request per booking — otherwise two links could
      // both be paid (double charge).
      const { data: existingPending } = await supabase
        .from("booking_modifications")
        .select("id")
        .eq("booking_id", bookingId)
        .eq("status", "pending")
        .eq("direction", "charge")
        .limit(1)
        .maybeSingle();
      if (existingPending) {
        return NextResponse.json(
          { error: "There's already a pending payment request for this booking. Cancel it first." },
          { status: 400 }
        );
      }

      // Persist the desired new state as a PENDING modification (booking unchanged).
      const { data: modRow, error: modErr } = await supabase
        .from("booking_modifications")
        .insert({
          booking_id: bookingId,
          admin_actor: adminActor,
          modification_type: "add_days",
          direction: "charge",
          status: "pending",
          old_total_pence: booking.total_amount,
          new_total_pence: newTotalPence,
          delta_pence: delta,
          reason: reason || null,
          new_state: {
            club_id: booking.club_id,
            option_id: pricing.targetOption.id,
            num_children: booking.num_children,
            total_pence: newTotalPence,
            days,
            dates: newDates,
          },
        })
        .select()
        .single();
      if (modErr || !modRow) {
        // Race-proof one-open-request: the partial unique index raises 23505.
        if (modErr?.code === "23505") {
          return NextResponse.json(
            { error: "There's already a pending payment request for this booking. Cancel it first." },
            { status: 400 }
          );
        }
        console.error("edit-days: failed to create pending modification:", modErr);
        return NextResponse.json({ error: "Couldn't start the payment request." }, { status: 500 });
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      let session;
      try {
        session = await stripe.checkout.sessions.create(
          {
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: booking.parent_email,
            line_items: [
              {
                price_data: {
                  currency: "gbp",
                  product_data: { name: `Additional day(s) — booking ${booking.id.slice(0, 8).toUpperCase()}` },
                  unit_amount: delta,
                },
                quantity: 1,
              },
            ],
            metadata: { kind: "modification", modificationId: modRow.id, bookingId },
            // Bound the pay window so a stale link can't be paid much later.
            expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
            success_url: `${baseUrl}/?upcharge=success`,
            cancel_url: `${baseUrl}/?upcharge=cancelled`,
          },
          { idempotencyKey: `mod-session-${modRow.id}` }
        );
      } catch (e) {
        console.error("edit-days: failed to create Checkout session:", e);
        await supabase.from("booking_modifications").update({ status: "failed" }).eq("id", modRow.id);
        return NextResponse.json({ error: "Couldn't create the payment link." }, { status: 500 });
      }

      await supabase
        .from("booking_modifications")
        .update({ stripe_checkout_session_id: session.id })
        .eq("id", modRow.id);

      try {
        const { data: club } = await supabase.from("clubs").select("name").eq("id", booking.club_id).single();
        await sendModificationPaymentRequestEmail(booking as never, club?.name || "Holiday Club", delta, session.url || "");
      } catch (e) {
        console.error("Failed to send payment-request email:", e);
      }

      return NextResponse.json({
        upcharge: true,
        checkoutUrl: session.url,
        deltaPence: delta,
        modificationId: modRow.id,
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
    if (delta < 0 && stripe) {
      const rs = await getRefundState(booking.stripe_payment_intent_id);
      const want = -delta;
      const refundPence = Math.min(want, rs.ok ? rs.refundablePence ?? 0 : 0);
      if (!rs.ok || refundPence <= 0) {
        refundWarning = `Days updated, but the £${(want / 100).toFixed(2)} refund couldn't be issued automatically. Issue it from Cancel / Refund.`;
        if (modId) {
          await supabase
            .from("booking_modifications")
            .update({ direction: "none", reason: "Days updated; refund must be issued manually (Cancel / Refund)" })
            .eq("id", modId as string);
        }
      } else {
        try {
          const idempotencyKey = `editdays-refund-${bookingId}-${rs.alreadyRefundedPence}-${refundPence}`;
          const stripeRefund = await stripe.refunds.create(
            {
              payment_intent: booking.stripe_payment_intent_id as string,
              amount: refundPence,
              metadata: { bookingId, modificationId: (modId as string) ?? "", reason: "reduce_days" },
            },
            { idempotencyKey }
          );
          refundedPence = refundPence;
          const { error: ledgerError } = await supabase
            .from("bookings")
            .update({ amount_refunded_pence: (rs.alreadyRefundedPence ?? 0) + refundPence })
            .eq("id", bookingId);
          if (modId) {
            await supabase
              .from("booking_modifications")
              .update({ stripe_refund_id: stripeRefund.id, refund_amount_pence: refundPence })
              .eq("id", modId as string);
          }
          if (ledgerError) {
            console.error("edit-days: refund issued but ledger update failed:", ledgerError);
            refundWarning = `Refunded £${(refundPence / 100).toFixed(2)} (ref ${stripeRefund.id}), but the booking record didn't finish updating. It will reconcile from Stripe on the next refund action.`;
          } else if (refundPence < want) {
            refundWarning = `Refunded £${(refundPence / 100).toFixed(2)} (the remaining refundable amount); £${((want - refundPence) / 100).toFixed(2)} could not be refunded.`;
          }
        } catch (e) {
          console.error("edit-days refund failed after change:", e);
          refundWarning = `Days updated, but the £${(want / 100).toFixed(2)} refund failed. Issue it from Cancel / Refund.`;
          if (modId) {
            await supabase
              .from("booking_modifications")
              .update({ direction: "none", reason: "Days updated; refund failed — issue manually (Cancel / Refund)" })
              .eq("id", modId as string);
          }
        }
      }
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
