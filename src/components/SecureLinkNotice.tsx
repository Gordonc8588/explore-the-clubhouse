import Link from "next/link";

/**
 * Shown on booking-scoped pages when the access token is missing or invalid,
 * instead of revealing any booking/child data. Generic on purpose — it does not
 * confirm whether a booking exists, so the page can't be used as an oracle.
 */
export function SecureLinkNotice() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "#F5F4ED" }}
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <h1
          className="text-2xl mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#7A7C4A" }}
        >
          This link needs refreshing
        </h1>
        <p className="text-base mb-6 leading-relaxed" style={{ color: "#5A5C3A" }}>
          For your security, booking links now include a private access code.
          Please open the most recent link from your confirmation email. If you
          can&apos;t find it, we&apos;re happy to send you a fresh one.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#D4843E", fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Contact us
        </Link>
      </div>
    </main>
  );
}
