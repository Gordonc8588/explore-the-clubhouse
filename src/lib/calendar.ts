/**
 * Calendar service for generating ICS files and Google Calendar URLs
 * Allows parents to add club days to their calendars
 */

import { createEvents, type EventAttributes } from 'ics';
import type { Booking, Club, ClubDay, TimeSlot } from '@/types/database';

// =============================================================================
// TYPES
// =============================================================================

export interface BookedDay {
  clubDay: ClubDay;
  timeSlot: TimeSlot;
}

export interface GenerateICSResult {
  success: boolean;
  icsString?: string;
  error?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Parse a date string (YYYY-MM-DD) into year, month, day components
 */
function parseDateString(dateString: string): [number, number, number] {
  const [year, month, day] = dateString.split('-').map(Number);
  return [year, month, day];
}

/**
 * Parse a time string (HH:MM:SS or HH:MM) into hours and minutes
 */
function parseTimeString(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Get start and end times based on time slot and club settings
 */
function getTimesForSlot(
  club: Club,
  timeSlot: TimeSlot
): { startTime: string; endTime: string } {
  switch (timeSlot) {
    case 'morning':
      return { startTime: club.morning_start!, endTime: club.morning_end! };
    case 'afternoon':
      return { startTime: club.afternoon_start!, endTime: club.afternoon_end! };
    case 'full_day':
    default:
      return { startTime: club.morning_start!, endTime: club.afternoon_end! };
  }
}

/**
 * Format time slot for display
 */
function formatTimeSlot(timeSlot: TimeSlot): string {
  switch (timeSlot) {
    case 'morning':
      return 'Morning Session';
    case 'afternoon':
      return 'Afternoon Session';
    case 'full_day':
    default:
      return 'Full Day';
  }
}

/**
 * Format time string (e.g., "08:30:00" to "8:30am")
 */
function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes}${ampm}`;
}

/**
 * Format date for display (e.g., "Monday 7th April")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// =============================================================================
// ICS GENERATION
// =============================================================================

/**
 * Generate an ICS file string with events for each booked day
 *
 * @param booking - The booking record
 * @param club - The club details
 * @param bookedDays - Array of booked days with their time slots
 * @returns ICS file content string or error
 */
export function generateICS(
  booking: Booking,
  club: Club,
  bookedDays: BookedDay[]
): GenerateICSResult {
  if (bookedDays.length === 0) {
    return { success: false, error: 'No booked days provided' };
  }

  const events: EventAttributes[] = bookedDays.map((bookedDay) => {
    const { startTime, endTime } = getTimesForSlot(club, bookedDay.timeSlot);
    const [year, month, day] = parseDateString(bookedDay.clubDay.date);
    const start = parseTimeString(startTime);
    const end = parseTimeString(endTime);

    const sessionType = formatTimeSlot(bookedDay.timeSlot);
    const dateFormatted = formatDate(bookedDay.clubDay.date);

    return {
      title: `${club.name} - ${sessionType}`,
      description: [
        `${club.name}`,
        `${sessionType}: ${formatTime(startTime)} - ${formatTime(endTime)}`,
        '',
        'What to bring:',
        '- Packed lunch and water bottle',
        '- Weather-appropriate clothing',
        '- Wellies or sturdy outdoor shoes',
        '- Sun cream and hat (if sunny)',
        '- Waterproof jacket',
        '',
        `Booking reference: ${booking.id.slice(0, 8).toUpperCase()}`,
        '',
        'Questions? Contact hello@exploretheclubhouse.co.uk',
      ].join('\n'),
      location: 'The Clubhouse (address to be confirmed)',
      start: [year, month, day, start.hours, start.minutes],
      end: [year, month, day, end.hours, end.minutes],
      startInputType: 'local' as const,
      startOutputType: 'local' as const,
      endInputType: 'local' as const,
      endOutputType: 'local' as const,
      organizer: {
        name: 'The Clubhouse',
        email: 'hello@exploretheclubhouse.co.uk',
      },
      categories: ['Holiday Club', 'Children Activities'],
      status: 'CONFIRMED' as const,
      busyStatus: 'BUSY' as const,
      productId: 'exploretheclubhouse/calendar',
      uid: `${booking.id}-${bookedDay.clubDay.id}@exploretheclubhouse.co.uk`,
    };
  });

  const { error, value } = createEvents(events);

  if (error) {
    console.error('Failed to generate ICS:', error);
    return { success: false, error: 'Failed to generate calendar file' };
  }

  return { success: true, icsString: value };
}

// =============================================================================
// GOOGLE CALENDAR URL
// =============================================================================

/**
 * Generate a Google Calendar add event URL for a single booking
 * Note: Google Calendar URLs only support single events, so this creates
 * an event spanning the full club duration. For multiple individual days,
 * use generateICS instead.
 *
 * @param booking - The booking record
 * @param club - The club details
 * @param timeSlot - The time slot for the booking (defaults to full_day)
 * @returns Google Calendar URL string
 */
export function generateGoogleCalendarUrl(
  booking: Booking,
  club: Club,
  timeSlot: TimeSlot = 'full_day'
): string {
  const { startTime, endTime } = getTimesForSlot(club, timeSlot);
  const sessionType = formatTimeSlot(timeSlot);

  // Format dates for Google Calendar (YYYYMMDD)
  const startDate = club.start_date.replace(/-/g, '');
  const endDate = club.end_date.replace(/-/g, '');

  // Format times for Google Calendar (HHMMSS)
  const startTimeFormatted = startTime.replace(/:/g, '').slice(0, 6);
  const endTimeFormatted = endTime.replace(/:/g, '').slice(0, 6);

  // Google Calendar uses dates format: YYYYMMDDTHHMMSS/YYYYMMDDTHHMMSS
  // For recurring events across multiple days, we set the first day's times
  const dates = `${startDate}T${startTimeFormatted}/${startDate}T${endTimeFormatted}`;

  // Build the event title
  const title = encodeURIComponent(`${club.name} - ${sessionType}`);

  // Build the event description
  const description = encodeURIComponent(
    [
      `${club.name}`,
      `${sessionType}: ${formatTime(startTime)} - ${formatTime(endTime)}`,
      `Club runs: ${formatDate(club.start_date)} to ${formatDate(club.end_date)}`,
      '',
      'What to bring:',
      '- Packed lunch and water bottle',
      '- Weather-appropriate clothing',
      '- Wellies or sturdy outdoor shoes',
      '- Sun cream and hat (if sunny)',
      '- Waterproof jacket',
      '',
      `Booking reference: ${booking.id.slice(0, 8).toUpperCase()}`,
      '',
      'Questions? Contact hello@exploretheclubhouse.co.uk',
    ].join('\n')
  );

  // Build the location
  const location = encodeURIComponent('The Clubhouse (address to be confirmed)');

  // Calculate recurrence rule for weekdays until end date
  // RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=YYYYMMDD
  const recur = `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=${endDate}`;
  const recurrenceEncoded = encodeURIComponent(recur);

  // Build the Google Calendar URL
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: dates,
    details: description,
    location: location,
    recur: recurrenceEncoded,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate a Google Calendar URL for a single specific day
 *
 * @param booking - The booking record
 * @param club - The club details
 * @param clubDay - The specific day
 * @param timeSlot - The time slot for that day
 * @returns Google Calendar URL string
 */
export function generateGoogleCalendarUrlForDay(
  booking: Booking,
  club: Club,
  clubDay: ClubDay,
  timeSlot: TimeSlot
): string {
  const { startTime, endTime } = getTimesForSlot(club, timeSlot);
  const sessionType = formatTimeSlot(timeSlot);

  // Format date for Google Calendar (YYYYMMDD)
  const dateFormatted = clubDay.date.replace(/-/g, '');

  // Format times for Google Calendar (HHMMSS)
  const startTimeFormatted = startTime.replace(/:/g, '').slice(0, 6);
  const endTimeFormatted = endTime.replace(/:/g, '').slice(0, 6);

  // Google Calendar dates format
  const dates = `${dateFormatted}T${startTimeFormatted}/${dateFormatted}T${endTimeFormatted}`;

  // Build the event title
  const title = encodeURIComponent(`${club.name} - ${sessionType}`);

  // Build the event description
  const description = encodeURIComponent(
    [
      `${club.name}`,
      `${formatDate(clubDay.date)}`,
      `${sessionType}: ${formatTime(startTime)} - ${formatTime(endTime)}`,
      '',
      'What to bring:',
      '- Packed lunch and water bottle',
      '- Weather-appropriate clothing',
      '- Wellies or sturdy outdoor shoes',
      '- Sun cream and hat (if sunny)',
      '- Waterproof jacket',
      '',
      `Booking reference: ${booking.id.slice(0, 8).toUpperCase()}`,
      '',
      'Questions? Contact hello@exploretheclubhouse.co.uk',
    ].join('\n')
  );

  // Build the location
  const location = encodeURIComponent('The Clubhouse (address to be confirmed)');

  // Build the Google Calendar URL
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: dates,
    details: description,
    location: location,
  });

  return `${baseUrl}?${params.toString()}`;
}
