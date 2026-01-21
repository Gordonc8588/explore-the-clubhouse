"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Send, AlertCircle } from "lucide-react";
import Script from "next/script";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    if (!recaptchaSiteKey) {
      console.log("reCAPTCHA site key not configured");
      return null;
    }

    // Check if grecaptcha is available
    if (typeof window === "undefined" || !window.grecaptcha) {
      console.log("grecaptcha not available");
      return null;
    }

    return new Promise((resolve) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(recaptchaSiteKey, {
            action: "contact",
          });
          resolve(token);
        } catch (err) {
          console.error("reCAPTCHA execution failed:", err);
          resolve(null);
        }
      });
    });
  }, [recaptchaSiteKey]);

  const handleRecaptchaLoad = () => {
    // Wait for grecaptcha to be fully ready
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        setRecaptchaReady(true);
      });
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError(null);

    try {
      // Get reCAPTCHA token if available
      const recaptchaToken = await getRecaptchaToken();

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      setIsSubmitted(true);
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mt-6 font-display text-2xl font-bold text-bark">
          Message Sent!
        </h3>
        <p className="mt-3 max-w-sm font-body text-stone">
          Thank you for getting in touch. We&apos;ll respond to your message as
          soon as possible, usually within 24 hours.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-6 font-display font-semibold text-forest transition-colors hover:text-meadow"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Load reCAPTCHA script if site key is configured */}
      {recaptchaSiteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
          onLoad={handleRecaptchaLoad}
          strategy="afterInteractive"
        />
      )}

      <h2 className="font-display text-2xl font-bold text-bark sm:text-3xl">
        Send Us a Message
      </h2>
      <p className="mt-2 font-body text-stone">
        Fill out the form below and we&apos;ll get back to you soon.
      </p>

      {submitError && (
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="font-body text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
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
            Phone <span className="font-normal text-pebble">(optional)</span>
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

        {/* reCAPTCHA notice */}
        {recaptchaSiteKey && (
          <p className="font-body text-xs text-pebble">
            This site is protected by reCAPTCHA and the Google{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-stone"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-stone"
            >
              Terms of Service
            </a>{" "}
            apply.
          </p>
        )}

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
  );
}
