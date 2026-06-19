-- =============================================================================
-- BOOKING MODIFICATION SYSTEM — Phase 5 follow-up (adversarial-review fixes)
-- Race-proof, DB-enforced dedup for the reconciliation audit rows. The webhook
-- handlers do a fast in-app SELECT check, but only a UNIQUE constraint can stop a
-- concurrent Stripe redelivery from inserting a duplicate ledger/alert row. These
-- indexes turn each "best-effort" dedup into an at-most-once guarantee; the code
-- then tolerates the resulting unique-violation (SQLSTATE 23505) as a no-op.
-- =============================================================================

-- 1. One ledger row per Stripe refund id. Covers BOTH the out-of-band refund sync
--    (charge.refunded / refund.updated) AND every in-app refund row (each carries a
--    distinct stripe_refund_id), so a refund can never be double-recorded.
-- Pre-flight: this is the only new index over EXISTING data, so fail loudly with a
-- clear diagnostic (not an opaque 23505) if any duplicate stripe_refund_id already
-- exists — resolve those rows by hand, then re-run this migration.
DO $$
DECLARE v_dupes integer;
BEGIN
  SELECT COUNT(*) INTO v_dupes FROM (
    SELECT stripe_refund_id
    FROM booking_modifications
    WHERE stripe_refund_id IS NOT NULL
    GROUP BY stripe_refund_id
    HAVING COUNT(*) > 1
  ) d;
  IF v_dupes > 0 THEN
    RAISE EXCEPTION 'Cannot create uniq_booking_mod_refund_id: % duplicated stripe_refund_id value(s) in booking_modifications. Inspect with: SELECT stripe_refund_id, count(*) FROM booking_modifications WHERE stripe_refund_id IS NOT NULL GROUP BY 1 HAVING count(*)>1; then dedupe before re-running.', v_dupes;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_booking_mod_refund_id
  ON booking_modifications (stripe_refund_id)
  WHERE stripe_refund_id IS NOT NULL;

-- 2. One seating-failure alert/audit row per booking (public-checkout capacity guard).
CREATE UNIQUE INDEX IF NOT EXISTS one_seating_failed_per_booking
  ON booking_modifications (booking_id)
  WHERE modification_type = 'seating_failed';

-- 3. Dispute dedup keyed on the Stripe dispute id (one alert/audit row per dispute).
ALTER TABLE booking_modifications ADD COLUMN IF NOT EXISTS stripe_dispute_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_booking_mod_dispute_id
  ON booking_modifications (stripe_dispute_id)
  WHERE stripe_dispute_id IS NOT NULL;

COMMENT ON COLUMN booking_modifications.stripe_dispute_id IS 'Stripe dispute (chargeback) id for modification_type=dispute rows; uniquely deduped so a redelivered charge.dispute.created alerts the admin at most once.';
