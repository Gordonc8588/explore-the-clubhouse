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
      *,
      clubs (*),
      booking_options (*),
      children (*),
      booking_days(*, club_days(*))
    `)
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    console.error('Booking fetch error:', error);
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
  })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  const children = booking.children?.map((child: any) => {
    // Convert allergies text to array
    const allergiesText = child.allergies || "";
    const allergiesLower = allergiesText.trim().toLowerCase();

    // Check if allergies is empty or contains common "none" variations
    const isNoAllergies = allergiesLower === "" ||
                          allergiesLower === "none" ||
                          allergiesLower === "n/a" ||
                          allergiesLower === "no";

    const allergiesArray = isNoAllergies
      ? []
      : allergiesText.split(',').map((a: string) => a.trim()).filter((a: string) => a);

    return {
      id: child.id,
      name: child.name,
      dateOfBirth: child.date_of_birth,
      age: calculateAge(child.date_of_birth),
      allergies: allergiesArray,
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
    };
  }) || [];

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
