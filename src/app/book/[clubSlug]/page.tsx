"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Club, PromoCode as PromoCodeType } from "@/types/database";
import { OptionSelect, type BookingFormData } from "@/components/booking-form/OptionSelect";
import { DateSelect } from "@/components/booking-form/DateSelect";
import { ParentDetails } from "@/components/booking-form/ParentDetails";
import { ChildrenCount } from "@/components/booking-form/ChildrenCount";
import { PromoCode } from "@/components/booking-form/PromoCode";
import { ReviewStep } from "@/components/booking-form/ReviewStep";
import {
  getClubBySlug,
  getBookingOptions,
  getClubDays,
  formatPrice,
} from "@/lib/mock-data";
import { use } from "react";

const STEPS = [
  { number: 1, label: "Option" },
  { number: 2, label: "Dates" },
  { number: 3, label: "Children" },
  { number: 4, label: "Details" },
  { number: 5, label: "Promo" },
  { number: 6, label: "Review" },
];

interface BookingPageProps {
  params: Promise<{ clubSlug: string }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  const { clubSlug } = use(params);
  const router = useRouter();

  // Get club data
  const club = getClubBySlug(clubSlug);
  const bookingOptions = club ? getBookingOptions(club.id) : [];
  const clubDays = club ? getClubDays(club.id) : [];

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    selectedOption: null,
    selectedDates: [],
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    childrenCount: 1,
  });
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate if Next button should be enabled
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return formData.selectedOption !== null;
      case 2:
        if (formData.selectedOption?.option_type === "full_week") {
          return true; // Full week doesn't need date selection
        }
        if (formData.selectedOption?.option_type === "single_day") {
          return formData.selectedDates.length === 1;
        }
        if (formData.selectedOption?.option_type === "multi_day") {
          return formData.selectedDates.length >= 2;
        }
        return false;
      case 3:
        return formData.childrenCount >= 1;
      case 4:
        return (
          formData.parentName.trim().length >= 2 &&
          formData.parentEmail.includes("@") &&
          formData.parentPhone.trim().length >= 10
        );
      case 5:
        return true; // Promo code is optional
      case 6:
        return true; // Review step has its own button
      default:
        return false;
    }
  }, [currentStep, formData]);

  // Handle form data updates
  const handleFormUpdate = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Navigate steps
  const handleNext = () => {
    if (currentStep < 6 && canProceed) {
      // Skip date selection for full week options
      if (currentStep === 1 && formData.selectedOption?.option_type === "full_week") {
        setCurrentStep(3);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Skip date selection when going back from step 3 if full week
      if (currentStep === 3 && formData.selectedOption?.option_type === "full_week") {
        setCurrentStep(1);
      } else {
        setCurrentStep((prev) => prev - 1);
      }
    }
  };

  // Handle payment submission
  const handleProceedToPayment = async () => {
    if (!club || !formData.selectedOption) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clubId: club.id,
          clubSlug: club.slug,
          bookingOptionId: formData.selectedOption.id,
          selectedDates: formData.selectedDates,
          parentName: formData.parentName,
          parentEmail: formData.parentEmail,
          parentPhone: formData.parentPhone,
          childrenCount: formData.childrenCount,
          promoCodeId: appliedPromo?.id || null,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate pricing for sidebar
  const calculateTotal = (): number => {
    if (!formData.selectedOption) return 0;

    let subtotal = 0;
    if (formData.selectedOption.option_type === "full_week") {
      subtotal = formData.selectedOption.price_per_child * formData.childrenCount;
    } else if (formData.selectedOption.option_type === "single_day") {
      subtotal = formData.selectedOption.price_per_child * formData.childrenCount;
    } else {
      subtotal =
        formData.selectedOption.price_per_child *
        formData.selectedDates.length *
        formData.childrenCount;
    }

    const discount = appliedPromo
      ? Math.round((subtotal * appliedPromo.discount_percent) / 100)
      : 0;

    return subtotal - discount;
  };

  // If club not found
  if (!club) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-bark mb-4">
            Club Not Found
          </h1>
          <p className="font-body text-stone mb-6">
            The club you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/clubs"
            className="inline-block bg-forest text-white font-display font-semibold py-3 px-6 rounded-lg hover:bg-meadow transition-colors"
          >
            View All Clubs
          </Link>
        </div>
      </div>
    );
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <OptionSelect
            options={bookingOptions}
            formData={formData}
            onNext={handleFormUpdate}
          />
        );
      case 2:
        return (
          <DateSelect
            clubDays={clubDays}
            startDate={club.start_date}
            endDate={club.end_date}
            formData={formData}
            onNext={handleFormUpdate}
          />
        );
      case 3:
        return (
          <ChildrenCount
            formData={formData}
            onNext={handleFormUpdate}
          />
        );
      case 4:
        return (
          <ParentDetails
            formData={formData}
            onNext={handleFormUpdate}
          />
        );
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-bark">
                Have a Promo Code?
              </h2>
              <p className="mt-1 text-stone">
                Enter your promo code below to apply a discount.
              </p>
            </div>
            <PromoCode
              clubId={club.id}
              onApply={setAppliedPromo}
              appliedPromo={appliedPromo}
            />
            <p className="text-sm text-pebble">
              Don&apos;t have a code? No worries, just click Next to continue.
            </p>
          </div>
        );
      case 6:
        return (
          <ReviewStep
            club={club}
            formData={formData}
            promoCode={appliedPromo}
            onProceedToPayment={handleProceedToPayment}
            isLoading={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  // Format date for sidebar
  const formatSidebarDates = (): string => {
    if (formData.selectedOption?.option_type === "full_week") {
      const start = new Date(club.start_date);
      const end = new Date(club.end_date);
      return `${start.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })} - ${end.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })}`;
    }
    if (formData.selectedDates.length === 0) return "Not selected";
    return `${formData.selectedDates.length} day${formData.selectedDates.length !== 1 ? "s" : ""} selected`;
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-[var(--shadow-sm)] sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href={`/clubs/${club.slug}`}
              className="inline-flex items-center gap-2 text-stone hover:text-forest transition-colors font-body text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to {club.name}
            </Link>
            <h1 className="font-display text-lg font-bold text-bark sm:text-xl">
              Book Your Place
            </h1>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-cloud">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              // Skip step 2 (Dates) display for full week options
              if (
                step.number === 2 &&
                formData.selectedOption?.option_type === "full_week"
              ) {
                return null;
              }

              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  {index > 0 && (
                    <div
                      className={`hidden sm:block w-8 md:w-12 lg:w-16 h-0.5 mx-1 md:mx-2 ${
                        isCompleted ? "bg-forest" : "bg-cloud"
                      }`}
                    />
                  )}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                        ${
                          isActive
                            ? "bg-forest text-white"
                            : isCompleted
                            ? "bg-forest text-white"
                            : "bg-cloud text-stone"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-4 h-4"
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
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`mt-1 text-xs font-medium hidden sm:block ${
                        isActive ? "text-forest" : "text-stone"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 sm:p-8">
              {renderStepContent()}

              {/* Navigation Buttons (not shown on Review step - it has its own button) */}
              {currentStep !== 6 && (
                <div className="mt-8 pt-6 border-t border-cloud flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className={`
                      py-3 px-6 rounded-lg font-display font-semibold transition-all
                      ${
                        currentStep === 1
                          ? "text-pebble cursor-not-allowed"
                          : "text-forest hover:bg-sage/20"
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back
                    </span>
                  </button>

                  <button
                    type={currentStep === 4 ? "submit" : "button"}
                    form={currentStep === 4 ? "parent-details-form" : undefined}
                    onClick={currentStep !== 4 ? handleNext : undefined}
                    disabled={!canProceed}
                    className={`
                      py-3 px-6 rounded-lg font-display font-semibold transition-all
                      ${
                        canProceed
                          ? "bg-sunshine text-bark hover:bg-amber"
                          : "bg-cloud text-pebble cursor-not-allowed"
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      Next
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Club Info Summary (Desktop) */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 sticky top-24">
              {/* Club Header */}
              <div className="pb-4 border-b border-cloud">
                <h3 className="font-display text-xl font-bold text-bark">
                  {club.name}
                </h3>
                <p className="text-sm text-stone mt-1">
                  Ages {club.min_age}-{club.max_age}
                </p>
              </div>

              {/* Booking Summary */}
              <div className="py-4 space-y-3">
                {/* Selected Option */}
                <div className="flex justify-between items-start">
                  <span className="text-sm text-stone">Option</span>
                  <span className="text-sm font-semibold text-bark text-right max-w-[60%]">
                    {formData.selectedOption?.name || "Not selected"}
                  </span>
                </div>

                {/* Dates */}
                {formData.selectedOption?.option_type !== "full_week" && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-stone">Dates</span>
                    <span className="text-sm font-semibold text-bark text-right">
                      {formatSidebarDates()}
                    </span>
                  </div>
                )}

                {/* Children */}
                <div className="flex justify-between items-start">
                  <span className="text-sm text-stone">Children</span>
                  <span className="text-sm font-semibold text-bark">
                    {formData.childrenCount}
                  </span>
                </div>

                {/* Promo Code */}
                {appliedPromo && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-stone">Promo</span>
                    <span className="text-sm font-semibold text-forest">
                      {appliedPromo.code} (-{appliedPromo.discount_percent}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-cloud">
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-bark">Total</span>
                  <span className="font-display text-2xl font-bold text-forest">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
                {formData.selectedOption?.option_type === "multi_day" &&
                  formData.selectedDates.length === 0 && (
                    <p className="text-xs text-pebble mt-1 text-right">
                      Select dates to see total
                    </p>
                  )}
              </div>

              {/* Help Box */}
              <div className="mt-6 bg-sage/20 rounded-xl p-4">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-forest flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm">
                    <p className="font-semibold text-bark">Need help?</p>
                    <p className="text-stone mt-1">
                      Contact us at{" "}
                      <a
                        href="mailto:hello@exploretheclubhouse.co.uk"
                        className="text-forest hover:underline"
                      >
                        hello@exploretheclubhouse.co.uk
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
