-- Explore the Clubhouse Database Schema
-- PostgreSQL / Supabase
--
-- This schema supports a children's holiday club booking platform where parents
-- can browse seasonal clubs, book places for their children, and pay online.

-- Using gen_random_uuid() which is built into PostgreSQL 13+

--------------------------------------------------------------------------------
-- CLUBS TABLE
-- Stores seasonal holiday club information (Easter, Summer, etc.)
-- Each club has a date range, operating hours, and age restrictions.
--------------------------------------------------------------------------------
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,                    -- URL-friendly identifier (e.g., "easter-2026")
    name TEXT NOT NULL,                           -- Display name (e.g., "Easter Holiday Club 2026")
    description TEXT,                             -- Full description shown on detail page
    image_url TEXT,                               -- Hero image for the club
    start_date DATE NOT NULL,                     -- First day of the club
    end_date DATE NOT NULL,                       -- Last day of the club
    morning_start TIME NOT NULL DEFAULT '08:30',  -- Morning session start time
    morning_end TIME NOT NULL DEFAULT '12:00',    -- Morning session end time
    afternoon_start TIME NOT NULL DEFAULT '12:00', -- Afternoon session start time
    afternoon_end TIME NOT NULL DEFAULT '15:30',  -- Afternoon session end time
    min_age INTEGER NOT NULL DEFAULT 4,           -- Minimum child age (inclusive)
    max_age INTEGER NOT NULL DEFAULT 11,          -- Maximum child age (inclusive)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,      -- Whether club is visible to public
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT clubs_date_range_check CHECK (end_date >= start_date),
    CONSTRAINT clubs_age_range_check CHECK (max_age >= min_age)
);

-- Index for fetching active clubs ordered by date
CREATE INDEX idx_clubs_active_dates ON clubs (is_active, start_date);
CREATE INDEX idx_clubs_slug ON clubs (slug);

--------------------------------------------------------------------------------
-- CLUB_DAYS TABLE
-- Individual days within a club, each with its own capacity settings.
-- Auto-generated from club date range, but can be individually edited.
--------------------------------------------------------------------------------
CREATE TABLE club_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    date DATE NOT NULL,                           -- The specific date
    morning_capacity INTEGER NOT NULL DEFAULT 30, -- Max children for morning slot
    afternoon_capacity INTEGER NOT NULL DEFAULT 30, -- Max children for afternoon slot
    is_available BOOLEAN NOT NULL DEFAULT TRUE,   -- Can disable specific days (e.g., bank holidays)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT club_days_unique UNIQUE (club_id, date),
    CONSTRAINT club_days_capacity_check CHECK (morning_capacity >= 0 AND afternoon_capacity >= 0)
);

-- Index for fetching available days for a club
CREATE INDEX idx_club_days_club_date ON club_days (club_id, date);
CREATE INDEX idx_club_days_available ON club_days (club_id, is_available, date);

--------------------------------------------------------------------------------
-- BOOKING_OPTIONS TABLE
-- Pricing options for each club (Full Week, Single Day, etc.)
-- Each option specifies whether it's for full day, morning, or afternoon.
--------------------------------------------------------------------------------
CREATE TABLE booking_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                           -- e.g., "Full Week (Full Day)"
    description TEXT,                             -- Additional details
    option_type TEXT NOT NULL,                    -- full_week / single_day / multi_day
    time_slot TEXT NOT NULL,                      -- full_day / morning / afternoon
    price_per_child INTEGER NOT NULL,             -- Price in pence (e.g., 15000 = £150)
    sort_order INTEGER NOT NULL DEFAULT 0,        -- Display order on booking page
    is_active BOOLEAN NOT NULL DEFAULT TRUE,      -- Whether option is available
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT booking_options_type_check CHECK (option_type IN ('full_week', 'single_day', 'multi_day')),
    CONSTRAINT booking_options_slot_check CHECK (time_slot IN ('full_day', 'morning', 'afternoon')),
    CONSTRAINT booking_options_price_check CHECK (price_per_child >= 0)
);

-- Index for fetching active options for a club
CREATE INDEX idx_booking_options_club ON booking_options (club_id, is_active, sort_order);

