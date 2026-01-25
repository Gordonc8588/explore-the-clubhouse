/**
 * Email service using Resend for transactional emails
 * Brand colors: Olive (#7A7C4A), Burnt Orange (#D4843E), Dark Olive (#5A5C3A), Cream (#F5F4ED)
 */

import { Resend } from 'resend';
import type { Booking, Club, Child, Newsletter, PromoCode } from '@/types/database';

// Lazy initialize Resend client to avoid errors when API key is not set
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not configured - emails will not be sent');
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

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
  <title>The Clubhouse</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F5F4ED; color: #3D3D3D;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F5F4ED;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; color: #7A7C4A;">
                The Clubhouse
              </h1>
            </td>
          </tr>
          <!-- Content Card -->
          <tr>
            <td style="background-color: #FFFFFF; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(122, 124, 74, 0.1);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6B7280;">
                The Clubhouse | Fun-filled farm experiences for children aged 5-11
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                If you have any questions, please contact us at<br>
                <a href="mailto:hello@exploretheclubhouse.co.uk" style="color: #7A7C4A;">hello@exploretheclubhouse.co.uk</a>
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
        <td align="center" style="background-color: #D4843E; border-radius: 8px;">
          <a href="${url}" style="display: inline-block; padding: 14px 28px; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none;">
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
    <div style="background-color: #F5F4ED; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #7A7C4A;">
      <h3 style="margin: 0 0 8px; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 600; color: #5A5C3A;">${title}</h3>
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
    <h2 style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #7A7C4A;">
      Booking Confirmed!
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280;">
      Thank you for your booking, ${booking.parent_name.split(' ')[0]}!
    </p>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
      We're excited to welcome your child(ren) for <strong>${club.name}</strong> at The Clubhouse! Get ready for a fun-filled farm experience.
    </p>

    <!-- Booking Summary -->
    <div style="background-color: #F5F4ED; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; color: #7A7C4A;">Booking Summary</h3>
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
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #7A7C4A;">${formatPrice(booking.total_amount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Booking Reference</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500; font-family: monospace;">${booking.id.slice(0, 8).toUpperCase()}</td>
        </tr>
      </table>
    </div>

    <!-- Next Steps -->
    <div style="background-color: #FDF6EE; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #D4843E;">
      <h3 style="margin: 0 0 8px; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 600; color: #3D3D3D;">Important: Complete Your Booking</h3>
      <p style="margin: 0; font-size: 14px; color: #3D3D3D; line-height: 1.6;">
        Please fill in the child information form at the earliest opportunity so we can have time to prepare for your child(ren) at the farm. We need details like medical information and emergency contacts.
      </p>
    </div>

    ${ctaButton('Complete Child Information', childInfoUrl)}

    <!-- Terms & Conditions -->
    <div style="background-color: #F5F4ED; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #7A7C4A;">
      <h3 style="margin: 0 0 12px; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 600; color: #5A5C3A;">Key Points to Note</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #3D3D3D; line-height: 1.8;">
        <li><strong>The Clubhouse is not a childcare service.</strong> Our activities are designed as supervised experiences rather than dedicated child care.</li>
        <li><strong>Support for children with additional needs:</strong> While we strive to create an inclusive environment, we are unable to provide one-on-one support. However, we have a limited number of spaces available for parents or guardians to attend alongside children who require additional assistance. If your child would benefit from this, please <a href="mailto:hello@exploretheclubhouse.co.uk" style="color: #D4843E;">contact us</a> directly to check availability.</li>
      </ul>
      <p style="margin: 12px 0 0; font-size: 14px; color: #3D3D3D;">
        Please review our full <a href="https://exploretheclubhouse.co.uk/terms" style="color: #D4843E; font-weight: 500;">Terms & Conditions</a>.
      </p>
    </div>

    ${infoBox('Club Times', `
      <strong>Morning Session:</strong> ${formatTime(club.morning_start)} - ${formatTime(club.morning_end)}<br>
      <strong>Afternoon Session:</strong> ${formatTime(club.afternoon_start)} - ${formatTime(club.afternoon_end)}
    `)}

    ${infoBox('What to Bring', `
      • Packed lunch and water bottle<br>
      • Weather-appropriate clothing (layers recommended)<br>
      • Wellies or sturdy outdoor shoes<br>
      • Sun cream and hat (if sunny)<br>
      • Waterproof jacket<br>
      • A sense of adventure!
    `)}

    <p style="margin: 24px 0 0; font-size: 14px; color: #6B7280; line-height: 1.6;">
      If you have any questions, feel free to reach out. We look forward to hosting your child(ren) on the farm soon!
    </p>

    <p style="margin: 16px 0 0; font-size: 16px; color: #3D3D3D;">
      Best,<br>
      <strong style="color: #7A7C4A;">The Clubhouse Team</strong>
    </p>
  `;

  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: `The Clubhouse <${fromEmail}>`,
      to: booking.parent_email,
      replyTo: fromEmail,
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
    <h2 style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #7A7C4A;">
      You're All Set!
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280;">
      Thank you for completing your booking, ${booking.parent_name.split(' ')[0]}!
    </p>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
      We've received all the information we need. Your booking for <strong>${club.name}</strong> is now complete. We're looking forward to welcoming ${children.length === 1 ? children[0].name : 'your child(ren)'} to the farm!
    </p>

    <!-- Booking Summary -->
    <div style="background-color: #F5F4ED; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; color: #7A7C4A;">Booking Details</h3>
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
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #7A7C4A;">${formatPrice(booking.total_amount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Booking Reference</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500; font-family: monospace;">${booking.id.slice(0, 8).toUpperCase()}</td>
        </tr>
      </table>
    </div>

    <!-- Children Information -->
    <div style="margin: 24px 0;">
      <h3 style="margin: 0 0 16px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; color: #7A7C4A;">Registered Children</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E5E7EB;">
        <thead>
          <tr style="background-color: #F5F4ED;">
            <th style="padding: 12px; font-size: 12px; font-weight: 600; text-align: left; color: #5A5C3A; text-transform: uppercase;">Name</th>
            <th style="padding: 12px; font-size: 12px; font-weight: 600; text-align: left; color: #5A5C3A; text-transform: uppercase;">Date of Birth</th>
            <th style="padding: 12px; font-size: 12px; font-weight: 600; text-align: left; color: #5A5C3A; text-transform: uppercase;">Allergies</th>
          </tr>
        </thead>
        <tbody>
          ${childrenList}
        </tbody>
      </table>
    </div>

    ${infoBox('Club Times', `
      <strong>Morning Session:</strong> ${formatTime(club.morning_start)} - ${formatTime(club.morning_end)}<br>
      <strong>Afternoon Session:</strong> ${formatTime(club.afternoon_start)} - ${formatTime(club.afternoon_end)}
    `)}

    ${infoBox('Reminder: What to Bring', `
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
      <strong style="color: #7A7C4A;">The Clubhouse Team</strong>
    </p>
  `;

  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: `The Clubhouse <${fromEmail}>`,
      to: booking.parent_email,
      replyTo: fromEmail,
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
    <h2 style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #7A7C4A;">
      New Booking Received
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280;">
      A new booking has been made for ${club.name}.
    </p>

    <!-- Booking Details -->
    <div style="background-color: #F5F4ED; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; color: #7A7C4A;">Booking Details</h3>
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
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;"><a href="mailto:${booking.parent_email}" style="color: #D4843E;">${booking.parent_email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Parent Phone</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;"><a href="tel:${booking.parent_phone}" style="color: #D4843E;">${booking.parent_phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Number of Children</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${booking.num_children}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Amount Paid</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #7A7C4A;">${formatPrice(booking.total_amount)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Status</td>
          <td style="padding: 8px 0; font-size: 14px;">
            <span style="display: inline-block; padding: 4px 12px; background-color: ${booking.status === 'paid' ? '#E8EFE0' : '#FDF6EE'}; color: ${booking.status === 'paid' ? '#5A5C3A' : '#D4843E'}; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
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
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: `The Clubhouse <${fromEmail}>`,
      to: adminEmail,
      replyTo: fromEmail,
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
    <h2 style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #7A7C4A;">
      Don't Forget to Complete Your Booking!
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280;">
      Hi ${booking.parent_name.split(' ')[0]},
    </p>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
      We noticed you haven't yet completed the child information for your booking at <strong>${club.name}</strong>. We need this information so we can prepare for your child(ren) at the farm.
    </p>

    <!-- Booking Summary -->
    <div style="background-color: #F5F4ED; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; color: #7A7C4A;">Your Booking</h3>
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
    <div style="background-color: #FDF6EE; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #D4843E;">
      <h3 style="margin: 0 0 8px; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 600; color: #3D3D3D;">What We Need</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #3D3D3D; line-height: 1.8;">
        <li>Each child's name and date of birth</li>
        <li>Any allergies or medical conditions</li>
        <li>Emergency contact details</li>
        <li>Consent for photos and activities</li>
      </ul>
    </div>

    ${ctaButton('Complete Child Information', childInfoUrl)}

    <p style="margin: 24px 0 0; font-size: 14px; color: #6B7280; line-height: 1.6;">
      This only takes a few minutes and helps us keep your child(ren) safe. If you're having any trouble completing the form or have questions, please don't hesitate to reach out.
    </p>

    <p style="margin: 16px 0 0; font-size: 16px; color: #3D3D3D;">
      Thanks,<br>
      <strong style="color: #7A7C4A;">The Clubhouse Team</strong>
    </p>
  `;

  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: `The Clubhouse <${fromEmail}>`,
      to: booking.parent_email,
      replyTo: fromEmail,
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

