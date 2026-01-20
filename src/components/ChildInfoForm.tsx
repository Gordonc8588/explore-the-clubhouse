"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Phone, Heart, AlertCircle, Camera, Activity, Stethoscope } from "lucide-react";

const childInfoSchema = z.object({
  // Child Details
  childName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const dob = new Date(date);
      const today = new Date();
      return dob < today;
    }, "Date of birth must be in the past"),

  // Health & Dietary
  allergies: z.string().max(1000, "Allergies text is too long").optional(),
  medicalNotes: z.string().max(1000, "Medical notes text is too long").optional(),

  // Emergency Contact
  emergencyContactName: z
    .string()
    .min(2, "Emergency contact name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  emergencyContactPhone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(
      /^[\d\s+()-]+$/,
      "Phone number can only contain digits, spaces, and +()-"
    ),

  // Consents
  photoConsent: z.boolean(),
  activityConsent: z.boolean().refine((val) => val === true, {
    message: "Activity consent is required to attend the club",
  }),
  medicalConsent: z.boolean().refine((val) => val === true, {
    message: "Medical consent is required to attend the club",
  }),
});

export type ChildInfoFormValues = z.infer<typeof childInfoSchema>;

interface ChildInfoFormProps {
  defaultValues?: Partial<ChildInfoFormValues>;
  onSubmit: (data: ChildInfoFormValues) => void;
  formId?: string;
}

