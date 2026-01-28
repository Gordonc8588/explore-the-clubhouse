'use client';

import SingleSelect from '../questions/SingleSelect';
import MultiSelect from '../questions/MultiSelect';

interface Step1Props {
  numChildren: string | null;
  childrenAges: string[];
  onNumChildrenChange: (value: string) => void;
  onChildrenAgesChange: (value: string[]) => void;
}

const NUM_CHILDREN_OPTIONS = ['1', '2', '3', '4+'];
const AGE_OPTIONS = ['5-6', '7-8', '9-10', '11-12'];

export default function Step1AboutChildren({
  numChildren,
  childrenAges,
  onNumChildrenChange,
  onChildrenAgesChange,
}: Step1Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#5a5c3a] mb-2 font-heading">
          About Your Children
        </h2>
        <p className="text-[#6b7280]">
          Tell us about your children aged 5-12
        </p>
      </div>

      <SingleSelect
        name="num_children"
        label="How many children aged 5-12 do you have?"
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
    </div>
  );
}
