-- Add bookings_open column to clubs table
-- This controls whether bookings are available for each club
-- Defaults to false so new clubs don't accidentally accept bookings

ALTER TABLE clubs ADD COLUMN bookings_open BOOLEAN NOT NULL DEFAULT false;

-- Set any existing clubs to bookings_open = false (safe default)
UPDATE clubs SET bookings_open = false;
