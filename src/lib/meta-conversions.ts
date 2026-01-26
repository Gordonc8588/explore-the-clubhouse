/**
 * Meta Conversions API for server-side tracking
 * Provides reliable conversion tracking that bypasses ad blockers
 *
 * Setup:
 * 1. In Facebook Business Manager, go to Events Manager → Settings
 * 2. Generate a Conversions API Access Token
 * 3. Add META_CONVERSIONS_API_TOKEN to your environment variables
 */

import crypto from 'crypto';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN;
const API_VERSION = 'v18.0';

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string; // Facebook click ID
  fbp?: string; // Facebook browser ID
}

interface CustomData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  num_items?: number;
  order_id?: string;
}

interface ConversionEvent {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url?: string;
  action_source: 'website' | 'app' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
  user_data: UserData;
  custom_data?: CustomData;
}

/**
 * Hash data for Meta's user data matching
 * Meta requires SHA256 hashing of PII before sending
 */
function hashData(data: string | undefined): string | undefined {
  if (!data) return undefined;
  return crypto
    .createHash('sha256')
    .update(data.toLowerCase().trim())
    .digest('hex');
}

/**
 * Normalize and hash phone number
 */
function hashPhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  // Remove non-digits and ensure E.164 format
  const normalized = phone.replace(/\D/g, '');
  return hashData(normalized);
}

/**
 * Build user data object with hashed values
 */
function buildUserData(userData: UserData): Record<string, string | undefined> {
  return {
    em: hashData(userData.email),
    ph: hashPhone(userData.phone),
    fn: hashData(userData.firstName),
    ln: hashData(userData.lastName),
    ct: hashData(userData.city),
    st: hashData(userData.state),
    country: hashData(userData.country),
    zp: hashData(userData.zipCode),
    client_ip_address: userData.clientIpAddress,
    client_user_agent: userData.clientUserAgent,
    fbc: userData.fbc,
    fbp: userData.fbp,
  };
}

/**
 * Send conversion event to Meta Conversions API
 */
export async function sendConversionEvent(event: ConversionEvent): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.log('[Meta Conversions API] Not configured - skipping event:', event.event_name);
    return { success: false, error: 'Meta Conversions API not configured' };
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

  const payload = {
    data: [{
      event_name: event.event_name,
      event_time: event.event_time,
      event_id: event.event_id,
      event_source_url: event.event_source_url,
      action_source: event.action_source,
      user_data: buildUserData(event.user_data),
      custom_data: event.custom_data,
    }],
    access_token: ACCESS_TOKEN,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Meta Conversions API] Error:', result);
      return { success: false, error: result.error?.message || 'Unknown error' };
    }

    console.log('[Meta Conversions API] Event sent:', event.event_name, result);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Meta Conversions API] Request failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Track purchase event via Conversions API
 * Call this from the Stripe webhook after successful payment
 */
export async function trackPurchaseConversion(data: {
  bookingId: string;
  email: string;
  phone?: string;
  value: number; // in pence
  clubId: string;
  clubName: string;
  numChildren: number;
  eventSourceUrl?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendConversionEvent({
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: `purchase_${data.bookingId}`,
    event_source_url: data.eventSourceUrl,
    action_source: 'website',
    user_data: {
      email: data.email,
      phone: data.phone,
      clientIpAddress: data.clientIpAddress,
      clientUserAgent: data.clientUserAgent,
    },
    custom_data: {
      value: data.value / 100, // Convert pence to pounds
      currency: 'GBP',
      content_ids: [data.clubId],
      content_name: data.clubName,
      content_type: 'product',
      num_items: data.numChildren,
      order_id: data.bookingId,
    },
  });
}

/**
 * Track InitiateCheckout event via Conversions API
 * Call this when user starts checkout (server-side backup)
 */
export async function trackInitiateCheckoutConversion(data: {
  email: string;
  phone?: string;
  value: number; // in pence
  clubId: string;
  clubName: string;
  numChildren: number;
  eventSourceUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendConversionEvent({
    event_name: 'InitiateCheckout',
    event_time: Math.floor(Date.now() / 1000),
    event_id: `checkout_${data.clubId}_${Date.now()}`,
    event_source_url: data.eventSourceUrl,
    action_source: 'website',
    user_data: {
      email: data.email,
      phone: data.phone,
    },
    custom_data: {
      value: data.value / 100,
      currency: 'GBP',
      content_ids: [data.clubId],
      content_name: data.clubName,
      content_type: 'product',
      num_items: data.numChildren,
    },
  });
}

/**
 * Track Lead event (newsletter signup, contact form, etc.)
 */
export async function trackLeadConversion(data: {
  email: string;
  phone?: string;
  source: string;
  eventSourceUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendConversionEvent({
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    event_id: `lead_${Date.now()}`,
    event_source_url: data.eventSourceUrl,
    action_source: 'website',
    user_data: {
      email: data.email,
      phone: data.phone,
    },
    custom_data: {
      content_name: data.source,
    },
  });
}
