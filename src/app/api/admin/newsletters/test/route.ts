import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { sendTestNewsletter } from "@/lib/email";
import type { Newsletter, Club, PromoCode } from "@/types/database";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

const testSchema = z.object({
  newsletterId: z.string().uuid(),
  testEmail: z.string().email(),
});

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = testSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { newsletterId, testEmail } = parsed.data;

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

    // Send test email
    const result = await sendTestNewsletter(
      newsletter as Newsletter,
      testEmail,
      club,
      promoCode
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send test email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error sending test newsletter:", error);
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
