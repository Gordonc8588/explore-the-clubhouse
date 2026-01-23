import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Club, ClubDay, BookingOption, TimeSlot } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import {
  AvailabilityCalendar,
  type ClubDayWithAvailability,
} from "@/components/AvailabilityCalendar";

function formatPrice(priceInPence: number): string {
  return `£${(priceInPence / 100).toFixed(2)}`;
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
  };
  const endOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  const startFormatted = start.toLocaleDateString("en-GB", startOptions);
  const endFormatted = end.toLocaleDateString("en-GB", endOptions);

  return `${startFormatted} - ${endFormatted}`;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  const hour12 = hour % 12 || 12;
  return `${hour12}${minutes !== "00" ? `:${minutes}` : ""}${ampm}`;
}

function getTimeSlotLabel(slot: TimeSlot): string {
  switch (slot) {
    case "full_day":
      return "Full Day";
    case "morning":
      return "Morning";
    case "afternoon":
      return "Afternoon";
  }
}

interface ClubDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getClubData(slug: string) {
  const supabase = await createClient();

  // Fetch club by slug
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (clubError || !club) {
    return null;
  }

  // Fetch booking options
  const { data: bookingOptions } = await supabase
    .from('booking_options')
    .select('*')
    .eq('club_id', club.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  // Fetch club days with availability
  const { data: clubDays } = await supabase
    .from('club_days')
    .select('*')
    .eq('club_id', club.id)
    .eq('is_available', true)
    .order('date', { ascending: true });

  // Get booked counts for each day
  const clubDaysWithAvailability: ClubDayWithAvailability[] = await Promise.all(
    (clubDays || []).map(async (day) => {
      const { data: availability } = await supabase
        .rpc('get_club_day_availability', { day_id: day.id });

      const avail = availability?.[0] || {
        morning_booked: 0,
        afternoon_booked: 0,
      };

      return {
        id: day.id,
        date: day.date,
        morning_capacity: day.morning_capacity,
        afternoon_capacity: day.afternoon_capacity,
        morning_booked: avail.morning_booked || 0,
        afternoon_booked: avail.afternoon_booked || 0,
        is_available: day.is_available,
      };
    })
  );

  return {
    club: club as Club,
    bookingOptions: (bookingOptions || []) as BookingOption[],
    clubDays: clubDaysWithAvailability,
  };
}

export async function generateStaticParams() {
  // For dynamic rendering, return empty array
  // Clubs will be fetched at request time
  return [];
}

// Force dynamic rendering since we need real-time availability
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: club } = await supabase
    .from("clubs")
    .select("name, description, start_date, end_date, image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!club) {
    return {
      title: "Club Not Found",
    };
  }

  const startDate = new Date(club.start_date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
  const endDate = new Date(club.end_date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateRange = `${startDate} - ${endDate}`;

  return {
    title: club.name,
    description: `${club.description} Running ${dateRange} at Craigies Farm, South Queensferry.`,
    openGraph: {
      title: `${club.name} | The Clubhouse`,
      description: `${club.description} Running ${dateRange}.`,
      images: club.image_url ? [{ url: club.image_url }] : undefined,
    },
  };
}

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { slug } = await params;
  const data = await getClubData(slug);

  if (!data) {
    notFound();
  }

  const { club, bookingOptions, clubDays } = data;

  const dateRange = formatDateRange(club.start_date, club.end_date);
  const morningTime = `${formatTime(club.morning_start)} - ${formatTime(club.morning_end)}`;
  const afternoonTime = `${formatTime(club.afternoon_start)} - ${formatTime(club.afternoon_end)}`;

  return (
    <div style={{ backgroundColor: "var(--craigies-cream)" }} className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-12 sm:py-16 lg:py-20"
        style={{ backgroundColor: "var(--craigies-cream)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            {/* Image */}
            <div
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg"
              style={{ backgroundColor: "var(--craigies-cream)" }}
            >
              {club.image_url ? (
                <Image
                  src={club.image_url}
                  alt={club.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(122, 124, 74, 0.2)" }}
                >
                  <svg
                    className="w-24 h-24"
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
            </div>

            {/* Club Info */}
            <div>
              <Link
                href="/clubs"
                className="inline-flex items-center gap-1 transition-opacity hover:opacity-80 mb-4 font-body text-sm"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to All Clubs
              </Link>

              <h1
                className="text-4xl font-bold tracking-tight sm:text-5xl mb-4"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {club.name}
              </h1>

              <p
                className="font-body text-lg mb-6"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                {club.description}
              </p>

              {/* Key Details */}
              <div className="space-y-3 mb-8">
                {/* Dates */}
                <div
                  className="flex items-center gap-3"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: "var(--craigies-burnt-orange)" }}
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
                  </div>
                  <div>
                    <p
                      className="font-semibold"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {dateRange}
                    </p>
                  </div>
                </div>

                {/* Times */}
                <div
                  className="flex items-center gap-3"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: "var(--craigies-burnt-orange)" }}
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
                  </div>
                  <div>
                    <p
                      className="font-semibold"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Morning: {morningTime}
                    </p>
                    <p
                      className="font-semibold"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Afternoon: {afternoonTime}
                    </p>
                  </div>
                </div>

                {/* Age Range */}
                <div
                  className="flex items-center gap-3"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: "var(--craigies-burnt-orange)" }}
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
                  </div>
                  <div>
                    <p
                      className="font-semibold"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Ages {club.min_age} - {club.max_age} years
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href={`/book/${club.slug}`}
                className="inline-block text-white font-semibold py-4 px-8 rounded-lg transition-opacity hover:opacity-90 text-lg shadow-md"
                style={{
                  backgroundColor: "var(--craigies-burnt-orange)",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Start Booking
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* Booking Options Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Booking Options
            </h2>
            <p
              className="mt-4 font-body text-lg"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Choose the option that works best for your family.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bookingOptions
              .filter((opt) => opt.is_active)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((option) => (
                <article
                  key={option.id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3
                        className="text-xl font-bold"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          color: "var(--craigies-dark-olive)",
                        }}
                      >
                        {option.name}
                      </h3>
                      <span
                        className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          color: "var(--craigies-olive)",
                          backgroundColor: "rgba(122, 124, 74, 0.2)",
                        }}
                      >
                        {getTimeSlotLabel(option.time_slot)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-2xl font-bold"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          color: "var(--craigies-burnt-orange)",
                        }}
                      >
                        {formatPrice(option.price_per_child)}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
                        per child
                      </p>
                    </div>
                  </div>

                  {option.description && (
                    <p
                      className="font-body text-sm mb-4"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      {option.description}
                    </p>
                  )}

                  <Link
                    href={`/book/${club.slug}?option=${option.id}`}
                    className="block w-full text-center text-white font-semibold py-3 px-6 rounded-lg transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: "var(--craigies-olive)",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Select
                  </Link>
                </article>
              ))}
          </div>
        </div>
      </section>

      {/* Availability Calendar Section */}
      <section
        className="py-16 sm:py-24"
        style={{ backgroundColor: "#F3F4F6" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Availability
            </h2>
            <p
              className="mt-4 font-body text-lg"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Check which days have spaces available. Morning and afternoon
              sessions are shown separately.
            </p>
          </div>

          <div className="max-w-md mx-auto lg:max-w-lg">
            <AvailabilityCalendar
              clubDays={clubDays}
              startDate={club.start_date}
              endDate={club.end_date}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl p-8 sm:p-12 text-center"
            style={{ backgroundColor: "var(--craigies-olive)" }}
          >
            <h2
              className="text-3xl font-bold text-white sm:text-4xl mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Ready to Book?
            </h2>
            <p className="font-body text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Secure your child&apos;s spot at {club.name}. Spaces fill up
              quickly, so don&apos;t miss out on the fun!
            </p>
            <Link
              href={`/book/${club.slug}`}
              className="inline-block text-white font-semibold py-4 px-8 rounded-lg transition-opacity hover:opacity-90 text-lg shadow-md"
              style={{
                backgroundColor: "var(--craigies-burnt-orange)",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Start Booking
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
