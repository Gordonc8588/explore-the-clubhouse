import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load env from both .env.local and .env.production.local
dotenv.config({ path: resolve(__dirname, '../.env.production.local') })
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  // Step 1: Find Christopher Wilson's booking
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      parent_name,
      parent_email,
      total_amount,
      status,
      created_at,
      clubs(name),
      children(name),
      booking_days(club_days(date))
    `)
    .eq('id', '2e7fe215-9bb1-413c-a4e8-0b70ddec7c81')

  if (error) {
    console.error('Error querying bookings:', error)
    process.exit(1)
  }

  if (!bookings || bookings.length === 0) {
    console.log('No bookings found for Christopher Wilson')
    process.exit(1)
  }

  console.log('\n=== Found Bookings ===\n')
  for (const b of bookings) {
    const days = (b.booking_days as any[])?.map((bd: any) => bd.club_days?.date).sort()
    console.log(`ID: ${b.id}`)
    console.log(`Name: ${b.parent_name}`)
    console.log(`Email: ${b.parent_email}`)
    console.log(`Amount: £${(b.total_amount / 100).toFixed(2)}`)
    console.log(`Status: ${b.status}`)
    console.log(`Club: ${(b.clubs as any)?.name}`)
    console.log(`Children: ${(b.children as any[])?.map((c: any) => c.name).join(', ')}`)
    console.log(`Days: ${days?.join(', ')}`)
    console.log(`Created: ${b.created_at}`)
    console.log('---')
  }

  // Check if --update flag was passed
  if (process.argv.includes('--update')) {
    for (const b of bookings) {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'refunded' })
        .eq('id', b.id)

      if (updateError) {
        console.error(`Failed to update booking ${b.id}:`, updateError)
      } else {
        console.log(`\n✓ Booking ${b.id} status updated to 'refunded'`)
      }
    }
  } else {
    console.log('\nDry run - no changes made. Run with --update to mark as refunded.')
  }
}

main()
