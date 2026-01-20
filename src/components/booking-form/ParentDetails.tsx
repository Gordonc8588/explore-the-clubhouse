"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BookingFormData } from "./OptionSelect";

const parentDetailsSchema = z.object({
  parentName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  parentEmail: z.string().email("Please enter a valid email address"),
  parentPhone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(
      /^[\d\s+()-]+$/,
      "Phone number can only contain digits, spaces, and +()-"
    ),
});

type ParentDetailsFormValues = z.infer<typeof parentDetailsSchema>;

interface ParentDetailsProps {
  formData: BookingFormData;
  onNext: (data: Partial<BookingFormData>) => void;
}

export function ParentDetails({ formData, onNext }: ParentDetailsProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ParentDetailsFormValues>({
    resolver: zodResolver(parentDetailsSchema),
    defaultValues: {
      parentName: formData.parentName,
      parentEmail: formData.parentEmail,
      parentPhone: formData.parentPhone,
    },
  });

  // Sync form values to parent as user types (for canProceed validation)
  const watchedValues = watch();
  useEffect(() => {
    onNext(watchedValues);
  }, [watchedValues.parentName, watchedValues.parentEmail, watchedValues.parentPhone]);

  const onSubmit = (data: ParentDetailsFormValues) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-bark">
          Your Details
        </h2>
        <p className="mt-1 text-stone">
          We'll use these details to confirm your booking and send updates.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="parent-details-form">
        {/* Name Field */}
        <div>
          <label
            htmlFor="parentName"
            className="block text-sm font-medium text-stone mb-1.5"
          >
            Full Name
          </label>
          <input
            id="parentName"
            type="text"
            {...register("parentName")}
            className={`
              w-full px-4 py-3 rounded-lg border bg-white font-body text-bark
              transition-all focus:outline-none
              ${
                errors.parentName
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/30"
                  : "border-stone focus:border-forest focus:ring-2 focus:ring-sage/30"
              }
            `}
            placeholder="Enter your full name"
          />
          {errors.parentName && (
            <p className="mt-1.5 text-sm text-error">
              {errors.parentName.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="parentEmail"
            className="block text-sm font-medium text-stone mb-1.5"
          >
            Email Address
          </label>
          <input
            id="parentEmail"
            type="email"
            {...register("parentEmail")}
            className={`
              w-full px-4 py-3 rounded-lg border bg-white font-body text-bark
              transition-all focus:outline-none
              ${
                errors.parentEmail
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/30"
                  : "border-stone focus:border-forest focus:ring-2 focus:ring-sage/30"
              }
            `}
            placeholder="you@example.com"
          />
          {errors.parentEmail && (
            <p className="mt-1.5 text-sm text-error">
              {errors.parentEmail.message}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label
            htmlFor="parentPhone"
            className="block text-sm font-medium text-stone mb-1.5"
          >
            Phone Number
          </label>
          <input
            id="parentPhone"
            type="tel"
            {...register("parentPhone")}
            className={`
              w-full px-4 py-3 rounded-lg border bg-white font-body text-bark
              transition-all focus:outline-none
              ${
                errors.parentPhone
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/30"
                  : "border-stone focus:border-forest focus:ring-2 focus:ring-sage/30"
              }
            `}
            placeholder="07123 456789"
          />
          {errors.parentPhone && (
            <p className="mt-1.5 text-sm text-error">
              {errors.parentPhone.message}
            </p>
          )}
        </div>

        {/* Hidden submit button for form submission */}
        <button type="submit" className="sr-only">
          Submit
        </button>
      </form>

      <p className="text-xs text-pebble">
        Your information is secure and will only be used for booking purposes.
      </p>
    </div>
  );
}
