import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DailyAttendanceView } from "./DailyAttendanceView";

interface DailyPageProps {
  params: Promise<{ date: string }>;
}

async function getAttendanceData(date: string) {
  const supabase = await createClient();

  // Get all booking_days for this date with related data
  const { data: bookingDays, error } = await supabase
    .from("booking_days")
    .select(`
      id,
      time_slot,
      club_days!inner(
        id,
        date
      ),
      bookings!inner(
        id,
        parent_name,
        parent_phone,
        status,
        children(
          id,
          name,
          date_of_birth,
          allergies,
          medical_notes,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relationship,
          emergency_contact_2_name,
          emergency_contact_2_phone,
          emergency_contact_2_relationship
        )
      )
    `)
    .eq("club_days.date", date)
    .in("bookings.status", ["paid", "complete"]);

  if (error || !bookingDays) {
    return [];
  }

  // Transform data into attendance records
  const attendance: {
    id: string;
    name: string;
    parentName: string;
    parentPhone: string;
    session: "AM" | "PM" | "Full";
    allergies: string[];
    medicalNotes: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    emergencyContact2: {
      name: string;
      phone: string;
      relationship: string;
    };
  }[] = [];

  for (const bd of bookingDays) {
    const booking = (bd as any).bookings;
    const timeSlot = (bd as any).time_slot;

    if (!booking || !booking.children) continue;

    for (const child of booking.children) {
      // Map time_slot to display format
      let session: "AM" | "PM" | "Full" = "Full";
      if (timeSlot === "morning") session = "AM";
      else if (timeSlot === "afternoon") session = "PM";

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

      attendance.push({
        id: child.id,
        name: child.name,
        parentName: booking.parent_name,
        parentPhone: booking.parent_phone || "",
        session,
        allergies: allergiesArray,
        medicalNotes: child.medical_notes || "",
        emergencyContact: {
          name: child.emergency_contact_name || "",
          phone: child.emergency_contact_phone || "",
          relationship: child.emergency_contact_relationship || "",
        },
        emergencyContact2: {
          name: child.emergency_contact_2_name || "",
          phone: child.emergency_contact_2_phone || "",
          relationship: child.emergency_contact_2_relationship || "",
        },
      });
    }
  }

  // Remove duplicates (same child might be in multiple booking_days)
  const uniqueAttendance = attendance.filter(
    (child, index, self) => index === self.findIndex((c) => c.id === child.id)
  );

  return uniqueAttendance;
}

export default async function DailyAttendancePage({ params }: DailyPageProps) {
  const { date } = await params;
  const attendance = await getAttendanceData(date);

  return <DailyAttendanceView date={date} attendance={attendance} />;
}
