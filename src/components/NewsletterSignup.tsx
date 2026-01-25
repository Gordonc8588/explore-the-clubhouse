"use client";

import { useState } from "react";

interface NewsletterSignupProps {
  source?: string;
  variant?: "footer" | "standalone";
}

export function NewsletterSignup({
  source = "footer",
  variant = "footer",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to subscribe. Please try again.");
        return;
      }

      setSubscribed(true);
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Newsletter subscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className={variant === "standalone" ? "text-center" : ""}>
        <p
          className={`font-body font-semibold ${
            variant === "standalone" ? "text-white text-lg mb-2" : "text-sm"
          }`}
          style={{ color: variant === "standalone" ? "white" : "var(--craigies-burnt-orange)" }}
        >
          Check your email to confirm!
        </p>
        <p
          className={`font-body ${
            variant === "standalone" ? "text-white/80 text-sm" : "text-xs text-stone mt-1"
          }`}
        >
          We&apos;ve sent you a confirmation link. Click it to complete your subscription.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={variant === "standalone" ? "mx-auto max-w-md" : ""}>
      <label
        htmlFor={`newsletter-email-${source}`}
        className="sr-only"
      >
        Email address
      </label>
      <div className={`flex flex-col gap-${variant === "standalone" ? "3" : "2"} sm:flex-row`}>
        <input
          type="email"
          id={`newsletter-email-${source}`}
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={loading}
          className={`flex-1 rounded-lg border font-body text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed ${
            variant === "standalone"
              ? "px-5 py-3 focus:ring-white"
              : "px-4 py-2"
          }`}
          style={{
            borderColor:
              variant === "standalone"
                ? "rgba(255, 255, 255, 0.3)"
                : "var(--craigies-dark-olive)",
          }}
          onFocus={(e) => {
            if (variant === "footer") {
              e.target.style.borderColor = "var(--craigies-burnt-orange)";
            }
          }}
          onBlur={(e) => {
            if (variant === "footer") {
              e.target.style.borderColor = "var(--craigies-dark-olive)";
            }
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className={`rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 ${
            variant === "standalone"
              ? "px-8 py-3 focus:ring-offset-2 whitespace-nowrap"
              : "px-4 py-2 text-sm"
          }`}
          style={{
            backgroundColor: "var(--craigies-burnt-orange)",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </div>
      {error && (
        <p className="mt-2 font-body text-sm text-red-400">{error}</p>
      )}
    </form>
  );
}
