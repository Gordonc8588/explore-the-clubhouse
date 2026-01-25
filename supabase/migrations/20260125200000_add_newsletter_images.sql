-- Newsletter Images Library
-- Stores uploaded images for reuse across newsletters

CREATE TABLE IF NOT EXISTS newsletter_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  public_id TEXT, -- Cloudinary public ID for transformations
  label TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching
CREATE INDEX IF NOT EXISTS idx_newsletter_images_created_at ON newsletter_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_images_tags ON newsletter_images USING GIN(tags);

-- Enable RLS
ALTER TABLE newsletter_images ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (admin only via API)
CREATE POLICY "Allow all for service role" ON newsletter_images
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_newsletter_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER newsletter_images_updated_at
  BEFORE UPDATE ON newsletter_images
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_images_updated_at();
