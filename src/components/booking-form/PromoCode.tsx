"use client";

import { useState } from "react";
import type { PromoCode as PromoCodeType } from "@/types/database";

interface PromoCodeProps {
  clubId: string;
  onApply: (promoCode: PromoCodeType | null) => void;
  appliedPromo: PromoCodeType | null;
}

export function PromoCode({ clubId, onApply, appliedPromo }: PromoCodeProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) {
      setError("Please enter a promo code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/promo-code/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), clubId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid promo code");
        onApply(null);
      } else {
        onApply(data);
        setError(null);
      }
    } catch (err) {
      console.error("Error validating promo code:", err);
      setError("Failed to validate promo code. Please try again.");
      onApply(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setCode("");
    setError(null);
    onApply(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor="promoCode"
        className="block text-sm font-medium text-stone"
      >
        Promo Code
      </label>

      {appliedPromo ? (
        // Applied promo code display
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: "var(--craigies-cream)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--craigies-olive)" }}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p
                  className="font-semibold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  {appliedPromo.code}
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--craigies-burnt-orange)" }}
                >
                  {appliedPromo.discount_percent}% discount applied
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm underline transition-colors"
              style={{ color: "#6B7280" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--craigies-dark-olive)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        // Promo code input
        <div>
          <div className="flex gap-2">
            <input
              id="promoCode"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter code"
              className="flex-1 px-4 py-3 rounded-lg border bg-white uppercase transition-all focus:outline-none"
              style={{
                borderColor: error
                  ? "#EF4444"
                  : "var(--craigies-dark-olive)",
                color: "var(--craigies-dark-olive)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = error
                  ? "#EF4444"
                  : "var(--craigies-burnt-orange)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = error
                  ? "#EF4444"
                  : "var(--craigies-dark-olive)")
              }
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleApply}
              disabled={isLoading || !code.trim()}
              className="px-6 py-3 rounded-lg font-semibold transition-all"
              style={{
                fontFamily: "'Playfair Display', serif",
                backgroundColor:
                  isLoading || !code.trim()
                    ? "#F3F4F6"
                    : "var(--craigies-burnt-orange)",
                color: isLoading || !code.trim() ? "#9CA3AF" : "white",
                cursor: isLoading || !code.trim() ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? (
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {error && (
            <div className="mt-2 flex items-center gap-2 text-sm text-error">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
