import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingDetail } from "./BookingDetail";

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

async function getBookingData(bookingId: string) {
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      id,
      parent_name,
      parent_email,
      parent_phone,
      total_amount,
      status,
      created_at,
      clubs(id, name),
      children(
        id,
        name,
        date_of_birth,
        allergies,
        medical_notes,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        photo_consent,
        medical_consent
      ),
      booking_days(
        id,
        club_days(id, date, session_type)
      ),
      booking_options(
        id,
        name,
        price
      )
    `)
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return null;
  }

  return booking;
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default async function BookingDetailPage({ params }: BookingPageProps) {
  const { id } = await params;
  const booking = await getBookingData(id);

  if (!booking) {
    notFound();
  }

  // Transform booking data for the component
  const bookedDays = booking.booking_days?.map((bd: any) => ({
    date: bd.club_days?.date,
    dayName: new Date(bd.club_days?.date).toLocaleDateString("en-GB", { weekday: "long" }),
    sessionType: bd.club_days?.session_type,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  const children = booking.children?.map((child: {
    id: string;
    name: string;
    date_of_birth: string;
    allergies: string[] | null;
    medical_notes: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship: string | null;
    photo_consent: boolean | null;
    medical_consent: boolean | null;
  }) => ({
    id: child.id,
    name: child.name,
    dateOfBirth: child.date_of_birth,
    age: calculateAge(child.date_of_birth),
    allergies: child.allergies || [],
    medicalNotes: child.medical_notes || "",
    emergencyContact: {
      name: child.emergency_contact_name || "",
      phone: child.emergency_contact_phone || "",
      relationship: child.emergency_contact_relationship || "",
    },
    consents: {
      photoConsent: child.photo_consent ?? false,
      medicalConsent: child.medical_consent ?? false,
    },
  })) || [];

  const transformedBooking = {
    id: booking.id,
    ref: `ETC-${booking.id.slice(0, 8).toUpperCase()}`,
    status: booking.status,
    club: (booking.clubs as any)?.name || "—",
    option: (booking.booking_options as any)?.name || "—",
    startDate: bookedDays[0]?.date || booking.created_at,
    endDate: bookedDays[bookedDays.length - 1]?.date || booking.created_at,
    totalAmount: (booking.total_amount || 0) / 100, // Convert pence to pounds
    bookedDays,
    parent: {
      name: booking.parent_name,
      email: booking.parent_email,
      phone: booking.parent_phone || "",
    },
    children,
    createdAt: booking.created_at,
  };

  return <BookingDetail booking={transformedBooking} />;
}
