-- =============================================================================
-- BOOKING MODIFICATION SYSTEM — Phase 2
-- Atomic booking-modification primitive. Replaces the whole booking_days set,
-- updates the booking aggregate, and writes the audit row in ONE transaction,
-- with a locked, self-excluding capacity re-check.
--
-- Concurrency scope: this serialises booking modifications that go THROUGH this
-- RPC (admin edits) against each other. The public checkout path still commits
-- booking_days in the Stripe webhook WITHOUT this lock and WITHOUT a capacity
-- check, so a concurrent public booking can still overbook a day until that path
-- is brought under a shared DB-level capacity guard (tracked as a later phase).
--
-- p_days is a JSONB array: [{ "club_day_id": "<uuid>", "time_slot": "full_day" }, ...]
-- Returns the booking_modifications.id written for the change.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.apply_booking_modification(
  p_booking_id uuid,
  p_new_club_id uuid,
  p_new_option_id uuid,
  p_new_children integer,
  p_new_total integer,
  p_days jsonb,
  p_modification_type text DEFAULT 'edit',
  p_admin_actor text DEFAULT NULL,
  p_direction text DEFAULT 'none',
  p_delta_pence integer DEFAULT 0,
  p_reason text DEFAULT NULL,
  p_old_state jsonb DEFAULT NULL,
  p_new_state jsonb DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_old_total integer;
  v_day jsonb;
  v_club_day_id uuid;
  v_slot text;
  v_cap_morning integer;
  v_cap_afternoon integer;
  v_used_morning integer;
  v_used_afternoon integer;
  v_date date;
  v_is_available boolean;
  v_existing uuid[];
  v_mod_id uuid;
BEGIN
  IF p_new_children < 1 THEN
    RAISE EXCEPTION 'num_children must be at least 1' USING ERRCODE = 'check_violation';
  END IF;
  IF p_days IS NULL OR jsonb_array_length(p_days) < 1 THEN
    RAISE EXCEPTION 'At least one day is required' USING ERRCODE = 'check_violation';
  END IF;

  -- Serialise concurrent modifications of the same booking.
  SELECT total_amount INTO v_old_total
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking % not found', p_booking_id;
  END IF;

  -- Lock the distinct target club_days up front (best-effort ordered) to serialise
  -- capacity decisions across concurrent admin modifications. ORDER BY is not a
  -- hard lock-ordering guarantee, but a deadlock (if any) aborts the transaction
  -- cleanly with no overbooking and the caller surfaces the error.
  PERFORM 1
  FROM public.club_days
  WHERE id IN (
    SELECT DISTINCT (elem->>'club_day_id')::uuid
    FROM jsonb_array_elements(p_days) AS elem
  )
  ORDER BY id
  FOR UPDATE;

  -- Snapshot the booking's CURRENT days. Kept days keep seats they already hold,
  -- so they must NOT be re-gated on is_available — full-week bookings legitimately
  -- include days marked unavailable for standalone booking.
  SELECT COALESCE(array_agg(club_day_id), ARRAY[]::uuid[]) INTO v_existing
  FROM public.booking_days
  WHERE booking_id = p_booking_id;

  -- Validate each target day + capacity-check EXCLUDING this booking's own seats.
  FOR v_day IN SELECT * FROM jsonb_array_elements(p_days)
  LOOP
    v_club_day_id := (v_day->>'club_day_id')::uuid;
    v_slot := v_day->>'time_slot';

    IF v_slot NOT IN ('full_day', 'morning', 'afternoon') THEN
      RAISE EXCEPTION 'Invalid time_slot: %', v_slot USING ERRCODE = 'check_violation';
    END IF;

    -- Membership in the target club is ALWAYS required.
    SELECT morning_capacity, afternoon_capacity, date, is_available
      INTO v_cap_morning, v_cap_afternoon, v_date, v_is_available
    FROM public.club_days
    WHERE id = v_club_day_id AND club_id = p_new_club_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Day % is not part of the selected club', v_club_day_id
        USING ERRCODE = 'check_violation';
    END IF;
    -- Availability is only enforced for NEWLY added days; kept days are exempt.
    IF NOT v_is_available AND NOT (v_club_day_id = ANY (v_existing)) THEN
      RAISE EXCEPTION 'That day (%) is not available for booking', v_date
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

    IF v_slot IN ('full_day', 'morning') AND v_used_morning + p_new_children > v_cap_morning THEN
      RAISE EXCEPTION 'Not enough morning capacity on %', v_date USING ERRCODE = 'check_violation';
    END IF;
    IF v_slot IN ('full_day', 'afternoon') AND v_used_afternoon + p_new_children > v_cap_afternoon THEN
      RAISE EXCEPTION 'Not enough afternoon capacity on %', v_date USING ERRCODE = 'check_violation';
    END IF;
  END LOOP;

  -- Replace the whole booking_days set.
  DELETE FROM public.booking_days WHERE booking_id = p_booking_id;
  FOR v_day IN SELECT * FROM jsonb_array_elements(p_days)
  LOOP
    INSERT INTO public.booking_days (booking_id, club_day_id, time_slot)
    VALUES (p_booking_id, (v_day->>'club_day_id')::uuid, v_day->>'time_slot');
  END LOOP;

  -- Update the booking aggregate atomically with the day set.
  UPDATE public.bookings
  SET club_id = p_new_club_id,
      booking_option_id = p_new_option_id,
      num_children = p_new_children,
      total_amount = p_new_total,
      updated_at = NOW()
  WHERE id = p_booking_id;

  -- Audit row, in the same transaction.
  INSERT INTO public.booking_modifications (
    booking_id, admin_actor, modification_type, direction, status,
    old_total_pence, new_total_pence, delta_pence, reason, old_state, new_state, applied_at
  ) VALUES (
    p_booking_id, p_admin_actor, p_modification_type, p_direction, 'applied',
    v_old_total, p_new_total, p_delta_pence, p_reason, p_old_state, p_new_state, NOW()
  ) RETURNING id INTO v_mod_id;

  RETURN v_mod_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
