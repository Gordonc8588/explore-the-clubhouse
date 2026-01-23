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
    <div style={{ backgroundColor: "var(--craigies-cream)" }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-16 sm:py-24"
        style={{ backgroundColor: "var(--craigies-olive)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "white",
              }}
            >
              Contact Us
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-body text-lg text-white/90 sm:text-xl">
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
            <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
                <h2
                  className="text-2xl font-bold sm:text-3xl"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  Get in Touch
                </h2>
                <p
                  className="mt-2 font-body"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Have questions? We&apos;re here to help. Reach out through any
                  of the channels below.
                </p>

                <div className="mt-8 space-y-6">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "var(--craigies-cream)" }}
                    >
                      <MapPin
                        className="h-6 w-6"
                        style={{ color: "var(--craigies-burnt-orange)" }}
                      />
                    </div>
                    <div>
                      <h3
                        className="font-semibold"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          color: "var(--craigies-dark-olive)",
                        }}
                      >
                        Address
                      </h3>
                      <p
                        className="mt-1 font-body"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
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
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "var(--craigies-cream)" }}
                    >
                      <Phone
                        className="h-6 w-6"
                        style={{ color: "var(--craigies-burnt-orange)" }}
                      />
                    </div>
                    <div>
                      <h3
                        className="font-semibold"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          color: "var(--craigies-dark-olive)",
                        }}
                      >
                        Phone
                      </h3>
                      <p className="mt-1 font-body">
                        <a
                          href="tel:+447907879303"
                          className="transition-opacity hover:opacity-80"
                          style={{ color: "var(--craigies-dark-olive)" }}
                        >
                          07907 879303
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "var(--craigies-cream)" }}
                    >
                      <Mail
                        className="h-6 w-6"
                        style={{ color: "var(--craigies-burnt-orange)" }}
                      />
                    </div>
                    <div>
                      <h3
                        className="font-semibold"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          color: "var(--craigies-dark-olive)",
                        }}
                      >
                        Email
                      </h3>
                      <p className="mt-1 font-body">
                        <a
                          href="mailto:hello@exploretheclubhouse.co.uk"
                          className="transition-opacity hover:opacity-80"
                          style={{ color: "var(--craigies-dark-olive)" }}
                        >
                          hello@exploretheclubhouse.co.uk
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="flex gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "var(--craigies-cream)" }}
                    >
                      <Clock
                        className="h-6 w-6"
                        style={{ color: "var(--craigies-burnt-orange)" }}
                      />
                    </div>
                    <div>
                      <h3
                        className="font-semibold"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          color: "var(--craigies-dark-olive)",
                        }}
                      >
                        Office Hours
                      </h3>
                      <p
                        className="mt-1 font-body"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
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
              <div className="overflow-hidden rounded-2xl bg-white shadow-md">
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
          <div
            className="rounded-2xl p-8 text-center sm:p-12"
            style={{ backgroundColor: "var(--craigies-olive)" }}
          >
            <h2
              className="text-3xl font-bold text-white sm:text-4xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Looking for More Information?
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-lg text-white/90">
              Check out our frequently asked questions or book a visit to see
              our farm in person.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/clubs"
                className="inline-block rounded-lg px-8 py-3 text-lg font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: "var(--craigies-burnt-orange)",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Book a Visit
              </a>
              <a
                href="/about"
                className="cta-button-secondary inline-block rounded-lg border-2 border-white px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
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
