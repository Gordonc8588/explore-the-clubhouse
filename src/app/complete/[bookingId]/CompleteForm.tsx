"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Users, CreditCard, AlertCircle, RefreshCw } from "lucide-react";
import { ChildInfoForm, type ChildInfoFormValues } from "@/components/ChildInfoForm";
import type { Booking, BookingOption, Club, Child } from "@/types/database";

function formatPrice(priceInPence: number): string {
  return "£" + (priceInPence / 100).toFixed(2);
}

interface CompleteFormProps {
  booking: Booking;
  club: Club;
  bookingOption: BookingOption;
  existingChildren: Child[];
}

export function CompleteForm({ booking, club, bookingOption, existingChildren }: CompleteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [childrenData, setChildrenData] = useState<(ChildInfoFormValues | null)[]>(
    Array(booking.num_children).fill(null)
  );
  const [validationErrors, setValidationErrors] = useState<boolean[]>(
    Array(booking.num_children).fill(false)
  );
  // Use a ref to track data immediately without waiting for React state updates
  const childrenDataRef = useRef<(ChildInfoFormValues | null)[]>(
    Array(booking.num_children).fill(null)
  );

  const isAlreadyComplete = booking.status === "complete" || existingChildren.length > 0;

  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    setVerifyMessage(null);

    try {
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const result = await response.json();

      if (result.success && result.status === "verified") {
        // Payment verified - refresh the page to show the form
        window.location.reload();
      } else if (result.status === "already_paid") {
        window.location.reload();
      } else {
        setVerifyMessage(result.message || "Payment not yet complete. Please finish checkout in Stripe.");
      }
    } catch (err) {
      console.error("Verify error:", err);
      setVerifyMessage("Failed to verify payment. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChildSubmit = (index: number) => (data: ChildInfoFormValues) => {
    // Update ref immediately (sync)
    childrenDataRef.current[index] = data;

    // Also update state for UI
    const newData = [...childrenData];
    newData[index] = data;
    setChildrenData(newData);

    const newErrors = [...validationErrors];
    newErrors[index] = false;
    setValidationErrors(newErrors);
  };

  const handleSubmitAll = async () => {
    setError(null);

    // Trigger all form submissions to run validation
    for (let i = 0; i < booking.num_children; i++) {
      const form = document.getElementById("child-info-form-" + i) as HTMLFormElement | null;
      if (form) {
        form.requestSubmit();
      }
    }

    // Wait for form validation and onSubmit callbacks to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // Check the ref for completed data (ref updates are synchronous)
    const newErrors: boolean[] = [];
    let hasIncomplete = false;

    for (let i = 0; i < booking.num_children; i++) {
      if (!childrenDataRef.current[i]) {
        newErrors[i] = true;
        hasIncomplete = true;
      } else {
        newErrors[i] = false;
      }
    }

    setValidationErrors(newErrors);

    if (hasIncomplete) {
      setError("Please fill in all child information forms");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          children: childrenDataRef.current,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save children information");
      }

      router.push("/confirmation/" + booking.id);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "Failed to save information");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Already complete - show summary
  if (isAlreadyComplete) {
    return (
      <div className="bg-cream min-h-screen py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-forest" />
            <h1 className="mt-4 font-display text-3xl font-bold text-bark">Booking Complete</h1>
            <p className="mt-2 text-stone">
              Children information has already been submitted for this booking.
            </p>
            <Link
              href={"/confirmation/" + booking.id}
              className="mt-6 inline-block bg-forest text-white font-display font-semibold py-3 px-6 rounded-lg hover:bg-meadow transition-colors"
            >
              View Confirmation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not paid yet
  if (booking.status !== "paid") {
    return (
      <div className="bg-cream min-h-screen py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-8 text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-amber" />
            <h1 className="mt-4 font-display text-3xl font-bold text-bark">Payment Pending</h1>
            <p className="mt-2 text-stone">
              This booking has not been paid yet. Please complete payment first.
            </p>

            {/* Verify Payment Button */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                className="inline-flex items-center gap-2 bg-forest text-white font-display font-semibold py-3 px-6 rounded-lg hover:bg-meadow transition-colors disabled:opacity-50"
              >
                <RefreshCw className={"h-5 w-5 " + (isVerifying ? "animate-spin" : "")} />
                {isVerifying ? "Checking..." : "Check Payment Status"}
              </button>

              {verifyMessage && (
                <p className="text-sm text-stone">{verifyMessage}</p>
              )}

              <p className="text-sm text-stone">
                Already paid? Click above to verify your payment.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-stone/20">
              <Link
                href="/clubs"
                className="text-forest hover:text-meadow font-medium"
              >
                ← Back to Clubs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Booking Summary */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 mb-8">
          <h1 className="font-display text-2xl font-bold text-bark mb-4">Complete Your Booking</h1>
          <p className="text-stone mb-6">
            Please provide information for each child attending. This information helps us keep your children safe.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-forest" />
              <div>
                <p className="text-sm text-stone">Club</p>
                <p className="font-semibold text-bark">{club.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-forest" />
              <div>
                <p className="text-sm text-stone">Children</p>
                <p className="font-semibold text-bark">{booking.num_children} {booking.num_children === 1 ? "child" : "children"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-forest" />
              <div>
                <p className="text-sm text-stone">Amount Paid</p>
                <p className="font-semibold text-bark">{formatPrice(booking.total_amount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Child Forms */}
        {Array.from({ length: booking.num_children }, (_, index) => (
          <div key={index} className={"bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 mb-6 " + (validationErrors[index] ? "ring-2 ring-error" : "")}>
            <h2 className="font-display text-xl font-bold text-bark mb-4">
              Child {index + 1} of {booking.num_children}
              {childrenData[index] && <span className="ml-2 text-sm text-forest font-normal">(Filled)</span>}
            </h2>
            <ChildInfoForm
              formId={"child-info-form-" + index}
              onSubmit={handleChildSubmit(index)}
            />
          </div>
        ))}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSubmitAll}
            disabled={isSubmitting}
            className="bg-sunshine text-bark font-display font-semibold py-4 px-8 rounded-lg hover:bg-amber transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isSubmitting ? "Submitting..." : "Submit All Information"}
          </button>
        </div>
      </div>
    </div>
  );
}
