import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "pending" | "paid" | "complete" | "cancelled";
  className?: string;
}

export function Badge({ children, variant = "info", className = "" }: BadgeProps) {
  const getStyle = () => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: "#22C55E",
          color: "white",
        };
      case "warning":
        return {
          backgroundColor: "#F59E0B",
          color: "white",
        };
      case "error":
      case "cancelled":
        return {
          backgroundColor: "#EF4444",
          color: "white",
        };
      case "paid":
      case "complete":
        return {
          backgroundColor: "var(--craigies-olive)",
          color: "white",
        };
      case "pending":
        return {
          backgroundColor: "var(--craigies-burnt-orange)",
          color: "white",
        };
      case "info":
      default:
        return {
          backgroundColor: "#3B82F6",
          color: "white",
        };
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${className}`}
      style={getStyle()}
    >
      {children}
    </span>
  );
}
