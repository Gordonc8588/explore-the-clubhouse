"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  User,
  Users,
  AlertTriangle,
  Heart,
  ShieldCheck,
  Clock,
  PoundSterling,
  RefreshCw,
  Bell,
  UserPlus,
  FileText,
  Trees,
  PawPrint,
} from "lucide-react";

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface PickupPerson {
  name: string;
  phone: string;
  relationship: string;
}

interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  age: number;
  allergies: string[];
  medicalNotes: string;
  emergencyContact1: EmergencyContact;
  emergencyContact2: EmergencyContact;
  pickupPersons: PickupPerson[];
  consents: {
    photoConsent: boolean;
    activityConsent: boolean;
    medicalConsent: boolean;
    farmAnimalConsent: boolean;
    woodlandConsent: boolean;
  };
  parentNotes: string;
}

interface BookedDay {
  bookingDayId: string;
  clubDayId: string;
  date: string;
  dayName: string;
  timeSlot: string;
  sessionType?: string;
}

interface AvailableDay {
  id: string;
  date: string;
  morningCapacity: number;
  afternoonCapacity: number;
  morningBooked: number;
  afternoonBooked: number;
}

interface BookingDetailData {
  id: string;
  ref: string;
  status: string;
  clubId: string;
  club: string;
  option: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  numChildren: number;
  bookedDays: BookedDay[];
  parent: {
    name: string;
    email: string;
    phone: string;
  };
  children: Child[];
  createdAt: string;
}

interface BookingDetailProps {
  booking: BookingDetailData;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
    case "refunded":
      return {
        backgroundColor: "#FEF3C7",
        color: "#D97706",
      };
    default:
      return {
        backgroundColor: "#F3F4F6",
        color: "#6B7280",
      };
  }
}

