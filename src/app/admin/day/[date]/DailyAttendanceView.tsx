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

interface Child {
  id: string;
  name: string;
  parentName: string;
  parentPhone: string;
  session: "AM" | "PM" | "Full";
  allergies: string[];
  medicalNotes: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
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

  // Get children with allergies
  const childrenWithAllergies = attendance.filter(
    (c) => c.allergies.length > 0
  );

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
            <h1 className="font-display text-2xl font-bold text-bark">
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
                className="rounded-lg border border-cloud bg-white py-2 pl-10 pr-4 font-body text-bark transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
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
              className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 font-display font-semibold text-white transition-colors hover:bg-meadow"
            >
              <Printer className="h-5 w-5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Print header (only visible when printing) */}
        <div className="hidden print:block">
          <h1 className="font-display text-2xl font-bold text-bark">
            Daily Attendance - {formatDateForDisplay(date)}
          </h1>
          <p className="mt-1 font-body text-stone">
            The Clubhouse - Printed on{" "}
            {new Date().toLocaleDateString("en-GB")}
          </p>
        </div>

        {/* Date display */}
        <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
          <h2 className="font-display text-xl font-bold text-bark">
            {formatDateForDisplay(date)}
          </h2>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-forest/10 p-3">
                <Users className="h-6 w-6 text-forest" />
              </div>
              <div>
                <p className="font-body text-sm text-stone">Total Attendance</p>
                <p className="font-display text-2xl font-bold text-bark">
                  {totalAttendance}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-sunshine/10 p-3">
                <Sun className="h-6 w-6 text-amber" />
              </div>
              <div>
                <p className="font-body text-sm text-stone">Morning (AM)</p>
                <p className="font-display text-2xl font-bold text-bark">
                  {morningCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-meadow/10 p-3">
                <Sunset className="h-6 w-6 text-meadow" />
              </div>
              <div>
                <p className="font-body text-sm text-stone">Afternoon (PM)</p>
                <p className="font-display text-2xl font-bold text-bark">
                  {afternoonCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Allergy Alert Section */}
        {childrenWithAllergies.length > 0 && (
          <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="font-display text-lg font-bold text-red-800">
                Allergy Alert - {childrenWithAllergies.length} Child
                {childrenWithAllergies.length !== 1 ? "ren" : ""} with Allergies
              </h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {childrenWithAllergies.map((child) => (
                <div
                  key={child.id}
                  className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-[var(--shadow-sm)]"
                >
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="font-display font-semibold text-bark">
                      {child.name}
                    </p>
                    <p className="mt-1 font-body text-sm font-medium text-red-700">
                      {child.allergies.join(", ")}
                    </p>
                    {child.medicalNotes && (
                      <p className="mt-1 font-body text-sm text-stone">
                        {child.medicalNotes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
          <h3 className="font-display text-lg font-bold text-bark">
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
                    <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                      Child Name
                    </th>
                    <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                      Parent
                    </th>
                    <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                      Session
                    </th>
                    <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                      Allergies
                    </th>
                    <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                      Medical Notes
                    </th>
                    <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                      Emergency Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cloud">
                  {attendance.map((child) => (
                    <tr key={child.id} className="hover:bg-cloud/50">
                      <td className="py-4 font-body text-sm font-medium text-bark">
                        {child.name}
                      </td>
                      <td className="py-4">
                        <p className="font-body text-sm text-bark">
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
                          className={`inline-flex rounded-full px-3 py-1 font-body text-xs font-medium ${
                            child.session === "Full"
                              ? "bg-forest/10 text-forest"
                              : child.session === "AM"
                                ? "bg-sunshine/10 text-amber"
                                : "bg-meadow/10 text-meadow"
                          }`}
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
                          <span className="font-body text-sm text-bark">
                            {child.medicalNotes}
                          </span>
                        ) : (
                          <span className="font-body text-sm text-pebble">
                            None
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        {child.emergencyContact.name ? (
                          <>
                            <p className="font-body text-sm text-bark">
                              {child.emergencyContact.name}
                            </p>
                            {child.emergencyContact.relationship && (
                              <p className="font-body text-xs text-stone">
                                {child.emergencyContact.relationship}
                              </p>
                            )}
                            {child.emergencyContact.phone && (
                              <p className="flex items-center gap-1 font-body text-xs text-stone">
                                <Phone className="h-3 w-3" />
                                {child.emergencyContact.phone}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="font-body text-sm text-pebble">
                            Not provided
                          </span>
                        )}
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
