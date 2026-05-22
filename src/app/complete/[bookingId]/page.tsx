import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyBookingToken, BOOKING_TOKEN_PARAM } from "@/lib/booking-access";
import { SecureLinkNotice } from "@/components/SecureLinkNotice";
import { CompleteForm } from "./CompleteForm";

interface CompletePageProps {
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

  return {
    booking,
    club: booking.clubs,
    bookingOption: booking.booking_options,
    children: booking.children || [],
  };
}

export default async function CompletePage({ params, searchParams }: CompletePageProps) {
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
    <CompleteForm
      booking={data.booking}
      club={data.club}
      bookingOption={data.bookingOption}
      existingChildren={data.children}
      accessToken={accessToken}
    />
  );
}
