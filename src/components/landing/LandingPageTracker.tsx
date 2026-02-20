'use client';

import { useEffect, useRef } from 'react';
import { trackMetaEvent, trackMetaCustomEvent, trackGA4Event } from '@/lib/analytics';

export function LandingPageTracker({
  contentName,
  contentCategory,
  contentId,
  value,
}: {
  contentName: string;
  contentCategory: string;
  contentId: string;
  value: number;
}) {
  const hasFired = useRef(false);
  const milestones = useRef(new Set<number>());

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Meta standard event - key for algorithm optimisation
    trackMetaEvent('ViewContent', {
      content_name: contentName,
      content_category: contentCategory,
      content_ids: [contentId],
      content_type: 'product',
      value,
      currency: 'GBP',
    });

    // Meta custom event to distinguish ad traffic
    trackMetaCustomEvent('LandingPageView', {
      landing_page: window.location.pathname,
      content_name: contentName,
      referrer: document.referrer,
    });

    // GA4
    trackGA4Event('landing_page_view', {
      content_name: contentName,
      landing_page: window.location.pathname,
    });
  }, [contentName, contentCategory, contentId, value]);

  // Scroll depth tracking
  useEffect(() => {
    function handleScroll() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const percent = Math.round((window.scrollY / scrollHeight) * 100);
      const thresholds = [25, 50, 75, 100];

      for (const threshold of thresholds) {
        if (percent >= threshold && !milestones.current.has(threshold)) {
          milestones.current.add(threshold);

          trackMetaCustomEvent('ScrollDepth', {
            depth: threshold,
            page: window.location.pathname,
          });

          trackGA4Event('scroll_depth', {
            depth: threshold,
            page: window.location.pathname,
          });
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}
