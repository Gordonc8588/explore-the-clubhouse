/**
 * Mock data for development until Supabase is connected
 * Uses realistic dates and prices for the Explore the Clubhouse booking platform
 */

import type { Club, ClubDay, BookingOption, Booking, Child } from '@/types/database';

// =============================================================================
// CLUBS
// =============================================================================

export const mockClubs: Club[] = [
  {
    id: 'club-easter-2025',
    slug: 'easter-2025',
    name: 'Easter Holiday Club 2025',
    description: 'Join us for an egg-citing Easter adventure! Children will enjoy outdoor activities, meet our farm animals, and take part in seasonal crafts and games. Perfect for keeping children active and engaged during the Easter break.',
    image_url: null,
    start_date: '2025-04-07',
    end_date: '2025-04-17',
    morning_start: '08:30:00',
    morning_end: '12:00:00',
    afternoon_start: '12:00:00',
    afternoon_end: '15:30:00',
    min_age: 5,
    max_age: 11,
    is_active: true,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'club-summer-week1-2025',
    slug: 'summer-week1-2025',
    name: 'Summer Holiday Club - Week 1',
    description: 'Kick off the summer holidays with a week of outdoor fun! From nature trails to animal care, arts and crafts to team games, there\'s something for everyone. Our experienced staff ensure children have a safe and memorable time.',
    image_url: null,
    start_date: '2025-07-21',
    end_date: '2025-07-25',
    morning_start: '08:30:00',
    morning_end: '12:00:00',
    afternoon_start: '12:00:00',
    afternoon_end: '15:30:00',
    min_age: 5,
    max_age: 11,
    is_active: true,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'club-summer-week2-2025',
    slug: 'summer-week2-2025',
    name: 'Summer Holiday Club - Week 2',
    description: 'Continue the summer adventure with another action-packed week! Children will explore the great outdoors, make new friends, and create lasting memories on our beautiful farm setting.',
    image_url: null,
    start_date: '2025-07-28',
    end_date: '2025-08-01',
    morning_start: '08:30:00',
    morning_end: '12:00:00',
    afternoon_start: '12:00:00',
    afternoon_end: '15:30:00',
    min_age: 5,
    max_age: 11,
    is_active: true,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'club-october-half-term-2025',
    slug: 'october-half-term-2025',
    name: 'October Half Term Club 2025',
    description: 'Make the most of the autumn break with our October half-term club! Enjoy seasonal activities, harvest-themed crafts, and plenty of outdoor adventures before the winter sets in.',
    image_url: null,
    start_date: '2025-10-27',
    end_date: '2025-10-31',
    morning_start: '08:30:00',
    morning_end: '12:00:00',
    afternoon_start: '12:00:00',
    afternoon_end: '15:30:00',
    min_age: 5,
    max_age: 11,
    is_active: true,
    created_at: '2025-01-15T10:00:00Z',
  },
];

// =============================================================================
// CLUB DAYS
// =============================================================================

// Helper function to generate days for a club
function generateClubDays(
  clubId: string,
  startDate: string,
  endDate: string,
  morningCapacity: number = 20,
  afternoonCapacity: number = 20
): ClubDay[] {
  const days: ClubDay[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let dayIndex = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // Skip weekends
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = d.toISOString().split('T')[0];
    days.push({
      id: `${clubId}-day-${dayIndex}`,
      club_id: clubId,
      date: dateStr,
      morning_capacity: morningCapacity,
      afternoon_capacity: afternoonCapacity,
      is_available: true,
      created_at: '2025-01-15T10:00:00Z',
    });
    dayIndex++;
  }

  return days;
}

export const mockClubDays: ClubDay[] = [
  // Easter 2025 (April 7-17, 2025 - excludes weekends)
  ...generateClubDays('club-easter-2025', '2025-04-07', '2025-04-17', 20, 20),

  // Summer Week 1 (July 21-25, 2025)
  ...generateClubDays('club-summer-week1-2025', '2025-07-21', '2025-07-25', 24, 24),

  // Summer Week 2 (July 28 - August 1, 2025)
  ...generateClubDays('club-summer-week2-2025', '2025-07-28', '2025-08-01', 24, 24),

  // October Half Term (October 27-31, 2025)
  ...generateClubDays('club-october-half-term-2025', '2025-10-27', '2025-10-31', 20, 20),
];

// =============================================================================
// BOOKING OPTIONS
// =============================================================================