// =============================================================================
// NEWSLETTER EMAIL FUNCTIONS
// =============================================================================

/**
 * Build a newsletter email with optional club feature and promo code
 */
export function buildNewsletterEmail(
  newsletter: Newsletter,
  club?: Club | null,
  promoCode?: PromoCode | null
): string {
  // Build hero images section
  let heroSection = '';
  if (newsletter.image_urls && newsletter.image_urls.length > 0) {
    const images = newsletter.image_urls
      .map(
        (url) => `
        <img src="${url}" alt="The Clubhouse" style="width: 100%; max-width: 560px; height: auto; border-radius: 12px; margin-bottom: 16px; display: block;" />
      `
      )
      .join('');
    heroSection = `
      <div style="margin-bottom: 24px;">
        ${images}
      </div>
    `;
  }

  // Build featured club section
  let clubSection = '';
  if (club) {
    clubSection = `
      <div style="background-color: #F5F4ED; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #7A7C4A;">
        <h3 style="margin: 0 0 12px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; color: #7A7C4A;">
          ${club.name}
        </h3>
        <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%;">
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6B7280; width: 100px;">Dates</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 500; color: #3D3D3D;">${formatDate(club.start_date)} - ${formatDate(club.end_date)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Times</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 500; color: #3D3D3D;">${formatTime(club.morning_start)} - ${formatTime(club.afternoon_end)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Ages</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 500; color: #3D3D3D;">${club.min_age} - ${club.max_age} years</td>
          </tr>
        </table>
        ${club.description ? `<p style="margin: 12px 0 0; font-size: 14px; color: #3D3D3D; line-height: 1.6;">${club.description}</p>` : ''}
      </div>
    `;
  }

  // Build promo code section
  let promoSection = '';
  if (promoCode) {
    promoSection = infoBox(
      `Use code ${promoCode.code} for ${promoCode.discount_percent}% off!`,
      `Valid until ${formatDate(promoCode.valid_until)}. ${promoCode.max_uses ? `Limited to ${promoCode.max_uses} uses.` : ''}`
    );
  }

  // Build CTA section
  let ctaSection = '';
  if (newsletter.cta_text && newsletter.cta_url) {
    ctaSection = ctaButton(newsletter.cta_text, newsletter.cta_url);
  }

  // Build unsubscribe link
  const unsubscribeSection = `
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
        You received this email because you subscribed to The Clubhouse newsletter.<br>
        <a href="${siteUrl}/unsubscribe?email={{email}}" style="color: #7A7C4A; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  `;

  const content = `
    ${heroSection}
    <div style="font-size: 16px; line-height: 1.7; color: #3D3D3D;">
      ${newsletter.body_html}
    </div>
    ${clubSection}
    ${promoSection}
    ${ctaSection}
    ${unsubscribeSection}
  `;

  return emailTemplate(content);
}

