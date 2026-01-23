'use client';
import { useState } from 'react';
import { ImageWithFallback } from './ImageWithFallback';

interface ContentSectionProps {
  title: string;
  content: string | string[];
  imageUrl: string;
  imageAlt: string;
  imagePosition: 'left' | 'right';
  shouldTruncate?: boolean;
  previewLength?: number;
  backgroundColor: 'olive' | 'cream';
}

export default function ContentSection({
  title,
  content,
  imageUrl,
  imageAlt,
  imagePosition,
  shouldTruncate = false,
  previewLength = 300,
  backgroundColor,
}: ContentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const contentArray = Array.isArray(content) ? content : [content];
  const fullText = contentArray.join(' ');

  const displayText = shouldTruncate && !isExpanded
    ? fullText.slice(0, previewLength) + '...'
    : fullText;

  const bgColor = backgroundColor === 'olive'
    ? 'var(--craigies-olive)'
    : 'var(--craigies-cream)';

  const textColor = backgroundColor === 'olive' ? 'white' : 'var(--craigies-dark-olive)';

  return (
    <section className="py-12 md:py-16 lg:py-20 px-4 md:px-8" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto">
        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${imagePosition === 'right' ? 'lg:grid-flow-dense' : ''}`}>
          {/* Image */}
          <div className={imagePosition === 'right' ? 'lg:col-start-2' : ''}>
            <ImageWithFallback
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-lg"
            />
          </div>

          {/* Content */}
          <div className={imagePosition === 'right' ? 'lg:col-start-1 lg:row-start-1' : ''}>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                color: textColor
              }}
            >
              {title}
            </h2>
            <p
              className="text-base md:text-lg leading-relaxed whitespace-pre-line"
              style={{ color: textColor }}
            >
              {displayText}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-4 underline hover:no-underline"
                style={{ color: textColor }}
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
