"use client";

import React, { useState } from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
}

export function FormField({
  label,
  error,
  multiline = false,
  rows = 4,
  className = "",
  id,
  required,
  ...props
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const baseStyles = "w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors";
  const borderColor = error
    ? "#EF4444"
    : isFocused
    ? "var(--craigies-burnt-orange)"
    : "var(--craigies-dark-olive)";

  const inputStyles = {
    borderColor,
    color: "var(--craigies-dark-olive)",
  };

  const InputElement = multiline ? "textarea" : "input";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        htmlFor={inputId}
        className="font-semibold text-sm"
        style={{ color: "var(--craigies-dark-olive)" }}
      >
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <InputElement
        id={inputId}
        className={baseStyles}
        style={inputStyles}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        {...(multiline ? { rows } : {})}
        {...(props as any)}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
