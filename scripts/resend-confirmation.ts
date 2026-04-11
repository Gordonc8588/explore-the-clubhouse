/**
 * One-off script to resend booking confirmation email to Luisa Margiotta
 * with a brief apology for the delayed confirmation.
 *
 * Usage: npx tsx scripts/resend-confirmation.ts
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load env vars
dotenv.config({ path: resolve(__dirname, '../.env.production.local') })
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const BOOKING_ID = 'f59ce62a-fe87-4092-a20b-d72d1a43cd47'
const CLUB_ID = 'fe7a86cc-0843-440d-8668-fcc2d3d7e0d2'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const resend = new Resend(process.env.RESEND_API_KEY!)
const fromEmail = 'hello@exploretheclubhouse.co.uk'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://exploretheclubhouse.co.uk'

// --- Helper functions (mirrored from src/lib/email.ts) ---

function formatPrice(priceInPence: number): string {
  return `\u00A3${(priceInPence / 100).toFixed(2)}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes}${ampm}`
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
  `.trim()
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
  `
}

function infoBox(title: string, content: string): string {
  return `
    <div style="background-color: #F5F4ED; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #7A7C4A;">
      <h3 style="margin: 0 0 8px; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 600; color: #5A5C3A;">${title}</h3>
      <p style="margin: 0; font-size: 14px; color: #3D3D3D; line-height: 1.6;">${content}</p>
    </div>
  `
}

type TimeSlot = 'full_day' | 'morning' | 'afternoon'

interface Club {
  id: string
  name: string
  start_date: string
  end_date: string
  morning_start: string | null
  morning_end: string | null
  afternoon_start: string | null
  afternoon_end: string | null
}

interface Booking {
  id: string
  parent_name: string
  parent_email: string
  num_children: number
  total_amount: number
  status: string
}

function getClubTimesHtml(club: Club, timeSlot?: TimeSlot): string {
  if (timeSlot === 'morning') {
    return `<strong>Session Time:</strong> ${formatTime(club.morning_start!)} - ${formatTime(club.morning_end!)}`
  }
  if (timeSlot === 'afternoon') {
    return `<strong>Session Time:</strong> ${formatTime(club.afternoon_start!)} - ${formatTime(club.afternoon_end!)}`
  }
  return `<strong>Drop-off:</strong> ${formatTime(club.morning_start!)}<br><strong>Pick-up:</strong> ${formatTime(club.afternoon_end!)}`
}

// --- Main ---

async function main() {
  console.log('Fetching booking and club data...')

  // Fetch booking
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, parent_name, parent_email, num_children, total_amount, status')
    .eq('id', BOOKING_ID)
    .single()

  if (bookingError || !booking) {
    console.error('Error fetching booking:', bookingError)
    process.exit(1)
  }

  // Fetch club
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .select('id, name, start_date, end_date, morning_start, morning_end, afternoon_start, afternoon_end')
    .eq('id', CLUB_ID)
    .single()

  if (clubError || !club) {
    console.error('Error fetching club:', clubError)
    process.exit(1)
  }

  // Fetch booked dates via booking_days -> club_days
  const { data: bookingDays, error: daysError } = await supabase
    .from('booking_days')
    .select('time_slot, club_days(date)')
    .eq('booking_id', BOOKING_ID)

  if (daysError) {
    console.error('Error fetching booking days:', daysError)
    process.exit(1)
  }

  const bookedDates = (bookingDays || [])
    .map((bd: any) => bd.club_days?.date as string)
    .filter(Boolean)
    .sort()

  const timeSlot: TimeSlot = (bookingDays?.[0]?.time_slot as TimeSlot) || 'full_day'

  console.log(`Booking: ${booking.parent_name} (${booking.parent_email})`)
  console.log(`Club: ${club.name}`)
  console.log(`Booked dates: ${bookedDates.join(', ')}`)
  console.log(`Time slot: ${timeSlot}`)
  console.log(`Amount: ${formatPrice(booking.total_amount)}`)

  // Build email content - same as sendBookingConfirmation but with apology at top
  const childInfoUrl = `${siteUrl}/complete/${booking.id}`

  const content = `
    <h2 style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #7A7C4A;">
      Booking Confirmed!
    </h2>
    <p style="margin: 0 0 24px; font-size: 16px; color: #6B7280;">
      Thank you for your booking, ${booking.parent_name.split(' ')[0]}!
    </p>

    <!-- Apology note -->
    <div style="background-color: #FDF6EE; border-radius: 12px; padding: 16px 20px; margin: 0 0 24px; border-left: 4px solid #D4843E;">
      <p style="margin: 0; font-size: 14px; color: #3D3D3D; line-height: 1.6;">
        We apologise for the delay in sending your confirmation email. Please rest assured your booking was successfully processed at the time of payment and your place is fully secured. Here are your booking details for your records.
      </p>
    </div>

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
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Club Week</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${formatDate(club.start_date)} - ${formatDate(club.end_date)}</td>
        </tr>
        ${bookedDates.length > 0 ? `<tr>
          <td style="padding: 8px 0; font-size: 14px; color: #6B7280;">Booked Day${bookedDates.length > 1 ? 's' : ''}</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${bookedDates.map(d => formatDateShort(d)).join('<br>')}</td>
        </tr>` : ''}
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
      <h3 style="margin: 0 0 12px; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 600; color: #5A5C3A;">Important Information</h3>
      <p style="margin: 0 0 12px; font-size: 14px; color: #3D3D3D; line-height: 1.8;">
        The Clubhouse is a drop-off activity club and is not a Care Inspectorate-registered childcare service. While we strive to be welcoming and inclusive, we are unfortunately unable to provide the level of support required for children with additional support needs or significant behavioural circumstances.
      </p>
      <p style="margin: 0; font-size: 14px; color: #3D3D3D;">
        Please review our full <a href="https://exploretheclubhouse.co.uk/terms" style="color: #D4843E; font-weight: 500;">Cancellation & Behaviour Policy</a>.
      </p>
    </div>

    ${infoBox('Club Times', getClubTimesHtml(club as Club, timeSlot))}

    ${infoBox('What to Bring', `
      &bull; Packed lunch and water bottle<br>
      &bull; Weather-appropriate clothing (layers recommended)<br>
      &bull; Wellies or sturdy outdoor shoes<br>
      &bull; Sun cream and hat (if sunny)<br>
      &bull; Waterproof jacket<br>
      &bull; A sense of adventure!
    `)}

    <p style="margin: 24px 0 0; font-size: 14px; color: #6B7280; line-height: 1.6;">
      If you have any questions, feel free to reach out. We look forward to hosting your child(ren) on the farm soon!
    </p>

    <p style="margin: 16px 0 0; font-size: 16px; color: #3D3D3D;">
      Best,<br>
      <strong style="color: #7A7C4A;">The Clubhouse Team</strong>
    </p>
  `

  console.log('\nSending confirmation email...')

  const { data, error } = await resend.emails.send({
    from: `The Clubhouse <${fromEmail}>`,
    to: booking.parent_email,
    replyTo: fromEmail,
    subject: `Booking Confirmed - ${club.name}`,
    html: emailTemplate(content),
  })

  if (error) {
    console.error('Failed to send email:', error)
    process.exit(1)
  }

  console.log(`Email sent successfully! Message ID: ${data?.id}`)
}

main()
