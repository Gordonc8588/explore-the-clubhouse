/**
 * Add Summer 2026 clubs (two weeks: July 6-10 and July 13-17).
 *
 * Clones the structure (times, capacity, age range, booking options) from the
 * existing Easter 2026 clubs so pricing matches exactly. Description and slug
 * are summer-specific.
 *
 * Run with: npx tsx scripts/add-summer-2026.ts
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

const SUMMER_DESCRIPTION =
  "Join us at The Clubhouse for a sun-soaked summer of farm adventures! Children will help with the harvest, care for the animals, explore the woods at their summer best, get hands-on with growing crops, and enjoy long days outdoors at Craigies Farm."

const SUMMER_IMAGE_URL =
  'https://res.cloudinary.com/dqicgqgmx/image/upload/v1772227013/newsletters/gsvtzovxgsd20caonkpx.jpg'

const WEEKS = [
  {
    slug: 'summer-week1-2026',
    name: 'Summer Holiday Club 2026 – Week 1',
    start_date: '2026-07-06',
    end_date: '2026-07-10',
    days: ['2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09', '2026-07-10'],
  },
  {
    slug: 'summer-week2-2026',
    name: 'Summer Holiday Club 2026 – Week 2',
    start_date: '2026-07-13',
    end_date: '2026-07-17',
    days: ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17'],
  },
]

async function main() {
  console.log('Fetching template Easter 2026 club...\n')

  const { data: template, error: fetchError } = await supabase
    .from('clubs')
    .select('*, booking_options(*), club_days(*)')
    .ilike('name', '%easter%')
    .gte('start_date', '2026-04-01')
    .lte('start_date', '2026-04-30')
    .order('start_date', { ascending: true })
    .limit(1)
    .single()

  if (fetchError || !template) {
    console.error('Error fetching template Easter club:', fetchError)
    process.exit(1)
  }

  console.log(`Template: ${template.name}`)
  console.log(`  Times: ${template.morning_start}–${template.morning_end} / ${template.afternoon_start}–${template.afternoon_end}`)
  console.log(`  Ages: ${template.min_age}-${template.max_age}`)
  console.log(`  Booking options: ${template.booking_options.length}`)
  console.log(`  Day capacity: morning ${template.club_days[0]?.morning_capacity}, afternoon ${template.club_days[0]?.afternoon_capacity}\n`)

  for (const week of WEEKS) {
    console.log(`Creating ${week.name} (${week.start_date} to ${week.end_date})...`)

    const { data: newClub, error: clubError } = await supabase
      .from('clubs')
      .insert({
        slug: week.slug,
        name: week.name,
        description: SUMMER_DESCRIPTION,
        image_url: SUMMER_IMAGE_URL,
        start_date: week.start_date,
        end_date: week.end_date,
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
      console.error(`Error creating ${week.name}:`, clubError)
      process.exit(1)
    }

    console.log(`  ✓ Club created: id=${newClub.id} slug=${newClub.slug}`)

    const morningCapacity = template.club_days[0]?.morning_capacity ?? 20
    const afternoonCapacity = template.club_days[0]?.afternoon_capacity ?? 20

    const days = week.days.map((date) => ({
      club_id: newClub.id,
      date,
      morning_capacity: morningCapacity,
      afternoon_capacity: afternoonCapacity,
      is_available: true,
    }))

    const { error: daysError } = await supabase.from('club_days').insert(days)
    if (daysError) {
      console.error(`Error creating days for ${week.name}:`, daysError)
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
      console.error(`Error creating booking options for ${week.name}:`, optionsError)
      process.exit(1)
    }
    console.log(`  ✓ Created ${options.length} booking options`)
    console.log(`  → /clubs/${newClub.slug}\n`)
  }

  console.log('✅ Summer 2026 clubs created successfully.')
}

main().catch(console.error)
