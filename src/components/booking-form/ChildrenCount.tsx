"use client";

import type { BookingFormData } from "./OptionSelect";

interface ChildrenCountProps {
  formData: BookingFormData;
  onNext: (data: Partial<BookingFormData>) => void;
  minChildren?: number;
  maxChildren?: number;
}

export function ChildrenCount({
  formData,
  onNext,
  minChildren = 1,
  maxChildren = 10,
}: ChildrenCountProps) {
  const count = formData.childrenCount;

  const handleDecrement = () => {
    if (count > minChildren) {
      onNext({ childrenCount: count - 1 });
    }
  };

  const handleIncrement = () => {
    if (count < maxChildren) {
      onNext({ childrenCount: count + 1 });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= minChildren && value <= maxChildren) {
      onNext({ childrenCount: value });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--craigies-dark-olive)",
          }}
        >
          Number of Children
        </h2>
        <p className="mt-1 text-stone">
          How many children will be attending? You'll provide their details after booking.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Decrement Button */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={count <= minChildren}
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all"
            style={{
              fontFamily: "'Playfair Display', serif",
              backgroundColor:
                count <= minChildren
                  ? "#F3F4F6"
                  : "var(--craigies-burnt-orange)",
              color: count <= minChildren ? "#9CA3AF" : "white",
              cursor: count <= minChildren ? "not-allowed" : "pointer",
            }}
            aria-label="Decrease number of children"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M20 12H4"
              />
            </svg>
          </button>

          {/* Count Display/Input */}
          <div className="relative">
            <input
              type="number"
              value={count}
              onChange={handleChange}
              min={minChildren}
              max={maxChildren}
              className="w-20 h-16 text-center text-3xl font-bold border-2 rounded-xl transition-all
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
                borderColor: "var(--craigies-dark-olive)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--craigies-burnt-orange)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--craigies-dark-olive)")
              }
              aria-label="Number of children"
            />
          </div>

          {/* Increment Button */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={count >= maxChildren}
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all"
            style={{
              fontFamily: "'Playfair Display', serif",
              backgroundColor:
                count >= maxChildren
                  ? "#F3F4F6"
                  : "var(--craigies-burnt-orange)",
              color: count >= maxChildren ? "#9CA3AF" : "white",
              cursor: count >= maxChildren ? "not-allowed" : "pointer",
            }}
            aria-label="Increase number of children"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-stone">
          {count === 1 ? "1 child" : `${count} children`}
        </p>
      </div>

      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: "var(--craigies-olive)" }}
      >
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            style={{ color: "var(--craigies-burnt-orange)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-white">
            <p className="font-semibold">Good to know</p>
            <p className="text-white/90 mt-1">
              You'll be asked to provide each child's details (name, age, dietary
              requirements, etc.) after completing your booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
