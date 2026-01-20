"use client";

import { useState, useRef, use, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Users, CreditCard, AlertCircle } from "lucide-react";
import { ChildInfoForm, type ChildInfoFormValues } from "@/components/ChildInfoForm";
import { formatPrice } from "@/lib/mock-data";
import type { Booking, BookingOption, Club, Child } from "@/types/database";

// Mock booking data for development
const mockBookings: Record<string, {
  booking: Booking;
  bookingOption: BookingOption;
  club: Club;
  children: Child[];
}> = {
  "booking-123": {
    booking: {
      id: "booking-123",
      club_id: "club-easter-2025",
      booking_option_id: "club-easter-2025-option-full-week-full-day",
      parent_name: "Jane Smith",
      parent_email: "jane@example.com",
      parent_phone: "07123456789",
      num_children: 2,
      total_amount: 30000,
      status: "paid",
      promo_code_id: null,
      stripe_payment_intent_id: "pi_mock_123",
      stripe_checkout_session_id: "cs_mock_123",
      created_at: "2025-01-15T10:00:00Z",
    },
    bookingOption: {
      id: "club-easter-2025-option-full-week-full-day",
      club_id: "club-easter-2025",
      name: "Full Week (Full Day)",
      description: "All 5 days, 8:30am - 3:30pm. Best value for a full week of fun!",
      option_type: "full_week",
      time_slot: "full_day",
      price_per_child: 15000,
      sort_order: 1,
      is_active: true,
      created_at: "2025-01-15T10:00:00Z",
    },
    club: {
      id: "club-easter-2025",
      slug: "easter-2025",
      name: "Easter Holiday Club 2025",
      description: "Join us for an egg-citing Easter adventure!",
      image_url: null,
      start_date: "2025-04-07",
      end_date: "2025-04-17",
      morning_start: "08:30:00",
      morning_end: "12:00:00",
      afternoon_start: "12:00:00",
      afternoon_end: "15:30:00",
      min_age: 5,
      max_age: 11,
      is_active: true,
      created_at: "2025-01-15T10:00:00Z",
    },
    children: [],
  },
  "booking-456": {
    booking: {
      id: "booking-456",
      club_id: "club-summer-week1-2025",
      booking_option_id: "club-summer-week1-2025-option-single-day-full-day",
      parent_name: "John Doe",
      parent_email: "john@example.com",
      parent_phone: "07987654321",
      num_children: 1,
      total_amount: 3500,
      status: "complete",
      promo_code_id: null,
      stripe_payment_intent_id: "pi_mock_456",
      stripe_checkout_session_id: "cs_mock_456",
      created_at: "2025-01-16T10:00:00Z",
    },
    bookingOption: {
      id: "club-summer-week1-2025-option-single-day-full-day",
      club_id: "club-summer-week1-2025",
      name: "Single Day (Full Day)",
      description: "Choose any available day, 8:30am - 3:30pm.",
      option_type: "single_day",
      time_slot: "full_day",
      price_per_child: 3500,
      sort_order: 4,
      is_active: true,
      created_at: "2025-01-15T10:00:00Z",
    },
    club: {
      id: "club-summer-week1-2025",
      slug: "summer-week1-2025",
      name: "Summer Holiday Club - Week 1",
      description: "Kick off the summer holidays with a week of outdoor fun!",
      image_url: null,
      start_date: "2025-07-21",
      end_date: "2025-07-25",
      morning_start: "08:30:00",
      morning_end: "12:00:00",
      afternoon_start: "12:00:00",
      afternoon_end: "15:30:00",
      min_age: 5,
      max_age: 11,
      is_active: true,
      created_at: "2025-01-15T10:00:00Z",
    },
    children: [
      {
        id: "child-1",
        booking_id: "booking-456",
        name: "Tommy Doe",
        date_of_birth: "2018-05-15",
        allergies: "None",
        medical_notes: "",
        emergency_contact_name: "Mary Doe",
        emergency_contact_phone: "07111222333",
        photo_consent: true,
        activity_consent: true,
        medical_consent: true,
        created_at: "2025-01-16T10:30:00Z",
      },
    ],
  },
};

