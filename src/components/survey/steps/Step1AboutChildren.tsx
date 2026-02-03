'use client';

import SingleSelect from '../questions/SingleSelect';
import MultiSelect from '../questions/MultiSelect';

interface Step1Props {
  numChildren: string | null;
  childrenAges: string[];
  hasYoungerChildren: string | null;
  youngerChildrenOpenPlay: string | null;
  onNumChildrenChange: (value: string) => void;
  onChildrenAgesChange: (value: string[]) => void;
  onHasYoungerChildrenChange: (value: string) => void;
  onYoungerChildrenOpenPlayChange: (value: string) => void;
}

const NUM_CHILDREN_OPTIONS = ['1', '2', '3', '4+'];
const AGE_OPTIONS = ['5-6', '7-8', '9-10', '11-12', '12-14'];
const YES_NO_OPTIONS = ['Yes', 'No'];
const OPEN_PLAY_OPTIONS = [
  'Yes, definitely',
  'Possibly',
  'No',
];

export default function Step1AboutChildren({
  numChildren,
  childrenAges,
  hasYoungerChildren,
  youngerChildrenOpenPlay,
  onNumChildrenChange,
  onChildrenAgesChange,
  onHasYoungerChildrenChange,
  onYoungerChildrenOpenPlayChange,
}: Step1Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#5a5c3a] mb-2 font-heading">
          About Your Children
        </h2>
        <p className="text-[#6b7280]">
          Tell us about your children aged 5-14
        </p>
      </div>

      <SingleSelect
        name="num_children"
        label="How many children aged 5-14 do you have?"
        options={NUM_CHILDREN_OPTIONS}
        value={numChildren}
        onChange={onNumChildrenChange}
        required
      />

      <MultiSelect
        name="children_ages"
        label="What are their ages?"
        options={AGE_OPTIONS}
        value={childrenAges}
        onChange={onChildrenAgesChange}
        hint="Tick all that apply"
        required
      />

      <SingleSelect
        name="has_younger_children"
        label="Do you also have children aged 2-4?"
        options={YES_NO_OPTIONS}
        value={hasYoungerChildren}
        onChange={onHasYoungerChildrenChange}
      />

      {hasYoungerChildren === 'Yes' && (
        <div className="ml-4 pl-4 border-l-2 border-[#d4843e]/30">
          <SingleSelect
            name="younger_children_open_play"
            label="Would you be interested in a morning open play session just for 2-4 year olds? (e.g. free play, crafts, and activities designed for smaller children)"
            options={OPEN_PLAY_OPTIONS}
            value={youngerChildrenOpenPlay}
            onChange={onYoungerChildrenOpenPlayChange}
          />
        </div>
      )}
    </div>
  );
}
