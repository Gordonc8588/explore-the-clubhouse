-- Add parent address fields to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS parent_address_line1 TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS parent_address_line2 TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS parent_address_city TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS parent_address_postcode TEXT;
