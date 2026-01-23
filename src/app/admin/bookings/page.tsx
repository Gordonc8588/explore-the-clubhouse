import Link from "next/link";
import {
  Search,
  Filter,
  PoundSterling,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BookingsTable } from "./BookingsTable";

async function getBookingsData() {
  const supabase = await createClient();

  // Get all bookings with related data
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      parent_name,
      parent_email,
      total_amount,
      status,
      created_at,
      clubs(id, name),
      children(id, name),
      booking_days(club_days(date))
    `)
    .order("created_at", { ascending: false });

  // Get unique clubs for filter dropdown
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return {
    bookings: bookings || [],
    clubs: clubs || [],
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function BookingsPage() {
  const { bookings, clubs } = await getBookingsData();

  // Transform bookings for the table
  const transformedBookings = bookings.map((booking: any) => {
    const childNames = booking.children?.map((c: { name: string }) => c.name) || [];
    const firstDate = booking.booking_days?.[0]?.club_days?.date;

    return {
      id: booking.id,
      ref: `ETC-${booking.id.slice(0, 8).toUpperCase()}`,
      parentName: booking.parent_name,
      email: booking.parent_email,
      club: booking.clubs?.name || "—",
      clubId: booking.clubs?.id || null,
      children: childNames,
      amount: (booking.total_amount || 0) / 100, // Convert pence to pounds
      status: booking.status,
      date: firstDate || booking.created_at,
    };
  });

  // Calculate summary stats
  const totalBookings = transformedBookings.length;
  const totalRevenue = transformedBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.amount, 0);

  // Get club names for filter
  const clubNames = ["All Clubs", ...clubs.map((c) => c.name)];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h2
          className="text-2xl font-bold"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--craigies-dark-olive)",
          }}
        >
          Bookings
        </h2>
        <p className="mt-1" style={{ color: "var(--craigies-dark-olive)" }}>
          Manage and view all booking records
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
            >
              <BookOpen className="h-6 w-6" style={{ color: "var(--craigies-olive)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Total Bookings
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {totalBookings}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
            >
              <PoundSterling className="h-6 w-6" style={{ color: "var(--craigies-burnt-orange)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Total Revenue
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                £{totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table (Client Component for filtering/pagination) */}
      <BookingsTable
        bookings={transformedBookings}
        clubs={clubNames}
      />
    </div>
  );
}
