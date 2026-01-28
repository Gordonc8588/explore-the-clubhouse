'use client';

import SingleSelect from '../questions/SingleSelect';
import MultiSelect from '../questions/MultiSelect';

interface Step2Props {
  interestLevel: string | null;
  holidayPeriods: string[];
  onInterestLevelChange: (value: string) => void;
  onHolidayPeriodsChange: (value: string[]) => void;
}

const INTEREST_OPTIONS = ['Yes, definitely', 'Possibly', 'No'];
const HOLIDAY_PERIOD_OPTIONS = [
  'School half-terms',
  'Summer holidays',
  'Easter holidays',
  'Christmas holidays',
  'Occasional inset days',
];

export default function Step2Demand({
  interestLevel,
  holidayPeriods,
  onInterestLevelChange,
  onHolidayPeriodsChange,
}: Step2Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#5a5c3a] mb-2 font-heading">
          Demand for a Club
        </h2>
        <p className="text-[#6b7280]">
          Help us understand your interest in a holiday club
        </p>
      </div>

      <SingleSelect
        name="interest_level"
        label="Would you be interested in a holiday or half-term club for your child(ren)?"
        options={INTEREST_OPTIONS}
        value={interestLevel}
        onChange={onInterestLevelChange}
        required
      />

      <MultiSelect
        name="holiday_periods"
        label="Which times would you be most interested in?"
        options={HOLIDAY_PERIOD_OPTIONS}
        value={holidayPeriods}
        onChange={onHolidayPeriodsChange}
        hint="Tick all that apply"
      />
    </div>
  );
}
