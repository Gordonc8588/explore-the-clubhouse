"use client";

import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/clubs", label: "What's On" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/safeguarding", label: "Safeguarding" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer style={{ backgroundColor: "var(--craigies-olive)" }} className="text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & About */}
          <div>
            <Link
              href="/"
              className="text-xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              The Clubhouse
            </Link>
            <p className="mt-4 font-body text-sm text-white/80">
              A children&apos;s holiday club offering outdoor, farm-based
              activities during school holidays. Where adventure meets nature!
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Contact Us
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                  style={{ color: "var(--craigies-burnt-orange)" }}
                />
                <span className="font-body text-sm text-white/80">
                  West Craigie Farm
                  <br />
                  South Queensferry EH30 9AR
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: "var(--craigies-burnt-orange)" }}
                />
                <a
                  href="tel:+447907879303"
                  className="font-body text-sm text-white/80 transition-colors hover:text-white"
                >
                  07907 879303
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: "var(--craigies-burnt-orange)" }}
                />
                <a
                  href="mailto:hello@exploretheclubhouse.co.uk"
                  className="font-body text-sm text-white/80 transition-colors hover:text-white"
                >
                  hello@exploretheclubhouse.co.uk
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="mt-6">
              <h4
                className="text-sm font-semibold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Follow Us
              </h4>
              <div className="mt-2 flex gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="rounded-full p-2 transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-full p-2 transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Newsletter
            </h3>
            <p className="mt-4 font-body text-sm text-white/80">
              Stay updated with our latest activities and holiday club dates.
            </p>
            {subscribed ? (
              <p
                className="mt-4 font-body text-sm font-semibold"
                style={{ color: "var(--craigies-burnt-orange)" }}
              >
                Thanks for subscribing!
              </p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="mt-4">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    id="newsletter-email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 rounded-lg border px-4 py-2 font-body text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 bg-white/10"
                    style={{
                      borderColor: "var(--craigies-dark-olive)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--craigies-burnt-orange)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--craigies-dark-olive)";
                    }}
                  />
                  <button
                    type="submit"
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: "var(--craigies-burnt-orange)",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t pt-8" style={{ borderColor: "var(--craigies-dark-olive)" }}>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Legal Links */}
            <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-xs text-white/80 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Copyright */}
            <p className="font-body text-xs text-white/80">
              &copy; {new Date().getFullYear()} The Clubhouse. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
