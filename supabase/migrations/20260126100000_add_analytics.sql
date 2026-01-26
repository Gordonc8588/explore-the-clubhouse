-- Analytics system migration
-- Adds UTM tracking to bookings and first-party analytics events table

-- UTM columns on bookings for attribution tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS landing_page TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS attributed_newsletter_id UUID REFERENCES newsletters(id);

-- First-party analytics events (90-day retention)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  session_id TEXT,
  page_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created ON analytics_events(event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign ON analytics_events(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

-- Newsletter click tracking for attribution
CREATE TABLE IF NOT EXISTS newsletter_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES newsletters(id),
  subscriber_email TEXT NOT NULL,
  link_url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_clicks_newsletter ON newsletter_clicks(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_clicks_email ON newsletter_clicks(subscriber_email);

-- Function to clean up old analytics events (90-day retention)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analytics_events
  WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comment explaining the cleanup function
COMMENT ON FUNCTION cleanup_old_analytics_events() IS
'Deletes analytics events older than 90 days. Call periodically via cron or Vercel scheduled function.';
