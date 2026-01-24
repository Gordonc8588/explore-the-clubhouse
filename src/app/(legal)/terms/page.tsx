import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read The Clubhouse's terms and conditions. Important information about booking, cancellation, collection, and other policies.",
  openGraph: {
    title: "Terms & Conditions | The Clubhouse",
    description:
      "Important information about booking, cancellation, collection, and other policies.",
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
              <p style={{ color: "var(--craigies-dark-olive)" }}>
                Welcome to The Clubhouse. By booking a place for your
                child at our holiday club, you agree to be bound by these Terms
                & Conditions. Please read them carefully before making a
                booking.
              </p>
              <p className="mt-4 font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                Please note: The Clubhouse is an Activity Club and does not offer a Childcare Service.
                All children participating must be able to take direction in hands-on activities,
                work safely with animals, and engage positively in a group environment.
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
                1. Booking and Payment
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>1.1</strong> All bookings must
                  be made through our online booking system or by contacting us
                  directly. Bookings are not confirmed until payment has been
                  received in full.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>1.2</strong> Full payment is
                  required at the time of booking unless otherwise agreed in
                  writing. We accept payment by credit/debit card or bank
                  transfer.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>1.3</strong> Prices are as
                  quoted at the time of booking and include all activities,
                  snacks, and supervision during the session.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>1.4</strong> Sibling discounts
                  and multi-day booking discounts may be available. Please check
                  our website or contact us for current offers.
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
                2. Cancellation and Refunds
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p className="font-semibold">Cancellations by Parents/Guardians</p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>2.1</strong> Cancellations made
                  14 days or more before the start date of the booking will receive a
                  full refund.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>2.2</strong> Cancellations made
                  7–13 days before the start date will receive a 50% refund.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>2.3</strong> Cancellations made
                  less than 7 days before the start date are non-refundable.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>2.4</strong> No refunds or credits
                  will be issued for missed sessions due to illness, personal reasons,
                  or changes in schedule.
                </p>
                <p className="font-semibold mt-6">Cancellations by The Clubhouse</p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>2.5</strong> If we need to cancel
                  a session due to unforeseen circumstances (e.g., extreme weather,
                  staff illness, or safety concerns), we will offer a full refund
                  or a rescheduled session.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>2.6</strong> In the event of
                  force majeure (e.g., natural disasters, government restrictions),
                  we will make every effort to offer an alternative arrangement but
                  cannot guarantee refunds.
                </p>
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
                3. Drop-off and Collection
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>3.1</strong> Sessions typically
                  run from 9:00 AM to 3:30 PM unless otherwise stated. Drop-off
                  is from 8:45 AM and collection must be by 3:45 PM.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>3.2</strong> Children may only
                  be collected by authorised adults named on the registration
                  form. Photo ID may be requested.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>3.3</strong> Late collection may
                  incur an additional charge of £10 per 15 minutes. Persistent
                  late collection may result in the child&apos;s place being
                  withdrawn.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>3.4</strong> If you need to make
                  alternative collection arrangements, please inform us in
                  writing (email is acceptable) before the start of the session.
                </p>
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
                4. Health and Medical Information
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>4.1</strong> Parents/carers must
                  provide accurate and up-to-date health information on the
                  registration form, including allergies, medical conditions,
                  and medications.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>4.2</strong> If your child
                  requires medication during the session, you must complete a
                  medication consent form and provide clear instructions.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>4.3</strong> Children who are
                  unwell should not attend. If a child becomes ill during a
                  session, we will contact you to arrange collection.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>4.4</strong> In the event of an
                  emergency, we will contact you immediately. If we cannot reach
                  you, we will seek appropriate medical attention.
                </p>
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
                5. Behaviour and Conduct
              </h2>
              <p className="mt-4" style={{ color: "var(--craigies-dark-olive)" }}>
                We aim to create a safe, inclusive, and enjoyable environment for all children.
                By enrolling your child in The Clubhouse, you agree to the following expectations:
              </p>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p className="font-semibold">Respect & Inclusion</p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>5.1</strong> Children must
                  treat each other, staff, animals, and the environment with kindness and respect.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>5.2</strong> Harmful behaviour,
                  including bullying, physical aggression, or damaging property, will not be tolerated.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>5.3</strong> Harmful behaviour
                  towards animals will result in immediate removal from the activity.
                </p>
                <p className="font-semibold mt-6">Listening & Participation</p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>5.4</strong> Children must
                  follow safety instructions given by staff and participate in activities
                  to the best of their ability.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>5.5</strong> Play fighting
                  and games involving pretend weapons are not permitted.
                </p>
                <p className="font-semibold mt-6">Unsafe or Disruptive Behaviour</p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>5.6</strong> If a child&apos;s
                  behaviour is disruptive, unsafe, or prevents others from participating,
                  parents may be contacted to collect their child early.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>5.7</strong> Severe behaviour
                  (such as biting, kicking staff, throwing objects, or violent outbursts)
                  will result in parents being contacted immediately to collect their child,
                  and no refund will be offered.
                </p>
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
                6. Parental Communication
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>6.1</strong> We encourage
                  open communication with parents to ensure every child&apos;s success at
                  The Clubhouse. If your child is experiencing any difficulties or there
                  is an aspect of the programme they are not enjoying, please let a member
                  of staff know so we can work together to support your child.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>6.2</strong> All child
                  information forms must be completed within 3 days of booking. If forms
                  are not received by this time, we reserve the right to offer the child&apos;s
                  place to another family on the waiting list.
                </p>
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
                7. Clothing and Personal Belongings
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>7.1</strong> Children should
                  wear appropriate clothing for outdoor activities, including
                  long trousers, closed-toe shoes, and weather-appropriate
                  layers. We will advise on specific requirements.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>7.2</strong> Please label all
                  belongings clearly with your child&apos;s name. We cannot be
                  held responsible for lost or damaged personal items.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>7.3</strong> Valuable items,
                  including electronic devices and expensive jewellery, should
                  be left at home.
                </p>
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
                8. Photography and Media
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>8.1</strong> We may take
                  photographs and videos during sessions for promotional
                  purposes, including our website, social media, and marketing
                  materials.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>8.2</strong> You will be asked
                  to give consent for photography on the registration form. If
                  you do not consent, we will ensure your child is not included
                  in any media.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>8.3</strong> We will never
                  publish a child&apos;s full name alongside their photograph.
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
                9. Liability
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>9.1</strong> The
                  Clubhouse holds public liability insurance. However, we accept
                  no liability for injury or loss arising from the
                  child&apos;s participation in activities unless caused by our
                  negligence.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>9.2</strong> Outdoor activities
                  carry inherent risks. By booking, you acknowledge and accept
                  that your child will be participating in activities such as
                  farm work, woodland exploration, and animal handling.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>9.3</strong> We maintain
                  comprehensive risk assessments for all activities and
                  locations.
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
                10. Changes to Terms
              </h2>
              <div className="mt-4 space-y-4" style={{ color: "var(--craigies-dark-olive)" }}>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>10.1</strong> We reserve the
                  right to update these Terms & Conditions at any time.
                  Significant changes will be communicated to existing
                  customers.
                </p>
                <p>
                  <strong style={{ color: "var(--craigies-dark-olive)" }}>10.2</strong> The terms in force
                  at the time of booking will apply to that booking.
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
                By completing your booking and making payment, you confirm that you have
                read, understood, and agreed to The Clubhouse&apos;s Terms & Conditions
                as set out above.
              </p>
              <p className="mt-4" style={{ color: "var(--craigies-dark-olive)" }}>
                Thank you for your cooperation in making The Clubhouse a safe and
                enjoyable space for all children!
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
