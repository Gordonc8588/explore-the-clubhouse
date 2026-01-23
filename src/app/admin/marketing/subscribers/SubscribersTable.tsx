"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source: string;
}

interface SubscribersTableProps {
  subscribers: Subscriber[];
  sources: string[];
}

const ITEMS_PER_PAGE = 10;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSourceBadgeStyles(source: string): { backgroundColor: string; color: string } {
  const sourceColors: Record<string, { backgroundColor: string; color: string }> = {
    footer: {
      backgroundColor: "rgba(122, 124, 74, 0.1)",
      color: "var(--craigies-olive)",
    },
    "contact-page": {
      backgroundColor: "rgba(212, 132, 62, 0.1)",
      color: "var(--craigies-burnt-orange)",
    },
    checkout: {
      backgroundColor: "#DBEAFE",
      color: "#1E40AF",
    },
  };
  return (
    sourceColors[source] || {
      backgroundColor: "#F3F4F6",
      color: "#6B7280",
    }
  );
}

export function SubscribersTable({ subscribers, sources }: SubscribersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("All Sources");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((subscriber) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        subscriber.email.toLowerCase().includes(searchLower);

      // Source filter
      const matchesSource =
        selectedSource === "All Sources" || subscriber.source === selectedSource;

      // Date range filter
      const subscribedDate = new Date(subscriber.subscribedAt);
      const matchesDateFrom =
        !dateFrom || subscribedDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || subscribedDate <= new Date(dateTo);

      return matchesSearch && matchesSource && matchesDateFrom && matchesDateTo;
    });
  }, [subscribers, searchQuery, selectedSource, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredSubscribers.length / ITEMS_PER_PAGE);
  const paginatedSubscribers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSubscribers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSubscribers, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
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

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="sm:col-span-2">
            <label
              htmlFor="search"
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Search Email
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-pebble" />
              <input
                type="text"
                id="search"
                placeholder="Search by email address..."
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

          {/* Source Filter */}
          <div>
            <label
              htmlFor="source"
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Source
            </label>
            <select
              id="source"
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "#D1D5DB",
                color: "var(--craigies-dark-olive)",
              }}
            >
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
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

      {/* Subscribers Table */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-cloud">
                <th
                  className="pb-3 text-left text-sm font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Email
                </th>
                <th
                  className="pb-3 text-left text-sm font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Source
                </th>
                <th
                  className="pb-3 text-left text-sm font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Subscribed At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud">
              {paginatedSubscribers.map((subscriber) => (
                <tr
                  key={subscriber.id}
                  className="transition-colors hover:bg-cloud/50"
                >
                  <td
                    className="py-4 text-sm"
                    style={{ color: "var(--craigies-dark-olive)" }}
                    title={subscriber.email}
                  >
                    {subscriber.email}
                  </td>
                  <td className="py-4">
                    <span
                      className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                      style={getSourceBadgeStyles(subscriber.source)}
                    >
                      {subscriber.source}
                    </span>
                  </td>
                  <td
                    className="py-4 text-sm"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    {formatDate(subscriber.subscribedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {paginatedSubscribers.length === 0 && (
          <div className="py-12 text-center">
            <p style={{ color: "var(--craigies-dark-olive)" }}>
              No subscribers found matching your criteria.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-cloud pt-4">
            <p
              className="text-sm"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredSubscribers.length)}{" "}
              of {filteredSubscribers.length} subscribers
            </p>
            <div className="flex items-center gap-2">
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor:
                      currentPage === page ? "var(--craigies-olive)" : "transparent",
                    color:
                      currentPage === page ? "white" : "var(--craigies-dark-olive)",
                    border: currentPage === page ? "none" : "1px solid #D1D5DB",
                  }}
                >
                  {page}
                </button>
              ))}
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
