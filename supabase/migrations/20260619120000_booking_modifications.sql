-- =============================================================================
-- BOOKING MODIFICATION SYSTEM — Phase 1 data model
-- Adds the durable money ledger + audit trail that admin booking modifications
-- (partial/goodwill/full refunds now; reschedule/upcharge later) depend on.
-- =============================================================================

-- --- bookings: refund ledger + discount snapshot + updated_at ----------------
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS discount_percent_applied INTEGER NOT NULL DEFAULT 0;  -- promo % actually paid (snapshot)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS amount_refunded_pence INTEGER NOT NULL DEFAULT 0;     -- cumulative refunded, in pence
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;                               -- last modification time

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_amount_refunded_check') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_amount_refunded_check CHECK (amount_refunded_pence >= 0);
  END IF;
END $$;

COMMENT ON COLUMN bookings.discount_percent_applied IS 'Promo discount percent snapshotted at checkout so modifications re-price against the rate the customer actually paid, not a drifted live promo. Existing rows default 0 (backfill from promo history if needed for older promo bookings).';
COMMENT ON COLUMN bookings.amount_refunded_pence IS 'Cumulative amount refunded against this booking (pence). Source of truth for the remaining refundable ceiling without a Stripe round-trip.';

--------------------------------------------------------------------------------
-- BOOKING_MODIFICATIONS
-- One row per admin modification. Triples as: (a) audit trail, (b) durable
-- holder for deferred upcharges (status='pending' until the parent pays),
-- (c) the partial-refund ledger.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_modifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    admin_actor TEXT,                              -- who performed it (admin email/identifier)
    modification_type TEXT NOT NULL,              -- cancel / refund / partial_refund / reschedule / add_days / reduce_days / full_week_convert / edit
    direction TEXT NOT NULL DEFAULT 'none',       -- charge / refund / none
    status TEXT NOT NULL DEFAULT 'pending',       -- pending / applied / refunded / expired / failed
    old_total_pence INTEGER,
    new_total_pence INTEGER,
    delta_pence INTEGER,                          -- new_total - old_total (signed)
    refund_amount_pence INTEGER,                  -- amount refunded by this modification (pence), if any
    reason TEXT,
    old_state JSONB,                              -- snapshot of prior club/option/total/days
    new_state JSONB,                              -- proposed/new club/option/total/days
    stripe_refund_id TEXT,
    stripe_checkout_session_id TEXT,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    applied_at TIMESTAMPTZ,

    CONSTRAINT booking_modifications_direction_check CHECK (direction IN ('charge', 'refund', 'none')),
    CONSTRAINT booking_modifications_status_check CHECK (status IN ('pending', 'applied', 'refunded', 'expired', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_booking_modifications_booking ON booking_modifications (booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_status ON booking_modifications (status);
CREATE INDEX IF NOT EXISTS idx_booking_modifications_created ON booking_modifications (created_at DESC);

COMMENT ON TABLE booking_modifications IS 'Audit log + deferred-upcharge holder + partial-refund ledger for admin booking modifications.';

--------------------------------------------------------------------------------
-- BOOKING_PAYMENTS
-- A booking can have more than one Stripe PaymentIntent once upcharges exist
-- (the original + each top-up). bookings.stripe_payment_intent_id only holds
-- the first, so a full refund must iterate this table.
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT NOT NULL,
    amount_pence INTEGER NOT NULL,
    kind TEXT NOT NULL DEFAULT 'original',        -- original / upcharge
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT booking_payments_kind_check CHECK (kind IN ('original', 'upcharge')),
    CONSTRAINT booking_payments_unique_intent UNIQUE (stripe_payment_intent_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_payments_booking ON booking_payments (booking_id);

COMMENT ON TABLE booking_payments IS 'Every Stripe PaymentIntent captured against a booking (original + upcharges), so a full refund covers them all.';

-- --- RLS ---------------------------------------------------------------------
-- These hold financial/audit data. Enable RLS with NO anon/authenticated
-- policies: access is only via the service role (which bypasses RLS), exactly
-- as the admin API + checkout/webhook already operate.
ALTER TABLE booking_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
