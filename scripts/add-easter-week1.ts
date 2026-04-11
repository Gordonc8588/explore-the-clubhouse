/**
 * Add Easter Week 1 (April 6-10) - exact duplicate of existing Easter 2026 (April 13-17)
 * Run with: npx tsx scripts/add-easter-week1.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  // 1. Fetch existing Easter 2026 club with its booking options
  console.log('Fetching existing Easter 2026 club...\n')

  const { data: existing, error: fetchError } = await supabase
    .from('clubs')
    .select('*, booking_options(*), club_days(*)')
    .ilike('name', '%easter%')
    .gte('start_date', '2026-04-01')
    .lte('start_date', '2026-04-30')
    .single()

  if (fetchError || !existing) {
    console.error('Error fetching existing Easter club:', fetchError)
    process.exit(1)
  }

  console.log(`Found: ${existing.name}`)
  console.log(`  Dates: ${existing.start_date} to ${existing.end_date}`)
  console.log(`  Ages: ${existing.min_age}-${existing.max_age}`)
  console.log(`  Morning: ${existing.morning_start} - ${existing.morning_end}`)
  console.log(`  Afternoon: ${existing.afternoon_start} - ${existing.afternoon_end}`)
  console.log(`  Booking options: ${existing.booking_options.length}`)
  console.log(`  Club days: ${existing.club_days.length}`)
  console.log()

  // 2. Create the new club (exact duplicate with new dates and image)
  console.log('Creating Easter Week 1 (April 6-10)...\n')

  const { data: newClub, error: clubError } = await supabase
    .from('clubs')
    .insert({
      slug: 'easter-week1-2026',
      name: existing.name,
      description: existing.description,
      image_url: 'https://res.cloudinary.com/dqicgqgmx/image/upload/v1772227013/newsletters/gsvtzovxgsd20caonkpx.jpg',
      start_date: '2026-04-06',
      end_date: '2026-04-10',
      morning_start: existing.morning_start,
      morning_end: existing.morning_end,
      afternoon_start: existing.afternoon_start,
      afternoon_end: existing.afternoon_end,
      min_age: existing.min_age,
      max_age: existing.max_age,
      is_active: existing.is_active,
      bookings_open: existing.bookings_open,
    })
    .select()
    .single()

  if (clubError || !newClub) {
    console.error('Error creating club:', clubError)
    process.exit(1)
  }

  console.log(`  ✓ Created club: ${newClub.name}`)
  console.log(`    ID: ${newClub.id}`)
  console.log(`    Slug: ${newClub.slug}`)
  console.log(`    Dates: ${newClub.start_date} to ${newClub.end_date}\n`)

  // 3. Create club days (Mon-Fri, April 6-10)
  const days = [
    { club_id: newClub.id, date: '2026-04-06', morning_capacity: existing.club_days[0]?.morning_capacity ?? 20, afternoon_capacity: existing.club_days[0]?.afternoon_capacity ?? 20, is_available: true },
    { club_id: newClub.id, date: '2026-04-07', morning_capacity: existing.club_days[0]?.morning_capacity ?? 20, afternoon_capacity: existing.club_days[0]?.afternoon_capacity ?? 20, is_available: true },
    { club_id: newClub.id, date: '2026-04-08', morning_capacity: existing.club_days[0]?.morning_capacity ?? 20, afternoon_capacity: existing.club_days[0]?.afternoon_capacity ?? 20, is_available: true },
    { club_id: newClub.id, date: '2026-04-09', morning_capacity: existing.club_days[0]?.morning_capacity ?? 20, afternoon_capacity: existing.club_days[0]?.afternoon_capacity ?? 20, is_available: true },
    { club_id: newClub.id, date: '2026-04-10', morning_capacity: existing.club_days[0]?.morning_capacity ?? 20, afternoon_capacity: existing.club_days[0]?.afternoon_capacity ?? 20, is_available: true },
  ]

  const { error: daysError } = await supabase.from('club_days').insert(days)

  if (daysError) {
    console.error('Error creating club days:', daysError)
    process.exit(1)
  }

  console.log(`  ✓ Created 5 club days (April 6-10)\n`)

  // 4. Duplicate booking options from existing club
  const options = existing.booking_options.map((opt: Record<string, unknown>) => ({
    club_id: newClub.id,
    name: opt.name,
    description: opt.description,
    option_type: opt.option_type,
    time_slot: opt.time_slot,
    price_per_child: opt.price_per_child,
    sort_order: opt.sort_order,
    is_active: opt.is_active,
  }))

  const { error: optionsError } = await supabase.from('booking_options').insert(options)

  if (optionsError) {
    console.error('Error creating booking options:', optionsError)
    process.exit(1)
  }

  console.log(`  ✓ Created ${options.length} booking options\n`)

  // Print summary
  console.log('✅ Easter Week 1 created successfully!')
  console.log(`\nBooking options:`)
  options.forEach((opt: Record<string, unknown>) => {
    console.log(`  - ${opt.name}: £${(Number(opt.price_per_child) / 100).toFixed(2)}`)
  })
  console.log(`\nView at: /clubs/${newClub.slug}`)
  console.log(`Admin: /admin/clubs/${newClub.id}`)
}

main().catch(console.error)
