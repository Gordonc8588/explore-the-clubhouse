import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { verifyRecaptchaToken, isRecaptchaConfigured } from "@/lib/recaptcha";
import { Resend } from "resend";

// Contact form schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address").max(255),
  phone: z.string().max(20).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  recaptchaToken: z.string().optional(),
});

// Rate limit: 5 requests per minute
const RATE_LIMIT_OPTIONS = {
  maxTokens: 5,
  refillInterval: 60 * 1000,
  refillRate: 5,
};

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request.headers);
    const rateLimitResult = rateLimit(clientIP, RATE_LIMIT_OPTIONS);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
            "Retry-After": String(
              Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = contactSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, phone, message, recaptchaToken } = validationResult.data;

    // Verify reCAPTCHA if configured
    if (isRecaptchaConfigured()) {
      const recaptchaResult = await verifyRecaptchaToken(
        recaptchaToken || "",
        "contact"
      );

      if (!recaptchaResult.success) {
        return NextResponse.json(
          { error: recaptchaResult.error || "reCAPTCHA verification failed" },
          { status: 400 }
        );
      }
    }

    // Save to database
    const supabase = await createClient();
    const { error: dbError } = await supabase.from("contact_submissions").insert({
      name,
      email,
      phone: phone || null,
      message,
      ip_address: clientIP,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save your message. Please try again." },
        { status: 500 }
      );
    }

    // Send email notification (graceful failure)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "The Clubhouse <noreply@exploretheclubhouse.co.uk>",
          to: ["hello@exploretheclubhouse.co.uk"],
          replyTo: email,
          subject: `New Contact Form Submission from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Submitted via exploretheclubhouse.co.uk contact form
            </p>
          `,
        });
      } catch (emailError) {
        // Log but don't fail the request
        console.error("Email notification failed:", emailError);
      }
    }

    return NextResponse.json(
      { success: true, message: "Your message has been sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
