"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  CreditCard,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Check,
  CalendarPlus,
  Info,
} from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import type { Booking, BookingOption, Club, Child, ClubDay } from "@/types/database";

// Mock data for existing bookings
const mockBookingsWithDetails: Record<
  string,
  {
    booking: Booking;
    bookingOption: BookingOption;
    club: Club;
    children: Child[];
    bookedDays: string[]; // Array of dates already booked (YYYY-MM-DD)
    allClubDays: ClubDay[]; // All days for the club
  }
> = {
  "booking-123": {
    booking: {
      id: "booking-123",
      club_id: "club-easter-2025",
      booking_option_id: "club-easter-2025-option-single-day-full-day",
      parent_name: "Jane Smith",
      parent_email: "jane@example.com",
      parent_phone: "07123456789",
      num_children: 2,
      total_amount: 7000, // £70 (2 children × £35 single day)
      status: "complete",
      promo_code_id: null,
      stripe_payment_intent_id: "pi_mock_123",
      stripe_checkout_session_id: "cs_mock_123",
      created_at: "2025-01-15T10:00:00Z",
    },
    bookingOption: {
      id: "club-easter-2025-option-single-day-full-day",
      club_id: "club-easter-2025",
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
    children: [
      {
        id: "child-1",
        booking_id: "booking-123",
        name: "Emma Smith",
        date_of_birth: "2017-03-22",
        allergies: "None",
        medical_notes: "",
        emergency_contact_name: "John Smith",
        emergency_contact_phone: "07111222333",
        photo_consent: true,
        activity_consent: true,
        medical_consent: true,
        created_at: "2025-01-15T10:30:00Z",
      },
      {
        id: "child-2",
        booking_id: "booking-123",
        name: "Oliver Smith",
        date_of_birth: "2019-08-10",
        allergies: "Peanuts",
        medical_notes: "Carries EpiPen",
        emergency_contact_name: "John Smith",
        emergency_contact_phone: "07111222333",
        photo_consent: true,
        activity_consent: true,
        medical_consent: true,
        created_at: "2025-01-15T10:30:00Z",
      },
    ],
    bookedDays: ["2025-04-09"], // Wednesday already booked
    allClubDays: [
      { id: "day-1", club_id: "club-easter-2025", date: "2025-04-07", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-2", club_id: "club-easter-2025", date: "2025-04-08", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-3", club_id: "club-easter-2025", date: "2025-04-09", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-4", club_id: "club-easter-2025", date: "2025-04-10", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-5", club_id: "club-easter-2025", date: "2025-04-11", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-6", club_id: "club-easter-2025", date: "2025-04-14", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-7", club_id: "club-easter-2025", date: "2025-04-15", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-8", club_id: "club-easter-2025", date: "2025-04-16", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-9", club_id: "club-easter-2025", date: "2025-04-17", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
    ],
  },
  "booking-456": {
    booking: {
      id: "booking-456",
      club_id: "club-summer-week1-2025",
      booking_option_id: "club-summer-week1-2025-option-multi-day-full-day",
      parent_name: "John Doe",
      parent_email: "john@example.com",
      parent_phone: "07987654321",
      num_children: 1,
      total_amount: 7000, // £70 (1 child × £35 × 2 days)
      status: "complete",
      promo_code_id: null,
      stripe_payment_intent_id: "pi_mock_456",
      stripe_checkout_session_id: "cs_mock_456",
      created_at: "2025-01-16T10:00:00Z",
    },
    bookingOption: {
      id: "club-summer-week1-2025-option-multi-day-full-day",
      club_id: "club-summer-week1-2025",
      name: "Multiple Days (Full Day)",
      description: "Choose 2+ days, 8:30am - 3:30pm. Price per day.",
      option_type: "multi_day",
      time_slot: "full_day",
      price_per_child: 3500,
      sort_order: 7,
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
    bookedDays: ["2025-07-21", "2025-07-22"], // Monday and Tuesday already booked
    allClubDays: [
      { id: "day-1", club_id: "club-summer-week1-2025", date: "2025-07-21", morning_capacity: 24, afternoon_capacity: 24, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-2", club_id: "club-summer-week1-2025", date: "2025-07-22", morning_capacity: 24, afternoon_capacity: 24, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-3", club_id: "club-summer-week1-2025", date: "2025-07-23", morning_capacity: 24, afternoon_capacity: 24, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-4", club_id: "club-summer-week1-2025", date: "2025-07-24", morning_capacity: 24, afternoon_capacity: 24, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-5", club_id: "club-summer-week1-2025", date: "2025-07-25", morning_capacity: 24, afternoon_capacity: 24, is_available: true, created_at: "2025-01-15T10:00:00Z" },
    ],
  },
  // Booking with all days booked (full week) - no additional days available
  "booking-789": {
    booking: {
      id: "booking-789",
      club_id: "club-october-half-term-2025",
      booking_option_id: "club-october-half-term-2025-option-full-week-full-day",
      parent_name: "Sarah Williams",
      parent_email: "sarah@example.com",
      parent_phone: "07555666777",
      num_children: 1,
      total_amount: 15000,
      status: "complete",
      promo_code_id: null,
      stripe_payment_intent_id: "pi_mock_789",
      stripe_checkout_session_id: "cs_mock_789",
      created_at: "2025-01-17T10:00:00Z",
    },
    bookingOption: {
      id: "club-october-half-term-2025-option-full-week-full-day",
      club_id: "club-october-half-term-2025",
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
      id: "club-october-half-term-2025",
      slug: "october-half-term-2025",
      name: "October Half Term Club 2025",
      description: "Make the most of the autumn break!",
      image_url: null,
      start_date: "2025-10-27",
      end_date: "2025-10-31",
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
        booking_id: "booking-789",
        name: "Lucy Williams",
        date_of_birth: "2016-09-01",
        allergies: "None",
        medical_notes: "",
        emergency_contact_name: "Tom Williams",
        emergency_contact_phone: "07555666778",
        photo_consent: true,
        activity_consent: true,
        medical_consent: true,
        created_at: "2025-01-17T10:30:00Z",
      },
    ],
    bookedDays: ["2025-10-27", "2025-10-28", "2025-10-29", "2025-10-30", "2025-10-31"], // All days booked
    allClubDays: [
      { id: "day-1", club_id: "club-october-half-term-2025", date: "2025-10-27", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-2", club_id: "club-october-half-term-2025", date: "2025-10-28", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-3", club_id: "club-october-half-term-2025", date: "2025-10-29", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-4", club_id: "club-october-half-term-2025", date: "2025-10-30", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
      { id: "day-5", club_id: "club-october-half-term-2025", date: "2025-10-31", morning_capacity: 20, afternoon_capacity: 20, is_available: true, created_at: "2025-01-15T10:00:00Z" },
    ],
  },
};

interface AddDaysPageProps {
  params: Promise<{ bookingId: string }>;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AddDaysPage({ params }: AddDaysPageProps) {
  const { bookingId } = use(params);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get mock booking data
  const bookingData = mockBookingsWithDetails[bookingId];

  // Get current month for calendar (starting from club start date)
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (!bookingData) return new Date();
    const start = new Date(bookingData.club.start_date);
    return new Date(start.getFullYear(), start.getMonth(), 1);
  });

  // Calculate available days (excluding already booked days)
  const availableDays = useMemo(() => {
    if (!bookingData) return [];
    return bookingData.allClubDays.filter(
      (day) => day.is_available && !bookingData.bookedDays.includes(day.date)
    );
  }, [bookingData]);

  // Create a set of available dates for quick lookup
  const availableDatesSet = useMemo(() => {
    return new Set(availableDays.map((day) => day.date));
  }, [availableDays]);

  // Create a set of booked dates
  const bookedDatesSet = useMemo(() => {
    if (!bookingData) return new Set<string>();
    return new Set(bookingData.bookedDays);
  }, [bookingData]);

  // Calculate price for additional days
  const pricePerDayPerChild = bookingData?.bookingOption?.price_per_child || 3500;
  const numChildren = bookingData?.booking?.num_children || 1;
  const totalPrice = selectedDates.length * pricePerDayPerChild * numChildren;

  // Booking not found
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
            We couldn&apos;t find this booking. Please check your email for the
            correct link.
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

  // Generate booking reference
  const bookingRef = booking.id.toUpperCase().replace("BOOKING-", "ETC-");

  // Format time slot for display
  const formatTimeSlot = (slot: string) => {
    switch (slot) {
      case "full_day":
        return "8:30am - 3:30pm";
      case "morning":
        return "8:30am - 12:00pm";
      case "afternoon":
        return "12:00pm - 3:30pm";
      default:
        return "";
    }
  };

  // Format booked days for display
  const formatBookedDays = () => {
    return bookingData.bookedDays
      .sort()
      .map((dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
      });
  };

  // Calendar navigation
  const clubStartDate = new Date(club.start_date);
  const clubEndDate = new Date(club.end_date);

  const canGoBack = useMemo(() => {
    const prevMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
    const lastDayPrevMonth = new Date(
      prevMonth.getFullYear(),
      prevMonth.getMonth() + 1,
      0
    );
    return lastDayPrevMonth >= clubStartDate;
  }, [currentMonth, clubStartDate]);

  const canGoForward = useMemo(() => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    return nextMonth <= clubEndDate;
  }, [currentMonth, clubEndDate]);

  const goToPrevMonth = () => {
    if (canGoBack) {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      );
    }
  };

  const goToNextMonth = () => {
    if (canGoForward) {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      );
    }
  };

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: (Date | null)[] = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const isDateInRange = (date: Date): boolean => {
    return date >= clubStartDate && date <= clubEndDate;
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const handleDayClick = (date: Date) => {
    const dateStr = formatDateKey(date);

    if (!availableDatesSet.has(dateStr)) return;

    const isSelected = selectedDates.includes(dateStr);
    if (isSelected) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const formatSelectedDates = () => {
    return [...selectedDates].sort().map((dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    });
  };

  const handlePayment = async () => {
    if (selectedDates.length === 0) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout/add-days", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          clubId: club.id,
          clubSlug: club.slug,
          selectedDates,
          numChildren,
          pricePerDay: pricePerDayPerChild,
          totalAmount: totalPrice,
          parentName: booking.parent_name,
          parentEmail: booking.parent_email,
          parentPhone: booking.parent_phone,
          timeSlot: bookingOption.time_slot,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsLoading(false);
    }
  };

  // No additional days available
  if (availableDays.length === 0) {
    return (
      <div className="bg-cream min-h-screen">
        {/* Header */}
        <header className="bg-forest">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="font-display text-lg font-bold text-white hover:text-sage transition-colors"
            >
              The Clubhouse
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-8 text-center">
            <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-forest" />
            </div>
            <h1 className="font-display text-2xl font-bold text-bark mb-2">
              No Additional Days Available
            </h1>
            <p className="font-body text-stone mb-4">
              You&apos;ve already booked all available days for {club.name}.
            </p>
            <p className="font-body text-sm text-stone mb-6">
              Booking Reference: <span className="font-semibold text-forest">{bookingRef}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/confirmation/${booking.id}`}
                className="inline-flex items-center justify-center gap-2 bg-forest text-white font-display font-semibold py-3 px-6 rounded-lg hover:bg-meadow transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Booking
              </Link>
              <Link
                href="/clubs"
                className="inline-flex items-center justify-center gap-2 border-2 border-forest text-forest font-display font-semibold py-3 px-6 rounded-lg hover:bg-forest hover:text-white transition-colors"
              >
                Browse Other Clubs
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
      <header className="bg-forest">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-display text-lg font-bold text-white hover:text-sage transition-colors"
          >
            The Clubhouse
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-6">
          <Link
            href={`/confirmation/${booking.id}`}
            className="inline-flex items-center gap-1 text-forest font-body text-sm hover:underline mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Booking
          </Link>
          <h1 className="font-display text-3xl font-bold text-bark">
            Add More Days
          </h1>
          <p className="font-body text-stone mt-1">
            Extend your booking with additional days at {club.name}
          </p>
        </div>

        {/* Existing Booking Summary */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 mb-6">
          <h2 className="font-display text-lg font-bold text-bark mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-forest" />
            Current Booking Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Club & Reference */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-forest" />
              </div>
              <div>
                <p className="font-body text-sm text-stone">Club</p>
                <p className="font-display font-semibold text-bark">{club.name}</p>
                <p className="font-body text-xs text-pebble">Ref: {bookingRef}</p>
              </div>
            </div>

            {/* Time Slot */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-forest" />
              </div>
              <div>
                <p className="font-body text-sm text-stone">Time</p>
                <p className="font-display font-semibold text-bark">
                  {formatTimeSlot(bookingOption.time_slot)}
                </p>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-forest" />
              </div>
              <div>
                <p className="font-body text-sm text-stone">Children</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {children.map((child) => (
                    <span
                      key={child.id}
                      className="inline-block bg-sage/20 text-forest font-display font-medium px-2 py-0.5 rounded-full text-xs"
                    >
                      {child.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Already Booked Days */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-forest" />
              </div>
              <div>
                <p className="font-body text-sm text-stone">Days Booked</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {formatBookedDays().map((dateLabel, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-forest/10 text-forest font-body text-xs px-2 py-0.5 rounded-full"
                    >
                      {dateLabel}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date Selection Calendar */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 mb-6">
          <h2 className="font-display text-lg font-bold text-bark mb-4 flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-forest" />
            Select Additional Days
          </h2>
          <p className="font-body text-sm text-stone mb-4">
            Choose the extra days you&apos;d like to add to your booking.
          </p>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={goToPrevMonth}
              disabled={!canGoBack}
              className="p-2 rounded-lg hover:bg-cloud disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5 text-bark" />
            </button>

            <h3 className="font-display text-xl font-bold text-bark">
              {monthLabel}
            </h3>

            <button
              type="button"
              onClick={goToNextMonth}
              disabled={!canGoForward}
              className="p-2 rounded-lg hover:bg-cloud disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5 text-bark" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-stone py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateKey = formatDateKey(date);
              const inRange = isDateInRange(date);
              const isAvailable = availableDatesSet.has(dateKey);
              const isBooked = bookedDatesSet.has(dateKey);
              const isSelected = selectedDates.includes(dateKey);
              const isClickable = inRange && isAvailable;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => isClickable && handleDayClick(date)}
                  disabled={!isClickable}
                  className={`
                    aspect-square p-1 rounded-lg flex flex-col items-center justify-center transition-all relative
                    ${isClickable ? "hover:bg-sage/20 cursor-pointer" : "cursor-default"}
                    ${isSelected ? "bg-sunshine text-bark ring-2 ring-amber" : ""}
                    ${isBooked ? "bg-forest/10" : ""}
                    ${!inRange ? "opacity-30" : ""}
                    ${inRange && !isAvailable && !isBooked ? "opacity-50" : ""}
                  `}
                  aria-label={`${date.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}${isSelected ? " (selected)" : ""}${isBooked ? " (already booked)" : ""}`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? "text-bark" : isBooked ? "text-forest" : "text-bark"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {isBooked && (
                    <Check className="w-3 h-3 text-forest absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-cloud">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-sunshine ring-2 ring-amber" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-forest/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-forest" />
                </div>
                <span>Already Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-cloud border border-pebble" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-cloud opacity-30" />
                <span>Unavailable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Days Summary & Price */}
        {selectedDates.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 mb-6">
            <h2 className="font-display text-lg font-bold text-bark mb-4">
              Your Additional Days
            </h2>

            {/* Selected days chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {formatSelectedDates().map((dateLabel, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center bg-sunshine/20 text-bark font-display font-medium px-3 py-1.5 rounded-full text-sm"
                >
                  {dateLabel}
                </span>
              ))}
            </div>

            {/* Price Calculation */}
            <div className="bg-cloud rounded-xl p-4">
              <div className="space-y-2 font-body text-sm">
                <div className="flex justify-between">
                  <span className="text-stone">
                    {formatPrice(pricePerDayPerChild)} x {selectedDates.length} day{selectedDates.length !== 1 ? "s" : ""} x {numChildren} {numChildren === 1 ? "child" : "children"}
                  </span>
                  <span className="text-bark font-medium">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="border-t border-pebble/30 mt-3 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-display font-bold text-bark">Total</span>
                  <span className="font-display text-2xl font-bold text-forest">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handlePayment}
            disabled={selectedDates.length === 0 || isLoading}
            className={`
              w-full flex items-center justify-center gap-2 font-display font-semibold py-4 px-6 rounded-lg transition-colors
              ${
                selectedDates.length > 0 && !isLoading
                  ? "bg-sunshine text-bark hover:bg-amber cursor-pointer"
                  : "bg-pebble text-stone cursor-not-allowed"
              }
            `}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
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
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                {selectedDates.length === 0
                  ? "Select Days to Continue"
                  : `Pay ${formatPrice(totalPrice)} for Additional Days`}
              </>
            )}
          </button>

          <Link
            href={`/confirmation/${booking.id}`}
            className="w-full flex items-center justify-center gap-2 border-2 border-forest text-forest font-display font-semibold py-3 px-6 rounded-lg hover:bg-forest hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Cancel
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-stone mt-6">
          Questions?{" "}
          <Link href="/contact" className="text-forest font-medium hover:underline">
            Contact us
          </Link>
        </p>
      </main>
    </div>
  );
}
