"use client";

import { useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlayInterval?: number;
}

export function TestimonialCarousel({
  testimonials,
  autoPlayInterval = 6000,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [currentIndex, autoPlayInterval]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="relative">
      {/* Main testimonial display */}
      <div className="relative overflow-hidden rounded-2xl bg-white/10 p-8 backdrop-blur-sm min-h-[320px] sm:min-h-[280px]">
        <Quote className="absolute right-6 top-6 h-12 w-12 text-sage/30" />

        {/* Testimonial content with fade animation */}
        <div
          key={currentIndex}
          className="animate-fade-in"
        >
          {/* 5 Star Rating */}
          <div className="mb-4 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-sunshine text-sunshine" />
            ))}
          </div>

          <p className="font-body text-lg text-white leading-relaxed sm:text-xl">
            &ldquo;{testimonials[currentIndex].quote}&rdquo;
          </p>
          <div className="mt-6">
            <p className="font-display text-lg font-semibold text-sunshine">
              {testimonials[currentIndex].author}
            </p>
            {testimonials[currentIndex].role && (
              <p className="font-body text-sm text-sage">
                {testimonials[currentIndex].role}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none px-2">
        <button
          onClick={handlePrev}
          className="pointer-events-auto rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          className="pointer-events-auto rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
              index === currentIndex
                ? "w-8 bg-sunshine"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
