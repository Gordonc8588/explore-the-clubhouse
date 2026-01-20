/**
 * Database Seed Script
 * Run with: npx tsx scripts/seed.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper to generate days for a club (weekdays only)
function generateDays(clubId: string, startDate: string, endDate: string, morningCap = 20, afternoonCap = 20) {
  const days: { club_id: string; date: string; morning_capacity: number; afternoon_capacity: number }[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue // Skip weekends
    
    days.push({
      club_id: clubId,
      date: d.toISOString().split('T')[0],
      morning_capacity: morningCap,
      afternoon_capacity: afternoonCap,
    })
  }
  return days
}

// Standard booking options template
function generateOptions(clubId: string) {
  return [
    { club_id: clubId, name: 'Full Week (Full Day)', description: 'All 5 days, 8:30am - 3:30pm', option_type: 'full_week', time_slot: 'full_day', price_per_child: 15000, sort_order: 1 },
    { club_id: clubId, name: 'Full Week (Mornings)', description: 'All 5 days, 8:30am - 12:00pm', option_type: 'full_week', time_slot: 'morning', price_per_child: 8000, sort_order: 2 },
    { club_id: clubId, name: 'Full Week (Afternoons)', description: 'All 5 days, 12:00pm - 3:30pm', option_type: 'full_week', time_slot: 'afternoon', price_per_child: 8000, sort_order: 3 },
    { club_id: clubId, name: 'Single Day (Full Day)', description: 'Choose any day, 8:30am - 3:30pm', option_type: 'single_day', time_slot: 'full_day', price_per_child: 3500, sort_order: 4 },
    { club_id: clubId, name: 'Single Day (Morning)', description: 'Choose any day, 8:30am - 12:00pm', option_type: 'single_day', time_slot: 'morning', price_per_child: 2000, sort_order: 5 },
    { club_id: clubId, name: 'Single Day (Afternoon)', description: 'Choose any day, 12:00pm - 3:30pm', option_type: 'single_day', time_slot: 'afternoon', price_per_child: 2000, sort_order: 6 },
    { club_id: clubId, name: 'Multiple Days (Full Day)', description: '2+ days, 8:30am - 3:30pm each', option_type: 'multi_day', time_slot: 'full_day', price_per_child: 3500, sort_order: 7 },
    { club_id: clubId, name: 'Multiple Days (Mornings)', description: '2+ days, 8:30am - 12:00pm each', option_type: 'multi_day', time_slot: 'morning', price_per_child: 2000, sort_order: 8 },
    { club_id: clubId, name: 'Multiple Days (Afternoons)', description: '2+ days, 12:00pm - 3:30pm each', option_type: 'multi_day', time_slot: 'afternoon', price_per_child: 2000, sort_order: 9 },
  ]
}

async function seed() {
  console.log('🌱 Starting database seed...\n')
  
  // 1. Insert clubs
  console.log('📅 Creating clubs...')
  const clubs = [
    {
      slug: 'easter-2026',
      name: 'Easter Holiday Club 2026',
      description: 'Join us for an egg-citing Easter adventure! Children will enjoy outdoor activities, meet our farm animals, and take part in seasonal crafts and games.',
      start_date: '2026-04-06',
      end_date: '2026-04-17',
      min_age: 5,
      max_age: 11,
    },
    {
      slug: 'summer-week1-2026',
      name: 'Summer Holiday Club - Week 1',
      description: 'Kick off the summer holidays with a week of outdoor fun! From nature trails to animal care, arts and crafts to team games.',
      start_date: '2026-07-20',
      end_date: '2026-07-24',
      min_age: 5,
      max_age: 11,
    },
    {
      slug: 'summer-week2-2026',
      name: 'Summer Holiday Club - Week 2',
      description: 'Continue the summer adventure with another action-packed week exploring the great outdoors.',
      start_date: '2026-07-27',
      end_date: '2026-07-31',
      min_age: 5,
      max_age: 11,
    },
    {
      slug: 'october-half-term-2026',
      name: 'October Half Term Club 2026',
      description: 'Make the most of the autumn break with seasonal activities, harvest-themed crafts, and outdoor adventures.',
      start_date: '2026-10-26',
      end_date: '2026-10-30',
      min_age: 5,
      max_age: 11,
    },
  ]
  
  const { data: insertedClubs, error: clubsError } = await supabase
    .from('clubs')
    .insert(clubs)
    .select()
  
  if (clubsError) {
    console.error('Error inserting clubs:', clubsError)
    process.exit(1)
  }
  
  console.log(`  ✓ Created ${insertedClubs.length} clubs\n`)
  
  // 2. Insert club days
  console.log('📆 Creating club days...')
  const allDays = insertedClubs.flatMap(club => 
    generateDays(club.id, club.start_date, club.end_date, 20, 20)
  )
  
  const { error: daysError } = await supabase.from('club_days').insert(allDays)
  
  if (daysError) {
    console.error('Error inserting club days:', daysError)
    process.exit(1)
  }
  
  console.log(`  ✓ Created ${allDays.length} club days\n`)
  
  // 3. Insert booking options
  console.log('💰 Creating booking options...')
  const allOptions = insertedClubs.flatMap(club => generateOptions(club.id))
  
  const { error: optionsError } = await supabase.from('booking_options').insert(allOptions)
  
  if (optionsError) {
    console.error('Error inserting booking options:', optionsError)
    process.exit(1)
  }
  
  console.log(`  ✓ Created ${allOptions.length} booking options\n`)
  
  // 4. Insert a test promo code
  console.log('🏷️ Creating promo codes...')
  const { error: promoError } = await supabase.from('promo_codes').insert([
    {
      code: 'SUMMER10',
      discount_percent: 10,
      valid_from: '2026-01-01T00:00:00Z',
      valid_until: '2026-12-31T23:59:59Z',
      max_uses: 100,
    },
    {
      code: 'EARLYBIRD',
      discount_percent: 15,
      valid_from: '2026-01-01T00:00:00Z',
      valid_until: '2026-03-31T23:59:59Z',
      max_uses: 50,
    },
  ])
  
  if (promoError) {
    console.error('Error inserting promo codes:', promoError)
    process.exit(1)
  }
  
  console.log('  ✓ Created 2 promo codes\n')
  
  console.log('✅ Database seeded successfully!')
  console.log('\nCreated:')
  insertedClubs.forEach(club => {
    console.log(`  - ${club.name} (${club.start_date} to ${club.end_date})`)
  })
}

seed().catch(console.error)
