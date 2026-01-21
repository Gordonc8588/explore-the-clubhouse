import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with The Clubhouse. We're happy to answer questions about our holiday clubs, booking, or anything else. Located at Craigies Farm, South Queensferry.",
  openGraph: {
    title: "Contact Us | The Clubhouse",
    description:
      "Get in touch with The Clubhouse. We're happy to answer questions about our holiday clubs, booking, or anything else.",
  },
};

export default function ContactPage() {
  return (
    <div className="bg-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sage/30 to-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-bark sm:text-5xl">
              Contact Us
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-stone sm:text-xl">
              We&apos;d love to hear from you. Whether you have a question about
              our activities, booking, or anything else, our team is ready to
              help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)] sm:p-8">
                <h2 className="font-display text-2xl font-bold text-bark sm:text-3xl">
                  Get in Touch
                </h2>
                <p className="mt-2 font-body text-stone">
                  Have questions? We&apos;re here to help. Reach out through any
                  of the channels below.
                </p>

                <div className="mt-8 space-y-6">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage/20">
                      <MapPin className="h-6 w-6 text-forest" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-bark">
                        Address
                      </h3>
                      <p className="mt-1 font-body text-stone">
                        The Clubhouse
                        <br />
                        West Craigie Farm
                        <br />
                        South Queensferry EH30 9AR
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage/20">
                      <Phone className="h-6 w-6 text-forest" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-bark">
                        Phone
                      </h3>
                      <p className="mt-1 font-body text-stone">
                        <a
                          href="tel:+447907879303"
                          className="transition-colors hover:text-forest"
                        >
                          07907 879303
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage/20">
                      <Mail className="h-6 w-6 text-forest" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-bark">
                        Email
                      </h3>
                      <p className="mt-1 font-body text-stone">
                        <a
                          href="mailto:hello@exploretheclubhouse.co.uk"
                          className="transition-colors hover:text-forest"
                        >
                          hello@exploretheclubhouse.co.uk
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage/20">
                      <Clock className="h-6 w-6 text-forest" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-bark">
                        Office Hours
                      </h3>
                      <p className="mt-1 font-body text-stone">
                        Monday - Friday: 8:00am - 5:00pm
                        <br />
                        Saturday: 9:00am - 12:00pm
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-md)]">
                <div className="aspect-[16/10]">
                  <iframe
                    src="https://maps.google.com/maps?q=Craigies+Farm+South+Queensferry+EH30+9AR&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="The Clubhouse Location - West Craigie Farm, South Queensferry"
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Prompt Section */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-meadow to-forest p-8 text-center sm:p-12">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Looking for More Information?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-lg text-sage">
              Check out our frequently asked questions or book a visit to see
              our farm in person.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/book"
                className="inline-block rounded-lg bg-sunshine px-8 py-3 font-display text-lg font-semibold text-bark transition-colors hover:bg-amber focus:outline-none focus:ring-2 focus:ring-sunshine focus:ring-offset-2 focus:ring-offset-forest"
              >
                Book a Visit
              </a>
              <a
                href="/about"
                className="inline-block rounded-lg border-2 border-white px-8 py-3 font-display text-lg font-semibold text-white transition-colors hover:bg-white hover:text-forest focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-forest"
              >
                Learn About Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
