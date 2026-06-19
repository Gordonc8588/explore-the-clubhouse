-- =============================================================================
-- BOOKING MODIFICATION SYSTEM — Phase 5 (reconciliation hardening)
-- Closes the LAST overbooking hole: the public Stripe checkout webhook used to
-- INSERT booking_days with no lock and no capacity check, so two parents paying
-- for the last seat in the same window could both be seated (over staff ratio).
--
-- create_initial_booking_days() brings that path under the SAME locked,
-- self-excluding capacity guard the admin RPC (apply_booking_modification) uses:
--   * locks the booking row + the target club_days (FOR UPDATE) to serialise
--     concurrent paid checkouts for the same day,
--   * capacity-checks each day EXCLUDING this booking's own seats,
--   * raises check_violation (SQLSTATE 23514) if any day is over capacity, so the
--     webhook can apply the owner's "refuse + alert admin" policy (no days inserted,
--     booking left paid-but-unseated, admin emailed to resolve), and
--   * is IDEMPOTENT — if the booking already has days (Stripe redelivery), it is a
--     no-op, which also closes the latent double-insert-on-redelivery bug.
--
-- NOTE: availability (is_available) is intentionally NOT re-checked here. The
-- public booking form already gated availability at selection time; this guard is
-- only about capacity/ratio. Full-week bookings legitimately span days flagged
-- unavailable for standalone booking.
--
-- p_days is a JSONB array: [{ "club_day_id": "<uuid>", "time_slot": "full_day" }, ...]
-- Returns TRUE when the booking is seated (freshly inserted or already had days).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_initial_booking_days(
  p_booking_id uuid,
  p_club_id uuid,
  p_days jsonb,
  p_num_children integer
) RETURNS boolean AS $$
DECLARE
  v_day jsonb;
  v_club_day_id uuid;
  v_slot text;
  v_cap_morning integer;
  v_cap_afternoon integer;
  v_used_morning integer;
  v_used_afternoon integer;
  v_date date;
  v_existing integer;
BEGIN
  IF p_num_children < 1 THEN
    RAISE EXCEPTION 'num_children must be at least 1' USING ERRCODE = 'check_violation';
  END IF;
  IF p_days IS NULL OR jsonb_array_length(p_days) < 1 THEN
    RAISE EXCEPTION 'At least one day is required' USING ERRCODE = 'check_violation';
  END IF;

  -- Serialise concurrent webhook deliveries for the same booking.
  PERFORM 1 FROM public.bookings WHERE id = p_booking_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking % not found', p_booking_id;
  END IF;

  -- Idempotent: if days already exist (redelivery), this is a no-op.
  SELECT COUNT(*) INTO v_existing FROM public.booking_days WHERE booking_id = p_booking_id;
  IF v_existing > 0 THEN
    RETURN TRUE;
  END IF;

  -- Lock the distinct target club_days up front (best-effort ordered) so capacity
  -- decisions are serialised across concurrent paid checkouts. A deadlock (if any)
  -- aborts the transaction cleanly with no overbooking.
  PERFORM 1
  FROM public.club_days
  WHERE id IN (
    SELECT DISTINCT (elem->>'club_day_id')::uuid
    FROM jsonb_array_elements(p_days) AS elem
  )
  ORDER BY id
  FOR UPDATE;

  -- Validate each target day + capacity-check EXCLUDING this booking's own seats.
  FOR v_day IN SELECT * FROM jsonb_array_elements(p_days)
  LOOP
    v_club_day_id := (v_day->>'club_day_id')::uuid;
    v_slot := v_day->>'time_slot';

    IF v_slot NOT IN ('full_day', 'morning', 'afternoon') THEN
      RAISE EXCEPTION 'Invalid time_slot: %', v_slot USING ERRCODE = 'check_violation';
    END IF;

    SELECT morning_capacity, afternoon_capacity, date
      INTO v_cap_morning, v_cap_afternoon, v_date
    FROM public.club_days
    WHERE id = v_club_day_id AND club_id = p_club_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Day % is not part of the selected club', v_club_day_id
        USING ERRCODE = 'check_violation';
    END IF;

    SELECT
      COALESCE(SUM(CASE WHEN bd.time_slot IN ('full_day', 'morning')   THEN b.num_children ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN bd.time_slot IN ('full_day', 'afternoon') THEN b.num_children ELSE 0 END), 0)
      INTO v_used_morning, v_used_afternoon
    FROM public.booking_days bd
    JOIN public.bookings b
      ON b.id = bd.booking_id
     AND b.status IN ('paid', 'complete')
     AND b.id <> p_booking_id
    WHERE bd.club_day_id = v_club_day_id;

    IF v_slot IN ('full_day', 'morning') AND v_used_morning + p_num_children > v_cap_morning THEN
      RAISE EXCEPTION 'Not enough morning capacity on %', v_date USING ERRCODE = 'check_violation';
    END IF;
    IF v_slot IN ('full_day', 'afternoon') AND v_used_afternoon + p_num_children > v_cap_afternoon THEN
      RAISE EXCEPTION 'Not enough afternoon capacity on %', v_date USING ERRCODE = 'check_violation';
    END IF;
  END LOOP;

  -- All days fit — insert the whole set in this transaction.
  FOR v_day IN SELECT * FROM jsonb_array_elements(p_days)
  LOOP
    INSERT INTO public.booking_days (booking_id, club_day_id, time_slot)
    VALUES (p_booking_id, (v_day->>'club_day_id')::uuid, v_day->>'time_slot');
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
