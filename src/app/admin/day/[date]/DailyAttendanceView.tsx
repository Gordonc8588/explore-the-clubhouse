"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  AlertTriangle,
  Phone,
  Users,
  Sun,
  Sunset,
} from "lucide-react";

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface Child {
  id: string;
  name: string;
  parentName: string;
  parentPhone: string;
  session: "AM" | "PM" | "Full";
  allergies: string[];
  medicalNotes: string;
  emergencyContact: EmergencyContact;
  emergencyContact2: EmergencyContact;
}

interface DailyAttendanceViewProps {
  date: string;
  attendance: Child[];
}

function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function DailyAttendanceView({ date, attendance }: DailyAttendanceViewProps) {
  const router = useRouter();
  const [isPrinting, setIsPrinting] = useState(false);

  // Calculate stats
  const totalAttendance = attendance.length;
  const morningCount = attendance.filter(
    (c) => c.session === "AM" || c.session === "Full"
  ).length;
  const afternoonCount = attendance.filter(
    (c) => c.session === "PM" || c.session === "Full"
  ).length;

  // Handle date change
  const handleDateChange = (newDate: string) => {
    router.push(`/admin/day/${newDate}`);
  };

  // Handle print
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
          table {
            font-size: 10pt;
          }
          th,
          td {
            padding: 8px 4px !important;
          }
        }
      `}</style>

      <div className={`space-y-6 ${isPrinting ? "print-area" : ""}`}>
        {/* Header with navigation */}
        <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="rounded-lg p-2 text-stone transition-colors hover:bg-cloud hover:text-bark"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Daily Attendance
            </h1>
          </div>

          {/* Date picker and print button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDateChange(addDays(date, -1))}
              className="rounded-lg border border-cloud bg-white p-2 text-stone transition-colors hover:bg-cloud hover:text-bark"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone" />
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="rounded-lg border py-2 pl-10 pr-4 transition-colors focus:outline-none focus:ring-2"
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

            <button
              onClick={() => handleDateChange(addDays(date, 1))}
              className="rounded-lg border border-cloud bg-white p-2 text-stone transition-colors hover:bg-cloud hover:text-bark"
              aria-label="Next day"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--craigies-burnt-orange)",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              <Printer className="h-5 w-5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Print header (only visible when printing) */}
        <div className="hidden print:block">
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Daily Attendance - {formatDateForDisplay(date)}
          </h1>
          <p className="mt-1 font-body text-stone">
            The Clubhouse - Printed on{" "}
            {new Date().toLocaleDateString("en-GB")}
          </p>
        </div>

        {/* Date display */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2
            className="text-xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            {formatDateForDisplay(date)}
          </h2>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div
                className="rounded-full p-3"
                style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
              >
                <Users className="h-6 w-6" style={{ color: "var(--craigies-olive)" }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                  Total Attendance
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  {totalAttendance}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-sunshine/10 p-3">
                <Sun className="h-6 w-6 text-amber" />
              </div>
              <div>
                <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                  Morning (AM)
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  {morningCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div
                className="rounded-full p-3"
                style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
              >
                <Sunset className="h-6 w-6" style={{ color: "var(--craigies-burnt-orange)" }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                  Afternoon (PM)
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  {afternoonCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3
            className="text-lg font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Attendance List
          </h3>

          {attendance.length === 0 ? (
            <div className="mt-6 rounded-lg bg-cloud py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-pebble" />
              <p className="mt-4 font-body text-stone">
                No attendance records for this date.
              </p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-cloud">
                    <th
                      className="pb-3 text-left text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Child Name
                    </th>
                    <th
                      className="pb-3 text-left text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Parent
                    </th>
                    <th
                      className="pb-3 text-left text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Session
                    </th>
                    <th
                      className="pb-3 text-left text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Allergies
                    </th>
                    <th
                      className="pb-3 text-left text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Medical Notes
                    </th>
                    <th
                      className="pb-3 text-left text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Emergency Contacts
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cloud">
                  {attendance.map((child) => (
                    <tr key={child.id} className="hover:bg-cloud/50">
                      <td
                        className="py-4 text-sm font-medium"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
                        {child.name}
                      </td>
                      <td className="py-4">
                        <p
                          className="text-sm"
                          style={{ color: "var(--craigies-dark-olive)" }}
                        >
                          {child.parentName}
                        </p>
                        {child.parentPhone && (
                          <p className="flex items-center gap-1 font-body text-xs text-stone">
                            <Phone className="h-3 w-3" />
                            {child.parentPhone}
                          </p>
                        )}
                      </td>
                      <td className="py-4">
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                          style={
                            child.session === "Full"
                              ? {
                                  backgroundColor: "rgba(122, 124, 74, 0.1)",
                                  color: "var(--craigies-olive)",
                                }
                              : child.session === "AM"
                                ? {
                                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                                    color: "#D97706",
                                  }
                                : {
                                    backgroundColor: "rgba(212, 132, 62, 0.1)",
                                    color: "var(--craigies-burnt-orange)",
                                  }
                          }
                        >
                          {child.session === "Full"
                            ? "Full Day"
                            : child.session}
                        </span>
                      </td>
                      <td className="py-4">
                        {child.allergies.length > 0 ? (
                          <div className="flex items-start gap-1">
                            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                            <span className="font-body text-sm font-medium text-red-700">
                              {child.allergies.join(", ")}
                            </span>
                          </div>
                        ) : (
                          <span className="font-body text-sm text-pebble">
                            None
                          </span>
                        )}
                      </td>
                      <td className="max-w-[200px] py-4">
                        {child.medicalNotes ? (
                          <span
                            className="text-sm"
                            style={{ color: "var(--craigies-dark-olive)" }}
                          >
                            {child.medicalNotes}
                          </span>
                        ) : (
                          <span className="text-sm text-pebble">
                            None
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="space-y-2">
                          {/* Emergency Contact 1 */}
                          {child.emergencyContact.name ? (
                            <div className="border-b border-cloud/50 pb-2">
                              <p
                                className="text-sm font-medium"
                                style={{ color: "var(--craigies-dark-olive)" }}
                              >
                                {child.emergencyContact.name}
                              </p>
                              {child.emergencyContact.relationship && (
                                <p className="font-body text-xs text-stone capitalize">
                                  {child.emergencyContact.relationship.replace('_', ' ')}
                                </p>
                              )}
                              {child.emergencyContact.phone && (
                                <p className="flex items-center gap-1 font-body text-xs text-stone">
                                  <Phone className="h-3 w-3" />
                                  {child.emergencyContact.phone}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="font-body text-sm text-pebble">
                              Not provided
                            </span>
                          )}
                          {/* Emergency Contact 2 */}
                          {child.emergencyContact2?.name && (
                            <div>
                              <p
                                className="text-sm font-medium"
                                style={{ color: "var(--craigies-dark-olive)" }}
                              >
                                {child.emergencyContact2.name}
                              </p>
                              {child.emergencyContact2.relationship && (
                                <p className="font-body text-xs text-stone capitalize">
                                  {child.emergencyContact2.relationship.replace('_', ' ')}
                                </p>
                              )}
                              {child.emergencyContact2.phone && (
                                <p className="flex items-center gap-1 font-body text-xs text-stone">
                                  <Phone className="h-3 w-3" />
                                  {child.emergencyContact2.phone}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Print footer */}
        <div className="hidden border-t border-cloud pt-4 print:block">
          <p className="font-body text-sm text-stone">
            This document contains sensitive information. Please handle
            appropriately.
          </p>
        </div>
      </div>
    </>
  );
}
