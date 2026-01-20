import Link from "next/link";
import { Trees, Heart, BookOpen, ShieldCheck, Quote } from "lucide-react";

const features = [
  {
    icon: Trees,
    title: "Outdoor Adventures",
    description:
      "Explore nature through forest walks, pond dipping, den building, and seasonal outdoor activities that spark curiosity and wonder.",
  },
  {
    icon: Heart,
    title: "Farm Animal Care",
    description:
      "Meet our friendly animals! Children learn responsibility and compassion through hands-on animal care and feeding experiences.",
  },
  {
    icon: BookOpen,
    title: "Learning Through Play",
    description:
      "Educational activities woven into every day, from nature crafts to gardening, making learning fun and memorable.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Environment",
    description:
      "Fully qualified staff, comprehensive safeguarding policies, and a secure countryside setting give parents peace of mind.",
  },
];

const testimonials = [
  {
    quote:
      "My children absolutely love coming here! They come home tired, happy, and full of stories about the animals and adventures.",
    author: "Sarah M.",
    role: "Parent of two",
  },
  {
    quote:
      "The staff are wonderful and so caring. It's given me total peace of mind during the school holidays knowing my kids are having the time of their lives.",
    author: "James T.",
    role: "Parent",
  },
  {
    quote:
      "We've tried other holiday clubs but nothing compares. The outdoor focus and farm activities make it truly special.",
    author: "Emma L.",
    role: "Parent of three",
  },
];

export default function HomePage() {
  return (
    <div className="bg-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sage/30 to-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-bark sm:text-5xl lg:text-6xl">
              Where Adventure
              <span className="block text-forest">Meets Nature</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-stone sm:text-xl">
              A children&apos;s holiday club offering outdoor, farm-based
              activities during school holidays. Give your children an
              unforgettable experience in the countryside.
            </p>

            {/* Upcoming Club Placeholder */}
            <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-6 shadow-[var(--shadow-lg)]">
              <p className="font-display text-sm font-semibold uppercase tracking-wide text-meadow">
                Next Upcoming Club
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-bark">
                February Half Term
              </h2>
              <p className="mt-1 font-body text-stone">17th - 21st February 2025</p>
              <p className="mt-3 font-body text-sm text-pebble">
                Limited spaces available
              </p>
              <Link
                href="/book"
                className="mt-6 inline-block w-full rounded-lg bg-sunshine px-6 py-3 font-display text-lg font-semibold text-bark transition-colors hover:bg-amber focus:outline-none focus:ring-2 focus:ring-sunshine focus:ring-offset-2"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
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

      {/* Value Proposition Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-bark sm:text-4xl">
              Why Families Choose Us
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-stone">
              We create memorable experiences that combine outdoor fun, animal
              care, and hands-on learning in a safe, nurturing environment.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)] transition-shadow hover:shadow-[var(--shadow-lg)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/30">
                  <feature.icon className="h-6 w-6 text-forest" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-bark">
                  {feature.title}
                </h3>
                <p className="mt-2 font-body text-stone">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-forest py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              What Parents Say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-sage">
              Don&apos;t just take our word for it. Here&apos;s what families
              have to say about their experience with us.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative rounded-2xl bg-white/10 p-6 backdrop-blur-sm"
              >
                <Quote className="absolute right-4 top-4 h-8 w-8 text-sage/50" />
                <p className="font-body text-white">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-6">
                  <p className="font-display font-semibold text-sunshine">
                    {testimonial.author}
                  </p>
                  <p className="font-body text-sm text-sage">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-meadow to-forest p-8 text-center sm:p-12">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Ready to Give Your Child an Adventure?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-lg text-sage">
              Join us for a holiday experience your children will never forget.
              Limited spaces available for upcoming clubs.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/book"
                className="inline-block rounded-lg bg-sunshine px-8 py-3 font-display text-lg font-semibold text-bark transition-colors hover:bg-amber focus:outline-none focus:ring-2 focus:ring-sunshine focus:ring-offset-2 focus:ring-offset-forest"
              >
                Book Now
              </Link>
              <Link
                href="/about"
                className="inline-block rounded-lg border-2 border-white px-8 py-3 font-display text-lg font-semibold text-white transition-colors hover:bg-white hover:text-forest focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-forest"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
