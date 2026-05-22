import { createHmac, timingSafeEqual } from "node:crypto";

// Signed per-booking access token.
//
// The booking-scoped pages (/confirmation, /complete) and the /api/children
// endpoint return child PII keyed only by the booking UUID. A UUID is high
// entropy, but it travels through emails, logs, referrers and admin tooling as
// if it were non-secret — so on its own it is not a sufficient access control
// (IDOR). We require an HMAC-signed token, derived from the booking id plus a
// server secret, in the link: knowing the booking id is not enough; you also
// need a token only the server can produce.

// Query-string parameter carrying the token on booking links.
export const BOOKING_TOKEN_PARAM = "t";

function getSecret(): string | null {
  // Prefer a dedicated secret; fall back to the service-role key, which is
  // always set server-side and never shipped to the browser. Tokens are only
  // ever created/verified server-side.
  return (
    process.env.BOOKING_TOKEN_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    null
  );
}

function sign(bookingId: string, secret: string): string {
  return createHmac("sha256", secret).update(`booking:${bookingId}`).digest("base64url");
}

/** Deterministic, non-expiring signed token for a booking. */
export function createBookingToken(bookingId: string): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error(
      "Cannot create booking token: set BOOKING_TOKEN_SECRET or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return sign(bookingId, secret);
}

/** Validate a token for a booking. Constant-time; never throws. */
export function verifyBookingToken(
  bookingId: string,
  token: string | undefined | null,
): boolean {
  if (!bookingId || !token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const expected = sign(bookingId, secret);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Build the token query string for a booking link, e.g. `?t=<token>`. */
export function bookingTokenQuery(bookingId: string): string {
  return `?${BOOKING_TOKEN_PARAM}=${createBookingToken(bookingId)}`;
}
