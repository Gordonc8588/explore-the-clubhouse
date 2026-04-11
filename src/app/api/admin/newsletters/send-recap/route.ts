import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { sendNewsletter } from "@/lib/email";
import type { Newsletter, Club, PromoCode } from "@/types/database";

async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

function getWeekBounds(dateStr: string): { weekStart: string; weekEnd: string } {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diffToMonday);
  const friday = new Date(monday);
  friday.setUTCDate(monday.getUTCDate() + 4);
  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: friday.toISOString().slice(0, 10),
  };
}

async function getRecipients(supabase: ReturnType<typeof createAdminClient>, weekStart: string, weekEnd: string) {
  const { data: bookingDays, error } = await supabase
    .from("booking_days")
    .select(`
      bookings!inner(parent_email, status),
      club_days!inner(date)
    `)
    .gte("club_days.date", weekStart)
    .lte("club_days.date", weekEnd)
    .in("bookings.status", ["paid", "complete"]);

  if (error) throw new Error(error.message);

  const emailSet = new Set<string>();
  for (const row of bookingDays ?? []) {
    const booking = (Array.isArray(row.bookings) ? row.bookings[0] : row.bookings) as {
      parent_email: string;
    } | null;
    if (booking?.parent_email) {
      emailSet.add(booking.parent_email.toLowerCase().trim());
    }
  }

  return Array.from(emailSet).sort();
}

// GET /api/admin/newsletters/send-recap?newsletterId=X&date=Y
// Returns recipient preview without sending
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const newsletterId = searchParams.get("newsletterId");
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  if (!newsletterId) {
    return NextResponse.json({ error: "newsletterId is required" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { weekStart, weekEnd } = getWeekBounds(date);
    const recipients = await getRecipients(supabase, weekStart, weekEnd);

    return NextResponse.json({ recipients, weekStart, weekEnd });
  } catch (error) {
    console.error("Error previewing recap recipients:", error);
    return NextResponse.json({ error: "Failed to fetch recipients" }, { status: 500 });
  }
}

const sendRecapSchema = z.object({
  newsletterId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// POST /api/admin/newsletters/send-recap
// Sends the newsletter to parents booked that week
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = sendRecapSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { newsletterId, date } = parsed.data;
    const supabase = createAdminClient();

    // Fetch the newsletter
    const { data: newsletter, error: fetchError } = await supabase
      .from("newsletters")
      .select("*")
      .eq("id", newsletterId)
      .single();

    if (fetchError || !newsletter) {
      return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
    }

    // Fetch featured club if set
    let club: Club | null = null;
    if (newsletter.featured_club_id) {
      const { data } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", newsletter.featured_club_id)
        .single();
      club = data;
    }

    // Fetch promo code if set
    let promoCode: PromoCode | null = null;
    if (newsletter.promo_code_id) {
      const { data } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("id", newsletter.promo_code_id)
        .single();
      promoCode = data;
    }

    const { weekStart, weekEnd } = getWeekBounds(date);
    const recipientEmails = await getRecipients(supabase, weekStart, weekEnd);

    if (recipientEmails.length === 0) {
      return NextResponse.json(
        { error: `No paid bookings found for week ${weekStart} – ${weekEnd}` },
        { status: 400 }
      );
    }

    const result = await sendNewsletter(
      newsletter as Newsletter,
      recipientEmails,
      club,
      promoCode
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send newsletter", details: result.errors },
        { status: 500 }
      );
    }

    // Mark newsletter as sent
    await supabase
      .from("newsletters")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: result.sentCount,
      })
      .eq("id", newsletterId);

    return NextResponse.json({ success: true, sentCount: result.sentCount });
  } catch (error) {
    console.error("Error sending recap newsletter:", error);
    return NextResponse.json({ error: "Failed to send recap newsletter" }, { status: 500 });
  }
}
