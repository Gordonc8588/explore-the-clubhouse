"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

// Mock booking data - in a real app this would be fetched from an API
const mockBookingDetails: Record<string, BookingDetail> = {
  BK001: {
    id: "BK001",
    ref: "ETC-2026-001",
    status: "paid",
    club: "Adventure Explorers",
    option: "Full Week",
    startDate: "2026-02-16",
    endDate: "2026-02-20",
    totalAmount: 85.0,
    bookedDays: [
      { date: "2026-02-16", dayName: "Monday" },
      { date: "2026-02-17", dayName: "Tuesday" },
      { date: "2026-02-18", dayName: "Wednesday" },
      { date: "2026-02-19", dayName: "Thursday" },
      { date: "2026-02-20", dayName: "Friday" },
    ],
    parent: {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "07712 345678",
    },
    children: [
      {
        id: "C001",
        name: "Emma Johnson",
        dateOfBirth: "2018-05-12",
        age: 7,
        allergies: ["Peanuts", "Tree nuts"],
        medicalNotes: "Carries EpiPen at all times. Asthma - uses blue inhaler when needed.",
        emergencyContact: {
          name: "Michael Johnson (Father)",
          phone: "07798 123456",
          relationship: "Father",
        },
        consents: {
          photoConsent: true,
          medicalConsent: true,
          sunscreenConsent: true,
          offSiteConsent: false,
        },
      },
      {
        id: "C002",
        name: "Jack Johnson",
        dateOfBirth: "2020-09-03",
        age: 5,
        allergies: [],
        medicalNotes: "",
        emergencyContact: {
          name: "Michael Johnson (Father)",
          phone: "07798 123456",
          relationship: "Father",
        },
        consents: {
          photoConsent: true,
          medicalConsent: true,
          sunscreenConsent: true,
          offSiteConsent: true,
        },
      },
    ],
    createdAt: "2026-01-15T10:23:00Z",
  },
  BK002: {
    id: "BK002",
    ref: "ETC-2026-002",
    status: "paid",
    club: "Farm Friends",
    option: "Single Day",
    startDate: "2026-02-17",
    endDate: "2026-02-17",
    totalAmount: 45.0,
    bookedDays: [{ date: "2026-02-17", dayName: "Tuesday" }],
    parent: {
      name: "Michael Chen",
      email: "m.chen@email.com",
      phone: "07723 456789",
    },
    children: [
      {
        id: "C003",
        name: "Oliver Chen",
        dateOfBirth: "2019-03-22",
        age: 6,
        allergies: ["Dairy"],
        medicalNotes: "Lactose intolerant - please ensure no dairy in snacks.",
        emergencyContact: {
          name: "Lin Chen (Mother)",
          phone: "07745 678901",
          relationship: "Mother",
        },
        consents: {
          photoConsent: false,
          medicalConsent: true,
          sunscreenConsent: true,
          offSiteConsent: true,
        },
      },
    ],
    createdAt: "2026-01-18T14:45:00Z",
  },
  BK003: {
    id: "BK003",
    ref: "ETC-2026-003",
    status: "pending",
    club: "Nature Crafts",
    option: "3 Days",
    startDate: "2026-02-17",
    endDate: "2026-02-19",
    totalAmount: 45.0,
    bookedDays: [
      { date: "2026-02-17", dayName: "Tuesday" },
      { date: "2026-02-18", dayName: "Wednesday" },
      { date: "2026-02-19", dayName: "Thursday" },
    ],
    parent: {
      name: "Emma Williams",
      email: "emma.w@email.com",
      phone: "07734 567890",
    },
    children: [
      {
        id: "C004",
        name: "Lily Williams",
        dateOfBirth: "2017-11-08",
        age: 8,
        allergies: ["Eggs", "Sesame"],
        medicalNotes: "Has mild eczema - may need cream applied if flares up.",
        emergencyContact: {
          name: "Tom Williams (Father)",
          phone: "07756 789012",
          relationship: "Father",
        },
        consents: {
          photoConsent: true,
          medicalConsent: true,
          sunscreenConsent: true,
          offSiteConsent: true,
        },
      },
    ],
    createdAt: "2026-01-19T09:12:00Z",
  },
  BK005: {
    id: "BK005",
    ref: "ETC-2026-005",
    status: "cancelled",
    club: "Outdoor Adventures",
    option: "Single Day",
    startDate: "2026-02-22",
    endDate: "2026-02-22",
    totalAmount: 45.0,
    bookedDays: [{ date: "2026-02-22", dayName: "Monday" }],
    parent: {
      name: "Lucy Taylor",
      email: "lucy.t@email.com",
      phone: "07745 678901",
    },
    children: [
      {
        id: "C005",
        name: "Mia Taylor",
        dateOfBirth: "2019-07-15",
        age: 6,
        allergies: [],
        medicalNotes: "",
        emergencyContact: {
          name: "James Taylor (Father)",
          phone: "07767 890123",
          relationship: "Father",
        },
        consents: {
          photoConsent: true,
          medicalConsent: true,
          sunscreenConsent: true,
          offSiteConsent: false,
        },
      },
    ],
    createdAt: "2026-01-17T16:30:00Z",
  },
};

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
    sunscreenConsent: boolean;
    offSiteConsent: boolean;
  };
}