// Helper function to generate standard booking options for a club
function generateBookingOptions(clubId: string, isWeekClub: boolean = true): BookingOption[] {
  const baseOptions: BookingOption[] = [
    // Full Day options
    {
      id: `${clubId}-option-full-week-full-day`,
      club_id: clubId,
      name: 'Full Week (Full Day)',
      description: 'All 5 days, 8:30am - 3:30pm. Best value for a full week of fun!',
      option_type: 'full_week',
      time_slot: 'full_day',
      price_per_child: 15000, // £150
      sort_order: 1,
      is_active: isWeekClub,
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: `${clubId}-option-full-week-morning`,
      club_id: clubId,
      name: 'Full Week (Mornings)',
      description: 'All 5 days, 8:30am - 12:00pm. Perfect for younger children.',
      option_type: 'full_week',
      time_slot: 'morning',
      price_per_child: 8000, // £80
      sort_order: 2,
      is_active: isWeekClub,
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: `${clubId}-option-full-week-afternoon`,
      club_id: clubId,
      name: 'Full Week (Afternoons)',
      description: 'All 5 days, 12:00pm - 3:30pm. Ideal for a relaxed afternoon adventure.',
      option_type: 'full_week',
      time_slot: 'afternoon',
      price_per_child: 8000, // £80
      sort_order: 3,
      is_active: isWeekClub,
      created_at: '2025-01-15T10:00:00Z',
    },
    // Single Day options
    {
      id: `${clubId}-option-single-day-full-day`,
      club_id: clubId,
      name: 'Single Day (Full Day)',
      description: 'Choose any available day, 8:30am - 3:30pm.',
      option_type: 'single_day',
      time_slot: 'full_day',
      price_per_child: 3500, // £35
      sort_order: 4,
      is_active: true,
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: `${clubId}-option-single-day-morning`,
      club_id: clubId,
      name: 'Single Day (Morning)',
      description: 'Choose any available day, 8:30am - 12:00pm.',
      option_type: 'single_day',
      time_slot: 'morning',
      price_per_child: 2000, // £20
      sort_order: 5,
      is_active: true,
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: `${clubId}-option-single-day-afternoon`,
      club_id: clubId,
      name: 'Single Day (Afternoon)',
      description: 'Choose any available day, 12:00pm - 3:30pm.',
      option_type: 'single_day',
      time_slot: 'afternoon',
      price_per_child: 2000, // £20
      sort_order: 6,
      is_active: true,
      created_at: '2025-01-15T10:00:00Z',
    },
    // Multiple Days options
    {
      id: `${clubId}-option-multi-day-full-day`,
      club_id: clubId,
      name: 'Multiple Days (Full Day)',
      description: 'Choose 2+ days, 8:30am - 3:30pm. Price per day.',
      option_type: 'multi_day',
      time_slot: 'full_day',
      price_per_child: 3500, // £35 per day
      sort_order: 7,
      is_active: true,
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: `${clubId}-option-multi-day-morning`,
      club_id: clubId,
      name: 'Multiple Days (Mornings)',
      description: 'Choose 2+ days, 8:30am - 12:00pm. Price per day.',
      option_type: 'multi_day',
      time_slot: 'morning',
      price_per_child: 2000, // £20 per day
      sort_order: 8,
      is_active: true,
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: `${clubId}-option-multi-day-afternoon`,
      club_id: clubId,
      name: 'Multiple Days (Afternoons)',
      description: 'Choose 2+ days, 12:00pm - 3:30pm. Price per day.',
      option_type: 'multi_day',
      time_slot: 'afternoon',
      price_per_child: 2000, // £20 per day
      sort_order: 9,
      is_active: true,
      created_at: '2025-01-15T10:00:00Z',
    },
  ];

  return baseOptions;
}

export const mockBookingOptions: BookingOption[] = [
  // Easter 2025 - Easter is longer than a week, so full week is available
  ...generateBookingOptions('club-easter-2025', true),

  // Summer Week 1 - Standard 5-day week
  ...generateBookingOptions('club-summer-week1-2025', true),

  // Summer Week 2 - Standard 5-day week
  ...generateBookingOptions('club-summer-week2-2025', true),

  // October Half Term - Standard 5-day week
  ...generateBookingOptions('club-october-half-term-2025', true),
];

// =============================================================================
// BOOKINGS
// =============================================================================

