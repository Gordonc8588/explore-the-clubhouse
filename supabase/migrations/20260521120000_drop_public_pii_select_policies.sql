-- Security fix: remove public (anon) SELECT access to PII tables.
--
-- bookings, booking_days, children and waitlist each had a
-- `FOR SELECT USING (TRUE)` policy, which let anyone holding the public anon
-- key (shipped in the browser bundle) read EVERY row — full parent contact
-- details plus children's names, DOB, allergies, medical notes and emergency
-- contacts, with no booking ID required.
--
-- All application reads of these tables use the service-role client
-- (createAdminClient), which bypasses RLS, so removing the anon SELECT policies
-- does not affect functionality. RLS stays enabled with no permissive SELECT
-- policy, so the anon role can no longer read these tables at all. The
-- "Admin has full access" (authenticated) and service-role paths are unchanged.

DROP POLICY IF EXISTS "Public can view bookings by ID" ON bookings;
DROP POLICY IF EXISTS "Public can view booking days" ON booking_days;
DROP POLICY IF EXISTS "Public can view children" ON children;
DROP POLICY IF EXISTS "Public can view waitlist entries" ON waitlist;
