"use client";

import { useState } from "react";
import type { Club } from "@/types/database";
import type { PromoCode } from "@/types/database";
import type { BookingFormData } from "./OptionSelect";
import { formatPrice } from "@/lib/mock-data";

interface ReviewStepProps {
  club: Club;
  formData: BookingFormData;
  promoCode: PromoCode | null;
  onProceedToPayment: () => void;
  isLoading?: boolean;
}

export function ReviewStep({
  club,
  formData,
  promoCode,
  onProceedToPayment,
  isLoading = false,
}: ReviewStepProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cancellationAccepted, setCancellationAccepted] = useState(false);

  const { selectedOption, selectedDates, parentName, parentEmail, parentPhone, childrenCount } =
    formData;

  // Calculate pricing
  const calculateSubtotal = (): number => {
    if (!selectedOption) return 0;

    if (selectedOption.option_type === "full_week") {
      return selectedOption.price_per_child * childrenCount;
    } else if (selectedOption.option_type === "single_day") {
      return selectedOption.price_per_child * childrenCount;
    } else {
      // multi_day: price per day * number of days * number of children
      return selectedOption.price_per_child * selectedDates.length * childrenCount;
    }
  };

  const subtotal = calculateSubtotal();
  const discountAmount = promoCode
    ? Math.round((subtotal * promoCode.discount_percent) / 100)
    : 0;
  const total = subtotal - discountAmount;

  // Format dates for display
  const formatDateRange = (): string => {
    if (selectedOption?.option_type === "full_week") {
      const startDate = new Date(club.start_date);
      const endDate = new Date(club.end_date);
      return `${startDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })} - ${endDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;
    }

    if (selectedDates.length === 0) return "No dates selected";

    const sortedDates = [...selectedDates].sort();
    if (sortedDates.length === 1) {
      const date = new Date(sortedDates[0]);
      return date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    return sortedDates
      .map((dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
      })
      .join(", ");
  };

  const getTimeSlotDisplay = (): string => {
    if (!selectedOption) return "";
    switch (selectedOption.time_slot) {
      case "full_day":
        return "Full Day (8:30am - 3:30pm)";
      case "morning":
        return "Morning (8:30am - 12:00pm)";
      case "afternoon":
        return "Afternoon (12:00pm - 3:30pm)";
      default:
        return "";
    }
  };

  const canProceed = termsAccepted && cancellationAccepted && !isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-bark">
          Review Your Booking
        </h2>
        <p className="mt-1 text-stone">
          Please check the details below before proceeding to payment.
        </p>
      </div>

      {/* Booking Summary Card */}
      <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] overflow-hidden">
        {/* Club Header */}
        <div className="bg-forest p-4">
          <h3 className="font-display text-xl font-bold text-white">
            {club.name}
          </h3>
          <p className="text-sage text-sm mt-1">
            Ages {club.min_age}-{club.max_age}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Booking Details */}
          <div className="space-y-4">
            {/* Option */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-stone">Booking Option</p>
                <p className="font-semibold text-bark">
                  {selectedOption?.name}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div>
              <p className="text-sm text-stone">Dates</p>
              <p className="font-semibold text-bark">{formatDateRange()}</p>
            </div>

            {/* Time Slot */}
            <div>
              <p className="text-sm text-stone">Time</p>
              <p className="font-semibold text-bark">{getTimeSlotDisplay()}</p>
            </div>

            {/* Number of Children */}
            <div>
              <p className="text-sm text-stone">Children</p>
              <p className="font-semibold text-bark">
                {childrenCount} {childrenCount === 1 ? "child" : "children"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-cloud" />

          {/* Parent Details */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-bark">
              Contact Details
            </h4>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-stone"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-bark">{parentName}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-stone"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-bark">{parentEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-stone"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-bark">{parentPhone}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-cloud" />

          {/* Price Breakdown */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-bark">
              Price Breakdown
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone">
                  {selectedOption?.name}
                  {selectedOption?.option_type === "multi_day" &&
                    ` (${selectedDates.length} days)`}
                  {childrenCount > 1 && ` × ${childrenCount} children`}
                </span>
                <span className="text-bark">{formatPrice(subtotal)}</span>
              </div>

              {promoCode && (
                <div className="flex justify-between text-forest">
                  <span>
                    Discount ({promoCode.code} - {promoCode.discount_percent}%)
                  </span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
            </div>

            <hr className="border-cloud" />

            <div className="flex justify-between items-center">
              <span className="font-display font-bold text-lg text-bark">
                Total
              </span>
              <span className="font-display font-bold text-2xl text-forest">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Agreements */}
      <div className="space-y-4">
        {/* Terms & Conditions */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className={`
                w-5 h-5 rounded border-2 transition-all
                ${
                  termsAccepted
                    ? "bg-forest border-forest"
                    : "bg-white border-stone group-hover:border-forest"
                }
              `}
            >
              {termsAccepted && (
                <svg
                  className="w-full h-full text-white p-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-bark">
            I agree to the{" "}
            <a
              href="/terms"
              className="text-forest underline hover:text-meadow"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms & Conditions
            </a>
          </span>
        </label>

        {/* Cancellation Policy */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={cancellationAccepted}
              onChange={(e) => setCancellationAccepted(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className={`
                w-5 h-5 rounded border-2 transition-all
                ${
                  cancellationAccepted
                    ? "bg-forest border-forest"
                    : "bg-white border-stone group-hover:border-forest"
                }
              `}
            >
              {cancellationAccepted && (
                <svg
                  className="w-full h-full text-white p-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-bark">
            I have read and accept the{" "}
            <a
              href="/cancellation-policy"
              className="text-forest underline hover:text-meadow"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cancellation Policy
            </a>
          </span>
        </label>
      </div>

      {/* Proceed to Payment Button */}
      <button
        type="button"
        onClick={onProceedToPayment}
        disabled={!canProceed}
        className={`
          w-full py-4 px-6 rounded-lg font-display font-bold text-lg
          transition-all
          ${
            canProceed
              ? "bg-sunshine text-bark hover:bg-amber"
              : "bg-cloud text-pebble cursor-not-allowed"
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          `Proceed to Payment - ${formatPrice(total)}`
        )}
      </button>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-xs text-stone">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>Secure payment powered by Stripe</span>
      </div>
    </div>
  );
}
