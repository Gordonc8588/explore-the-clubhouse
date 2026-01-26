'use client';

import { useEffect } from 'react';
import { captureUTMParams } from '@/lib/utm';

/**
 * Client component that captures UTM parameters on page load
 */
export function UTMCapture() {
  useEffect(() => {
    captureUTMParams();
  }, []);

  return null;
}
