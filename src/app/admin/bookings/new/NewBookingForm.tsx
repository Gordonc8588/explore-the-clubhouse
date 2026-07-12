"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";

interface BookingOption {
  id: string;
  name: string;
  optionType: string;
  timeSlot: string;
  pricePerChild: number;
}

interface Club {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  options: BookingOption[];
}

interface ClubDay {
  id: string;
  date: string;
  morningCapacity: number;
  afternoonCapacity: number;
  morningBooked: number;
  afternoonBooked: number;
}

interface CreateResult {
  bookingId: string;
  ref: string;
  dates: string[];
  completeUrl: string;
  emailSent: boolean;
  emailError?: string;
}

function formatDay(dateString: string): string {
  return new Date(dateString + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function remainingForSlot(day: ClubDay, timeSlot: string): number {
  const morning = day.morningCapacity - day.morningBooked;
  const afternoon = day.afternoonCapacity - day.afternoonBooked;
  if (timeSlot === "morning") return morning;
  if (timeSlot === "afternoon") return afternoon;
  return Math.min(morning, afternoon);
}

const labelClass = "block text-sm font-medium";
const labelStyle = { color: "var(--craigies-dark-olive)" };
const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--craigies-burnt-orange)] focus:outline-none focus:ring-1 focus:ring-[var(--craigies-burnt-orange)]";

export function NewBookingForm({ clubs }: { clubs: Club[] }) {
  const [clubId, setClubId] = useState("");
  const [optionId, setOptionId] = useState("");
  const [days, setDays] = useState<ClubDay[]>([]);
  const [daysLoading, setDaysLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [numChildren, setNumChildren] = useState(1);
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResult | null>(null);
  const [copied, setCopied] = useState(false);

  const club = clubs.find((c) => c.id === clubId);
  const option = club?.options.find((o) => o.id === optionId);
  const isFullWeek = option?.optionType === "full_week";
  const timeSlot = option?.timeSlot || "full_day";

  useEffect(() => {
    setOptionId("");
    setSelectedDates([]);
    setDays([]);
    if (!clubId) return;

    let cancelled = false;
    setDaysLoading(true);
    fetch(`/api/admin/bookings?clubId=${clubId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setDays(data.days || []);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load the club's days");
      })
      .finally(() => {
        if (!cancelled) setDaysLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  function toggleDate(date: string) {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date].sort()
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          bookingOptionId: optionId,
          dates: isFullWeek ? [] : selectedDates,
          numChildren,
          parentName,
          parentEmail,
          parentPhone,
          sendEmail,
          reason: reason.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create the booking");
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    await navigator.clipboard.writeText(result.completeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (result) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8" style={{ color: "#22C55E" }} />
          <h3
            className="text-xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--craigies-dark-olive)" }}
          >
            Booking created — {result.ref}
          </h3>
        </div>
        <div className="mt-4 space-y-2 text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
          <p>
            Free booking for <strong>{parentName}</strong> ({numChildren}{" "}
            {numChildren === 1 ? "child" : "children"}) on{" "}
            <strong>{result.dates.map(formatDay).join(", ")}</strong>.
          </p>
          <p>
            {result.emailSent ? (
              <>Confirmation email with the child-info link sent to <strong>{parentEmail}</strong>.</>
            ) : sendEmail ? (
              <span className="font-medium" style={{ color: "#EF4444" }}>
                The confirmation email failed to send{result.emailError ? ` (${result.emailError})` : ""} —
                share the link below with the parent instead.
              </span>
            ) : (
              <>No email was sent — share the link below with the parent.</>
            )}
          </p>
        </div>
        <div className="mt-4 rounded-lg p-3" style={{ backgroundColor: "var(--craigies-cream, #F5F4ED)" }}>
          <p className="text-xs font-medium" style={labelStyle}>
            Child information form link
          </p>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto whitespace-nowrap text-xs">{result.completeUrl}</code>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
              style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Link
            href={`/admin/bookings/${result.bookingId}`}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--craigies-olive)" }}
          >
            View booking
          </Link>
          <Link
            href="/admin/bookings"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold"
            style={labelStyle}
          >
            Back to bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Club & option */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h3
          className="mb-4 text-lg font-bold"
          style={{ fontFamily: "'Playfair Display', serif", color: "var(--craigies-dark-olive)" }}
        >
          1. Club &amp; Days
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} style={labelStyle}>
              Club week
            </label>
            <select
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select a club…</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>
              Booking option
            </label>
            <select
              value={optionId}
              onChange={(e) => {
                setOptionId(e.target.value);
                setSelectedDates([]);
              }}
              required
              disabled={!club}
              className={inputClass}
            >
              <option value="">Select an option…</option>
              {club?.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} (normally £{(o.pricePerChild / 100).toFixed(2)}/child — will be free)
                </option>
              ))}
            </select>
          </div>
        </div>

        {option && (
          <div className="mt-4">
            <label className={labelClass} style={labelStyle}>
              Days
            </label>
            {daysLoading ? (
              <p className="mt-2 text-sm text-gray-500">Loading days…</p>
            ) : isFullWeek ? (
              <p className="mt-2 text-sm text-gray-500">
                Full week — every day of the club will be booked automatically.
              </p>
            ) : days.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">No bookable days found for this club.</p>
            ) : (
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {days.map((day) => {
                  const remaining = remainingForSlot(day, timeSlot);
                  const full = remaining < numChildren;
                  const checked = selectedDates.includes(day.date);
                  return (
                    <label
                      key={day.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                        checked ? "border-[var(--craigies-burnt-orange)]" : "border-gray-300"
                      } ${full && !checked ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={full && !checked}
                          onChange={() => toggleDate(day.date)}
                          className="accent-[var(--craigies-burnt-orange)]"
                        />
                        <span style={labelStyle}>{formatDay(day.date)}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {remaining} space{remaining === 1 ? "" : "s"}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 max-w-[200px]">
          <label className={labelClass} style={labelStyle}>
            Number of children
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={numChildren}
            onChange={(e) => setNumChildren(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Parent details */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <h3
          className="mb-4 text-lg font-bold"
          style={{ fontFamily: "'Playfair Display', serif", color: "var(--craigies-dark-olive)" }}
        >
          2. Parent Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass} style={labelStyle}>
              Parent name
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>
              Email
            </label>
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>
              Phone
            </label>
            <input
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass} style={labelStyle}>
            Internal note (optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Free spaces for the Wilsons — friends of the family"
            maxLength={500}
            className={inputClass}
          />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm" style={labelStyle}>
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="accent-[var(--craigies-burnt-orange)]"
          />
          Send the confirmation email (with the child-info form link) to the parent
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={submitting || !clubId || !optionId || (!isFullWeek && selectedDates.length === 0)}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create free booking
        </button>
        <p className="text-sm text-gray-500">Total: £0.00 (100% discount recorded)</p>
      </div>
    </form>
  );
}
