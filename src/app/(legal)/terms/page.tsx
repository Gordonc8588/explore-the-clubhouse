import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read The Clubhouse's terms and conditions. Important information about booking, cancellation, behaviour policy, and other policies.",
  openGraph: {
    title: "Terms & Conditions | The Clubhouse",
    description:
      "Important information about booking, cancellation, behaviour policy, and other policies.",
  },
};

export default function TermsPage() {
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
            Terms & Conditions
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
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                The Clubhouse – Cancellation & Behaviour Policy
              </h2>
              <p className="mt-4 font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                The Clubhouse is a drop-off activity club and is not a Care Inspectorate-registered childcare service. While we strive to be welcoming and inclusive, we are unfortunately unable to provide the level of support required for children with additional support needs or significant behavioural circumstances.
              </p>
            </div>

            {/* Cancellation & Refund Policy */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Cancellation & Refund Policy
              </h2>

              <div className="mt-4">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Cancellations by Parents/Guardians
                </h3>
                <ul className="mt-3 space-y-3 list-disc pl-5" style={{ color: "var(--craigies-dark-olive)" }}>
                  <li>
                    Cancellations made 14 days or more before the start date of the booking will receive a full refund.
                  </li>
                  <li>
                    Cancellations made 7–13 days before the start date will receive a 50% refund.
                  </li>
                  <li>
                    Cancellations made less than 7 days before the start date are non-refundable.
                  </li>
                  <li>
                    No refunds or credits will be issued for missed sessions due to illness, personal reasons, or changes in schedule.
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Cancellations by The Clubhouse
                </h3>
                <ul className="mt-3 space-y-3 list-disc pl-5" style={{ color: "var(--craigies-dark-olive)" }}>
                  <li>
                    If we need to cancel a session due to unforeseen circumstances (e.g. extreme weather, staff illness, or safety concerns), we will offer a full refund or a rescheduled session.
                  </li>
                  <li>
                    In the event of force majeure (e.g. natural disasters, government restrictions), we will do our best to offer an alternative but cannot guarantee refunds.
                  </li>
                </ul>
              </div>
            </div>

            {/* Behaviour Policy */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Behaviour Policy
              </h2>
              <p className="mt-4" style={{ color: "var(--craigies-dark-olive)" }}>
                We aim to create a safe, inclusive, and enjoyable environment for all children. By enrolling your child in The Clubhouse, you agree to the following expectations:
              </p>

              <div className="mt-4">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Respect & Inclusion
                </h3>
                <ul className="mt-3 space-y-3 list-disc pl-5" style={{ color: "var(--craigies-dark-olive)" }}>
                  <li>
                    Children must treat each other, staff, animals, and the environment with kindness and respect.
                  </li>
                  <li>
                    Harmful behaviour, including bullying, physical aggression, or damaging property, will not be tolerated.
                  </li>
                  <li>
                    Harmful behaviour towards animals will result in immediate removal from the activity.
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Listening & Participation
                </h3>
                <ul className="mt-3 space-y-3 list-disc pl-5" style={{ color: "var(--craigies-dark-olive)" }}>
                  <li>
                    Children must follow safety instructions and take part in activities to the best of their ability.
                  </li>
                  <li>
                    No playfighting or weapons games.
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Unsafe or Disruptive Behaviour
                </h3>
                <ul className="mt-3 space-y-3 list-disc pl-5" style={{ color: "var(--craigies-dark-olive)" }}>
                  <li>
                    If a child&apos;s behaviour is disruptive, unsafe, or prevents others from participating, parents may be asked to collect their child early.
                  </li>
                  <li>
                    Severe behaviour (such as biting, kicking staff, throwing objects, or violent outbursts) will result in parents being called immediately to collect their child, and no refund will be offered.
                  </li>
                </ul>
              </div>
            </div>

            {/* Parental Support */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Parental Support
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  We encourage open communication with parents to ensure every child&apos;s success at The Clubhouse. If your child is voicing any difficulties at home, or there is an aspect of the programme they are not enjoying, please let a member of staff know so we can work together to support your child.
                </p>
                <p>
                  We also ask that all forms for children are completed within 3 days of booking. If forms are not received, the child&apos;s place may be offered to another family on the waiting list.
                </p>
              </div>
            </div>

            {/* Booking and Payment */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Booking and Payment
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  All bookings must be made through our online booking system or by contacting us directly. Bookings are not confirmed until payment has been received in full.
                </p>
                <p>
                  Full payment is required at the time of booking unless otherwise agreed in writing. We accept payment by credit/debit card or bank transfer.
                </p>
                <p>
                  Prices are as quoted at the time of booking and include all activities, snacks, and supervision during the session.
                </p>
                <p>
                  Sibling discounts and multi-day booking discounts may be available. Please check our website or contact us for current offers.
                </p>
              </div>
            </div>

            {/* Drop-off and Collection */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Drop-off and Collection
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  Sessions typically run from 9:00 AM to 3:30 PM unless otherwise stated. Drop-off is from 8:45 AM and collection must be by 3:45 PM.
                </p>
                <p>
                  Children may only be collected by authorised adults named on the registration form. Photo ID may be requested.
                </p>
                <p>
                  Late collection may incur an additional charge of £10 per 15 minutes. Persistent late collection may result in the child&apos;s place being withdrawn.
                </p>
                <p>
                  If you need to make alternative collection arrangements, please inform us in writing (email is acceptable) before the start of the session.
                </p>
              </div>
            </div>

            {/* Health and Medical Information */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Health and Medical Information
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  Parents/carers must provide accurate and up-to-date health information on the registration form, including allergies, medical conditions, and medications.
                </p>
                <p>
                  If your child requires medication during the session, you must complete a medication consent form and provide clear instructions.
                </p>
                <p>
                  Children who are unwell should not attend. If a child becomes ill during a session, we will contact you to arrange collection.
                </p>
                <p>
                  In the event of an emergency, we will contact you immediately. If we cannot reach you, we will seek appropriate medical attention.
                </p>
              </div>
            </div>

            {/* Clothing and Personal Belongings */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Clothing and Personal Belongings
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  Children should wear appropriate clothing for outdoor activities, including long trousers, closed-toe shoes, and weather-appropriate layers. We will advise on specific requirements.
                </p>
                <p>
                  Please label all belongings clearly with your child&apos;s name. We cannot be held responsible for lost or damaged personal items.
                </p>
                <p>
                  Valuable items, including electronic devices and expensive jewellery, should be left at home.
                </p>
              </div>
            </div>

            {/* Photography and Media */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Photography and Media
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  We may take photographs and videos during sessions for promotional purposes, including our website, social media, and marketing materials.
                </p>
                <p>
                  You will be asked to give consent for photography on the registration form. If you do not consent, we will ensure your child is not included in any media.
                </p>
                <p>
                  We will never publish a child&apos;s full name alongside their photograph.
                </p>
              </div>
            </div>

            {/* Liability */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Liability
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  The Clubhouse holds public liability insurance. However, we accept no liability for injury or loss arising from the child&apos;s participation in activities unless caused by our negligence.
                </p>
                <p>
                  Outdoor activities carry inherent risks. By booking, you acknowledge and accept that your child will be participating in activities such as farm work, woodland exploration, and animal handling.
                </p>
                <p>
                  We maintain comprehensive risk assessments for all activities and locations.
                </p>
              </div>
            </div>

            {/* Changes to Terms */}
            <div className="mt-8">
              <h2
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Changes to Terms
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  We reserve the right to update these Terms & Conditions at any time. Significant changes will be communicated to existing customers.
                </p>
                <p>
                  The terms in force at the time of booking will apply to that booking.
                </p>
              </div>
            </div>

            {/* Agreement Section */}
            <div
              className="mt-12 rounded-2xl border-l-4 bg-white p-6 shadow-md"
              style={{ borderColor: "var(--craigies-olive)" }}
            >
              <h2
                className="text-xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Agreement
              </h2>
              <p className="mt-2" style={{ color: "var(--craigies-dark-olive)" }}>
                By completing your booking and making payment, you confirm that you have read, understood, and agreed to The Clubhouse&apos;s Cancellation & Behaviour Policy.
              </p>
              <p className="mt-4" style={{ color: "var(--craigies-dark-olive)" }}>
                Thank you for your cooperation in making The Clubhouse a safe and enjoyable space for all children!
              </p>
            </div>

            {/* Contact Section */}
            <div
              className="mt-8 rounded-2xl border-l-4 bg-white p-6 shadow-md"
              style={{ borderColor: "var(--craigies-burnt-orange)" }}
            >
              <h2
                className="text-xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Questions?
              </h2>
              <p className="mt-2" style={{ color: "var(--craigies-dark-olive)" }}>
                If you have any questions about these Terms & Conditions, please
                contact us at{" "}
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
