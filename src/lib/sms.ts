/**
 * SMS service using Twilio for transactional messages
 * Sends booking confirmations and reminders to parents
 */

import twilio from 'twilio';
import type { Booking, Club } from '@/types/database';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Lazily initialize client to avoid errors when env vars are missing at build time
let twilioClient: twilio.Twilio | null = null;

function getClient(): twilio.Twilio {
  if (!twilioClient) {
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

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
 * Format date to short readable string (e.g., "Mon 7 Apr")
 */
function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Get the booking reference (first 8 chars of ID, uppercase)
 */
function getBookingRef(bookingId: string): string {
  return bookingId.slice(0, 8).toUpperCase();
}

// =============================================================================
// TYPES
// =============================================================================

export interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// =============================================================================
// SMS FUNCTIONS
// =============================================================================

/**
 * Send booking confirmation SMS after successful payment
 * Short message with booking reference and key details
 */
export async function sendBookingConfirmationSMS(
  booking: Booking,
  club: Club
): Promise<SendSMSResult> {
  if (!twilioPhoneNumber) {
    console.error('Twilio phone number not configured');
    return { success: false, error: 'Twilio phone number not configured' };
  }

  const bookingRef = getBookingRef(booking.id);
  const startDate = formatShortDate(club.start_date);

  const message = `The Clubhouse: Booking confirmed! Ref: ${bookingRef}. ${club.name} starts ${startDate}. We'll send a reminder before the club. See you soon!`;

  try {
    const client = getClient();
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: booking.parent_phone,
    });

    return { success: true, messageId: result.sid };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send booking confirmation SMS:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send morning-of reminder SMS with drop-off details
 * Sent on the first day of the club
 */
export async function sendReminderSMS(
  booking: Booking,
  club: Club
): Promise<SendSMSResult> {
  if (!twilioPhoneNumber) {
    console.error('Twilio phone number not configured');
    return { success: false, error: 'Twilio phone number not configured' };
  }

  const dropOffTime = formatTime(club.morning_start);
  const firstName = booking.parent_name.split(' ')[0];

  const message = `Hi ${firstName}! Reminder: ${club.name} starts today. Drop-off from ${dropOffTime}. Please bring packed lunch, water & outdoor clothes. See you soon! - The Clubhouse`;

  try {
    const client = getClient();
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: booking.parent_phone,
    });

    return { success: true, messageId: result.sid };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send reminder SMS:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