/**
 * Send newsletter to a list of subscriber emails
 * Uses batch sending for large lists
 */
export async function sendNewsletter(
  newsletter: Newsletter,
  subscriberEmails: string[],
  club?: Club | null,
  promoCode?: PromoCode | null
): Promise<{ success: boolean; sentCount: number; errors: string[] }> {
  const resend = getResendClient();
  if (!resend) {
    return { success: false, sentCount: 0, errors: ['Email service not configured'] };
  }

  if (subscriberEmails.length === 0) {
    return { success: false, sentCount: 0, errors: ['No subscribers to send to'] };
  }

  const errors: string[] = [];
  let sentCount = 0;

  // Build the email HTML template
  const htmlTemplate = buildNewsletterEmail(newsletter, club, promoCode);

  // Batch size for Resend API
  const BATCH_SIZE = 100;

  // Process in batches
  for (let i = 0; i < subscriberEmails.length; i += BATCH_SIZE) {
    const batch = subscriberEmails.slice(i, i + BATCH_SIZE);

    try {
      // Resend's batch API
      const batchEmails = batch.map((email) => ({
        from: `The Clubhouse <${fromEmail}>`,
        to: email,
        subject: newsletter.subject,
        html: htmlTemplate.replace(/{{email}}/g, encodeURIComponent(email)),
        headers: {
          'List-Unsubscribe': `<${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}>`,
        },
      }));

      const { data, error } = await resend.batch.send(batchEmails);

      if (error) {
        console.error(`Batch send error:`, error);
        errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
      } else if (data) {
        sentCount += data.data.length;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Batch send exception:`, errorMessage);
      errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${errorMessage}`);
    }
  }

  return {
    success: sentCount > 0,
    sentCount,
    errors,
  };
}

