"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "cookie-consent";

type ConsentStatus = "accepted" | "rejected" | null;

export function CookieConsent() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | "pending">("pending");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for existing consent
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") {
      setConsentStatus(stored);
    } else {
      setConsentStatus(null);
      // Small delay before showing banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setConsentStatus("accepted");
    setIsVisible(false);
    // Trigger a custom event so GoogleAnalytics can respond
    window.dispatchEvent(new CustomEvent("cookie-consent-updated"));
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setConsentStatus("rejected");
    setIsVisible(false);
  };

  // Don't render if consent already given or still checking
  if (consentStatus === "pending" || consentStatus === "accepted" || consentStatus === "rejected") {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-[var(--shadow-lg)] ring-1 ring-stone/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h2
              id="cookie-consent-title"
              className="font-display text-lg font-semibold text-bark"
            >
              We value your privacy
            </h2>
            <p
              id="cookie-consent-description"
              className="mt-2 font-body text-sm text-stone"
            >
              We use cookies to enhance your browsing experience and analyze our
              traffic. By clicking &quot;Accept&quot;, you consent to our use of
              cookies.{" "}
              <Link
                href="/privacy"
                className="text-forest underline hover:text-meadow"
              >
                Learn more
              </Link>
            </p>
          </div>

          <div className="flex flex-shrink-0 gap-3 sm:ml-6">
            <button
              onClick={handleReject}
              className="rounded-lg border-2 border-stone/30 px-5 py-2.5 font-display text-sm font-semibold text-stone transition-colors hover:border-stone hover:text-bark focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="rounded-lg bg-forest px-5 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-meadow focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if cookie consent has been accepted
 * @returns boolean | null - null if still checking, boolean otherwise
 */
export function useCookieConsent(): boolean | null {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConsent = () => {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      setHasConsent(stored === "accepted");
    };

    checkConsent();

    // Listen for consent updates
    window.addEventListener("cookie-consent-updated", checkConsent);
    return () => {
      window.removeEventListener("cookie-consent-updated", checkConsent);
    };
  }, []);

  return hasConsent;
}
