"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ClubData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  morning_start: string | null;
  morning_end: string | null;
  afternoon_start: string | null;
  afternoon_end: string | null;
  min_age: number;
  max_age: number;
  is_active: boolean;
  club_days: Array<{
    id: string;
    date: string;
    morning_capacity: number;
    afternoon_capacity: number;
    is_available: boolean;
  }>;
  booking_options: Array<{
    id: string;
    name: string;
    description: string | null;
    option_type: string;
    time_slot: string;
    price_per_child: number;
    sort_order: number;
    is_active: boolean;
  }>;
}

interface ClubEditFormProps {
  clubId: string;
  initialData: ClubData | null;
  isNew: boolean;
}

interface DayFormData {
  id?: string;
  date: string;
  dayName: string;
  morningCapacity: number;
  afternoonCapacity: number;
  isSkipped: boolean;
}

interface BookingOptionFormData {
  id?: string;
  name: string;
  description: string;
  optionType: string;
  timeSlot: string;
  pricePerChild: number;
  sortOrder: number;
  isActive: boolean;
}

interface ClubFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  hasMorningSessions: boolean;
  hasAfternoonSessions: boolean;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  minAge: number;
  maxAge: number;
  isActive: boolean;
  days: DayFormData[];
  bookingOptions: BookingOptionFormData[];
}

function getDayName(date: Date): string {
  return date.toLocaleDateString("en-GB", { weekday: "long" });
}

function generateDaysFromDateRange(
  startDate: string,
  endDate: string,
  existingDays?: DayFormData[]
): DayFormData[] {
  if (!startDate || !endDate) return [];

  const days: DayFormData[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > end) return [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const existingDay = existingDays?.find((day) => day.date === dateStr);

    days.push({
      id: existingDay?.id,
      date: dateStr,
      dayName: getDayName(d),
      morningCapacity: existingDay?.morningCapacity ?? 20,
      afternoonCapacity: existingDay?.afternoonCapacity ?? 20,
      isSkipped: existingDay?.isSkipped ?? isWeekend,
    });
  }

  return days;
}

function formatPrice(priceInPence: number): string {
  return (priceInPence / 100).toFixed(2);
}

const optionTypeLabels: Record<string, string> = {
  full_week: "Full Week",
  single_day: "Single Day",
  multi_day: "Multiple Days",
};

const timeSlotLabels: Record<string, string> = {
  full_day: "Full Day",
  morning: "Morning Only",
  afternoon: "Afternoon Only",
};

