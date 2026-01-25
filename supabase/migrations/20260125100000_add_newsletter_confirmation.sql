-- Add double opt-in confirmation fields to newsletter_subscribers table
-- This enables email verification before subscribers can receive newsletters

-- Add confirmation token (unique, used in verification link)
ALTER TABLE newsletter_subscribers
ADD COLUMN confirmation_token TEXT UNIQUE;

-- Add confirmed_at timestamp (NULL until confirmed)
ALTER TABLE newsletter_subscribers
ADD COLUMN confirmed_at TIMESTAMPTZ;

-- Create index for fast token lookups
CREATE INDEX idx_newsletter_confirmation_token
ON newsletter_subscribers(confirmation_token)
WHERE confirmation_token IS NOT NULL;

-- Create index for finding confirmed subscribers
CREATE INDEX idx_newsletter_confirmed
ON newsletter_subscribers(confirmed_at)
WHERE confirmed_at IS NOT NULL;
