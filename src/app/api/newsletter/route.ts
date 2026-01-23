import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

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

    // Save to Supabase (primary storage)
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: email.toLowerCase().trim(),
        source,
      });

    if (dbError) {
      // Check if it's a duplicate email error
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

    // Sync to Brevo (secondary, graceful failure)
    // This happens in the background and doesn't block the response
    syncToBrevo(email, source).catch((err) =>
      console.error("Background Brevo sync failed:", err)
    );

    return NextResponse.json(
      {
        success: true,
        message: "Thanks for subscribing! You'll hear from us soon.",
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