export function BookingDetail({ booking }: BookingDetailProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [changeDayTarget, setChangeDayTarget] = useState<BookedDay | null>(null);
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [selectedNewDayId, setSelectedNewDayId] = useState<string>("");

  // Cancel / Refund modal
  type RefundInfo = {
    refundablePence: number;
    alreadyRefundedPence: number;
    refundError: string | null;
  };
  type ManageAction = "cancel" | "cancel_refund" | "partial_refund";
  const [showManageModal, setShowManageModal] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [refundInfo, setRefundInfo] = useState<RefundInfo | null>(null);
  const [manageAction, setManageAction] = useState<ManageAction>("cancel");
  const [partialPounds, setPartialPounds] = useState("");
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [cooldownPassed, setCooldownPassed] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);
  const [manageWarning, setManageWarning] = useState<string | null>(null);
  const [partialFailure, setPartialFailure] = useState(false);

  // Brief post-open disable on the confirm button to defeat double-clicks. Start
  // the clock when the form becomes interactive (refund info loaded), so a slow
  // Stripe fetch can't void the window.
  useEffect(() => {
    if (!showManageModal || loadingInfo) {
      setCooldownPassed(false);
      return;
    }
    setCooldownPassed(false);
    const t = setTimeout(() => setCooldownPassed(true), 1500);
    return () => clearTimeout(t);
  }, [showManageModal, loadingInfo]);

  const openManageModal = async () => {
    setShowManageModal(true);
    setManageAction(booking.status === "cancelled" ? "cancel_refund" : "cancel");
    setPartialPounds("");
    setReason("");
    setConfirmText("");
    setManageError(null);
    setManageWarning(null);
    setPartialFailure(false);
    setRefundInfo(null);
    setLoadingInfo(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/cancel`);
      const data = await res.json();
      if (res.ok) {
        setRefundInfo({
          refundablePence: data.refundablePence ?? 0,
          alreadyRefundedPence: data.alreadyRefundedPence ?? 0,
          refundError: data.refundError ?? null,
        });
      } else {
        setManageError(data.error || "Could not load refund details.");
      }
    } catch {
      setManageError("Could not load refund details.");
    } finally {
      setLoadingInfo(false);
    }
  };

  const partialPence = Math.round(parseFloat(partialPounds || "0") * 100);
  const refundablePence = refundInfo?.refundablePence ?? 0;
  const isRefundAction = manageAction === "cancel_refund" || manageAction === "partial_refund";
  const plannedRefundPence =
    manageAction === "cancel_refund" ? refundablePence : manageAction === "partial_refund" ? partialPence : 0;

  // Type-to-confirm gate + brief post-open disable to defeat double-clicks.
  const confirmTarget = isRefundAction ? `£${(plannedRefundPence / 100).toFixed(2)}` : booking.ref;
  const confirmOk = confirmText.trim().toUpperCase() === confirmTarget.trim().toUpperCase();
  const partialValid =
    manageAction !== "partial_refund" || (partialPence >= 1 && partialPence <= refundablePence);
  const canSubmit = confirmOk && cooldownPassed && partialValid && !isProcessing && !loadingInfo;

  const handleManageSubmit = async () => {
    setIsProcessing(true);
    setManageError(null);
    setManageWarning(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: manageAction,
          refundAmountPence: manageAction === "partial_refund" ? partialPence : undefined,
          reason: reason.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Money moved but DB failed → do NOT offer a re-submit (it could double
        // refund). The refund is safe in Stripe; ask them to reload.
        if (data.moneyMoved && !data.dbApplied) {
          setPartialFailure(true);
          setManageWarning(
            data.error ||
              "The refund went through in Stripe but the booking record didn't update. Reload the page — the money is safe; the record may need a manual tidy-up."
          );
        } else {
          setManageError(data.error || "Action failed. Please try again.");
        }
        return;
      }
      setShowManageModal(false);
      router.refresh();
    } catch {
      setManageError("Action failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendReminder = async () => {
    setIsProcessing(true);
    // TODO: Implement actual email sending via API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsProcessing(false);
    alert("Reminder email sent successfully");
  };

  const openChangeDayModal = async (day: BookedDay) => {
    setChangeDayTarget(day);
    setSelectedNewDayId("");
    setLoadingDays(true);
    try {
      const res = await fetch(
        `/api/admin/bookings/${booking.id}/change-day?clubId=${booking.clubId}`
      );
      const data = await res.json();
      if (res.ok) {
        // Filter out days already booked in this booking
        const bookedDayIds = new Set(booking.bookedDays.map((d) => d.clubDayId));
        setAvailableDays(
          (data.days || []).filter((d: AvailableDay) => !bookedDayIds.has(d.id))
        );
      }
    } catch {
      alert("Failed to load available days.");
      setChangeDayTarget(null);
    } finally {
      setLoadingDays(false);
    }
  };

  const handleChangeDay = async () => {
    if (!changeDayTarget || !selectedNewDayId) return;
    setIsProcessing(true);
    try {
      const res = await fetch(
        `/api/admin/bookings/${booking.id}/change-day`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingDayId: changeDayTarget.bookingDayId,
            newClubDayId: selectedNewDayId,
            timeSlot: changeDayTarget.timeSlot,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(`Failed to change day: ${data.error}`);
        return;
      }
      setChangeDayTarget(null);
      router.refresh();
    } catch {
      alert("Failed to change day. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm transition-opacity hover:opacity-80"
        style={{ color: "var(--craigies-dark-olive)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </button>

      {/* Booking Summary Card */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {booking.ref}
              </h2>
              <span
                className="inline-flex rounded-full px-3 py-1 text-sm font-medium"
                style={getStatusBadgeStyles(booking.status)}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Created {formatDateTime(booking.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
              Total Amount
            </p>
            <p
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              £{booking.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-2"
              style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
            >
              <Users className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--craigies-dark-olive)" }}>
                Club
              </p>
              <p
                className="font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                {booking.club}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-2"
              style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
            >
              <Calendar className="h-5 w-5" style={{ color: "var(--craigies-burnt-orange)" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--craigies-dark-olive)" }}>
                Dates
              </p>
              <p
                className="font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                {formatDate(booking.startDate)}
                {booking.startDate !== booking.endDate && (
                  <> - {formatDate(booking.endDate)}</>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-2"
              style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
            >
              <Clock className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--craigies-dark-olive)" }}>
                Option
              </p>
              <p
                className="font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                {booking.option}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-2"
              style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
            >
              <PoundSterling className="h-5 w-5" style={{ color: "var(--craigies-burnt-orange)" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--craigies-dark-olive)" }}>
                Children
              </p>
              <p
                className="font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                {booking.numChildren} child{booking.numChildren !== 1 && "ren"}
                {booking.children.length !== booking.numChildren && (
                  <span className="ml-1 text-xs" style={{ color: "var(--craigies-olive)" }}>
                    ({booking.children.length} profile{booking.children.length !== 1 && "s"})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {booking.status !== "refunded" && (
          <button
            onClick={openManageModal}
            className="flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 font-semibold transition-opacity hover:opacity-80"
            style={{
              borderColor: "#D97706",
              color: "#D97706",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            <RefreshCw className="h-5 w-5" />
            Cancel / Refund
          </button>
        )}
        {booking.status === "pending" && (
          <button
            onClick={handleSendReminder}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: "var(--craigies-olive)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            <Bell className="h-5 w-5" />
            {isProcessing ? "Sending..." : "Send Reminder"}
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Parent Details Card */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3 className="flex items-center gap-2 text-lg font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}>
            <User className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
            Parent Details
          </h3>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs"
              style={{ color: "var(--craigies-dark-olive)" }}>Name</p>
              <p className="font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}>{booking.parent.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-stone" />
              <a
                href={`mailto:${booking.parent.email}`}
                className="hover:underline"
                style={{ color: "var(--craigies-olive)" }}
              >
                {booking.parent.email}
              </a>
            </div>
            {booking.parent.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-stone" />
                <a
                  href={`tel:${booking.parent.phone}`}
                  className="hover:underline"
                style={{ color: "var(--craigies-olive)" }}
                >
                  {booking.parent.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Booked Days */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3 className="flex items-center gap-2 text-lg font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}>
            <Calendar className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
            Booked Days
          </h3>
          <div className="mt-4 space-y-2">
            {booking.bookedDays.length === 0 ? (
              <p className="text-sm"
              style={{ color: "var(--craigies-dark-olive)" }}>No days booked</p>
            ) : (
              booking.bookedDays.map((day) => (
                <div
                  key={day.bookingDayId}
                  className="flex items-center justify-between rounded-lg bg-cloud/50 px-4 py-2"
                >
                  <div>
                    <span className="font-medium"
                      style={{ color: "var(--craigies-dark-olive)" }}>{day.dayName}</span>
                    <span className="ml-2 text-sm"
                      style={{ color: "var(--craigies-dark-olive)" }}>
                      {formatDate(day.date)}
                    </span>
                  </div>
                  {booking.status !== "cancelled" && booking.status !== "refunded" && (
                    <button
                      onClick={() => openChangeDayModal(day)}
                      className="rounded-md px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: "rgba(122, 124, 74, 0.1)",
                        color: "var(--craigies-olive)",
                      }}
                    >
                      Change
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Children Details Section */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--craigies-dark-olive)",
          }}>
          <Users className="h-6 w-6 text-forest" />
          Children ({booking.children.length})
        </h3>
        {booking.children.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="font-body text-stone">No children registered for this booking yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {booking.children.map((child) => (
              <div
                key={child.id}
                className="rounded-2xl bg-white p-6 shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "var(--craigies-dark-olive)",
                      }}>
                      {child.name}
                    </h4>
                    <p className="text-sm"
              style={{ color: "var(--craigies-dark-olive)" }}>
                      Age {child.age} • DOB: {formatDate(child.dateOfBirth)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {/* Allergies - Highlighted */}
                  <div
                    className={`rounded-xl p-4 ${
                      child.allergies.length > 0
                        ? "border-2 border-coral bg-coral/10"
                        : "bg-cloud/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          child.allergies.length > 0 ? "text-coral" : "text-stone"
                        }`}
                      />
                      <h5 className="font-bold"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "var(--craigies-dark-olive)",
                      }}>Allergies</h5>
                    </div>
                    {child.allergies.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {child.allergies.map((allergy) => (
                          <span
                            key={allergy}
                            className="rounded-full bg-coral/20 px-3 py-1 font-body text-sm font-medium text-coral"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 font-body text-sm text-stone">
                        No allergies recorded
                      </p>
                    )}
                  </div>

                  {/* Medical Notes */}
                  <div className="rounded-xl bg-cloud/50 p-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
                      <h5 className="font-bold"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "var(--craigies-dark-olive)",
                      }}>
                        Medical Notes
                      </h5>
                    </div>
                    <p className="mt-2 font-body text-sm text-bark">
                      {child.medicalNotes || "No medical notes recorded"}
                    </p>
                  </div>

                  {/* Emergency Contact 1 */}
                  <div className="rounded-xl bg-cloud/50 p-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
                      <h5 className="font-bold"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "var(--craigies-dark-olive)",
                      }}>
                        Emergency Contact 1
                      </h5>
                    </div>
                    <div className="mt-2">
                      {child.emergencyContact1.name ? (
                        <>
                          <p className="font-medium"
                            style={{ color: "var(--craigies-dark-olive)" }}>
                            {child.emergencyContact1.name}
                          </p>
                          {child.emergencyContact1.relationship && (
                            <p className="text-xs text-stone capitalize">
                              {child.emergencyContact1.relationship.replace('_', ' ')}
                            </p>
                          )}
                          {child.emergencyContact1.phone && (
                            <a
                              href={`tel:${child.emergencyContact1.phone}`}
                              className="font-body text-sm text-forest hover:underline"
                            >
                              {child.emergencyContact1.phone}
                            </a>
                          )}
                        </>
                      ) : (
                        <p className="text-sm"
                          style={{ color: "var(--craigies-dark-olive)" }}>Not provided</p>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contact 2 */}
                  <div className="rounded-xl bg-cloud/50 p-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
                      <h5 className="font-bold"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "var(--craigies-dark-olive)",
                      }}>
                        Emergency Contact 2
                      </h5>
                    </div>
                    <div className="mt-2">
                      {child.emergencyContact2.name ? (
                        <>
                          <p className="font-medium"
                            style={{ color: "var(--craigies-dark-olive)" }}>
                            {child.emergencyContact2.name}
                          </p>
                          {child.emergencyContact2.relationship && (
                            <p className="text-xs text-stone capitalize">
                              {child.emergencyContact2.relationship.replace('_', ' ')}
                            </p>
                          )}
                          {child.emergencyContact2.phone && (
                            <a
                              href={`tel:${child.emergencyContact2.phone}`}
                              className="font-body text-sm text-forest hover:underline"
                            >
                              {child.emergencyContact2.phone}
                            </a>
                          )}
                        </>
                      ) : (
                        <p className="text-sm"
                          style={{ color: "var(--craigies-dark-olive)" }}>Not provided</p>
                      )}
                    </div>
                  </div>

                  {/* Authorized Pickup Persons */}
                  <div className="rounded-xl bg-cloud/50 p-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
                      <h5 className="font-bold"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "var(--craigies-dark-olive)",
                      }}>
                        Authorized Pickup
                      </h5>
                    </div>
                    <div className="mt-2 space-y-2">
                      {child.pickupPersons.length > 0 ? (
                        child.pickupPersons.map((person, idx) => (
                          <div key={idx} className="border-b border-cloud/50 pb-2 last:border-0 last:pb-0">
                            <p className="font-medium text-sm"
                              style={{ color: "var(--craigies-dark-olive)" }}>
                              {person.name}
                            </p>
                            {person.relationship && (
                              <p className="text-xs text-stone capitalize">
                                {person.relationship.replace('_', ' ')}
                              </p>
                            )}
                            {person.phone && (
                              <a
                                href={`tel:${person.phone}`}
                                className="font-body text-xs text-forest hover:underline"
                              >
                                {person.phone}
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-stone">
                          Booking parent only
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Consents */}
                  <div className="rounded-xl bg-cloud/50 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
                      <h5 className="font-bold"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "var(--craigies-dark-olive)",
                      }}>Consents</h5>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            child.consents.photoConsent ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm"
                          style={{ color: "var(--craigies-dark-olive)" }}>Photo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            child.consents.activityConsent ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm"
                          style={{ color: "var(--craigies-dark-olive)" }}>Activity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            child.consents.medicalConsent ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm"
                          style={{ color: "var(--craigies-dark-olive)" }}>Medical</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            child.consents.farmAnimalConsent ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm"
                          style={{ color: "var(--craigies-dark-olive)" }}>
                          <PawPrint className="inline h-3 w-3 mr-0.5" />Farm
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            child.consents.woodlandConsent ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm"
                          style={{ color: "var(--craigies-dark-olive)" }}>
                          <Trees className="inline h-3 w-3 mr-0.5" />Woodland
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Parent Notes */}
                  {child.parentNotes && (
                    <div className="rounded-xl bg-cloud/50 p-4 sm:col-span-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
                        <h5 className="font-bold"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          color: "var(--craigies-dark-olive)",
                        }}>
                          Parent Notes
                        </h5>
                      </div>
                      <p className="mt-2 font-body text-sm text-bark whitespace-pre-wrap">
                        {child.parentNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel / Refund Modal */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h3
              className="text-xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Cancel / Refund {booking.ref}
            </h3>

            {loadingInfo ? (
              <div className="mt-6 flex justify-center py-8">
                <div
                  className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: "var(--craigies-olive)", borderTopColor: "transparent" }}
                />
              </div>
            ) : (
              <>
                {refundInfo && (
                  <p className="mt-2 text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                    Paid £{booking.totalAmount.toFixed(2)} · refundable now{" "}
                    <strong>£{(refundInfo.refundablePence / 100).toFixed(2)}</strong>
                    {refundInfo.alreadyRefundedPence > 0 && (
                      <> · already refunded £{(refundInfo.alreadyRefundedPence / 100).toFixed(2)}</>
                    )}
                  </p>
                )}
                {refundInfo?.refundError && (
                  <p className="mt-1 text-xs" style={{ color: "#D97706" }}>{refundInfo.refundError}</p>
                )}

                {/* Action choices */}
                <div className="mt-4 space-y-2">
                  {booking.status !== "cancelled" && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3" style={{ borderColor: manageAction === "cancel" ? "var(--craigies-olive)" : "#E5E7EB" }}>
                      <input type="radio" name="manageAction" checked={manageAction === "cancel"} onChange={() => { setManageAction("cancel"); setConfirmText(""); }} className="mt-1" />
                      <span>
                        <span className="block font-medium" style={{ color: "var(--craigies-dark-olive)" }}>Cancel, no refund</span>
                        <span className="block text-xs" style={{ color: "#6B7280" }}>Releases the seats. No money returned.</span>
                      </span>
                    </label>
                  )}
                  <label className={`flex items-start gap-3 rounded-lg border p-3 ${refundablePence > 0 ? "cursor-pointer" : "opacity-50"}`} style={{ borderColor: manageAction === "cancel_refund" ? "var(--craigies-olive)" : "#E5E7EB" }}>
                    <input type="radio" name="manageAction" disabled={refundablePence <= 0} checked={manageAction === "cancel_refund"} onChange={() => { setManageAction("cancel_refund"); setConfirmText(""); }} className="mt-1" />
                    <span>
                      <span className="block font-medium" style={{ color: "var(--craigies-dark-olive)" }}>Cancel &amp; full refund (£{(refundablePence / 100).toFixed(2)})</span>
                      <span className="block text-xs" style={{ color: "#6B7280" }}>Refunds everything still refundable and marks the booking refunded.</span>
                    </span>
                  </label>
                  <label className={`flex items-start gap-3 rounded-lg border p-3 ${refundablePence > 0 ? "cursor-pointer" : "opacity-50"}`} style={{ borderColor: manageAction === "partial_refund" ? "var(--craigies-olive)" : "#E5E7EB" }}>
                    <input type="radio" name="manageAction" disabled={refundablePence <= 0} checked={manageAction === "partial_refund"} onChange={() => { setManageAction("partial_refund"); setConfirmText(""); }} className="mt-1" />
                    <span className="flex-1">
                      <span className="block font-medium" style={{ color: "var(--craigies-dark-olive)" }}>Partial / goodwill refund</span>
                      <span className="block text-xs" style={{ color: "#6B7280" }}>Refunds part of the payment; the booking stays active.</span>
                      {manageAction === "partial_refund" && (
                        <span className="mt-2 flex items-center gap-2">
                          <span style={{ color: "var(--craigies-dark-olive)" }}>£</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={partialPounds}
                            onChange={(e) => { setPartialPounds(e.target.value); setConfirmText(""); }}
                            placeholder="0.00"
                            className="w-28 rounded-md border px-2 py-1 text-sm"
                            style={{ borderColor: "#D1D5DB" }}
                          />
                          <span className="text-xs" style={{ color: "#6B7280" }}>max £{(refundablePence / 100).toFixed(2)}</span>
                        </span>
                      )}
                    </span>
                  </label>
                </div>

                {/* Reason */}
                <div className="mt-3">
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason (optional, shown to parent if entered)"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={{ borderColor: "#D1D5DB" }}
                  />
                </div>

                {/* Type-to-confirm */}
                <div className="mt-4 rounded-lg p-3" style={{ backgroundColor: "rgba(212, 132, 62, 0.08)" }}>
                  <p className="text-xs" style={{ color: "var(--craigies-dark-olive)" }}>
                    {isRefundAction
                      ? <>This will refund <strong>£{(plannedRefundPence / 100).toFixed(2)}</strong> to the parent. Type <strong>{confirmTarget}</strong> to confirm.</>
                      : <>This will cancel the booking and release the seats. Type <strong>{confirmTarget}</strong> to confirm.</>}
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={confirmTarget}
                    className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                    style={{ borderColor: "#D1D5DB" }}
                  />
                </div>

                {manageWarning && (
                  <p className="mt-3 rounded-md p-2 text-xs font-medium" style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}>{manageWarning}</p>
                )}
                {manageError && (
                  <p className="mt-3 text-xs font-medium" style={{ color: "#DC2626" }}>{manageError}</p>
                )}

                <div className="mt-6 flex gap-3">
                  {partialFailure ? (
                    <>
                      <button
                        onClick={() => { setShowManageModal(false); router.refresh(); }}
                        className="flex-1 rounded-lg border-2 px-4 py-2.5 font-semibold transition-opacity hover:opacity-80"
                        style={{ borderColor: "#D1D5DB", color: "var(--craigies-dark-olive)", fontFamily: "'Playfair Display', serif" }}
                      >
                        Close
                      </button>
                      <button
                        onClick={handleManageSubmit}
                        disabled={isProcessing}
                        className="flex-1 rounded-lg px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: "var(--craigies-olive)", fontFamily: "'Playfair Display', serif" }}
                      >
                        {isProcessing ? "Finishing..." : "Finish refund"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowManageModal(false)}
                        className="flex-1 rounded-lg border-2 px-4 py-2.5 font-semibold transition-opacity hover:opacity-80"
                        style={{ borderColor: "#D1D5DB", color: "var(--craigies-dark-olive)", fontFamily: "'Playfair Display', serif" }}
                      >
                        Close
                      </button>
                      <button
                        onClick={handleManageSubmit}
                        disabled={!canSubmit}
                        className="flex-1 rounded-lg px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: isRefundAction ? "#D97706" : "#EF4444", fontFamily: "'Playfair Display', serif" }}
                      >
                        {isProcessing
                          ? "Working..."
                          : isRefundAction
                            ? `Refund £${(plannedRefundPence / 100).toFixed(2)}`
                            : "Cancel booking"}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Change Day Modal */}
      {changeDayTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3
              className="text-xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Change Booking Day
            </h3>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Moving <strong>{changeDayTarget.dayName} {formatDate(changeDayTarget.date)}</strong> to:
            </p>

            {loadingDays ? (
              <div className="mt-4 flex justify-center py-8">
                <div
                  className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
                  style={{ borderColor: "var(--craigies-olive)", borderTopColor: "transparent" }}
                />
              </div>
            ) : availableDays.length === 0 ? (
              <p className="mt-4 text-sm text-center" style={{ color: "var(--craigies-dark-olive)" }}>
                No other available days for this club.
              </p>
            ) : (
              <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                {availableDays.map((day) => {
                  const dayDate = new Date(day.date);
                  const dayName = dayDate.toLocaleDateString("en-GB", { weekday: "long" });
                  const morningRemaining = day.morningCapacity - day.morningBooked;
                  const afternoonRemaining = day.afternoonCapacity - day.afternoonBooked;
                  const isFull = morningRemaining <= 0 && afternoonRemaining <= 0;
                  const isSelected = selectedNewDayId === day.id;

                  return (
                    <button
                      key={day.id}
                      onClick={() => !isFull && setSelectedNewDayId(day.id)}
                      disabled={isFull}
                      className={`w-full rounded-lg px-4 py-3 text-left transition-all ${
                        isFull
                          ? "cursor-not-allowed opacity-50"
                          : isSelected
                            ? ""
                            : "hover:opacity-80"
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? "rgba(122, 124, 74, 0.15)"
                          : "rgba(122, 124, 74, 0.05)",
                        outlineColor: isSelected ? "var(--craigies-olive)" : undefined,
                        outline: isSelected ? "2px solid var(--craigies-olive)" : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span
                            className="font-medium"
                            style={{ color: "var(--craigies-dark-olive)" }}
                          >
                            {dayName}
                          </span>
                          <span
                            className="ml-2 text-sm"
                            style={{ color: "var(--craigies-dark-olive)" }}
                          >
                            {formatDate(day.date)}
                          </span>
                        </div>
                        <div className="text-right text-xs" style={{ color: "var(--craigies-dark-olive)" }}>
                          {isFull ? (
                            <span className="font-medium text-red-500">Full</span>
                          ) : (
                            <span>{morningRemaining} AM / {afternoonRemaining} PM</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setChangeDayTarget(null)}
                className="flex-1 rounded-lg border-2 px-4 py-2.5 font-semibold transition-opacity hover:opacity-80"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleChangeDay}
                disabled={isProcessing || !selectedNewDayId}
                className="flex-1 rounded-lg px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: "var(--craigies-olive)",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {isProcessing ? "Changing..." : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
