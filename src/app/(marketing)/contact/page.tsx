"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Send,
} from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    // Simulate form submission
    console.log("Form submitted:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitted(true);
  };

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
              {isSubmitted ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold text-bark">
                    Message Sent!
                  </h3>
                  <p className="mt-3 max-w-sm font-body text-stone">
                    Thank you for getting in touch. We&apos;ll respond to your
                    message as soon as possible, usually within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 font-display font-semibold text-forest transition-colors hover:text-meadow"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl font-bold text-bark sm:text-3xl">
                    Send Us a Message
                  </h2>
                  <p className="mt-2 font-body text-stone">
                    Fill out the form below and we&apos;ll get back to you soon.
                  </p>

                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-8 space-y-6"
                  >
                    {/* Name Field */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block font-body text-sm font-medium text-stone"
                      >
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register("name")}
                        className={`mt-2 block w-full rounded-lg border bg-white px-4 py-3 font-body text-bark placeholder:text-pebble focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30 ${
                          errors.name ? "border-red-500" : "border-stone/30"
                        }`}
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="mt-1 font-body text-sm text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block font-body text-sm font-medium text-stone"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        {...register("email")}
                        className={`mt-2 block w-full rounded-lg border bg-white px-4 py-3 font-body text-bark placeholder:text-pebble focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30 ${
                          errors.email ? "border-red-500" : "border-stone/30"
                        }`}
                        placeholder="you@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 font-body text-sm text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone Field (Optional) */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block font-body text-sm font-medium text-stone"
                      >
                        Phone{" "}
                        <span className="font-normal text-pebble">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        {...register("phone")}
                        className="mt-2 block w-full rounded-lg border border-stone/30 bg-white px-4 py-3 font-body text-bark placeholder:text-pebble focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
                        placeholder="Your phone number"
                      />
                    </div>

                    {/* Message Field */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block font-body text-sm font-medium text-stone"
                      >
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        {...register("message")}
                        className={`mt-2 block w-full resize-none rounded-lg border bg-white px-4 py-3 font-body text-bark placeholder:text-pebble focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30 ${
                          errors.message ? "border-red-500" : "border-stone/30"
                        }`}
                        placeholder="How can we help you?"
                      />
                      {errors.message && (
                        <p className="mt-1 font-body text-sm text-red-500">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-sunshine px-6 py-3 font-display font-semibold text-bark transition-colors hover:bg-amber focus:outline-none focus:ring-2 focus:ring-sunshine focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-bark border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
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