export function ChildInfoForm({
  defaultValues,
  onSubmit,
  formId = "child-info-form",
}: ChildInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChildInfoFormValues>({
    resolver: zodResolver(childInfoSchema),
    defaultValues: {
      childName: "",
      dateOfBirth: "",
      allergies: "",
      medicalNotes: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      photoConsent: false,
      activityConsent: false,
      medicalConsent: false,
      ...defaultValues,
    },
  });

  const inputClassName = (hasError: boolean) => `
    w-full px-4 py-3 rounded-lg border bg-white font-body text-bark
    transition-all focus:outline-none
    ${
      hasError
        ? "border-error focus:border-error focus:ring-2 focus:ring-error/30"
        : "border-stone focus:border-forest focus:ring-2 focus:ring-sage/30"
    }
  `;

  const textareaClassName = (hasError: boolean) => `
    w-full px-4 py-3 rounded-lg border bg-white font-body text-bark
    transition-all focus:outline-none resize-none
    ${
      hasError
        ? "border-error focus:border-error focus:ring-2 focus:ring-error/30"
        : "border-stone focus:border-forest focus:ring-2 focus:ring-sage/30"
    }
  `;

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {/* Child Details Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-sage/30">
          <User className="w-5 h-5 text-forest" />
          <h3 className="font-display text-lg font-semibold text-bark">
            Child Details
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Child Name */}
          <div>
            <label
              htmlFor="childName"
              className="block text-sm font-medium text-stone mb-1.5"
            >
              Child&apos;s Full Name <span className="text-error">*</span>
            </label>
            <input
              id="childName"
              type="text"
              {...register("childName")}
              className={inputClassName(!!errors.childName)}
              placeholder="Enter child's full name"
            />
            {errors.childName && (
              <p className="mt-1.5 text-sm text-error">
                {errors.childName.message}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-stone mb-1.5"
            >
              Date of Birth <span className="text-error">*</span>
            </label>
            <input
              id="dateOfBirth"
              type="date"
              {...register("dateOfBirth")}
              className={inputClassName(!!errors.dateOfBirth)}
              max={new Date().toISOString().split("T")[0]}
            />
            {errors.dateOfBirth && (
              <p className="mt-1.5 text-sm text-error">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Health & Dietary Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-sage/30">
          <Heart className="w-5 h-5 text-forest" />
          <h3 className="font-display text-lg font-semibold text-bark">
            Health & Dietary Information
          </h3>
        </div>

        {/* Allergies */}
        <div>
          <label
            htmlFor="allergies"
            className="block text-sm font-medium text-stone mb-1.5"
          >
            Allergies & Dietary Requirements
          </label>
          <textarea
            id="allergies"
            {...register("allergies")}
            className={textareaClassName(!!errors.allergies)}
            placeholder="Please list any allergies, food intolerances, or dietary requirements (e.g., nut allergy, vegetarian, gluten-free)"
            rows={3}
          />
          {errors.allergies && (
            <p className="mt-1.5 text-sm text-error">
              {errors.allergies.message}
            </p>
          )}
        </div>

        {/* Medical Notes */}
        <div>
          <label
            htmlFor="medicalNotes"
            className="block text-sm font-medium text-stone mb-1.5"
          >
            Medical Notes
          </label>
          <textarea
            id="medicalNotes"
            {...register("medicalNotes")}
            className={textareaClassName(!!errors.medicalNotes)}
            placeholder="Please share any medical conditions, medications, or special needs we should be aware of (e.g., asthma, ADHD, epilepsy)"
            rows={3}
          />
          {errors.medicalNotes && (
            <p className="mt-1.5 text-sm text-error">
              {errors.medicalNotes.message}
            </p>
          )}
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-sage/30">
          <AlertCircle className="w-5 h-5 text-forest" />
          <h3 className="font-display text-lg font-semibold text-bark">
            Emergency Contact
          </h3>
        </div>
        <p className="text-sm text-stone">
          Please provide an alternative contact in case we cannot reach you.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Emergency Contact Name */}
          <div>
            <label
              htmlFor="emergencyContactName"
              className="block text-sm font-medium text-stone mb-1.5"
            >
              Contact Name <span className="text-error">*</span>
            </label>
            <input
              id="emergencyContactName"
              type="text"
              {...register("emergencyContactName")}
              className={inputClassName(!!errors.emergencyContactName)}
              placeholder="Emergency contact's full name"
            />
            {errors.emergencyContactName && (
              <p className="mt-1.5 text-sm text-error">
                {errors.emergencyContactName.message}
              </p>
            )}
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label
              htmlFor="emergencyContactPhone"
              className="block text-sm font-medium text-stone mb-1.5"
            >
              Contact Phone <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pebble" />
              <input
                id="emergencyContactPhone"
                type="tel"
                {...register("emergencyContactPhone")}
                className={`${inputClassName(!!errors.emergencyContactPhone)} pl-10`}
                placeholder="07123 456789"
              />
            </div>
            {errors.emergencyContactPhone && (
              <p className="mt-1.5 text-sm text-error">
                {errors.emergencyContactPhone.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Consents Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-sage/30">
          <Stethoscope className="w-5 h-5 text-forest" />
          <h3 className="font-display text-lg font-semibold text-bark">
            Consents
          </h3>
        </div>
        <p className="text-sm text-stone">
          Please read and confirm your consent for the following.
        </p>

        <div className="space-y-4">
          {/* Photo Consent */}
          <div
            className={`p-4 rounded-xl border ${
              errors.photoConsent ? "border-error bg-error/5" : "border-cloud bg-white"
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("photoConsent")}
                className="mt-1 w-5 h-5 rounded border-stone text-forest focus:ring-forest focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-meadow" />
                  <span className="font-medium text-bark">Photo Consent</span>
                  <span className="text-xs text-pebble">(Optional)</span>
                </div>
                <p className="mt-1 text-sm text-stone">
                  I give permission for photographs and videos of my child to be
                  taken during activities for use on the The Clubhouse
                  website, social media, and promotional materials.
                </p>
              </div>
            </label>
          </div>

          {/* Activity Consent */}
          <div
            className={`p-4 rounded-xl border ${
              errors.activityConsent ? "border-error bg-error/5" : "border-cloud bg-white"
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("activityConsent")}
                className="mt-1 w-5 h-5 rounded border-stone text-forest focus:ring-forest focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-meadow" />
                  <span className="font-medium text-bark">
                    Activity Consent <span className="text-error">*</span>
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone">
                  I give permission for my child to participate in all club
                  activities including water play, cooking activities, and
                  supervised outdoor trips. I understand that all activities are
                  risk-assessed and supervised by trained staff.
                </p>
                {errors.activityConsent && (
                  <p className="mt-2 text-sm text-error">
                    {errors.activityConsent.message}
                  </p>
                )}
              </div>
            </label>
          </div>

          {/* Medical Consent */}
          <div
            className={`p-4 rounded-xl border ${
              errors.medicalConsent ? "border-error bg-error/5" : "border-cloud bg-white"
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("medicalConsent")}
                className="mt-1 w-5 h-5 rounded border-stone text-forest focus:ring-forest focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-meadow" />
                  <span className="font-medium text-bark">
                    Medical Consent <span className="text-error">*</span>
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone">
                  I give permission for trained staff to administer basic first
                  aid to my child if required. In the event of a medical
                  emergency, I authorise staff to seek emergency medical services
                  (including ambulance) and accompany my child to hospital if
                  necessary.
                </p>
                {errors.medicalConsent && (
                  <p className="mt-2 text-sm text-error">
                    {errors.medicalConsent.message}
                  </p>
                )}
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Hidden submit button for form submission */}
      <button type="submit" className="sr-only">
        Submit
      </button>
    </form>
  );
}
