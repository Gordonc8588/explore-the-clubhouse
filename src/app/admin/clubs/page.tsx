import Link from "next/link";
import {
  Plus,
  Users,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClubsGrid } from "./ClubsGrid";

async function getClubsData() {
  const supabase = await createClient();

  // Get all clubs with booking counts
  const { data: clubs } = await supabase
    .from("clubs")
    .select(`
      id,
      name,
      slug,
      description,
      start_date,
      end_date,
      min_age,
      max_age,
      is_active,
      club_days(
        morning_capacity,
        afternoon_capacity
      ),
      bookings(id, status)
    `)
    .order("start_date", { ascending: false });

  if (!clubs) {
    return [];
  }

  // Transform data with computed values
  return clubs.map((club) => {
    // Calculate total capacity from club days
    const totalCapacity = club.club_days?.reduce(
      (sum, day) => sum + (day.morning_capacity || 0),
      0
    ) || 0;

    // Count paid/complete bookings
    const bookingCount = club.bookings?.filter(
      (b: { status: string }) => b.status === "paid" || b.status === "complete"
    ).length || 0;

    return {
      id: club.id,
      name: club.name,
      slug: club.slug,
      description: club.description || "",
      startDate: club.start_date,
      endDate: club.end_date,
      ageMin: club.min_age,
      ageMax: club.max_age,
      capacity: totalCapacity > 0 ? totalCapacity : 20, // Default if no days set
      bookings: bookingCount,
      isActive: club.is_active,
    };
  });
}

export default async function ClubsPage() {
  const clubs = await getClubsData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-[var(--shadow-md)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-bark">Clubs</h2>
          <p className="mt-1 font-body text-stone">
            Manage your holiday club sessions
          </p>
        </div>
        <Link
          href="/admin/clubs/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sunshine px-6 py-3 font-display font-semibold text-bark transition-colors hover:bg-amber"
        >
          <Plus className="h-5 w-5" />
          Create New Club
        </Link>
      </div>

      {/* Clubs Grid (Client Component for toggle interactions) */}
      <ClubsGrid clubs={clubs} />

      {/* Empty State */}
      {clubs.length === 0 && (
        <div className="rounded-2xl bg-white p-12 text-center shadow-[var(--shadow-md)]">
          <p className="font-body text-stone">No clubs found.</p>
          <Link
            href="/admin/clubs/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sunshine px-6 py-3 font-display font-semibold text-bark transition-colors hover:bg-amber"
          >
            <Plus className="h-5 w-5" />
            Create Your First Club
          </Link>
        </div>
      )}
    </div>
  );
}
