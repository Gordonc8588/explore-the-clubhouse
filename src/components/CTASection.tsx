import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 px-4 md:px-8" style={{ backgroundColor: 'var(--craigies-cream)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Date Card */}
          <div className="p-6 rounded-lg bg-white shadow-md">
            <Calendar size={32} className="mb-3" style={{ color: 'var(--craigies-burnt-orange)' }} />
            <h3
              className="text-xl mb-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: 'var(--craigies-dark-olive)'
              }}
            >
              Date
            </h3>
            <p style={{ color: 'var(--craigies-dark-olive)' }}>13-17 April 2026</p>
          </div>

          {/* Time Card */}
          <div className="p-6 rounded-lg bg-white shadow-md">
            <Clock size={32} className="mb-3" style={{ color: 'var(--craigies-burnt-orange)' }} />
            <h3
              className="text-xl mb-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: 'var(--craigies-dark-olive)'
              }}
            >
              Time
            </h3>
            <p style={{ color: 'var(--craigies-dark-olive)' }}>9:30am - 3:00pm</p>
          </div>

          {/* Ages Card */}
          <div className="p-6 rounded-lg bg-white shadow-md">
            <MapPin size={32} className="mb-3" style={{ color: 'var(--craigies-burnt-orange)' }} />
            <h3
              className="text-xl mb-2"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: 'var(--craigies-dark-olive)'
              }}
            >
              Ages
            </h3>
            <p style={{ color: 'var(--craigies-dark-olive)' }}>5-12 years</p>
          </div>
        </div>

        {/* CTA Content */}
        <div className="text-center">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: 'var(--craigies-dark-olive)'
            }}
          >
            Ready to Book?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--craigies-dark-olive)' }}>
            Spaces are limited! Secure your child's spot for an unforgettable Easter adventure on the farm.
          </p>

          {/* CTA Button */}
          <Link
            href="/clubs#upcoming-events"
            className="inline-block px-10 py-4 rounded-lg text-white font-semibold text-lg hover:opacity-90 transition-opacity mb-6"
            style={{ backgroundColor: 'var(--craigies-burnt-orange)' }}
          >
            Book Your Spot Now
          </Link>

          {/* Contact Link */}
          <p className="text-sm" style={{ color: 'var(--craigies-dark-olive)' }}>
            Questions? <Link href="/contact" className="underline hover:no-underline">Contact us</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
