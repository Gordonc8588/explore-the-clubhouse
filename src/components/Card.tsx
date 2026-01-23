import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
}: CardProps) {
  const paddingStyles = {
    sm: "p-4",
    md: "p-6 md:p-8",
    lg: "p-8 md:p-10",
  };

  const hoverStyles = hover
    ? "transition-shadow hover:shadow-lg"
    : "";

  return (
    <div
      className={`bg-white rounded-lg shadow-md ${paddingStyles[padding]} ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
}
