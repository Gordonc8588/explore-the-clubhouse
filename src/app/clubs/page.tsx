import type { Metadata } from "next";
import { ClubCard } from "@/components/ClubCard";
import { createClient } from "@/lib/supabase/server";
import type { Club } from "@/types/database";

export const metadata: Metadata = {
  title: "What's On",
  description:
    "Discover our upcoming holiday clubs at Craigies Farm. From animal care and forest exploration to creative workshops - book your child's adventure today.",
  openGraph: {
    title: "What's On | The Clubhouse",
    description:
      "Discover our upcoming holiday clubs at Craigies Farm. Book your child's adventure today.",
  },
};

async function getUpcomingClubs(): Promise<Club[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: clubs, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('is_active', true)
    .gte('end_date', today)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching clubs:', error);
    return [];
  }

  return clubs || [];
}

const activities = [
  {
    emoji: "🐐",
    title: "Animal Care & Feeding",
    description:
      "This is such a special season to spend with the animals as the farm gets their NEW ARRIVALS - last year was our young chickens and the opportunity to get the little lambs onto bottles. Then of course collecting eggs, and learning about the chickens to preparing food and treats for our goats, bunnies, and horses, animal lovers will be in their element. Our Animal Specialists will share fascinating facts and expertly guide children in caring for the animals.",
  },
  {
    emoji: "🌱",
    title: "Growing & Gardening",
    description:
      "Spring on the farm is all about planting and getting it all growing again! Children will help prepare beds, sow seeds, plant vegetables and flowers, and learn how we care for them as they grow through the season.",
  },
  {
    emoji: "🌾",
    title: "Out in the Fields",
    description:
      "In the main farm fields, children will enjoy guided tours, learn about farm machinery and irrigation systems, and take part in hands-on science — such as testing soil, understanding weather patterns, and discovering where crops grow best.",
  },
  {
    emoji: "🛠",
    title: "Traditional Skills & Woodworking",
    description:
      "From building raised beds and crafting birdhouses for nesting season to helping with the coop or creating small woodworking projects to take home, children will develop practical skills alongside creative arts and crafts.",
  },
  {
    emoji: "🍽",
    title: "Cookery & Farm-to-Table Food Prep",
    description:
      "Children will learn the basics of baking & cooking, using seasonal produce from the farm wherever possible, and collecting their own eggs — learning about where food comes from and how it changes throughout the year.",
  },
  {
    emoji: "🌳",
    title: "Forest Exploration & Bushcraft",
    description:
      "Led by our in-house Forest Ranger, children will explore the woods as they come alive in spring, identify mini-beasts, learn about woodland animals, play team games, and build their very own dens.",
  },
];

export default async function WhatsOnPage() {
  const upcomingClubs = await getUpcomingClubs();

  return (
    <div style={{ backgroundColor: "var(--craigies-cream)" }}>
      {/* Hero Section */}
      <section style={{ backgroundColor: "var(--craigies-olive)" }}>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center">
            <h1
              className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              What&apos;s On
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-white/90 sm:text-xl">
              Discover our upcoming holiday clubs and give your children an
              unforgettable adventure at Craigies Farm.
            </p>
          </div>
        </div>
      </section>

      {/* Easter Club Details Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Intro */}
            <div className="text-center mb-12">
              <h2
                className="text-3xl font-bold sm:text-4xl"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                🌱 Farm Activity Club – Spring 2025 🌱
              </h2>
              <p
                className="mt-2 font-body text-lg font-semibold"
                style={{ color: "var(--craigies-burnt-orange)" }}
              >
                (13-17 April)
              </p>
              <p
                className="mt-6 font-body text-lg leading-relaxed"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Join us at The Clubhouse this spring, where children can explore, learn, and
                enjoy the very best of Scotland&apos;s countryside during the school break.
                As a working farm, activities will vary each day — but here are just some of
                the exciting adventures we have planned:
              </p>
            </div>

            {/* Activities Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {activities.map((activity) => (
                <div
                  key={activity.title}
                  className="rounded-2xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{activity.emoji}</span>
                    <div>
                      <h3
                        className="text-lg font-semibold"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          color: "var(--craigies-dark-olive)",
                        }}
                      >
                        {activity.title}
                      </h3>
                      <p
                        className="mt-2 font-body text-sm leading-relaxed"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* And so much more */}
            <p
              className="mt-8 text-center text-xl font-semibold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-olive)",
              }}
            >
              🌾 And so much more!
            </p>
          </div>
        </div>
      </section>

      {/* Important Details Section */}
      <section
        className="py-16 sm:py-24"
        style={{ backgroundColor: "var(--craigies-olive)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
              <h2
                className="text-2xl font-bold text-white sm:text-3xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                👉 Important Information
              </h2>
              <div className="mt-6 space-y-4 font-body text-white/90 leading-relaxed">
                <p>
                  All staff are PVG checked and newly First Aid trained or retrained. We follow
                  best-practice guidance with low staff-to-child ratios and thorough risk assessments.
                </p>
                <p>
                  Spaces are limited, so early booking is recommended.
                </p>
              </div>

              {/* Bonus for Parents */}
              <div className="mt-8 rounded-xl bg-white/10 p-6">
                <h3
                  className="text-xl font-semibold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-burnt-orange)",
                  }}
                >
                  ☕ Bonus for Parents
                </h3>
                <p className="mt-3 font-body text-white/90 leading-relaxed">
                  If you&apos;d like to catch up on work, emails, or simply enjoy a quiet coffee
                  during your child&apos;s session, you&apos;re welcome to use the Event Space up
                  in the café, complete with free WiFi and fantastic coffee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="upcoming-events" className="py-16 sm:py-24 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Upcoming Events
            </h2>
            <p
              className="mt-4 font-body text-lg"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Book your spot at one of our upcoming holiday clubs.
            </p>
          </div>

          {upcomingClubs.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingClubs.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-8 text-center shadow-md">
              <p
                className="font-body text-lg"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                No upcoming events at the moment. Check back soon for new dates!
              </p>
              <p
                className="mt-4 font-body"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Follow us on social media or sign up to our newsletter to be the first to know
                when new clubs are announced.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
