import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { priceBooking } from "@/lib/pricing";
import { sendModificationPaymentRequestEmail } from "@/lib/email";

/**
 * Shared mechanics for admin booking modifications (refunds + repricing).
 * Keeps the money math and the Stripe refundable-ceiling logic in one place so
 * the cancel/refund and reschedule routes can never diverge.
 */

export interface RefundState {
  ok: boolean;
  error?: string;
  paymentStatus?: string;
  capturedPence?: number;
  alreadyRefundedPence?: number;
  refundablePence?: number;
}

/**
 * Resolve the live refundable ceiling for a payment intent.
 * ceiling = amount_captured - amount_refunded (never the charge.refunded boolean,
 * which is only true after a FULL refund).
 */
export async function getRefundState(paymentIntentId: string | null): Promise<RefundState> {
  if (!stripe) return { ok: false, error: "Stripe is not configured" };
  if (!paymentIntentId) return { ok: false, error: "This booking has no payment to refund" };

  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (pi.status !== "succeeded") {
    return { ok: false, error: `Payment cannot be refunded — status is "${pi.status}"`, paymentStatus: pi.status };
  }
  if (!pi.latest_charge) {
    return { ok: false, error: "No charge found on this payment" };
  }
  const charge = await stripe.charges.retrieve(pi.latest_charge as string);
  const capturedPence = charge.amount_captured;
  const alreadyRefundedPence = charge.amount_refunded;
  return {
    ok: true,
    paymentStatus: pi.status,
    capturedPence,
    alreadyRefundedPence,
    refundablePence: capturedPence - alreadyRefundedPence,
  };
}

export interface ReschedulePricing {
  error?: string;
  booking?: Record<string, unknown> & {
    id: string;
    club_id: string;
    num_children: number;
    total_amount: number;
    discount_percent_applied: number;
    stripe_payment_intent_id: string | null;
    parent_email: string;
    parent_name: string;
    booking_options: { option_type: string; time_slot: string; name: string } | null;
  };
  targetOption?: { id: string; option_type: string; time_slot: string; name: string; price_per_child: number };
  oldTotalPence?: number;
  newTotalPence?: number;
  deltaPence?: number;
}

/**
 * Re-price a booking as if it moved to `newClubId` with `dayCount` days, keeping
 * the same option type/slot and the discount rate the customer actually paid.
 * Authoritative: both the preview and the apply path call this.
 */
export async function computeReschedulePricing(
  supabase: SupabaseClient,
  bookingId: string,
  newClubId: string,
  dayCount: number
): Promise<ReschedulePricing> {
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, booking_options(*)")
    .eq("id", bookingId)
    .single();
  if (error || !booking) return { error: "Booking not found" };

  const currentOption = booking.booking_options;
  if (!currentOption) return { error: "Booking has no pricing option" };

  // The target week must offer the same KIND of option (type + slot).
  const { data: targetOption, error: optError } = await supabase
    .from("booking_options")
    .select("*")
    .eq("club_id", newClubId)
    .eq("option_type", currentOption.option_type)
    .eq("time_slot", currentOption.time_slot)
    .eq("is_active", true)
    .maybeSingle();
  if (optError) {
    // PGRST116 = more than one row matched (duplicate active options for the week).
    if (optError.code === "PGRST116") {
      return { error: "This week has more than one matching pricing option — fix the duplicate before rescheduling." };
    }
    return { error: "Couldn't look up the selected week's pricing." };
  }
  if (!targetOption) {
    return { error: "The selected week doesn't offer the same booking type, so it can't be rescheduled there." };
  }

  const newTotalPence = priceBooking({
    optionType: targetOption.option_type,
    pricePerChild: targetOption.price_per_child,
    dayCount,
    numChildren: booking.num_children,
    discountPercent: booking.discount_percent_applied || 0,
  }).totalPence;

  return {
    booking,
    targetOption,
    oldTotalPence: booking.total_amount,
    newTotalPence,
    deltaPence: newTotalPence - booking.total_amount,
  };
}

export interface EditPricing extends ReschedulePricing {
  dayCount?: number;
}

/**
 * Re-price a booking for a NEW set of days WITHIN ITS CURRENT WEEK (add/remove),
 * choosing the cheapest valid option for the new day count. This encodes the two
 * owner-ratified rules:
 *  - drop below a full week → the bundle discount is lost (priced per day), and
 *  - adding days that reach the full week → auto-bundle to the cheaper Full Week.
 * It always picks the lowest-cost valid option, so the customer is never overcharged.
 */
