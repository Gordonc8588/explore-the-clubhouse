import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Get the original ad
    const { data: originalAd, error: fetchError } = await supabase
      .from("meta_ads")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !originalAd) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    // Create a new ad as a copy (draft status, no Meta IDs)
    const { data: newAd, error: insertError } = await supabase
      .from("meta_ads")
      .insert({
        name: `${originalAd.name} (Copy)`,
        club_id: originalAd.club_id,
        promo_code_id: originalAd.promo_code_id,
        objective: originalAd.objective,
        primary_text: originalAd.primary_text,
        headline: originalAd.headline,
        description: originalAd.description,
        cta_type: originalAd.cta_type,
        cta_url: originalAd.cta_url,
        image_urls: originalAd.image_urls,
        targeting_preset: originalAd.targeting_preset,
        custom_targeting: originalAd.custom_targeting,
        budget_type: originalAd.budget_type,
        budget_amount: originalAd.budget_amount,
        // Don't copy schedule - let user set new dates
        schedule_start: null,
        schedule_end: null,
        status: "draft",
        // Don't copy Meta IDs - this is a new ad
        meta_campaign_id: null,
        meta_adset_id: null,
        meta_creative_id: null,
        meta_ad_id: null,
        meta_image_hash: null,
        meta_review_status: null,
        meta_rejection_reason: null,
        published_at: null,
      })
      .select()
      .single();

    if (insertError || !newAd) {
      console.error("Failed to duplicate ad:", insertError);
      return NextResponse.json(
        { error: "Failed to duplicate ad" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ad duplicated",
      ad: newAd,
    });
  } catch (error) {
    console.error("Error duplicating ad:", error);
    return NextResponse.json(
      { error: "Failed to duplicate ad" },
      { status: 500 }
    );
  }
}
