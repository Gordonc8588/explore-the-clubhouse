import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getAdInsights, isMetaAdsConfigured } from "@/lib/meta-ads";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

/**
 * POST /api/admin/ads/metrics/sync
 * Sync metrics from Meta API for all active ads
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMetaAdsConfigured()) {
    return NextResponse.json(
      { error: "Meta Ads API not configured" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { adId, datePreset = "last_7d" } = body;

    const supabase = createAdminClient();

    // Get ads to sync - either specific ad or all with Meta IDs
    let adsQuery = supabase
      .from("meta_ads")
      .select("id, meta_ad_id, name")
      .not("meta_ad_id", "is", null);

    if (adId) {
      adsQuery = adsQuery.eq("id", adId);
    }

    const { data: ads, error: adsError } = await adsQuery;

    if (adsError) {
      console.error("Failed to fetch ads:", adsError);
      return NextResponse.json(
        { error: "Failed to fetch ads" },
        { status: 500 }
      );
    }

    if (!ads || ads.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No ads to sync",
        synced: 0,
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const results: Array<{ adId: string; success: boolean; error?: string }> = [];

    for (const ad of ads) {
      try {
        // Fetch insights from Meta API
        const insights = await getAdInsights({
          adId: ad.meta_ad_id!,
          datePreset: datePreset as "today" | "yesterday" | "last_7d" | "last_30d" | "lifetime",
        });

        if (!insights) {
          results.push({
            adId: ad.id,
            success: true,
            error: "No insights available yet",
          });
          continue;
        }

        // Upsert metrics for today (or use lifetime for cumulative)
        const { error: upsertError } = await supabase
          .from("meta_ad_metrics")
          .upsert(
            {
              ad_id: ad.id,
              date: today,
              impressions: insights.impressions,
              reach: insights.reach,
              clicks: insights.clicks,
              spend: insights.spend,
              conversions: insights.conversions,
              ctr: insights.ctr,
              cpc: insights.cpc,
              cpm: insights.cpm,
            },
            {
              onConflict: "ad_id,date",
            }
          );

        if (upsertError) {
          console.error(`Failed to upsert metrics for ad ${ad.id}:`, upsertError);
          results.push({
            adId: ad.id,
            success: false,
            error: upsertError.message,
          });
        } else {
          results.push({ adId: ad.id, success: true });
        }
      } catch (error) {
        console.error(`Error syncing metrics for ad ${ad.id}:`, error);
        results.push({
          adId: ad.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Synced ${successCount}/${ads.length} ads`,
      synced: successCount,
      results,
    });
  } catch (error) {
    console.error("Error syncing metrics:", error);
    return NextResponse.json(
      { error: "Failed to sync metrics" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/ads/metrics/sync
 * Get sync status/last sync time
 */
export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin-session")?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Get the most recent metric date
    const { data, error } = await supabase
      .from("meta_ad_metrics")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      configured: isMetaAdsConfigured(),
      lastSync: data?.created_at || null,
    });
  } catch (error) {
    console.error("Error getting sync status:", error);
    return NextResponse.json(
      { error: "Failed to get sync status" },
      { status: 500 }
    );
  }
}
