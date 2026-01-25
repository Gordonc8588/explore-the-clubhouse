import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

// Confirmation schema
const confirmSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = confirmSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid confirmation token." },
        { status: 400 }
      );
    }

    const { token } = validationResult.data;

    const supabase = createAdminClient();

    // Find subscriber by token
    const { data: subscriber, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, confirmed_at")
      .eq("confirmation_token", token)
      .single();

    if (fetchError || !subscriber) {
      return NextResponse.json(
        { error: "Invalid or expired confirmation link." },
        { status: 404 }
      );
    }

    // Already confirmed
    if (subscriber.confirmed_at) {
      return NextResponse.json(
        {
          success: true,
          message: "Your email is already confirmed.",
          alreadyConfirmed: true,
        },
        { status: 200 }
      );
    }

    // Confirm the subscription
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        confirmed_at: new Date().toISOString(),
        confirmation_token: null, // Clear the token after use
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Failed to confirm subscription:", updateError);
      return NextResponse.json(
        { error: "Failed to confirm subscription. Please try again." },
        { status: 500 }
      );
    }

    // Send welcome email
    const emailResult = await sendNewsletterWelcomeEmail(subscriber.email);
    if (!emailResult.success) {
      console.error("Failed to send welcome email:", emailResult.error);
      // Don't fail the confirmation - it's already done
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your email has been confirmed! Welcome to The Clubhouse newsletter.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter confirmation error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// Also support GET for direct link clicks
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    // Redirect to home with error
    return NextResponse.redirect(new URL("/?error=invalid-token", request.url));
  }

  const supabase = createAdminClient();

  // Find subscriber by token
  const { data: subscriber, error: fetchError } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, confirmed_at")
    .eq("confirmation_token", token)
    .single();

  if (fetchError || !subscriber) {
    // Redirect to confirmation page with error
    return NextResponse.redirect(
      new URL("/confirm-email?status=invalid", request.url)
    );
  }

  // Already confirmed
  if (subscriber.confirmed_at) {
    return NextResponse.redirect(
      new URL("/confirm-email?status=already-confirmed", request.url)
    );
  }

  // Confirm the subscription
  const { error: updateError } = await supabase
    .from("newsletter_subscribers")
    .update({
      confirmed_at: new Date().toISOString(),
      confirmation_token: null,
    })
    .eq("id", subscriber.id);

  if (updateError) {
    console.error("Failed to confirm subscription:", updateError);
    return NextResponse.redirect(
      new URL("/confirm-email?status=error", request.url)
    );
  }

  // Send welcome email (don't await - let it happen in background)
  sendNewsletterWelcomeEmail(subscriber.email).catch((err) =>
    console.error("Failed to send welcome email:", err)
  );

  // Redirect to success page
  return NextResponse.redirect(
    new URL("/confirm-email?status=success", request.url)
  );
}
