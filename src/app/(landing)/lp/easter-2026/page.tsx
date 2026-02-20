import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LandingPageTracker } from '@/components/landing/LandingPageTracker';
import { LandingCTAButton } from '@/components/landing/LandingCTAButton';

const BOOK_URL = '/book/easter-2026';

export const metadata: Metadata = {
  title: 'Easter Holiday Club 2026 | The Clubhouse at Craigies Farm',
  description:
    'Book your child\'s Easter adventure at Craigies Farm, South Queensferry. Farm animals, forest exploration & creative learning for ages 5-12. Limited spaces - book now!',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Easter Holiday Club 2026 | The Clubhouse',
    description:
      'Farm animals, forest adventures & creative learning at Craigies Farm. Ages 5-12, Easter holidays. Limited spaces available!',
    type: 'website',
    locale: 'en_GB',
    siteName: 'The Clubhouse',
    images: [
      {
        url: 'https://res.cloudinary.com/dqicgqgmx/image/upload/w_1200,h_630,c_fill/v1768924052/IMG_3328-scaled_tkpsb8.jpg',
        width: 1200,
        height: 630,
        alt: 'Children enjoying outdoor activities at The Clubhouse',
      },
    ],
  },
};

const activities = [
  {
    title: 'Animal Care',
    description:
      'Feed lambs, hold chicks, collect eggs and learn about animal care on a working farm.',
    image:
      'https://res.cloudinary.com/dqicgqgmx/image/upload/w_600,c_limit/v1771618410/PHOTO-2026-02-20-20-11-45_nwgwh5.jpg',
    alt: 'Children caring for farm animals',
  },
  {
    title: 'Forest Adventures',
    description:
      'Explore woodland trails, build dens, discover wildlife and enjoy the great outdoors.',
    image:
      'https://res.cloudinary.com/dqicgqgmx/image/upload/w_600,c_limit/v1771618410/PHOTO-2026-02-20-20-12-46_vonx6d.jpg',
    alt: 'Children exploring the forest',
  },
  {
    title: 'Workshops',
    description:
      'Nature crafts, outdoor cooking, science experiments and hands-on seasonal projects.',
    image:
      'https://res.cloudinary.com/dqicgqgmx/image/upload/w_600,c_limit/v1771618410/PHOTO-2026-02-20-20-11-14_mj2ndq.jpg',
    alt: 'Children in a workshop activity',
  },
];

const photos = [
  {
    src: 'https://res.cloudinary.com/dqicgqgmx/image/upload/w_400,h_300,c_fill/v1768924052/d12ad9e7-690c-4cb0-8761-efb841ffbade_jgrvaf.jpg',
    alt: 'Children enjoying The Clubhouse',
  },
  {
    src: 'https://res.cloudinary.com/dqicgqgmx/image/upload/w_400,h_300,c_fill/v1768924052/IMG_8406_ejjgwy.jpg',
    alt: 'Farm animal activities',
  },
  {
    src: 'https://res.cloudinary.com/dqicgqgmx/image/upload/w_400,h_300,c_fill/v1768924052/043917ba-162f-4160-8072-97e389e93b92-2_aswr8s.jpg',
    alt: 'Forest exploration',
  },
  {
    src: 'https://res.cloudinary.com/dqicgqgmx/image/upload/w_400,h_300,c_fill/v1768924052/IMG_1176-scaled_pemded.jpg',
    alt: 'Creative activities',
  },
  {
    src: 'https://res.cloudinary.com/dqicgqgmx/image/upload/w_400,h_300,c_fill/v1768924052/IMG_3328-scaled_tkpsb8.jpg',
    alt: 'Group activities at The Clubhouse',
  },
  {
    src: 'https://res.cloudinary.com/dqicgqgmx/image/upload/w_400,h_300,c_fill/v1768924052/6e5ba4bf-9c64-4b31-bca4-3e1523a17737_zqglgr.jpg',
    alt: 'Outdoor learning',
  },
];

const testimonials = [
  {
    quote:
      'By far the best summer camp for primary school aged kids. My son came home everyday telling me all the new and exciting things he had learned. Very well organised, and parents get photos and written updates as well.',
    author: 'Catherine Shen',
  },
  {
    quote:
      'The kids really loved their time at the Clubhouse Easter holiday! Fantastic activities - fun, educational and wonderful to see them enjoying being closer to nature.',
    author: 'Joanna Mackenzie',
  },
  {
    quote:
      'Over the course of the week they fed lambs, looked after baby chickens, got involved in all sorts of arts and crafts. They could not wait to go back each morning!',
    author: 'Tom Malone',
  },
];

