/**
 * UTM parameter handling for marketing attribution
 * Captures UTM params from URL and persists in sessionStorage
 */

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  landing_page: string | null;
  referrer: string | null;
}

const UTM_STORAGE_KEY = 'clubhouse_utm_params';

/**
 * Capture UTM parameters from the current URL
 * Should be called on page load in client components
 */
export function captureUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null;

  const url = new URL(window.location.href);
  const params = url.searchParams;

  // Check if any UTM params exist in URL
  const hasUTMParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    .some(param => params.has(param));

  if (hasUTMParams) {
    const utmData: UTMParams = {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_term: params.get('utm_term'),
      utm_content: params.get('utm_content'),
      landing_page: window.location.pathname,
      referrer: document.referrer || null,
    };

    // Store in sessionStorage to persist across page navigations
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
    } catch {
      // sessionStorage may not be available
    }

    return utmData;
  }

  return null;
}

/**
 * Get stored UTM parameters from sessionStorage
 * Returns null if none stored
 */
export function getUTMParams(): UTMParams | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UTMParams;
    }
  } catch {
    // sessionStorage may not be available
  }

  // If no UTM params stored, still capture landing page and referrer
  // for first-touch attribution
  const existingReferrer = sessionStorage.getItem('clubhouse_referrer');
  const existingLanding = sessionStorage.getItem('clubhouse_landing');

  if (!existingLanding) {
    try {
      sessionStorage.setItem('clubhouse_landing', window.location.pathname);
      sessionStorage.setItem('clubhouse_referrer', document.referrer || '');
    } catch {
      // Ignore storage errors
    }
  }

  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    landing_page: existingLanding || window.location.pathname,
    referrer: existingReferrer || document.referrer || null,
  };
}

/**
 * Clear stored UTM parameters
 * Call after successful conversion to avoid double attribution
 */
export function clearUTMParams(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(UTM_STORAGE_KEY);
    sessionStorage.removeItem('clubhouse_referrer');
    sessionStorage.removeItem('clubhouse_landing');
  } catch {
    // Ignore storage errors
  }
}

/**
 * Generate a unique session ID for analytics
 * Persists in sessionStorage for the browser session
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  const SESSION_ID_KEY = 'clubhouse_session_id';

  try {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch {
    // Fallback if sessionStorage unavailable
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
