"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  ClipboardList,
  AlertTriangle,
  Phone,
  Users,
  Sun,
  Sunset,
  Camera,
  CameraOff,
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
  photoConsent: boolean | null;
  parentNotes: string;
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
  const [printMode, setPrintMode] = useState<"attendance" | "signoff">("attendance");

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
    setPrintMode("attendance");
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  // Handle print sign-off sheet
  const handlePrintSignOff = () => {
    setPrintMode("signoff");
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
            size: A4 landscape;
            margin: 10mm;
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

      {/* Sign-off sheet (only rendered when printing sign-off) */}
      {isPrinting && printMode === "signoff" && (
        <div className="print-area">
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Sign-Off Sheet - {formatDateForDisplay(date)}
          </h1>
          <p className="mt-1 font-body text-stone">
            The Clubhouse
          </p>
          <p className="mt-2 text-sm font-medium" style={{ color: "var(--craigies-dark-olive)" }}>
            Total Children: {totalAttendance}
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2" style={{ borderColor: "var(--craigies-olive)" }}>
                  <th
                    className="pb-3 pr-4 text-left text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)", width: "30%" }}
                  >
                    Child Name
                  </th>
                  <th
                    className="pb-3 pr-4 text-left text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)", width: "25%" }}
                  >
                    Parent / Guardian
                  </th>
                  <th
                    className="pb-3 pr-4 text-center text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)", width: "10%" }}
                  >
                    Session
                  </th>
                  <th
                    className="pb-3 pr-4 text-center text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)", width: "15%" }}
                  >
                    Signed In
                  </th>
                  <th
                    className="pb-3 text-center text-sm font-semibold"
                    style={{ color: "var(--craigies-dark-olive)", width: "15%" }}
                  >
                    Signed Out
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((child) => (
                  <tr key={child.id} className="border-b border-gray-200">
                    <td
                      className="py-4 pr-4 text-sm font-medium"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      {child.name}
                    </td>
                    <td
                      className="py-4 pr-4 text-sm"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      {child.parentName}
                    </td>
                    <td className="py-4 pr-4 text-center text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                      {child.session === "Full" ? "Full Day" : child.session}
                    </td>
                    <td className="py-4 pr-4">
                      <div
                        className="mx-auto h-8 w-full rounded border border-dashed"
                        style={{ borderColor: "#9CA3AF", minWidth: "80px" }}
                      />
                    </td>
                    <td className="py-4">
                      <div
                        className="mx-auto h-8 w-full rounded border border-dashed"
                        style={{ borderColor: "#9CA3AF", minWidth: "80px" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 border-t border-cloud pt-4">
            <p className="font-body text-sm text-stone">
              This document contains sensitive information. Please handle
              appropriately.
            </p>
          </div>
        </div>
      )}

      <div className={`space-y-6 ${isPrinting && printMode === "attendance" ? "print-area" : ""} ${isPrinting && printMode === "signoff" ? "no-print" : ""}`}>
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

            <button
              onClick={handlePrintSignOff}
              className="flex items-center gap-2 rounded-lg border-2 px-4 py-2 font-semibold transition-opacity hover:opacity-90"
              style={{
                borderColor: "var(--craigies-olive)",
                color: "var(--craigies-dark-olive)",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              <ClipboardList className="h-5 w-5" />
              <span className="hidden sm:inline">Sign-Off Sheet</span>
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
              <table className="w-full min-w-[800px]">
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
                      Parent / Guardian
                    </th>
                    <th
                      className="pb-3 text-left text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Session
                    </th>
                    <th
                      className="pb-3 text-center text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Photo OK
                    </th>
                    <th
                      className="pb-3 text-left text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Allergies / Important Info
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
                  {attendance.map((child) => {
                    const hasAllergies = child.allergies.length > 0;
                    const hasMedicalNotes = !!child.medicalNotes;
                    const hasParentNotes = !!child.parentNotes;
                    const hasImportantInfo = hasAllergies || hasMedicalNotes || hasParentNotes;

                    return (
                    <tr key={child.id} className="hover:bg-cloud/50">
                      <td
                        className="py-4 text-sm font-medium"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
                        {child.name}
                      </td>
                      <td className="py-4">
                        <p
                          className="text-sm font-medium"
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
                      <td className="py-4 text-center">
                        {child.photoConsent === true ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <Camera className="h-3.5 w-3.5" />
                            Yes
                          </span>
                        ) : child.photoConsent === false ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                            <CameraOff className="h-3.5 w-3.5" />
                            No
                          </span>
                        ) : (
                          <span className="font-body text-xs text-pebble">
                            —
                          </span>
                        )}
                      </td>
                      <td className="max-w-[280px] py-4">
                        {hasImportantInfo ? (
                          <div className="space-y-1.5">
                            {hasAllergies && (
                              <div className="flex items-start gap-1">
                                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                                <span className="font-body text-sm font-medium text-red-700">
                                  {child.allergies.join(", ")}
                                </span>
                              </div>
                            )}
                            {hasMedicalNotes && (
                              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                                {child.medicalNotes}
                              </p>
                            )}
                            {hasParentNotes && (
                              <p className="text-sm italic text-stone">
                                {child.parentNotes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="font-body text-sm text-pebble">
                            None
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="space-y-2">
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
                    );
                  })}
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
