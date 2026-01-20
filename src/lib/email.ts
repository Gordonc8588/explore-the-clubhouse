/**
 * Email service using Resend for transactional emails
 * Brand colors: Forest (#2D5A3D), Meadow (#4A7C59), Sunshine (#F5A623)
 */

import { Resend } from 'resend';
import type { Booking, Club, Child } from '@/types/database';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@exploretheclubhouse.co.uk';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://exploretheclubhouse.co.uk';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@exploretheclubhouse.co.uk';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format price from pence to pounds string
 */
function formatPrice(priceInPence: number): string {
  return `£${(priceInPence / 100).toFixed(2)}`;
}

/**
 * Format date to readable string (e.g., "Monday 7th April 2025")
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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
 * Base email template with brand styling
 */
function emailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Explore the Clubhouse</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FEFDF8; color: #3D3D3D;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FEFDF8;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-family: 'Nunito', sans-serif; font-size: 28px; font-weight: 700; color: #2D5A3D;">
                Explore the Clubhouse
              </h1>
            </td>
          </tr>
          <!-- Content Card -->
          <tr>
            <td style="background-color: #FFFFFF; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(45, 90, 61, 0.1);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6B7280;">
                Explore the Clubhouse | Outdoor adventures for children aged 5-11
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                If you have any questions, please contact us at<br>
                <a href="mailto:hello@exploretheclubhouse.co.uk" style="color: #4A7C59;">hello@exploretheclubhouse.co.uk</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Styled button component
 */
