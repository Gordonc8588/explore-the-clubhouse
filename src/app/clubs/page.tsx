import type { Metadata } from "next";
import Image from "next/image";
import { ClubCard } from "@/components/ClubCard";
import { createClient } from "@/lib/supabase/server";
import type { Club } from "@/types/database";
import { getCloudinaryUrl } from "@/lib/cloudinary";

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
    <div className="bg-cream">
      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={getCloudinaryUrl("IMG_8408_cktueb", { width: 1920, height: 1080, crop: "fill", quality: "auto" })}
            alt="Children enjoying activities at The Clubhouse"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bark/70 via-bark/50 to-bark/80" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
              What&apos;s On
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-white/90 sm:text-xl">
              Discover our upcoming holiday clubs and give your children an
              unforgettable adventure at Craigies Farm.
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

      {/* Easter Club Details Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Intro */}
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-bark sm:text-4xl">
                Join us at The Clubhouse this Easter!
              </h2>
              <p className="mt-6 font-body text-lg text-stone leading-relaxed">
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
                  className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)] transition-shadow hover:shadow-[var(--shadow-lg)]"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{activity.emoji}</span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-bark">
                        {activity.title}
                      </h3>
                      <p className="mt-2 font-body text-sm text-stone leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* And so much more */}
            <p className="mt-8 text-center font-display text-xl font-semibold text-forest">
              🌾 And so much more!
            </p>
          </div>
        </div>
      </section>

      {/* Important Details Section */}
      <section className="bg-forest py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                👉 Important Details
              </h2>
              <div className="mt-6 space-y-4 font-body text-white/90 leading-relaxed">
                <p>
                  All staff are PVG checked and newly First Aid trained or retrained. We follow
                  good practice guidance with low staff-to-child ratios and thorough risk assessments.
                  Spaces are limited due to the low ratios, so be sure to book early!
                </p>
                <p className="font-semibold text-sunshine">
                  BOOKING PROCESS: To help us plan activities and accommodate children properly,
                  ALL attendee forms must be completed and returned within 3 days of booking.
                  If forms are not received in time, the place will be offered to another family.
                </p>
              </div>

              {/* Bonus for Parents */}
              <div className="mt-8 rounded-xl bg-white/10 p-6">
                <h3 className="font-display text-xl font-semibold text-sunshine">
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
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-bark sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-4 font-body text-lg text-stone">
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
            <div className="rounded-2xl bg-white p-8 text-center shadow-[var(--shadow-md)]">
              <p className="font-body text-lg text-stone">
                No upcoming events at the moment. Check back soon for new dates!
              </p>
              <p className="mt-4 font-body text-stone">
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
