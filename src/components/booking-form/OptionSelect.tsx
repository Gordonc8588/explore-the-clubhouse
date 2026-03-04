"use client";

import type { BookingOption } from "@/types/database";
import { formatPrice } from "@/lib/mock-data";

export interface BookingFormData {
  selectedOption: BookingOption | null;
  selectedDates: string[];
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childrenCount: number;
}

interface OptionSelectProps {
  options: BookingOption[];
  formData: BookingFormData;
  onNext: (data: Partial<BookingFormData>) => void;
  fullWeekAvailable: boolean;
}

export function OptionSelect({ options, formData, onNext, fullWeekAvailable }: OptionSelectProps) {
  const handleSelect = (option: BookingOption, event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent scroll jump on mobile when state updates
    event.currentTarget.blur();
    onNext({ selectedOption: option });
  };

  const selectedId = formData.selectedOption?.id;

  // Group options by type for better organization
  const fullWeekOptions = options.filter((o) => o.option_type === "full_week");
  const singleDayOptions = options.filter((o) => o.option_type === "single_day");
  const multiDayOptions = options.filter((o) => o.option_type === "multi_day");

  const renderOptionCard = (option: BookingOption, disabled = false) => {
    const isSelected = !disabled && selectedId === option.id;
    const priceLabel =
      option.option_type === "multi_day"
        ? `${formatPrice(option.price_per_child)}/day`
        : formatPrice(option.price_per_child);

    return (
      <button
        key={option.id}
        type="button"
        onClick={(e) => !disabled && handleSelect(option, e)}
        disabled={disabled}
        className={`w-full p-6 rounded-2xl text-left transition-all shadow-md ${
          disabled
            ? "opacity-60 cursor-not-allowed bg-gray-50"
            : "bg-white hover:shadow-lg"
        }`}
        style={
          isSelected
            ? {
                backgroundColor: "var(--craigies-burnt-orange)",
                color: "white",
                outline: "2px solid var(--craigies-burnt-orange)",
                outlineOffset: "2px",
              }
            : {}
        }
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4
                className="text-lg font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: disabled ? "#9CA3AF" : isSelected ? "white" : "var(--craigies-dark-olive)",
                }}
              >
                {option.name}
              </h4>
              {disabled && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                  Fully Booked
                </span>
              )}
            </div>
            {option.description && (
              <p
                className="mt-1 text-sm"
                style={{
                  color: disabled ? "#9CA3AF" : isSelected ? "rgba(255, 255, 255, 0.8)" : "#6B7280",
                }}
              >
                {option.description}
              </p>
            )}
          </div>
          <div
            className="text-xl font-bold whitespace-nowrap"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: disabled ? "#9CA3AF" : isSelected
                ? "white"
                : "var(--craigies-burnt-orange)",
            }}
          >
            {priceLabel}
          </div>
        </div>
        {isSelected && (
          <div className="mt-4 flex items-center gap-2 text-sm text-white/90">
            <svg
              className="w-5 h-5"
              fill="white"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Selected
          </div>
        )}
      </button>
    );
  };

  const renderOptionGroup = (title: string, groupOptions: BookingOption[], disabled = false) => {
    if (groupOptions.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3
          className="text-lg font-semibold"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--craigies-dark-olive)",
          }}
        >
          {title}
        </h3>
        <div className="grid gap-3">
          {groupOptions
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((option) => renderOptionCard(option, disabled))}
        </div>
        {disabled && (
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Some days are fully booked. Individual days may still be available below.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--craigies-dark-olive)",
          }}
        >
          Choose Your Booking Option
        </h2>
        <p className="mt-1 text-stone">
          Select the option that best fits your schedule. Price is per child.
        </p>
      </div>

      <div className="space-y-6">
        {renderOptionGroup("Full Week", fullWeekOptions, !fullWeekAvailable)}
        {renderOptionGroup("Single Day", singleDayOptions)}
        {renderOptionGroup("Multiple Days", multiDayOptions)}
      </div>
    </div>
  );
}
