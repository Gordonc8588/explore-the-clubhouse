'use client';
import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
}

export function ImageWithFallback({ src, alt, className }: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return <div className={className} style={{ backgroundColor: 'var(--craigies-cream)' }} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
