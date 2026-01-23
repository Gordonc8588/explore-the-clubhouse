"use client";

import { useState } from "react";
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
  XCircle,
  RefreshCw,
  Bell,
} from "lucide-react";

interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  age: number;
  allergies: string[];
  medicalNotes: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  consents: {
    photoConsent: boolean;
    medicalConsent: boolean;
  };
}

interface BookedDay {
  date: string;
  dayName: string;
  sessionType?: string;
}

interface BookingDetailData {
  id: string;
  ref: string;
  status: string;
  club: string;
  option: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
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
    default:
      return {
        backgroundColor: "#F3F4F6",
        color: "#6B7280",
      };
  }
}

export function BookingDetail({ booking }: BookingDetailProps) {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancelBooking = async () => {
    setIsProcessing(true);
    // TODO: Implement actual cancel via API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setShowCancelModal(false);
    alert("Booking cancelled successfully");
    router.refresh();
  };

  const handleRefund = async () => {
    setIsProcessing(true);
    // TODO: Implement actual refund via API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setShowRefundModal(false);
    alert("Refund processed successfully");
    router.refresh();
  };

  const handleSendReminder = async () => {
    setIsProcessing(true);
    // TODO: Implement actual email sending via API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsProcessing(false);
    alert("Reminder email sent successfully");
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
                {booking.children.length} child{booking.children.length !== 1 && "ren"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {booking.status !== "cancelled" && booking.status !== "complete" && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 font-semibold transition-opacity hover:opacity-80"
            style={{
              borderColor: "#EF4444",
              color: "#EF4444",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            <XCircle className="h-5 w-5" />
            Cancel Booking
          </button>
        )}
        {booking.status === "paid" && (
          <button
            onClick={() => setShowRefundModal(true)}
            className="flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 font-semibold transition-opacity hover:opacity-80"
            style={{
              borderColor: "#D97706",
              color: "#D97706",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            <RefreshCw className="h-5 w-5" />
            Refund
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
                  key={day.date}
                  className="flex items-center justify-between rounded-lg bg-cloud/50 px-4 py-2"
                >
                  <span className="font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}>{day.dayName}</span>
                  <span className="text-sm"
              style={{ color: "var(--craigies-dark-olive)" }}>
                    {formatDate(day.date)}
                  </span>
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

                  {/* Emergency Contact */}
                  <div className="rounded-xl bg-cloud/50 p-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5" style={{ color: "var(--craigies-olive)" }} />
                      <h5 className="font-bold"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "var(--craigies-dark-olive)",
                      }}>
                        Emergency Contact
                      </h5>
                    </div>
                    <div className="mt-2">
                      {child.emergencyContact.name ? (
                        <>
                          <p className="font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}>
                            {child.emergencyContact.name}
                          </p>
                          {child.emergencyContact.phone && (
                            <a
                              href={`tel:${child.emergencyContact.phone}`}
                              className="font-body text-sm text-forest hover:underline"
                            >
                              {child.emergencyContact.phone}
                            </a>
                          )}
                        </>
                      ) : (
                        <p className="text-sm"
              style={{ color: "var(--craigies-dark-olive)" }}>Not provided</p>
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
                            child.consents.medicalConsent ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm"
                      style={{ color: "var(--craigies-dark-olive)" }}>Medical</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3
              className="text-xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Cancel Booking?
            </h3>
            <p
              className="mt-2"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Are you sure you want to cancel booking <strong>{booking.ref}</strong>?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-lg border-2 px-4 py-2.5 font-semibold transition-opacity hover:opacity-80"
                style={{
                  borderColor: "#D1D5DB",
                  color: "var(--craigies-dark-olive)",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isProcessing}
                className="flex-1 rounded-lg px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: "#EF4444",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {isProcessing ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3
              className="text-xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Process Refund?
            </h3>
            <p
              className="mt-2"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Are you sure you want to refund{" "}
              <strong>£{booking.totalAmount.toFixed(2)}</strong> for booking{" "}
              <strong>{booking.ref}</strong>?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRefundModal(false)}
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
                onClick={handleRefund}
                disabled={isProcessing}
                className="flex-1 rounded-lg px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: "#D97706",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {isProcessing ? "Processing..." : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
