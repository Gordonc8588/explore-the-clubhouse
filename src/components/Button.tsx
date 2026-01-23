import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-semibold rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "text-white",
    secondary: "border-2",
    ghost: "bg-transparent",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const getStyle = () => {
    switch (variant) {
      case "primary":
        return { backgroundColor: "var(--craigies-burnt-orange)" };
      case "secondary":
        return {
          borderColor: "var(--craigies-dark-olive)",
          color: "var(--craigies-dark-olive)",
          backgroundColor: "transparent",
        };
      case "ghost":
        return { color: "var(--craigies-dark-olive)" };
      case "danger":
        return {};
      default:
        return {};
    }
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={getStyle()}
      {...props}
    >
      {children}
    </button>
  );
}
