import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
} from "@/lib/admin-session";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

// Constant-time comparison. Hash both sides to a fixed length first so
// timingSafeEqual receives equal-length buffers and no length is leaked.
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(request: Request) {
  // Throttle brute-force attempts: 5 per 15 minutes per IP. (In-memory limiter
  // is per-instance on Vercel — a speed bump; a shared store would be stronger.)
  const ip = getClientIP(request.headers);
  const limit = rateLimit(`admin-login:${ip}`, {
    maxTokens: 5,
    refillInterval: 15 * 60 * 1000,
    refillRate: 5,
  });
  if (!limit.success) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { email, password } = await request.json();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@exploretheclubhouse.co.uk";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return NextResponse.json(
      { success: false, error: "Server configuration error" },
      { status: 500 }
    );
  }

  const emailOk = email === adminEmail;
  const passwordOk = safeEqual(String(password ?? ""), adminPassword);

  if (emailOk && passwordOk) {
    const response = NextResponse.json({ success: true });

    // Issue a signed, expiring session token (not a guessable constant)
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  }

  return NextResponse.json(
    { success: false, error: "Invalid credentials" },
    { status: 401 }
  );
}
