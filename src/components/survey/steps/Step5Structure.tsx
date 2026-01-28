'use client';

import SingleSelect from '../questions/SingleSelect';

interface Step5Props {
  ageGroupPreference: string | null;
  structurePreference: string | null;
  onAgeGroupPreferenceChange: (value: string) => void;
  onStructurePreferenceChange: (value: string) => void;
}

const AGE_GROUP_OPTIONS = [
  'Mixed ages (5-12 together)',
  'Split into age groups',
  'A mix of both',
];

const STRUCTURE_OPTIONS = [
  'Structured (planned timetable)',
  'Flexible (choice-based activities)',
  'A mix of both',
];

export default function Step5Structure({
  ageGroupPreference,
  structurePreference,
  onAgeGroupPreferenceChange,
  onStructurePreferenceChange,
}: Step5Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#5a5c3a] mb-2 font-heading">
          Age Groups & Structure
        </h2>
        <p className="text-[#6b7280]">
          How would you like activities to be organised?
        </p>
      </div>

      <SingleSelect
        name="age_group_preference"
        label="Would you prefer activities to be:"
        options={AGE_GROUP_OPTIONS}
        value={ageGroupPreference}
        onChange={onAgeGroupPreferenceChange}
      />

      <SingleSelect
        name="structure_preference"
        label="Would you prefer a club that is:"
        options={STRUCTURE_OPTIONS}
        value={structurePreference}
        onChange={onStructurePreferenceChange}
      />
    </div>
  );
}
