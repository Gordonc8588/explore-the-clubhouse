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
      "From collecting eggs, preparing food and treats for the goats, bunnies and horses – animal lovers will be in their element! Our Animal Specialists will share fascinating new facts and expertly guide the children in caring for our animals.",
  },
  {
    emoji: "🎃",
    title: "Growing & Gardening",
    description:
      "Autumn on the farm means harvesting the last of the summer crops AND the pumpkins they planted in the Spring (for those who were with us then). They'll get to help with the apple picking (and cooking!), gathering veggies and how to protect the plants for the colder months!",
  },
  {
    emoji: "🌾",
    title: "Out in the Fields",
    description:
      "Out in the main farm fields, children will take tours, learn about the machinery, irrigation systems and get into some hands-on soil testing to choose where the plants might grow best!",
  },
  {
    emoji: "🛠",
    title: "Traditional Skills & Woodworking",
    description:
      "From building raised beds to crafting birdhouses for the woods, working on our coop or even little woodworking projects to bring home – children will learn useful hands-on skills, along with enjoying arts and crafts.",
  },
  {
    emoji: "🍽",
    title: "Cookery & Farm-to-Table Food Prep",
    description:
      "Children will be part of cooking or preparing their own meals and snacks, even harvesting fresh veg or fruits from the farm to use in our cookery courses—nothing beats food you've grown yourself!",
  },
  {
    emoji: "🌳",
    title: "Forest Exploration & Bushcraft",
    description:
      "Guided by our in-house forest ranger, kids will identify mini-beasts, learn about woodland animals, play fun group games, and build their very own dens!",
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
                Join us at The Clubhouse this Easter!
              </h2>
              <p
                className="mt-6 font-body text-lg leading-relaxed"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Where children can explore, learn, and enjoy the very best of Scotland&apos;s
                countryside during the holidays! Our activities will vary each day (it is a
                working farm, after all!), but here are just some of the exciting adventures
                we have planned:
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
                👉 Important Details
              </h2>
              <div className="mt-6 space-y-4 font-body text-white/90 leading-relaxed">
                <p>
                  All staff are PVG checked and newly First Aid trained or retrained. We follow
                  good practice guidance with low staff-to-child ratios and thorough risk assessments.
                  Spaces are limited due to the low ratios, so be sure to book early!
                </p>
                <p
                  className="font-semibold"
                  style={{ color: "var(--craigies-burnt-orange)" }}
                >
                  BOOKING PROCESS: To help us plan activities and accommodate children properly,
                  ALL attendee forms must be completed and returned within 3 days of booking.
                  If forms are not received in time, the place will be offered to another family.
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