export const mockBookings: Booking[] = [
  {
    id: 'booking-001',
    club_id: 'club-easter-2025',
    booking_option_id: 'club-easter-2025-option-full-week-full-day',
    parent_name: 'Sarah Thompson',
    parent_email: 'sarah.thompson@example.com',
    parent_phone: '07700 900123',
    num_children: 2,
    total_amount: 30000, // £300 (2 children × £150)
    status: 'complete',
    promo_code_id: null,
    stripe_payment_intent_id: 'pi_mock_001',
    stripe_checkout_session_id: 'cs_mock_001',
    created_at: '2025-03-15T14:30:00Z',
  },
  {
    id: 'booking-002',
    club_id: 'club-summer-week1-2025',
    booking_option_id: 'club-summer-week1-2025-option-single-day-full-day',
    parent_name: 'James Wilson',
    parent_email: 'james.wilson@example.com',
    parent_phone: '07700 900456',
    num_children: 1,
    total_amount: 3500, // £35
    status: 'paid',
    promo_code_id: null,
    stripe_payment_intent_id: 'pi_mock_002',
    stripe_checkout_session_id: 'cs_mock_002',
    created_at: '2025-06-20T09:15:00Z',
  },
  {
    id: 'booking-003',
    club_id: 'club-easter-2025',
    booking_option_id: 'club-easter-2025-option-multi-day-morning',
    parent_name: 'Emma Davies',
    parent_email: 'emma.davies@example.com',
    parent_phone: '07700 900789',
    num_children: 1,
    total_amount: 6000, // £60 (3 mornings × £20)
    status: 'complete',
    promo_code_id: null,
    stripe_payment_intent_id: 'pi_mock_003',
    stripe_checkout_session_id: 'cs_mock_003',
    created_at: '2025-03-10T16:45:00Z',
  },
];

// =============================================================================
// CHILDREN
// =============================================================================

export const mockChildren: Child[] = [
  // Children for booking-001 (Sarah Thompson's 2 children)
  {
    id: 'child-001',
    booking_id: 'booking-001',
    name: 'Oliver Thompson',
    date_of_birth: '2017-05-12',
    allergies: 'None',
    medical_notes: '',
    emergency_contact_name: 'David Thompson',
    emergency_contact_phone: '07700 900124',
    photo_consent: true,
    activity_consent: true,
    medical_consent: true,
    created_at: '2025-03-15T15:00:00Z',
  },
  {
    id: 'child-002',
    booking_id: 'booking-001',
    name: 'Emily Thompson',
    date_of_birth: '2019-08-23',
    allergies: 'Peanuts',
    medical_notes: 'Carries EpiPen in bag',
    emergency_contact_name: 'David Thompson',
    emergency_contact_phone: '07700 900124',
    photo_consent: true,
    activity_consent: true,
    medical_consent: true,
    created_at: '2025-03-15T15:00:00Z',
  },
  // Child for booking-003 (Emma Davies's child)
  {
    id: 'child-003',
    booking_id: 'booking-003',
    name: 'Lily Davies',
    date_of_birth: '2018-02-14',
    allergies: 'None',
    medical_notes: 'Asthma - inhaler in bag',
    emergency_contact_name: 'Michael Davies',
    emergency_contact_phone: '07700 900790',
    photo_consent: false,
    activity_consent: true,
    medical_consent: true,
    created_at: '2025-03-10T17:00:00Z',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a club by its ID
 */
export function getClubById(id: string): Club | undefined {
  return mockClubs.find(club => club.id === id);
}

/**
 * Get a club by its slug
 */
export function getClubBySlug(slug: string): Club | undefined {
  return mockClubs.find(club => club.slug === slug);
}

/**
 * Get all days for a specific club
 */
export function getClubDays(clubId: string): ClubDay[] {
  return mockClubDays.filter(day => day.club_id === clubId);
}

/**
 * Get all booking options for a specific club
 */
export function getBookingOptions(clubId: string): BookingOption[] {
  return mockBookingOptions.filter(option => option.club_id === clubId && option.is_active);
}

/**
 * Get all active clubs
 */
export function getActiveClubs(): Club[] {
  return mockClubs.filter(club => club.is_active);
}

/**
 * Format price from pence to pounds string
 */
export function formatPrice(priceInPence: number): string {
  return `£${(priceInPence / 100).toFixed(2)}`;
}

/**
 * Get a booking by its ID
 */
export function getBookingById(id: string): Booking | undefined {
  return mockBookings.find(booking => booking.id === id);
}

/**
 * Get all children for a specific booking
 */
export function getChildrenByBookingId(bookingId: string): Child[] {
  return mockChildren.filter(child => child.booking_id === bookingId);
}
