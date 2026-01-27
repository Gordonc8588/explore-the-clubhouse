/**
 * Email Preview Script
 * Generates HTML files to preview email templates in your browser
 *
 * Usage: npx tsx scripts/preview-email.ts
 * Then open the generated HTML files in your browser
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Mock data for preview
const mockBooking = {
  id: 'abc12345-6789-def0-1234-567890abcdef',
  parent_name: 'Sarah Johnson',
  parent_email: 'sarah.johnson@example.com',
  parent_phone: '07700 900123',
  num_children: 2,
  total_amount: 12000, // £120.00 in pence
  status: 'paid' as const,
  created_at: new Date().toISOString(),
};

const mockClub = {
  id: 'club-123',
  name: 'Easter Holiday Club 2026',
  slug: 'easter-2026',
  start_date: '2026-04-06',
  end_date: '2026-04-17',
  morning_start: '08:30:00',
  morning_end: '12:30:00',
  afternoon_start: '13:00:00',
  afternoon_end: '17:00:00',
};

const mockChildren = [
  { name: 'Emma Johnson', date_of_birth: '2018-05-15', allergies: 'Peanuts' },
  { name: 'Oliver Johnson', date_of_birth: '2020-09-22', allergies: null },
];

// Helper functions (copied from email.ts)
function formatPrice(priceInPence: number): string {
  return `£${(priceInPence / 100).toFixed(2)}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes}${ampm}`;
}

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
                The Clubhouse | Fun-filled farm experiences for children aged 5-12
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

function infoBox(title: string, content: string): string {
  return `
    <div style="background-color: #F5F4ED; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #7A7C4A;">
      <h3 style="margin: 0 0 8px; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 600; color: #5A5C3A;">${title}</h3>
      <p style="margin: 0; font-size: 14px; color: #3D3D3D; line-height: 1.6;">${content}</p>
    </div>
  `;
}

// Generate Booking Confirmation Email
function generateBookingConfirmation(): string {
  const booking = mockBooking;
  const club = mockClub;
  const childInfoUrl = `https://exploretheclubhouse.co.uk/booking/${booking.id}/children`;

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

  return emailTemplate(content);
}

// Generate Admin Notification Email
function generateAdminNotification(): string {
  const booking = mockBooking;
  const club = mockClub;
  const adminDashboardUrl = `https://exploretheclubhouse.co.uk/admin/bookings/${booking.id}`;

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

  return emailTemplate(content);
}

// Generate Booking Complete Email
function generateBookingComplete(): string {
  const booking = mockBooking;
  const club = mockClub;
  const children = mockChildren;

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

  return emailTemplate(content);
}

// Main execution
const outputDir = join(process.cwd(), 'email-previews');

// Create output directory if it doesn't exist
import { mkdirSync, existsSync } from 'fs';
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Generate and save previews
const confirmationHtml = generateBookingConfirmation();
const adminHtml = generateAdminNotification();
const completeHtml = generateBookingComplete();

writeFileSync(join(outputDir, 'booking-confirmation.html'), confirmationHtml);
writeFileSync(join(outputDir, 'admin-notification.html'), adminHtml);
writeFileSync(join(outputDir, 'booking-complete.html'), completeHtml);

console.log('Email previews generated successfully!');
console.log('');
console.log('Open these files in your browser:');
console.log(`  - ${join(outputDir, 'booking-confirmation.html')}`);
console.log(`  - ${join(outputDir, 'admin-notification.html')}`);
console.log(`  - ${join(outputDir, 'booking-complete.html')}`);
console.log('');
console.log('Or run: open email-previews/admin-notification.html');
