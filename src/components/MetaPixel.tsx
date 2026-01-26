'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { captureUTMParams } from '@/lib/utm';

/**
 * Meta Pixel (Facebook Pixel) component
 * Loads the Meta Pixel base code and handles PageView tracking
 *
 * Setup instructions:
 * 1. Go to Facebook Business Manager (business.facebook.com)
 * 2. Navigate to Events Manager → Connect Data Sources → Web → Meta Pixel
 * 3. Create or select your pixel and copy the Pixel ID
 * 4. Add NEXT_PUBLIC_META_PIXEL_ID to your environment variables
 */
export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  // Capture UTM parameters on initial page load
  useEffect(() => {
    captureUTMParams();
  }, []);

  if (!pixelId) {
    return null;
  }

  return (
    <>
      {/* Meta Pixel Base Code */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      {/* Fallback for users with JavaScript disabled */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