interface BookedDay {
  date: string;
  dayName: string;
}

interface BookingDetail {
  id: string;
  ref: string;
  status: "pending" | "paid" | "complete" | "cancelled";
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

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get booking data - in a real app this would be fetched from an API
  const booking = mockBookingDetails[bookingId];

  if (!booking) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 font-body text-sm text-stone transition-colors hover:text-bark"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </button>
        <div className="rounded-2xl bg-white p-12 text-center shadow-[var(--shadow-md)]">
          <p className="font-display text-xl font-semibold text-bark">
            Booking not found
          </p>
          <p className="mt-2 font-body text-stone">
            The booking you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const handleCancelBooking = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setShowCancelModal(false);
    // In a real app, you would update the booking status here
    alert("Booking cancelled successfully");
  };

  const handleRefund = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setShowRefundModal(false);
    // In a real app, you would process the refund here
    alert("Refund processed successfully");
  };

  const handleSendReminder = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsProcessing(false);
    alert("Reminder email sent successfully");
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 font-body text-sm text-stone transition-colors hover:text-bark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </button>

      {/* Booking Summary Card */}
      <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-bold text-bark">
                {booking.ref}
              </h2>
              <span
                className={`inline-flex rounded-full px-3 py-1 font-body text-sm font-medium ${getStatusStyles(booking.status)}`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            <p className="mt-1 font-body text-sm text-stone">
              Created {formatDateTime(booking.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-body text-sm text-stone">Total Amount</p>
            <p className="font-display text-2xl font-bold text-bark">
              £{booking.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-forest/10 p-2">
              <Users className="h-5 w-5 text-forest" />
            </div>
            <div>
              <p className="font-body text-xs text-stone">Club</p>
              <p className="font-body font-medium text-bark">{booking.club}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-sunshine/10 p-2">
              <Calendar className="h-5 w-5 text-amber" />
            </div>
            <div>
              <p className="font-body text-xs text-stone">Dates</p>
              <p className="font-body font-medium text-bark">
                {formatDate(booking.startDate)}
                {booking.startDate !== booking.endDate && (
                  <> - {formatDate(booking.endDate)}</>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-meadow/10 p-2">
              <Clock className="h-5 w-5 text-meadow" />
            </div>
            <div>
              <p className="font-body text-xs text-stone">Option</p>
              <p className="font-body font-medium text-bark">{booking.option}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-sage/20 p-2">
              <PoundSterling className="h-5 w-5 text-forest" />
            </div>
            <div>
              <p className="font-body text-xs text-stone">Children</p>
              <p className="font-body font-medium text-bark">
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
            className="flex items-center gap-2 rounded-lg border-2 border-red-500 px-4 py-2.5 font-display font-semibold text-red-500 transition-colors hover:bg-red-50"
          >
            <XCircle className="h-5 w-5" />
            Cancel Booking
          </button>
        )}
        {booking.status === "paid" && (
          <button
            onClick={() => setShowRefundModal(true)}
            className="flex items-center gap-2 rounded-lg border-2 border-amber px-4 py-2.5 font-display font-semibold text-amber transition-colors hover:bg-amber/10"
          >
            <RefreshCw className="h-5 w-5" />
            Refund
          </button>
        )}
        {booking.status === "pending" && (
          <button
            onClick={handleSendReminder}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 font-display font-semibold text-white transition-colors hover:bg-meadow disabled:opacity-50"
          >
            <Bell className="h-5 w-5" />
            {isProcessing ? "Sending..." : "Send Reminder"}
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Parent Details Card */}
        <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-bark">
            <User className="h-5 w-5 text-forest" />
            Parent Details
          </h3>
          <div className="mt-4 space-y-3">
            <div>
              <p className="font-body text-xs text-stone">Name</p>
              <p className="font-body font-medium text-bark">{booking.parent.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-stone" />
              <a
                href={`mailto:${booking.parent.email}`}
                className="font-body text-forest hover:underline"
              >
                {booking.parent.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-stone" />
              <a
                href={`tel:${booking.parent.phone}`}
                className="font-body text-forest hover:underline"
              >
                {booking.parent.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Booked Days */}
        <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-bark">
            <Calendar className="h-5 w-5 text-forest" />
            Booked Days
          </h3>
          <div className="mt-4 space-y-2">
            {booking.bookedDays.map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between rounded-lg bg-cloud/50 px-4 py-2"
              >
                <span className="font-body font-medium text-bark">{day.dayName}</span>
                <span className="font-body text-sm text-stone">
                  {formatDate(day.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Children Details Section */}
      <div>
        <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-bark">
          <Users className="h-6 w-6 text-forest" />
          Children ({booking.children.length})
        </h3>
        <div className="space-y-4">
          {booking.children.map((child) => (
            <div
              key={child.id}
              className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h4 className="font-display text-lg font-semibold text-bark">
                    {child.name}
                  </h4>
                  <p className="font-body text-sm text-stone">
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
                    <h5 className="font-display font-semibold text-bark">Allergies</h5>
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
                    <Heart className="h-5 w-5 text-forest" />
                    <h5 className="font-display font-semibold text-bark">
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
                    <Phone className="h-5 w-5 text-forest" />
                    <h5 className="font-display font-semibold text-bark">
                      Emergency Contact
                    </h5>
                  </div>
                  <div className="mt-2">
                    <p className="font-body font-medium text-bark">
                      {child.emergencyContact.name}
                    </p>
                    <a
                      href={`tel:${child.emergencyContact.phone}`}
                      className="font-body text-sm text-forest hover:underline"
                    >
                      {child.emergencyContact.phone}
                    </a>
                  </div>
                </div>

                {/* Consents */}
                <div className="rounded-xl bg-cloud/50 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-forest" />
                    <h5 className="font-display font-semibold text-bark">Consents</h5>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {Object.entries(child.consents).map(([key, value]) => {
                      const label = key
                        .replace("Consent", "")
                        .replace(/([A-Z])/g, " $1")
                        .trim();
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              value ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="font-body text-sm text-bark">
                            {label.charAt(0).toUpperCase() + label.slice(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="font-display text-xl font-bold text-bark">
              Cancel Booking?
            </h3>
            <p className="mt-2 font-body text-stone">
              Are you sure you want to cancel booking <strong>{booking.ref}</strong>?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-lg border-2 border-stone/30 px-4 py-2.5 font-display font-semibold text-bark transition-colors hover:bg-cloud"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 font-display font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {isProcessing ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="font-display text-xl font-bold text-bark">
              Process Refund?
            </h3>
            <p className="mt-2 font-body text-stone">
              Are you sure you want to refund{" "}
              <strong>£{booking.totalAmount.toFixed(2)}</strong> for booking{" "}
              <strong>{booking.ref}</strong>?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 rounded-lg border-2 border-stone/30 px-4 py-2.5 font-display font-semibold text-bark transition-colors hover:bg-cloud"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-amber px-4 py-2.5 font-display font-semibold text-bark transition-colors hover:bg-sunshine disabled:opacity-50"
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
