import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { sendNewsletterConfirmationEmail } from "@/lib/email";
import crypto from "crypto";

// Newsletter subscription schema
const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(255),
  source: z.string().default("footer"),
});

// Rate limit: 5 requests per minute
const RATE_LIMIT_OPTIONS = {
  maxTokens: 5,
  refillInterval: 60 * 1000,
  refillRate: 5,
};

// Generate a secure random token
function generateConfirmationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Brevo API sync (graceful failure)
async function syncToBrevo(email: string, source: string): Promise<void> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.log("Brevo API key not configured, skipping sync");
    return;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        email,
        attributes: {
          SOURCE: source,
          SIGNUP_DATE: new Date().toISOString(),
        },
        listIds: [], // Add list IDs in Brevo if you have specific lists
        updateEnabled: true, // Update if contact already exists
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Brevo sync failed:", response.status, errorData);
    } else {
      console.log("Successfully synced to Brevo:", email);
    }
  } catch (error) {
    console.error("Brevo sync error:", error);
  }
}

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
    const validationResult = newsletterSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, source } = validationResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, confirmed_at, unsubscribed_at")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      // Already confirmed and not unsubscribed
      if (existing.confirmed_at && !existing.unsubscribed_at) {
        return NextResponse.json(
          { error: "This email is already subscribed to our newsletter." },
          { status: 409 }
        );
      }

      // Previously unsubscribed - allow re-subscribe with new confirmation
      if (existing.unsubscribed_at) {
        const confirmationToken = generateConfirmationToken();

        const { error: updateError } = await supabase
          .from("newsletter_subscribers")
          .update({
            confirmation_token: confirmationToken,
            confirmed_at: null,
            unsubscribed_at: null,
            source,
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Database update error:", updateError);
          return NextResponse.json(
            { error: "Failed to subscribe. Please try again." },
            { status: 500 }
          );
        }

        // Send confirmation email
        const emailResult = await sendNewsletterConfirmationEmail(normalizedEmail, confirmationToken);
        if (!emailResult.success) {
          console.error("Failed to send confirmation email:", emailResult.error);
        }

        return NextResponse.json(
          {
            success: true,
            message: "Please check your email to confirm your subscription.",
            requiresConfirmation: true,
          },
          { status: 200 }
        );
      }

      // Exists but not confirmed - resend confirmation
      const confirmationToken = generateConfirmationToken();

      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          confirmation_token: confirmationToken,
          source,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Database update error:", updateError);
        return NextResponse.json(
          { error: "Failed to subscribe. Please try again." },
          { status: 500 }
        );
      }

      // Resend confirmation email
      const emailResult = await sendNewsletterConfirmationEmail(normalizedEmail, confirmationToken);
      if (!emailResult.success) {
        console.error("Failed to send confirmation email:", emailResult.error);
      }

      return NextResponse.json(
        {
          success: true,
          message: "Please check your email to confirm your subscription.",
          requiresConfirmation: true,
        },
        { status: 200 }
      );
    }

    // New subscriber - create with confirmation token
    const confirmationToken = generateConfirmationToken();

    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: normalizedEmail,
        source,
        confirmation_token: confirmationToken,
      });

    if (dbError) {
      // Check if it's a duplicate email error (race condition)
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "This email is already subscribed to our newsletter." },
          { status: 409 }
        );
      }

      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    // Send confirmation email
    const emailResult = await sendNewsletterConfirmationEmail(normalizedEmail, confirmationToken);
    if (!emailResult.success) {
      console.error("Failed to send confirmation email:", emailResult.error);
      // Don't fail the request - they can request resend
    }

    // Sync to Brevo (secondary, graceful failure) - only after confirmation
    // We'll move this to the confirm endpoint later
    // For now, sync immediately to capture the lead
    syncToBrevo(normalizedEmail, source).catch((err) =>
      console.error("Background Brevo sync failed:", err)
    );

    return NextResponse.json(
      {
        success: true,
        message: "Please check your email to confirm your subscription.",
        requiresConfirmation: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
