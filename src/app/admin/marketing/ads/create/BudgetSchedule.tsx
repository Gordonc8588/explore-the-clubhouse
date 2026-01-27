"use client";

import { useState } from "react";
import {
  PoundSterling,
  Calendar,
  Clock,
  Info,
  AlertTriangle,
} from "lucide-react";

export interface BudgetConfig {
  budgetType: "daily" | "lifetime";
  amount: number; // in pence
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

interface BudgetScheduleProps {
  value: BudgetConfig;
  onChange: (config: BudgetConfig) => void;
}

// Minimum budgets in pence
const MIN_DAILY_BUDGET = 500; // £5
const MIN_LIFETIME_BUDGET = 2000; // £20
const RECOMMENDED_DAILY = 1000; // £10

export function BudgetSchedule({ value, onChange }: BudgetScheduleProps) {
  const handleChange = (field: keyof BudgetConfig, val: string | number) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  // Format pence to pounds for display
  const formatPounds = (pence: number) => {
    return (pence / 100).toFixed(2);
  };

  // Parse pounds input to pence
  const parsePounds = (pounds: string) => {
    const num = parseFloat(pounds);
    return isNaN(num) ? 0 : Math.round(num * 100);
  };

  // Calculate campaign duration in days
  const getDurationDays = () => {
    if (!value.startDate || !value.endDate) return 0;
    const start = new Date(value.startDate);
    const end = new Date(value.endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Calculate total spend estimate
  const getTotalSpend = () => {
    if (value.budgetType === "lifetime") {
      return value.amount;
    }
    const days = getDurationDays();
    return days > 0 ? value.amount * days : value.amount;
  };

  const minBudget =
    value.budgetType === "daily" ? MIN_DAILY_BUDGET : MIN_LIFETIME_BUDGET;
  const isBudgetTooLow = value.amount < minBudget;
  const durationDays = getDurationDays();

  // Get tomorrow's date as min start date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minStartDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div
        className="flex items-start gap-2 rounded-lg px-3 py-2"
        style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
      >
        <Info
          className="mt-0.5 h-4 w-4 flex-shrink-0"
          style={{ color: "var(--craigies-olive)" }}
        />
        <p className="text-xs" style={{ color: "var(--craigies-dark-olive)" }}>
          Set your budget and schedule. Meta will optimise delivery to get the
          best results within your budget. You can pause or adjust at any time.
        </p>
      </div>

      {/* Budget Type */}
      <div>
        <label
          className="mb-2 block text-sm font-medium"
          style={{ color: "var(--craigies-dark-olive)" }}
        >
          <PoundSterling className="mr-1 inline h-4 w-4" />
          Budget Type
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleChange("budgetType", "daily")}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              value.budgetType === "daily"
                ? "border-[var(--craigies-olive)] bg-[rgba(122,124,74,0.05)]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <p
              className="font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Daily Budget
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Spend up to this amount each day
            </p>
          </button>
          <button
            type="button"
            onClick={() => handleChange("budgetType", "lifetime")}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              value.budgetType === "lifetime"
                ? "border-[var(--craigies-olive)] bg-[rgba(122,124,74,0.05)]"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <p
              className="font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Lifetime Budget
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Total amount to spend over the campaign
            </p>
          </button>
        </div>
      </div>

      {/* Budget Amount */}
      <div>
        <label
          htmlFor="budget-amount"
          className="mb-1 block text-sm font-medium"
          style={{ color: "var(--craigies-dark-olive)" }}
        >
          {value.budgetType === "daily" ? "Daily" : "Total"} Budget
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            £
          </span>
          <input
            id="budget-amount"
            type="number"
            min={minBudget / 100}
            step="0.01"
            value={formatPounds(value.amount)}
            onChange={(e) => handleChange("amount", parsePounds(e.target.value))}
            className={`w-full rounded-lg border px-8 py-2 text-lg font-semibold focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)] ${
              isBudgetTooLow ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
            style={{ color: "var(--craigies-dark-olive)" }}
          />
        </div>
        {isBudgetTooLow ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <AlertTriangle className="h-3 w-3" />
            Minimum {value.budgetType} budget is £{formatPounds(minBudget)}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">
            Recommended: £{formatPounds(RECOMMENDED_DAILY)}/day for best results
          </p>
        )}
      </div>

      {/* Schedule */}
      <div>
        <label
          className="mb-2 block text-sm font-medium"
          style={{ color: "var(--craigies-dark-olive)" }}
        >
          <Calendar className="mr-1 inline h-4 w-4" />
          Schedule
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="start-date"
              className="mb-1 block text-xs text-gray-500"
            >
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              min={minStartDate}
              value={value.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
            />
          </div>
          <div>
            <label
              htmlFor="end-date"
              className="mb-1 block text-xs text-gray-500"
            >
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              min={value.startDate || minStartDate}
              value={value.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
            />
          </div>
        </div>
      </div>

      {/* Time (optional) */}
      <div>
        <label
          className="mb-2 block text-sm font-medium"
          style={{ color: "var(--craigies-dark-olive)" }}
        >
          <Clock className="mr-1 inline h-4 w-4" />
          Time (Optional)
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="start-time"
              className="mb-1 block text-xs text-gray-500"
            >
              Start Time
            </label>
            <input
              id="start-time"
              type="time"
              value={value.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
            />
          </div>
          <div>
            <label
              htmlFor="end-time"
              className="mb-1 block text-xs text-gray-500"
            >
              End Time
            </label>
            <input
              id="end-time"
              type="time"
              value={value.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Leave blank to run ads all day
        </p>
      </div>

      {/* Campaign Summary */}
      {value.startDate && value.endDate && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--craigies-dark-olive)" }}
          >
            Campaign Summary
          </p>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                {durationDays} day{durationDays !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {value.budgetType === "daily" ? "Daily" : "Total"} Budget
              </p>
              <p className="font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                £{formatPounds(value.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Estimated Total Spend</p>
              <p className="font-semibold" style={{ color: "var(--craigies-burnt-orange)" }}>
                £{formatPounds(getTotalSpend())}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
