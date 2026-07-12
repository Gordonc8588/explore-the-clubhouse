import { verifyAdminSessionToken } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { sendBookingConfirmation } from "@/lib/email";
import { bookingTokenQuery } from "@/lib/booking-access";

async function isAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get("admin-session")?.value);
}

/**
 * GET /api/admin/bookings?clubId=xxx
 * Days for a club with per-slot availability (for the manual booking form).
 */
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clubId = request.nextUrl.searchParams.get("clubId");
    if (!clubId) {
      return NextResponse.json({ error: "clubId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: clubDays, error } = await supabase
      .from("club_days")
      .select("*")
      .eq("club_id", clubId)
      .eq("is_available", true)
      .order("date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch club days" }, { status: 500 });
    }

    const daysWithAvailability = await Promise.all(
      (clubDays || []).map(async (day) => {
        const { data: avail } = await supabase.rpc("get_club_day_availability", {
          day_id: day.id,
        });
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
    console.error("Error in GET /api/admin/bookings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createBookingSchema = z.object({
  clubId: z.string().uuid(),
  bookingOptionId: z.string().uuid(),
  // Dates to seat (YYYY-MM-DD). Ignored for full_week options, which seat every day.
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).default([]),
  numChildren: z.number().int().min(1).max(10),
  parentName: z.string().trim().min(1).max(200),
  parentEmail: z.string().trim().email(),
  parentPhone: z.string().trim().min(5).max(30),
  sendEmail: z.boolean().default(true),
  reason: z.string().trim().max(500).optional(),
});

/**
 * POST /api/admin/bookings
 * Create a FREE (£0) manual booking — e.g. comped spaces for friends. Mirrors
 * what the Stripe webhook does for a paid booking, but with no Stripe call:
 * status 'paid' at £0 with a 100% discount recorded. The parent then completes
 * child info via the tokenized /complete link (sent by email unless disabled),
 * which flips the booking to 'complete' like any other family.
 */
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = createBookingSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    const { clubId, bookingOptionId, dates, numChildren, parentName, parentEmail, parentPhone, sendEmail, reason } = parsed.data;

    const supabase = createAdminClient();

    // Validate the club + option pairing.
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .select("*")
      .eq("id", clubId)
      .single();
    if (clubError || !club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const { data: option, error: optionError } = await supabase
      .from("booking_options")
      .select("id, club_id, option_type, time_slot")
      .eq("id", bookingOptionId)
      .single();
    if (optionError || !option) {
      return NextResponse.json({ error: "Booking option not found" }, { status: 404 });
    }
    if (option.club_id !== clubId) {
      return NextResponse.json(
        { error: "That booking option belongs to a different club" },
        { status: 400 }
      );
    }

    const timeSlot = option.time_slot || "full_day";

    // Resolve the days to seat — same rules as the webhook: full week books ALL
    // club days (including ones closed for standalone booking); otherwise the
    // admin's selected dates.
    let daysToSeat: { club_day_id: string; time_slot: string }[] = [];
    let seatedDates: string[] = [];

    if (option.option_type === "full_week") {
      const { data: allClubDays } = await supabase
        .from("club_days")
        .select("id, date")
        .eq("club_id", clubId);
      daysToSeat = (allClubDays || []).map((d) => ({ club_day_id: d.id, time_slot: timeSlot }));
      seatedDates = (allClubDays || []).map((d) => d.date);
    } else {
      if (dates.length === 0) {
        return NextResponse.json({ error: "Select at least one day" }, { status: 400 });
      }
      const { data: clubDays } = await supabase
        .from("club_days")
        .select("id, date, is_available")
        .eq("club_id", clubId)
        .in("date", dates);
      const found = clubDays || [];
      if (found.length !== dates.length) {
        return NextResponse.json(
          { error: "One or more selected dates don't exist for this club" },
          { status: 400 }
        );
      }
      const unavailable = found.filter((d) => !d.is_available);
      if (unavailable.length > 0) {
        return NextResponse.json(
          { error: `Not available for booking: ${unavailable.map((d) => d.date).join(", ")}` },
          { status: 400 }
        );
      }
      daysToSeat = found.map((d) => ({ club_day_id: d.id, time_slot: timeSlot }));
      seatedDates = found.map((d) => d.date);
    }

    if (daysToSeat.length === 0) {
      return NextResponse.json({ error: "This club has no days to book" }, { status: 400 });
    }
    seatedDates.sort();

    // Create the £0 booking (status 'paid', no children yet — parent adds them
    // via the /complete link).
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        club_id: clubId,
        booking_option_id: bookingOptionId,
        parent_name: parentName,
        parent_email: parentEmail,
        parent_phone: parentPhone,
        num_children: numChildren,
        total_amount: 0,
        status: "paid",
        discount_percent_applied: 100,
        amount_refunded_pence: 0,
        promo_code_id: null,
        stripe_payment_intent_id: null,
        stripe_checkout_session_id: null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (insertError || !booking) {
      console.error("Manual booking insert failed:", insertError);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // Seat the days atomically + capacity-checked (same RPC as the live flow).
    // Unlike the webhook, no money has changed hands, so on failure we can just
    // roll the booking back and let the admin fix the selection.
    const { error: seatError } = await supabase.rpc("create_initial_booking_days", {
      p_booking_id: booking.id,
      p_club_id: clubId,
      p_days: daysToSeat,
      p_num_children: numChildren,
    });
    if (seatError) {
      await supabase.from("bookings").delete().eq("id", booking.id);
      if (seatError.code === "23514") {
        return NextResponse.json(
          { error: "One of the selected days doesn't have enough space for that many children." },
          { status: 400 }
        );
      }
      console.error("create_initial_booking_days failed for manual booking:", seatError);
      return NextResponse.json(
        { error: "Couldn't reserve the days — please try again." },
        { status: 500 }
      );
    }

    // Traceability audit row (best-effort).
    await supabase.from("booking_modifications").insert({
      booking_id: booking.id,
      admin_actor: process.env.ADMIN_EMAIL || "admin",
      modification_type: "edit",
      direction: "none",
      status: "applied",
      old_total_pence: 0,
      new_total_pence: 0,
      delta_pence: 0,
      reason: reason || "Free manual booking created from admin dashboard (100% discount).",
      new_state: {
        club_id: clubId,
        option_id: bookingOptionId,
        num_children: numChildren,
        total_pence: 0,
        days: daysToSeat,
        dates: seatedDates,
      },
      applied_at: new Date().toISOString(),
    });

    // Send the standard confirmation email (includes the tokenized child-info link).
    let emailSent = false;
    let emailError: string | undefined;
    if (sendEmail) {
      const result = await sendBookingConfirmation(booking, club, timeSlot, seatedDates);
      emailSent = result.success;
      if (!result.success) emailError = result.error;
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://exploretheclubhouse.co.uk").replace(/\/$/, "");
    const completeUrl = `${siteUrl}/complete/${booking.id}${bookingTokenQuery(booking.id)}`;

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      ref: `ETC-${booking.id.slice(0, 8).toUpperCase()}`,
      dates: seatedDates,
      completeUrl,
      emailSent,
      emailError,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/bookings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
