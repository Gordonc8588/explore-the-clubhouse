import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { updateAdStatus, updateAdSetStatus, isMetaAdsConfigured } from "@/lib/meta-ads";

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

    // Get the ad
    const { data: ad, error: fetchError } = await supabase
      .from("meta_ads")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    // Check if ad is paused
    if (ad.status !== "paused") {
      return NextResponse.json(
        { error: "Only paused ads can be resumed" },
        { status: 400 }
      );
    }

    // Resume in Meta API if configured and has Meta IDs
    if (isMetaAdsConfigured() && ad.meta_ad_id && ad.meta_adset_id) {
      try {
        // Resume the ad set
        await updateAdSetStatus(ad.meta_adset_id, "ACTIVE");
        // Also resume the ad directly
        await updateAdStatus(ad.meta_ad_id, "ACTIVE");
      } catch (metaError) {
        console.error("Failed to resume ad in Meta:", metaError);
        return NextResponse.json(
          { error: "Failed to resume ad in Meta. Please try again or check Meta Ads Manager." },
          { status: 500 }
        );
      }
    }

    // Update local database
    const { error: updateError } = await supabase
      .from("meta_ads")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update ad status:", updateError);
      return NextResponse.json(
        { error: "Failed to resume ad" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Ad resumed" });
  } catch (error) {
    console.error("Error resuming ad:", error);
    return NextResponse.json(
      { error: "Failed to resume ad" },
      { status: 500 }
    );
  }
}
