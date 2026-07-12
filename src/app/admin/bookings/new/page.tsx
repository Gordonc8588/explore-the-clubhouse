import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { NewBookingForm } from "./NewBookingForm";

export const dynamic = "force-dynamic";

export default async function NewBookingPage() {
  const supabase = createAdminClient();

  const { data: clubs } = await supabase
    .from("clubs")
    .select(`
      id,
      name,
      start_date,
      end_date,
      booking_options(id, name, option_type, time_slot, price_per_child, is_active, sort_order)
    `)
    .eq("is_active", true)
    .order("start_date", { ascending: true });

  const transformedClubs = (clubs || []).map((club) => ({
    id: club.id,
    name: club.name,
    startDate: club.start_date,
    endDate: club.end_date,
    options: (club.booking_options || [])
      .filter((o: { is_active: boolean }) => o.is_active)
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((o: { id: string; name: string; option_type: string; time_slot: string; price_per_child: number }) => ({
        id: o.id,
        name: o.name,
        optionType: o.option_type,
        timeSlot: o.time_slot,
        pricePerChild: o.price_per_child,
      })),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <Link
          href="/admin/bookings"
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium hover:underline"
          style={{ color: "var(--craigies-burnt-orange)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bookings
        </Link>
        <h2
          className="text-2xl font-bold"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--craigies-dark-olive)",
          }}
        >
          Add Manual Booking
        </h2>
        <p className="mt-1" style={{ color: "var(--craigies-dark-olive)" }}>
          Create a free (£0) booking — e.g. comped spaces for friends. The parent gets the
          usual confirmation email with the link to fill in their children&apos;s details.
        </p>
      </div>

      <NewBookingForm clubs={transformedClubs} />
    </div>
  );
}
