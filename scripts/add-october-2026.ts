/**
 * Add the October 2026 holiday club (Mon 12 – Fri 16 October).
 *
 * Clones the structure (times, capacity, age range, booking options) from
 * Summer 2026 Week 3 so pricing matches exactly. Description, slug and image
 * are October-specific. Refuses to run if the slug already exists.
 *
 * Run with: npx tsx scripts/add-october-2026.ts
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

const TEMPLATE_SLUG = 'summer-week3-2026'

const CLUB = {
  slug: 'october-2026',
  name: 'October Holiday Club 2026',
  description:
    "Join us at The Clubhouse for a week of autumn adventures on the farm this October! Children will care for the animals as they get ready for winter, get hands-on with pumpkins and the last of the harvest, explore the woods in their autumn colours, cook over the fire, and enjoy some spooky-season fun at Craigies Farm.",
  // Reusing the current club-card image until an autumn photo is supplied.
  image_url:
    'https://res.cloudinary.com/dqicgqgmx/image/upload/v1772227013/newsletters/gsvtzovxgsd20caonkpx.jpg',
  start_date: '2026-10-12',
  end_date: '2026-10-16',
  days: ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16'],
}

async function main() {
  const { data: existing } = await supabase
    .from('clubs')
    .select('id, slug')
    .eq('slug', CLUB.slug)
    .maybeSingle()

  if (existing) {
    console.error(`Club with slug "${CLUB.slug}" already exists (id=${existing.id}). Nothing to do.`)
    process.exit(1)
  }

  console.log(`Fetching template club "${TEMPLATE_SLUG}"...\n`)

  const { data: template, error: fetchError } = await supabase
    .from('clubs')
    .select('*, booking_options(*), club_days(*)')
    .eq('slug', TEMPLATE_SLUG)
    .single()

  if (fetchError || !template) {
    console.error('Error fetching template club:', fetchError)
    process.exit(1)
  }

  console.log(`Template: ${template.name}`)
  console.log(`  Times: ${template.morning_start}–${template.morning_end} / ${template.afternoon_start}–${template.afternoon_end}`)
  console.log(`  Ages: ${template.min_age}-${template.max_age}`)
  console.log(`  Booking options: ${template.booking_options.length}`)
  console.log(`  Day capacity: morning ${template.club_days[0]?.morning_capacity}, afternoon ${template.club_days[0]?.afternoon_capacity}\n`)

  console.log(`Creating ${CLUB.name} (${CLUB.start_date} to ${CLUB.end_date})...`)

  const { data: newClub, error: clubError } = await supabase
    .from('clubs')
    .insert({
      slug: CLUB.slug,
      name: CLUB.name,
      description: CLUB.description,
      image_url: CLUB.image_url,
      start_date: CLUB.start_date,
      end_date: CLUB.end_date,
      morning_start: template.morning_start,
      morning_end: template.morning_end,
      afternoon_start: template.afternoon_start,
      afternoon_end: template.afternoon_end,
      min_age: template.min_age,
      max_age: template.max_age,
      is_active: true,
      bookings_open: true,
    })
    .select()
    .single()

  if (clubError || !newClub) {
    console.error(`Error creating ${CLUB.name}:`, clubError)
    process.exit(1)
  }

  console.log(`  ✓ Club created: id=${newClub.id} slug=${newClub.slug}`)

  const morningCapacity = template.club_days[0]?.morning_capacity ?? 30
  const afternoonCapacity = template.club_days[0]?.afternoon_capacity ?? 30

  const days = CLUB.days.map((date) => ({
    club_id: newClub.id,
    date,
    morning_capacity: morningCapacity,
    afternoon_capacity: afternoonCapacity,
    is_available: true,
  }))

  const { error: daysError } = await supabase.from('club_days').insert(days)
  if (daysError) {
    console.error('Error creating club days:', daysError)
    process.exit(1)
  }
  console.log(`  ✓ Created ${days.length} club days`)

  const options = template.booking_options.map((opt: Record<string, unknown>) => ({
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
  console.log(`  ✓ Created ${options.length} booking options`)
  console.log(`  → /clubs/${newClub.slug}\n`)

  console.log('✅ October 2026 club created successfully.')
}

main().catch(console.error)
