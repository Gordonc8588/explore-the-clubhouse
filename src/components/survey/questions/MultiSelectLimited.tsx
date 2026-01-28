'use client';

interface MultiSelectLimitedProps {
  name: string;
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections: number;
  required?: boolean;
}

export default function MultiSelectLimited({
  name,
  label,
  options,
  value,
  onChange,
  maxSelections,
  required = false,
}: MultiSelectLimitedProps) {
  const isAtLimit = value.length >= maxSelections;

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      // Always allow deselection
      onChange(value.filter((v) => v !== option));
    } else if (!isAtLimit) {
      // Only allow selection if not at limit
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
        <p className="text-sm text-[#6b7280] mt-1">
          Select up to {maxSelections} options
        </p>
      </div>

      {/* Selection counter */}
      <div className={`
        inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
        ${isAtLimit
          ? 'bg-[#d4843e]/10 text-[#d4843e]'
          : 'bg-[#7a7c4a]/10 text-[#7a7c4a]'
        }
      `}>
        <span className="font-bold">{value.length}</span>
        <span className="mx-1">/</span>
        <span>{maxSelections}</span>
        <span className="ml-1">selected</span>
        {isAtLimit && (
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = value.includes(option);
          const isDisabled = !isSelected && isAtLimit;

          return (
            <label
              key={option}
              className={`
                flex items-center p-4 rounded-lg border-2
                transition-all duration-200
                ${isDisabled
                  ? 'border-[#f5f4ed] bg-[#f5f4ed]/50 cursor-not-allowed opacity-50'
                  : isSelected
                    ? 'border-[#7a7c4a] bg-[#7a7c4a]/5 cursor-pointer'
                    : 'border-[#f5f4ed] bg-white hover:border-[#d4843e]/50 cursor-pointer'
                }
              `}
            >
              <input
                type="checkbox"
                name={name}
                value={option}
                checked={isSelected}
                onChange={() => handleToggle(option)}
                disabled={isDisabled}
                className="sr-only"
              />
              <span
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center mr-3 flex-shrink-0
                  transition-all duration-200
                  ${isSelected
                    ? 'border-[#7a7c4a] bg-[#7a7c4a]'
                    : isDisabled
                      ? 'border-[#d1d5db] bg-[#f5f4ed]'
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
              <span className={`text-sm ${
                isSelected
                  ? 'text-[#5a5c3a] font-medium'
                  : isDisabled
                    ? 'text-[#9ca3af]'
                    : 'text-[#3d3d3d]'
              }`}>
                {option}
              </span>
            </label>
          );
        })}
      </div>

      {isAtLimit && (
        <p className="text-sm text-[#d4843e] flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Maximum selections reached. Deselect an option to choose a different one.
        </p>
      )}
    </div>
  );
}
