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
  photo_consent: boolean;
  activity_consent: boolean;
  medical_consent: boolean;
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
  photo_consent: boolean;
  activity_consent: boolean;
  medical_consent: boolean;
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
  photo_consent?: boolean;
  activity_consent?: boolean;
  medical_consent?: boolean;
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
}

export interface NewsletterSubscriberInsert {
  id?: string;
  email: string;
  subscribed_at?: string;
  source?: string;
}

export interface NewsletterSubscriberUpdate {
  id?: string;
  email?: string;
  subscribed_at?: string;
  source?: string;
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
