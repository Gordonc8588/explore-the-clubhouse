import Link from "next/link";
import Image from "next/image";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";

const activities = [
  {
    title: "Farm & Allotment Work",
    description:
      "Children get hands-on with seasonal growing experiences - from planting pumpkins in autumn to picking summer berries and making jam. They join farmers on their rounds, tend organic vegetables, and learn where their food really comes from.",
    image: "IMG_3328-scaled_tkpsb8",
    imageAlt: "Children working in the farm allotment",
  },
  {
    title: "Forest Exploration",
    description:
      "Our mile-long woodlands are a natural playground for discovery. With our in-house forest ranger, children build dens, go on bug hunts, identify wildlife tracks, and develop a love for the great outdoors.",
    image: "6e5ba4bf-9c64-4b31-bca4-3e1523a17737_zqglgr",
    imageAlt: "Children exploring the forest",
  },
  {
    title: "Animal Care",
    description:
      "From bottle-feeding lambs to raising chicks, caring for goats and grooming ponies - children learn responsibility and compassion through hands-on animal husbandry. They even help build enrichment structures for our farmyard friends.",
    image: "6114853b-707b-4c3e-be86-8d20e8c2dba2-scaled_of1aga",
    imageAlt: "Children caring for farm animals",
  },
  {
    title: "Creative Workshops",
    description:
      "Our workshops teach practical skills through fun projects. Children learn to hammer and build, screw and saw - creating birdhouses, boats, and seasonal crafts. Age-appropriate challenges ensure everyone succeeds.",
    image: "d12ad9e7-690c-4cb0-8761-efb841ffbade_jgrvaf",
    imageAlt: "Children in creative workshop",
  },
];

// Testimonials from Google Reviews
const testimonials = [
  {
    quote:
      "By far the best summer camp for primary school aged kids. My son came home everyday telling me all the new and exciting things he had learned. Very well organised, and parents get photos and written updates as well. Nicole is super lovely and helpful. Top marks for Clubhouse program!",
    author: "Catherine Shen",
    role: "Google Review",
  },
  {
    quote:
      "The kids really loved their time at the Clubhouse Easter holiday! Fantastic activities - fun, educational and wonderful to see them enjoying being closer to nature. The staff were very enthusiastic and engaged well with the kids. We'll definitely be signing up again!",
    author: "Joanna Mackenzie",
    role: "Google Review",
  },
  {
    quote:
      "Our two children (7 and 9) had a fantastic time at the Clubhouse at Craigies this Easter. Over the course of the week they fed lambs, looked after baby chickens, got involved in all sorts of arts and crafts. They could not wait to go back each morning!",
    author: "Tom Malone",
    role: "Google Review",
  },
  {
    quote:
      "Signed my daughter up for a week of mornings at the clubhouse. She thoroughly enjoyed it and would have stayed full day. Nicole and the other adults were lovely. Her reply: 'The best thing was being with the animals and holding the chicks. I definitely want to go there again.'",
    author: "Lee Malcolm",
    role: "Google Review",
  },
  {
    quote:
      "My 10 year old and 6 year old daughters absolutely loved the summer club. They enjoyed every single day there. Thank you to the whole team for their effort, friendliness and super activities!",
    author: "Anna Ishkova",
    role: "Google Review",
  },
  {
    quote:
      "My kids really enjoyed the Clubhouse and have asked to go back on the next school holidays. I really appreciate the update on what they've done as well as them being fed lunch & snacks. Highly recommend.",
    author: "M K",
    role: "Google Review",
  },
  {
    quote:
      "My son attended a few days of summer camp and loved it. He got to take part in a good variety of brilliant farm experiences. Will definitely book another one!",
    author: "Lauren Scott",
    role: "Google Review",
  },
  {
    quote:
      "I signed my daughter up for a full day at the Clubhouse at Craigies and she enjoyed it sooo much! Nicole and her team are lovely. I can't wait to hear what the next program involves.",
    author: "Roxana Ghita",
    role: "Google Review",
  },
  {
    quote:
      "My daughter had two fantastic days jam packed full of experiences that you don't get anywhere else. It was well organised and well communicated. I would definitely book future holiday clubs.",
    author: "Nicky Bleakley",
    role: "Google Review",
  },
];

export default function HomePage() {
  return (
    <div className="bg-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={getCloudinaryUrl("PHOTO-2025-07-29-18-26-06_ixlfl6", { width: 1920, height: 1080, crop: "fill", quality: "auto" })}
            alt="Children enjoying outdoor activities at The Clubhouse"
            fill
            priority
            className="object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-bark/70 via-bark/50 to-bark/80" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
              Join us at Craigies Farm
              <span className="block text-sage">this Easter</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-white/90 sm:text-xl">
              Experience an unforgettable Easter adventure at Craigies Farm, South Queensferry.
              From meeting adorable spring lambs to egg hunts, nature trails, and hands-on farm
              activities, your children will love exploring the countryside this school holiday.
            </p>

            {/* Upcoming Club Placeholder */}
            <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-[var(--shadow-lg)]">
              <p className="font-display text-sm font-semibold uppercase tracking-wide text-meadow">
                Now Booking
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-bark">
                Easter Holiday Club
              </h2>
              <p className="mt-1 font-body text-stone">7th - 18th April 2025</p>
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

        {/* Decorative wave transition */}
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

      {/* Welcome Introduction */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-bark sm:text-4xl">
              Welcome to The Clubhouse!
            </h2>
            <p className="mt-6 font-body text-lg text-stone leading-relaxed">
              We invite children aged 5-12 to join us for outdoor, hands-on learning sessions
              during school holidays at Craigies Farm, South Queensferry. Set on a working farm
              with forests, fields, and friendly animals, The Clubhouse offers an unforgettable
              countryside adventure where children connect with nature and learn new skills every day.
            </p>
          </div>
        </div>
      </section>

      {/* Activities Sections */}
      {activities.map((activity, index) => (
        <section
          key={activity.title}
          className={`py-12 sm:py-16 ${index % 2 === 1 ? "bg-sage/10" : ""}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-12 ${
                index % 2 === 1 ? "lg:grid-flow-dense" : ""
              }`}
            >
              {/* Image */}
              <div
                className={`relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-lg)] ${
                  index % 2 === 1 ? "lg:col-start-2" : ""
                }`}
              >
                <Image
                  src={getCloudinaryUrl(activity.image, {
                    width: 800,
                    height: 600,
                    crop: "fill",
                    quality: "auto",
                  })}
                  alt={activity.imageAlt}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className={index % 2 === 1 ? "lg:col-start-1" : ""}>
                <h2 className="font-display text-2xl font-bold text-bark sm:text-3xl">
                  {activity.title}
                </h2>
                <p className="mt-4 font-body text-lg text-stone leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </div>
          </div>
        </section>
      ))}

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

          <div className="mx-auto mt-12 max-w-3xl">
            <TestimonialCarousel testimonials={testimonials} autoPlayInterval={6000} />
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
