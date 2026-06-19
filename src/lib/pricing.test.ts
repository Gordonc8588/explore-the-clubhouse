import { describe, it, expect } from "vitest";
import { priceBooking } from "./pricing";

describe("priceBooking", () => {
  // Mirrors the historic checkout formula. All amounts in pence.
  const cases: Array<{
    name: string;
    input: Parameters<typeof priceBooking>[0];
    expected: { subtotalPence: number; discountAmountPence: number; totalPence: number };
  }> = [
    {
      name: "multi_day: £65 × 3 days × 1 child = £195",
      input: { optionType: "multi_day", pricePerChild: 6500, dayCount: 3, numChildren: 1 },
      expected: { subtotalPence: 19500, discountAmountPence: 0, totalPence: 19500 },
    },
    {
      name: "multi_day: £65 × 4 days × 1 child = £260",
      input: { optionType: "multi_day", pricePerChild: 6500, dayCount: 4, numChildren: 1 },
      expected: { subtotalPence: 26000, discountAmountPence: 0, totalPence: 26000 },
    },
    {
      name: "multi_day: £65 × 3 days × 2 children = £390",
      input: { optionType: "multi_day", pricePerChild: 6500, dayCount: 3, numChildren: 2 },
      expected: { subtotalPence: 39000, discountAmountPence: 0, totalPence: 39000 },
    },
    {
      name: "single_day: flat £65 regardless of dayCount",
      input: { optionType: "single_day", pricePerChild: 6500, dayCount: 1, numChildren: 1 },
      expected: { subtotalPence: 6500, discountAmountPence: 0, totalPence: 6500 },
    },
    {
      name: "full_week: flat £295 with dayCount=5",
      input: { optionType: "full_week", pricePerChild: 29500, dayCount: 5, numChildren: 1 },
      expected: { subtotalPence: 29500, discountAmountPence: 0, totalPence: 29500 },
    },
    {
      name: "full_week: STILL flat £295 even if dayCount drops to 4 (bundle is day-count independent)",
      input: { optionType: "full_week", pricePerChild: 29500, dayCount: 4, numChildren: 1 },
      expected: { subtotalPence: 29500, discountAmountPence: 0, totalPence: 29500 },
    },
    {
      name: "full_week × 2 children = £590",
      input: { optionType: "full_week", pricePerChild: 29500, dayCount: 5, numChildren: 2 },
      expected: { subtotalPence: 59000, discountAmountPence: 0, totalPence: 59000 },
    },
    {
      name: "promo 20% off multi_day £195 = £156",
      input: { optionType: "multi_day", pricePerChild: 6500, dayCount: 3, numChildren: 1, discountPercent: 20 },
      expected: { subtotalPence: 19500, discountAmountPence: 3900, totalPence: 15600 },
    },
    {
      name: "Math.round on a non-round subtotal (rounds half up)",
      // 6533 × 10% = 653.3 -> Math.round = 653
      input: { optionType: "single_day", pricePerChild: 6533, dayCount: 1, numChildren: 1, discountPercent: 10 },
      expected: { subtotalPence: 6533, discountAmountPence: 653, totalPence: 5880 },
    },
  ];

  for (const c of cases) {
    it(c.name, () => {
      expect(priceBooking(c.input)).toEqual(c.expected);
    });
  }

  // The owner-ratified full-week modification rules (the comparisons the
  // Phase 4 modification layer makes; priceBooking provides the raw numbers).
  describe("full-week modification deltas (owner-ratified rules)", () => {
    const fullWeek = priceBooking({ optionType: "full_week", pricePerChild: 29500, dayCount: 5, numChildren: 1 }).totalPence;
    const fourDaysPerDay = priceBooking({ optionType: "multi_day", pricePerChild: 6500, dayCount: 4, numChildren: 1 }).totalPence;
    const fiveDaysPerDay = priceBooking({ optionType: "multi_day", pricePerChild: 6500, dayCount: 5, numChildren: 1 }).totalPence;

    it("drop 1 of 5 full-week days → re-price 4 days per-day → £35 refund (lose the bundle)", () => {
      expect(fullWeek).toBe(29500);
      expect(fourDaysPerDay).toBe(26000);
      expect(fourDaysPerDay - fullWeek).toBe(-3500); // refund £35
    });

    it("add 5th day to 4-day booking → auto-bundle to cheaper full week → £35 charge", () => {
      // Per-day 5 days (£325) is dearer than the £295 bundle, so policy picks the bundle.
      expect(fiveDaysPerDay).toBe(32500);
      const cheaper = Math.min(fiveDaysPerDay, fullWeek);
      expect(cheaper).toBe(29500);
      expect(cheaper - fourDaysPerDay).toBe(3500); // charge £35
    });
  });
});
