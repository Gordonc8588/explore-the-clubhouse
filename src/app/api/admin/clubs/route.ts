import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

/**
 * GET /api/admin/clubs
 * List all clubs with booking options
 */
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: clubs, error } = await supabase
      .from("clubs")
      .select(`
        *,
        booking_options (
          id,
          name,
          price_per_child,
          option_type,
          time_slot,
          is_active
        )
      `)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching clubs:", error);
      return NextResponse.json(
        { error: "Failed to fetch clubs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ clubs });
  } catch (error) {
    console.error("Error in GET /api/admin/clubs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const data = await request.json();

    // Create the club
    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image_url: data.imageUrl || null,
        start_date: data.startDate,
        end_date: data.endDate,
        morning_start: data.morningStart ? data.morningStart + ":00" : null,
        morning_end: data.morningEnd ? data.morningEnd + ":00" : null,
        afternoon_start: data.afternoonStart ? data.afternoonStart + ":00" : null,
        afternoon_end: data.afternoonEnd ? data.afternoonEnd + ":00" : null,
        min_age: data.minAge,
        max_age: data.maxAge,
        is_active: data.isActive,
      })
      .select()
      .single();

    if (clubError) {
      console.error("Error creating club:", clubError);
      return NextResponse.json(
        { error: "Failed to create club", details: clubError.message },
        { status: 500 }
      );
    }

    // Create club days
    if (data.days && data.days.length > 0) {
      const clubDays = data.days
        .filter((day: { isSkipped: boolean }) => !day.isSkipped)
        .map((day: { date: string; morningCapacity: number; afternoonCapacity: number }) => ({
          club_id: club.id,
          date: day.date,
          morning_capacity: day.morningCapacity,
          afternoon_capacity: day.afternoonCapacity,
          is_available: true,
        }));

      if (clubDays.length > 0) {
        const { error: daysError } = await supabase
          .from("club_days")
          .insert(clubDays);

        if (daysError) {
          console.error("Error creating club days:", daysError);
        }
      }
    }

    // Create booking options
    if (data.bookingOptions && data.bookingOptions.length > 0) {
      const options = data.bookingOptions.map((opt: {
        name: string;
        description: string;
        optionType: string;
        timeSlot: string;
        pricePerChild: number;
        sortOrder: number;
        isActive: boolean;
      }) => ({
        club_id: club.id,
        name: opt.name,
        description: opt.description || null,
        option_type: opt.optionType,
        time_slot: opt.timeSlot,
        price_per_child: opt.pricePerChild,
        sort_order: opt.sortOrder,
        is_active: opt.isActive,
      }));

      const { error: optionsError } = await supabase
        .from("booking_options")
        .insert(options);

      if (optionsError) {
        console.error("Error creating booking options:", optionsError);
      }
    }

    return NextResponse.json({ success: true, club });
  } catch (error) {
    console.error("Club creation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { slug, bookings_open } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("clubs")
      .update({ bookings_open })
      .eq("slug", slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, bookings_open });
  } catch (error) {
    console.error("Club patch error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const data = await request.json();
    const clubId = data.id;

    if (!clubId) {
      return NextResponse.json(
        { error: "Club ID is required" },
        { status: 400 }
      );
    }

    // Update the club
    const { error: clubError } = await supabase
      .from("clubs")
      .update({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image_url: data.imageUrl || null,
        start_date: data.startDate,
        end_date: data.endDate,
        morning_start: data.morningStart ? data.morningStart + ":00" : null,
        morning_end: data.morningEnd ? data.morningEnd + ":00" : null,
        afternoon_start: data.afternoonStart ? data.afternoonStart + ":00" : null,
        afternoon_end: data.afternoonEnd ? data.afternoonEnd + ":00" : null,
        min_age: data.minAge,
        max_age: data.maxAge,
        is_active: data.isActive,
      })
      .eq("id", clubId);

    if (clubError) {
      console.error("Error updating club:", clubError);
      return NextResponse.json(
        { error: "Failed to update club", details: clubError.message },
        { status: 500 }
      );
    }

    // Delete existing club days and recreate
    await supabase.from("club_days").delete().eq("club_id", clubId);

    if (data.days && data.days.length > 0) {
      const clubDays = data.days
        .filter((day: { isSkipped: boolean }) => !day.isSkipped)
        .map((day: { date: string; morningCapacity: number; afternoonCapacity: number }) => ({
          club_id: clubId,
          date: day.date,
          morning_capacity: day.morningCapacity,
          afternoon_capacity: day.afternoonCapacity,
          is_available: true,
        }));

      if (clubDays.length > 0) {
        await supabase.from("club_days").insert(clubDays);
      }
    }

    // Delete existing booking options and recreate
    await supabase.from("booking_options").delete().eq("club_id", clubId);

    if (data.bookingOptions && data.bookingOptions.length > 0) {
      const options = data.bookingOptions.map((opt: {
        name: string;
        description: string;
        optionType: string;
        timeSlot: string;
        pricePerChild: number;
        sortOrder: number;
        isActive: boolean;
      }) => ({
        club_id: clubId,
        name: opt.name,
        description: opt.description || null,
        option_type: opt.optionType,
        time_slot: opt.timeSlot,
        price_per_child: opt.pricePerChild,
        sort_order: opt.sortOrder,
        is_active: opt.isActive,
      }));

      await supabase.from("booking_options").insert(options);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Club update error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
