-- Re-enable Thursday April 16 2026 for Easter Week 2 club
-- Previously set to is_available=false as emergency fix to block bookings.
-- Now handled properly by per-day capacity enforcement in the booking flow.
UPDATE club_days
SET is_available = TRUE
WHERE date = '2026-04-16'
  AND is_available = FALSE;
