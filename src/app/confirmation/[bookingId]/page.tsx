"use client";

import { use } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Calendar,
  Users,
  CreditCard,
  Clock,
  MapPin,
  Download,
  ExternalLink,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import type { Booking, BookingOption, Club, Child } from "@/types/database";

// Mock booking data for development
const mockBookings: Record<
  string,
  {
    booking: Booking;
    bookingOption: BookingOption;
    club: Club;
    children: Child[];
  }
> = {
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
      status: "complete",
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
      end_date: "2025-04-11",
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

interface ConfirmationPageProps {
  params: Promise<{ bookingId: string }>;
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { bookingId } = use(params);

  // Get mock booking data
  const bookingData = mockBookings[bookingId];

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

  // Format date range for display
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })} - ${endDate.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  };

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

  // Generate booking reference from ID
  const bookingRef = booking.id.toUpperCase().replace("BOOKING-", "ETC-");

  // Placeholder handlers for calendar buttons
  const handleDownloadICS = () => {
    // TODO: Implement ICS file generation
    alert("ICS download coming soon!");
  };

  const handleAddToGoogleCalendar = () => {
    // TODO: Implement Google Calendar integration
    alert("Google Calendar integration coming soon!");
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <header className="bg-forest">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-display text-lg font-bold text-white hover:text-sage transition-colors"
          >
            Explore the Clubhouse
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Banner with Celebratory Feel */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-lg)] p-8 mb-6 text-center relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sunshine via-amber to-coral" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-sage/10 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sunshine/10 rounded-full" />

          {/* Success Icon */}
          <div className="relative">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <CheckCircle className="w-12 h-12 text-success" />
              <Sparkles className="w-6 h-6 text-sunshine absolute -top-1 -right-1" />
            </div>

            <h1 className="font-display text-3xl font-bold text-bark mb-2">
              Booking Confirmed!
            </h1>
            <p className="font-body text-lg text-stone mb-4">
              We can&apos;t wait to see you at the farm!
            </p>

            {/* Booking Reference */}
            <div className="inline-block bg-cloud rounded-lg px-4 py-2">
              <p className="font-body text-sm text-stone">Booking Reference</p>
              <p className="font-display text-xl font-bold text-forest tracking-wide">
                {bookingRef}
              </p>
            </div>
          </div>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 mb-6">
          <h2 className="font-display text-xl font-bold text-bark mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-forest" />
            Booking Details
          </h2>

          <div className="space-y-4">
            {/* Club Name */}
            <div className="flex items-start gap-3 pb-4 border-b border-cloud">
              <div className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-forest" />
              </div>
              <div>
                <p className="font-body text-sm text-stone">Club</p>
                <p className="font-display font-semibold text-bark">
                  {club.name}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-start gap-3 pb-4 border-b border-cloud">
              <div className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-forest" />
              </div>
              <div>
                <p className="font-body text-sm text-stone">Dates</p>
                <p className="font-display font-semibold text-bark">
                  {formatDateRange(club.start_date, club.end_date)}
                </p>
                <p className="font-body text-sm text-stone mt-0.5">
                  {bookingOption.name}
                </p>
              </div>
            </div>

            {/* Times */}
            <div className="flex items-start gap-3 pb-4 border-b border-cloud">
              <div className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-forest" />
              </div>
              <div>
                <p className="font-body text-sm text-stone">Times</p>
                <p className="font-display font-semibold text-bark">
                  {formatTimeSlot(bookingOption.time_slot)}
                </p>
              </div>
            </div>

            {/* Children Attending */}
            <div className="flex items-start gap-3 pb-4 border-b border-cloud">
              <div className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-forest" />
              </div>
              <div>
                <p className="font-body text-sm text-stone">
                  Children Attending
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {children.map((child) => (
                    <span
                      key={child.id}
                      className="inline-flex items-center bg-sage/20 text-forest font-display font-medium px-3 py-1 rounded-full text-sm"
                    >
                      {child.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-sunshine/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-amber" />
              </div>
              <div>
                <p className="font-body text-sm text-stone">Amount Paid</p>
                <p className="font-display text-2xl font-bold text-forest">
                  {formatPrice(booking.total_amount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What Happens Next Card */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 mb-6">
          <h2 className="font-display text-xl font-bold text-bark mb-4">
            What Happens Next?
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-forest text-white rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-display font-semibold text-bark">
                  Confirmation Email
                </p>
                <p className="font-body text-stone text-sm">
                  We&apos;ve sent a confirmation email to{" "}
                  <span className="font-medium">{booking.parent_email}</span>{" "}
                  with all the details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-forest text-white rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-display font-semibold text-bark">
                  Pre-Club Information
                </p>
                <p className="font-body text-stone text-sm">
                  A week before the club starts, we&apos;ll send you everything
                  you need to know - what to bring, what to wear, and arrival
                  instructions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-forest text-white rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-display font-semibold text-bark">
                  Drop-off on the Day
                </p>
                <p className="font-body text-stone text-sm">
                  Arrive at the farm at{" "}
                  {bookingOption.time_slot === "afternoon" ? "12:00pm" : "8:30am"}
                  . Our team will be ready to welcome your little explorers!
                </p>
              </div>
            </div>
          </div>

          {/* Things to Know Box */}
          <div className="mt-6 bg-sage/10 rounded-xl p-4">
            <p className="font-display font-semibold text-bark mb-2">
              Things to Know
            </p>
            <ul className="font-body text-sm text-stone space-y-1">
              <li>
                • Children should wear old clothes suitable for outdoor play
              </li>
              <li>
                • Please bring a packed lunch (nut-free), snacks, and a water
                bottle
              </li>
              <li>• Wellies and waterproofs are essential!</li>
              <li>• Don&apos;t forget sun cream and a hat in warmer weather</li>
            </ul>
          </div>
        </div>

        {/* Calendar Actions Card */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 mb-6">
          <h2 className="font-display text-xl font-bold text-bark mb-4">
            Add to Your Calendar
          </h2>
          <p className="font-body text-stone text-sm mb-4">
            Don&apos;t forget! Add the club dates to your calendar.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadICS}
              className="flex items-center justify-center gap-2 bg-forest text-white font-display font-semibold py-3 px-6 rounded-lg hover:bg-meadow transition-colors"
            >
              <Download className="w-5 h-5" />
              Download .ics File
            </button>
            <button
              onClick={handleAddToGoogleCalendar}
              className="flex items-center justify-center gap-2 border-2 border-forest text-forest font-display font-semibold py-3 px-6 rounded-lg hover:bg-forest hover:text-white transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Add to Google Calendar
            </button>
          </div>
        </div>

        {/* Add More Days CTA */}
        {bookingOption.option_type !== "full_week" && (
          <div className="bg-gradient-to-r from-sunshine/20 to-amber/20 rounded-2xl p-6 mb-6 border border-sunshine/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-sunshine rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-bark" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-bold text-bark mb-1">
                  Want to Add More Days?
                </h3>
                <p className="font-body text-stone text-sm mb-4">
                  Your little ones will love it so much, they&apos;ll want to
                  come back! Book additional days at the same club.
                </p>
                <Link
                  href={`/book/${club.slug}`}
                  className="inline-flex items-center gap-2 bg-sunshine text-bark font-display font-semibold py-2 px-4 rounded-lg hover:bg-amber transition-colors"
                >
                  Book More Days
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/clubs"
            className="inline-flex items-center justify-center gap-2 bg-forest text-white font-display font-semibold py-3 px-6 rounded-lg hover:bg-meadow transition-colors"
          >
            Browse More Clubs
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-forest text-forest font-display font-semibold py-3 px-6 rounded-lg hover:bg-forest hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-8 pt-6 border-t border-cloud">
          <p className="font-body text-stone text-sm">
            Questions about your booking?{" "}
            <Link
              href="/contact"
              className="text-forest font-medium hover:underline"
            >
              Contact us
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