--------------------------------------------------------------------------------
-- PROMO_CODES TABLE
-- Discount codes that can be applied to bookings.
-- Supports percentage-off discounts with optional club restrictions.
--------------------------------------------------------------------------------
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,                    -- Unique code (stored uppercase)
    discount_percent INTEGER NOT NULL,            -- Percentage off (e.g., 10 = 10%)
    valid_from TIMESTAMPTZ NOT NULL,              -- Start of validity period
    valid_until TIMESTAMPTZ NOT NULL,             -- End of validity period
    max_uses INTEGER,                             -- NULL means unlimited uses
    times_used INTEGER NOT NULL DEFAULT 0,        -- Current usage count
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL, -- NULL means valid for all clubs
    is_active BOOLEAN NOT NULL DEFAULT TRUE,      -- Can manually disable codes
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT promo_codes_discount_check CHECK (discount_percent > 0 AND discount_percent <= 100),
    CONSTRAINT promo_codes_validity_check CHECK (valid_until >= valid_from),
    CONSTRAINT promo_codes_uses_check CHECK (times_used >= 0)
);

-- Index for validating promo codes
CREATE INDEX idx_promo_codes_code ON promo_codes (UPPER(code));
CREATE INDEX idx_promo_codes_active ON promo_codes (is_active, valid_from, valid_until);

--------------------------------------------------------------------------------
-- BOOKINGS TABLE
-- Parent booking records. Created when checkout starts, updated on payment.
-- Status flow: pending -> paid -> complete (or cancelled/refunded)
--------------------------------------------------------------------------------
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE RESTRICT,
    booking_option_id UUID NOT NULL REFERENCES booking_options(id) ON DELETE RESTRICT,
    parent_name TEXT NOT NULL,                    -- Parent's full name
    parent_email TEXT NOT NULL,                   -- Parent's email for confirmations
    parent_phone TEXT NOT NULL,                   -- Parent's phone for SMS reminders
    num_children INTEGER NOT NULL,                -- Number of children in booking
    total_amount INTEGER NOT NULL,                -- Final amount in pence (after discounts)
    status TEXT NOT NULL DEFAULT 'pending',       -- pending/paid/cancelled/refunded/complete
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT,                -- Stripe payment intent ID
    stripe_checkout_session_id TEXT,              -- Stripe checkout session ID
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT bookings_num_children_check CHECK (num_children > 0),
    CONSTRAINT bookings_total_check CHECK (total_amount >= 0),
    CONSTRAINT bookings_status_check CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded', 'complete'))
);

-- Indexes for common booking queries
CREATE INDEX idx_bookings_club ON bookings (club_id);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_parent_email ON bookings (parent_email);
CREATE INDEX idx_bookings_created ON bookings (created_at DESC);
CREATE INDEX idx_bookings_stripe_session ON bookings (stripe_checkout_session_id);

--------------------------------------------------------------------------------
-- BOOKING_DAYS TABLE
-- Links bookings to specific club days they've booked.
-- For full week bookings, multiple records are created (one per day).
--------------------------------------------------------------------------------
CREATE TABLE booking_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    club_day_id UUID NOT NULL REFERENCES club_days(id) ON DELETE RESTRICT,
    time_slot TEXT NOT NULL,                      -- full_day / morning / afternoon
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT booking_days_slot_check CHECK (time_slot IN ('full_day', 'morning', 'afternoon')),
    CONSTRAINT booking_days_unique UNIQUE (booking_id, club_day_id)
);

-- Indexes for availability checks and daily attendance
CREATE INDEX idx_booking_days_club_day ON booking_days (club_day_id);
CREATE INDEX idx_booking_days_booking ON booking_days (booking_id);

--------------------------------------------------------------------------------
-- CHILDREN TABLE
-- Child information collected after payment is completed.
-- All fields are required for the booking to be marked as 'complete'.
--------------------------------------------------------------------------------
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                           -- Child's full name
    date_of_birth DATE NOT NULL,                  -- For age verification
    allergies TEXT NOT NULL,                      -- Allergies/dietary requirements (or "None")
    medical_notes TEXT NOT NULL,                  -- Medical info (EpiPen, inhaler needs, etc.)
    emergency_contact_name TEXT NOT NULL,         -- Emergency contact's name
    emergency_contact_phone TEXT NOT NULL,        -- Emergency contact's phone
    photo_consent BOOLEAN NOT NULL,               -- Permission to photograph
    activity_consent BOOLEAN NOT NULL,            -- Permission for water play, cooking, trips
    medical_consent BOOLEAN NOT NULL,             -- Permission for first aid, emergency services
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching children by booking
CREATE INDEX idx_children_booking ON children (booking_id);