interface CompletePageProps {
  params: Promise<{ bookingId: string }>;
}

export default function CompletePage({ params }: CompletePageProps) {
  const { bookingId } = use(params);
  const router = useRouter();

  const [childrenData, setChildrenData] = useState<(ChildInfoFormValues | null)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const formRefs = useRef<(HTMLFormElement | null)[]>([]);

  // Get mock booking data
  const bookingData = mockBookings[bookingId];

  // If booking not found
  if (!bookingData) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h1 className="font-display text-2xl font-bold text-bark mb-2">
            Booking Not Found
          </h1>
          <p className="font-body text-stone mb-6">
            We couldn&apos;t find this booking. Please check your email for the correct link.
          </p>
          <Link
            href="/clubs"
            className="inline-block bg-forest text-white font-display font-semibold py-3 px-6 rounded-lg hover:bg-meadow transition-colors"
          >
            View Clubs
          </Link>
        </div>
      </div>
    );
  }

  const { booking, bookingOption, club, children } = bookingData;
  const isCompleted = children.length > 0 || booking.status === "complete";

  // Initialize children data array
  useEffect(() => {
    if (!isCompleted && !isInitialized) {
      setChildrenData(Array(booking.num_children).fill(null));
      formRefs.current = Array(booking.num_children).fill(null);
      setIsInitialized(true);
    }
  }, [booking.num_children, isCompleted, isInitialized]);

  // Set up form refs after render
  useEffect(() => {
    if (isInitialized && !isCompleted) {
      for (let i = 0; i < booking.num_children; i++) {
        const form = document.getElementById(`child-form-${i}`) as HTMLFormElement | null;
        if (form) formRefs.current[i] = form;
      }
    }
  }, [isInitialized, isCompleted, booking.num_children]);

  // Format dates for display
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    })} - ${endDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  };

  // Handle individual form submission
  const handleChildFormSubmit = useCallback((index: number) => (data: ChildInfoFormValues) => {
    setChildrenData((prev) => {
      const newData = [...prev];
      newData[index] = data;
      return newData;
    });
    setValidationErrors([]);
  }, []);

  // Trigger all form submissions
  const handleSubmitAll = useCallback(async () => {
    // Clear previous errors
    setValidationErrors([]);

    // Trigger all form submissions to run validation
    formRefs.current.forEach((form) => {
      if (form) {
        // Dispatch submit event to trigger react-hook-form validation
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }
    });

    // Small delay to allow state updates from form submissions
    await new Promise((resolve) => setTimeout(resolve, 150));

    // We need to use a callback-based check since state may not be updated yet
    setChildrenData((currentData) => {
      const allFilled = currentData.every((data) => data !== null);

      if (!allFilled) {
        const missingIndices = currentData
          .map((data, i) => (data === null ? i + 1 : null))
          .filter((i) => i !== null);

        setValidationErrors([
          `Please complete information for ${missingIndices.length === 1 ? "child" : "children"} ${missingIndices.join(", ")}`,
        ]);
        return currentData;
      }

      // All valid, submit to API
      setIsSubmitting(true);

      (async () => {
        try {
          const response = await fetch("/api/children", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingId,
              children: currentData,
            }),
          });

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(responseData.error || "Failed to save children information");
          }

          // Redirect to confirmation page
          router.push(`/confirmation/${bookingId}`);
        } catch (error) {
          console.error("Error saving children:", error);
          setValidationErrors([
            error instanceof Error ? error.message : "Something went wrong. Please try again.",
          ]);
        } finally {
          setIsSubmitting(false);
        }
      })();

      return currentData;
    });
  }, [bookingId, router]);

  // Completed state - children info already submitted
  if (isCompleted) {
    return (
      <div className="bg-cream min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-[var(--shadow-sm)]">
          <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-xl font-bold text-bark text-center">
              Booking Complete
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 sm:p-8 text-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>

            <h2 className="font-display text-2xl font-bold text-bark mb-2">
              All Done!
            </h2>
            <p className="font-body text-stone mb-8">
              The children&apos;s information for this booking has already been submitted.
            </p>

            {/* Booking Summary */}
            <div className="bg-sage/10 rounded-xl p-6 text-left mb-8">
              <h3 className="font-display text-lg font-semibold text-bark mb-4">
                Booking Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-forest" />
                  <span className="font-body text-bark">{club.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-forest" />
                  <span className="font-body text-bark">
                    {children.length} {children.length === 1 ? "child" : "children"}: {children.map((c) => c.name).join(", ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/clubs"
                className="inline-block bg-forest text-white font-display font-semibold py-3 px-6 rounded-lg hover:bg-meadow transition-colors"
              >
                View More Clubs
              </Link>
              <Link
                href={`/confirmation/${bookingId}`}
                className="inline-block border-2 border-forest text-forest font-display font-semibold py-3 px-6 rounded-lg hover:bg-forest hover:text-white transition-colors"
              >
                View Confirmation
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-[var(--shadow-sm)]">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-xl font-bold text-bark text-center">
            Complete Your Booking
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-display font-semibold text-bark">
              Payment Successful!
            </p>
            <p className="font-body text-sm text-stone mt-1">
              Thank you for your booking. Please complete the children&apos;s information below.
            </p>
          </div>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 mb-6">
          <h2 className="font-display text-lg font-bold text-bark mb-4">
            Booking Summary
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-sm text-stone">Club</p>
                <p className="font-display font-semibold text-bark">{club.name}</p>
                <p className="font-body text-sm text-stone mt-0.5">
                  {formatDateRange(club.start_date, club.end_date)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-sm text-stone">Option</p>
                <p className="font-display font-semibold text-bark">{bookingOption.name}</p>
                <p className="font-body text-sm text-stone mt-0.5">
                  {booking.num_children} {booking.num_children === 1 ? "child" : "children"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-sm text-stone">Amount Paid</p>
                <p className="font-display font-semibold text-forest text-lg">
                  {formatPrice(booking.total_amount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Children Forms */}
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-bark">
              Children&apos;s Information
            </h2>
            <p className="font-body text-stone mt-1">
              Please provide details for each child attending. Required fields are marked with an asterisk (*).
            </p>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-error/10 border border-error/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-semibold text-bark">
                    Please fix the following:
                  </p>
                  <ul className="font-body text-sm text-error mt-1 list-disc list-inside">
                    {validationErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {Array.from({ length: booking.num_children }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-forest text-white rounded-full flex items-center justify-center font-display font-bold">
                  {index + 1}
                </div>
                <h3 className="font-display text-lg font-bold text-bark">
                  Child {index + 1}
                </h3>
                {childrenData[index] && (
                  <span className="ml-auto text-sm text-success font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </span>
                )}
              </div>
              <ChildInfoForm
                formId={`child-form-${index}`}
                onSubmit={handleChildFormSubmit(index)}
              />
            </div>
          ))}
        </div>

        {/* Submit All Button */}
        <div className="mt-8 bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 sticky bottom-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="font-display font-semibold text-bark">
                Ready to submit?
              </p>
              <p className="font-body text-sm text-stone">
                {childrenData.filter((d) => d !== null).length} of {booking.num_children} forms completed
              </p>
            </div>
            <button
              type="button"
              onClick={handleSubmitAll}
              disabled={isSubmitting}
              className={`
                w-full sm:w-auto py-3 px-8 rounded-lg font-display font-semibold transition-all
                flex items-center justify-center gap-2
                ${
                  isSubmitting
                    ? "bg-pebble text-stone cursor-not-allowed"
                    : "bg-sunshine text-bark hover:bg-amber"
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
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
                  Submitting...
                </>
              ) : (
                <>
                  Submit All
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
