-- Print Ads table for generating newspaper/magazine advertisements
-- Supports magazine quarter-page and newsletter/digital ad formats

-- Create enums for print ad status and type
CREATE TYPE print_ad_status AS ENUM ('draft', 'final');
CREATE TYPE print_ad_type AS ENUM ('newsletter_digital', 'magazine_quarter_page');

-- Create print_ads table
CREATE TABLE print_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  name VARCHAR(255) NOT NULL,
  ad_type print_ad_type NOT NULL DEFAULT 'magazine_quarter_page',
  headline VARCHAR(100),
  body_copy TEXT,
  cta_text VARCHAR(50),

  -- Images
  main_image_url TEXT,
  flyer_image_url TEXT,

  -- Club association
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,

  -- Cached club data for historical reference
  club_data JSONB,

  -- Status
  status print_ad_status NOT NULL DEFAULT 'draft',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for listing by status and recency
CREATE INDEX idx_print_ads_status_created ON print_ads(status, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE print_ads IS 'Print advertisements for newspapers and magazines';
COMMENT ON COLUMN print_ads.club_data IS 'Cached club data: {name, dates, age_range, location, prices}';
COMMENT ON COLUMN print_ads.body_copy IS '80+ word editorial copy in third person';
