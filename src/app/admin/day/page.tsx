import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getFirstEventDate(): Promise<string> {
  const supabase = await createClient();

  // Get the earliest club_day that has bookings with paid/complete status
  const { data: firstDay } = await supabase
    .from("club_days")
    .select("date, booking_days!inner(bookings!inner(status))")
    .in("booking_days.bookings.status", ["paid", "complete"])
    .order("date", { ascending: true })
    .limit(1)
    .single();

  if (firstDay?.date) {
    return firstDay.date;
  }

  // Fallback to today's date if no events found
  return new Date().toISOString().split("T")[0];
}

export default async function DailyViewRedirect() {
  const firstEventDate = await getFirstEventDate();
  redirect(`/admin/day/${firstEventDate}`);
}