export async function computeEditPricing(
  supabase: SupabaseClient,
  bookingId: string,
  clubDayIds: string[]
): Promise<EditPricing> {
  const dayCount = clubDayIds.length;
  if (dayCount < 1) return { error: "At least one day is required." };

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, booking_options(*)")
    .eq("id", bookingId)
    .single();
  if (error || !booking) return { error: "Booking not found" };

  const currentOption = booking.booking_options;
  if (!currentOption) return { error: "Booking has no pricing option" };

  // How many days make up a "full week" for this club.
  const { count: fullWeekDayCount } = await supabase
    .from("club_days")
    .select("id", { count: "exact", head: true })
    .eq("club_id", booking.club_id);

  // Candidate options of the same time slot, valid for this day count.
  const { data: options } = await supabase
    .from("booking_options")
    .select("*")
    .eq("club_id", booking.club_id)
    .eq("time_slot", currentOption.time_slot)
    .eq("is_active", true);

  type OptionRow = { id: string; option_type: string; time_slot: string; name: string; price_per_child: number };
  const candidates = ((options || []) as OptionRow[])
    .filter(
      (o) =>
        (o.option_type === "single_day" && dayCount === 1) ||
        o.option_type === "multi_day" ||
        (o.option_type === "full_week" && fullWeekDayCount != null && dayCount === fullWeekDayCount)
    )
    .map((o) => ({
      option: o,
      total: priceBooking({
        optionType: o.option_type as "full_week" | "single_day" | "multi_day",
        pricePerChild: o.price_per_child,
        dayCount,
        numChildren: booking.num_children,
        discountPercent: booking.discount_percent_applied || 0,
      }).totalPence,
    }));

  if (candidates.length === 0) {
    return {
      error:
        dayCount > 1
          ? "This week has no per-day (Multi-Day) price for this booking's time slot, so days can't be removed here. Add a Multi-Day option for the week first."
          : "No pricing option matches that number of days for this week.",
    };
  }
  candidates.sort((a, b) => a.total - b.total); // cheapest valid option wins
  const chosen = candidates[0];

  return {
    booking,
    targetOption: chosen.option,
    oldTotalPence: booking.total_amount,
    newTotalPence: chosen.total,
    deltaPence: chosen.total - booking.total_amount,
    dayCount,
  };
}

export interface UnifiedPricing extends EditPricing {
  proposedNumChildren?: number;
}

/**
 * Re-price a booking for a FULL proposed new state — any target week, any day set,
 * any number of children — choosing the cheapest valid option for the resulting day
 * count (the same full-week ⇄ per-day rules as computeEditPricing, generalised to a
 * target club + a proposed child count). The single source of truth the unified
 * "Edit booking" editor previews and applies against. Pure composition of
 * priceBooking — no new money math.
 */
export async function computeUnifiedPricing(
  supabase: SupabaseClient,
  bookingId: string,
  opts: { newClubId?: string | null; clubDayIds: string[]; numChildren?: number | null }
): Promise<UnifiedPricing> {
  const dayCount = opts.clubDayIds.length;
  if (dayCount < 1) return { error: "At least one day is required." };

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, booking_options(*)")
    .eq("id", bookingId)
    .single();
  if (error || !booking) return { error: "Booking not found" };

  const currentOption = booking.booking_options;
  if (!currentOption) return { error: "Booking has no pricing option" };

  const clubId = opts.newClubId || booking.club_id;
  const numChildren = opts.numChildren ?? booking.num_children;
  if (!Number.isInteger(numChildren) || numChildren < 1) {
    return { error: "Number of children must be a whole number of at least 1." };
  }

  // How many days make up a "full week" for the TARGET club.
  const { count: fullWeekDayCount } = await supabase
    .from("club_days")
    .select("id", { count: "exact", head: true })
    .eq("club_id", clubId);

  // Candidate options of the same time slot, valid for this day count, in the TARGET club.
  const { data: options } = await supabase
    .from("booking_options")
    .select("*")
    .eq("club_id", clubId)
    .eq("time_slot", currentOption.time_slot)
    .eq("is_active", true);

  type OptionRow = { id: string; option_type: string; time_slot: string; name: string; price_per_child: number };
  const candidates = ((options || []) as OptionRow[])
    .filter(
      (o) =>
        (o.option_type === "single_day" && dayCount === 1) ||
        o.option_type === "multi_day" ||
        (o.option_type === "full_week" && fullWeekDayCount != null && dayCount === fullWeekDayCount)
    )
    .map((o) => ({
      option: o,
      total: priceBooking({
        optionType: o.option_type as "full_week" | "single_day" | "multi_day",
        pricePerChild: o.price_per_child,
        dayCount,
        numChildren,
        discountPercent: booking.discount_percent_applied || 0,
      }).totalPence,
    }));

  if (candidates.length === 0) {
    return {
      error:
        dayCount > 1
          ? "That week has no per-day (Multi-Day) price for this booking's time slot, so it can't be priced for that number of days. Add a Multi-Day option for the week first."
          : "No pricing option matches that number of days for that week.",
    };
  }
  candidates.sort((a, b) => a.total - b.total); // cheapest valid option wins
  const chosen = candidates[0];

  return {
    booking,
    targetOption: chosen.option,
    oldTotalPence: booking.total_amount,
    newTotalPence: chosen.total,
    deltaPence: chosen.total - booking.total_amount,
    dayCount,
    proposedNumChildren: numChildren,
  };
}

