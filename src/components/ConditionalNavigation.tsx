'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';

export function ConditionalNavigation() {
  const pathname = usePathname();

  if (pathname.startsWith('/lp/')) {
    return null;
  }

  return <Navigation />;
}