export default function EasterLandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--craigies-cream)' }}>
      {/* Minimal Header */}
      <header style={{ backgroundColor: 'var(--craigies-olive)' }} className="py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="font-display text-xl font-bold text-white">
            The Clubhouse
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24" style={{ backgroundColor: 'var(--craigies-olive)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                Easter Holiday Club 2026
              </h1>
              <p className="mt-6 text-lg text-white/90 sm:text-xl">
                Farm animals, forest adventures &amp; creative learning at Craigies Farm, South Queensferry.
                Ages 5&ndash;12, Easter holidays.
              </p>
              <div className="mt-8">
                <LandingCTAButton href={BOOK_URL} position="hero">
                  Book Your Child&apos;s Place
                </LandingCTAButton>
              </div>
              <p className="mt-4 text-sm font-semibold text-white/80">
                Limited spaces available &mdash; don&apos;t miss out!
              </p>
            </div>
            <div className="relative hidden lg:block">
              <Image
                src="https://res.cloudinary.com/dqicgqgmx/image/upload/w_800,h_600,c_fill/v1768924052/d12ad9e7-690c-4cb0-8761-efb841ffbade_jgrvaf.jpg"
                alt="Children enjoying outdoor activities at The Clubhouse"
                width={800}
                height={600}
                className="rounded-2xl shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-center text-3xl font-bold sm:text-4xl" style={{ color: 'var(--craigies-dark-olive)' }}>
            What&apos;s Included
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <div
                key={activity.title}
                className="overflow-hidden rounded-xl bg-white shadow-md"
              >
                <Image
                  src={activity.image}
                  alt={activity.alt}
                  width={600}
                  height={400}
                  className="w-full"
                />
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold" style={{ color: 'var(--craigies-dark-olive)' }}>
                    {activity.title}
                  </h3>
                  <p className="mt-2 font-body text-gray-600">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="py-12" style={{ backgroundColor: 'var(--craigies-olive)', opacity: 0.95 }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {photos.map((photo, i) => (
              <Image
                key={i}
                src={photo.src}
                alt={photo.alt}
                width={400}
                height={300}
                className="rounded-lg object-cover aspect-[4/3] w-full"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Key Details + Mid CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl" style={{ color: 'var(--craigies-dark-olive)' }}>
            Key Details
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 text-left">
            {[
              { label: 'Dates', value: '13-17 April 2026' },
              { label: 'Times', value: 'Drop-off 8:30-9:30am, Pick-up 3:00pm' },
              { label: 'Ages', value: '5 to 12 years' },
              { label: 'Location', value: 'Craigies Farm, South Queensferry' },
              { label: 'Includes', value: 'All activities & outdoor adventures' },
            ].map((detail) => (
              <div key={detail.label} className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--craigies-burnt-orange)' }}>
                  {detail.label}
                </p>
                <p className="mt-1 font-body text-lg" style={{ color: 'var(--craigies-dark-olive)' }}>
                  {detail.value}
                </p>
              </div>
            ))}
          </div>
          {/* Urgency Banner */}
          <div className="mt-10 rounded-xl bg-white p-6 shadow-md">
            <p className="font-display text-lg font-bold" style={{ color: 'var(--craigies-dark-olive)' }}>
              Spaces are filling up fast!
            </p>
            <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: '75%', backgroundColor: 'var(--craigies-burnt-orange)' }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-gray-600">
              75% of places already booked
            </p>
            <div className="mt-4">
              <LandingCTAButton href={BOOK_URL} position="mid">
                Buy Now &mdash; Limited Spaces Available
              </LandingCTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-center text-3xl font-bold sm:text-4xl" style={{ color: 'var(--craigies-dark-olive)' }}>
            What Parents Say
          </h2>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.author} className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: 'var(--craigies-cream)' }}>
                <p className="font-body text-gray-700 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-4 font-display font-semibold" style={{ color: 'var(--craigies-dark-olive)' }}>
                  &mdash; {t.author}
                  <span className="block text-sm font-normal text-gray-500">Google Review</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: 'var(--craigies-olive)' }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to Book?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Spaces are limited and fill up fast. Secure your child&apos;s place at our Easter holiday club today.
          </p>
          <div className="mt-8">
            <LandingCTAButton href={BOOK_URL} position="bottom">
              Book Now
            </LandingCTAButton>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8" style={{ backgroundColor: 'var(--craigies-dark-olive)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <span className="font-display text-lg font-bold text-white">
              The Clubhouse
            </span>
            <div className="flex items-center gap-6 text-sm text-white/70">
              <a href="mailto:hello@exploretheclubhouse.co.uk" className="hover:text-white transition-colors">
                hello@exploretheclubhouse.co.uk
              </a>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Tracking */}
      <LandingPageTracker
        contentName="Easter Holiday Club 2026"
        contentCategory="holiday_club"
        contentId="easter-2026"
        value={35}
      />
    </div>
  );
}
