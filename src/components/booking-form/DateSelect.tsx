"use client";

import { useState, useMemo } from "react";
import type { ClubDay } from "@/types/database";
import type { BookingFormData } from "./OptionSelect";

interface DateSelectProps {
  clubDays: ClubDay[];
  startDate: string;
  endDate: string;
  formData: BookingFormData;
  onNext: (data: Partial<BookingFormData>) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DateSelect({
  clubDays,
  startDate,
  endDate,
  formData,
  onNext,
}: DateSelectProps) {
  const [selectedDates, setSelectedDates] = useState<string[]>(
    formData.selectedDates
  );
  const [currentMonth, setCurrentMonth] = useState(() => {
    const start = new Date(startDate);
    return new Date(start.getFullYear(), start.getMonth(), 1);
  });

  const isMultiDay = formData.selectedOption?.option_type === "multi_day";
  const isSingleDay = formData.selectedOption?.option_type === "single_day";

  // Create a map of dates to club day data
  const clubDayMap = useMemo(() => {
    const map = new Map<string, ClubDay>();
    clubDays.forEach((day) => {
      map.set(day.date, day);
    });
    return map;
  }, [clubDays]);

  // Normalize dates to YYYY-MM-DD for comparison (avoid timezone issues)
  const clubStartDate = startDate;
  const clubEndDate = endDate;

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: (Date | null)[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      // Create date in UTC to avoid timezone shifting
      days.push(new Date(Date.UTC(year, month, day, 12, 0, 0)));
    }

    return days;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const canGoBack = useMemo(() => {
    const prevMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
    const lastDayPrevMonth = new Date(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
      0
    );
    const lastDayStr = lastDayPrevMonth.toISOString().split("T")[0];
    return lastDayStr >= clubStartDate;
  }, [currentMonth, clubStartDate]);

  const canGoForward = useMemo(() => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    const nextMonthStr = nextMonth.toISOString().split("T")[0];
    return nextMonthStr <= clubEndDate;
  }, [currentMonth, clubEndDate]);

  const goToPrevMonth = () => {
    if (canGoBack) {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      );
    }
  };

  const goToNextMonth = () => {
    if (canGoForward) {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      );
    }
  };

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const clubDay = clubDayMap.get(dateStr);

    if (!clubDay || !clubDay.is_available) return;

    if (isSingleDay) {
      // Single day: replace selection
      const newDates = [dateStr];
      setSelectedDates(newDates);
      onNext({ selectedDates: newDates });
    } else if (isMultiDay) {
      // Multi day: toggle selection
      const isSelected = selectedDates.includes(dateStr);
      const newDates = isSelected
        ? selectedDates.filter((d) => d !== dateStr)
        : [...selectedDates, dateStr];
      setSelectedDates(newDates);
      onNext({ selectedDates: newDates });
    }
  };

  const isDateInRange = (date: Date): boolean => {
    // Compare date strings to avoid timezone issues
    const dateStr = date.toISOString().split("T")[0];
    return dateStr >= clubStartDate && dateStr <= clubEndDate;
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const formatSelectedDates = () => {
    if (selectedDates.length === 0) return null;

    const sorted = [...selectedDates].sort();
    return sorted.map((dateStr) => {
      // Parse date as YYYY-MM-DD and format without timezone conversion
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      return date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });
    });
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
          {isSingleDay ? "Select Your Day" : "Select Your Days"}
        </h2>
        <p className="mt-1 text-stone">
          {isSingleDay
            ? "Choose the day you'd like to attend."
            : "Choose 2 or more days for your booking."}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={goToPrevMonth}
            disabled={!canGoBack}
            className="p-2 rounded-lg hover:bg-cloud disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous month"
          >
            <svg
              className="w-5 h-5 text-bark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h3
            className="text-xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            {monthLabel}
          </h3>

          <button
            type="button"
            onClick={goToNextMonth}
            disabled={!canGoForward}
            className="p-2 rounded-lg hover:bg-cloud disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next month"
          >
            <svg
              className="w-5 h-5 text-bark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-stone py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateKey = formatDateKey(date);
            const clubDay = clubDayMap.get(dateKey);
            const inRange = isDateInRange(date);
            const isSelected = selectedDates.includes(dateKey);
            const isClickable = inRange && clubDay?.is_available;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => isClickable && handleDayClick(date)}
                disabled={!isClickable}
                className={`
                  aspect-square p-1 rounded-lg flex items-center justify-center transition-all
                  ${
                    isClickable
                      ? "hover:bg-[rgba(122,124,74,0.1)] cursor-pointer"
                      : "cursor-default"
                  }
                  ${!inRange ? "opacity-30" : ""}
                  ${inRange && !clubDay?.is_available ? "opacity-50" : ""}
                `}
                style={
                  isSelected
                    ? {
                        backgroundColor: "var(--craigies-burnt-orange)",
                        color: "white",
                      }
                    : {}
                }
                aria-label={`${date.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}${isSelected ? " (selected)" : ""}`}
              >
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: isSelected
                      ? "white"
                      : "var(--craigies-dark-olive)",
                  }}
                >
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-cloud">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone">
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-lg"
                style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
              />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-cloud border border-pebble" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-cloud opacity-30" />
              <span>Unavailable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Days Summary */}
      {selectedDates.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: "var(--craigies-cream)" }}
        >
          <p
            className="font-semibold mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            {selectedDates.length} day{selectedDates.length !== 1 ? "s" : ""}{" "}
            selected
          </p>
          <div className="flex flex-wrap gap-2">
            {formatSelectedDates()?.map((dateLabel, idx) => (
              <span
                key={idx}
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "white",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {dateLabel}
              </span>
            ))}
          </div>
        </div>
      )}

      {isMultiDay && selectedDates.length < 2 && (
        <p className="text-sm text-coral">
          Please select at least 2 days for a multi-day booking.
        </p>
      )}
    </div>
  );
}
