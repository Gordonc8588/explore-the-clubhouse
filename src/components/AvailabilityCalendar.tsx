"use client";

import { useState, useMemo } from "react";

export interface ClubDayWithAvailability {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  morning_capacity: number;
  afternoon_capacity: number;
  morning_booked: number;
  afternoon_booked: number;
  is_available: boolean;
}

interface AvailabilityCalendarProps {
  clubDays: ClubDayWithAvailability[];
  startDate: string; // Club start date
  endDate: string; // Club end date
  selectedDates?: string[]; // Array of selected date strings
  onDateSelect?: (date: string) => void;
  onDateDeselect?: (date: string) => void;
}

type AvailabilityStatus = "available" | "low" | "full";

function getAvailabilityStatus(
  capacity: number,
  booked: number
): AvailabilityStatus {
  const remaining = capacity - booked;
  const percentRemaining = capacity > 0 ? remaining / capacity : 0;

  if (remaining <= 0) return "full";
  if (percentRemaining <= 0.25) return "low";
  return "available";
}

function getStatusColor(status: AvailabilityStatus): string {
  switch (status) {
    case "available":
      return "bg-success";
    case "low":
      return "bg-warning";
    case "full":
      return "bg-error";
  }
}

function getStatusLabel(status: AvailabilityStatus): string {
  switch (status) {
    case "available":
      return "Available";
    case "low":
      return "Low";
    case "full":
      return "Full";
  }
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AvailabilityCalendar({
  clubDays,
  startDate,
  endDate,
  selectedDates = [],
  onDateSelect,
  onDateDeselect,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const start = new Date(startDate);
    return new Date(start.getFullYear(), start.getMonth(), 1);
  });

  // Create a map of dates to club day data for quick lookup
  const clubDayMap = useMemo(() => {
    const map = new Map<string, ClubDayWithAvailability>();
    clubDays.forEach((day) => {
      map.set(day.date, day);
    });
    return map;
  }, [clubDays]);

  const clubStartDate = new Date(startDate);
  const clubEndDate = new Date(endDate);

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Get the day of the week for the first day (0 = Sunday, adjust to Monday = 0)
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push(new Date(year, month, day));
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
    return lastDayPrevMonth >= clubStartDate;
  }, [currentMonth, clubStartDate]);

  const canGoForward = useMemo(() => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    return nextMonth <= clubEndDate;
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

    const isSelected = selectedDates.includes(dateStr);

    if (isSelected) {
      onDateDeselect?.(dateStr);
    } else {
      onDateSelect?.(dateStr);
    }
  };

  const isDateInRange = (date: Date): boolean => {
    return date >= clubStartDate && date <= clubEndDate;
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
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

        <h3 className="font-display text-xl font-bold text-bark">
          {monthLabel}
        </h3>

        <button
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

      {/* Weekday headers */}
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

      {/* Calendar grid */}
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

          const morningStatus = clubDay
            ? getAvailabilityStatus(
                clubDay.morning_capacity,
                clubDay.morning_booked
              )
            : null;
          const afternoonStatus = clubDay
            ? getAvailabilityStatus(
                clubDay.afternoon_capacity,
                clubDay.afternoon_booked
              )
            : null;

          return (
            <button
              key={dateKey}
              onClick={() => isClickable && handleDayClick(date)}
              disabled={!isClickable}
              className={`
                aspect-square p-1 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all
                ${
                  isClickable
                    ? "hover:bg-sage/20 cursor-pointer"
                    : "cursor-default"
                }
                ${isSelected ? "ring-2 ring-forest bg-sage/30" : ""}
                ${!inRange ? "opacity-30" : ""}
                ${inRange && !clubDay?.is_available ? "opacity-50" : ""}
              `}
              aria-label={`${date.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}${isSelected ? " (selected)" : ""}${
                morningStatus ? `, Morning: ${getStatusLabel(morningStatus)}` : ""
              }${
                afternoonStatus
                  ? `, Afternoon: ${getStatusLabel(afternoonStatus)}`
                  : ""
              }`}
            >
              <span
                className={`text-sm font-semibold ${
                  isSelected ? "text-forest" : "text-bark"
                }`}
              >
                {date.getDate()}
              </span>

              {clubDay && inRange && (
                <div className="flex gap-0.5">
                  {/* Morning indicator */}
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      morningStatus!
                    )}`}
                    title={`Morning: ${getStatusLabel(morningStatus!)}`}
                  />
                  {/* Afternoon indicator */}
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      afternoonStatus!
                    )}`}
                    title={`Afternoon: ${getStatusLabel(afternoonStatus!)}`}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-cloud">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span>Low availability</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-error" />
            <span>Full</span>
          </div>
          <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-pebble">
            <span className="font-medium">AM</span>
            <span>/</span>
            <span className="font-medium">PM</span>
          </div>
        </div>
      </div>

      {/* Selected days summary */}
      {selectedDates.length > 0 && (
        <div className="mt-4 pt-4 border-t border-cloud">
          <p className="text-sm text-stone">
            <span className="font-semibold text-bark">
              {selectedDates.length} day{selectedDates.length !== 1 ? "s" : ""}{" "}
              selected
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
