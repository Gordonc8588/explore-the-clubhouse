'use client';

interface MultiSelectProps {
  name: string;
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  hint?: string;
}

export default function MultiSelect({
  name,
  label,
  options,
  value,
  onChange,
  required = false,
  hint,
}: MultiSelectProps) {
  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-base font-semibold text-[#5a5c3a]">
          {label}
          {required && <span className="text-[#d4843e] ml-1">*</span>}
        </label>
        {hint && (
          <p className="text-sm text-[#6b7280] mt-1">{hint}</p>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = value.includes(option);

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
                type="checkbox"
                name={name}
                value={option}
                checked={isSelected}
                onChange={() => handleToggle(option)}
                className="sr-only"
              />
              <span
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center mr-3 flex-shrink-0
                  transition-all duration-200
                  ${isSelected
                    ? 'border-[#7a7c4a] bg-[#7a7c4a]'
                    : 'border-[#9ca3af]'
                  }
                `}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={`text-sm ${isSelected ? 'text-[#5a5c3a] font-medium' : 'text-[#3d3d3d]'}`}>
                {option}
              </span>
            </label>
          );
        })}
      </div>

      {value.length > 0 && (
        <p className="text-sm text-[#7a7c4a]">
          {value.length} selected
        </p>
      )}
    </div>
  );
}
