-- =============================================================================
-- FIX MISSING RLS POLICIES
-- Resolves 4 Supabase Security Advisor errors
-- Tables: newsletters, analytics_events, newsletter_clicks, print_ads
-- Also tightens overly permissive newsletter_images policy
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. NEWSLETTERS - Missing RLS entirely
-- Admin-only table (managed via /api/admin/newsletters)
-- -----------------------------------------------------------------------------
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to newsletters"
  ON newsletters FOR ALL
  USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 2. ANALYTICS_EVENTS - Missing RLS entirely
-- Written by service role from API routes, read by admin analytics
-- -----------------------------------------------------------------------------
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to analytics_events"
  ON analytics_events FOR ALL
  USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 3. NEWSLETTER_CLICKS - Missing RLS entirely
-- Written by service role from webhook/click tracking routes
-- -----------------------------------------------------------------------------
ALTER TABLE newsletter_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to newsletter_clicks"
  ON newsletter_clicks FOR ALL
  USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 4. PRINT_ADS - Missing RLS entirely
-- Admin-only table (managed via /api/admin/print-ads)
-- -----------------------------------------------------------------------------
ALTER TABLE print_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to print_ads"
  ON print_ads FOR ALL
  USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- 5. NEWSLETTER_IMAGES - Fix overly permissive policy
-- Current policy allows all operations for everyone (USING true)
-- Should be service_role only (managed via /api/admin/newsletters/images)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all for service role" ON newsletter_images;

CREATE POLICY "Service role has full access to newsletter_images"
  ON newsletter_images FOR ALL
  USING (auth.role() = 'service_role');
