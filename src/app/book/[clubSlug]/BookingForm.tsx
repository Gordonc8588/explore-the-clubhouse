"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Club, ClubDay, BookingOption, PromoCode as PromoCodeType } from "@/types/database";
import { OptionSelect, type BookingFormData } from "@/components/booking-form/OptionSelect";
import { DateSelect } from "@/components/booking-form/DateSelect";
import { ParentDetails } from "@/components/booking-form/ParentDetails";
import { ChildrenCount } from "@/components/booking-form/ChildrenCount";
import { PromoCode } from "@/components/booking-form/PromoCode";
import { ReviewStep } from "@/components/booking-form/ReviewStep";

const STEPS = [
  { number: 1, label: "Option" },
  { number: 2, label: "Dates" },
  { number: 3, label: "Children" },
  { number: 4, label: "Details" },
  { number: 5, label: "Promo" },
  { number: 6, label: "Review" },
];

function formatPrice(priceInPence: number): string {
  return "£" + (priceInPence / 100).toFixed(2);
}

interface BookingFormProps {
  club: Club;
  bookingOptions: BookingOption[];
  clubDays: ClubDay[];
}

export function BookingForm({ club, bookingOptions, clubDays }: BookingFormProps) {
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

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return formData.selectedOption !== null;
      case 2:
        if (formData.selectedOption?.option_type === "full_week") return true;
        if (formData.selectedOption?.option_type === "single_day") return formData.selectedDates.length === 1;
        if (formData.selectedOption?.option_type === "multi_day") return formData.selectedDates.length >= 2;
        return false;
      case 3:
        return formData.childrenCount >= 1;
      case 4:
        return formData.parentName.trim().length >= 2 && formData.parentEmail.includes("@") && formData.parentPhone.trim().length >= 10;
      case 5:
      case 6:
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const handleFormUpdate = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 6 && canProceed) {
      if (currentStep === 1 && formData.selectedOption?.option_type === "full_week") {
        setCurrentStep(3);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      if (currentStep === 3 && formData.selectedOption?.option_type === "full_week") {
        setCurrentStep(1);
      } else {
        setCurrentStep((prev) => prev - 1);
      }
    }
  };

  const handleProceedToPayment = async () => {
    if (!formData.selectedOption) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const calculateTotal = (): number => {
    if (!formData.selectedOption) return 0;
    let subtotal = 0;
    if (formData.selectedOption.option_type === "full_week") {
      subtotal = formData.selectedOption.price_per_child * formData.childrenCount;
    } else if (formData.selectedOption.option_type === "single_day") {
      subtotal = formData.selectedOption.price_per_child * formData.childrenCount;
    } else {
      subtotal = formData.selectedOption.price_per_child * formData.selectedDates.length * formData.childrenCount;
    }
    const discount = appliedPromo ? Math.round((subtotal * appliedPromo.discount_percent) / 100) : 0;
    return subtotal - discount;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <OptionSelect options={bookingOptions} formData={formData} onNext={handleFormUpdate} />;
      case 2:
        return <DateSelect clubDays={clubDays} startDate={club.start_date} endDate={club.end_date} formData={formData} onNext={handleFormUpdate} />;
      case 3:
        return <ChildrenCount formData={formData} onNext={handleFormUpdate} />;
      case 4:
        return <ParentDetails formData={formData} onNext={handleFormUpdate} />;
      case 5:
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
                Have a Promo Code?
              </h2>
              <p
                className="mt-1"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Enter your promo code below to apply a discount.
              </p>
            </div>
            <PromoCode clubId={club.id} onApply={setAppliedPromo} appliedPromo={appliedPromo} />
            <p className="text-sm text-gray-500">No code? No worries, just click Next to continue.</p>
          </div>
        );
      case 6:
        return <ReviewStep club={club} formData={formData} promoCode={appliedPromo} onProceedToPayment={handleProceedToPayment} isLoading={isSubmitting} />;
      default:
        return null;
    }
  };

  const formatSidebarDates = (): string => {
    if (formData.selectedOption?.option_type === "full_week") {
      const start = new Date(club.start_date);
      const end = new Date(club.end_date);
      return start.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " - " + end.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    }
    if (formData.selectedDates.length === 0) return "Not selected";
    return formData.selectedDates.length + " day" + (formData.selectedDates.length !== 1 ? "s" : "") + " selected";
  };

  return (
    <div style={{ backgroundColor: "var(--craigies-cream)" }} className="min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href={"/clubs/" + club.slug}
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-80 font-body text-sm"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to {club.name}
            </Link>
            <h1
              className="text-lg font-bold sm:text-xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Book Your Place
            </h1>
          </div>
        </div>
      </header>

      <div className="bg-white border-b" style={{ borderColor: "#F3F4F6" }}>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              if (step.number === 2 && formData.selectedOption?.option_type === "full_week") return null;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              return (
                <div key={step.number} className="flex items-center">
                  {index > 0 && (
                    <div
                      className="hidden sm:block w-8 md:w-12 lg:w-16 h-0.5 mx-1 md:mx-2"
                      style={{
                        backgroundColor: isCompleted
                          ? "var(--craigies-burnt-orange)"
                          : "#F3F4F6",
                      }}
                    />
                  )}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                      style={{
                        backgroundColor:
                          isActive || isCompleted
                            ? "var(--craigies-burnt-orange)"
                            : "#F3F4F6",
                        color: isActive || isCompleted ? "white" : "#6B7280",
                      }}
                    >
                      {isCompleted ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : step.number}
                    </div>
                    <span
                      className="mt-1 text-xs font-medium hidden sm:block"
                      style={{
                        color: isActive
                          ? "var(--craigies-burnt-orange)"
                          : "var(--craigies-dark-olive)",
                      }}
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
              {renderStepContent()}
              {currentStep !== 6 && (
                <div className="mt-8 pt-6 border-t flex items-center justify-between" style={{ borderColor: "#F3F4F6" }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="py-3 px-6 rounded-lg font-semibold transition-opacity"
                    style={{
                      color: currentStep === 1 ? "#9CA3AF" : "var(--craigies-olive)",
                      cursor: currentStep === 1 ? "not-allowed" : "pointer",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      Back
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="py-3 px-6 rounded-lg font-semibold transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: canProceed ? "var(--craigies-burnt-orange)" : "#F3F4F6",
                      color: canProceed ? "white" : "#9CA3AF",
                      cursor: canProceed ? "pointer" : "not-allowed",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <div className="pb-4 border-b" style={{ borderColor: "#F3F4F6" }}>
                <h3
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  {club.name}
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Ages {club.min_age}-{club.max_age}
                </p>
              </div>
              <div className="py-4 space-y-3">
                <div className="flex justify-between items-start">
                  <span
                    className="text-sm"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Option
                  </span>
                  <span
                    className="text-sm font-semibold text-right max-w-[60%]"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    {formData.selectedOption?.name || "Not selected"}
                  </span>
                </div>
                {formData.selectedOption?.option_type !== "full_week" && (
                  <div className="flex justify-between items-start">
                    <span
                      className="text-sm"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Dates
                    </span>
                    <span
                      className="text-sm font-semibold text-right"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      {formatSidebarDates()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span
                    className="text-sm"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Children
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    {formData.childrenCount}
                  </span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-start">
                    <span
                      className="text-sm"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Promo
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--craigies-olive)" }}
                    >
                      {appliedPromo.code} (-{appliedPromo.discount_percent}%)
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t" style={{ borderColor: "#F3F4F6" }}>
                <div className="flex justify-between items-center">
                  <span
                    className="font-bold"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "var(--craigies-dark-olive)",
                    }}
                  >
                    Total
                  </span>
                  <span
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "var(--craigies-burnt-orange)",
                    }}
                  >
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
              </div>
              <div
                className="mt-6 rounded-xl p-4"
                style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
              >
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: "var(--craigies-burnt-orange)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p
                      className="font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Need help?
                    </p>
                    <p
                      className="mt-1"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Contact us at{" "}
                      <a
                        href="mailto:hello@exploretheclubhouse.co.uk"
                        className="hover:underline"
                        style={{ color: "var(--craigies-olive)" }}
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
