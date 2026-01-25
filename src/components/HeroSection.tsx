import Link from "next/link";
import { Calendar } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 px-4 md:px-8 bg-[var(--craigies-cream)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Headline */}
          <div className="text-center lg:text-left">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: 'var(--craigies-dark-olive)'
              }}
            >
              Join us on the farm this Easter!
            </h1>

            {/* CTA Button */}
            <Link
              href="/clubs#upcoming-events"
              className="inline-block px-8 py-4 rounded-lg text-white font-semibold text-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--craigies-burnt-orange)' }}
            >
              Book Now
            </Link>

            {/* Microcopy */}
            <p className="mt-6 text-sm leading-relaxed" style={{ color: 'var(--craigies-dark-olive)' }}>
              <strong className="block mb-1 text-base" style={{ color: 'var(--craigies-olive)' }}>LIMITED PLACES AVAILABLE!</strong>
              Our Easter sessions fill up fast. Book early to secure your child&apos;s spot!
            </p>
          </div>

          {/* Right Column - Date Card */}
          <div className="flex justify-center lg:justify-end">
            <div
              className="p-8 rounded-lg shadow-lg max-w-sm w-full"
              style={{ backgroundColor: 'white' }}
            >
              <div className="flex items-start gap-4 mb-4">
                <Calendar
                  className="flex-shrink-0 mt-1"
                  size={28}
                  style={{ color: 'var(--craigies-burnt-orange)' }}
                />
                <div>
                  <h2
                    className="text-2xl md:text-3xl mb-2"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700,
                      color: 'var(--craigies-dark-olive)'
                    }}
                  >
                    Easter 2026
                  </h2>
                  <p className="text-lg" style={{ color: 'var(--craigies-dark-olive)' }}>
                    13-17 April
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm" style={{ color: 'var(--craigies-dark-olive)' }}>
                <p><strong>Time:</strong> 8:30am - 3:00pm</p>
                <p><strong>Ages:</strong> 5-12 years</p>
                <p><strong>Location:</strong> Craigies Farm, South Queensferry</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
