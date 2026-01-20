"use client";

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
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import type { Booking, BookingOption, Club, Child, BookingDay, ClubDay } from "@/types/database";

function formatPrice(priceInPence: number): string {
  return "£" + (priceInPence / 100).toFixed(2);
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  return start.toLocaleDateString("en-GB", options) + " - " + end.toLocaleDateString("en-GB", options);
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  const hour12 = hour % 12 || 12;
  return hour12 + (minutes !== "00" ? ":" + minutes : "") + ampm;
}

interface ConfirmationContentProps {
  booking: Booking;
  club: Club;
  bookingOption: BookingOption;
  children: Child[];
  bookingDays: (BookingDay & { club_days: ClubDay })[];
}

export function ConfirmationContent({ booking, club, bookingOption, children, bookingDays }: ConfirmationContentProps) {
  const bookingRef = booking.id.slice(0, 8).toUpperCase();
  const isComplete = booking.status === "complete" && children.length > 0;

  const googleCalendarUrl = generateGoogleCalendarUrl(booking, club);
  const icsDownloadUrl = "/api/calendar/" + booking.id;

  const getSessionTimes = () => {
    switch (bookingOption.time_slot) {
      case "morning":
        return formatTime(club.morning_start) + " - " + formatTime(club.morning_end);
      case "afternoon":
        return formatTime(club.afternoon_start) + " - " + formatTime(club.afternoon_end);
      default:
        return formatTime(club.morning_start) + " - " + formatTime(club.afternoon_end);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* Success Banner */}
      <div className="bg-forest py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-white/90 text-lg">
            Thank you for booking with Explore the Clubhouse
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Booking Reference */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-stone">Booking Reference</p>
              <p className="font-display text-2xl font-bold text-bark">{bookingRef}</p>
            </div>
            <div className={"px-3 py-1 rounded-full text-sm font-semibold " + (isComplete ? "bg-sage/30 text-forest" : "bg-amber/20 text-amber-700")}>
              {isComplete ? "Complete" : "Pending Child Info"}
            </div>
          </div>

          {/* Booking Details Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-forest mt-0.5" />
              <div>
                <p className="text-sm text-stone">Club</p>
                <p className="font-semibold text-bark">{club.name}</p>
                <p className="text-sm text-stone">{formatDateRange(club.start_date, club.end_date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-forest mt-0.5" />
              <div>
                <p className="text-sm text-stone">Session</p>
                <p className="font-semibold text-bark">{bookingOption.name}</p>
                <p className="text-sm text-stone">{getSessionTimes()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-forest mt-0.5" />
              <div>
                <p className="text-sm text-stone">Children</p>
                <p className="font-semibold text-bark">{booking.num_children} {booking.num_children === 1 ? "child" : "children"}</p>
                {children.length > 0 && (
                  <p className="text-sm text-stone">{children.map(c => c.name).join(", ")}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-forest mt-0.5" />
              <div>
                <p className="text-sm text-stone">Amount Paid</p>
                <p className="font-semibold text-bark">{formatPrice(booking.total_amount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add to Calendar */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 sm:p-8 mb-6">
          <h2 className="font-display text-xl font-bold text-bark mb-4">Add to Calendar</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href={icsDownloadUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-lg hover:bg-meadow transition-colors"
            >
              <Download className="w-4 h-4" />
              Download ICS
            </a>
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-forest text-forest rounded-lg hover:bg-sage/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Google Calendar
            </a>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] p-6 sm:p-8 mb-6">
          <h2 className="font-display text-xl font-bold text-bark mb-4">
            <Sparkles className="inline w-5 h-5 mr-2 text-sunshine" />
            What Happens Next
          </h2>
          <ul className="space-y-3 text-stone">
            {!isComplete && (
              <li className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
                <span>Complete child information forms (required before the club starts)</span>
              </li>
            )}
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
              <span>Check your email for confirmation and important details</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
              <span>Drop off your child at the farm at {formatTime(club.morning_start)}</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
              <span>Bring suitable outdoor clothing and a packed lunch</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isComplete && (
            <Link
              href={"/complete/" + booking.id}
              className="inline-flex items-center justify-center gap-2 bg-sunshine text-bark font-display font-semibold py-3 px-6 rounded-lg hover:bg-amber transition-colors"
            >
              Complete Child Information
            </Link>
          )}
          <Link
            href={"/add-days/" + booking.id}
            className="inline-flex items-center justify-center gap-2 border border-forest text-forest font-display font-semibold py-3 px-6 rounded-lg hover:bg-sage/20 transition-colors"
          >
            Add More Days
          </Link>
        </div>
      </div>
    </div>
  );
}
