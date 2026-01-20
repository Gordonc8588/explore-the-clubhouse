import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="bg-cream">
      {/* Header */}
      <section className="bg-gradient-to-b from-sage/30 to-cream">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-body text-sm text-stone transition-colors hover:text-forest"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-bark sm:text-4xl">
            Terms & Conditions
          </h1>
          <p className="mt-2 font-body text-stone">
            Last updated: January 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
              <p className="font-body text-stone">
                Welcome to Explore the Clubhouse. By booking a place for your
                child at our holiday club, you agree to be bound by these Terms
                & Conditions. Please read them carefully before making a
                booking.
              </p>
            </div>

            {/* Section 1 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                1. Booking and Payment
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  <strong className="text-bark">1.1</strong> All bookings must
                  be made through our online booking system or by contacting us
                  directly. Bookings are not confirmed until payment has been
                  received in full.
                </p>
                <p>
                  <strong className="text-bark">1.2</strong> Full payment is
                  required at the time of booking unless otherwise agreed in
                  writing. We accept payment by credit/debit card or bank
                  transfer.
                </p>
                <p>
                  <strong className="text-bark">1.3</strong> Prices are as
                  quoted at the time of booking and include all activities,
                  snacks, and supervision during the session.
                </p>
                <p>
                  <strong className="text-bark">1.4</strong> Sibling discounts
                  and multi-day booking discounts may be available. Please check
                  our website or contact us for current offers.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                2. Cancellation and Refunds
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  <strong className="text-bark">2.1</strong> Cancellations made
                  more than 14 days before the booked session will receive a
                  full refund minus a £10 administration fee.
                </p>
                <p>
                  <strong className="text-bark">2.2</strong> Cancellations made
                  7-14 days before the session will receive a 50% refund.
                </p>
                <p>
                  <strong className="text-bark">2.3</strong> Cancellations made
                  less than 7 days before the session are non-refundable.
                  However, we may offer a credit note for future use at our
                  discretion.
                </p>
                <p>
                  <strong className="text-bark">2.4</strong> If Explore the
                  Clubhouse cancels a session due to unforeseen circumstances
                  (e.g., extreme weather), a full refund or alternative date
                  will be offered.
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                3. Drop-off and Collection
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  <strong className="text-bark">3.1</strong> Sessions typically
                  run from 9:00 AM to 3:30 PM unless otherwise stated. Drop-off
                  is from 8:45 AM and collection must be by 3:45 PM.
                </p>
                <p>
                  <strong className="text-bark">3.2</strong> Children may only
                  be collected by authorised adults named on the registration
                  form. Photo ID may be requested.
                </p>
                <p>
                  <strong className="text-bark">3.3</strong> Late collection may
                  incur an additional charge of £10 per 15 minutes. Persistent
                  late collection may result in the child&apos;s place being
                  withdrawn.
                </p>
                <p>
                  <strong className="text-bark">3.4</strong> If you need to make
                  alternative collection arrangements, please inform us in
                  writing (email is acceptable) before the start of the session.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                4. Health and Medical Information
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  <strong className="text-bark">4.1</strong> Parents/carers must
                  provide accurate and up-to-date health information on the
                  registration form, including allergies, medical conditions,
                  and medications.
                </p>
                <p>
                  <strong className="text-bark">4.2</strong> If your child
                  requires medication during the session, you must complete a
                  medication consent form and provide clear instructions.
                </p>
                <p>
                  <strong className="text-bark">4.3</strong> Children who are
                  unwell should not attend. If a child becomes ill during a
                  session, we will contact you to arrange collection.
                </p>
                <p>
                  <strong className="text-bark">4.4</strong> In the event of an
                  emergency, we will contact you immediately. If we cannot reach
                  you, we will seek appropriate medical attention.
                </p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                5. Behaviour and Conduct
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  <strong className="text-bark">5.1</strong> We expect all
                  children to behave in a kind and respectful manner towards
                  staff, other children, animals, and the environment.
                </p>
                <p>
                  <strong className="text-bark">5.2</strong> Our staff will
                  manage behaviour positively. However, if a child&apos;s
                  behaviour poses a risk to themselves or others, we may contact
                  you to discuss the situation.
                </p>
                <p>
                  <strong className="text-bark">5.3</strong> In serious cases,
                  we reserve the right to exclude a child from the session
                  without refund if their behaviour is persistently disruptive
                  or dangerous.
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                6. Clothing and Personal Belongings
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  <strong className="text-bark">6.1</strong> Children should
                  wear appropriate clothing for outdoor activities, including
                  long trousers, closed-toe shoes, and weather-appropriate
                  layers. We will advise on specific requirements.
                </p>
                <p>
                  <strong className="text-bark">6.2</strong> Please label all
                  belongings clearly with your child&apos;s name. We cannot be
                  held responsible for lost or damaged personal items.
                </p>
                <p>
                  <strong className="text-bark">6.3</strong> Valuable items,
                  including electronic devices and expensive jewellery, should
                  be left at home.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                7. Photography and Media
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  <strong className="text-bark">7.1</strong> We may take
                  photographs and videos during sessions for promotional
                  purposes, including our website, social media, and marketing
                  materials.
                </p>
                <p>
                  <strong className="text-bark">7.2</strong> You will be asked
                  to give consent for photography on the registration form. If
                  you do not consent, we will ensure your child is not included
                  in any media.
                </p>
                <p>
                  <strong className="text-bark">7.3</strong> We will never
                  publish a child&apos;s full name alongside their photograph.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                8. Liability
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  <strong className="text-bark">8.1</strong> Explore the
                  Clubhouse holds public liability insurance. However, we accept
                  no liability for injury or loss arising from the
                  child&apos;s participation in activities unless caused by our
                  negligence.
                </p>
                <p>
                  <strong className="text-bark">8.2</strong> Outdoor activities
                  carry inherent risks. By booking, you acknowledge and accept
                  that your child will be participating in activities such as
                  farm work, woodland exploration, and animal handling.
                </p>
                <p>
                  <strong className="text-bark">8.3</strong> We maintain
                  comprehensive risk assessments for all activities and
                  locations.
                </p>
              </div>
            </div>

            {/* Section 9 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                9. Changes to Terms
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  <strong className="text-bark">9.1</strong> We reserve the
                  right to update these Terms & Conditions at any time.
                  Significant changes will be communicated to existing
                  customers.
                </p>
                <p>
                  <strong className="text-bark">9.2</strong> The terms in force
                  at the time of booking will apply to that booking.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-12 rounded-2xl border-l-4 border-forest bg-white p-6 shadow-[var(--shadow-md)]">
              <h2 className="font-display text-xl font-bold text-bark">
                Questions?
              </h2>
              <p className="mt-2 font-body text-stone">
                If you have any questions about these Terms & Conditions, please
                contact us at{" "}
                <a
                  href="mailto:hello@exploretheclubhouse.co.uk"
                  className="text-forest underline hover:text-meadow"
                >
                  hello@exploretheclubhouse.co.uk
                </a>{" "}
                or call us on{" "}
                <a
                  href="tel:+441234567890"
                  className="text-forest underline hover:text-meadow"
                >
                  01onal 234 567
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
