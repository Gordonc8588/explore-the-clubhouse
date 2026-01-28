'use client';

interface SingleSelectProps {
  name: string;
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function SingleSelect({
  name,
  label,
  options,
  value,
  onChange,
  required = false,
}: SingleSelectProps) {
  return (
    <div className="space-y-3">
      <label className="block text-base font-semibold text-[#5a5c3a]">
        {label}
        {required && <span className="text-[#d4843e] ml-1">*</span>}
      </label>

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = value === option;

          return (
            <label
              key={option}
              className={`
                flex items-center p-4 rounded-lg border-2 cursor-pointer
                transition-all duration-200
                ${isSelected
                  ? 'border-[#7a7c4a] bg-[#7a7c4a]/5'
                  : 'border-[#f5f4ed] bg-white hover:border-[#d4843e]/50'
                }
              `}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={isSelected}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              <span
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0
                  transition-all duration-200
                  ${isSelected
                    ? 'border-[#7a7c4a] bg-[#7a7c4a]'
                    : 'border-[#9ca3af]'
                  }
                `}
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </span>
              <span className={`text-sm ${isSelected ? 'text-[#5a5c3a] font-medium' : 'text-[#3d3d3d]'}`}>
                {option}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
