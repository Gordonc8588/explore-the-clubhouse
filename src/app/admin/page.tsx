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
      <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
        <h2 className="font-display text-2xl font-bold text-bark">
          Welcome back!
        </h2>
        <p className="mt-1 font-body text-stone">{getTodayFormatted()}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Attendance */}
        <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-forest/10 p-3">
              <Users className="h-6 w-6 text-forest" />
            </div>
            <div>
              <p className="font-body text-sm text-stone">Today&apos;s Attendance</p>
              <p className="font-display text-2xl font-bold text-bark">
                {stats.todayAttendance}
              </p>
            </div>
          </div>
        </div>

        {/* This Week's Bookings */}
        <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-meadow/10 p-3">
              <CalendarDays className="h-6 w-6 text-meadow" />
            </div>
            <div>
              <p className="font-body text-sm text-stone">Week&apos;s Bookings</p>
              <p className="font-display text-2xl font-bold text-bark">
                {stats.weekBookings}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-sunshine/10 p-3">
              <PoundSterling className="h-6 w-6 text-amber" />
            </div>
            <div>
              <p className="font-body text-sm text-stone">Revenue This Month</p>
              <p className="font-display text-2xl font-bold text-bark">
                £{stats.monthRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Incomplete Bookings */}
        <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-coral/10 p-3">
              <AlertCircle className="h-6 w-6 text-coral" />
            </div>
            <div>
              <p className="font-body text-sm text-stone">Incomplete Bookings</p>
              <p className="font-display text-2xl font-bold text-bark">
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
          className="inline-flex items-center gap-2 rounded-lg bg-sunshine px-6 py-3 font-display font-semibold text-bark transition-colors hover:bg-amber"
        >
          <Eye className="h-5 w-5" />
          View Today
        </Link>
        <Link
          href="/admin/clubs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-forest px-6 py-3 font-display font-semibold text-white transition-colors hover:bg-meadow"
        >
          <Plus className="h-5 w-5" />
          New Club
        </Link>
      </div>

      {/* Recent Bookings Table */}
      <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
        <h3 className="font-display text-lg font-bold text-bark">
          Recent Bookings
        </h3>
        {recentBookings.length === 0 ? (
          <p className="mt-4 font-body text-stone">No bookings yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-cloud">
                  <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                    Booking ID
                  </th>
                  <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                    Parent
                  </th>
                  <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                    Child
                  </th>
                  <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                    Club
                  </th>
                  <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                    Date
                  </th>
                  <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud">
                {recentBookings.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-cloud/50">
                    <td className="py-3 font-body text-sm text-bark">
                      {booking.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 font-body text-sm text-bark">
                      {booking.parent_name}
                    </td>
                    <td className="py-3 font-body text-sm text-bark">
                      {booking.children?.[0]?.name || "—"}
                    </td>
                    <td className="py-3 font-body text-sm text-bark">
                      {(booking.clubs as any)?.name || "—"}
                    </td>
                    <td className="py-3 font-body text-sm text-bark">
                      {(booking.booking_days as any)?.[0]?.club_days?.date
                        ? formatDate((booking.booking_days as any)[0].club_days.date)
                        : "—"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 font-body text-xs font-medium ${
                          booking.status === "complete"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "paid"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
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
        <div className="rounded-2xl border-2 border-coral/30 bg-coral/5 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-coral" />
            <h3 className="font-display text-lg font-bold text-bark">
              Bookings Requiring Attention
            </h3>
          </div>
          <p className="mt-2 font-body text-sm text-stone">
            The following bookings have incomplete child information and need
            follow-up.
          </p>
          <div className="mt-4 space-y-3">
            {incompleteBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-lg bg-white p-4 shadow-[var(--shadow-sm)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-semibold text-bark">
                      {booking.parent_name}
                    </p>
                    <p className="font-body text-sm text-stone">
                      {booking.parent_email}
                    </p>
                  </div>
                  <span className="font-body text-sm text-stone">
                    {formatDate(booking.created_at)}
                  </span>
                </div>
                <p className="mt-2 font-body text-sm">
                  <span className="font-medium text-coral">Missing:</span>{" "}
                  <span className="text-bark">
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
