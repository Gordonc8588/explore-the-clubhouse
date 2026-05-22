/**
 * Bulk-resend booking links carrying the new signed access token (audit C3).
 *
 * After deploying the per-booking-token change, links already emailed to
 * in-flight customers no longer carry a valid token, so the confirmation /
 * complete pages show the "refresh your link" notice. This re-sends the
 * "complete your child information" link — now tokenized — to those customers.
 *
 * Usage:
 *   npx tsx scripts/resend-booking-links.ts             # all 'paid' bookings
 *   npx tsx scripts/resend-booking-links.ts <id> <id>   # specific booking ids
 *   npx tsx scripts/resend-booking-links.ts --dry-run   # print links, send nothing
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
// booking-access only imports node:crypto, so it resolves cleanly under tsx
// (no '@/' alias needed) and produces the exact same token the app verifies.
import { createBookingToken } from '../src/lib/booking-access'

dotenv.config({ path: resolve(__dirname, '../.env.production.local') })
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)
const resend = new Resend(process.env.RESEND_API_KEY!)
const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@exploretheclubhouse.co.uk'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://exploretheclubhouse.co.uk'

function emailHtml(firstName: string, url: string): string {
  return `
<div style="font-family: 'Nunito Sans', -apple-system, sans-serif; background:#F5F4ED; padding:40px 20px;">
  <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:16px; padding:32px;">
    <h1 style="font-family:'Playfair Display',Georgia,serif; color:#7A7C4A; font-size:24px; margin:0 0 16px;">Your secure booking link</h1>
    <p style="color:#3D3D3D; font-size:16px; line-height:1.6; margin:0 0 16px;">Hi ${firstName},</p>
    <p style="color:#3D3D3D; font-size:16px; line-height:1.6; margin:0 0 16px;">
      We've updated how our booking links work to better protect your family's
      information. Please use the button below to complete your child
      information — your previous link will no longer work.
    </p>
    <p style="margin:24px 0;">
      <a href="${url}" style="display:inline-block; background:#D4843E; color:#fff; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:600;">Complete Child Information</a>
    </p>
    <p style="color:#6B7280; font-size:14px; line-height:1.6; margin:16px 0 0;">Any questions, just reply to this email.<br>The Clubhouse Team</p>
  </div>
</div>`.trim()
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const ids = args.filter((a) => !a.startsWith('--'))

  const query = supabase
    .from('bookings')
    .select('id, parent_name, parent_email, status')
  const { data: bookings, error } = ids.length
    ? await query.in('id', ids)
    : await query.eq('status', 'paid')

  if (error) {
    console.error('Failed to fetch bookings:', error)
    process.exit(1)
  }
  if (!bookings?.length) {
    console.log('No matching bookings.')
    return
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}Resending tokenized links to ${bookings.length} booking(s)...\n`)
  for (const b of bookings) {
    const url = `${siteUrl}/complete/${b.id}?t=${createBookingToken(b.id)}`
    const firstName = (b.parent_name || '').split(' ')[0] || 'there'
    if (dryRun) {
      console.log(`would email ${b.parent_email}  ${url}`)
      continue
    }
    const { error: sendErr } = await resend.emails.send({
      from: `The Clubhouse <${fromEmail}>`,
      to: b.parent_email,
      replyTo: fromEmail,
      subject: 'Your secure booking link',
      html: emailHtml(firstName, url),
    })
    console.log(`${sendErr ? 'FAIL ' : 'sent '} ${b.parent_email}  (${b.id.slice(0, 8)})`)
    if (sendErr) console.error(sendErr)
  }
}

main()
