'use client';

import { useEffect, useRef } from 'react';
import { trackViewItem } from '@/lib/analytics';

interface ClubViewTrackerProps {
  club: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Client component that tracks view_item event when a club page is viewed
 */
export function ClubViewTracker({ club }: ClubViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      trackViewItem(club);
    }
  }, [club]);

  // This component doesn't render anything
  return null;
}
