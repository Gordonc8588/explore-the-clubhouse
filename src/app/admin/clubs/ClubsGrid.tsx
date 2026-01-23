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
  if (capacity === 0) return "#D1D5DB"; // Gray for no capacity
  const percentage = (bookings / capacity) * 100;
  if (percentage >= 90) return "#E07A5F"; // Coral (near full)
  if (percentage >= 70) return "#d4843e"; // Burnt orange (getting full)
  return "#7a7c4a"; // Olive (good availability)
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
            <h3
              className="text-lg font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              {club.name}
            </h3>
            <span
              className="inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: club.isActive
                  ? "rgba(122, 124, 74, 0.1)"
                  : "#F3F4F6",
                color: club.isActive
                  ? "var(--craigies-olive)"
                  : "#6B7280",
              }}
            >
              {club.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Description */}
          <p
            className="mt-2 line-clamp-2 text-sm"
            style={{ color: "var(--craigies-dark-olive)" }}
          >
            {club.description || "No description"}
          </p>

          {/* Club Details */}
          <div className="mt-4 space-y-3">
            {/* Dates */}
            <div
              className="flex items-center gap-2"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {formatDateRange(club.startDate, club.endDate)}
              </span>
            </div>

            {/* Age Range */}
            <div
              className="flex items-center gap-2"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              <Users className="h-4 w-4" />
              <span className="text-sm">
                Ages {club.ageMin} - {club.ageMax} years
              </span>
            </div>

            {/* Capacity Usage */}
            <div>
              <div className="flex items-center justify-between">
                <span
                  className="text-sm"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Bookings: {club.bookings}/{club.capacity}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  {club.capacity > 0
                    ? Math.round((club.bookings / club.capacity) * 100)
                    : 0}%
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-cloud">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${club.capacity > 0 ? Math.min((club.bookings / club.capacity) * 100, 100) : 0}%`,
                    backgroundColor: getCapacityColor(club.bookings, club.capacity),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Toggle Active Status */}
          <div className="mt-4 flex items-center justify-between border-t border-cloud pt-4">
            <span
              className="text-sm"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Status
            </span>
            <button
              onClick={(e) => handleToggleActive(club.id, e)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                backgroundColor: club.isActive
                  ? "rgba(122, 124, 74, 0.1)"
                  : "#F3F4F6",
                color: club.isActive
                  ? "var(--craigies-olive)"
                  : "#6B7280",
              }}
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
