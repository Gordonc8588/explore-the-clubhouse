import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedTestClub() {
  console.log('Creating test club...');

  // Create club
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .insert({
      slug: 'february-half-term-2026',
      name: 'February Half Term 2026',
      description: 'Join us for an exciting week of outdoor adventures during February half term! Activities include forest exploration, nature crafts, team games, and more.',
      start_date: '2026-02-16',
      end_date: '2026-02-20',
      min_age: 4,
      max_age: 11,
      is_active: true,
    })
    .select()
    .single();

  if (clubError) {
    console.error('Error creating club:', clubError);
    return;
  }

  console.log('Club created:', club.name);

  // Create club days (Mon-Fri)
  const days = [
    '2026-02-16',
    '2026-02-17',
    '2026-02-18',
    '2026-02-19',
    '2026-02-20',
  ];

  const { error: daysError } = await supabase.from('club_days').insert(
    days.map((date) => ({
      club_id: club.id,
      date,
      morning_capacity: 30,
      afternoon_capacity: 30,
      is_available: true,
    }))
  );

  if (daysError) {
    console.error('Error creating club days:', daysError);
    return;
  }

  console.log('Club days created:', days.length);

  // Create booking options
  const options = [
    { name: 'Full Week (Full Day)', description: 'All 5 days, 8:30am - 3:30pm', option_type: 'full_week', time_slot: 'full_day', price_per_child: 17500, sort_order: 1 },
    { name: 'Full Week (Mornings)', description: 'All 5 days, 8:30am - 12:00pm', option_type: 'full_week', time_slot: 'morning', price_per_child: 10000, sort_order: 2 },
    { name: 'Full Week (Afternoons)', description: 'All 5 days, 12:00pm - 3:30pm', option_type: 'full_week', time_slot: 'afternoon', price_per_child: 10000, sort_order: 3 },
    { name: 'Single Day (Full Day)', description: 'Any single day, 8:30am - 3:30pm', option_type: 'single_day', time_slot: 'full_day', price_per_child: 4000, sort_order: 4 },
    { name: 'Single Day (Morning)', description: 'Any single day, 8:30am - 12:00pm', option_type: 'single_day', time_slot: 'morning', price_per_child: 2500, sort_order: 5 },
    { name: 'Single Day (Afternoon)', description: 'Any single day, 12:00pm - 3:30pm', option_type: 'single_day', time_slot: 'afternoon', price_per_child: 2500, sort_order: 6 },
  ];

  const { error: optionsError } = await supabase.from('booking_options').insert(
    options.map((opt) => ({
      club_id: club.id,
      ...opt,
      is_active: true,
    }))
  );

  if (optionsError) {
    console.error('Error creating booking options:', optionsError);
    return;
  }

  console.log('Booking options created:', options.length);
  console.log('\nTest club ready! Visit http://localhost:3000/clubs/february-half-term-2026');
}

seedTestClub();