/**
 * Issue the refund owed AFTER a modification has already been applied to the DB
 * (the DB-first ordering: a failed refund leaves a consistent, cheaper booking to
 * retry). Caps at the live Stripe ceiling, uses a deterministic idempotency key, and
 * records the refund id + amount on the audit row. Returns the amount actually
 * refunded plus a human warning when it couldn't refund the full ask (the caller
 * surfaces the warning; it never throws). `subject` is the leading clause of the
 * warning ("Days updated" / "Booking moved" / "Change applied").
 *
 * This is the canonical post-modification refund path; the new unified editor uses
 * it. (edit-days / reschedule predate it and keep their own equivalent inline blocks.)
 */
export async function issueRefundAfterModification(
  supabase: SupabaseClient,
  opts: {
    bookingId: string;
    paymentIntentId: string | null;
    modId: string | null;
    wantPence: number;
    keyPrefix: string;
    reason: string;
    subject: string;
  }
): Promise<{ refundedPence: number; warning: string | null }> {
  const { bookingId, paymentIntentId, modId, wantPence, keyPrefix, reason, subject } = opts;
  if (!stripe || wantPence <= 0) return { refundedPence: 0, warning: null };

  const rs = await getRefundState(paymentIntentId);
  const ceiling = rs.ok ? rs.refundablePence ?? 0 : 0;
  const refundPence = Math.min(wantPence, ceiling);

  if (!rs.ok || refundPence <= 0) {
    if (modId) {
      await supabase
        .from("booking_modifications")
        .update({ direction: "none", reason: `${reason}; refund must be issued manually (Cancel / Refund)` })
        .eq("id", modId);
    }
    return {
      refundedPence: 0,
      warning: `${subject}, but the £${(wantPence / 100).toFixed(2)} refund couldn't be issued automatically. Issue it from Cancel / Refund.`,
    };
  }

  try {
    const idempotencyKey = `${keyPrefix}-${bookingId}-${rs.alreadyRefundedPence}-${refundPence}`;
    const stripeRefund = await stripe.refunds.create(
      {
        payment_intent: paymentIntentId as string,
        amount: refundPence,
        metadata: { bookingId, modificationId: modId ?? "", reason },
      },
      { idempotencyKey }
    );

    const { error: ledgerError } = await supabase
      .from("bookings")
      .update({ amount_refunded_pence: (rs.alreadyRefundedPence ?? 0) + refundPence })
      .eq("id", bookingId);
    if (modId) {
      await supabase
        .from("booking_modifications")
        .update({ stripe_refund_id: stripeRefund.id, refund_amount_pence: refundPence })
        .eq("id", modId);
    }

    if (ledgerError) {
      console.error(`${keyPrefix}: refund issued but ledger update failed:`, ledgerError);
      return {
        refundedPence: refundPence,
        warning: `Refunded £${(refundPence / 100).toFixed(2)} (ref ${stripeRefund.id}), but the booking record didn't finish updating. It will reconcile from Stripe on the next refund action.`,
      };
    }
    if (refundPence < wantPence) {
      return {
        refundedPence: refundPence,
        warning: `Refunded £${(refundPence / 100).toFixed(2)} (the remaining refundable amount); £${((wantPence - refundPence) / 100).toFixed(2)} could not be refunded.`,
      };
    }
    return { refundedPence: refundPence, warning: null };
  } catch (e) {
    console.error(`${keyPrefix} refund failed after change:`, e);
    if (modId) {
      await supabase
        .from("booking_modifications")
        .update({ direction: "none", reason: `${reason}; refund failed — issue manually (Cancel / Refund)` })
        .eq("id", modId);
    }
    return {
      refundedPence: 0,
      warning: `${subject}, but the £${(wantPence / 100).toFixed(2)} refund failed. Issue it from Cancel / Refund.`,
    };
  }
}

