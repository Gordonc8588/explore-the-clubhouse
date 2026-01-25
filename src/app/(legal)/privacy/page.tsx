import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read The Clubhouse's privacy policy. Learn how we collect, use, store, and protect your personal information and that of your children.",
  openGraph: {
    title: "Privacy Policy | The Clubhouse",
    description: "Learn how we collect, use, store, and protect your personal information.",
  },
};

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: "var(--craigies-cream)" }}>
      {/* Header */}
      <section
        className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: "var(--craigies-olive)" }}
      >
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm legal-back-link transition-colors"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1
            className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "white",
            }}
          >
            Privacy Policy
          </h1>
          <p className="mt-2 text-white/90" style={{ fontFamily: "system-ui, sans-serif" }}>
            Last updated: January 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
              <p style={{ color: "var(--craigies-dark-olive)" }}>
                At The Clubhouse, we take your privacy seriously. This
                Privacy Policy explains how we collect, use, store, and protect
                your personal information and that of your children when you use
                our services.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                1. Who We Are
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  The Clubhouse is a children&apos;s holiday club
                  providing outdoor, farm-based activities. We are the data
                  controller for the personal information we collect and
                  process.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>Contact Details:</strong>
                  <br />
                  The Clubhouse
                  <br />
                  West Craigie Farm, South Queensferry EH30 9AR
                  <br />
                  Email: hello@exploretheclubhouse.co.uk
                  <br />
                  Phone: 07907 879303
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                2. Information We Collect
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>2.1 Parent/Carer Information:</strong>
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Name and contact details (address, phone, email)</li>
                  <li>Emergency contact information</li>
                  <li>Payment information</li>
                  <li>Communication preferences</li>
                </ul>

                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>2.2 Child Information:</strong>
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Name, date of birth, and gender</li>
                  <li>School and year group</li>
                  <li>Medical conditions, allergies, and dietary requirements</li>
                  <li>Special educational needs or disabilities</li>
                  <li>Photograph consent status</li>
                  <li>Authorised collection persons</li>
                </ul>

                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>2.3 Website Information:</strong>
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>IP address and browser type</li>
                  <li>Pages visited and time spent on our website</li>
                  <li>Newsletter subscription details</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                3. How We Use Your Information
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>We use your information to:</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Process bookings and payments</li>
                  <li>Provide safe and appropriate care for your child</li>
                  <li>Contact you about your booking and in emergencies</li>
                  <li>Administer medication (where consent is given)</li>
                  <li>Comply with our legal and regulatory obligations</li>
                  <li>Send you marketing communications (where consent is given)</li>
                  <li>Improve our services and website</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                4. Legal Basis for Processing
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>We process your data based on:</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Contract:</strong> To fulfil
                    our booking agreement with you
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Legal obligation:</strong> To
                    comply with childcare regulations and safeguarding
                    requirements
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Consent:</strong> For
                    marketing communications and photography
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Legitimate interests:</strong>{" "}
                    To improve our services and maintain security
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Vital interests:</strong> In
                    medical emergencies involving your child
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                5. Sharing Your Information
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  We will never sell your personal information. We may share
                  your data with:
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Emergency services in case of an accident or medical emergency</li>
                  <li>Ofsted or other regulatory bodies for inspection purposes</li>
                  <li>Local authority safeguarding teams if we have concerns about a child&apos;s welfare</li>
                  <li>Our insurance providers in the event of a claim</li>
                  <li>Payment processors to handle transactions securely</li>
                  <li>Email service providers for newsletters (with your consent)</li>
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                6. Data Security
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  We take appropriate measures to protect your personal
                  information, including:
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Secure, encrypted storage of electronic records</li>
                  <li>Password protection on all devices and systems</li>
                  <li>Limited access to personal data on a need-to-know basis</li>
                  <li>Secure disposal of paper records</li>
                  <li>Regular staff training on data protection</li>
                </ul>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                7. Data Retention
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>We retain your information for the following periods:</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Registration records:</strong>{" "}
                    3 years from the child&apos;s last attendance
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Accident records:</strong>{" "}
                    Until the child reaches 21 years old (or 24 for serious
                    injuries)
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Safeguarding records:</strong>{" "}
                    25 years from the child&apos;s date of birth
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Financial records:</strong> 7
                    years for tax purposes
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Marketing data:</strong> Until
                    you unsubscribe
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 8 */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                8. Your Rights
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>Under data protection law, you have the right to:</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Access</strong> your personal
                    data
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Rectify</strong> inaccurate or
                    incomplete data
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Erase</strong> your data in
                    certain circumstances
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Restrict</strong> processing
                    of your data
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Object</strong> to processing
                    based on legitimate interests
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Data portability</strong> to
                    receive your data in a structured format
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Withdraw consent</strong> at
                    any time for consent-based processing
                  </li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us using the
                  details above. We will respond within one month.
                </p>
              </div>
            </div>

            {/* Section 9 */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                9. Cookies
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  Our website uses cookies to improve your browsing experience.
                  These include:
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Essential cookies:</strong>{" "}
                    Required for the website to function properly
                  </li>
                  <li>
                    <strong style={{ color: "var(--craigies-dark-olive)" }}>Analytics cookies:</strong> To
                    understand how visitors use our site
                  </li>
                </ul>
                <p>
                  You can control cookies through your browser settings. Note
                  that disabling certain cookies may affect website
                  functionality.
                </p>
              </div>
            </div>

            {/* Section 10 */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                10. Changes to This Policy
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  We may update this Privacy Policy from time to time.
                  Significant changes will be communicated to you via email or
                  through our website. Please review this policy periodically.
                </p>
              </div>
            </div>

            {/* Section 11 */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                11. Complaints
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  If you have concerns about how we handle your data, please
                  contact us first so we can try to resolve the issue. You also
                  have the right to lodge a complaint with the Information
                  Commissioner&apos;s Office (ICO):
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>Information Commissioner&apos;s Office</strong>
                  <br />
                  Website: ico.org.uk
                  <br />
                  Phone: 0303 123 1113
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div
              className="mt-12 rounded-2xl border-l-4 bg-white p-6 shadow-md"
              style={{ borderColor: "var(--craigies-burnt-orange)" }}
            >
              <h2
                className="text-xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Questions About Your Data?
              </h2>
              <p className="mt-2" style={{ color: "var(--craigies-dark-olive)" }}>
                If you have any questions about this Privacy Policy or how we
                handle your personal information, please contact us at{" "}
                <a
                  href="mailto:hello@exploretheclubhouse.co.uk"
                  className="underline transition-opacity legal-contact-link"
                >
                  hello@exploretheclubhouse.co.uk
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
