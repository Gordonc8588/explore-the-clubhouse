import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";

export const metadata: Metadata = {
  title: "The Clubhouse | Easter Holiday Club 2026 - Now Booking",
  description:
    "Book now for Easter 2026! Join our outdoor holiday club for children aged 5-12 at Craigies Farm, South Queensferry. Spring lambs, egg hunts, forest adventures, and farm activities.",
  openGraph: {
    title: "The Clubhouse | Easter Holiday Club 2026 - Now Booking",
    description:
      "Easter adventure at Craigies Farm! Meet spring lambs, explore woodland trails, and enjoy Easter activities. Ages 5-12. Limited spaces available.",
  },
};

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
      {/* Easter Hero Section */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background Image - Kids on Tractor */}
        <div className="absolute inset-0">
          <Image
            src={getCloudinaryUrl("PHOTO-2025-07-29-18-26-06_ixlfl6", {
              width: 1920,
              height: 1080,
              crop: "fill",
              quality: "auto",
              gravity: "auto"
            })}
            alt="Children enjoying tractor ride at The Clubhouse"
            fill
            priority
            className="object-cover"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-bark/60 via-bark/40 to-bark/70" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 w-full">
          {/* Floating Easter Elements in Hero */}
          <div className="absolute top-8 left-8 text-5xl animate-float opacity-70 hidden sm:block">🐣</div>
          <div className="absolute top-16 right-12 text-4xl animate-float opacity-70 hidden sm:block" style={{ animationDelay: '0.7s' }}>🌼</div>
          <div className="absolute top-32 left-16 text-3xl animate-float opacity-60 hidden lg:block" style={{ animationDelay: '1.2s' }}>🐰</div>
          <div className="absolute top-40 right-24 text-4xl animate-float opacity-60 hidden lg:block" style={{ animationDelay: '1.8s' }}>🌷</div>

          {/* Easter Banner/Logo - Prominent at top */}
          <div className="mx-auto max-w-2xl mb-8 sm:mb-10 relative">
            <div className="relative aspect-[16/5] overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm shadow-[var(--shadow-xl)] p-4 sm:p-6">
              <Image
                src="https://res.cloudinary.com/dqicgqgmx/image/upload/v1769103900/Add-a-heading_olapvv.png"
                alt="The Clubhouse at Craigies"
                fill
                priority
                className="object-contain"
              />
            </div>
            {/* Decorative Easter elements around banner */}
            <div className="absolute -top-4 -left-4 text-3xl animate-bounce-subtle">🥚</div>
            <div className="absolute -top-4 -right-4 text-3xl animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>🌸</div>
          </div>

          {/* Hero Content */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sunshine/90 backdrop-blur-sm border-2 border-amber mb-6 animate-bounce-subtle shadow-[var(--shadow-lg)]">
              <span className="text-2xl">🐣</span>
              <p className="font-display text-sm font-bold uppercase tracking-wider text-bark">
                Easter 2026 Now Booking
              </p>
              <span className="text-2xl">🌸</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              An Easter Adventure
              <span className="block mt-2 text-sunshine drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                They'll Never Forget!
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl font-body text-lg sm:text-xl text-white/95 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              Join us this Easter for 4 days of farm-tastic fun! Meet spring lambs, hunt for eggs,
              explore woodland trails, and get creative with Easter crafts. Ages 5-12.
            </p>

            {/* Primary CTA */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/clubs"
                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-sunshine via-amber to-coral font-display text-lg font-bold text-white shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sunshine/50"
              >
                <span>Book Your Spot Now</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <Link
                href="#easter-details"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-meadow font-display text-lg font-semibold text-meadow hover:bg-meadow hover:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-meadow/50"
              >
                Learn More
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-white/90">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-sunshine" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">4.9/5 on Google</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">PVG Certified Staff</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold">Small Group Sizes</span>
              </div>
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

      {/* Not Your Average Holiday Club */}
      <section id="easter-details" className="relative py-16 sm:py-24 scroll-mt-20 overflow-hidden">
        {/* Floating Easter Elements */}
        <div className="absolute top-12 left-8 text-4xl animate-float opacity-40" style={{ animationDelay: '0.3s' }}>🌷</div>
        <div className="absolute top-20 right-12 text-3xl animate-float opacity-40" style={{ animationDelay: '1s' }}>🐰</div>
        <div className="absolute bottom-16 left-16 text-3xl animate-float opacity-30 hidden lg:block" style={{ animationDelay: '1.5s' }}>🌼</div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-3xl font-bold text-bark sm:text-5xl">
              Not Your Average Holiday Club
            </h2>
            <p className="mt-6 font-body text-xl text-stone leading-relaxed">
              When school&apos;s out...we&apos;re in! Our farm-based Activity Club at the beautiful Craigies Farm
              in South Queensferry is where kids can get off screens and enjoy the great things each season has to offer!
              From exploring the forests with our Ranger to learning to care for the animals, your children will love
              their countryside adventure!
            </p>

            {/* Easter CTA Card */}
            <div className="relative mt-12 rounded-3xl bg-gradient-to-br from-rose/10 via-sunshine/10 to-sky/10 border-2 border-sunshine/30 p-8 sm:p-10 shadow-[var(--shadow-xl)] overflow-hidden">
              {/* Decorative Easter elements */}
              <div className="absolute top-4 right-6 text-3xl animate-float opacity-40" style={{ animationDelay: '0.3s' }}>🐣</div>
              <div className="absolute bottom-6 left-8 text-3xl animate-float opacity-40" style={{ animationDelay: '1.1s' }}>🌼</div>
              <div className="absolute top-1/2 right-8 text-2xl animate-float opacity-30 hidden sm:block" style={{ animationDelay: '1.7s' }}>🥚</div>

              <div className="relative z-10">
                <div className="inline-block px-4 py-2 rounded-full bg-coral text-white font-display font-bold uppercase tracking-wide text-sm mb-4">
                  🌸 Next Up 🌸
                </div>
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-bark">
                  Our Spring Sessions
                </h3>
                <p className="mt-3 font-body text-xl text-meadow font-semibold">
                  Running this Easter Holiday!
                </p>
                <Link
                  href="/clubs"
                  className="mt-6 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-sunshine to-amber font-display text-lg font-bold text-white shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sunshine/50"
                >
                  <span>Book Easter Sessions</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome to The Clubhouse */}
      <section className="py-16 sm:py-20 bg-sage/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-bark sm:text-4xl">
              Welcome to The Clubhouse!
            </h2>
            <p className="mt-6 font-body text-xl text-stone leading-relaxed">
              Where children ages 5-12 join us for outdoor, hands-on learning sessions.
              Set on a working farm with forest, fields and friendly animals!
            </p>
          </div>
        </div>
      </section>

      {/* On The Farm Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        {/* Floating Easter Elements */}
        <div className="absolute top-20 right-8 text-5xl animate-float opacity-30" style={{ animationDelay: '0.5s' }}>🐣</div>
        <div className="absolute bottom-24 left-8 text-4xl animate-float opacity-30 hidden sm:block" style={{ animationDelay: '1.3s' }}>🥚</div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[var(--shadow-xl)] order-2 lg:order-1">
              <Image
                src={getCloudinaryUrl("IMG_3328-scaled_tkpsb8", {
                  width: 800,
                  height: 600,
                  crop: "fill",
                  quality: "auto",
                })}
                alt="Children working in the farm allotment"
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-block px-3 py-1 rounded-full bg-meadow/20 text-meadow font-display font-bold uppercase tracking-wide text-xs mb-4">
                Farm Learning
              </div>
              <h2 className="font-display text-3xl font-bold text-bark sm:text-4xl lg:text-5xl">
                On The Farm!
              </h2>
              <p className="mt-6 font-body text-lg text-stone leading-relaxed">
                There really is no better setting for a classroom — from our farm-to-fork cooking classes to our
                STEM lessons exploring new farming technology and innovations. At The Clubhouse, children learn the
                science of growing, animal care, woodworking, and other traditional skills, all through hands-on experience.
              </p>
              <p className="mt-4 font-body text-lg text-stone leading-relaxed">
                During Spring, we&apos;re busy caring for baby chicks and lambs — including the unforgettable experience
                of bottle-feeding them! We get our allotments up and running, build fantastic enrichment toys in our
                woodworking sessions, plant pumpkins, and make the most of wonderfully warm and sunny days spent outdoors.
              </p>
              <p className="mt-4 font-body text-lg text-stone leading-relaxed">
                Soon, the kids will be back in the soil — learning how to germinate seeds, raise and care for seedlings,
                mulch and weed beds, support climbing plants, and understand what helps crops thrive. They&apos;ll head out
                on rounds with the farmers, test soil pH, learn what grows best in different areas of the farm, visit the
                beehives, and see how farming works on both small and large scales.
              </p>
              <Link
                href="/clubs"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sunshine text-bark font-display font-semibold hover:bg-amber transition-colors"
              >
                Join the Adventure
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Explore the Forest Section */}
      <section className="relative py-16 sm:py-24 bg-forest/5 overflow-hidden">
        {/* Floating Easter Elements */}
        <div className="absolute top-16 left-12 text-4xl animate-float opacity-35" style={{ animationDelay: '0.8s' }}>🌸</div>
        <div className="absolute top-32 right-16 text-3xl animate-float opacity-35 hidden sm:block" style={{ animationDelay: '1.6s' }}>🐇</div>
        <div className="absolute bottom-20 right-8 text-4xl animate-float opacity-30" style={{ animationDelay: '0.4s' }}>🌼</div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Content */}
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-sage/30 text-forest font-display font-bold uppercase tracking-wide text-xs mb-4">
                Forest Adventures
              </div>
              <h2 className="font-display text-3xl font-bold text-bark sm:text-4xl lg:text-5xl">
                Explore the Forest!
              </h2>
              <p className="mt-6 font-body text-lg text-stone leading-relaxed">
                At The Clubhouse, the forest is our classroom! Kids will learn through hands-on adventures in the
                mile-long woodlands adjacent to the farm. With our in-house forest ranger, the kids walk the beautiful
                paths cut through the woods and learn all sorts of useful information about the forest, animals and
                mini-beasts that live there.
              </p>
              <p className="mt-4 font-body text-lg text-stone leading-relaxed">
                From den building and bug hunts to learning about local wildlife, our forest sessions will give them
                a greater understanding of Scottish woodlands.
              </p>
              <Link
                href="/clubs"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-meadow text-white font-display font-semibold hover:bg-forest transition-colors"
              >
                Start Exploring
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[var(--shadow-xl)]">
              <Image
                src={getCloudinaryUrl("6e5ba4bf-9c64-4b31-bca4-3e1523a17737_zqglgr", {
                  width: 800,
                  height: 600,
                  crop: "fill",
                  quality: "auto",
                })}
                alt="Children exploring the forest"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Caring for Farm Animals Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        {/* Floating Easter Elements */}
        <div className="absolute top-24 left-16 text-5xl animate-float opacity-30" style={{ animationDelay: '0.6s' }}>🐥</div>
        <div className="absolute top-36 right-8 text-4xl animate-float opacity-30 hidden sm:block" style={{ animationDelay: '1.4s' }}>🌷</div>
        <div className="absolute bottom-28 right-20 text-3xl animate-float opacity-25 hidden lg:block" style={{ animationDelay: '0.9s' }}>🥕</div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[var(--shadow-xl)] order-2 lg:order-1">
              <Image
                src={getCloudinaryUrl("6114853b-707b-4c3e-be86-8d20e8c2dba2-scaled_of1aga", {
                  width: 800,
                  height: 600,
                  crop: "fill",
                  quality: "auto",
                })}
                alt="Children caring for farm animals"
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-block px-3 py-1 rounded-full bg-coral/20 text-coral font-display font-bold uppercase tracking-wide text-xs mb-4">
                Animal Care
              </div>
              <h2 className="font-display text-3xl font-bold text-bark sm:text-4xl lg:text-5xl">
                Caring for the Farm Animals
              </h2>
              <p className="mt-6 font-body text-lg text-stone leading-relaxed">
                At The Clubhouse, kids don&apos;t just visit the farm—they become part of it! From helping with
                bottle-feeding new lambs to helping raise chicks this past spring, children get hands-on experience
                caring for animals while learning how a farm works and the basics of animal care.
              </p>
              <p className="mt-4 font-body text-lg text-stone leading-relaxed">
                They&apos;ve helped to chop and prep treats, feed the goats, brush the ponies, and build animal enrichment
                activities for the farm. With all sorts of treasures found around the farm—like suet from the butcher for
                bird feeders or old fruit baskets turned into animal toys—the farm becomes a brilliant little world for
                learning how to reuse and get creative.
              </p>
              <p className="mt-4 font-body text-lg text-stone leading-relaxed">
                Whether it&apos;s cuddling a fluffy chick or watching lambs take their first steps, every moment is a fun
                and unforgettable lesson in animal care.
              </p>
              <Link
                href="/clubs"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sunshine text-bark font-display font-semibold hover:bg-amber transition-colors"
              >
                Meet the Animals
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
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

          <div className="mx-auto mt-12 max-w-3xl">
            <TestimonialCarousel testimonials={testimonials} autoPlayInterval={6000} />
          </div>
        </div>
      </section>

      {/* Final Easter CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-rose/10 via-sunshine/10 to-sky/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-meadow via-forest to-meadow p-8 text-center sm:p-16 shadow-[var(--shadow-xl)]">
            {/* Decorative Easter Elements */}
            <div className="absolute top-4 left-4 text-4xl animate-float opacity-80">🐰</div>
            <div className="absolute top-8 right-8 text-4xl animate-float opacity-80" style={{ animationDelay: '0.5s' }}>🌷</div>
            <div className="absolute bottom-4 left-8 text-4xl animate-float opacity-80" style={{ animationDelay: '1s' }}>🥚</div>
            <div className="absolute bottom-8 right-4 text-4xl animate-float opacity-80" style={{ animationDelay: '1.5s' }}>🐣</div>

            <div className="relative z-10">
              <div className="inline-block px-4 py-2 rounded-full bg-sunshine text-bark font-display font-bold uppercase tracking-wide text-sm mb-4">
                🌸 Limited Spaces Available 🌸
              </div>
              <h2 className="font-display text-3xl font-bold text-white sm:text-5xl leading-tight">
                Ready for an Easter They&apos;ll
                <span className="block mt-2">Never Forget?</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl font-body text-xl text-sage">
                Don&apos;t miss out on this spring&apos;s farm adventure! Spots are filling fast for our Easter sessions.
                Book now to secure your child&apos;s place.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/clubs"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sunshine to-amber px-10 py-5 font-display text-xl font-bold text-white shadow-[var(--shadow-xl)] hover:shadow-[0_20px_50px_rgba(245,166,35,0.4)] transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sunshine/50"
                >
                  <span>Book Easter Now</span>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white px-10 py-5 font-display text-xl font-semibold text-white transition-all duration-300 hover:bg-white hover:text-forest focus:outline-none focus:ring-4 focus:ring-white/50"
                >
                  Learn More About Us
                </Link>
              </div>

              {/* Additional Trust Signal */}
              <p className="mt-8 text-sage font-body text-sm">
                ✓ Fully Insured • ✓ First Aid Trained • ✓ Flexible Booking Options
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
