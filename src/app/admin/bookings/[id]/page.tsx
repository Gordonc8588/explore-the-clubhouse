import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { BookingDetail } from "./BookingDetail";

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

async function getBookingData(bookingId: string) {
  const supabase = createAdminClient();

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

  // Active clubs the booking could be rescheduled into (incl. other weeks).
  const supabase = createAdminClient();
  const { data: clubRows } = await supabase
    .from("clubs")
    .select("id, name, start_date")
    .eq("is_active", true)
    .order("start_date", { ascending: true });
  const availableClubs = (clubRows || []).map(
    (c: { id: string; name: string; start_date: string }) => ({
      id: c.id,
      name: c.name,
      startDate: c.start_date,
    })
  );

  // Pending add-days payment requests awaiting the parent's payment.
  const { data: pendingMods } = await supabase
    .from("booking_modifications")
    .select("id, delta_pence, created_at")
    .eq("booking_id", id)
    .eq("status", "pending")
    .eq("direction", "charge")
    .order("created_at", { ascending: false });
  const pendingUpcharges = (pendingMods || []).map(
    (m: { id: string; delta_pence: number | null; created_at: string }) => ({
      id: m.id,
      deltaPence: m.delta_pence ?? 0,
      createdAt: m.created_at,
    })
  );

  // Full modification history (audit trail) for this booking.
  const { data: modRows } = await supabase
    .from("booking_modifications")
    .select(
      "id, modification_type, direction, status, old_total_pence, new_total_pence, delta_pence, refund_amount_pence, reason, admin_actor, created_at, applied_at"
    )
    .eq("booking_id", id)
    .order("created_at", { ascending: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modifications = (modRows || []).map((m: any) => ({
    id: m.id,
    type: m.modification_type as string,
    direction: m.direction as string,
    status: m.status as string,
    oldTotalPence: m.old_total_pence as number | null,
    newTotalPence: m.new_total_pence as number | null,
    deltaPence: m.delta_pence as number | null,
    refundAmountPence: m.refund_amount_pence as number | null,
    reason: m.reason as string | null,
    adminActor: m.admin_actor as string | null,
    createdAt: m.created_at as string,
    appliedAt: m.applied_at as string | null,
  }));

  // Transform booking data for the component
  const bookedDays = booking.booking_days?.map((bd: any) => ({
    bookingDayId: bd.id,
    clubDayId: bd.club_day_id,
    date: bd.club_days?.date,
    dayName: new Date(bd.club_days?.date).toLocaleDateString("en-GB", { weekday: "long" }),
    timeSlot: bd.time_slot,
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

    // Build pickup persons array from individual fields
    const pickupPersons = [];
    if (child.pickup_person_1_name) {
      pickupPersons.push({
        name: child.pickup_person_1_name,
        phone: child.pickup_person_1_phone || "",
        relationship: child.pickup_person_1_relationship || "",
      });
    }
    if (child.pickup_person_2_name) {
      pickupPersons.push({
        name: child.pickup_person_2_name,
        phone: child.pickup_person_2_phone || "",
        relationship: child.pickup_person_2_relationship || "",
      });
    }
    if (child.pickup_person_3_name) {
      pickupPersons.push({
        name: child.pickup_person_3_name,
        phone: child.pickup_person_3_phone || "",
        relationship: child.pickup_person_3_relationship || "",
      });
    }

    return {
      id: child.id,
      name: child.name,
      dateOfBirth: child.date_of_birth,
      age: calculateAge(child.date_of_birth),
      allergies: allergiesArray,
      medicalNotes: child.medical_notes || "",
      emergencyContact1: {
        name: child.emergency_contact_name || "",
        phone: child.emergency_contact_phone || "",
        relationship: child.emergency_contact_relationship || "",
      },
      emergencyContact2: {
        name: child.emergency_contact_2_name || "",
        phone: child.emergency_contact_2_phone || "",
        relationship: child.emergency_contact_2_relationship || "",
      },
      pickupPersons,
      consents: {
        photoConsent: child.photo_consent ?? false,
        activityConsent: child.activity_consent ?? false,
        medicalConsent: child.medical_consent ?? false,
        farmAnimalConsent: child.farm_animal_consent ?? false,
        woodlandConsent: child.woodland_consent ?? false,
      },
      parentNotes: child.parent_notes || "",
    };
  }) || [];

  const transformedBooking = {
    id: booking.id,
    ref: `ETC-${booking.id.slice(0, 8).toUpperCase()}`,
    status: booking.status,
    clubId: (booking.clubs as any)?.id || "",
    club: (booking.clubs as any)?.name || "—",
    option: (booking.booking_options as any)?.name || "—",
    startDate: bookedDays[0]?.date || booking.created_at,
    endDate: bookedDays[bookedDays.length - 1]?.date || booking.created_at,
    totalAmount: (booking.total_amount || 0) / 100, // Convert pence to pounds
    numChildren: booking.num_children,
    bookedDays,
    parent: {
      name: booking.parent_name,
      email: booking.parent_email,
      phone: booking.parent_phone || "",
    },
    children,
    createdAt: booking.created_at,
  };

  return (
    <BookingDetail
      booking={transformedBooking}
      availableClubs={availableClubs}
      pendingUpcharges={pendingUpcharges}
      modifications={modifications}
    />
  );
}
