# Booking Modification System — Implementation Plan

_Status: proposed (awaiting owner decisions). Produced from a multi-agent design + adversarial review pass over the live codebase._

## 1. What we're building

One coherent way for an admin to change a booking after payment, covering every real-world scenario:

| Scenario | Money direction | Example |
|---|---|---|
| **Cancel** | Full / partial / no refund | Family can't come at all |
| **Reschedule** (incl. different week) | Usually £0 | Move Week 2 → Week 1, same number of days |
| **Reduce days** | Refund the difference | 4 days → 3 days |
| **Add days** | Charge the difference | 3 days → 4 days |
| **Full-week conversions** | Refund or charge | Drop a day from a full week; or add a day that completes a week |
| **Mixed edit** (later) | Net refund or charge | Move 2 days, drop 1, in one go |

All of it runs on **one shared core** so the money math can never disagree with itself.

---

## 2. ⚠️ Bugs found in the CURRENT code (fix these first)

The review found defects in the live cancel/refund path that are worth knowing about today:

1. **The "Refund" button always refunds the *full* amount.** `stripe.refunds.create()` is called with no `amount`, so there's no way to refund one day. (`cancel/route.ts:96`)
2. **The double-refund guard is broken** — it's a tautology (`amount_received === amount_received`) and the real check (`charge.refunded`) is only true *after a full refund*. So after any partial refund, a second refund isn't correctly blocked and could **over-refund**. (`cancel/route.ts:84`)
3. **No record of refunds** is stored on the booking, so the system can't tell how much has already been returned.
4. **The pricing formula is copied in 3 places** (checkout, the booking form, and implicitly every future change) — they can silently drift and produce wrong refund/charge amounts.
5. **Capacity is checked then written without a lock** — two simultaneous bookings can both take the last seat (overbooking).
6. **The admin booking page shows the wrong child count** — it displays `children.length` (profiles collected, often 0) instead of `num_children` (the paying count used for all money/capacity). (`BookingDetail.tsx:403`)

> **Practical note for now:** until Phase 1 ships, treat the existing **Refund** button as "full refund only." For anything partial (like Suzanne's £65), keep using the Stripe Dashboard.

---

## 3. Architecture: shared core + thin endpoints

**Decision: do _not_ build one giant "edit booking" endpoint first.** Build a small shared core, then expose it through several simple, independently-shippable admin actions. A unified editor comes last, as a thin caller of the same core.

**The core (3 primitives + 2 tables):**

- **`src/lib/pricing.ts`** — one pure `priceBooking({ optionType, pricePerChild, dayCount, numChildren, discountPercent })` function. The *only* place pricing math lives. `full_week`/`single_day` = flat price; `multi_day` = per-day; discount = `Math.round`. Pure → unit-testable.
- **`apply_booking_modification(...)` Postgres RPC** (SECURITY DEFINER) — does the whole DB change in **one transaction**: locks the target days (`SELECT … FOR UPDATE`), re-checks capacity *excluding this booking's own seats*, replaces the booking's days, and updates `club_id` / `option` / `total` / audit row together. This closes the overbooking race and the "half-moved booking" risk.
- **`src/lib/booking-modify.ts` → `reconcilePayment(booking, deltaPence)`** — encodes the two money-ordering rules and the signed-delta guard.
- **`booking_modifications` table** — audit log + pending-upcharge holder + partial-refund ledger (one table, three jobs).
- **`booking_payments` table** — records every Stripe payment intent (a booking can have more than one after an upgrade).

Plus snapshot columns on `bookings`: `discount_percent_applied`, `amount_refunded_pence`, `updated_at`.

---

## 4. The money rules (the part that must be exactly right)

- **One signed delta per change:** `delta = newTotal − total_amount`, where `newTotal` is the whole booking re-priced under the correct option using the **snapshotted discount the customer actually paid** (never the current live promo, which can drift).
- **Hard sign guard:** never run Stripe when `delta === 0`; never send a payment request for `delta ≤ 0`; never refund for `delta ≥ 0`.
- **Refunds (delta < 0):** apply the DB change **first**, then issue a **partial** refund (`amount` param), capped at the live ceiling `charge.amount_captured − charge.amount_refunded`. A failed refund leaves a consistent, cheaper booking that can be retried.
- **Upgrades (delta > 0):** because checkout is guest/card-only (no saved card), we **can't charge on the spot.** We hold the proposed change as `pending`, send the parent a **hosted Stripe Checkout link** for the difference, and only apply the change in the **webhook once they pay** (seats aren't granted before payment).
- **Idempotency keys** on every refund and checkout-session call (none exist today) so a double-click or Stripe retry can't double-charge/refund.
- **Full-week rule:** the £295 week is an indivisible bundle. We always re-price the *whole* new state and diff two final totals — never pro-rata a single day. (Worked example: dropping 1 of 5 full-week days re-prices as 4 × £65 = £260, so **£35 back**, not £65; adding a 5th day to a 4-day booking auto-bundles to the cheaper £295 week, so **£35 charge**, not £65.)

