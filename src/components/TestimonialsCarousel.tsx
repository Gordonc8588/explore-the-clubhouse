'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-12 md:py-16 lg:py-20 px-4 md:px-8" style={{ backgroundColor: 'var(--craigies-olive)' }}>
      <div className="max-w-4xl mx-auto">
        <h2
          className="text-3xl md:text-4xl lg:text-5xl text-center mb-12"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: 'white'
          }}
        >
          What Parents Say
        </h2>

        <div className="relative">
          {/* Testimonial Card */}
          <div
            className="p-8 md:p-12 rounded-lg shadow-lg"
            style={{ backgroundColor: 'var(--craigies-cream)' }}
          >
            {/* Star Rating */}
            <div className="flex gap-1 mb-4 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  fill="var(--craigies-burnt-orange)"
                  stroke="var(--craigies-burnt-orange)"
                />
              ))}
            </div>

            {/* Quote */}
            <p
              className="text-base md:text-lg leading-relaxed mb-6 text-center"
              style={{ color: 'var(--craigies-dark-olive)' }}
            >
              "{currentTestimonial.quote}"
            </p>

            {/* Author */}
            <div className="text-center">
              <p
                className="font-semibold text-lg"
                style={{ color: 'var(--craigies-dark-olive)' }}
              >
                {currentTestimonial.author}
              </p>
              <p
                className="text-sm"
                style={{ color: 'var(--craigies-olive)' }}
              >
                {currentTestimonial.role}
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={goToPrevious}
              className="p-3 rounded-full bg-white hover:opacity-80 transition-opacity"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} style={{ color: 'var(--craigies-olive)' }} />
            </button>
            <button
              onClick={goToNext}
              className="p-3 rounded-full bg-white hover:opacity-80 transition-opacity"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} style={{ color: 'var(--craigies-olive)' }} />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="text-center mt-4 text-white text-sm">
            {currentIndex + 1} / {testimonials.length}
          </div>
        </div>
      </div>
    </section>
  );
}
