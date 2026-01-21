-- Add ip_address column to contact_submissions table for rate limiting
-- The contact_submissions table already exists in the initial schema,
-- this migration adds the ip_address field for rate limiting tracking.

--------------------------------------------------------------------------------
-- ADD IP_ADDRESS COLUMN
-- Used to track submissions for rate limiting purposes.
--------------------------------------------------------------------------------
ALTER TABLE contact_submissions
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Add comment
COMMENT ON COLUMN contact_submissions.ip_address IS 'IP address of the submitter for rate limiting';
