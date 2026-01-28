'use client';

import MultiSelect from '../questions/MultiSelect';
import TextArea from '../questions/TextArea';

interface Step4Props {
  activities: string[];
  activitiesNotes: string;
  onActivitiesChange: (value: string[]) => void;
  onActivitiesNotesChange: (value: string) => void;
}

const ACTIVITY_OPTIONS = [
  'Arts and crafts',
  'Sports and outdoor games',
  'Drama/role play',
  'Music & dance',
  'STEM activities (science, building, experiments)',
  'Baking/cooking',
  'Board games & puzzles',
  'Free play',
  'Trips/special visitors',
  'Quiet activities (reading, colouring, chill out space)',
];

export default function Step4Activities({
  activities,
  activitiesNotes,
  onActivitiesChange,
  onActivitiesNotesChange,
}: Step4Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#5a5c3a] mb-2 font-heading">
          Activities
        </h2>
        <p className="text-[#6b7280]">
          What would your children enjoy?
        </p>
      </div>

      <MultiSelect
        name="activities"
        label="Which activities would your children enjoy?"
        options={ACTIVITY_OPTIONS}
        value={activities}
        onChange={onActivitiesChange}
        hint="Tick all that apply"
      />

      <TextArea
        name="activities_notes"
        label="Are there any activities your child particularly loves or dislikes?"
        value={activitiesNotes}
        onChange={onActivitiesNotesChange}
        placeholder="Tell us about any specific interests or things to avoid..."
        maxLength={500}
      />
    </div>
  );
}
