/**
 * Import Ads from Meta API
 * POST /api/admin/ads/import - Sync all ads from Meta Ad Account to local database
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import {
  getAllAdsFromMeta,
  getAdSetFromMeta,
  getCreativeFromMeta,
  isMetaAdsConfigured,
} from "@/lib/meta-ads";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMetaAdsConfigured()) {
    return NextResponse.json(
      { error: "Meta Ads API is not configured. Please check environment variables." },
      { status: 500 }
    );
  }

  try {
    const supabase = createAdminClient();

    // Fetch all ads from Meta
    console.log("Fetching ads from Meta...");
    const metaAds = await getAllAdsFromMeta();
    console.log(`Found ${metaAds.length} ads in Meta`);

    // Get existing ads from database to avoid duplicates
    const { data: existingAds } = await supabase
      .from("meta_ads")
      .select("meta_ad_id");

    const existingMetaIds = new Set(
      existingAds?.map((a) => a.meta_ad_id).filter(Boolean) || []
    );

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const metaAd of metaAds) {
      try {
        // Check if this ad already exists in our database
        const alreadyExists = existingMetaIds.has(metaAd.id);

        // Fetch additional details
        const [adSetData, creativeData] = await Promise.all([
          getAdSetFromMeta(metaAd.adset_id),
          metaAd.creative_id ? getCreativeFromMeta(metaAd.creative_id) : null,
        ]);

        // Extract creative details
        const linkData = creativeData?.object_story_spec?.link_data;
        const primaryText = linkData?.message || "";
        const headline = linkData?.name || "";
        const description = linkData?.description || "";
        const ctaUrl = linkData?.link || "";
        const ctaType = linkData?.call_to_action?.type || "LEARN_MORE";
        const imageUrl = creativeData?.image_url || creativeData?.thumbnail_url;

        // Determine status
        let status = "draft";
        switch (metaAd.effective_status) {
          case "ACTIVE":
            status = "active";
            break;
          case "PAUSED":
            status = "paused";
            break;
          case "PENDING_REVIEW":
          case "IN_PROCESS":
            status = "pending_review";
            break;
          case "DISAPPROVED":
            status = "rejected";
            break;
          case "CAMPAIGN_PAUSED":
          case "ADSET_PAUSED":
            status = "paused";
            break;
          case "ARCHIVED":
          case "DELETED":
            status = "completed";
            break;
          default:
            status = "draft";
        }

        // Extract budget info
        const budgetType = adSetData?.daily_budget ? "daily" : "lifetime";
        const budgetAmount = adSetData?.daily_budget
          ? Math.round(parseFloat(adSetData.daily_budget))
          : adSetData?.lifetime_budget
          ? Math.round(parseFloat(adSetData.lifetime_budget))
          : null;

        const adData = {
          name: metaAd.name,
          status,
          meta_ad_id: metaAd.id,
          meta_campaign_id: metaAd.campaign_id,
          meta_adset_id: metaAd.adset_id,
          meta_creative_id: metaAd.creative_id || null,
          primary_text: primaryText || null,
          headline: headline || null,
          description: description || null,
          cta_type: ctaType,
          cta_url: ctaUrl || null,
          image_urls: imageUrl ? [imageUrl] : [],
          budget_type: budgetType,
          budget_amount: budgetAmount,
          schedule_start: adSetData?.start_time
            ? adSetData.start_time.split("T")[0]
            : null,
          schedule_end: adSetData?.end_time
            ? adSetData.end_time.split("T")[0]
            : null,
          custom_targeting: adSetData?.targeting || null,
          published_at: metaAd.created_time,
        };

        if (alreadyExists) {
          // Update existing record
          const { error: updateError } = await supabase
            .from("meta_ads")
            .update(adData)
            .eq("meta_ad_id", metaAd.id);

          if (updateError) {
            errors.push(`Failed to update ${metaAd.name}: ${updateError.message}`);
          } else {
            updated++;
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from("meta_ads")
            .insert({
              ...adData,
              // Try to determine objective from campaign if available
              objective: "OUTCOME_TRAFFIC",
            });

          if (insertError) {
            errors.push(`Failed to import ${metaAd.name}: ${insertError.message}`);
          } else {
            imported++;
          }
        }
      } catch (adError) {
        const errorMessage = adError instanceof Error ? adError.message : "Unknown error";
        errors.push(`Error processing ${metaAd.name}: ${errorMessage}`);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import complete: ${imported} new, ${updated} updated, ${skipped} skipped`,
      stats: {
        total: metaAds.length,
        imported,
        updated,
        skipped,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Limit errors shown
    });
  } catch (error) {
    console.error("Error importing ads from Meta:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Provide helpful error messages for common issues
    let userMessage = "Failed to import ads from Meta";
    if (errorMessage.includes("(#3)") || errorMessage.includes("capability")) {
      userMessage = "Your Facebook App doesn't have ads_read permission. Please enable it in the Facebook Developer Console.";
    } else if (errorMessage.includes("OAuthException")) {
      userMessage = "Authentication failed. Please check your Meta API token.";
    }

    return NextResponse.json(
      { error: userMessage, details: errorMessage },
      { status: 500 }
    );
  }
}
