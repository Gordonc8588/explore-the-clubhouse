import Link from "next/link";
import { ChevronLeft, Shield, Phone, Mail } from "lucide-react";

export default function SafeguardingPage() {
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
            Safeguarding Statement
          </h1>
          <p className="mt-2 font-body text-stone">
            Our commitment to keeping children safe
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <div className="rounded-2xl bg-forest p-6 shadow-[var(--shadow-md)] sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sunshine/20">
                  <Shield className="h-6 w-6 text-sunshine" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    Our Commitment
                  </h2>
                  <p className="mt-2 font-body text-sage">
                    At The Clubhouse, the safety and wellbeing of every
                    child is our absolute priority. We are committed to creating
                    a safe, nurturing environment where children can explore,
                    learn, and have fun with confidence.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                Our Safeguarding Policy
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  We have a comprehensive safeguarding policy that outlines our
                  procedures for protecting children from harm. All staff
                  members are required to read, understand, and follow this
                  policy.
                </p>
                <p>Our safeguarding approach is based on the principle that:</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>The child&apos;s welfare is paramount</li>
                  <li>All children have the right to protection from abuse</li>
                  <li>All suspicions and allegations must be taken seriously and responded to swiftly</li>
                  <li>Staff must work in partnership with parents and other agencies</li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                Designated Safeguarding Lead
              </h2>
              <div className="mt-4 rounded-xl bg-white p-6 shadow-[var(--shadow-md)]">
                <p className="font-body text-stone">
                  Our Designated Safeguarding Lead (DSL) is responsible for
                  overseeing all safeguarding matters at The Clubhouse.
                  They are trained to the appropriate level and keep their
                  knowledge up to date.
                </p>
                <div className="mt-4 rounded-lg bg-cloud p-4">
                  <p className="font-display font-semibold text-bark">
                    Designated Safeguarding Lead
                  </p>
                  <p className="font-body text-stone">Michael Davies</p>
                  <p className="mt-2 font-body text-sm text-stone">
                    Contact via our main office if you have any safeguarding
                    concerns.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                Safer Recruitment
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  We operate robust safer recruitment practices to ensure that
                  all staff and volunteers are suitable to work with children:
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Enhanced DBS (Disclosure and Barring Service) checks for all staff</li>
                  <li>Verification of identity and right to work</li>
                  <li>At least two references, including from the most recent employer</li>
                  <li>Full employment history with explanations for any gaps</li>
                  <li>Checks against the Children&apos;s Barred List</li>
                  <li>Interview process designed to assess suitability for working with children</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                Staff Training
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>All our staff receive:</p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Safeguarding and child protection training before starting work</li>
                  <li>Regular refresher training (at least annually)</li>
                  <li>Paediatric first aid certification</li>
                  <li>Training on recognising signs of abuse and neglect</li>
                  <li>Prevent duty awareness training</li>
                  <li>Online safety awareness</li>
                </ul>
                <p>
                  Training records are maintained and monitored to ensure all
                  staff remain up to date.
                </p>
              </div>
            </div>

            {/* Section 5 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                Recognising Abuse
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  Our staff are trained to recognise the signs of different
                  types of abuse:
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-cloud bg-white p-4">
                    <h3 className="font-display font-semibold text-bark">Physical Abuse</h3>
                    <p className="mt-1 text-sm text-stone">
                      Unexplained injuries, fear of physical contact,
                      flinching, or withdrawal
                    </p>
                  </div>
                  <div className="rounded-lg border border-cloud bg-white p-4">
                    <h3 className="font-display font-semibold text-bark">Emotional Abuse</h3>
                    <p className="mt-1 text-sm text-stone">
                      Low self-esteem, extreme behaviour changes, delayed
                      development
                    </p>
                  </div>
                  <div className="rounded-lg border border-cloud bg-white p-4">
                    <h3 className="font-display font-semibold text-bark">Neglect</h3>
                    <p className="mt-1 text-sm text-stone">
                      Poor hygiene, inadequate clothing, constant hunger,
                      untreated medical issues
                    </p>
                  </div>
                  <div className="rounded-lg border border-cloud bg-white p-4">
                    <h3 className="font-display font-semibold text-bark">Sexual Abuse</h3>
                    <p className="mt-1 text-sm text-stone">
                      Age-inappropriate sexual behaviour, physical symptoms,
                      regression
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                Reporting Concerns
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  If you have any concerns about a child&apos;s safety or
                  wellbeing, please report them to us immediately. All concerns
                  are taken seriously and handled confidentially.
                </p>
                <p>
                  <strong className="text-bark">Our procedure for reporting concerns:</strong>
                </p>
                <ol className="ml-6 list-decimal space-y-2">
                  <li>
                    Staff members report any concerns to the Designated
                    Safeguarding Lead immediately
                  </li>
                  <li>
                    The DSL assesses the concern and decides on appropriate
                    action
                  </li>
                  <li>
                    If necessary, a referral is made to the Local Authority
                    Designated Officer (LADO) or Children&apos;s Social Care
                  </li>
                  <li>
                    All concerns are documented and stored securely
                  </li>
                  <li>
                    Parents/carers are informed unless doing so would put the
                    child at further risk
                  </li>
                </ol>
              </div>
            </div>

            {/* Section 7 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                Physical Contact and Personal Care
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  We maintain clear guidelines on physical contact and personal
                  care to protect both children and staff:
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Physical contact is kept to a minimum and is always appropriate to the child&apos;s age and needs</li>
                  <li>Comfort and reassurance may include age-appropriate hugs if initiated by the child</li>
                  <li>First aid is administered by trained staff with another adult present where possible</li>
                  <li>Personal care (e.g., assistance with toileting for younger children) is handled sensitively with parental consent</li>
                  <li>Staff never transport children alone in their personal vehicles</li>
                </ul>
              </div>
            </div>

            {/* Section 8 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                Online Safety
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  While our activities are primarily outdoors, we take online
                  safety seriously:
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Children are not permitted to use personal electronic devices during sessions</li>
                  <li>Any photography is conducted by staff only, with parental consent</li>
                  <li>Staff do not communicate with children or parents through personal social media accounts</li>
                  <li>All official communications go through our business channels</li>
                </ul>
              </div>
            </div>

            {/* Section 9 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                Whistleblowing
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  We encourage all staff, volunteers, parents, and visitors to
                  report any concerns about the conduct of staff members or the
                  running of our setting. Whistleblowers are protected by law
                  and will not face retaliation.
                </p>
                <p>
                  If you have concerns about a member of staff, including the
                  DSL, please contact the Local Authority Designated Officer
                  (LADO) directly.
                </p>
              </div>
            </div>

            {/* Section 10 */}
            <div className="mt-8">
              <h2 className="font-display text-2xl font-bold text-bark">
                Review and Updates
              </h2>
              <div className="mt-4 space-y-4 font-body text-stone">
                <p>
                  Our safeguarding policy and procedures are reviewed annually
                  or whenever there are changes to legislation or guidance. All
                  staff are informed of any updates and receive additional
                  training as needed.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-12 rounded-2xl border-l-4 border-coral bg-white p-6 shadow-[var(--shadow-md)]">
              <h2 className="font-display text-xl font-bold text-bark">
                Report a Concern
              </h2>
              <p className="mt-2 font-body text-stone">
                If you have any safeguarding concerns, please contact us
                immediately:
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <a
                  href="tel:+441234567890"
                  className="inline-flex items-center gap-2 font-body text-forest hover:text-meadow"
                >
                  <Phone className="h-4 w-4" />
                  01onal 234 567
                </a>
                <a
                  href="mailto:safeguarding@exploretheclubhouse.co.uk"
                  className="inline-flex items-center gap-2 font-body text-forest hover:text-meadow"
                >
                  <Mail className="h-4 w-4" />
                  safeguarding@exploretheclubhouse.co.uk
                </a>
              </div>
            </div>

            {/* External Resources */}
            <div className="mt-8 rounded-2xl bg-cloud p-6">
              <h2 className="font-display text-xl font-bold text-bark">
                External Safeguarding Resources
              </h2>
              <p className="mt-2 font-body text-stone">
                If you are concerned about a child&apos;s safety and need to
                speak to someone outside our organisation:
              </p>
              <ul className="mt-4 space-y-2 font-body text-stone">
                <li>
                  <strong className="text-bark">NSPCC Helpline:</strong> 0808
                  800 5000
                </li>
                <li>
                  <strong className="text-bark">Childline:</strong> 0800 1111
                </li>
                <li>
                  <strong className="text-bark">Local Authority Children&apos;s Services:</strong>{" "}
                  Contact your local council
                </li>
                <li>
                  <strong className="text-bark">Police:</strong> 999 (emergency)
                  or 101 (non-emergency)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
