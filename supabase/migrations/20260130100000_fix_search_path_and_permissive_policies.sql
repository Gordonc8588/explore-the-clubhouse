-- =============================================================================
-- FIX FUNCTION SEARCH PATH & PERMISSIVE RLS POLICIES
-- Resolves remaining Supabase Security Advisor warnings:
--   - 7x function_search_path_mutable
--   - 10x rls_policy_always_true
-- =============================================================================


-- =============================================================================
-- PART 1: FIX FUNCTION SEARCH PATHS
-- All functions need SET search_path = '' to prevent search path injection
-- =============================================================================

-- 1. update_newsletters_updated_at
CREATE OR REPLACE FUNCTION public.update_newsletters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 2. update_newsletter_images_updated_at
CREATE OR REPLACE FUNCTION public.update_newsletter_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 3. update_survey_session_updated_at
CREATE OR REPLACE FUNCTION public.update_survey_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 4. cleanup_old_analytics_events
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.analytics_events
  WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 5. update_meta_ads_updated_at
CREATE OR REPLACE FUNCTION public.update_meta_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 6. is_club_sold_out
CREATE OR REPLACE FUNCTION public.is_club_sold_out(club_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    has_availability BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.club_days cd
        CROSS JOIN LATERAL public.get_club_day_availability(cd.id) avail
        WHERE cd.club_id = club_uuid
          AND cd.is_available = TRUE
          AND (
              avail.morning_booked < avail.morning_capacity
              OR avail.afternoon_booked < avail.afternoon_capacity
          )
    ) INTO has_availability;

    RETURN NOT has_availability;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 7. get_club_day_availability
CREATE OR REPLACE FUNCTION public.get_club_day_availability(day_id UUID)
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
    FROM public.club_days cd
    LEFT JOIN public.booking_days bd ON bd.club_day_id = cd.id
    LEFT JOIN public.bookings b ON b.id = bd.booking_id AND b.status IN ('paid', 'complete')
    WHERE cd.id = day_id
    GROUP BY cd.id, cd.morning_capacity, cd.afternoon_capacity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';


-- =============================================================================
-- PART 2: FIX PERMISSIVE RLS POLICIES
-- Remove unnecessary public INSERT policies where code uses service role,
-- and tighten remaining policies with basic validation.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- BOOKINGS: Code uses createAdminClient (service role) for inserts.
-- Public INSERT policy is unnecessary.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;

-- -----------------------------------------------------------------------------
-- CHILDREN: Code uses createAdminClient (service role) for inserts.
-- Public INSERT policy is unnecessary.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can create children" ON children;

-- -----------------------------------------------------------------------------
-- WAITLIST: No API route currently uses this table, but keep INSERT
-- scoped to anon with basic validation for future use.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can join waitlist" ON waitlist;

CREATE POLICY "Anon can join waitlist"
  ON waitlist FOR INSERT
  TO anon
  WITH CHECK (
    parent_name IS NOT NULL
    AND parent_email IS NOT NULL
    AND parent_phone IS NOT NULL
    AND num_children > 0
    AND status = 'waiting'
  );

-- -----------------------------------------------------------------------------
-- CONTACT_SUBMISSIONS: Code uses anon key (createClient from server.ts).
-- Keep INSERT but scope to anon with basic validation.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can submit contact forms" ON contact_submissions;

CREATE POLICY "Anon can submit contact forms"
  ON contact_submissions FOR INSERT
  TO anon
  WITH CHECK (
    name IS NOT NULL
    AND email IS NOT NULL
    AND message IS NOT NULL
    AND status = 'new'
  );

-- -----------------------------------------------------------------------------
-- NEWSLETTER_SUBSCRIBERS: Code uses anon key (createClient from server.ts).
-- Keep INSERT but scope to anon with basic validation.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON newsletter_subscribers;

CREATE POLICY "Anon can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon
  WITH CHECK (email IS NOT NULL);

-- -----------------------------------------------------------------------------
-- SURVEY_SESSIONS: Code uses createAdminClient (service role) for all ops.
-- Remove all anon and authenticated policies (service role bypasses RLS).
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public to create survey sessions" ON survey_sessions;
DROP POLICY IF EXISTS "Allow public to update survey sessions" ON survey_sessions;
DROP POLICY IF EXISTS "Allow authenticated to read all survey sessions" ON survey_sessions;

-- Keep the SELECT policy for anon (not flagged, but not needed - clean up)
DROP POLICY IF EXISTS "Allow public to read own survey session" ON survey_sessions;

-- Only service role needs access (already bypasses RLS)
CREATE POLICY "Service role has full access to survey_sessions"
  ON survey_sessions FOR ALL
  USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- SURVEY_RESPONSES: Code uses createAdminClient (service role) for all ops.
-- Remove all anon and authenticated policies.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public to create survey responses" ON survey_responses;
DROP POLICY IF EXISTS "Allow authenticated to read all survey responses" ON survey_responses;

-- Only service role needs access (already bypasses RLS)
CREATE POLICY "Service role has full access to survey_responses"
  ON survey_responses FOR ALL
  USING (auth.role() = 'service_role');
