'use client';

interface TextAreaProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  rows?: number;
}

export default function TextArea({
  name,
  label,
  value,
  onChange,
  placeholder,
  maxLength = 500,
  required = false,
  rows = 4,
}: TextAreaProps) {
  const charCount = value.length;
  const isNearLimit = charCount > maxLength * 0.8;
  const isAtLimit = charCount >= maxLength;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-base font-semibold text-[#5a5c3a]">
        {label}
        {required && <span className="text-[#d4843e] ml-1">*</span>}
        {!required && <span className="text-[#6b7280] font-normal ml-2">(Optional)</span>}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={`
          w-full px-4 py-3 rounded-lg border-2
          text-[#3d3d3d] placeholder-[#9ca3af]
          transition-all duration-200
          resize-none
          focus:outline-none focus:border-[#d4843e] focus:ring-4 focus:ring-[#d4843e]/10
          ${isAtLimit
            ? 'border-[#d4843e]'
            : 'border-[#f5f4ed] hover:border-[#7a7c4a]/30'
          }
        `}
      />

      <div className="flex justify-end">
        <span className={`
          text-xs font-medium
          ${isAtLimit
            ? 'text-[#d4843e]'
            : isNearLimit
              ? 'text-[#f59e0b]'
              : 'text-[#9ca3af]'
          }
        `}>
          {charCount} / {maxLength}
        </span>
      </div>
    </div>
  );
}
