"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Loader2, Calendar, Users, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { PrintAdClubData } from "@/types/database";

interface Club {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  min_age: number;
  max_age: number;
  is_active: boolean;
  booking_options?: {
    id: string;
    name: string;
    price_per_child: number;
    is_active: boolean;
  }[];
}

interface ClubSelectorProps {
  selectedClubId: string | null;
  onSelect: (clubId: string | null, clubData: PrintAdClubData | null) => void;
}

/**
 * Format date range for display
 */
function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${format(start, "d")}–${format(end, "d MMMM yyyy")}`;
}

/**
 * Format price for display (pence to pounds)
 */
function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(0)}`;
}

/**
 * Build club data object for print ad
 */
function buildClubData(club: Club): PrintAdClubData {
  const prices = (club.booking_options || [])
    .filter((opt) => opt.is_active)
    .map((opt) => ({
      option: opt.name,
      price: opt.price_per_child,
    }));

  return {
    name: club.name,
    dates: formatDateRange(club.start_date, club.end_date),
    age_range: `${club.min_age}–${club.max_age}`,
    location: "Craigies Farm, Scottish Borders",
    prices,
  };
}

export function ClubSelector({ selectedClubId, onSelect }: ClubSelectorProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch clubs on mount
  useEffect(() => {
    async function fetchClubs() {
      try {
        const response = await fetch("/api/admin/clubs");
        if (!response.ok) throw new Error("Failed to fetch clubs");
        const data = await response.json();
        // Filter to active clubs and sort by start date
        const activeClubs = (data.clubs || [])
          .filter((c: Club) => c.is_active)
          .sort(
            (a: Club, b: Club) =>
              new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          );
        setClubs(activeClubs);
      } catch (err) {
        console.error("Error fetching clubs:", err);
        setError("Failed to load clubs");
      } finally {
        setIsLoading(false);
      }
    }
    fetchClubs();
  }, []);

  const selectedClub = clubs.find((c) => c.id === selectedClubId);

  const handleSelect = (club: Club | null) => {
    setIsOpen(false);
    if (club) {
      onSelect(club.id, buildClubData(club));
    } else {
      onSelect(null, null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-3">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Loading clubs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border bg-white p-3 text-left transition-colors hover:border-gray-400"
        style={{ borderColor: "var(--craigies-dark-olive)" }}
      >
        {selectedClub ? (
          <div className="flex-1">
            <p
              className="font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              {selectedClub.name}
            </p>
            <p className="text-sm text-gray-500">
              {formatDateRange(selectedClub.start_date, selectedClub.end_date)} •
              Ages {selectedClub.min_age}–{selectedClub.max_age}
            </p>
          </div>
        ) : (
          <span className="text-gray-500">Select a club...</span>
        )}
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {/* Clear selection option */}
            {selectedClubId && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="w-full border-b border-gray-100 px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
              >
                Clear selection
              </button>
            )}

            {clubs.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-500">
                No active clubs found
              </p>
            ) : (
              clubs.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => handleSelect(club)}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                    club.id === selectedClubId ? "bg-gray-50" : ""
                  }`}
                >
                  <p
                    className="font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    {club.name}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateRange(club.start_date, club.end_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Ages {club.min_age}–{club.max_age}
                    </span>
                  </div>
                  {club.booking_options && club.booking_options.length > 0 && (
                    <p className="mt-1 text-xs text-gray-400">
                      From{" "}
                      {formatPrice(
                        Math.min(
                          ...club.booking_options
                            .filter((o) => o.is_active)
                            .map((o) => o.price_per_child)
                        )
                      )}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* Selected club details card */}
      {selectedClub && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3">
          <p
            className="mb-2 text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--craigies-olive)" }}
          >
            Club Details (Auto-populated)
          </p>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar
                className="h-4 w-4"
                style={{ color: "var(--craigies-olive)" }}
              />
              <span style={{ color: "var(--craigies-dark-olive)" }}>
                {formatDateRange(selectedClub.start_date, selectedClub.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users
                className="h-4 w-4"
                style={{ color: "var(--craigies-olive)" }}
              />
              <span style={{ color: "var(--craigies-dark-olive)" }}>
                Ages {selectedClub.min_age}–{selectedClub.max_age}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin
                className="h-4 w-4"
                style={{ color: "var(--craigies-olive)" }}
              />
              <span style={{ color: "var(--craigies-dark-olive)" }}>
                Craigies Farm, Scottish Borders
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClubSelector;