/**
 * Stage a price-INCREASE as a deferred upcharge: persist the proposed new state as a
 * PENDING modification (booking unchanged), create a hosted Stripe Checkout link for
 * the difference, and email the parent. The webhook applies the change atomically once
 * paid. Enforces one open charge request per booking (race-proof via the partial
 * unique index → 23505). The proven payment-link flow, shared so the unified editor
 * reuses it instead of duplicating it.
 *
 * NOTE: the webhook re-prices a pending request against the booking's CURRENT week +
 * child count (computeEditPricing), so callers must only stage upcharges where the
 * new_state keeps the same club_id and num_children (same-week day additions).
 */
export async function createUpchargeRequest(
  supabase: SupabaseClient,
  opts: {
    booking: Record<string, unknown> & { id: string; club_id: string; parent_email: string; total_amount: number };
    targetOptionId: string;
    clubId: string;
    numChildren: number;
    newTotalPence: number;
    deltaPence: number;
    days: { club_day_id: string; time_slot: string }[];
    newDates: string[];
    reason: string | null;
    adminActor: string;
  }
): Promise<{ ok: true; checkoutUrl: string | null; modificationId: string } | { ok: false; status: number; error: string }> {
  if (!stripe) return { ok: false, status: 500, error: "Stripe is not configured" };
  const { booking, targetOptionId, clubId, numChildren, newTotalPence, deltaPence, days, newDates, reason, adminActor } = opts;

  // Best-effort capacity pre-check on the newly-added days so the admin gets immediate
  // feedback instead of charging-then-refunding (the webhook re-checks authoritatively
  // at pay time). Days the booking already holds are skipped.
  const { data: heldDays } = await supabase
    .from("booking_days")
    .select("club_day_id")
    .eq("booking_id", booking.id);
  const heldSet = new Set((heldDays || []).map((d) => d.club_day_id));
  const commonSlot = days[0]?.time_slot;
  for (const d of days) {
    if (heldSet.has(d.club_day_id)) continue;
    const { data: avail } = await supabase.rpc("get_club_day_availability", { day_id: d.club_day_id });
    const a = avail?.[0];
    if (a) {
      const remaining =
        commonSlot === "afternoon"
          ? a.afternoon_capacity - a.afternoon_booked
          : commonSlot === "morning"
            ? a.morning_capacity - a.morning_booked
            : Math.min(a.morning_capacity - a.morning_booked, a.afternoon_capacity - a.afternoon_booked);
      if (remaining < numChildren) {
        return { ok: false, status: 400, error: "One of the new days doesn't have enough space." };
      }
    }
  }

  // Only one open payment request per booking — otherwise two links could both be
  // paid (double charge).
  const { data: existingPending } = await supabase
    .from("booking_modifications")
    .select("id")
    .eq("booking_id", booking.id)
    .eq("status", "pending")
    .eq("direction", "charge")
    .limit(1)
    .maybeSingle();
  if (existingPending) {
    return { ok: false, status: 400, error: "There's already a pending payment request for this booking. Cancel it first." };
  }

  const { data: modRow, error: modErr } = await supabase
    .from("booking_modifications")
    .insert({
      booking_id: booking.id,
      admin_actor: adminActor,
      modification_type: "add_days",
      direction: "charge",
      status: "pending",
      old_total_pence: booking.total_amount,
      new_total_pence: newTotalPence,
      delta_pence: deltaPence,
      reason: reason || null,
      new_state: {
        club_id: clubId,
        option_id: targetOptionId,
        num_children: numChildren,
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
      return { ok: false, status: 400, error: "There's already a pending payment request for this booking. Cancel it first." };
    }
    console.error("createUpchargeRequest: failed to create pending modification:", modErr);
    return { ok: false, status: 500, error: "Couldn't start the payment request." };
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
              unit_amount: deltaPence,
            },
            quantity: 1,
          },
        ],
        metadata: { kind: "modification", modificationId: modRow.id, bookingId: booking.id },
        expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        success_url: `${baseUrl}/?upcharge=success`,
        cancel_url: `${baseUrl}/?upcharge=cancelled`,
      },
      { idempotencyKey: `mod-session-${modRow.id}` }
    );
  } catch (e) {
    console.error("createUpchargeRequest: failed to create Checkout session:", e);
    await supabase.from("booking_modifications").update({ status: "failed" }).eq("id", modRow.id);
    return { ok: false, status: 500, error: "Couldn't create the payment link." };
  }

  await supabase
    .from("booking_modifications")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", modRow.id);

  try {
    const { data: club } = await supabase.from("clubs").select("name").eq("id", clubId).single();
    await sendModificationPaymentRequestEmail(booking as never, club?.name || "Holiday Club", deltaPence, session.url || "");
  } catch (e) {
    console.error("createUpchargeRequest: failed to send payment-request email:", e);
  }

  return { ok: true, checkoutUrl: session.url, modificationId: modRow.id };
}