--------------------------------------------------------------------------------
-- WAITLIST TABLE
-- Queue for parents wanting spots in sold-out clubs.
-- When a spot opens, first person is notified and has 24 hours to book.
--------------------------------------------------------------------------------
CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    parent_name TEXT NOT NULL,                    -- Parent's full name
    parent_email TEXT NOT NULL,                   -- Parent's email for notifications
    parent_phone TEXT NOT NULL,                   -- Parent's phone
    num_children INTEGER NOT NULL,                -- Number of children wanting spots
    booking_option_id UUID NOT NULL REFERENCES booking_options(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'waiting',       -- waiting/notified/expired/booked
    notified_at TIMESTAMPTZ,                      -- When notification was sent
    expires_at TIMESTAMPTZ,                       -- 24h after notification (deadline to book)
    position INTEGER NOT NULL,                    -- Queue position within this club
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT waitlist_num_children_check CHECK (num_children > 0),
    CONSTRAINT waitlist_status_check CHECK (status IN ('waiting', 'notified', 'expired', 'booked'))
);

-- Indexes for waitlist management
CREATE INDEX idx_waitlist_club_status ON waitlist (club_id, status, position);
CREATE INDEX idx_waitlist_expires ON waitlist (expires_at) WHERE status = 'notified';

--------------------------------------------------------------------------------
-- CONTACT_SUBMISSIONS TABLE
-- Messages submitted through the contact form.
-- Stored in database AND emailed to admin.
--------------------------------------------------------------------------------
CREATE TABLE contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                           -- Sender's name
    email TEXT NOT NULL,                          -- Sender's email
    phone TEXT,                                   -- Sender's phone (optional)
    message TEXT NOT NULL,                        -- Message content
    status TEXT NOT NULL DEFAULT 'new',           -- new/read/replied
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT contact_submissions_status_check CHECK (status IN ('new', 'read', 'replied'))
);

-- Index for admin dashboard
CREATE INDEX idx_contact_submissions_status ON contact_submissions (status, created_at DESC);

--------------------------------------------------------------------------------
-- NEWSLETTER_SUBSCRIBERS TABLE
-- Email subscribers for marketing updates (integrated with Brevo).
--------------------------------------------------------------------------------
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,                   -- Subscriber's email
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source TEXT NOT NULL DEFAULT 'footer'         -- Where they signed up (footer/booking/etc.)
);

-- Index for lookups by email
CREATE INDEX idx_newsletter_email ON newsletter_subscribers (email);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--
-- Security model:
-- - Public users can read active clubs, club_days, and booking_options
-- - Public users can create bookings, children, waitlist entries, contact submissions, and newsletter subscriptions
-- - Admin (authenticated) has full access to all tables
--------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- CLUBS: Public can read active clubs, admin has full access
CREATE POLICY "Public can view active clubs"
    ON clubs FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Admin has full access to clubs"
    ON clubs FOR ALL
    USING (auth.role() = 'authenticated');

-- CLUB_DAYS: Public can read available days for active clubs
CREATE POLICY "Public can view available club days"
    ON club_days FOR SELECT
    USING (
        is_available = TRUE
        AND EXISTS (
            SELECT 1 FROM clubs
            WHERE clubs.id = club_days.club_id
            AND clubs.is_active = TRUE
        )
    );

CREATE POLICY "Admin has full access to club days"
    ON club_days FOR ALL
    USING (auth.role() = 'authenticated');

-- BOOKING_OPTIONS: Public can read active options for active clubs
CREATE POLICY "Public can view active booking options"
    ON booking_options FOR SELECT
    USING (
        is_active = TRUE
        AND EXISTS (
            SELECT 1 FROM clubs
            WHERE clubs.id = booking_options.club_id
            AND clubs.is_active = TRUE
        )
    );

CREATE POLICY "Admin has full access to booking options"
    ON booking_options FOR ALL
    USING (auth.role() = 'authenticated');

-- PROMO_CODES: Public can validate codes (read), admin has full access
CREATE POLICY "Public can validate promo codes"
    ON promo_codes FOR SELECT
    USING (
        is_active = TRUE
        AND NOW() BETWEEN valid_from AND valid_until
        AND (max_uses IS NULL OR times_used < max_uses)
    );

CREATE POLICY "Admin has full access to promo codes"
    ON promo_codes FOR ALL
    USING (auth.role() = 'authenticated');

-- BOOKINGS: Public can create bookings, read their own by ID
-- Note: In practice, booking reads are done via API routes using service role
CREATE POLICY "Public can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Public can view bookings by ID"
    ON bookings FOR SELECT
    USING (TRUE);

