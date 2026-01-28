'use client';

import SingleSelect from '../questions/SingleSelect';
import MultiSelect from '../questions/MultiSelect';
import DaySelector from '../questions/DaySelector';

interface Step3Props {
  preferredDays: string | null;
  specificDays: string[];
  preferredTimes: string[];
  daysPerWeek: string | null;
  onPreferredDaysChange: (value: string) => void;
  onSpecificDaysChange: (value: string[]) => void;
  onPreferredTimesChange: (value: string[]) => void;
  onDaysPerWeekChange: (value: string) => void;
}

const PREFERRED_DAYS_OPTIONS = ['Weekdays only', 'Specific days', 'Flexible/varies'];
const TIME_OPTIONS = [
  'Morning only (9am to 12pm)',
  'Afternoon only (12pm to 3pm)',
  'School day hours (9am to 3pm)',
  'Full day (8:30am to 4:30pm)',
];
const DAYS_PER_WEEK_OPTIONS = ['1 day', '2-3 days', '4-5 days', 'Varies week to week'];

export default function Step3DaysTimes({
  preferredDays,
  specificDays,
  preferredTimes,
  daysPerWeek,
  onPreferredDaysChange,
  onSpecificDaysChange,
  onPreferredTimesChange,
  onDaysPerWeekChange,
}: Step3Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#5a5c3a] mb-2 font-heading">
          Days & Times
        </h2>
        <p className="text-[#6b7280]">
          When would you use a holiday club?
        </p>
      </div>

      <div>
        <SingleSelect
          name="preferred_days"
          label="What days would you be most likely to use the club?"
          options={PREFERRED_DAYS_OPTIONS}
          value={preferredDays}
          onChange={onPreferredDaysChange}
        />

        {/* Show day selector when "Specific days" is selected */}
        {preferredDays === 'Specific days' && (
          <DaySelector
            value={specificDays}
            onChange={onSpecificDaysChange}
          />
        )}
      </div>

      <MultiSelect
        name="preferred_times"
        label="What times would suit your family best?"
        options={TIME_OPTIONS}
        value={preferredTimes}
        onChange={onPreferredTimesChange}
        hint="Tick all that apply"
      />

      <SingleSelect
        name="days_per_week"
        label="How many days per week would you likely use the club?"
        options={DAYS_PER_WEEK_OPTIONS}
        value={daysPerWeek}
        onChange={onDaysPerWeekChange}
      />
    </div>
  );
}
