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

function getStatusBadgeStyles(status: string): { backgroundColor: string; color: string } {
  switch (status) {
    case "paid":
      return {
        backgroundColor: "rgba(212, 132, 62, 0.1)",
        color: "var(--craigies-burnt-orange)",
      };
    case "pending":
      return {
        backgroundColor: "#FEF3C7",
        color: "#D97706",
      };
    case "complete":
      return {
        backgroundColor: "rgba(122, 124, 74, 0.1)",
        color: "var(--craigies-olive)",
      };
    case "cancelled":
      return {
        backgroundColor: "#FEE2E2",
        color: "#DC2626",
      };
    default:
      return {
        backgroundColor: "#F3F4F6",
        color: "#6B7280",
      };
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
      <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
        <div
          className="flex items-center gap-2"
          style={{ color: "var(--craigies-dark-olive)" }}
        >
          <Filter className="h-5 w-5" />
          <span
            className="font-semibold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Search & Filter
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Input */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label
              htmlFor="search"
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
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
                className="w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--craigies-burnt-orange)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Club Filter */}
          <div>
            <label
              htmlFor="club"
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
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
              className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "#D1D5DB",
                color: "var(--craigies-dark-olive)",
              }}
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
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
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
              className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "#D1D5DB",
                color: "var(--craigies-dark-olive)",
              }}
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
            <label className="mb-1 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}>
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
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "#D1D5DB",
                color: "var(--craigies-dark-olive)",
              }}
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  handleFilterChange();
                }}
                className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "#D1D5DB",
                color: "var(--craigies-dark-olive)",
              }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
        {/* Mobile Card View */}
        <div className="space-y-3 md:hidden">
          {paginatedBookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => handleRowClick(booking.id)}
              className="cursor-pointer rounded-xl border border-gray-200 p-4 transition-colors active:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--craigies-olive)" }}
                    >
                      {booking.ref}
                    </span>
                    <span
                      className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                      style={getStatusBadgeStyles(booking.status)}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <h3
                    className="mt-1 text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    {booking.parentName}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {booking.email}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    £{booking.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>{booking.club}</span>
                <span>{formatDate(booking.date)}</span>
                {booking.children.length > 0 && (
                  <span>
                    {booking.children.length === 1
                      ? booking.children[0]
                      : `${booking.children.length} children`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-cloud">
                <th className="pb-3 text-left text-sm font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}>
                  Ref
                </th>
                <th className="pb-3 text-left text-sm font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}>
                  Parent Name
                </th>
                <th className="pb-3 text-left text-sm font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}>
                  Email
                </th>
                <th className="pb-3 text-left text-sm font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}>
                  Club
                </th>
                <th className="pb-3 text-left text-sm font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}>
                  Children
                </th>
                <th className="pb-3 text-right text-sm font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}>
                  Amount
                </th>
                <th className="pb-3 text-left text-sm font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}>
                  Status
                </th>
                <th className="pb-3 text-left text-sm font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}>
                  Date
                </th>
                <th className="pb-3 text-right text-sm font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}>
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
                  <td className="py-4 text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}>
                    {booking.ref}
                  </td>
                  <td className="py-4 text-sm"
                    style={{ color: "var(--craigies-dark-olive)" }}>
                    {booking.parentName}
                  </td>
                  <td className="py-4 text-sm"
                    style={{ color: "var(--craigies-dark-olive)" }}>
                    {booking.email}
                  </td>
                  <td className="py-4 text-sm"
                    style={{ color: "var(--craigies-dark-olive)" }}>
                    {booking.club}
                  </td>
                  <td className="py-4 text-sm"
                    style={{ color: "var(--craigies-dark-olive)" }}>
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
                  <td className="py-4 text-right text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}>
                    £{booking.amount.toFixed(2)}
                  </td>
                  <td className="py-4">
                    <span
                      className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                      style={getStatusBadgeStyles(booking.status)}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 text-sm"
                    style={{ color: "var(--craigies-dark-olive)" }}>
                    {formatDate(booking.date)}
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(booking.id);
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "var(--craigies-olive)" }}
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
            <p style={{ color: "var(--craigies-dark-olive)" }}>
              No bookings found matching your criteria.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-3 border-t border-cloud pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-center text-sm sm:text-left"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)}{" "}
              of {filteredBookings.length} bookings
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {/* Mobile: show current/total */}
              <span
                className="px-3 text-sm font-medium sm:hidden"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                {currentPage} / {totalPages}
              </span>
              {/* Desktop: show page numbers */}
              <div className="hidden sm:flex sm:items-center sm:gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor:
                          currentPage === pageNum ? "var(--craigies-olive)" : "transparent",
                        color:
                          currentPage === pageNum ? "white" : "var(--craigies-dark-olive)",
                        border: currentPage === pageNum ? "none" : "1px solid #D1D5DB",
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                }}
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