export function ClubEditForm({ clubId, initialData, isNew }: ClubEditFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showDaysSection, setShowDaysSection] = useState(true);
  const [showOptionsSection, setShowOptionsSection] = useState(true);

  const defaultBookingOptions: BookingOptionFormData[] = [
    {
      name: "Full Week (Full Day)",
      description: "All days, full day sessions",
      optionType: "full_week",
      timeSlot: "full_day",
      pricePerChild: 15000,
      sortOrder: 1,
      isActive: true,
    },
    {
      name: "Single Day (Full Day)",
      description: "Choose any available day",
      optionType: "single_day",
      timeSlot: "full_day",
      pricePerChild: 3500,
      sortOrder: 2,
      isActive: true,
    },
  ];

  // Transform initial data if exists
  const getDefaultValues = (): ClubFormData => {
    if (initialData) {
      const existingDays = initialData.club_days?.map((d) => ({
        id: d.id,
        date: d.date,
        dayName: getDayName(new Date(d.date)),
        morningCapacity: d.morning_capacity,
        afternoonCapacity: d.afternoon_capacity,
        isSkipped: !d.is_available,
      })) || [];

      const days = generateDaysFromDateRange(
        initialData.start_date,
        initialData.end_date,
        existingDays
      );

      const options = initialData.booking_options?.map((o) => ({
        id: o.id,
        name: o.name,
        description: o.description || "",
        optionType: o.option_type,
        timeSlot: o.time_slot,
        pricePerChild: o.price_per_child,
        sortOrder: o.sort_order,
        isActive: o.is_active,
      })) || [];

      return {
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || "",
        imageUrl: initialData.image_url || "",
        startDate: initialData.start_date,
        endDate: initialData.end_date,
        hasMorningSessions: initialData.morning_start !== null,
        hasAfternoonSessions: initialData.afternoon_start !== null,
        morningStart: initialData.morning_start?.slice(0, 5) || "08:30",
        morningEnd: initialData.morning_end?.slice(0, 5) || "12:00",
        afternoonStart: initialData.afternoon_start?.slice(0, 5) || "12:00",
        afternoonEnd: initialData.afternoon_end?.slice(0, 5) || "15:30",
        minAge: initialData.min_age,
        maxAge: initialData.max_age,
        isActive: initialData.is_active,
        days,
        bookingOptions: options.length > 0 ? options : defaultBookingOptions,
      };
    }

    return {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      startDate: "",
      endDate: "",
      hasMorningSessions: true,
      hasAfternoonSessions: true,
      morningStart: "08:30",
      morningEnd: "12:00",
      afternoonStart: "12:00",
      afternoonEnd: "15:30",
      minAge: 5,
      maxAge: 11,
      isActive: true,
      days: [],
      bookingOptions: defaultBookingOptions,
    };
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ClubFormData>({
    defaultValues: getDefaultValues(),
  });

  const {
    fields: dayFields,
    replace: replaceDays,
  } = useFieldArray({
    control,
    name: "days",
  });

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: "bookingOptions",
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const name = watch("name");
  const hasMorningSessions = watch("hasMorningSessions");
  const hasAfternoonSessions = watch("hasAfternoonSessions");

  // Auto-generate days when dates change
  const regenerateDays = useCallback(() => {
    if (startDate && endDate) {
      const currentDays = dayFields.map((field) => ({
        id: field.id,
        date: field.date,
        dayName: field.dayName,
        morningCapacity: field.morningCapacity,
        afternoonCapacity: field.afternoonCapacity,
        isSkipped: field.isSkipped,
      }));
      const newDays = generateDaysFromDateRange(startDate, endDate, currentDays);
      replaceDays(newDays);
    }
  }, [startDate, endDate, dayFields, replaceDays]);

  useEffect(() => {
    regenerateDays();
  }, [startDate, endDate]);

  // Auto-generate slug from name
  useEffect(() => {
    if (isNew && name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [name, isNew, setValue]);

  const onSubmit = async (data: ClubFormData) => {
    if (!data.hasMorningSessions && !data.hasAfternoonSessions) {
      alert("At least one session type (Morning or Afternoon) must be enabled.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: isNew ? undefined : clubId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        startDate: data.startDate,
        endDate: data.endDate,
        morningStart: data.hasMorningSessions ? data.morningStart : null,
        morningEnd: data.hasMorningSessions ? data.morningEnd : null,
        afternoonStart: data.hasAfternoonSessions ? data.afternoonStart : null,
        afternoonEnd: data.hasAfternoonSessions ? data.afternoonEnd : null,
        minAge: data.minAge,
        maxAge: data.maxAge,
        isActive: data.isActive,
        days: data.days,
        bookingOptions: data.bookingOptions,
      };

      const response = await fetch("/api/admin/clubs", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save club");
      }

      router.push("/admin/clubs");
      router.refresh();
    } catch (error) {
      console.error("Error saving club:", error);
      alert(error instanceof Error ? error.message : "Failed to save club");
    } finally {
      setIsSaving(false);
    }
  };

  const addBookingOption = () => {
    appendOption({
      name: "",
      description: "",
      optionType: "single_day",
      timeSlot: "full_day",
      pricePerChild: 3500,
      sortOrder: optionFields.length + 1,
      isActive: true,
    });
  };

  const setAllDaysCapacity = (field: "morningCapacity" | "afternoonCapacity", value: number) => {
    dayFields.forEach((_, index) => {
      setValue(`days.${index}.${field}`, value);
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
        style={{ color: "var(--craigies-dark-olive)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clubs
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              {isNew ? "Create New Club" : "Edit Club"}
            </h2>
            <p className="mt-1" style={{ color: "var(--craigies-dark-olive)" }}>
              {isNew
                ? "Set up a new holiday club session"
                : "Update club details and settings"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 px-6 py-3 font-semibold transition-opacity hover:opacity-80"
              style={{
                borderColor: "var(--craigies-dark-olive)",
                color: "var(--craigies-dark-olive)",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              <X className="h-5 w-5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: "var(--craigies-burnt-orange)",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              <Save className="h-5 w-5" />
              {isSaving ? "Saving..." : "Save Club"}
            </button>
          </div>
        </div>

        {/* Club Details Section */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3
            className="flex items-center gap-2 text-lg font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            <Calendar className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
            Club Details
          </h3>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {/* Name */}
            <div className="sm:col-span-2">
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Club Name *
              </label>
              <input
                type="text"
                {...register("name", { required: "Club name is required" })}
                className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--craigies-burnt-orange)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="e.g., Easter Holiday Club 2025"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div className="sm:col-span-2">
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                URL Slug *
              </label>
              <input
                type="text"
                {...register("slug", { required: "Slug is required" })}
                className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--craigies-burnt-orange)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="e.g., easter-2025"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.slug.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--craigies-burnt-orange)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="Describe the club activities and what children can expect..."
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image URL
                </div>
              </label>
              <input
                type="url"
                {...register("imageUrl")}
                className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--craigies-burnt-orange)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Start Date */}
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Start Date *
              </label>
              <input
                type="date"
                {...register("startDate", { required: "Start date is required" })}
                className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--craigies-burnt-orange)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                End Date *
              </label>
              <input
                type="date"
                {...register("endDate", { required: "End date is required" })}
                className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--craigies-burnt-orange)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Session Times Section */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3 className="flex items-center gap-2 text-lg font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}>
            <Clock className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
            Session Times
          </h3>

          <div className="mt-6 space-y-6">
            {/* Morning Session */}
            <div>
              <label className="flex cursor-pointer items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  {...register("hasMorningSessions")}
                  className="h-5 w-5 rounded"
                  style={{
                    borderColor: "#D1D5DB",
                    color: "var(--craigies-olive)",
                  }}
                />
                <span className="font-medium"
                  style={{ color: "var(--craigies-dark-olive)" }}>
                  Morning Session
                </span>
              </label>
              {hasMorningSessions && (
                <div className="grid gap-6 sm:grid-cols-2 pl-8">
                  <div>
                    <label className="mb-2 block text-sm font-medium"
                      style={{ color: "var(--craigies-dark-olive)" }}>
                      Morning Start
                    </label>
                    <input
                      type="time"
                      {...register("morningStart")}
                      className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#D1D5DB",
                        color: "var(--craigies-dark-olive)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--craigies-burnt-orange)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#D1D5DB";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium"
                      style={{ color: "var(--craigies-dark-olive)" }}>
                      Morning End
                    </label>
                    <input
                      type="time"
                      {...register("morningEnd")}
                      className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#D1D5DB",
                        color: "var(--craigies-dark-olive)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--craigies-burnt-orange)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#D1D5DB";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Afternoon Session */}
            <div>
              <label className="flex cursor-pointer items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  {...register("hasAfternoonSessions")}
                  className="h-5 w-5 rounded"
                  style={{
                    borderColor: "#D1D5DB",
                    color: "var(--craigies-olive)",
                  }}
                />
                <span className="font-medium"
                  style={{ color: "var(--craigies-dark-olive)" }}>
                  Afternoon Session
                </span>
              </label>
              {hasAfternoonSessions && (
                <div className="grid gap-6 sm:grid-cols-2 pl-8">
                  <div>
                    <label className="mb-2 block text-sm font-medium"
                      style={{ color: "var(--craigies-dark-olive)" }}>
                      Afternoon Start
                    </label>
                    <input
                      type="time"
                      {...register("afternoonStart")}
                      className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#D1D5DB",
                        color: "var(--craigies-dark-olive)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--craigies-burnt-orange)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#D1D5DB";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium"
                      style={{ color: "var(--craigies-dark-olive)" }}>
                      Afternoon End
                    </label>
                    <input
                      type="time"
                      {...register("afternoonEnd")}
                      className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#D1D5DB",
                        color: "var(--craigies-dark-olive)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--craigies-burnt-orange)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#D1D5DB";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Age Range Section */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3 className="flex items-center gap-2 text-lg font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}>
            <Users className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
            Age Range
          </h3>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}>
                Minimum Age
              </label>
              <input
                type="number"
                min="3"
                max="18"
                {...register("minAge", { valueAsNumber: true })}
                className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--craigies-burnt-orange)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}>
                Maximum Age
              </label>
              <input
                type="number"
                min="3"
                max="18"
                {...register("maxAge", { valueAsNumber: true })}
                className="w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--craigies-burnt-orange)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div className="flex items-end sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="h-5 w-5 rounded"
                  style={{
                    borderColor: "#D1D5DB",
                    color: "var(--craigies-olive)",
                  }}
                />
                <span className="font-medium"
                          style={{ color: "var(--craigies-dark-olive)" }}>
                  Club is active and visible to parents
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Days Section */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <button
            type="button"
            onClick={() => setShowDaysSection(!showDaysSection)}
            className="flex w-full items-center justify-between"
          >
            <h3 className="flex items-center gap-2 text-lg font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}>
              <Calendar className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
              Club Days ({dayFields.filter((d) => !d.isSkipped).length} active)
            </h3>
            {showDaysSection ? (
              <ChevronUp className="h-5 w-5 text-stone" />
            ) : (
              <ChevronDown className="h-5 w-5 text-stone" />
            )}
          </button>

          {showDaysSection && (
            <>
              {dayFields.length === 0 ? (
                <p className="mt-4 font-body text-stone">
                  Set start and end dates to generate club days.
                </p>
              ) : (
                <>
                  {/* Bulk capacity controls */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-cloud/50 p-4">
                    <span className="text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}>
                      Set all capacities:
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-sm"
                style={{ color: "var(--craigies-dark-olive)" }}>Morning:</label>
                      <input
                        type="number"
                        min="0"
                        defaultValue={20}
                        className="w-20 rounded-lg border px-3 py-1.5 focus:outline-none"
                        style={{
                          borderColor: "#D1D5DB",
                          color: "var(--craigies-dark-olive)",
                        }}
                        onBlur={(e) =>
                          setAllDaysCapacity("morningCapacity", parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm"
                style={{ color: "var(--craigies-dark-olive)" }}>Afternoon:</label>
                      <input
                        type="number"
                        min="0"
                        defaultValue={20}
                        className="w-20 rounded-lg border px-3 py-1.5 focus:outline-none"
                        style={{
                          borderColor: "#D1D5DB",
                          color: "var(--craigies-dark-olive)",
                        }}
                        onBlur={(e) =>
                          setAllDaysCapacity("afternoonCapacity", parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="hidden items-center gap-4 border-b border-cloud pb-2 text-sm font-medium sm:flex"
                      style={{ color: "var(--craigies-dark-olive)" }}>
                      <div className="w-8"></div>
                      <div className="w-28">Day</div>
                      <div className="flex-1">Date</div>
                      <div className="w-28 text-center">Morning</div>
                      <div className="w-28 text-center">Afternoon</div>
                    </div>

                    {dayFields.map((field, index) => (
                      <div
                        key={field.id}
                        className={`flex flex-wrap items-center gap-4 rounded-lg px-2 py-3 sm:flex-nowrap ${
                          field.isSkipped ? "bg-cloud/30 opacity-60" : "bg-cloud/50"
                        }`}
                      >
                        <div className="w-8">
                          <input
                            type="checkbox"
                            {...register(`days.${index}.isSkipped`)}
                            className="h-5 w-5 rounded border-stone/30 text-red-500 focus:ring-red-200"
                            title="Skip this day"
                          />
                        </div>
                        <div className="w-28 font-body font-medium text-bark">
                          {field.dayName}
                        </div>
                        <div className="flex-1"
                          style={{ color: "var(--craigies-dark-olive)" }}>
                          {new Date(field.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex w-full items-center gap-2 sm:w-28 sm:justify-center">
                          <span className="text-xs sm:hidden"
                          style={{ color: "var(--craigies-dark-olive)" }}>
                            AM:
                          </span>
                          <input
                            type="number"
                            min="0"
                            {...register(`days.${index}.morningCapacity`, {
                              valueAsNumber: true,
                            })}
                            disabled={field.isSkipped}
                            className="w-16 rounded-lg border px-2 py-1.5 text-center disabled:bg-cloud focus:outline-none"
                            style={{
                              borderColor: "#D1D5DB",
                              color: "var(--craigies-dark-olive)",
                            }}
                          />
                        </div>
                        <div className="flex w-full items-center gap-2 sm:w-28 sm:justify-center">
                          <span className="text-xs sm:hidden"
                          style={{ color: "var(--craigies-dark-olive)" }}>
                            PM:
                          </span>
                          <input
                            type="number"
                            min="0"
                            {...register(`days.${index}.afternoonCapacity`, {
                              valueAsNumber: true,
                            })}
                            disabled={field.isSkipped}
                            className="w-16 rounded-lg border px-2 py-1.5 text-center disabled:bg-cloud focus:outline-none"
                            style={{
                              borderColor: "#D1D5DB",
                              color: "var(--craigies-dark-olive)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-sm"
                  style={{ color: "var(--craigies-dark-olive)" }}>
                    Check the box to skip specific days (e.g., weekends or bank holidays).
                    Weekends are skipped by default.
                  </p>
                </>
              )}
            </>
          )}
        </div>

        {/* Booking Options Section */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <button
            type="button"
            onClick={() => setShowOptionsSection(!showOptionsSection)}
            className="flex w-full items-center justify-between"
          >
            <h3 className="flex items-center gap-2 text-lg font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}>
              <Users className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
              Booking Options ({optionFields.length})
            </h3>
            {showOptionsSection ? (
              <ChevronUp className="h-5 w-5 text-stone" />
            ) : (
              <ChevronDown className="h-5 w-5 text-stone" />
            )}
          </button>

          {showOptionsSection && (
            <>
              <div className="mt-4 space-y-4">
                {optionFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-xl border border-cloud bg-cloud/30 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          {/* Option Name */}
                          <div>
                            <label className="mb-1 block font-body text-sm font-medium text-stone">
                              Option Name *
                            </label>
                            <input
                              type="text"
                              {...register(`bookingOptions.${index}.name`, {
                                required: true,
                              })}
                              className="w-full rounded-lg border border-stone/30 px-3 py-2 font-body text-bark transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
                              placeholder="e.g., Full Week"
                            />
                          </div>

                          {/* Price */}
                          <div>
                            <label className="mb-1 block font-body text-sm font-medium text-stone">
                              Price (£)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              {...register(`bookingOptions.${index}.pricePerChild`, {
                                valueAsNumber: true,
                                setValueAs: (v) => Math.round(parseFloat(v) * 100) || 0,
                              })}
                              defaultValue={formatPrice(field.pricePerChild)}
                              className="w-full rounded-lg border border-stone/30 px-3 py-2 font-body text-bark transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
                              placeholder="35.00"
                            />
                          </div>

                          {/* Option Type */}
                          <div>
                            <label className="mb-1 block font-body text-sm font-medium text-stone">
                              Option Type
                            </label>
                            <select
                              {...register(`bookingOptions.${index}.optionType`)}
                              className="w-full rounded-lg border border-stone/30 px-3 py-2 font-body text-bark transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
                            >
                              {Object.entries(optionTypeLabels).map(([type, label]) => (
                                <option key={type} value={type}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Time Slot */}
                          <div>
                            <label className="mb-1 block font-body text-sm font-medium text-stone">
                              Time Slot
                            </label>
                            <select
                              {...register(`bookingOptions.${index}.timeSlot`)}
                              className="w-full rounded-lg border border-stone/30 px-3 py-2 font-body text-bark transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
                            >
                              {Object.entries(timeSlotLabels).map(([slot, label]) => (
                                <option key={slot} value={slot}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="mb-1 block font-body text-sm font-medium text-stone">
                            Description
                          </label>
                          <input
                            type="text"
                            {...register(`bookingOptions.${index}.description`)}
                            className="w-full rounded-lg border border-stone/30 px-3 py-2 font-body text-bark transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
                            placeholder="Brief description of this option..."
                          />
                        </div>

                        {/* Active toggle and sort order */}
                        <div className="flex flex-wrap items-center gap-6">
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              {...register(`bookingOptions.${index}.isActive`)}
                              className="h-4 w-4 rounded"
                              style={{
                                borderColor: "#D1D5DB",
                                color: "var(--craigies-olive)",
                              }}
                            />
                            <span className="text-sm"
                            style={{ color: "var(--craigies-dark-olive)" }}>Active</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <label className="text-sm"
                style={{ color: "var(--craigies-dark-olive)" }}>
                              Sort Order:
                            </label>
                            <input
                              type="number"
                              min="0"
                              {...register(`bookingOptions.${index}.sortOrder`, {
                                valueAsNumber: true,
                              })}
                              className="w-16 rounded-lg border border-stone/30 px-2 py-1 text-center font-body text-bark focus:border-forest focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="rounded-lg p-2 text-stone transition-colors hover:bg-red-100 hover:text-red-500"
                        title="Remove option"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addBookingOption}
                className="mt-4 flex items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 font-semibold transition-opacity hover:opacity-80"
                style={{
                  borderColor: "rgba(122, 124, 74, 0.5)",
                  color: "var(--craigies-olive)",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                <Plus className="h-5 w-5" />
                Add Booking Option
              </button>
            </>
          )}
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end gap-3 rounded-2xl bg-white p-6 shadow-md">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 px-6 py-3 font-semibold transition-opacity hover:opacity-80"
            style={{
              borderColor: "var(--craigies-dark-olive)",
              color: "var(--craigies-dark-olive)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            <X className="h-5 w-5" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: "var(--craigies-burnt-orange)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            <Save className="h-5 w-5" />
            {isSaving ? "Saving..." : "Save Club"}
          </button>
        </div>
      </form>
    </div>
  );
}
