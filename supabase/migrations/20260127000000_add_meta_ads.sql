-- =============================================================================
-- META ADS MANAGER TABLES
-- Migration for Facebook/Instagram ads management feature
-- =============================================================================

-- -----------------------------------------------------------------------------
-- META AD IMAGES (Library of reusable ad images)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ad_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,                          -- Cloudinary URL
  public_id TEXT,                             -- Cloudinary public ID
  label TEXT,                                 -- User-friendly label
  description TEXT,                           -- Description for AI context
  tags TEXT[] DEFAULT '{}',                   -- Searchable tags
  width INTEGER,                              -- Image width in pixels
  height INTEGER,                             -- Image height in pixels
  aspect_ratio TEXT,                          -- e.g., '1:1', '4:5', '9:16'
  meta_image_hash TEXT,                       -- Meta's image hash after upload
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching by tags
CREATE INDEX IF NOT EXISTS idx_meta_ad_images_tags ON meta_ad_images USING GIN (tags);

COMMENT ON TABLE meta_ad_images IS 'Library of reusable images for Meta ads';

-- -----------------------------------------------------------------------------
-- META ADS (Main ad records)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                         -- Internal name for the ad
  club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,  -- Optional linked club
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,  -- Optional promo code

  -- Ad Content
  objective TEXT NOT NULL DEFAULT 'conversions',  -- awareness, traffic, conversions
  primary_text TEXT,                          -- Main ad copy (125 chars recommended)
  headline TEXT,                              -- Short headline (40 chars max)
  description TEXT,                           -- Optional description (30 chars max)
  cta_type TEXT DEFAULT 'LEARN_MORE',         -- LEARN_MORE, BOOK_NOW, SHOP_NOW, SIGN_UP, etc.
  cta_url TEXT,                               -- Destination URL
  image_urls TEXT[] DEFAULT '{}',             -- Cloudinary URLs for ad images

  -- Targeting
  targeting_preset TEXT,                      -- local_parents, school_holiday, retargeting, lookalike
  custom_targeting JSONB,                     -- Custom targeting configuration

  -- Budget & Schedule
  budget_type TEXT DEFAULT 'daily',           -- daily or lifetime
  budget_amount INTEGER,                      -- Amount in pence
  schedule_start TIMESTAMPTZ,                 -- When to start running
  schedule_end TIMESTAMPTZ,                   -- When to stop (nullable for ongoing)

  -- Status
  status TEXT DEFAULT 'draft',                -- draft, pending, active, paused, rejected, completed

  -- Meta API IDs (populated after publishing)
  meta_campaign_id TEXT,                      -- Meta API campaign ID
  meta_adset_id TEXT,                         -- Meta API ad set ID
  meta_ad_id TEXT,                            -- Meta API ad ID
  meta_review_status TEXT,                    -- pending, approved, rejected
  meta_rejection_reason TEXT,                 -- If rejected, the reason

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ                    -- When first published to Meta
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_meta_ads_status ON meta_ads(status);
CREATE INDEX IF NOT EXISTS idx_meta_ads_club_id ON meta_ads(club_id);
CREATE INDEX IF NOT EXISTS idx_meta_ads_created_at ON meta_ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meta_ads_meta_ad_id ON meta_ads(meta_ad_id);

COMMENT ON TABLE meta_ads IS 'Meta (Facebook/Instagram) ad campaigns managed from admin panel';

-- -----------------------------------------------------------------------------
-- META AD METRICS (Daily performance data)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta_ad_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES meta_ads(id) ON DELETE CASCADE,
  date DATE NOT NULL,                         -- Metrics date

  -- Performance Metrics
  impressions INTEGER DEFAULT 0,              -- Times ad was shown
  reach INTEGER DEFAULT 0,                    -- Unique people who saw ad
  clicks INTEGER DEFAULT 0,                   -- Link clicks
  spend INTEGER DEFAULT 0,                    -- Amount spent in pence
  conversions INTEGER DEFAULT 0,              -- Purchase events (via pixel)

  -- Calculated fields (stored for quick access)
  ctr DECIMAL(5,4),                           -- Click-through rate (clicks/impressions)
  cpc INTEGER,                                -- Cost per click in pence
  cpm INTEGER,                                -- Cost per 1000 impressions in pence

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per ad per day
  UNIQUE(ad_id, date)
);

-- Index for querying metrics by ad and date range
CREATE INDEX IF NOT EXISTS idx_meta_ad_metrics_ad_date ON meta_ad_metrics(ad_id, date DESC);

COMMENT ON TABLE meta_ad_metrics IS 'Daily performance metrics for Meta ads, synced from Meta Reporting API';

-- -----------------------------------------------------------------------------
-- TRIGGER: Update updated_at timestamp on meta_ads
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_meta_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_meta_ads_updated_at ON meta_ads;
CREATE TRIGGER trigger_meta_ads_updated_at
  BEFORE UPDATE ON meta_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_meta_ads_updated_at();

-- -----------------------------------------------------------------------------
-- RLS POLICIES (Admin-only access)
-- -----------------------------------------------------------------------------
ALTER TABLE meta_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ad_images ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for admin API routes)
CREATE POLICY "Service role has full access to meta_ads"
  ON meta_ads FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to meta_ad_metrics"
  ON meta_ad_metrics FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to meta_ad_images"
  ON meta_ad_images FOR ALL
  USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- Add attributed_meta_ad_id to bookings for ROI tracking
-- -----------------------------------------------------------------------------
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS attributed_meta_ad_id UUID REFERENCES meta_ads(id) ON DELETE SET NULL;

COMMENT ON COLUMN bookings.attributed_meta_ad_id IS 'Meta ad that drove this booking (via UTM tracking)';
