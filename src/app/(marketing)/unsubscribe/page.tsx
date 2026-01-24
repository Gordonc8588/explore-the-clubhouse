"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Mail, Loader2 } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  // Check if coming from email link with success flag
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setStatus("success");
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to unsubscribe");
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ backgroundColor: "var(--craigies-cream)" }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-16 sm:py-24"
        style={{ backgroundColor: "var(--craigies-olive)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "white",
              }}
            >
              Newsletter Preferences
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-white/90">
              Manage your email subscription preferences
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            {status === "success" ? (
              <div className="text-center">
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                >
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2
                  className="mt-6 text-2xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  Successfully Unsubscribed
                </h2>
                <p
                  className="mt-4 text-base"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  You have been removed from our newsletter mailing list. You will no longer receive marketing emails from The Clubhouse.
                </p>
                <p
                  className="mt-4 text-sm"
                  style={{ color: "#6B7280" }}
                >
                  Changed your mind? You can always sign up again from our website.
                </p>
                <Link
                  href="/"
                  className="mt-8 inline-flex items-center justify-center rounded-lg px-6 py-3 font-body text-base font-semibold text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
                >
                  Return to Home
                </Link>
              </div>
            ) : status === "error" ? (
              <div className="text-center">
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                >
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2
                  className="mt-6 text-2xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  Something Went Wrong
                </h2>
                <p
                  className="mt-4 text-base"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  We couldn&apos;t process your unsubscribe request. Please try again or contact us directly.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-8 inline-flex items-center justify-center rounded-lg px-6 py-3 font-body text-base font-semibold text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center">
                  <div
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
                  >
                    <Mail
                      className="h-8 w-8"
                      style={{ color: "var(--craigies-olive)" }}
                    />
                  </div>
                  <h2
                    className="mt-6 text-2xl font-bold"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "var(--craigies-dark-olive)",
                    }}
                  >
                    Unsubscribe from Newsletter
                  </h2>
                  <p
                    className="mt-4 text-base"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Enter your email address below to unsubscribe from our newsletter.
                  </p>
                </div>

                <form onSubmit={handleUnsubscribe} className="mt-8 space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-2 w-full rounded-lg border bg-white px-4 py-3 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#D1D5DB",
                        color: "var(--craigies-dark-olive)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--craigies-burnt-orange)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(212, 132, 62, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#D1D5DB";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading" || !email}
                    className="w-full rounded-lg px-6 py-3 font-body text-base font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
                  >
                    {status === "loading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "Unsubscribe"
                    )}
                  </button>
                </form>

                <p
                  className="mt-6 text-center text-sm"
                  style={{ color: "#6B7280" }}
                >
                  We&apos;re sorry to see you go. If you change your mind, you can always sign up again from our website.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ backgroundColor: "var(--craigies-cream)" }}>
      <section
        className="relative overflow-hidden py-16 sm:py-24"
        style={{ backgroundColor: "var(--craigies-olive)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-4xl font-bold tracking-tight sm:text-5xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "white",
              }}
            >
              Newsletter Preferences
            </h1>
          </div>
        </div>
      </section>
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <div className="flex items-center justify-center py-12">
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: "var(--craigies-olive)" }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <UnsubscribeContent />
    </Suspense>
  );
}
