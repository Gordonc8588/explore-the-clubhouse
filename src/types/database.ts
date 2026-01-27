/**
 * TypeScript types for Supabase database schema
 * Auto-generated from supabase/schema.sql
 */

// =============================================================================
// ENUMS
// =============================================================================

/** Booking option type - determines how days are selected */
export type OptionType = 'full_week' | 'single_day' | 'multi_day';

/** Time slot for bookings */
export type TimeSlot = 'full_day' | 'morning' | 'afternoon';

/** Booking status - tracks payment and completion state */
export type BookingStatus = 'pending' | 'paid' | 'cancelled' | 'refunded' | 'complete';

/** Waitlist entry status */
export type WaitlistStatus = 'waiting' | 'notified' | 'expired' | 'booked';

/** Contact submission status */
export type ContactStatus = 'new' | 'read' | 'replied';

/** Newsletter status */
export type NewsletterStatus = 'draft' | 'sent';

// =============================================================================
// TABLE TYPES
// =============================================================================

/**
 * Club - Seasonal holiday clubs (Easter, Summer, etc.)
 */
export interface Club {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  start_date: string; // DATE as ISO string
  end_date: string; // DATE as ISO string
  morning_start: string; // TIME as string (HH:MM:SS)
  morning_end: string;
  afternoon_start: string;
  afternoon_end: string;
  min_age: number;
  max_age: number;
  is_active: boolean;
  bookings_open: boolean; // Whether bookings are available
  created_at: string; // TIMESTAMPTZ as ISO string
}

export interface ClubInsert {
  id?: string;
  slug: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  start_date: string;
  end_date: string;
  morning_start?: string;
  morning_end?: string;
  afternoon_start?: string;
  afternoon_end?: string;
  min_age?: number;
  max_age?: number;
  is_active?: boolean;
  bookings_open?: boolean;
  created_at?: string;
}

export interface ClubUpdate {
  id?: string;
  slug?: string;
  name?: string;
  description?: string | null;
  image_url?: string | null;
  start_date?: string;
  end_date?: string;
  morning_start?: string;
  morning_end?: string;
  afternoon_start?: string;
  afternoon_end?: string;
  min_age?: number;
  max_age?: number;
  is_active?: boolean;
  bookings_open?: boolean;
  created_at?: string;
}

/**
 * ClubDay - Individual days within a club with capacity settings
 */
export interface ClubDay {
  id: string;
  club_id: string;
  date: string; // DATE as ISO string
  morning_capacity: number;
  afternoon_capacity: number;
  is_available: boolean;
  created_at: string;
}

export interface ClubDayInsert {
  id?: string;
  club_id: string;
  date: string;
  morning_capacity?: number;
  afternoon_capacity?: number;
  is_available?: boolean;
  created_at?: string;
}

export interface ClubDayUpdate {
  id?: string;
  club_id?: string;
  date?: string;
  morning_capacity?: number;
  afternoon_capacity?: number;
  is_available?: boolean;
  created_at?: string;
}

/**
 * BookingOption - Pricing options for clubs (Full Week, Single Day, etc.)
 */
