import Link from "next/link";
import {
  Users,
  CalendarDays,
  PoundSterling,
  AlertCircle,
  Eye,
  Plus,
} from "lucide-react";

// Mock data
const mockStats = {
  todayAttendance: 24,
  weekBookings: 87,
  monthRevenue: 4250,
  incompleteBookings: 3,
};

const mockRecentBookings = [
  {
    id: "BK001",
    parentName: "Sarah Johnson",
    childName: "Emma Johnson",
    clubDate: "2026-01-20",
    clubName: "Adventure Explorers",
    status: "confirmed",
  },
  {
    id: "BK002",
    parentName: "Michael Chen",
    childName: "Oliver Chen",
    clubDate: "2026-01-21",
    clubName: "Farm Friends",
    status: "confirmed",
  },
  {
    id: "BK003",
    parentName: "Emma Williams",
    childName: "Lily Williams",
    clubDate: "2026-01-21",
    clubName: "Nature Crafts",
    status: "pending",
  },
  {
    id: "BK004",
    parentName: "James Brown",
    childName: "Harry Brown",
    clubDate: "2026-01-22",
    clubName: "Adventure Explorers",
    status: "confirmed",
  },
  {
    id: "BK005",
    parentName: "Lucy Taylor",
    childName: "Mia Taylor",
    clubDate: "2026-01-22",
    clubName: "Outdoor Adventures",
    status: "confirmed",
  },
];

const mockIncompleteBookings = [
  {
    id: "BK006",
    parentName: "David Wilson",
    email: "david.wilson@email.com",
    clubDate: "2026-01-23",
    missingInfo: "Child allergies, Emergency contact",
  },
  {
    id: "BK007",
    parentName: "Sophie Davis",
    email: "sophie.d@email.com",
    clubDate: "2026-01-24",
    missingInfo: "Medical information",
  },
  {
    id: "BK008",
    parentName: "Tom Anderson",
    email: "t.anderson@email.com",
    clubDate: "2026-01-25",
    missingInfo: "Child date of birth",
  },
];

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

export default function AdminDashboard() {
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
                {mockStats.todayAttendance}
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
                {mockStats.weekBookings}
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
                £{mockStats.monthRevenue.toLocaleString()}
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
                {mockStats.incompleteBookings}
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
              {mockRecentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-cloud/50">
                  <td className="py-3 font-body text-sm text-bark">
                    {booking.id}
                  </td>
                  <td className="py-3 font-body text-sm text-bark">
                    {booking.parentName}
                  </td>
                  <td className="py-3 font-body text-sm text-bark">
                    {booking.childName}
                  </td>
                  <td className="py-3 font-body text-sm text-bark">
                    {booking.clubName}
                  </td>
                  <td className="py-3 font-body text-sm text-bark">
                    {formatDate(booking.clubDate)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 font-body text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
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
      </div>

      {/* Incomplete Bookings Alert Section */}
      {mockIncompleteBookings.length > 0 && (
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
            {mockIncompleteBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-lg bg-white p-4 shadow-[var(--shadow-sm)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-semibold text-bark">
                      {booking.parentName}
                    </p>
                    <p className="font-body text-sm text-stone">
                      {booking.email}
                    </p>
                  </div>
                  <span className="font-body text-sm text-stone">
                    {formatDate(booking.clubDate)}
                  </span>
                </div>
                <p className="mt-2 font-body text-sm">
                  <span className="font-medium text-coral">Missing:</span>{" "}
                  <span className="text-bark">{booking.missingInfo}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
