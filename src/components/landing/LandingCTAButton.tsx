'use client';

import Link from 'next/link';
import { trackMetaCustomEvent, trackGA4Event } from '@/lib/analytics';

export function LandingCTAButton({
  href,
  position,
  children,
  className = '',
}: {
  href: string;
  position: 'hero' | 'mid' | 'bottom';
  children: React.ReactNode;
  className?: string;
}) {
  function handleClick() {
    trackMetaCustomEvent('CTAClick', {
      cta_position: position,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      destination: href,
    });

    trackGA4Event('cta_click', {
      cta_position: position,
      destination: href,
    });
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`inline-block rounded-lg px-8 py-4 text-lg font-bold text-white transition-all hover:opacity-90 hover:scale-105 ${className}`}
      style={{ backgroundColor: 'var(--craigies-burnt-orange)' }}
    >
      {children}
    </Link>
  );
}
