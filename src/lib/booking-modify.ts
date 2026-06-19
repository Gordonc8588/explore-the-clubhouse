import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { priceBooking } from "@/lib/pricing";

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
