"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const COOKIE_CONSENT_KEY = "cookie-consent";

export function GoogleAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    // Check initial consent status
    const checkConsent = () => {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      setShouldLoad(consent === "accepted");
    };

    checkConsent();

    // Listen for consent updates
    const handleConsentUpdate = () => {
      checkConsent();
    };

    window.addEventListener("cookie-consent-updated", handleConsentUpdate);
    return () => {
      window.removeEventListener("cookie-consent-updated", handleConsentUpdate);
    };
  }, []);

  // Don't load if no GA ID or no consent
  if (!gaId || !shouldLoad) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}