export interface BookingOption {
  id: string;
  club_id: string;
  name: string;
  description: string | null;
  option_type: OptionType;
  time_slot: TimeSlot;
  price_per_child: number; // Price in pence
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface BookingOptionInsert {
  id?: string;
  club_id: string;
  name: string;
  description?: string | null;
  option_type: OptionType;
  time_slot: TimeSlot;
  price_per_child: number;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface BookingOptionUpdate {
  id?: string;
  club_id?: string;
  name?: string;
  description?: string | null;
  option_type?: OptionType;
  time_slot?: TimeSlot;
  price_per_child?: number;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
}

/**
 * PromoCode - Discount codes for percentage-off promotions
 */
export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  valid_from: string; // TIMESTAMPTZ as ISO string
  valid_until: string;
  max_uses: number | null;
  times_used: number;
  club_id: string | null; // NULL means valid for all clubs
  is_active: boolean;
  created_at: string;
}

export interface PromoCodeInsert {
  id?: string;
  code: string;
  discount_percent: number;
  valid_from: string;
  valid_until: string;
  max_uses?: number | null;
  times_used?: number;
  club_id?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface PromoCodeUpdate {
  id?: string;
  code?: string;
  discount_percent?: number;
  valid_from?: string;
  valid_until?: string;
  max_uses?: number | null;
  times_used?: number;
  club_id?: string | null;
  is_active?: boolean;
  created_at?: string;
}

/**
 * Booking - Parent booking records with payment status tracking
 */
export interface Booking {
  id: string;
  club_id: string;
  booking_option_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  num_children: number;
  total_amount: number; // Amount in pence
  status: BookingStatus;
  promo_code_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  // UTM attribution fields
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_page: string | null;
  referrer: string | null;
  attributed_newsletter_id: string | null;
  created_at: string;
}

export interface BookingInsert {
  id?: string;
  club_id: string;
  booking_option_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  num_children: number;
  total_amount: number;
  status?: BookingStatus;
  promo_code_id?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_checkout_session_id?: string | null;
  // UTM attribution fields
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
  attributed_newsletter_id?: string | null;
  created_at?: string;
}

export interface BookingUpdate {
  id?: string;
  club_id?: string;
  booking_option_id?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  num_children?: number;
  total_amount?: number;
  status?: BookingStatus;
  promo_code_id?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_checkout_session_id?: string | null;
  // UTM attribution fields
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
  attributed_newsletter_id?: string | null;
  created_at?: string;
}

/**
 * BookingDay - Links bookings to specific days being attended
 */
export interface BookingDay {
  id: string;
  booking_id: string;
  club_day_id: string;
  time_slot: TimeSlot;
  created_at: string;
}

export interface BookingDayInsert {
  id?: string;
  booking_id: string;
  club_day_id: string;
  time_slot: TimeSlot;
  created_at?: string;
}

export interface BookingDayUpdate {
  id?: string;
  booking_id?: string;
  club_day_id?: string;
  time_slot?: TimeSlot;
  created_at?: string;
}

/**
 * Child - Child information collected after payment
 */
export interface Child {
  id: string;
  booking_id: string;
  name: string;
  date_of_birth: string; // DATE as ISO string
  allergies: string;
  medical_notes: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string | null;
  emergency_contact_2_name: string | null;
  emergency_contact_2_phone: string | null;
  emergency_contact_2_relationship: string | null;
  pickup_person_1_name: string | null;
  pickup_person_1_phone: string | null;
  pickup_person_1_relationship: string | null;
  pickup_person_2_name: string | null;
  pickup_person_2_phone: string | null;
  pickup_person_2_relationship: string | null;
  pickup_person_3_name: string | null;
  pickup_person_3_phone: string | null;
  pickup_person_3_relationship: string | null;
  photo_consent: boolean;
  activity_consent: boolean;
  medical_consent: boolean;
  farm_animal_consent: boolean;
  woodland_consent: boolean;
  parent_notes: string | null;
  created_at: string;
}

export interface ChildInsert {
  id?: string;
  booking_id: string;
  name: string;
  date_of_birth: string;
  allergies: string;
  medical_notes: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship?: string | null;
  emergency_contact_2_name?: string | null;
  emergency_contact_2_phone?: string | null;
  emergency_contact_2_relationship?: string | null;
  pickup_person_1_name?: string | null;
  pickup_person_1_phone?: string | null;
  pickup_person_1_relationship?: string | null;
  pickup_person_2_name?: string | null;
  pickup_person_2_phone?: string | null;
  pickup_person_2_relationship?: string | null;
  pickup_person_3_name?: string | null;
  pickup_person_3_phone?: string | null;
  pickup_person_3_relationship?: string | null;
  photo_consent: boolean;
  activity_consent: boolean;
  medical_consent: boolean;
  farm_animal_consent?: boolean;
  woodland_consent?: boolean;
  parent_notes?: string | null;
  created_at?: string;
}

export interface ChildUpdate {
  id?: string;
  booking_id?: string;
  name?: string;
  date_of_birth?: string;
  allergies?: string;
  medical_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string | null;
  emergency_contact_2_name?: string | null;
  emergency_contact_2_phone?: string | null;
  emergency_contact_2_relationship?: string | null;
  pickup_person_1_name?: string | null;
  pickup_person_1_phone?: string | null;
  pickup_person_1_relationship?: string | null;
  pickup_person_2_name?: string | null;
  pickup_person_2_phone?: string | null;
  pickup_person_2_relationship?: string | null;
  pickup_person_3_name?: string | null;
  pickup_person_3_phone?: string | null;
  pickup_person_3_relationship?: string | null;
  photo_consent?: boolean;
  activity_consent?: boolean;
  medical_consent?: boolean;
  farm_animal_consent?: boolean;
  woodland_consent?: boolean;
  parent_notes?: string | null;
  created_at?: string;
}

/**
 * Waitlist - Queue for parents wanting spots in sold-out clubs
 */
export interface Waitlist {
  id: string;
  club_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  num_children: number;
  booking_option_id: string;
  status: WaitlistStatus;
  notified_at: string | null;
  expires_at: string | null;
  position: number;
  created_at: string;
}

export interface WaitlistInsert {
  id?: string;
  club_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  num_children: number;
  booking_option_id: string;
  status?: WaitlistStatus;
  notified_at?: string | null;
  expires_at?: string | null;
  position: number;
  created_at?: string;
}

export interface WaitlistUpdate {
  id?: string;
  club_id?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  num_children?: number;
  booking_option_id?: string;
  status?: WaitlistStatus;
  notified_at?: string | null;
  expires_at?: string | null;
  position?: number;
  created_at?: string;
}

/**
 * ContactSubmission - Messages from the contact form
 */
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: ContactStatus;
  created_at: string;
}

export interface ContactSubmissionInsert {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status?: ContactStatus;
  created_at?: string;
}

export interface ContactSubmissionUpdate {
  id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  message?: string;
  status?: ContactStatus;
  created_at?: string;
}

/**
 * NewsletterSubscriber - Email subscribers for marketing updates
 */
export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  source: string;
  unsubscribed_at: string | null;
  confirmation_token: string | null;
  confirmed_at: string | null;
}

