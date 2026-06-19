import { verifyAdminSessionToken } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get("admin-session")?.value);
}

/**
 * POST /api/admin/bookings/[id]/change-day
 * Move ONE booked day to a different date in the SAME week, atomically and
 * capacity-checked, via the apply_booking_modification RPC.
 * Body: { bookingDayId, newClubDayId, timeSlot }
 * (Cross-week moves are a separate reschedule flow — Phase 3.)
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

    // Load the booking aggregate (unchanged by a same-week day move).
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, club_id, booking_option_id, num_children, total_amount")
      .eq("id", bookingId)
      .single();
    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Load all of the booking's days (the RPC replaces the whole set).
    const { data: bookingDays, error: bdError } = await supabase
      .from("booking_days")
      .select("id, club_day_id, time_slot")
      .eq("booking_id", bookingId);
    if (bdError || !bookingDays || bookingDays.length === 0) {
      return NextResponse.json({ error: "Booking days not found" }, { status: 404 });
    }

    const target = bookingDays.find((d) => d.id === bookingDayId);
    if (!target) {
      return NextResponse.json({ error: "Booking day not found" }, { status: 404 });
    }

    // Confirm the new day exists, is available, and is in THIS week.
    const { data: newDay, error: dayError } = await supabase
      .from("club_days")
      .select("id, date, club_id, is_available")
      .eq("id", newClubDayId)
      .single();
    if (dayError || !newDay) {
      return NextResponse.json({ error: "Target day not found" }, { status: 404 });
    }
    if (newDay.club_id !== booking.club_id) {
      return NextResponse.json(
        { error: "That day is in a different week. Use Reschedule to move weeks." },
        { status: 400 }
      );
    }
    if (!newDay.is_available) {
      return NextResponse.json(
        { error: "That day is not available for bookings" },
        { status: 400 }
      );
    }

    // Don't allow moving onto a date the booking already holds.
    if (bookingDays.some((d) => d.id !== bookingDayId && d.club_day_id === newClubDayId)) {
      return NextResponse.json(
        { error: "That day is already part of this booking." },
        { status: 400 }
      );
    }

    // Build the full new day-set: swap only the target day.
    const effectiveTimeSlot = timeSlot || target.time_slot;
    const days = bookingDays.map((d) =>
      d.id === bookingDayId
        ? { club_day_id: newClubDayId, time_slot: effectiveTimeSlot }
        : { club_day_id: d.club_day_id, time_slot: d.time_slot }
    );

    // Atomic, locked, capacity-checked mutation. No price change for a same-week move.
    const { error: rpcError } = await supabase.rpc("apply_booking_modification", {
      p_booking_id: bookingId,
      p_new_club_id: booking.club_id,
      p_new_option_id: booking.booking_option_id,
      p_new_children: booking.num_children,
      p_new_total: booking.total_amount,
      p_days: days,
      p_modification_type: "change_day",
      p_admin_actor: process.env.ADMIN_EMAIL || "admin",
      p_direction: "none",
      p_delta_pence: 0,
      p_old_state: { club_day_id: target.club_day_id, time_slot: target.time_slot },
      p_new_state: { club_day_id: newClubDayId, time_slot: effectiveTimeSlot },
    });

    if (rpcError) {
      // User-fixable conditions (capacity, availability, validation) are tagged
      // check_violation (SQLSTATE 23514) in the RPC; surface those. Anything else
      // is an internal error — log it and return a generic message (no raw leak).
      if (rpcError.code === "23514") {
        return NextResponse.json({ error: rpcError.message }, { status: 400 });
      }
      console.error("apply_booking_modification failed:", rpcError);
      return NextResponse.json(
        { error: "Couldn't change the day — please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, newDate: newDay.date });
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
