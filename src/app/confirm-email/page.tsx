import Link from "next/link";
import { CheckCircle, XCircle, AlertCircle, Mail } from "lucide-react";

interface ConfirmEmailPageProps {
  searchParams: Promise<{ status?: string; token?: string }>;
}

export const metadata = {
  title: "Confirm Email | The Clubhouse",
  description: "Confirm your newsletter subscription",
};

export default async function ConfirmEmailPage({
  searchParams,
}: ConfirmEmailPageProps) {
  const { status, token } = await searchParams;

  // If we have a token but no status, this is a direct link click
  // The API route should handle this and redirect with status
  if (token && !status) {
    // This shouldn't normally happen as the API handles the redirect
    // But just in case, show a loading state
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--craigies-cream)" }}
      >
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
          >
            <Mail className="w-8 h-8" style={{ color: "var(--craigies-olive)" }} />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Confirming...
          </h1>
          <p className="text-stone mb-6">
            Please wait while we confirm your subscription.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--craigies-cream)" }}
      >
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
          >
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            You&apos;re All Set!
          </h1>
          <p className="text-stone mb-6">
            Your email has been confirmed. Welcome to The Clubhouse newsletter!
            You&apos;ll be the first to know about new clubs, special offers, and
            farm updates.
          </p>
          <Link
            href="/clubs"
            className="inline-block text-white font-semibold py-3 px-6 rounded-lg transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--craigies-burnt-orange)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            View Our Clubs
          </Link>
        </div>
      </div>
    );
  }

  // Already confirmed state
  if (status === "already-confirmed") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--craigies-cream)" }}
      >
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: "var(--craigies-olive)" }} />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Already Confirmed
          </h1>
          <p className="text-stone mb-6">
            Good news! Your email is already confirmed. You&apos;re all set to
            receive our newsletter.
          </p>
          <Link
            href="/clubs"
            className="inline-block text-white font-semibold py-3 px-6 rounded-lg transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--craigies-burnt-orange)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            View Our Clubs
          </Link>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (status === "invalid") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--craigies-cream)" }}
      >
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
          >
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Invalid Link
          </h1>
          <p className="text-stone mb-6">
            This confirmation link is invalid or has expired. Please try signing
            up again to receive a new confirmation email.
          </p>
          <Link
            href="/#newsletter"
            className="inline-block text-white font-semibold py-3 px-6 rounded-lg transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--craigies-burnt-orange)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Sign Up Again
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--craigies-cream)" }}
      >
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
          >
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Something Went Wrong
          </h1>
          <p className="text-stone mb-6">
            We couldn&apos;t confirm your subscription. Please try again or
            contact us if the problem persists.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/#newsletter"
              className="inline-block text-white font-semibold py-3 px-6 rounded-lg transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--craigies-burnt-orange)",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Try Again
            </Link>
            <Link
              href="/contact"
              className="inline-block border-2 font-semibold py-3 px-6 rounded-lg transition-colors hover:opacity-90"
              style={{
                borderColor: "var(--craigies-dark-olive)",
                color: "var(--craigies-dark-olive)",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default state (no status) - informational page
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--craigies-cream)" }}
    >
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
        >
          <Mail className="w-8 h-8" style={{ color: "var(--craigies-olive)" }} />
        </div>
        <h1
          className="text-2xl font-bold mb-2"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--craigies-dark-olive)",
          }}
        >
          Check Your Email
        </h1>
        <p className="text-stone mb-6">
          We&apos;ve sent you a confirmation email. Please click the link in the
          email to confirm your subscription.
        </p>
        <p className="text-sm text-stone">
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <Link
            href="/#newsletter"
            className="font-medium hover:underline"
            style={{ color: "var(--craigies-burnt-orange)" }}
          >
            try signing up again
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