export interface NewsletterSubscriberInsert {
  id?: string;
  email: string;
  subscribed_at?: string;
  source?: string;
  unsubscribed_at?: string | null;
  confirmation_token?: string | null;
  confirmed_at?: string | null;
}

export interface NewsletterSubscriberUpdate {
  id?: string;
  email?: string;
  subscribed_at?: string;
  source?: string;
  unsubscribed_at?: string | null;
  confirmation_token?: string | null;
  confirmed_at?: string | null;
}

/**
 * Newsletter - Marketing newsletters sent to subscribers
 */
export interface Newsletter {
  id: string;
  subject: string;
  preview_text: string | null;
  body_html: string;
  image_urls: string[];
  featured_club_id: string | null;
  promo_code_id: string | null;
  cta_text: string | null;
  cta_url: string | null;
  status: NewsletterStatus;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
  updated_at: string;
}

export interface NewsletterInsert {
  id?: string;
  subject: string;
  preview_text?: string | null;
  body_html: string;
  image_urls?: string[];
  featured_club_id?: string | null;
  promo_code_id?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  status?: NewsletterStatus;
  sent_at?: string | null;
  recipient_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface NewsletterUpdate {
  id?: string;
  subject?: string;
  preview_text?: string | null;
  body_html?: string;
  image_urls?: string[];
  featured_club_id?: string | null;
  promo_code_id?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  status?: NewsletterStatus;
  sent_at?: string | null;
  recipient_count?: number;
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// NEWSLETTER IMAGE TYPE
// =============================================================================

/**
 * NewsletterImage - Image metadata for AI-powered newsletter generation
 */
export interface NewsletterImage {
  url: string;
  label: string;
  description?: string;
}

/**
 * StoredNewsletterImage - Saved image in the library for reuse across newsletters
 */
export interface StoredNewsletterImage {
  id: string;
  url: string;
  public_id: string | null; // Cloudinary public ID for transformations
  label: string | null;
  description: string | null;
  tags: string[];
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
}

export interface StoredNewsletterImageInsert {
  id?: string;
  url: string;
  public_id?: string | null;
  label?: string | null;
  description?: string | null;
  tags?: string[];
  width?: number | null;
  height?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface StoredNewsletterImageUpdate {
  id?: string;
  url?: string;
  public_id?: string | null;
  label?: string | null;
  description?: string | null;
  tags?: string[];
  width?: number | null;
  height?: number | null;
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// META ADS TYPES
// =============================================================================

/** Ad objective type */
export type AdObjective = 'awareness' | 'traffic' | 'conversions';

/** Ad status - tracks lifecycle from draft to completion */
export type AdStatus = 'draft' | 'pending' | 'active' | 'paused' | 'rejected' | 'completed';

/** Ad CTA button types supported by Meta */
export type AdCtaType = 'LEARN_MORE' | 'BOOK_NOW' | 'SHOP_NOW' | 'SIGN_UP' | 'CONTACT_US' | 'GET_OFFER';

/** Budget type for ad spend */
export type BudgetType = 'daily' | 'lifetime';

/** Targeting preset options */
export type TargetingPreset = 'local_parents' | 'school_holiday' | 'retargeting' | 'lookalike';

/**
 * MetaAd - Facebook/Instagram ad campaigns managed from admin panel
 */
export interface MetaAd {
  id: string;
  name: string;
  club_id: string | null;
  promo_code_id: string | null;

  // Ad Content
  objective: string;
  primary_text: string | null;
  headline: string | null;
  description: string | null;
  cta_type: string;
  cta_url: string | null;
  image_urls: string[];

  // Targeting
  targeting_preset: string | null;
  custom_targeting: Record<string, unknown> | null;

  // Budget & Schedule
  budget_type: string;
  budget_amount: number | null;  // In pence
  schedule_start: string | null;
  schedule_end: string | null;

  // Status
  status: string;

  // Meta API IDs
  meta_campaign_id: string | null;
  meta_adset_id: string | null;
  meta_creative_id: string | null;
  meta_ad_id: string | null;
  meta_image_hash: string | null;
  meta_review_status: string | null;
  meta_rejection_reason: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface MetaAdInsert {
  id?: string;
  name: string;
  club_id?: string | null;
  promo_code_id?: string | null;
  objective?: string;
  primary_text?: string | null;
  headline?: string | null;
  description?: string | null;
  cta_type?: string;
  cta_url?: string | null;
  image_urls?: string[];
  targeting_preset?: string | null;
  custom_targeting?: Record<string, unknown> | null;
  budget_type?: string;
  budget_amount?: number | null;
  schedule_start?: string | null;
  schedule_end?: string | null;
  status?: string;
  meta_campaign_id?: string | null;
  meta_adset_id?: string | null;
  meta_creative_id?: string | null;
  meta_ad_id?: string | null;
  meta_image_hash?: string | null;
  meta_review_status?: string | null;
  meta_rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
}

export interface MetaAdUpdate {
  id?: string;
  name?: string;
  club_id?: string | null;
  promo_code_id?: string | null;
  objective?: string;
  primary_text?: string | null;
  headline?: string | null;
  description?: string | null;
  cta_type?: string;
  cta_url?: string | null;
  image_urls?: string[];
  targeting_preset?: string | null;
  custom_targeting?: Record<string, unknown> | null;
  budget_type?: string;
  budget_amount?: number | null;
  schedule_start?: string | null;
  schedule_end?: string | null;
  status?: string;
  meta_campaign_id?: string | null;
  meta_adset_id?: string | null;
  meta_creative_id?: string | null;
  meta_ad_id?: string | null;
  meta_image_hash?: string | null;
  meta_review_status?: string | null;
  meta_rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
}

/**
 * MetaAdMetrics - Daily performance metrics for Meta ads
 */
export interface MetaAdMetrics {
  id: string;
  ad_id: string;
  date: string;  // DATE as ISO string
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;  // In pence
  conversions: number;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  created_at: string;
}

export interface MetaAdMetricsInsert {
  id?: string;
  ad_id: string;
  date: string;
  impressions?: number;
  reach?: number;
  clicks?: number;
  spend?: number;
  conversions?: number;
  ctr?: number | null;
  cpc?: number | null;
  cpm?: number | null;
  created_at?: string;
}

export interface MetaAdMetricsUpdate {
  id?: string;
  ad_id?: string;
  date?: string;
  impressions?: number;
  reach?: number;
  clicks?: number;
  spend?: number;
  conversions?: number;
  ctr?: number | null;
  cpc?: number | null;
  cpm?: number | null;
  created_at?: string;
}

/**
 * MetaAdImage - Library of reusable images for Meta ads
 */
export interface MetaAdImage {
  id: string;
  url: string;
  public_id: string | null;
  label: string | null;
  description: string | null;
  tags: string[];
  width: number | null;
  height: number | null;
  aspect_ratio: string | null;
  meta_image_hash: string | null;
  created_at: string;
}

export interface MetaAdImageInsert {
  id?: string;
  url: string;
  public_id?: string | null;
  label?: string | null;
  description?: string | null;
  tags?: string[];
  width?: number | null;
  height?: number | null;
  aspect_ratio?: string | null;
  meta_image_hash?: string | null;
  created_at?: string;
}

export interface MetaAdImageUpdate {
  id?: string;
  url?: string;
  public_id?: string | null;
  label?: string | null;
  description?: string | null;
  tags?: string[];
  width?: number | null;
  height?: number | null;
  aspect_ratio?: string | null;
  meta_image_hash?: string | null;
  created_at?: string;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * AnalyticsEvent - First-party analytics event storage (90-day retention)
 */
export interface AnalyticsEvent {
  id: string;
  event_name: string;
  event_data: Record<string, unknown>;
  session_id: string | null;
  page_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

export interface AnalyticsEventInsert {
  id?: string;
  event_name: string;
  event_data?: Record<string, unknown>;
  session_id?: string | null;
  page_url?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  created_at?: string;
}

/**
 * NewsletterClick - Tracks clicks on newsletter links for attribution
 */
export interface NewsletterClick {
  id: string;
  newsletter_id: string | null;
  subscriber_email: string;
  link_url: string;
  clicked_at: string;
}

export interface NewsletterClickInsert {
  id?: string;
  newsletter_id?: string | null;
  subscriber_email: string;
  link_url: string;
  clicked_at?: string;
}

// =============================================================================
// DATABASE TYPE (for Supabase client)
// =============================================================================

export interface Database {
  public: {
    Tables: {
      clubs: {
        Row: Club;
        Insert: ClubInsert;
        Update: ClubUpdate;
      };
      club_days: {
        Row: ClubDay;
        Insert: ClubDayInsert;
        Update: ClubDayUpdate;
      };
      booking_options: {
        Row: BookingOption;
        Insert: BookingOptionInsert;
        Update: BookingOptionUpdate;
      };
      promo_codes: {
        Row: PromoCode;
        Insert: PromoCodeInsert;
        Update: PromoCodeUpdate;
      };
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
      };
      booking_days: {
        Row: BookingDay;
        Insert: BookingDayInsert;
        Update: BookingDayUpdate;
      };
      children: {
        Row: Child;
        Insert: ChildInsert;
        Update: ChildUpdate;
      };
      waitlist: {
        Row: Waitlist;
        Insert: WaitlistInsert;
        Update: WaitlistUpdate;
      };
      contact_submissions: {
        Row: ContactSubmission;
        Insert: ContactSubmissionInsert;
        Update: ContactSubmissionUpdate;
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: NewsletterSubscriberInsert;
        Update: NewsletterSubscriberUpdate;
      };
      newsletters: {
        Row: Newsletter;
        Insert: NewsletterInsert;
        Update: NewsletterUpdate;
      };
      newsletter_images: {
        Row: StoredNewsletterImage;
        Insert: StoredNewsletterImageInsert;
        Update: StoredNewsletterImageUpdate;
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: AnalyticsEventInsert;
        Update: Partial<AnalyticsEventInsert>;
      };
      newsletter_clicks: {
        Row: NewsletterClick;
        Insert: NewsletterClickInsert;
        Update: Partial<NewsletterClickInsert>;
      };
      meta_ads: {
        Row: MetaAd;
        Insert: MetaAdInsert;
        Update: MetaAdUpdate;
      };
      meta_ad_metrics: {
        Row: MetaAdMetrics;
        Insert: MetaAdMetricsInsert;
        Update: MetaAdMetricsUpdate;
      };
      meta_ad_images: {
        Row: MetaAdImage;
        Insert: MetaAdImageInsert;
        Update: MetaAdImageUpdate;
      };
    };
    Functions: {
      get_club_day_availability: {
        Args: { day_id: string };
        Returns: {
          morning_booked: number;
          afternoon_booked: number;
          morning_capacity: number;
          afternoon_capacity: number;
        }[];
      };
      is_club_sold_out: {
        Args: { club_uuid: string };
        Returns: boolean;
      };
    };
  };
}
