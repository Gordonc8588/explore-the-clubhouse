import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { sendNewsletter } from "@/lib/email";
import type { Newsletter, Club, PromoCode } from "@/types/database";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

const sendSchema = z.object({
  newsletterId: z.string().uuid(),
});

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = sendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { newsletterId } = parsed.data;

    const supabase = createAdminClient();

    // Fetch the newsletter
    const { data: newsletter, error: fetchError } = await supabase
      .from("newsletters")
      .select("*")
      .eq("id", newsletterId)
      .single();

    if (fetchError || !newsletter) {
      return NextResponse.json(
        { error: "Newsletter not found" },
        { status: 404 }
      );
    }

    if (newsletter.status === "sent") {
      return NextResponse.json(
        { error: "Newsletter has already been sent" },
        { status: 400 }
      );
    }

    // Fetch featured club if set
    let club: Club | null = null;
    if (newsletter.featured_club_id) {
      const { data: clubData } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", newsletter.featured_club_id)
        .single();
      club = clubData;
    }

    // Fetch promo code if set
    let promoCode: PromoCode | null = null;
    if (newsletter.promo_code_id) {
      const { data: promoData } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("id", newsletter.promo_code_id)
        .single();
      promoCode = promoData;
    }

    // Fetch all confirmed and active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .not("confirmed_at", "is", null)  // Only confirmed subscribers
      .is("unsubscribed_at", null);      // Not unsubscribed

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      return NextResponse.json(
        { error: "Failed to fetch subscribers" },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: "No confirmed subscribers to send to" },
        { status: 400 }
      );
    }

    const subscriberEmails = subscribers.map((s) => s.email);

    // Send the newsletter
    const result = await sendNewsletter(
      newsletter as Newsletter,
      subscriberEmails,
      club,
      promoCode
    );

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to send newsletter", details: result.errors },
        { status: 500 }
      );
    }

    // Update newsletter status
    const { error: updateError } = await supabase
      .from("newsletters")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: result.sentCount,
      })
      .eq("id", newsletterId);

    if (updateError) {
      console.error("Error updating newsletter status:", updateError);
      // Don't fail the request as emails were already sent
    }

    return NextResponse.json({
      success: true,
      sentCount: result.sentCount,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
