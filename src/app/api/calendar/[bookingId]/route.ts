import { NextRequest, NextResponse } from 'next/server';
import { generateICS, type BookedDay } from '@/lib/calendar';
import {
  getBookingById,
  getClubById,
  getClubDays,
  mockBookingOptions,
} from '@/lib/mock-data';
import type { TimeSlot } from '@/types/database';

// =============================================================================
// MOCK BOOKING DAYS
// =============================================================================

/**
 * Mock booking days for demo purposes.
 * In production, this would be fetched from the booking_days table.
 */
function getMockBookingDays(bookingId: string, clubId: string, timeSlot: TimeSlot): BookedDay[] {
  const clubDays = getClubDays(clubId);

  // For demo purposes, return different days based on the booking
  switch (bookingId) {
    case 'booking-001':
      // Full week booking - return all days
      return clubDays.map((clubDay) => ({
        clubDay,
        timeSlot,
      }));

    case 'booking-002':
      // Single day booking - return first day only
      if (clubDays.length > 0) {
        return [{
          clubDay: clubDays[0],
          timeSlot,
        }];
      }
      return [];

    case 'booking-003':
      // Multi-day booking - return first 3 days
      return clubDays.slice(0, 3).map((clubDay) => ({
        clubDay,
        timeSlot,
      }));

    default:
      // Default to all days
      return clubDays.map((clubDay) => ({
        clubDay,
        timeSlot,
      }));
  }
}

// =============================================================================
// API ROUTE
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;

  // Validate bookingId
  if (!bookingId) {
    return NextResponse.json(
      { error: 'Booking ID is required' },
      { status: 400 }
    );
  }

  // Fetch booking
  const booking = getBookingById(bookingId);
  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  // Fetch club
  const club = getClubById(booking.club_id);
  if (!club) {
    return NextResponse.json(
      { error: 'Club not found' },
      { status: 404 }
    );
  }

  // Get booking option to determine time slot
  const bookingOption = mockBookingOptions.find(
    (option) => option.id === booking.booking_option_id
  );
  const timeSlot: TimeSlot = bookingOption?.time_slot || 'full_day';

  // Get booked days
  const bookedDays = getMockBookingDays(bookingId, booking.club_id, timeSlot);

  if (bookedDays.length === 0) {
    return NextResponse.json(
      { error: 'No booked days found for this booking' },
      { status: 404 }
    );
  }

  // Generate ICS file
  const result = generateICS(booking, club, bookedDays);

  if (!result.success || !result.icsString) {
    return NextResponse.json(
      { error: result.error || 'Failed to generate calendar file' },
      { status: 500 }
    );
  }

  // Create filename from club name and booking reference
  const bookingRef = bookingId.slice(0, 8).toUpperCase();
  const clubSlug = club.slug.replace(/[^a-z0-9-]/gi, '-');
  const filename = `${clubSlug}-${bookingRef}.ics`;

  // Return the ICS file as a downloadable attachment
  return new NextResponse(result.icsString, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
