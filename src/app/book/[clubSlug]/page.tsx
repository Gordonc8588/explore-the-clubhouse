import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Club, BookingOption, ClubDayWithAvailability } from "@/types/database";
import { BookingForm } from "./BookingForm";

interface BookingPageProps {
  params: Promise<{ clubSlug: string }>;
}

async function getBookingData(slug: string) {
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

  // Fetch club days
  const { data: clubDays } = await supabase
    .from('club_days')
    .select('*')
    .eq('club_id', club.id)
    .eq('is_available', true)
    .order('date', { ascending: true });

  // Enrich club days with availability data
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

  // Full week available only if every day has morning capacity remaining
  const fullWeekAvailable = clubDaysWithAvailability.length > 0 &&
    clubDaysWithAvailability.every(day => day.morning_booked < day.morning_capacity);

  return {
    club: club as Club,
    bookingOptions: (bookingOptions || []) as BookingOption[],
    clubDays: clubDaysWithAvailability,
    fullWeekAvailable,
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { clubSlug } = await params;
  const data = await getBookingData(clubSlug);

  if (!data) {
    notFound();
  }

  // Redirect to club page if bookings aren't open yet
  if (!data.club.bookings_open) {
    redirect(`/clubs/${clubSlug}`);
  }

  return (
    <BookingForm
      club={data.club}
      bookingOptions={data.bookingOptions}
      clubDays={data.clubDays}
      fullWeekAvailable={data.fullWeekAvailable}
    />
  );
}
