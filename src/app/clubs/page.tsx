import { ClubCard } from "@/components/ClubCard";
import type { Club } from "@/types/database";

// Mock data for clubs (will be replaced with Supabase fetch when credentials are available)
const mockClubs: Club[] = [
  {
    id: "1",
    slug: "february-half-term-2025",
    name: "February Half Term",
    description: "A week of outdoor adventures during the February break.",
    image_url: null,
    start_date: "2025-02-17",
    end_date: "2025-02-21",
    morning_start: "09:00:00",
    morning_end: "12:30:00",
    afternoon_start: "13:30:00",
    afternoon_end: "17:00:00",
    min_age: 5,
    max_age: 11,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    slug: "easter-holidays-2025",
    name: "Easter Holidays",
    description: "Spring adventures with baby animals and Easter fun.",
    image_url: null,
    start_date: "2025-04-07",
    end_date: "2025-04-18",
    morning_start: "09:00:00",
    morning_end: "12:30:00",
    afternoon_start: "13:30:00",
    afternoon_end: "17:00:00",
    min_age: 5,
    max_age: 11,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "3",
    slug: "may-half-term-2025",
    name: "May Half Term",
    description: "Explore nature as the countryside comes alive.",
    image_url: null,
    start_date: "2025-05-26",
    end_date: "2025-05-30",
    morning_start: "09:00:00",
    morning_end: "12:30:00",
    afternoon_start: "13:30:00",
    afternoon_end: "17:00:00",
    min_age: 5,
    max_age: 11,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "4",
    slug: "summer-holidays-2025",
    name: "Summer Holidays",
    description: "Six weeks of farm fun, outdoor games, and nature exploration.",
    image_url: null,
    start_date: "2025-07-21",
    end_date: "2025-08-29",
    morning_start: "09:00:00",
    morning_end: "12:30:00",
    afternoon_start: "13:30:00",
    afternoon_end: "17:00:00",
    min_age: 5,
    max_age: 11,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "5",
    slug: "october-half-term-2024",
    name: "October Half Term 2024",
    description: "Autumn adventures with harvest activities and woodland walks.",
    image_url: null,
    start_date: "2024-10-28",
    end_date: "2024-11-01",
    morning_start: "09:00:00",
    morning_end: "12:30:00",
    afternoon_start: "13:30:00",
    afternoon_end: "17:00:00",
    min_age: 5,
    max_age: 11,
    is_active: false,
    created_at: "2024-09-01T00:00:00Z",
  },
];

// In production, this would fetch from Supabase:
// import { createServerClient } from "@/lib/supabase/server";
// const supabase = createServerClient();
// const { data: clubs } = await supabase.from("clubs").select("*").order("start_date", { ascending: true });

function groupClubs(clubs: Club[]): { upcoming: Club[]; past: Club[] } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming: Club[] = [];
  const past: Club[] = [];

  for (const club of clubs) {
    const endDate = new Date(club.end_date);
    if (endDate >= today) {
      upcoming.push(club);
    } else {
      past.push(club);
    }
  }

  // Sort upcoming by start date ascending
  upcoming.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  // Sort past by start date descending (most recent first)
  past.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  return { upcoming, past };
}

export default function ClubsPage() {
  const { upcoming, past } = groupClubs(mockClubs);
  const activeUpcoming = upcoming.filter((club) => club.is_active);

  return (
    <div className="bg-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sage/30 to-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-bark sm:text-5xl lg:text-6xl">
              Book Your
              <span className="block text-forest">Holiday Club</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-stone sm:text-xl">
              Choose from our upcoming holiday clubs and give your children an
              unforgettable adventure filled with outdoor fun, animal care, and
              hands-on learning.
            </p>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="var(--color-cream)"
            />
          </svg>
        </div>
      </section>

      {/* Upcoming Clubs Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="font-display text-3xl font-bold text-bark sm:text-4xl">
              Upcoming Clubs
            </h2>
            <p className="mt-4 font-body text-lg text-stone">
              Secure your spot at one of our upcoming holiday clubs.
            </p>
          </div>

          {activeUpcoming.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {activeUpcoming.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-8 text-center shadow-[var(--shadow-md)]">
              <p className="font-body text-lg text-stone">
                No upcoming clubs available at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Past Clubs Section (optional - shown if there are past clubs) */}
      {past.length > 0 && (
        <section className="bg-cloud py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="font-display text-3xl font-bold text-bark sm:text-4xl">
                Past Clubs
              </h2>
              <p className="mt-4 font-body text-lg text-stone">
                Take a look at some of our previous holiday clubs.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((club) => (
                <div key={club.id} className="opacity-60">
                  <ClubCard club={club} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
