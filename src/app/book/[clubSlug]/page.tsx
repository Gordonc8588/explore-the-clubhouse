import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Club, BookingOption, ClubDay } from "@/types/database";
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

  return {
    club: club as Club,
    bookingOptions: (bookingOptions || []) as BookingOption[],
    clubDays: (clubDays || []) as ClubDay[],
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
    />
  );
}
