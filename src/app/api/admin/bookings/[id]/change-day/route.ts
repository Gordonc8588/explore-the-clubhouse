import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

/**
 * POST /api/admin/bookings/[id]/change-day
 * Change a booking day to a different date, checking capacity first
 * Body: { bookingDayId, newClubDayId, timeSlot }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const { bookingDayId, newClubDayId, timeSlot } = await request.json();

    if (!bookingDayId || !newClubDayId) {
      return NextResponse.json(
        { error: "bookingDayId and newClubDayId are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify the booking exists and the booking_day belongs to it
    const { data: bookingDay, error: bdError } = await supabase
      .from("booking_days")
      .select("*")
      .eq("id", bookingDayId)
      .eq("booking_id", bookingId)
      .single();

    if (bdError || !bookingDay) {
      return NextResponse.json(
        { error: "Booking day not found" },
        { status: 404 }
      );
    }

    // Get the booking to know num_children for capacity check
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("num_children")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify the new club day exists and is available
    const { data: newDay, error: dayError } = await supabase
      .from("club_days")
      .select("*")
      .eq("id", newClubDayId)
      .single();

    if (dayError || !newDay) {
      return NextResponse.json(
        { error: "Target day not found" },
        { status: 404 }
      );
    }

    if (!newDay.is_available) {
      return NextResponse.json(
        { error: "That day is not available for bookings" },
        { status: 400 }
      );
    }

    // Check capacity using the RPC function
    const effectiveTimeSlot = timeSlot || bookingDay.time_slot;
    const { data: availability, error: availError } = await supabase
      .rpc("get_club_day_availability", { day_id: newClubDayId });

    if (availError || !availability) {
      console.error("Availability check error:", availError);
      return NextResponse.json(
        { error: "Failed to check availability" },
        { status: 500 }
      );
    }

    const avail = availability[0] || availability;
    const childrenCount = booking.num_children;

    // Check capacity based on time slot
    if (effectiveTimeSlot === "morning" || effectiveTimeSlot === "full_day") {
      const morningRemaining = avail.morning_capacity - avail.morning_booked;
      if (morningRemaining < childrenCount) {
        return NextResponse.json(
          {
            error: `Not enough morning capacity. Only ${morningRemaining} spot${morningRemaining !== 1 ? "s" : ""} remaining but this booking has ${childrenCount} child${childrenCount !== 1 ? "ren" : ""}.`,
          },
          { status: 400 }
        );
      }
    }

    if (effectiveTimeSlot === "afternoon" || effectiveTimeSlot === "full_day") {
      const afternoonRemaining = avail.afternoon_capacity - avail.afternoon_booked;
      if (afternoonRemaining < childrenCount) {
        return NextResponse.json(
          {
            error: `Not enough afternoon capacity. Only ${afternoonRemaining} spot${afternoonRemaining !== 1 ? "s" : ""} remaining but this booking has ${childrenCount} child${childrenCount !== 1 ? "ren" : ""}.`,
          },
          { status: 400 }
        );
      }
    }

    // All checks passed — update the booking day
    const { error: updateError } = await supabase
      .from("booking_days")
      .update({
        club_day_id: newClubDayId,
        time_slot: effectiveTimeSlot,
      })
      .eq("id", bookingDayId);

    if (updateError) {
      console.error("Error updating booking day:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking day" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      newDate: newDay.date,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/bookings/[id]/change-day:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/bookings/[id]/change-day?clubId=xxx
 * Get available days for a club with their capacity
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await params; // consume params

    const clubId = request.nextUrl.searchParams.get("clubId");
    if (!clubId) {
      return NextResponse.json(
        { error: "clubId is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get all available days for the club
    const { data: clubDays, error } = await supabase
      .from("club_days")
      .select("*")
      .eq("club_id", clubId)
      .eq("is_available", true)
      .order("date", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch club days" },
        { status: 500 }
      );
    }

    // Get availability for each day
    const daysWithAvailability = await Promise.all(
      (clubDays || []).map(async (day) => {
        const { data: avail } = await supabase.rpc(
          "get_club_day_availability",
          { day_id: day.id }
        );
        const a = avail?.[0] || avail;
        return {
          id: day.id,
          date: day.date,
          morningCapacity: day.morning_capacity,
          afternoonCapacity: day.afternoon_capacity,
          morningBooked: a?.morning_booked || 0,
          afternoonBooked: a?.afternoon_booked || 0,
        };
      })
    );

    return NextResponse.json({ days: daysWithAvailability });
  } catch (error) {
    console.error("Error in GET /api/admin/bookings/[id]/change-day:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
