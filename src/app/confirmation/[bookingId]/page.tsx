import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyBookingToken, BOOKING_TOKEN_PARAM } from "@/lib/booking-access";
import { SecureLinkNotice } from "@/components/SecureLinkNotice";
import { ConfirmationContent } from "./ConfirmationContent";

interface ConfirmationPageProps {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getBookingData(bookingId: string) {
  const supabase = createAdminClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      clubs (*),
      booking_options (*),
      children (*)
    `)
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    return null;
  }

  // Get booked days
  const { data: bookingDays } = await supabase
    .from('booking_days')
    .select(`*, club_days (*)`)
    .eq('booking_id', bookingId);

  return {
    booking,
    club: booking.clubs,
    bookingOption: booking.booking_options,
    children: booking.children || [],
    bookingDays: bookingDays || [],
  };
}

export default async function ConfirmationPage({ params, searchParams }: ConfirmationPageProps) {
  const { bookingId } = await params;
  const token = (await searchParams)[BOOKING_TOKEN_PARAM];
  const accessToken = typeof token === "string" ? token : "";

  // Require a valid per-booking token before revealing any booking/child data.
  if (!verifyBookingToken(bookingId, accessToken)) {
    return <SecureLinkNotice />;
  }

  const data = await getBookingData(bookingId);

  if (!data) {
    notFound();
  }

  return (
    <ConfirmationContent
      booking={data.booking}
      club={data.club}
      bookingOption={data.bookingOption}
      children={data.children}
      bookingDays={data.bookingDays}
      accessToken={accessToken}
    />
  );
}
