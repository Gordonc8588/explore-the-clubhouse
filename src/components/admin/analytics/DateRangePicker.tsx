'use client';

import { useState } from 'react';
import type { DateRange } from '@/lib/analytics-queries';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const options: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            value === option.value
              ? 'bg-forest text-white'
              : 'text-stone hover:bg-cloud'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
