import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConfirmationContent } from "./ConfirmationContent";

interface ConfirmationPageProps {
  params: Promise<{ bookingId: string }>;
}

async function getBookingData(bookingId: string) {
  const supabase = await createClient();

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

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { bookingId } = await params;
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
    />
  );
}
