-- Add missing columns to meta_ads table for publishing feature
-- Migration: 20260127120000_add_meta_ads_columns.sql

-- Add meta_creative_id for storing the creative ID from Meta
ALTER TABLE meta_ads ADD COLUMN IF NOT EXISTS meta_creative_id TEXT;

-- Add meta_image_hash for storing the image hash from Meta
ALTER TABLE meta_ads ADD COLUMN IF NOT EXISTS meta_image_hash TEXT;

-- Add comment for documentation
COMMENT ON COLUMN meta_ads.meta_creative_id IS 'The creative ID returned from Meta API when ad is published';
COMMENT ON COLUMN meta_ads.meta_image_hash IS 'The image hash returned from Meta API after image upload';
