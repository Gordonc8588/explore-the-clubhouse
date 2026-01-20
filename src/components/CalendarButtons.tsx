import { Download, ExternalLink } from "lucide-react";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import type { Booking, Club, TimeSlot } from "@/types/database";

interface CalendarButtonsProps {
  bookingId: string;
  club: Club;
  booking: Booking;
  /** Time slot for Google Calendar event (defaults to full_day) */
  timeSlot?: TimeSlot;
}

/**
 * Reusable component that displays calendar integration buttons:
 * - Download ICS file button (links to /api/calendar/[bookingId])
 * - Add to Google Calendar button (opens Google Calendar in new tab)
 */
export function CalendarButtons({
  bookingId,
  club,
  booking,
  timeSlot = "full_day",
}: CalendarButtonsProps) {
  const googleCalendarUrl = generateGoogleCalendarUrl(booking, club, timeSlot);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href={`/api/calendar/${bookingId}`}
        download
        className="flex items-center justify-center gap-2 bg-forest text-white font-display font-semibold py-3 px-6 rounded-lg hover:bg-meadow transition-colors"
      >
        <Download className="w-5 h-5" />
        Download .ics File
      </a>
      <a
        href={googleCalendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 border-2 border-forest text-forest font-display font-semibold py-3 px-6 rounded-lg hover:bg-forest hover:text-white transition-colors"
      >
        <ExternalLink className="w-5 h-5" />
        Add to Google Calendar
      </a>
    </div>
  );
}
