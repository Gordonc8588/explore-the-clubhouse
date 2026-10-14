import { verifyAdminSessionToken } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get("admin-session")?.value);
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
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    // Sync club days in place. Days with bookings can't be deleted (FK RESTRICT),
    // so update existing rows by date rather than delete-and-recreate.
    const { data: existingDays, error: existingDaysError } = await supabase
      .from("club_days")
      .select("id, date, booking_days(count)")
      .eq("club_id", clubId);

    if (existingDaysError) {
      console.error("Error loading club days:", existingDaysError);
      return NextResponse.json(
        { error: "Failed to load club days", details: existingDaysError.message },
        { status: 500 }
      );
    }

    const wantedDays = ((data.days || []) as Array<{
      date: string;
      morningCapacity: number;
      afternoonCapacity: number;
      isSkipped: boolean;
    }>).filter((day) => !day.isSkipped);
    const wantedDates = new Set(wantedDays.map((day) => day.date));
    const existingByDate = new Map((existingDays || []).map((day) => [day.date, day]));

    for (const day of wantedDays) {
      const existing = existingByDate.get(day.date);
      const values = {
        morning_capacity: day.morningCapacity,
        afternoon_capacity: day.afternoonCapacity,
        is_available: true,
      };
      const { error } = existing
        ? await supabase.from("club_days").update(values).eq("id", existing.id)
        : await supabase.from("club_days").insert({ ...values, club_id: clubId, date: day.date });

      if (error) {
        console.error(`Error saving club day ${day.date}:`, error);
        return NextResponse.json(
          { error: `Failed to save ${day.date}`, details: error.message },
          { status: 500 }
        );
      }
    }

    // Days removed from the form: delete if unbooked, otherwise mark unavailable
    for (const day of existingDays || []) {
      if (wantedDates.has(day.date)) continue;
      const bookingCount = (day.booking_days as unknown as Array<{ count: number }>)?.[0]?.count ?? 0;
      const { error } = bookingCount === 0
        ? await supabase.from("club_days").delete().eq("id", day.id)
        : await supabase.from("club_days").update({ is_available: false }).eq("id", day.id);

      if (error) {
        console.error(`Error removing club day ${day.date}:`, error);
        return NextResponse.json(
          { error: `Failed to remove ${day.date}`, details: error.message },
          { status: 500 }
        );
      }
    }

    // Sync booking options in place (bookings reference them, so never recreate)
    const { data: existingOptions, error: existingOptionsError } = await supabase
      .from("booking_options")
      .select("id")
      .eq("club_id", clubId);

    if (existingOptionsError) {
      console.error("Error loading booking options:", existingOptionsError);
      return NextResponse.json(
        { error: "Failed to load booking options", details: existingOptionsError.message },
        { status: 500 }
      );
    }

    const existingOptionIds = new Set((existingOptions || []).map((opt) => opt.id));
    const keptOptionIds = new Set<string>();

    for (const opt of (data.bookingOptions || []) as Array<{
      id?: string;
      name: string;
      description: string;
      optionType: string;
      timeSlot: string;
      pricePerChild: number;
      sortOrder: number;
      isActive: boolean;
    }>) {
      const values = {
        name: opt.name,
        description: opt.description || null,
        option_type: opt.optionType,
        time_slot: opt.timeSlot,
        price_per_child: opt.pricePerChild,
        sort_order: opt.sortOrder,
        is_active: opt.isActive,
      };
      const isExisting = !!opt.id && existingOptionIds.has(opt.id);
      if (isExisting) keptOptionIds.add(opt.id!);

      const { error } = isExisting
        ? await supabase.from("booking_options").update(values).eq("id", opt.id!)
        : await supabase.from("booking_options").insert({ ...values, club_id: clubId });

      if (error) {
        console.error(`Error saving booking option ${opt.name}:`, error);
        return NextResponse.json(
          { error: `Failed to save option "${opt.name}"`, details: error.message },
          { status: 500 }
        );
      }
    }

    // Options removed from the form: delete, or deactivate if bookings use them
    for (const id of existingOptionIds) {
      if (keptOptionIds.has(id)) continue;
      const { error: deleteError } = await supabase.from("booking_options").delete().eq("id", id);
      if (deleteError) {
        const { error } = await supabase
          .from("booking_options")
          .update({ is_active: false })
          .eq("id", id);
        if (error) {
          console.error(`Error removing booking option ${id}:`, error);
          return NextResponse.json(
            { error: "Failed to remove booking option", details: error.message },
            { status: 500 }
          );
        }
      }
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
