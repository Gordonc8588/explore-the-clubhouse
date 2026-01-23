-- Add EASTER10 promo code for Easter 2026
-- Note: Code is stored in uppercase for consistency
INSERT INTO promo_codes (
  code,
  discount_percent,
  valid_from,
  valid_until,
  max_uses,
  times_used,
  club_id,
  is_active
) VALUES (
  'EASTER10',
  10,
  '2026-01-01T00:00:00Z',
  '2026-04-30T23:59:59Z',
  100,
  0,
  NULL,  -- Valid for all clubs
  true
)
ON CONFLICT (code) DO UPDATE
SET
  discount_percent = EXCLUDED.discount_percent,
  valid_from = EXCLUDED.valid_from,
  valid_until = EXCLUDED.valid_until,
  max_uses = EXCLUDED.max_uses,
  is_active = EXCLUDED.is_active;
