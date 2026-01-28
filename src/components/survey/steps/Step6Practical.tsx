'use client';

import MultiSelectLimited from '../questions/MultiSelectLimited';
import MultiSelect from '../questions/MultiSelect';
import PostcodeInput from '../questions/PostcodeInput';

interface Step6Props {
  importantFactors: string[];
  additionalServices: string[];
  postcode: string;
  onImportantFactorsChange: (value: string[]) => void;
  onAdditionalServicesChange: (value: string[]) => void;
  onPostcodeChange: (value: string) => void;
}

const IMPORTANT_FACTORS_OPTIONS = [
  'Cost',
  'Qualified/experienced staff',
  'Variety of activities',
  'Safe & familiar environment',
  'Outdoor time',
  'Flexible booking',
  'Location',
  'Quality of experience',
];

const ADDITIONAL_SERVICES_OPTIONS = [
  'Early drop-off',
  'Late pick-up',
  'Sibling discounts',
];

export default function Step6Practical({
  importantFactors,
  additionalServices,
  postcode,
  onImportantFactorsChange,
  onAdditionalServicesChange,
  onPostcodeChange,
}: Step6Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#5a5c3a] mb-2 font-heading">
          Practical Considerations
        </h2>
        <p className="text-[#6b7280]">
          What matters most to you?
        </p>
      </div>

      <MultiSelectLimited
        name="important_factors"
        label="What would be most important to you when choosing a club?"
        options={IMPORTANT_FACTORS_OPTIONS}
        value={importantFactors}
        onChange={onImportantFactorsChange}
        maxSelections={3}
        required
      />

      <MultiSelect
        name="additional_services"
        label="Would you be interested in:"
        options={ADDITIONAL_SERVICES_OPTIONS}
        value={additionalServices}
        onChange={onAdditionalServicesChange}
        hint="Tick all that apply"
      />

      <PostcodeInput
        value={postcode}
        onChange={onPostcodeChange}
        required
      />
    </div>
  );
}
