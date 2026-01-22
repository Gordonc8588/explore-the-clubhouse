"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface Club {
  id: string;
  name: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  ageMin: number;
  ageMax: number;
  capacity: number;
  bookings: number;
  isActive: boolean;
}

interface ClubsGridProps {
  clubs: Club[];
}

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
  if (capacity === 0) return "bg-pebble";
  const percentage = (bookings / capacity) * 100;
  if (percentage >= 90) return "bg-coral";
  if (percentage >= 70) return "bg-amber";
  return "bg-meadow";
}

export function ClubsGrid({ clubs: initialClubs }: ClubsGridProps) {
  const router = useRouter();
  const [clubs, setClubs] = useState(initialClubs);

  const handleToggleActive = async (clubId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic update
    setClubs((prevClubs) =>
      prevClubs.map((club) =>
        club.id === clubId ? { ...club, isActive: !club.isActive } : club
      )
    );
    // TODO: Call API to update club status
  };

  const handleCardClick = (clubId: string) => {
    router.push(`/admin/clubs/${clubId}`);
  };

  if (clubs.length === 0) {
    return null;
  }

  return (
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
            {club.description || "No description"}
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
                  {club.capacity > 0
                    ? Math.round((club.bookings / club.capacity) * 100)
                    : 0}%
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-cloud">
                <div
                  className={`h-full rounded-full ${getCapacityColor(club.bookings, club.capacity)}`}
                  style={{
                    width: `${club.capacity > 0 ? Math.min((club.bookings / club.capacity) * 100, 100) : 0}%`,
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
  );
}
