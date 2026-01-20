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
        className={`
          w-full p-6 rounded-2xl text-left transition-all
          ${
            isSelected
              ? "bg-forest text-white ring-2 ring-forest ring-offset-2"
              : "bg-white hover:shadow-[var(--shadow-lg)] shadow-[var(--shadow-md)]"
          }
        `}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h4
              className={`font-display text-lg font-bold ${
                isSelected ? "text-white" : "text-bark"
              }`}
            >
              {option.name}
            </h4>
            {option.description && (
              <p
                className={`mt-1 text-sm ${
                  isSelected ? "text-white/80" : "text-stone"
                }`}
              >
                {option.description}
              </p>
            )}
          </div>
          <div
            className={`font-display text-xl font-bold whitespace-nowrap ${
              isSelected ? "text-sunshine" : "text-forest"
            }`}
          >
            {priceLabel}
          </div>
        </div>
        {isSelected && (
          <div className="mt-4 flex items-center gap-2 text-sm text-white/90">
            <svg
              className="w-5 h-5 text-sunshine"
              fill="currentColor"
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
        <h3 className="font-display text-lg font-semibold text-bark">{title}</h3>
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
        <h2 className="font-display text-2xl font-bold text-bark">
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
