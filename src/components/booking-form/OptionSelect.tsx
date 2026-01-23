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
}

export function OptionSelect({ options, formData, onNext }: OptionSelectProps) {
  const handleSelect = (option: BookingOption) => {
    onNext({ selectedOption: option });
  };

  const selectedId = formData.selectedOption?.id;

  // Group options by type for better organization
  const fullWeekOptions = options.filter((o) => o.option_type === "full_week");
  const singleDayOptions = options.filter((o) => o.option_type === "single_day");
  const multiDayOptions = options.filter((o) => o.option_type === "multi_day");

  const renderOptionCard = (option: BookingOption) => {
    const isSelected = selectedId === option.id;
    const priceLabel =
      option.option_type === "multi_day"
        ? `${formatPrice(option.price_per_child)}/day`
        : formatPrice(option.price_per_child);

    return (
      <button
        key={option.id}
        type="button"
        onClick={() => handleSelect(option)}
        className="w-full p-6 rounded-2xl text-left transition-all bg-white hover:shadow-lg shadow-md"
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
            <h4
              className="text-lg font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: isSelected ? "white" : "var(--craigies-dark-olive)",
              }}
            >
              {option.name}
            </h4>
            {option.description && (
              <p
                className="mt-1 text-sm"
                style={{
                  color: isSelected ? "rgba(255, 255, 255, 0.8)" : "#6B7280",
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
              color: isSelected
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

  const renderOptionGroup = (title: string, groupOptions: BookingOption[]) => {
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
            .map(renderOptionCard)}
        </div>
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
        {renderOptionGroup("Full Week", fullWeekOptions)}
        {renderOptionGroup("Single Day", singleDayOptions)}
        {renderOptionGroup("Multiple Days", multiDayOptions)}
      </div>
    </div>
  );
}
