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
        return formatTime(club.morning_start!) + " - " + formatTime(club.morning_end!);
      case "afternoon":
        return formatTime(club.afternoon_start!) + " - " + formatTime(club.afternoon_end!);
      default:
        return formatTime(club.morning_start!) + " - " + formatTime(club.afternoon_end!);
    }
  };

  const getDropOffTime = () => {
    return bookingOption.time_slot === "afternoon"
      ? formatTime(club.afternoon_start!)
      : formatTime(club.morning_start!);
  };

  const isAfternoonOnly = bookingOption.time_slot === "afternoon";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--craigies-cream)" }}>
      {/* Success Banner */}
      <div className="py-8 sm:py-12" style={{ backgroundColor: "var(--craigies-olive)" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold text-white mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Booking Confirmed!
          </h1>
          <p className="text-white/90 text-lg">
            Thank you for booking with Explore the Clubhouse
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Booking Reference */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-stone">Booking Reference</p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {bookingRef}
              </p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: isComplete
                  ? "var(--craigies-cream)"
                  : "rgba(212, 132, 62, 0.2)",
                color: isComplete
                  ? "var(--craigies-olive)"
                  : "var(--craigies-burnt-orange)",
              }}
            >
              {isComplete ? "Complete" : "Pending Child Info"}
            </div>
          </div>

          {/* Booking Details Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 mt-0.5" style={{ color: "var(--craigies-burnt-orange)" }} />
              <div>
                <p className="text-sm text-stone">Club</p>
                <p className="font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                  {club.name}
                </p>
                <p className="text-sm text-stone">{formatDateRange(club.start_date, club.end_date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-0.5" style={{ color: "var(--craigies-burnt-orange)" }} />
              <div>
                <p className="text-sm text-stone">Session</p>
                <p className="font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                  {bookingOption.name}
                </p>
                <p className="text-sm text-stone">{getSessionTimes()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 mt-0.5" style={{ color: "var(--craigies-burnt-orange)" }} />
              <div>
                <p className="text-sm text-stone">Children</p>
                <p className="font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                  {booking.num_children} {booking.num_children === 1 ? "child" : "children"}
                </p>
                {children.length > 0 && (
                  <p className="text-sm text-stone">{children.map(c => c.name).join(", ")}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 mt-0.5" style={{ color: "var(--craigies-burnt-orange)" }} />
              <div>
                <p className="text-sm text-stone">Amount Paid</p>
                <p className="font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                  {formatPrice(booking.total_amount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add to Calendar */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-6">
          <h2
            className="text-xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Add to Calendar
          </h2>
          <div className="flex flex-wrap gap-4">
            <a
              href={icsDownloadUrl}
              download
              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
            >
              <Download className="w-4 h-4" />
              Download ICS
            </a>
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-colors"
              style={{
                borderColor: "var(--craigies-dark-olive)",
                color: "var(--craigies-dark-olive)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--craigies-cream)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <ExternalLink className="w-4 h-4" />
              Google Calendar
            </a>
          </div>
        </div>

        {/* Important Information */}
        <div
          className="rounded-xl p-5 mb-6 border-l-4"
          style={{
            backgroundColor: "rgba(122, 124, 74, 0.08)",
            borderColor: "var(--craigies-olive)",
          }}
        >
          <h3
            className="font-semibold mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Important Information
          </h3>
          <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
            The Clubhouse is a drop-off activity club and is not a Care Inspectorate-registered childcare service. While we strive to be welcoming and inclusive, we are unfortunately unable to provide the level of support required for children with additional support needs or significant behavioural circumstances.
          </p>
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm font-medium hover:underline"
            style={{ color: "var(--craigies-burnt-orange)" }}
          >
            View full Cancellation & Behaviour Policy
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 mb-6">
          <h2
            className="text-xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            <Sparkles className="inline w-5 h-5 mr-2" style={{ color: "var(--craigies-burnt-orange)" }} />
            What Happens Next
          </h2>
          <ul className="space-y-3 text-stone">
            {!isComplete && (
              <li className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--craigies-burnt-orange)" }} />
                <span>Complete child information forms (required before the club starts)</span>
              </li>
            )}
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--craigies-burnt-orange)" }} />
              <span>Check your email for confirmation and important details</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--craigies-burnt-orange)" }} />
              <span>Drop off your child at the farm at {getDropOffTime()}</span>
            </li>
            <li className="flex items-start gap-3">
              <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--craigies-burnt-orange)" }} />
              <span>
                {isAfternoonOnly
                  ? "Bring suitable outdoor clothing"
                  : "Bring suitable outdoor clothing and a packed lunch"}
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isComplete && (
            <Link
              href={"/complete/" + booking.id}
              className="inline-flex items-center justify-center gap-2 text-white font-semibold py-3 px-6 rounded-lg transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--craigies-burnt-orange)",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Complete Child Information
            </Link>
          )}
          <Link
            href={"/add-days/" + booking.id}
            className="inline-flex items-center justify-center gap-2 border-2 font-semibold py-3 px-6 rounded-lg transition-colors"
            style={{
              borderColor: "var(--craigies-dark-olive)",
              color: "var(--craigies-dark-olive)",
              fontFamily: "'Playfair Display', serif",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--craigies-cream)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Add More Days
          </Link>
        </div>
      </div>
    </div>
  );
}
