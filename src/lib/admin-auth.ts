import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "@/lib/admin-session";

/**
 * True if the current request carries a valid, signed admin session cookie.
 * Use at the top of every admin API route / server action as the
 * authorization gate (the proxy is defence-in-depth, not the sole check).
 */
export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get("admin-session")?.value);
}
