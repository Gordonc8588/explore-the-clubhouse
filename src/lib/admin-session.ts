import { createHmac, timingSafeEqual } from "node:crypto";

// Signed, expiring admin session token.
//
// The cookie value used to be the literal constant "authenticated", which was
// trivially forgeable (anyone could set `admin-session=authenticated`). We now
// issue an HMAC-signed token of the form `<payload>.<signature>` where the
// payload is base64url-encoded JSON holding the expiry, so the value cannot be
// guessed or tampered with without the server secret.

export const ADMIN_SESSION_COOKIE = "admin-session";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
// Exported for cookie `maxAge` (seconds).
export const ADMIN_SESSION_MAX_AGE = SESSION_DURATION_MS / 1000;

// Signing key. Prefer a dedicated secret, but fall back to ADMIN_PASSWORD
// (always present wherever login works) so enabling signed sessions never
// locks the admin out for want of a new env var.
function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Issue a signed session token valid for SESSION_DURATION_MS. */
export function createAdminSessionToken(now: number = Date.now()): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error(
      "Cannot create admin session: set ADMIN_SESSION_SECRET or ADMIN_PASSWORD",
    );
  }
  const payload = Buffer.from(
    JSON.stringify({ exp: now + SESSION_DURATION_MS }),
    "utf8",
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

/**
 * Validate a session token: correct signature (constant-time compare) and not
 * expired. Returns false for anything missing, malformed, forged, or expired —
 * never throws.
 */
export function verifyAdminSessionToken(
  token: string | undefined | null,
): boolean {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expected = sign(payload, secret);
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (
    signatureBuf.length !== expectedBuf.length ||
    !timingSafeEqual(signatureBuf, expectedBuf)
  ) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    return typeof decoded?.exp === "number" && decoded.exp > Date.now();
  } catch {
    return false;
  }
}
