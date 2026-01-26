"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Users, CreditCard, AlertCircle, RefreshCw, Loader2, Info } from "lucide-react";
import { ChildInfoForm, type ChildInfoFormValues } from "@/components/ChildInfoForm";
import type { Booking, BookingOption, Club, Child } from "@/types/database";

// Simplified child data for add-on workshops
interface SimplifiedChildData {
  childName: string;
  dateOfBirth: string;
}

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
  const [isAutoVerifying, setIsAutoVerifying] = useState(booking.status === "pending");
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
  const hasAutoVerified = useRef(false);

  // Simplified form state for add-on workshops
  const isAddOnWorkshop = club.slug === "add-on-workshop";
  const [useSimplifiedForm, setUseSimplifiedForm] = useState(isAddOnWorkshop);
  const [simplifiedChildren, setSimplifiedChildren] = useState<SimplifiedChildData[]>(
    Array(booking.num_children).fill(null).map(() => ({ childName: "", dateOfBirth: "" }))
  );
  const [hasCompletedMainForms, setHasCompletedMainForms] = useState(true);

  const isAlreadyComplete = booking.status === "complete" || existingChildren.length > 0;

  // Auto-verify payment on mount if status is pending
  useEffect(() => {
    if (booking.status === "pending" && !hasAutoVerified.current) {
      hasAutoVerified.current = true;
      autoVerifyPayment();
    }
  }, [booking.status]);

  const autoVerifyPayment = async () => {
    setIsAutoVerifying(true);
    let attempts = 0;
    const maxAttempts = 5;
    const delayMs = 1500;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: booking.id }),
        });

        const result = await response.json();

        if (result.success && (result.status === "verified" || result.status === "already_paid")) {
          // Payment verified - refresh the page to show the form
          window.location.reload();
          return;
        }
      } catch (err) {
        console.error("Auto-verify attempt failed:", err);
      }

      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    // After all attempts, show manual button
    setIsAutoVerifying(false);
    setVerifyMessage("Payment verification is taking longer than expected. Click below to check again.");
  };

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

  // Handle simplified form submission for add-on workshops
  const handleSimplifiedSubmit = async () => {
    setError(null);

    // Validate simplified form data
    const hasIncomplete = simplifiedChildren.some(
      (child) => !child.childName.trim() || !child.dateOfBirth
    );

    if (hasIncomplete) {
      setError("Please fill in name and date of birth for all children");
      return;
    }

    // If they haven't completed main forms, switch to full form mode
    if (!hasCompletedMainForms) {
      setUseSimplifiedForm(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          children: simplifiedChildren,
          simplified: true,
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

  const updateSimplifiedChild = (index: number, field: keyof SimplifiedChildData, value: string) => {
    const updated = [...simplifiedChildren];
    updated[index] = { ...updated[index], [field]: value };
    setSimplifiedChildren(updated);
  };

  // Already complete - show summary
  if (isAlreadyComplete) {
    return (
      <div className="min-h-screen py-12" style={{ backgroundColor: "var(--craigies-cream)" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16" style={{ color: "var(--craigies-olive)" }} />
            <h1
              className="mt-4 text-3xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Booking Complete
            </h1>
            <p className="mt-2 text-stone">
              Children information has already been submitted for this booking.
            </p>
            <Link
              href={"/confirmation/" + booking.id}
              className="mt-6 inline-block text-white font-semibold py-3 px-6 rounded-lg transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--craigies-burnt-orange)",
                fontFamily: "'Playfair Display', serif",
              }}
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
      <div className="min-h-screen py-12" style={{ backgroundColor: "var(--craigies-cream)" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            {isAutoVerifying ? (
              // Auto-verifying state
              <>
                <Loader2 className="mx-auto h-16 w-16 animate-spin" style={{ color: "var(--craigies-olive)" }} />
                <h1
                  className="mt-4 text-3xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  Verifying Payment
                </h1>
                <p className="mt-2 text-stone">
                  Please wait while we confirm your payment...
                </p>
              </>
            ) : (
              // Manual verification state (fallback)
              <>
                <AlertCircle className="mx-auto h-16 w-16" style={{ color: "var(--craigies-burnt-orange)" }} />
                <h1
                  className="mt-4 text-3xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  Payment Pending
                </h1>
                <p className="mt-2 text-stone">
                  This booking has not been paid yet. Please complete payment first.
                </p>

                {/* Verify Payment Button */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleVerifyPayment}
                    disabled={isVerifying}
                    className="inline-flex items-center gap-2 text-white font-semibold py-3 px-6 rounded-lg transition-opacity disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--craigies-burnt-orange)",
                      fontFamily: "'Playfair Display', serif",
                    }}
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
                    className="font-medium"
                    style={{ color: "var(--craigies-burnt-orange)" }}
                  >
                    ← Back to Clubs
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Simplified form for add-on workshops
  if (isAddOnWorkshop && useSimplifiedForm) {
    return (
      <div className="min-h-screen py-12" style={{ backgroundColor: "var(--craigies-cream)" }}>
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Booking Summary */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <h1
              className="text-2xl font-bold mb-4"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Workshop Registration
            </h1>
            <p className="text-stone mb-6">
              Quick registration for your add-on workshop booking.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5" style={{ color: "var(--craigies-burnt-orange)" }} />
                <div>
                  <p className="text-sm text-stone">Workshop</p>
                  <p className="font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                    {club.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" style={{ color: "var(--craigies-burnt-orange)" }} />
                <div>
                  <p className="text-sm text-stone">Children</p>
                  <p className="font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                    {booking.num_children} {booking.num_children === 1 ? "child" : "children"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div
            className="rounded-2xl p-4 mb-6 flex gap-3"
            style={{ backgroundColor: "var(--craigies-olive)" }}
          >
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--craigies-burnt-orange)" }} />
            <div className="text-sm text-white">
              <p className="font-semibold">Add-on Workshop</p>
              <p className="text-white/90 mt-1">
                If you&apos;ve already completed the full registration forms for your main club booking,
                you only need to confirm the children&apos;s names and dates of birth below.
              </p>
            </div>
          </div>

          {/* Simplified Child Forms */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <h2
              className="text-xl font-bold mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Children Attending
            </h2>

            <div className="space-y-6">
              {Array.from({ length: booking.num_children }, (_, index) => (
                <div key={index} className="p-4 rounded-xl border border-cloud bg-cloud/30">
                  <h3 className="font-medium text-bark mb-4">Child {index + 1}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`child-name-${index}`}
                        className="block text-sm font-medium text-stone mb-1.5"
                      >
                        Child&apos;s Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`child-name-${index}`}
                        type="text"
                        value={simplifiedChildren[index]?.childName || ""}
                        onChange={(e) => updateSimplifiedChild(index, "childName", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-stone bg-white text-bark transition-all focus:outline-none focus:border-forest focus:ring-2 focus:ring-sage/30"
                        placeholder="Enter child's full name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`child-dob-${index}`}
                        className="block text-sm font-medium text-stone mb-1.5"
                      >
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`child-dob-${index}`}
                        type="date"
                        value={simplifiedChildren[index]?.dateOfBirth || ""}
                        onChange={(e) => updateSimplifiedChild(index, "dateOfBirth", e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-stone bg-white text-bark transition-all focus:outline-none focus:border-forest focus:ring-2 focus:ring-sage/30"
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Confirmation checkbox */}
            <div className="mt-6 p-4 rounded-xl border border-cloud bg-white">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCompletedMainForms}
                  onChange={(e) => setHasCompletedMainForms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-stone text-forest focus:ring-forest focus:ring-offset-0"
                />
                <div className="flex-1">
                  <span className="font-medium text-bark">
                    I have already completed the full registration forms
                  </span>
                  <p className="mt-1 text-sm text-stone">
                    I confirm that I have submitted the full child information forms (emergency contacts,
                    medical details, consents) for another club booking and those details are still current.
                  </p>
                </div>
              </label>
            </div>

            {!hasCompletedMainForms && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>No problem!</strong> Click the button below and we&apos;ll show you the full registration form.
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={handleSimplifiedSubmit}
              disabled={isSubmitting}
              className="font-semibold py-4 px-8 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              style={{
                backgroundColor: "var(--craigies-burnt-orange)",
                color: "white",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {isSubmitting
                ? "Submitting..."
                : hasCompletedMainForms
                  ? "Confirm Registration"
                  : "Continue to Full Form"
              }
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full form for regular bookings
  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: "var(--craigies-cream)" }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Booking Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h1
            className="text-2xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Complete Your Booking
          </h1>
          <p className="text-stone mb-6">
            Please provide information for each child attending. This information helps us keep your children safe.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5" style={{ color: "var(--craigies-burnt-orange)" }} />
              <div>
                <p className="text-sm text-stone">Club</p>
                <p className="font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                  {club.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" style={{ color: "var(--craigies-burnt-orange)" }} />
              <div>
                <p className="text-sm text-stone">Children</p>
                <p className="font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                  {booking.num_children} {booking.num_children === 1 ? "child" : "children"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5" style={{ color: "var(--craigies-burnt-orange)" }} />
              <div>
                <p className="text-sm text-stone">Amount Paid</p>
                <p className="font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                  {formatPrice(booking.total_amount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Child Forms */}
        {Array.from({ length: booking.num_children }, (_, index) => (
          <div key={index} className={"bg-white rounded-2xl shadow-md p-6 mb-6 " + (validationErrors[index] ? "ring-2 ring-error" : "")}>
            <h2
              className="text-xl font-bold mb-4"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Child {index + 1} of {booking.num_children}
              {childrenData[index] && (
                <span className="ml-2 text-sm font-normal" style={{ color: "var(--craigies-olive)" }}>
                  (Filled)
                </span>
              )}
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
            className="font-semibold py-4 px-8 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            style={{
              backgroundColor: "var(--craigies-burnt-orange)",
              color: "white",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit All Information"}
          </button>
        </div>
      </div>
    </div>
  );
}
