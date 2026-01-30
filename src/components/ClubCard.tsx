import Image from "next/image";
import Link from "next/link";
import type { Club } from "@/types/database";

interface ClubCardProps {
  club: Club;
  isSoldOut?: boolean;
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };

  const startFormatted = start.toLocaleDateString("en-GB", options);
  const endFormatted = end.toLocaleDateString("en-GB", {
    ...options,
    year: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
}

function formatAgeRange(minAge: number, maxAge: number): string {
  return `Ages ${minAge}-${maxAge}`;
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`;
}

function formatTimeRange(club: Club): string {
  const hasMorning = club.morning_start && club.morning_end;
  const hasAfternoon = club.afternoon_start && club.afternoon_end;

  if (hasMorning && hasAfternoon) {
    return `${formatTime(club.morning_start!)} - ${formatTime(club.afternoon_end!)}`;
  }
  if (hasMorning) {
    return `${formatTime(club.morning_start!)} - ${formatTime(club.morning_end!)}`;
  }
  if (hasAfternoon) {
    return `${formatTime(club.afternoon_start!)} - ${formatTime(club.afternoon_end!)}`;
  }
  return "";
}

export function ClubCard({ club, isSoldOut = false }: ClubCardProps) {
  const dateRange = formatDateRange(club.start_date, club.end_date);
  const ageRange = formatAgeRange(club.min_age, club.max_age);
  const timeRange = formatTimeRange(club);

  return (
    <article className="bg-white rounded-2xl shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      {/* Image */}
      <div
        className="relative aspect-[4/3]"
        style={{ backgroundColor: "var(--craigies-cream)" }}
      >
        {club.image_url ? (
          <Image
            src={club.image_url}
            alt={club.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(122, 124, 74, 0.2)" }}
          >
            <svg
              className="w-16 h-16"
              style={{ color: "var(--craigies-olive)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Sold Out Badge */}
        {isSoldOut && (
          <div
            className="absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full"
            style={{
              backgroundColor: "#E07A5F",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Sold Out
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3
          className="text-xl font-bold mb-2"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--craigies-dark-olive)",
          }}
        >
          {club.name}
        </h3>

        <div className="space-y-1 mb-4">
          <p
            className="text-sm flex items-center gap-2"
            style={{ color: "var(--craigies-dark-olive)" }}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {dateRange}
          </p>
          <p
            className="text-sm flex items-center gap-2"
            style={{ color: "var(--craigies-dark-olive)" }}
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {ageRange}
          </p>
          <p
            className="text-sm flex items-center gap-2"
            style={{ color: "var(--craigies-dark-olive)" }}
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {timeRange}
          </p>
        </div>

        {/* CTA Button */}
        {club.bookings_open ? (
          <Link
            href={`/book/${club.slug}`}
            className="block w-full text-center font-semibold py-3 px-6 rounded-lg transition-opacity hover:opacity-90"
            style={{
              backgroundColor: isSoldOut
                ? "var(--craigies-olive)"
                : "var(--craigies-burnt-orange)",
              color: "white",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {isSoldOut ? "Join Waitlist" : "Book Now"}
          </Link>
        ) : (
          <span
            className="block w-full text-center font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
            style={{
              backgroundColor: "#9CA3AF",
              color: "white",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Bookings Open Soon
          </span>
        )}
      </div>
    </article>
  );
}