function ctaButton(text: string, url: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td align="center" style="background-color: #F5A623; border-radius: 8px;">
          <a href="${url}" style="display: inline-block; padding: 14px 28px; font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 600; color: #3D3D3D; text-decoration: none;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Info box component
 */
function infoBox(title: string, content: string): string {
  return `
    <div style="background-color: #F3F4F6; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #2D5A3D;">
      <h3 style="margin: 0 0 8px; font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 600; color: #2D5A3D;">${title}</h3>
      <p style="margin: 0; font-size: 14px; color: #3D3D3D; line-height: 1.6;">${content}</p>
    </div>
  `;
}

// =============================================================================
// EMAIL FUNCTIONS
// =============================================================================

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send booking confirmation email after successful payment
 * Includes booking details, dates, what to bring, and link to complete child info
 */
export async function sendBookingConfirmation(
  booking: Booking,
  club: Club
): Promise<SendEmailResult> {
  const childInfoUrl = `${siteUrl}/booking/${booking.id}/children`;

  const content = `
    <h2 style="margin: 0 0 8px; font-family: 'Nunito', sans-serif; font-size: 24px; font-weight: 700; color: #2D5A3D;">
      Booking Confirmed! 🎉
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280;">
      Thank you for your booking, ${booking.parent_name.split(' ')[0]}!
    </p>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
      We're thrilled to confirm your booking for <strong>${club.name}</strong>. Your children are going to have an amazing time exploring, playing, and making memories!
    </p>

    <!-- Booking Summary -->
    <div style="background-color: #F3F4F6; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px; font-family: 'Nunito', sans-serif; font-size: 18px; font-weight: 600; color: #2D5A3D;">Booking Summary</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280; width: 140px;">Club</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${club.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Dates</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${formatDate(club.start_date)} - ${formatDate(club.end_date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Number of Children</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${booking.num_children}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Total Paid</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #2D5A3D;">${formatPrice(booking.total_amount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Booking Reference</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500; font-family: monospace;">${booking.id.slice(0, 8).toUpperCase()}</td>
        </tr>
      </table>
    </div>

    <!-- Next Steps -->
    <div style="background-color: #FEF3C7; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #F5A623;">
      <h3 style="margin: 0 0 8px; font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 600; color: #3D3D3D;">⚡ Important: Complete Your Booking</h3>
      <p style="margin: 0; font-size: 14px; color: #3D3D3D; line-height: 1.6;">
        Please complete the child information form so we can ensure your children have the best experience. We need details like medical information and emergency contacts.
      </p>
    </div>

    ${ctaButton('Complete Child Information', childInfoUrl)}

    ${infoBox('📍 Club Times', `
      <strong>Morning Session:</strong> ${formatTime(club.morning_start)} - ${formatTime(club.morning_end)}<br>
      <strong>Afternoon Session:</strong> ${formatTime(club.afternoon_start)} - ${formatTime(club.afternoon_end)}
    `)}

    ${infoBox('🎒 What to Bring', `
      • Packed lunch and water bottle<br>
      • Weather-appropriate clothing (layers recommended)<br>
      • Wellies or sturdy outdoor shoes<br>
      • Sun cream and hat (if sunny)<br>
      • Waterproof jacket<br>
      • A sense of adventure!
    `)}

    <p style="margin: 24px 0 0; font-size: 14px; color: #6B7280; line-height: 1.6;">
      If you have any questions before the club starts, don't hesitate to get in touch. We can't wait to meet your children!
    </p>

    <p style="margin: 16px 0 0; font-size: 16px; color: #3D3D3D;">
      Warm regards,<br>
      <strong style="color: #2D5A3D;">The Explore the Clubhouse Team</strong>
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Explore the Clubhouse <${fromEmail}>`,
      to: booking.parent_email,
      subject: `Booking Confirmed - ${club.name}`,
      html: emailTemplate(content),
    });

    if (error) {
      console.error('Failed to send booking confirmation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send booking confirmation:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send complete booking email after child information form is submitted
 * Includes full booking details and children information
 */
export async function sendBookingComplete(
  booking: Booking,
  club: Club,
  children: Child[]
): Promise<SendEmailResult> {
  const childrenList = children
    .map(
      (child) => `
      <tr>
        <td style="padding: 8px 12px; font-size: 14px; border-bottom: 1px solid #E5E7EB;">${child.name}</td>
        <td style="padding: 8px 12px; font-size: 14px; border-bottom: 1px solid #E5E7EB;">${formatDate(child.date_of_birth)}</td>
        <td style="padding: 8px 12px; font-size: 14px; border-bottom: 1px solid #E5E7EB;">${child.allergies || 'None'}</td>
      </tr>
    `
    )
    .join('');

  const content = `
    <h2 style="margin: 0 0 8px; font-family: 'Nunito', sans-serif; font-size: 24px; font-weight: 700; color: #2D5A3D;">
      You're All Set! ✅
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280;">
      Thank you for completing your booking, ${booking.parent_name.split(' ')[0]}!
    </p>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
      We've received all the information we need. Your booking for <strong>${club.name}</strong> is now complete. We're looking forward to welcoming ${children.length === 1 ? children[0].name : 'your children'} to the club!
    </p>

    <!-- Booking Summary -->
    <div style="background-color: #F3F4F6; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px; font-family: 'Nunito', sans-serif; font-size: 18px; font-weight: 600; color: #2D5A3D;">Booking Details</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280; width: 140px;">Club</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${club.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Dates</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${formatDate(club.start_date)} - ${formatDate(club.end_date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Total Paid</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #2D5A3D;">${formatPrice(booking.total_amount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Booking Reference</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500; font-family: monospace;">${booking.id.slice(0, 8).toUpperCase()}</td>
        </tr>
      </table>
    </div>

    <!-- Children Information -->
    <div style="margin: 24px 0;">
      <h3 style="margin: 0 0 16px; font-family: 'Nunito', sans-serif; font-size: 18px; font-weight: 600; color: #2D5A3D;">Registered Children</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E5E7EB;">
        <thead>
          <tr style="background-color: #F3F4F6;">
            <th style="padding: 12px; font-size: 12px; font-weight: 600; text-align: left; color: #6B7280; text-transform: uppercase;">Name</th>
            <th style="padding: 12px; font-size: 12px; font-weight: 600; text-align: left; color: #6B7280; text-transform: uppercase;">Date of Birth</th>
            <th style="padding: 12px; font-size: 12px; font-weight: 600; text-align: left; color: #6B7280; text-transform: uppercase;">Allergies</th>
          </tr>
        </thead>
        <tbody>
          ${childrenList}
        </tbody>
      </table>
    </div>

    ${infoBox('📍 Club Times', `
      <strong>Morning Session:</strong> ${formatTime(club.morning_start)} - ${formatTime(club.morning_end)}<br>
      <strong>Afternoon Session:</strong> ${formatTime(club.afternoon_start)} - ${formatTime(club.afternoon_end)}
    `)}

    ${infoBox('🎒 Reminder: What to Bring', `
      • Packed lunch and water bottle<br>
      • Weather-appropriate clothing (layers recommended)<br>
      • Wellies or sturdy outdoor shoes<br>
      • Sun cream and hat (if sunny)<br>
      • Waterproof jacket<br>
      • A sense of adventure!
    `)}

    <p style="margin: 24px 0 0; font-size: 14px; color: #6B7280; line-height: 1.6;">
      We'll send you a reminder closer to the start date. If you need to update any information or have questions, please get in touch.
    </p>

    <p style="margin: 16px 0 0; font-size: 16px; color: #3D3D3D;">
      See you soon!<br>
      <strong style="color: #2D5A3D;">The Explore the Clubhouse Team</strong>
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Explore the Clubhouse <${fromEmail}>`,
      to: booking.parent_email,
      subject: `Booking Complete - ${club.name}`,
      html: emailTemplate(content),
    });

    if (error) {
      console.error('Failed to send booking complete email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send booking complete email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send notification to admin when a new booking is made
 */
export async function sendAdminNotification(
  booking: Booking,
  club: Club
): Promise<SendEmailResult> {
  const adminDashboardUrl = `${siteUrl}/admin/bookings/${booking.id}`;

  const content = `
    <h2 style="margin: 0 0 8px; font-family: 'Nunito', sans-serif; font-size: 24px; font-weight: 700; color: #2D5A3D;">
      New Booking Received
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280;">
      A new booking has been made for ${club.name}.
    </p>

    <!-- Booking Details -->
    <div style="background-color: #F3F4F6; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px; font-family: 'Nunito', sans-serif; font-size: 18px; font-weight: 600; color: #2D5A3D;">Booking Details</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280; width: 160px;">Booking ID</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500; font-family: monospace;">${booking.id}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Club</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${club.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Club Dates</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${formatDate(club.start_date)} - ${formatDate(club.end_date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Parent Name</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${booking.parent_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Parent Email</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;"><a href="mailto:${booking.parent_email}" style="color: #4A7C59;">${booking.parent_email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Parent Phone</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;"><a href="tel:${booking.parent_phone}" style="color: #4A7C59;">${booking.parent_phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Number of Children</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${booking.num_children}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Amount Paid</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #2D5A3D;">${formatPrice(booking.total_amount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Status</td>
          <td style="padding: 8px 0; font-size: 14px;">
            <span style="display: inline-block; padding: 4px 12px; background-color: ${booking.status === 'paid' ? '#DEF7EC' : '#FEF3C7'}; color: ${booking.status === 'paid' ? '#03543F' : '#92400E'}; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
              ${booking.status}
            </span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Booked At</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${new Date(booking.created_at).toLocaleString('en-GB')}</td>
        </tr>
      </table>
    </div>

    ${ctaButton('View in Dashboard', adminDashboardUrl)}

    <p style="margin: 24px 0 0; font-size: 14px; color: #6B7280; line-height: 1.6;">
      The parent has been sent a confirmation email with instructions to complete the child information form.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Explore the Clubhouse <${fromEmail}>`,
      to: adminEmail,
      subject: `New Booking: ${booking.parent_name} - ${club.name}`,
      html: emailTemplate(content),
    });

    if (error) {
      console.error('Failed to send admin notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send admin notification:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send reminder email to parents who haven't completed child information
 */
export async function sendIncompleteReminder(
  booking: Booking,
  club: Club
): Promise<SendEmailResult> {
  const childInfoUrl = `${siteUrl}/booking/${booking.id}/children`;

  const content = `
    <h2 style="margin: 0 0 8px; font-family: 'Nunito', sans-serif; font-size: 24px; font-weight: 700; color: #2D5A3D;">
      Don't Forget to Complete Your Booking! 📝
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280;">
      Hi ${booking.parent_name.split(' ')[0]},
    </p>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
      We noticed you haven't yet completed the child information for your booking at <strong>${club.name}</strong>. We need this information to ensure your children have the best and safest experience at the club.
    </p>

    <!-- Booking Summary -->
    <div style="background-color: #F3F4F6; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px; font-family: 'Nunito', sans-serif; font-size: 18px; font-weight: 600; color: #2D5A3D;">Your Booking</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280; width: 140px;">Club</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${club.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Dates</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${formatDate(club.start_date)} - ${formatDate(club.end_date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Children</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${booking.num_children}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Reference</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500; font-family: monospace;">${booking.id.slice(0, 8).toUpperCase()}</td>
        </tr>
      </table>
    </div>

    <!-- Action Required -->
    <div style="background-color: #FEF3C7; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #F5A623;">
      <h3 style="margin: 0 0 8px; font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 600; color: #3D3D3D;">What We Need</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #3D3D3D; line-height: 1.8;">
        <li>Each child's name and date of birth</li>
        <li>Any allergies or medical conditions</li>
        <li>Emergency contact details</li>
        <li>Consent for photos and activities</li>
      </ul>
    </div>

    ${ctaButton('Complete Child Information', childInfoUrl)}

    <p style="margin: 24px 0 0; font-size: 14px; color: #6B7280; line-height: 1.6;">
      This only takes a few minutes and helps us keep your children safe. If you're having any trouble completing the form or have questions, please don't hesitate to reach out.
    </p>

    <p style="margin: 16px 0 0; font-size: 16px; color: #3D3D3D;">
      Thanks,<br>
      <strong style="color: #2D5A3D;">The Explore the Clubhouse Team</strong>
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Explore the Clubhouse <${fromEmail}>`,
      to: booking.parent_email,
      subject: `Action Required: Complete your booking for ${club.name}`,
      html: emailTemplate(content),
    });

    if (error) {
      console.error('Failed to send incomplete reminder:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send incomplete reminder:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
