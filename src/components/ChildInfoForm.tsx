"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Phone,
  Heart,
  AlertCircle,
  Camera,
  Activity,
  Stethoscope,
  UserPlus,
  Copy,
  Plus,
  X,
  Trees,
  PawPrint,
  FileText,
} from "lucide-react";

const relationshipOptions = [
  { value: "parent", label: "Parent" },
  { value: "grandparent", label: "Grandparent" },
  { value: "aunt_uncle", label: "Aunt/Uncle" },
  { value: "older_sibling", label: "Older Sibling (18+)" },
  { value: "family_friend", label: "Family Friend" },
  { value: "neighbour", label: "Neighbour" },
  { value: "childminder", label: "Childminder/Nanny" },
  { value: "other", label: "Other" },
];

const phoneRegex = /^[\d\s+()-]+$/;

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
  hasAllergies: z.boolean(),
  allergies: z.string().max(1000, "Allergies text is too long").optional(),
  hasMedicalConditions: z.boolean(),
  medicalNotes: z.string().max(1000, "Medical notes text is too long").optional(),

  // Emergency Contact 1
  emergencyContact1Name: z
    .string()
    .min(2, "Emergency contact name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  emergencyContact1Phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(phoneRegex, "Phone number can only contain digits, spaces, and +()-"),
  emergencyContact1Relationship: z
    .string()
    .min(1, "Please select a relationship"),

  // Emergency Contact 2
  emergencyContact2Name: z
    .string()
    .min(2, "Emergency contact name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  emergencyContact2Phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(phoneRegex, "Phone number can only contain digits, spaces, and +()-"),
  emergencyContact2Relationship: z
    .string()
    .min(1, "Please select a relationship"),

  // Authorized Pickup Persons (optional)
  pickupPerson1Name: z.string().max(100).optional(),
  pickupPerson1Phone: z.string().max(20).optional(),
  pickupPerson1Relationship: z.string().max(50).optional(),
  pickupPerson2Name: z.string().max(100).optional(),
  pickupPerson2Phone: z.string().max(20).optional(),
  pickupPerson2Relationship: z.string().max(50).optional(),
  pickupPerson3Name: z.string().max(100).optional(),
  pickupPerson3Phone: z.string().max(20).optional(),
  pickupPerson3Relationship: z.string().max(50).optional(),

  // Consents
  photoConsent: z.boolean(),
  activityConsent: z.boolean().refine((val) => val === true, {
    message: "Activity consent is required to attend the club",
  }),
  medicalConsent: z.boolean().refine((val) => val === true, {
    message: "Medical consent is required to attend the club",
  }),
  farmAnimalConsent: z.boolean().refine((val) => val === true, {
    message: "Farm animal consent is required to attend the club",
  }),
  woodlandConsent: z.boolean().refine((val) => val === true, {
    message: "Woodland consent is required to attend the club",
  }),

  // Parent Notes
  parentNotes: z.string().max(2000, "Notes must be less than 2000 characters").optional(),
}).refine((data) => {
  if (data.hasAllergies && (!data.allergies || data.allergies.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please provide details about the allergies",
  path: ["allergies"],
}).refine((data) => {
  if (data.hasMedicalConditions && (!data.medicalNotes || data.medicalNotes.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please provide details about the medical conditions",
  path: ["medicalNotes"],
}).refine((data) => {
  // If pickup person 1 has a name, phone should be valid if provided
  if (data.pickupPerson1Name && data.pickupPerson1Phone) {
    return phoneRegex.test(data.pickupPerson1Phone);
  }
  return true;
}, {
  message: "Please enter a valid phone number",
  path: ["pickupPerson1Phone"],
}).refine((data) => {
  if (data.pickupPerson2Name && data.pickupPerson2Phone) {
    return phoneRegex.test(data.pickupPerson2Phone);
  }
  return true;
}, {
  message: "Please enter a valid phone number",
  path: ["pickupPerson2Phone"],
}).refine((data) => {
  if (data.pickupPerson3Name && data.pickupPerson3Phone) {
    return phoneRegex.test(data.pickupPerson3Phone);
  }
  return true;
}, {
  message: "Please enter a valid phone number",
  path: ["pickupPerson3Phone"],
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
  const [visiblePickupSlots, setVisiblePickupSlots] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChildInfoFormValues>({
    resolver: zodResolver(childInfoSchema),
    defaultValues: {
      childName: "",
      dateOfBirth: "",
      hasAllergies: false,
      allergies: "",
      hasMedicalConditions: false,
      medicalNotes: "",
      emergencyContact1Name: "",
      emergencyContact1Phone: "",
      emergencyContact1Relationship: "",
      emergencyContact2Name: "",
      emergencyContact2Phone: "",
      emergencyContact2Relationship: "",
      pickupPerson1Name: "",
      pickupPerson1Phone: "",
      pickupPerson1Relationship: "",
      pickupPerson2Name: "",
      pickupPerson2Phone: "",
      pickupPerson2Relationship: "",
      pickupPerson3Name: "",
      pickupPerson3Phone: "",
      pickupPerson3Relationship: "",
      photoConsent: false,
      activityConsent: false,
      medicalConsent: false,
      farmAnimalConsent: false,
      woodlandConsent: false,
      parentNotes: "",
      ...defaultValues,
    },
  });

  // Watch fields for conditional rendering
  const hasAllergies = watch("hasAllergies");
  const hasMedicalConditions = watch("hasMedicalConditions");

  // Watch emergency contacts for copy functionality
  const ec1Name = watch("emergencyContact1Name");
  const ec1Phone = watch("emergencyContact1Phone");
  const ec1Relationship = watch("emergencyContact1Relationship");
  const ec2Name = watch("emergencyContact2Name");
  const ec2Phone = watch("emergencyContact2Phone");
  const ec2Relationship = watch("emergencyContact2Relationship");

  const isEC1Complete = ec1Name && ec1Phone && ec1Relationship;
  const isEC2Complete = ec2Name && ec2Phone && ec2Relationship;

  const copyFromEmergencyContact = (contactNum: 1 | 2, slot: 1 | 2 | 3) => {
    if (contactNum === 1) {
      setValue(`pickupPerson${slot}Name`, ec1Name);
      setValue(`pickupPerson${slot}Phone`, ec1Phone);
      setValue(`pickupPerson${slot}Relationship`, ec1Relationship);
    } else {
      setValue(`pickupPerson${slot}Name`, ec2Name);
      setValue(`pickupPerson${slot}Phone`, ec2Phone);
      setValue(`pickupPerson${slot}Relationship`, ec2Relationship);
    }
  };

  const addPickupSlot = () => {
    if (visiblePickupSlots < 3) {
      setVisiblePickupSlots(visiblePickupSlots + 1);
    }
  };

  const removePickupSlot = (slot: 1 | 2 | 3) => {
    setValue(`pickupPerson${slot}Name`, "");
    setValue(`pickupPerson${slot}Phone`, "");
    setValue(`pickupPerson${slot}Relationship`, "");
    setVisiblePickupSlots(visiblePickupSlots - 1);
  };

  const inputClassName = (hasError: boolean) => `
    w-full px-4 py-3 rounded-lg border bg-white font-body text-bark
    transition-all focus:outline-none
    ${
      hasError
        ? "border-error focus:border-error focus:ring-2 focus:ring-error/30"
        : "border-stone focus:border-forest focus:ring-2 focus:ring-sage/30"
    }
  `;

  const selectClassName = (hasError: boolean) => `
    w-full px-4 py-3 rounded-lg border bg-white font-body text-bark
    transition-all focus:outline-none appearance-none
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

        {/* Allergies Question */}
        <div>
          <label className="block text-sm font-medium text-stone mb-3">
            Does your child have any allergies or dietary requirements?
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                {...register("hasAllergies", {
                  setValueAs: (v) => v === "true",
                })}
                value="false"
                className="w-4 h-4 border-stone text-forest focus:ring-forest focus:ring-offset-0"
              />
              <span className="text-bark">No</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                {...register("hasAllergies", {
                  setValueAs: (v) => v === "true",
                })}
                value="true"
                className="w-4 h-4 border-stone text-forest focus:ring-forest focus:ring-offset-0"
              />
              <span className="text-bark">Yes</span>
            </label>
          </div>
        </div>

        {/* Allergies Details (conditional) */}
        {hasAllergies === true && (
          <div>
            <label
              htmlFor="allergies"
              className="block text-sm font-medium text-stone mb-1.5"
            >
              Please provide details <span className="text-error">*</span>
            </label>
            <textarea
              id="allergies"
              {...register("allergies")}
              className={textareaClassName(!!errors.allergies)}
              placeholder="e.g., Nuts, Dairy, Gluten, Vegetarian, Vegan"
              rows={3}
            />
            {errors.allergies && (
              <p className="mt-1.5 text-sm text-error">
                {errors.allergies.message}
              </p>
            )}
          </div>
        )}

        {/* Medical Conditions Question */}
        <div>
          <label className="block text-sm font-medium text-stone mb-3">
            Does your child have any medical conditions we should be aware of?
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                {...register("hasMedicalConditions", {
                  setValueAs: (v) => v === "true",
                })}
                value="false"
                className="w-4 h-4 border-stone text-forest focus:ring-forest focus:ring-offset-0"
              />
              <span className="text-bark">No</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                {...register("hasMedicalConditions", {
                  setValueAs: (v) => v === "true",
                })}
                value="true"
                className="w-4 h-4 border-stone text-forest focus:ring-forest focus:ring-offset-0"
              />
              <span className="text-bark">Yes</span>
            </label>
          </div>
        </div>

        {/* Medical Notes Details (conditional) */}
        {hasMedicalConditions === true && (
          <div>
            <label
              htmlFor="medicalNotes"
              className="block text-sm font-medium text-stone mb-1.5"
            >
              Please provide details <span className="text-error">*</span>
            </label>
            <textarea
              id="medicalNotes"
              {...register("medicalNotes")}
              className={textareaClassName(!!errors.medicalNotes)}
              placeholder="e.g., Asthma, Diabetes, EpiPen required, ADHD"
              rows={3}
            />
            {errors.medicalNotes && (
              <p className="mt-1.5 text-sm text-error">
                {errors.medicalNotes.message}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Emergency Contacts Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-sage/30">
          <AlertCircle className="w-5 h-5 text-forest" />
          <h3 className="font-display text-lg font-semibold text-bark">
            Emergency Contacts
          </h3>
        </div>
        <p className="text-sm text-stone">
          Please provide two emergency contacts who can be reached if we cannot contact you.
        </p>

        {/* Emergency Contact 1 */}
        <div className="p-4 rounded-xl border border-cloud bg-cloud/30">
          <h4 className="font-medium text-bark mb-3">Emergency Contact 1</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="emergencyContact1Name"
                className="block text-sm font-medium text-stone mb-1.5"
              >
                Name <span className="text-error">*</span>
              </label>
              <input
                id="emergencyContact1Name"
                type="text"
                {...register("emergencyContact1Name")}
                className={inputClassName(!!errors.emergencyContact1Name)}
                placeholder="Full name"
              />
              {errors.emergencyContact1Name && (
                <p className="mt-1.5 text-sm text-error">
                  {errors.emergencyContact1Name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="emergencyContact1Phone"
                className="block text-sm font-medium text-stone mb-1.5"
              >
                Phone <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pebble" />
                <input
                  id="emergencyContact1Phone"
                  type="tel"
                  {...register("emergencyContact1Phone")}
                  className={`${inputClassName(!!errors.emergencyContact1Phone)} pl-10`}
                  placeholder="07123 456789"
                />
              </div>
              {errors.emergencyContact1Phone && (
                <p className="mt-1.5 text-sm text-error">
                  {errors.emergencyContact1Phone.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="emergencyContact1Relationship"
                className="block text-sm font-medium text-stone mb-1.5"
              >
                Relationship <span className="text-error">*</span>
              </label>
              <select
                id="emergencyContact1Relationship"
                {...register("emergencyContact1Relationship")}
                className={selectClassName(!!errors.emergencyContact1Relationship)}
              >
                <option value="">Select relationship</option>
                {relationshipOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.emergencyContact1Relationship && (
                <p className="mt-1.5 text-sm text-error">
                  {errors.emergencyContact1Relationship.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact 2 */}
        <div className="p-4 rounded-xl border border-cloud bg-cloud/30">
          <h4 className="font-medium text-bark mb-3">Emergency Contact 2</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="emergencyContact2Name"
                className="block text-sm font-medium text-stone mb-1.5"
              >
                Name <span className="text-error">*</span>
              </label>
              <input
                id="emergencyContact2Name"
                type="text"
                {...register("emergencyContact2Name")}
                className={inputClassName(!!errors.emergencyContact2Name)}
                placeholder="Full name"
              />
              {errors.emergencyContact2Name && (
                <p className="mt-1.5 text-sm text-error">
                  {errors.emergencyContact2Name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="emergencyContact2Phone"
                className="block text-sm font-medium text-stone mb-1.5"
              >
                Phone <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pebble" />
                <input
                  id="emergencyContact2Phone"
                  type="tel"
                  {...register("emergencyContact2Phone")}
                  className={`${inputClassName(!!errors.emergencyContact2Phone)} pl-10`}
                  placeholder="07123 456789"
                />
              </div>
              {errors.emergencyContact2Phone && (
                <p className="mt-1.5 text-sm text-error">
                  {errors.emergencyContact2Phone.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="emergencyContact2Relationship"
                className="block text-sm font-medium text-stone mb-1.5"
              >
                Relationship <span className="text-error">*</span>
              </label>
              <select
                id="emergencyContact2Relationship"
                {...register("emergencyContact2Relationship")}
                className={selectClassName(!!errors.emergencyContact2Relationship)}
              >
                <option value="">Select relationship</option>
                {relationshipOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.emergencyContact2Relationship && (
                <p className="mt-1.5 text-sm text-error">
                  {errors.emergencyContact2Relationship.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Authorized Pickup Persons Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-sage/30">
          <UserPlus className="w-5 h-5 text-forest" />
          <h3 className="font-display text-lg font-semibold text-bark">
            Authorized Pickup Persons
          </h3>
        </div>
        <p className="text-sm text-stone">
          Who else is authorized to collect your child? Leave blank if only the booking parent.
        </p>

        {/* Copy buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (visiblePickupSlots === 0) setVisiblePickupSlots(1);
              copyFromEmergencyContact(1, (visiblePickupSlots || 1) as 1 | 2 | 3);
            }}
            disabled={!isEC1Complete}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-sage/50 bg-white text-forest hover:bg-sage/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy from Emergency Contact 1
          </button>
          <button
            type="button"
            onClick={() => {
              if (visiblePickupSlots === 0) setVisiblePickupSlots(1);
              copyFromEmergencyContact(2, (visiblePickupSlots || 1) as 1 | 2 | 3);
            }}
            disabled={!isEC2Complete}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-sage/50 bg-white text-forest hover:bg-sage/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy from Emergency Contact 2
          </button>
        </div>

        {/* Pickup Person Slots */}
        {[1, 2, 3].map((slot) => {
          if (slot > visiblePickupSlots) return null;
          return (
            <div key={slot} className="p-4 rounded-xl border border-cloud bg-cloud/30 relative">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-bark">Pickup Person {slot}</h4>
                <button
                  type="button"
                  onClick={() => removePickupSlot(slot as 1 | 2 | 3)}
                  className="p-1 text-stone hover:text-error transition-colors"
                  aria-label="Remove pickup person"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor={`pickupPerson${slot}Name`}
                    className="block text-sm font-medium text-stone mb-1.5"
                  >
                    Name
                  </label>
                  <input
                    id={`pickupPerson${slot}Name`}
                    type="text"
                    {...register(`pickupPerson${slot}Name` as keyof ChildInfoFormValues)}
                    className={inputClassName(false)}
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`pickupPerson${slot}Phone`}
                    className="block text-sm font-medium text-stone mb-1.5"
                  >
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pebble" />
                    <input
                      id={`pickupPerson${slot}Phone`}
                      type="tel"
                      {...register(`pickupPerson${slot}Phone` as keyof ChildInfoFormValues)}
                      className={`${inputClassName(false)} pl-10`}
                      placeholder="07123 456789"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`pickupPerson${slot}Relationship`}
                    className="block text-sm font-medium text-stone mb-1.5"
                  >
                    Relationship
                  </label>
                  <select
                    id={`pickupPerson${slot}Relationship`}
                    {...register(`pickupPerson${slot}Relationship` as keyof ChildInfoFormValues)}
                    className={selectClassName(false)}
                  >
                    <option value="">Select relationship</option>
                    {relationshipOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}

        {visiblePickupSlots < 3 && (
          <button
            type="button"
            onClick={addPickupSlot}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border-2 border-dashed border-sage/50 text-forest hover:bg-sage/10 transition-colors w-full justify-center"
          >
            <Plus className="w-4 h-4" />
            Add {visiblePickupSlots === 0 ? "a" : "Another"} Pickup Person
          </button>
        )}
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

          {/* Farm Animal Consent */}
          <div
            className={`p-4 rounded-xl border ${
              errors.farmAnimalConsent ? "border-error bg-error/5" : "border-cloud bg-white"
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("farmAnimalConsent")}
                className="mt-1 w-5 h-5 rounded border-stone text-forest focus:ring-forest focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-meadow" />
                  <span className="font-medium text-bark">
                    Farm Animal Consent <span className="text-error">*</span>
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone">
                  I give permission for my child to interact with farm animals
                  under supervision. I understand that proper hand washing
                  facilities are provided and children will be supervised at all
                  times when around animals. I have informed staff of any animal
                  allergies.
                </p>
                {errors.farmAnimalConsent && (
                  <p className="mt-2 text-sm text-error">
                    {errors.farmAnimalConsent.message}
                  </p>
                )}
              </div>
            </label>
          </div>

          {/* Woodland Consent */}
          <div
            className={`p-4 rounded-xl border ${
              errors.woodlandConsent ? "border-error bg-error/5" : "border-cloud bg-white"
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("woodlandConsent")}
                className="mt-1 w-5 h-5 rounded border-stone text-forest focus:ring-forest focus:ring-offset-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Trees className="w-4 h-4 text-meadow" />
                  <span className="font-medium text-bark">
                    Woodland Consent <span className="text-error">*</span>
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone">
                  I give permission for my child to participate in woodland
                  exploration activities including forest walks, nature trails,
                  and outdoor learning. I understand these activities are
                  risk-assessed and supervised by trained staff. Appropriate
                  clothing and footwear is required.
                </p>
                {errors.woodlandConsent && (
                  <p className="mt-2 text-sm text-error">
                    {errors.woodlandConsent.message}
                  </p>
                )}
              </div>
            </label>
          </div>
        </div>
      </section>

      {/* Additional Information Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-sage/30">
          <FileText className="w-5 h-5 text-forest" />
          <h3 className="font-display text-lg font-semibold text-bark">
            Additional Information
          </h3>
        </div>
        <p className="text-sm text-stone">
          Is there anything else we should know about your child?
        </p>

        <div>
          <label
            htmlFor="parentNotes"
            className="block text-sm font-medium text-stone mb-1.5"
          >
            Parent Notes <span className="text-pebble">(Optional)</span>
          </label>
          <textarea
            id="parentNotes"
            {...register("parentNotes")}
            className={textareaClassName(!!errors.parentNotes)}
            placeholder="Any concerns, behavioral notes, special needs, or other information that would help our staff care for your child..."
            rows={4}
            maxLength={2000}
          />
          <p className="mt-1 text-xs text-pebble">
            Maximum 2000 characters
          </p>
          {errors.parentNotes && (
            <p className="mt-1.5 text-sm text-error">
              {errors.parentNotes.message}
            </p>
          )}
        </div>
      </section>

      {/* Hidden submit button for form submission */}
      <button type="submit" className="sr-only">
        Submit
      </button>
    </form>
  );
}
