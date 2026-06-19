import type { OptionType } from "@/types/database";

/**
 * Canonical booking price calculation — the SINGLE source of truth.
 *
 * Both the public checkout (src/app/api/checkout/route.ts) and the booking
 * form's live total (src/app/book/[clubSlug]/BookingForm.tsx) MUST route
 * through this function, as must every admin booking-modification flow, so
 * that refund/charge deltas can never diverge from what was originally charged.
 *
 * All money is in PENCE (integers). Pure — no Supabase / Stripe / IO.
 *
 * Pricing rules (mirrors the historic checkout formula exactly):
 *  - full_week  : a flat bundle price, INDEPENDENT of how many days are attended
 *  - single_day : flat (one day)
 *  - multi_day  : price_per_child × dayCount
 *  ...all multiplied by numChildren, then a whole-subtotal percentage discount
 *  rounded with Math.round.
 */
export interface PriceBookingInput {
  optionType: OptionType;
  /** Per-child price for the option, in pence. */
  pricePerChild: number;
  /** Number of attended days (only used for multi_day). */
  dayCount: number;
  numChildren: number;
  /** Promo discount as a whole percent (0–100). Defaults to 0. */
  discountPercent?: number;
}

export interface PriceBookingResult {
  subtotalPence: number;
  discountAmountPence: number;
  totalPence: number;
}

export function priceBooking({
  optionType,
  pricePerChild,
  dayCount,
  numChildren,
  discountPercent = 0,
}: PriceBookingInput): PriceBookingResult {
  let subtotalPence: number;
  if (optionType === "full_week" || optionType === "single_day") {
    // Flat price — day-count independent.
    subtotalPence = pricePerChild * numChildren;
  } else {
    // multi_day — priced per attended day.
    subtotalPence = pricePerChild * dayCount * numChildren;
  }

  const discountAmountPence = Math.round((subtotalPence * discountPercent) / 100);
  const totalPence = subtotalPence - discountAmountPence;

  return { subtotalPence, discountAmountPence, totalPence };
}