/**
 * Send a test newsletter to a single email address
 */
export async function sendTestNewsletter(
  newsletter: Newsletter,
  testEmail: string,
  club?: Club | null,
  promoCode?: PromoCode | null
): Promise<SendEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const html = buildNewsletterEmail(newsletter, club, promoCode);

    const { data, error } = await resend.emails.send({
      from: `The Clubhouse <${fromEmail}>`,
      to: testEmail,
      subject: `[TEST] ${newsletter.subject}`,
      html: html.replace(/{{email}}/g, encodeURIComponent(testEmail)),
    });

    if (error) {
      console.error('Failed to send test newsletter:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send test newsletter:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send newsletter subscription confirmation email (double opt-in)
 * User must click the link to confirm their email address
 */
export async function sendNewsletterConfirmationEmail(
  email: string,
  confirmationToken: string
): Promise<SendEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }

  const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${confirmationToken}`;

  const content = `
    <h2 style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #7A7C4A;">
      Confirm Your Subscription
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280;">
      Thanks for signing up to The Clubhouse newsletter!
    </p>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #3D3D3D;">
      Please click the button below to confirm your email address and start receiving updates about our holiday clubs, special offers, and farm news.
    </p>

    ${ctaButton('Confirm My Email', confirmUrl)}

    <p style="margin: 24px 0 0; font-size: 14px; color: #6B7280; line-height: 1.6;">
      If you didn't sign up for this newsletter, you can safely ignore this email.
    </p>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
      <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
        This link will expire in 7 days. If you need a new confirmation link, simply sign up again.
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `The Clubhouse <${fromEmail}>`,
      to: email,
      subject: 'Please confirm your newsletter subscription',
      html: emailTemplate(content),
    });

    if (error) {
      console.error('Failed to send confirmation email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send confirmation email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send welcome email after newsletter subscription is confirmed
 */
export async function sendNewsletterWelcomeEmail(
  email: string
): Promise<SendEmailResult> {
  const resend = getResendClient();
  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }

  const content = `
    <h2 style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #7A7C4A;">
      Welcome to The Clubhouse!
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280;">
      Your subscription is now confirmed.
    </p>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #3D3D3D;">
      Thank you for joining our newsletter! You'll be the first to hear about:
    </p>

    <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 16px; line-height: 1.8; color: #3D3D3D;">
      <li>New holiday club dates and booking openings</li>
      <li>Exclusive early-bird offers and discounts</li>
      <li>News and updates from the farm</li>
      <li>Tips for making the most of your child's adventure</li>
    </ul>

    ${ctaButton('View Our Clubs', `${siteUrl}/clubs`)}

    <p style="margin: 24px 0 0; font-size: 14px; color: #6B7280; line-height: 1.6;">
      We're excited to have you as part of The Clubhouse community!
    </p>

    <p style="margin: 16px 0 0; font-size: 16px; color: #3D3D3D;">
      See you soon,<br>
      <strong style="color: #7A7C4A;">The Clubhouse Team</strong>
    </p>

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
        <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #7A7C4A; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `The Clubhouse <${fromEmail}>`,
      to: email,
      subject: 'Welcome to The Clubhouse Newsletter!',
      html: emailTemplate(content),
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send welcome email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
