"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Booking {
  id: string;
  ref: string;
  parentName: string;
  email: string;
  club: string;
  clubId: string | null;
  children: string[];
  amount: number;
  status: string;
  date: string;
}

interface BookingsTableProps {
  bookings: Booking[];
  clubs: string[];
}

const statuses = ["all", "pending", "paid", "complete", "cancelled"] as const;
type Status = (typeof statuses)[number];

const ITEMS_PER_PAGE = 8;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyles(status: string): string {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "complete":
      return "bg-sky/20 text-sky-700";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-cloud text-stone";
  }
}

export function BookingsTable({ bookings, clubs }: BookingsTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClub, setSelectedClub] = useState("All Clubs");
  const [selectedStatus, setSelectedStatus] = useState<Status>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter bookings based on search and filters
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        booking.parentName.toLowerCase().includes(searchLower) ||
        booking.email.toLowerCase().includes(searchLower) ||
        booking.ref.toLowerCase().includes(searchLower);

      // Club filter
      const matchesClub =
        selectedClub === "All Clubs" || booking.club === selectedClub;

      // Status filter
      const matchesStatus =
        selectedStatus === "all" || booking.status === selectedStatus;

      // Date range filter
      const bookingDate = new Date(booking.date);
      const matchesDateFrom =
        !dateFrom || bookingDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || bookingDate <= new Date(dateTo);

      return (
        matchesSearch &&
        matchesClub &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [bookings, searchQuery, selectedClub, selectedStatus, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleRowClick = (bookingId: string) => {
    router.push(`/admin/bookings/${bookingId}`);
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
        <div className="flex items-center gap-2 text-stone">
          <Filter className="h-5 w-5" />
          <span className="font-display font-semibold">Search & Filter</span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Input */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label
              htmlFor="search"
              className="mb-1 block font-body text-sm font-medium text-stone"
            >
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-pebble" />
              <input
                type="text"
                id="search"
                placeholder="Parent name, email, or reference..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange();
                }}
                className="w-full rounded-lg border border-stone/30 bg-white py-2.5 pl-10 pr-4 font-body text-sm text-bark placeholder:text-pebble focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
              />
            </div>
          </div>

          {/* Club Filter */}
          <div>
            <label
              htmlFor="club"
              className="mb-1 block font-body text-sm font-medium text-stone"
            >
              Club
            </label>
            <select
              id="club"
              value={selectedClub}
              onChange={(e) => {
                setSelectedClub(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-stone/30 bg-white px-3 py-2.5 font-body text-sm text-bark focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
            >
              {clubs.map((club) => (
                <option key={club} value={club}>
                  {club}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status"
              className="mb-1 block font-body text-sm font-medium text-stone"
            >
              Status
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as Status);
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-stone/30 bg-white px-3 py-2.5 font-body text-sm text-bark focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1 block font-body text-sm font-medium text-stone">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  handleFilterChange();
                }}
                className="w-full rounded-lg border border-stone/30 bg-white px-3 py-2.5 font-body text-sm text-bark focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  handleFilterChange();
                }}
                className="w-full rounded-lg border border-stone/30 bg-white px-3 py-2.5 font-body text-sm text-bark focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-cloud">
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Ref
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Parent Name
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Email
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Club
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Children
                </th>
                <th className="pb-3 text-right font-body text-sm font-semibold text-stone">
                  Amount
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Status
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Date
                </th>
                <th className="pb-3 text-right font-body text-sm font-semibold text-stone">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud">
              {paginatedBookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => handleRowClick(booking.id)}
                  className="cursor-pointer transition-colors hover:bg-cloud/50"
                >
                  <td className="py-4 font-body text-sm font-medium text-bark">
                    {booking.ref}
                  </td>
                  <td className="py-4 font-body text-sm text-bark">
                    {booking.parentName}
                  </td>
                  <td className="py-4 font-body text-sm text-stone">
                    {booking.email}
                  </td>
                  <td className="py-4 font-body text-sm text-bark">
                    {booking.club}
                  </td>
                  <td className="py-4 font-body text-sm text-bark">
                    {booking.children.length === 0 ? (
                      <span className="text-pebble">—</span>
                    ) : (
                      <span title={booking.children.join(", ")}>
                        {booking.children.length === 1
                          ? booking.children[0]
                          : `${booking.children[0]} +${booking.children.length - 1}`}
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right font-body text-sm font-medium text-bark">
                    £{booking.amount.toFixed(2)}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 font-body text-xs font-medium ${getStatusStyles(booking.status)}`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 font-body text-sm text-bark">
                    {formatDate(booking.date)}
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(booking.id);
                      }}
                      className="rounded-lg bg-forest px-3 py-1.5 font-body text-xs font-medium text-white transition-colors hover:bg-meadow"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {paginatedBookings.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-body text-stone">
              No bookings found matching your criteria.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-cloud pt-4">
            <p className="font-body text-sm text-stone">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)}{" "}
              of {filteredBookings.length} bookings
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone/30 text-stone transition-colors hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg font-body text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-forest text-white"
                        : "border border-stone/30 text-stone hover:bg-cloud"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone/30 text-stone transition-colors hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
