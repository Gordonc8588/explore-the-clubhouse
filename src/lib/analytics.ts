/**
 * Analytics library for tracking events across GA4, Meta Pixel, and first-party storage
 */

import { getUTMParams, getSessionId } from './utm';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/** Standard analytics event */
export interface AnalyticsEvent {
  name: string;
  params?: Record<string, string | number | boolean | undefined>;
}

/** GA4 Enhanced Ecommerce item */
export interface EcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
}

/** GA4 Enhanced Ecommerce event data */
export interface EcommerceEventData {
  currency?: string;
  value?: number;
  items?: EcommerceItem[];
  transaction_id?: string;
  coupon?: string;
}

/** Booking funnel step names */
export type FunnelStep =
  | 'view_club'
  | 'start_booking'
  | 'select_option'
  | 'select_dates'
  | 'enter_children'
  | 'enter_details'
  | 'apply_promo'
  | 'initiate_payment'
  | 'purchase_complete';

/** Meta Pixel standard events */
export type MetaEventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration';

// =============================================================================
// GA4 TRACKING
// =============================================================================

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/**
 * Send event to Google Analytics 4
 */
export function trackGA4Event(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', eventName, params);
  } catch (error) {
    console.error('[Analytics] GA4 tracking error:', error);
  }
}

/**
 * Track GA4 Enhanced Ecommerce event
 */
export function trackGA4Ecommerce(
  eventName: string,
  data: EcommerceEventData
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', eventName, {
      currency: data.currency || 'GBP',
      value: data.value,
      items: data.items,
      transaction_id: data.transaction_id,
      coupon: data.coupon,
    });
  } catch (error) {
    console.error('[Analytics] GA4 ecommerce tracking error:', error);
  }
}

// =============================================================================
// META PIXEL TRACKING
// =============================================================================

/**
 * Track Meta Pixel standard event
 */
export function trackMetaEvent(
  eventName: MetaEventName,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    window.fbq('track', eventName, params);
  } catch (error) {
    console.error('[Analytics] Meta Pixel tracking error:', error);
  }
}

/**
 * Track Meta Pixel custom event
 */
export function trackMetaCustomEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    window.fbq('trackCustom', eventName, params);
  } catch (error) {
    console.error('[Analytics] Meta Pixel custom tracking error:', error);
  }
}

// =============================================================================
// FIRST-PARTY ANALYTICS
// =============================================================================

/**
 * Send event to first-party analytics storage
 */
export async function trackFirstPartyEvent(
  eventName: string,
  eventData: Record<string, unknown>
): Promise<void> {
  if (typeof window === 'undefined') return;

  const utm = getUTMParams();
  const sessionId = getSessionId();

  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_data: eventData,
        session_id: sessionId,
        page_url: window.location.pathname,
        utm_source: utm?.utm_source,
        utm_medium: utm?.utm_medium,
        utm_campaign: utm?.utm_campaign,
      }),
    });
  } catch (error) {
    // Silently fail - analytics should not block user experience
    console.error('[Analytics] First-party tracking error:', error);
  }
}

// =============================================================================
// UNIFIED TRACKING FUNCTIONS
// =============================================================================

/**
 * Track a general event across all platforms
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  // GA4
  trackGA4Event(eventName, params);

  // First-party (async, fire-and-forget)
  trackFirstPartyEvent(eventName, params || {});
}

/**
 * Track booking funnel step
 */
export function trackFunnelStep(
  step: FunnelStep,
  data: {
    club_id?: string;
    club_name?: string;
    club_slug?: string;
    option_id?: string;
    option_name?: string;
    value?: number;
    num_children?: number;
    num_days?: number;
  }
): void {
  const eventParams = {
    step_name: step,
    ...data,
  };

  // GA4 event
  trackGA4Event(`funnel_${step}`, eventParams);

  // First-party storage
  trackFirstPartyEvent(`funnel_${step}`, eventParams);

  // Meta Pixel - map to standard events
  switch (step) {
    case 'view_club':
      trackMetaEvent('ViewContent', {
        content_type: 'product',
        content_ids: [data.club_id],
        content_name: data.club_name,
      });
      break;
    case 'start_booking':
      trackMetaEvent('AddToCart', {
        content_type: 'product',
        content_ids: [data.club_id],
        content_name: data.club_name,
        value: data.value ? data.value / 100 : undefined,
        currency: 'GBP',
      });
      break;
    case 'initiate_payment':
      trackMetaEvent('InitiateCheckout', {
        content_ids: [data.club_id],
        content_name: data.club_name,
        value: data.value ? data.value / 100 : undefined,
        currency: 'GBP',
        num_items: data.num_children,
      });
      break;
  }
}

/**
 * Track view_item event (club detail page view)
 */
export function trackViewItem(club: {
  id: string;
  name: string;
  slug: string;
}): void {
  // GA4 Enhanced Ecommerce
  trackGA4Ecommerce('view_item', {
    items: [{
      item_id: club.id,
      item_name: club.name,
      item_category: 'holiday_club',
    }],
  });

  // Full funnel tracking
  trackFunnelStep('view_club', {
    club_id: club.id,
    club_name: club.name,
    club_slug: club.slug,
  });
}

/**
 * Track begin_checkout event (booking form started)
 */
export function trackBeginCheckout(data: {
  club_id: string;
  club_name: string;
  club_slug: string;
  option_id: string;
  option_name: string;
  value: number;
  num_children: number;
}): void {
  // GA4 Enhanced Ecommerce
  trackGA4Ecommerce('begin_checkout', {
    currency: 'GBP',
    value: data.value / 100,
    items: [{
      item_id: data.club_id,
      item_name: data.club_name,
      item_category: 'holiday_club',
      price: data.value / 100,
      quantity: data.num_children,
    }],
  });

  // Full funnel tracking
  trackFunnelStep('start_booking', data);
}

/**
 * Track add_to_cart event (option selected)
 */
export function trackAddToCart(data: {
  club_id: string;
  club_name: string;
  option_id: string;
  option_name: string;
  value: number;
  num_children: number;
}): void {
  // GA4 Enhanced Ecommerce
  trackGA4Ecommerce('add_to_cart', {
    currency: 'GBP',
    value: data.value / 100,
    items: [{
      item_id: data.club_id,
      item_name: data.club_name,
      item_category: 'holiday_club',
      price: data.value / 100,
      quantity: data.num_children,
    }],
  });

  // Funnel tracking
  trackFunnelStep('select_option', data);
}

/**
 * Track purchase completion (called from server-side webhook)
 * This sends the conversion data to our first-party storage
 */
export async function trackPurchaseServer(data: {
  booking_id: string;
  club_id: string;
  club_name: string;
  value: number;
  num_children: number;
  email: string;
  promo_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}): Promise<void> {
  // This function is for server-side use only
  // GA4 and Meta Pixel server-side tracking is handled separately
  console.log('[Analytics] Server-side purchase tracked:', {
    booking_id: data.booking_id,
    value: data.value,
    utm_source: data.utm_source,
  });
}

// =============================================================================
// HELPER FOR CHECKOUT
// =============================================================================

/**
 * Get UTM parameters formatted for checkout API
 */
export function getCheckoutUTMParams(): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_page: string | null;
  referrer: string | null;
} {
  const utm = getUTMParams();
  return {
    utm_source: utm?.utm_source || null,
    utm_medium: utm?.utm_medium || null,
    utm_campaign: utm?.utm_campaign || null,
    landing_page: utm?.landing_page || null,
    referrer: utm?.referrer || null,
  };
}
