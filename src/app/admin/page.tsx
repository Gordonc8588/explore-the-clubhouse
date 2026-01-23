import Link from "next/link";
import {
  Users,
  CalendarDays,
  PoundSterling,
  AlertCircle,
  Eye,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getTodayFormatted(): string {
  const today = new Date();
  return today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function getDashboardData() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date();
  monthStart.setDate(1);

  // Get today's attendance (children booked for today)
  const { count: todayAttendance } = await supabase
    .from("booking_days")
    .select("*, club_days!inner(*), bookings!inner(*)", { count: "exact", head: true })
    .eq("club_days.date", today)
    .in("bookings.status", ["paid", "complete"]);

  // Get this week's bookings
  const { count: weekBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekStart.toISOString())
    .in("status", ["paid", "complete"]);

  // Get this month's revenue
  const { data: monthRevenueData } = await supabase
    .from("bookings")
    .select("total_amount")
    .gte("created_at", monthStart.toISOString())
    .in("status", ["paid", "complete"]);

  const monthRevenue = monthRevenueData?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

  // Get incomplete bookings (paid but no children info)
  const { data: incompleteData } = await supabase
    .from("bookings")
    .select(`
      id,
      parent_name,
      parent_email,
      num_children,
      created_at,
      children(id)
    `)
    .eq("status", "paid");

  const incompleteBookings = incompleteData?.filter(
    (b) => !b.children || b.children.length < b.num_children
  ) || [];

  // Get recent bookings with child info
  const { data: recentBookings } = await supabase
    .from("bookings")
    .select(`
      id,
      parent_name,
      status,
      created_at,
      clubs(name),
      children(name),
      booking_days(club_days(date))
    `)
    .in("status", ["paid", "complete"])
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    stats: {
      todayAttendance: todayAttendance || 0,
      weekBookings: weekBookings || 0,
      monthRevenue: monthRevenue / 100, // Convert pence to pounds
      incompleteBookings: incompleteBookings.length,
    },
    recentBookings: recentBookings || [],
    incompleteBookings: incompleteBookings || [],
  };
}

export default async function AdminDashboard() {
  const { stats, recentBookings, incompleteBookings } = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h2
          className="text-2xl font-bold"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--craigies-dark-olive)",
          }}
        >
          Welcome back!
        </h2>
        <p className="mt-1" style={{ color: "var(--craigies-dark-olive)" }}>
          {getTodayFormatted()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Attendance */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
            >
              <Users className="h-6 w-6" style={{ color: "var(--craigies-olive)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Today&apos;s Attendance
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {stats.todayAttendance}
              </p>
            </div>
          </div>
        </div>

        {/* This Week's Bookings */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
            >
              <CalendarDays className="h-6 w-6" style={{ color: "var(--craigies-burnt-orange)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Week&apos;s Bookings
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {stats.weekBookings}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
            >
              <PoundSterling className="h-6 w-6" style={{ color: "var(--craigies-olive)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Revenue This Month
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                £{stats.monthRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Incomplete Bookings */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
            >
              <AlertCircle className="h-6 w-6" style={{ color: "var(--craigies-burnt-orange)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Incomplete Bookings
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {stats.incompleteBookings}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/daily"
          className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--craigies-burnt-orange)",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          <Eye className="h-5 w-5" />
          View Today
        </Link>
        <Link
          href="/admin/clubs/new"
          className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold border-2 transition-colors"
          style={{
            borderColor: "var(--craigies-dark-olive)",
            color: "var(--craigies-dark-olive)",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          <Plus className="h-5 w-5" />
          New Club
        </Link>
      </div>

      {/* Recent Bookings Table */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h3
          className="text-lg font-bold"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--craigies-dark-olive)",
          }}
        >
          Recent Bookings
        </h3>
        {recentBookings.length === 0 ? (
          <p className="mt-4" style={{ color: "var(--craigies-dark-olive)" }}>
            No bookings yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: "rgba(122, 124, 74, 0.2)" }}
                >
                  <th
                    className="pb-3 text-left text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Booking ID
                  </th>
                  <th
                    className="pb-3 text-left text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Parent
                  </th>
                  <th
                    className="pb-3 text-left text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Child
                  </th>
                  <th
                    className="pb-3 text-left text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Club
                  </th>
                  <th
                    className="pb-3 text-left text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Date
                  </th>
                  <th
                    className="pb-3 text-left text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(122, 124, 74, 0.2)" }}>
                {recentBookings.map((booking: any) => (
                  <tr
                    key={booking.id}
                    className="transition-colors hover:bg-[#f5f4ed]"
                  >
                    <td className="py-3 text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                      {booking.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                      {booking.parent_name}
                    </td>
                    <td className="py-3 text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                      {booking.children?.[0]?.name || "—"}
                    </td>
                    <td className="py-3 text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                      {(booking.clubs as any)?.name || "—"}
                    </td>
                    <td className="py-3 text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                      {(booking.booking_days as any)?.[0]?.club_days?.date
                        ? formatDate((booking.booking_days as any)[0].club_days.date)
                        : "—"}
                    </td>
                    <td className="py-3">
                      <span
                        className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor:
                            booking.status === "complete"
                              ? "rgba(122, 124, 74, 0.1)"
                              : booking.status === "paid"
                              ? "rgba(212, 132, 62, 0.1)"
                              : "rgba(245, 158, 11, 0.1)",
                          color:
                            booking.status === "complete"
                              ? "var(--craigies-olive)"
                              : booking.status === "paid"
                              ? "var(--craigies-burnt-orange)"
                              : "#d97706",
                        }}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incomplete Bookings Alert Section */}
      {incompleteBookings.length > 0 && (
        <div
          className="rounded-2xl border-2 p-6"
          style={{
            borderColor: "rgba(212, 132, 62, 0.3)",
            backgroundColor: "rgba(212, 132, 62, 0.05)",
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6" style={{ color: "var(--craigies-burnt-orange)" }} />
            <h3
              className="text-lg font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Bookings Requiring Attention
            </h3>
          </div>
          <p className="mt-2 text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
            The following bookings have incomplete child information and need
            follow-up.
          </p>
          <div className="mt-4 space-y-3">
            {incompleteBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-lg bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p
                      className="font-semibold"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "var(--craigies-dark-olive)",
                      }}
                    >
                      {booking.parent_name}
                    </p>
                    <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                      {booking.parent_email}
                    </p>
                  </div>
                  <span className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                    {formatDate(booking.created_at)}
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  <span className="font-medium" style={{ color: "var(--craigies-burnt-orange)" }}>
                    Missing:
                  </span>{" "}
                  <span style={{ color: "var(--craigies-dark-olive)" }}>
                    {booking.num_children - (booking.children?.length || 0)} child record(s)
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
