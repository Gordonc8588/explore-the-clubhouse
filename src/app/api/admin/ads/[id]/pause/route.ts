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

    // Check if ad is active
    if (ad.status !== "active") {
      return NextResponse.json(
        { error: "Only active ads can be paused" },
        { status: 400 }
      );
    }

    // Pause in Meta API if configured and has Meta IDs
    if (isMetaAdsConfigured() && ad.meta_ad_id && ad.meta_adset_id) {
      try {
        // Pause the ad set (which pauses all ads in it)
        await updateAdSetStatus(ad.meta_adset_id, "PAUSED");
        // Also pause the ad directly
        await updateAdStatus(ad.meta_ad_id, "PAUSED");
      } catch (metaError) {
        console.error("Failed to pause ad in Meta:", metaError);
        // Continue to update local status even if Meta fails
      }
    }

    // Update local database
    const { error: updateError } = await supabase
      .from("meta_ads")
      .update({ status: "paused", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update ad status:", updateError);
      return NextResponse.json(
        { error: "Failed to pause ad" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Ad paused" });
  } catch (error) {
    console.error("Error pausing ad:", error);
    return NextResponse.json(
      { error: "Failed to pause ad" },
      { status: 500 }
    );
  }
}
