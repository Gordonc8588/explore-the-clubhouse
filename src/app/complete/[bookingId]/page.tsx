import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompleteForm } from "./CompleteForm";

interface CompletePageProps {
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

  return {
    booking,
    club: booking.clubs,
    bookingOption: booking.booking_options,
    children: booking.children || [],
  };
}

export default async function CompletePage({ params }: CompletePageProps) {
  const { bookingId } = await params;
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
    />
  );
}
