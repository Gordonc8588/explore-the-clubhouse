"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// Mock data
const mockClubs = [
  {
    id: "CLB001",
    name: "Adventure Explorers",
    description: "Outdoor adventures and nature exploration for curious minds",
    startDate: "2026-01-20",
    endDate: "2026-01-24",
    ageMin: 5,
    ageMax: 8,
    capacity: 20,
    bookings: 18,
    isActive: true,
  },
  {
    id: "CLB002",
    name: "Farm Friends",
    description: "Meet the animals and learn about farm life",
    startDate: "2026-01-20",
    endDate: "2026-01-24",
    ageMin: 4,
    ageMax: 7,
    capacity: 15,
    bookings: 12,
    isActive: true,
  },
  {
    id: "CLB003",
    name: "Nature Crafts",
    description: "Create beautiful crafts using natural materials",
    startDate: "2026-01-27",
    endDate: "2026-01-31",
    ageMin: 6,
    ageMax: 10,
    capacity: 16,
    bookings: 8,
    isActive: true,
  },
  {
    id: "CLB004",
    name: "Outdoor Adventures",
    description: "Bush craft, den building, and outdoor skills",
    startDate: "2026-02-17",
    endDate: "2026-02-21",
    ageMin: 7,
    ageMax: 11,
    capacity: 18,
    bookings: 5,
    isActive: true,
  },
  {
    id: "CLB005",
    name: "Little Farmers",
    description: "Introduction to farm life for our youngest explorers",
    startDate: "2025-12-16",
    endDate: "2025-12-20",
    ageMin: 3,
    ageMax: 5,
    capacity: 12,
    bookings: 12,
    isActive: false,
  },
  {
    id: "CLB006",
    name: "Wildlife Detectives",
    description: "Track animals, identify birds, and explore wildlife",
    startDate: "2026-04-07",
    endDate: "2026-04-11",
    ageMin: 6,
    ageMax: 9,
    capacity: 20,
    bookings: 0,
    isActive: false,
  },
];

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startStr = start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  const endStr = end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startStr} - ${endStr}`;
}

function getCapacityColor(bookings: number, capacity: number): string {
  const percentage = (bookings / capacity) * 100;
  if (percentage >= 90) return "bg-coral";
  if (percentage >= 70) return "bg-amber";
  return "bg-meadow";
}

export default function ClubsPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState(mockClubs);

  const handleToggleActive = (clubId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClubs((prevClubs) =>
      prevClubs.map((club) =>
        club.id === clubId ? { ...club, isActive: !club.isActive } : club
      )
    );
  };

  const handleCardClick = (clubId: string) => {
    router.push(`/admin/clubs/${clubId}`);
  };

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

      {/* Clubs Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <div
            key={club.id}
            onClick={() => handleCardClick(club.id)}
            className="cursor-pointer rounded-2xl bg-white p-6 shadow-[var(--shadow-md)] transition-shadow hover:shadow-[var(--shadow-lg)]"
          >
            {/* Club Header */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-bold text-bark">
                {club.name}
              </h3>
              <span
                className={`inline-flex shrink-0 rounded-full px-2.5 py-1 font-body text-xs font-medium ${
                  club.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-cloud text-stone"
                }`}
              >
                {club.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Description */}
            <p className="mt-2 line-clamp-2 font-body text-sm text-stone">
              {club.description}
            </p>

            {/* Club Details */}
            <div className="mt-4 space-y-3">
              {/* Dates */}
              <div className="flex items-center gap-2 text-stone">
                <Calendar className="h-4 w-4" />
                <span className="font-body text-sm">
                  {formatDateRange(club.startDate, club.endDate)}
                </span>
              </div>

              {/* Age Range */}
              <div className="flex items-center gap-2 text-stone">
                <Users className="h-4 w-4" />
                <span className="font-body text-sm">
                  Ages {club.ageMin} - {club.ageMax} years
                </span>
              </div>

              {/* Capacity Usage */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-stone">
                    Bookings: {club.bookings}/{club.capacity}
                  </span>
                  <span className="font-body text-sm font-medium text-bark">
                    {Math.round((club.bookings / club.capacity) * 100)}%
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-cloud">
                  <div
                    className={`h-full rounded-full ${getCapacityColor(club.bookings, club.capacity)}`}
                    style={{
                      width: `${Math.min((club.bookings / club.capacity) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Toggle Active Status */}
            <div className="mt-4 flex items-center justify-between border-t border-cloud pt-4">
              <span className="font-body text-sm text-stone">Status</span>
              <button
                onClick={(e) => handleToggleActive(club.id, e)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-body text-sm font-medium transition-colors ${
                  club.isActive
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-cloud text-stone hover:bg-pebble/20"
                }`}
                aria-label={club.isActive ? "Deactivate club" : "Activate club"}
              >
                {club.isActive ? (
                  <>
                    <ToggleRight className="h-5 w-5" />
                    Active
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5" />
                    Inactive
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

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
