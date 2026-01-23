import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "olive" | "burnt-orange" | "white";
}

export function LoadingSpinner({ size = "md", color = "olive" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const colorStyles = {
    olive: {
      borderColor: "var(--craigies-olive)",
      borderTopColor: "transparent",
    },
    "burnt-orange": {
      borderColor: "var(--craigies-burnt-orange)",
      borderTopColor: "transparent",
    },
    white: {
      borderColor: "white",
      borderTopColor: "transparent",
    },
  };

  return (
    <div
      className={`${sizeClasses[size]} border-solid rounded-full animate-spin`}
      style={colorStyles[color]}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