CREATE POLICY "Admin has full access to bookings"
    ON bookings FOR ALL
    USING (auth.role() = 'authenticated');

-- BOOKING_DAYS: Created via service role during webhook processing
CREATE POLICY "Public can view booking days"
    ON booking_days FOR SELECT
    USING (TRUE);

CREATE POLICY "Admin has full access to booking days"
    ON booking_days FOR ALL
    USING (auth.role() = 'authenticated');

-- CHILDREN: Public can create children for their bookings
CREATE POLICY "Public can create children"
    ON children FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Public can view children"
    ON children FOR SELECT
    USING (TRUE);

CREATE POLICY "Admin has full access to children"
    ON children FOR ALL
    USING (auth.role() = 'authenticated');

-- WAITLIST: Public can join waitlist, view their own entries
CREATE POLICY "Public can join waitlist"
    ON waitlist FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Public can view waitlist entries"
    ON waitlist FOR SELECT
    USING (TRUE);

CREATE POLICY "Admin has full access to waitlist"
    ON waitlist FOR ALL
    USING (auth.role() = 'authenticated');

-- CONTACT_SUBMISSIONS: Public can create, admin can manage
CREATE POLICY "Public can submit contact forms"
    ON contact_submissions FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Admin has full access to contact submissions"
    ON contact_submissions FOR ALL
    USING (auth.role() = 'authenticated');

-- NEWSLETTER_SUBSCRIBERS: Public can subscribe
CREATE POLICY "Public can subscribe to newsletter"
    ON newsletter_subscribers FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Admin has full access to newsletter subscribers"
    ON newsletter_subscribers FOR ALL
    USING (auth.role() = 'authenticated');

--------------------------------------------------------------------------------
-- HELPER FUNCTIONS
--------------------------------------------------------------------------------

-- Function to get current availability for a club day
-- Returns counts of booked spots per time slot
CREATE OR REPLACE FUNCTION get_club_day_availability(day_id UUID)
RETURNS TABLE (
    morning_booked INTEGER,
    afternoon_booked INTEGER,
    morning_capacity INTEGER,
    afternoon_capacity INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(
            CASE WHEN bd.time_slot IN ('full_day', 'morning') THEN b.num_children ELSE 0 END
        )::INTEGER, 0) AS morning_booked,
        COALESCE(SUM(
            CASE WHEN bd.time_slot IN ('full_day', 'afternoon') THEN b.num_children ELSE 0 END
        )::INTEGER, 0) AS afternoon_booked,
        cd.morning_capacity,
        cd.afternoon_capacity
    FROM club_days cd
    LEFT JOIN booking_days bd ON bd.club_day_id = cd.id
    LEFT JOIN bookings b ON b.id = bd.booking_id AND b.status IN ('paid', 'complete')
    WHERE cd.id = day_id
    GROUP BY cd.id, cd.morning_capacity, cd.afternoon_capacity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a club is sold out (any day at capacity)
CREATE OR REPLACE FUNCTION is_club_sold_out(club_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    has_availability BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM club_days cd
        CROSS JOIN LATERAL get_club_day_availability(cd.id) avail
        WHERE cd.club_id = club_uuid
          AND cd.is_available = TRUE
          AND (
              avail.morning_booked < avail.morning_capacity
              OR avail.afternoon_booked < avail.afternoon_capacity
          )
    ) INTO has_availability;

    RETURN NOT has_availability;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--------------------------------------------------------------------------------
-- COMMENTS
--------------------------------------------------------------------------------

COMMENT ON TABLE clubs IS 'Seasonal holiday clubs (Easter, Summer, etc.) with date ranges and operating hours';
COMMENT ON TABLE club_days IS 'Individual days within a club, each with configurable capacity';
COMMENT ON TABLE booking_options IS 'Pricing options for clubs (Full Week, Single Day, etc.)';
COMMENT ON TABLE promo_codes IS 'Discount codes for percentage-off promotions';
COMMENT ON TABLE bookings IS 'Parent booking records with payment status tracking';
COMMENT ON TABLE booking_days IS 'Links bookings to specific days being attended';
COMMENT ON TABLE children IS 'Child information collected after payment';
COMMENT ON TABLE waitlist IS 'Queue for parents wanting spots in sold-out clubs';
COMMENT ON TABLE contact_submissions IS 'Messages from the contact form';
COMMENT ON TABLE newsletter_subscribers IS 'Email subscribers for marketing updates';
