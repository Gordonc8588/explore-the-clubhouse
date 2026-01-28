'use client';

import { useState, useEffect } from 'react';

interface PostcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

// UK postcode regex - validates format
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;

export default function PostcodeInput({
  value,
  onChange,
  required = false,
}: PostcodeInputProps) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate postcode format
  useEffect(() => {
    if (!touched) return;

    if (!value && required) {
      setError('Postcode is required');
    } else if (value && !UK_POSTCODE_REGEX.test(value)) {
      setError('Please enter a valid UK postcode');
    } else {
      setError(null);
    }
  }, [value, touched, required]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase the input
    const uppercased = e.target.value.toUpperCase();
    onChange(uppercased);
  };

  const handleBlur = () => {
    setTouched(true);

    // Auto-format with space if missing
    if (value && !value.includes(' ') && value.length > 3) {
      const formatted = `${value.slice(0, -3)} ${value.slice(-3)}`;
      onChange(formatted);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="postcode" className="block text-base font-semibold text-[#5a5c3a]">
        What is your postcode?
        {required && <span className="text-[#d4843e] ml-1">*</span>}
      </label>
      <p className="text-sm text-[#6b7280]">
        This helps us understand where families are located
      </p>

      <input
        type="text"
        id="postcode"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="e.g. EH1 1AA"
        maxLength={8}
        className={`
          w-full max-w-[200px] px-4 py-3 rounded-lg border-2
          text-[#3d3d3d] placeholder-[#9ca3af] uppercase
          transition-all duration-200
          focus:outline-none focus:border-[#d4843e] focus:ring-4 focus:ring-[#d4843e]/10
          ${error
            ? 'border-[#ef4444]'
            : 'border-[#f5f4ed] hover:border-[#7a7c4a]/30'
          }
        `}
      />

      {error && touched && (
        <p className="text-sm text-[#ef4444] flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {value && !error && touched && (
        <p className="text-sm text-[#22c55e] flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Valid postcode
        </p>
      )}
    </div>
  );
}