---

## 5. Safety & customer comms

- **Preview before commit:** a server-computed dry-run (`/reprice`) returns `was £X → now £Y → difference £Z` and the confirm button shows *that* exact number. The admin never approves a figure the browser guessed.
- **Accidental-click protection:** type-to-confirm the amount/ref, brief disable after the modal opens, explicit success panel ("Refunded £35.00, ref re_xxx").
- **Partial-failure recovery:** every money+DB action returns `{moneyMoved, dbApplied}`; if money moved but the DB didn't, a persistent "Retry" banner appears (no silent `console.error`).
- **Correct emails:** new `sendRefundEmail` (actual amount, not always "full") and `sendBookingModifiedEmail` (itemised old→new + the real £). Upgrade flow: a "payment link" email at request time, and a separate "payment received / updated booking" email only **after** the money clears.
- **Status model:** keep the existing 5 statuses. A *partial* refund leaves the booking `paid`/`complete` (it's still active for the remaining days); the money state lives in the ledger. Only a *full* refund sets `refunded`.

---

## 6. Phased rollout (each phase is revertible and build-gated)

- **Phase 0 — Pricing engine + tests. ✅ BUILT.** `src/lib/pricing.ts` + 11 vitest tests; checkout, booking form, and review screen all routed through it (behaviour-identical). _Pending: migration apply + deploy._
- **Phase 1 — Partial / goodwill / full refund. ✅ BUILT.** Parameterised refund route (live ceiling, idempotency, ledger-before-money, **reconcile-first** so a DB-failure retry can't double-refund), `booking_modifications` + `booking_payments` tables, `sendRefundEmail` (actual amount), unified Cancel/Refund modal (type-to-confirm, effect-based cooldown, num_children fix). Self-reviewed by 4 adversarial agents; all findings fixed. _Pending: migration apply + deploy._
- **Phase 2 — Atomic mutation RPC. ✅ BUILT.** `apply_booking_modification` plpgsql RPC (locks booking + target days, self-excluding capacity re-check, atomic day-set replace + booking update + audit row); change-day route migrated onto it with a cross-week guard, duplicate-day guard, and SQLSTATE-based error mapping. Kept `is_available=false` days (full-week bookings) are exempt from the availability gate. Self-reviewed (7 agents); findings fixed. _Deferred to a later phase: the public **webhook** still inserts booking_days without a capacity check/lock, so a concurrent public booking can still overbook — needs a DB-level capacity trigger or a locked webhook path. Pending: migration apply + deploy._
- **Phase 3 — Reschedule (incl. cross-week). ✅ BUILT.** `/reprice` (server-authoritative preview) + `/reschedule` routes over the RPC; reschedule editor (pick week → select same number of days → old→new preview → type-to-confirm). Price drop auto-refunded (DB-first); price increase blocked until Phase 4. Refund mechanics shared in `src/lib/booking-modify.ts` (cancel route now reuses it). New `sendBookingModifiedEmail`. Self-reviewed (10 agents — the "double-refund on retry" flag was a verified false positive); audit/observability findings fixed. No new migration. _Pending: deploy._
- **Phase 4a — Remove days → refund. ✅ BUILT.** `computeEditPricing` (cheapest-valid-option resolver: drop below a full week → per-day rate; reach a full week → auto-bundle to Full Week) + `/edit-days` route (refund/zero; add-days blocked here) + "Remove Days" modal (untick days → preview → type-to-confirm → apply + refund). No new migration. Self-reviewed (6 agents; full-week math verified; 2 low findings fixed). _Pending: deploy._
- **Phase 4b — Add days → payment-link upcharge. ✅ BUILT.** Deferred-webhook flow: `/edit-days` (delta>0) persists a pending modification + hosted Checkout link + emails the parent; the webhook re-prices at pay time, **atomically claims + applies** via the RPC (`p_modification_id`), refunds on capacity-loss/price-drift/cancel-race, and records the upcharge payment. Plus: a partial unique index (one open request per booking), `cancel-modification` (refund-if-already-paid), full-cancel covers upcharge intents, and an "Add Days" modal + pending-payment card. Self-reviewed twice (16 + 3 agents) — 1 high + several med/low found and fixed; **re-review clean**. _Pending: apply migration `20260619140000` + deploy._
- **Phase 5 — Reconciliation hardening. ✅ BUILT.** Two pieces: (1) **Public-checkout capacity guard** — the Stripe webhook now seats the initial booking through a new locked, capacity-checked, idempotent RPC `create_initial_booking_days` (mirrors `apply_booking_modification`: locks booking + target days, self-excluding capacity re-check over paid/complete, raises check_violation/23514 on over-capacity, no-op if days already exist — also fixing the latent double-insert-on-redelivery bug). On capacity failure the webhook applies the owner's **refuse + alert admin** policy (no days inserted, booking left paid-but-unseated, `seating_failed` audit row + admin email, no parent confirmation); non-capacity RPC errors throw so Stripe redelivers. (2) **Out-of-band refund sync** — new `charge.refunded` / `refund.updated` handlers reconcile `amount_refunded_pence` + status from Stripe's ABSOLUTE cumulative across every payment intent (idempotent vs redelivery and vs the in-app refund path; full refund → `refunded`, partial leaves status active; out-of-band refunds get an `out_of_band_refund` audit row, deduped by `stripe_refund_id`), plus a `charge.dispute.created` handler that alerts the admin + audits (never auto-refunds). New emails `sendSeatingFailureAlert` + `sendDisputeAlert`. _Migration `20260619150000` must be applied before deploy; the new Stripe events must be enabled on the webhook endpoint (see §below). Self-reviewed (adversarial). Pending: migration apply + Stripe event enable + deploy._
- **Phase 6 — Unified "Edit booking" editor.** One screen to stage any combination, over the now-proven core, plus an audit-history view.
- **Phase 6 — Unified "Edit booking" editor.** One screen to stage any combination, over the now-proven core, plus an audit-history view.

---

## 7. Decisions made by the owner (2026-06-19)

1. **Full-week part-cancellation refund** — ✅ **Per-day rate.** Lose the bundle; remaining days priced individually (5→4 days = £35 back).
2. **Adding a day that would cost more than a full week** — ✅ **Auto-upgrade to the cheaper Full Week** and charge the smaller delta, shown explicitly in the preview.
3. **Collecting extra payment for upgrades** — ✅ **Email the parent a hosted Stripe payment link** (no card-saving build now).
4. **Modifying started/completed bookings** — recommend (not yet ratified): allow with a safeguarding warning; freeze (or require override) once the club week has started; never auto-delete child records. _Revisit at Phase 3+._
5. **Waitlist auto-notify on freed capacity** — defer (the waitlist table has no app code yet; orthogonal to money safety).

**Build scope chosen:** Phase 0 + Phase 1 now, then continue phase by phase.

---

_Source review artifacts: 4 adversarial lenses (money-correctness, data-consistency, UX/operational, architecture) all reached the same verdict — the scenarios are sound but must sit on the shared core + ledger + idempotency + atomic RPC before going live._
