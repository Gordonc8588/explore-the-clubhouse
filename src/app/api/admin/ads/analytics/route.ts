import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getPerformanceSummary,
  getDailyMetrics,
  getAdsWithMetrics,
  getTopPerformingAds,
} from "@/lib/meta-ads-queries";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

function getDateRange(range: string): { since: string; until: string } {
  const until = new Date();
  const since = new Date();

  switch (range) {
    case "7d":
      since.setDate(since.getDate() - 7);
      break;
    case "30d":
      since.setDate(since.getDate() - 30);
      break;
    case "90d":
      since.setDate(since.getDate() - 90);
      break;
    default:
      since.setDate(since.getDate() - 30);
  }

  return {
    since: since.toISOString().split("T")[0],
    until: until.toISOString().split("T")[0],
  };
}

/**
 * GET /api/admin/ads/analytics
 * Get ads analytics dashboard data
 */
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const range = url.searchParams.get("range") || "30d";
    const timeRange = getDateRange(range);

    // Fetch all data in parallel
    const [summary, dailyMetrics, adsWithMetrics, topBySpend, topByConversions] =
      await Promise.all([
        getPerformanceSummary(timeRange),
        getDailyMetrics(undefined, timeRange),
        getAdsWithMetrics(timeRange),
        getTopPerformingAds("spend", 5, timeRange),
        getTopPerformingAds("conversions", 5, timeRange),
      ]);

    // Build ads comparison table data
    const adsComparison = adsWithMetrics
      .filter((ad) => ad.meta_ad_id) // Only show published ads
      .map((ad) => ({
        id: ad.id,
        name: ad.name,
        status: ad.status,
        impressions: ad.totalMetrics.impressions,
        reach: ad.totalMetrics.reach,
        clicks: ad.totalMetrics.clicks,
        ctr: ad.totalMetrics.ctr,
        cpc: ad.totalMetrics.cpc,
        cpm: ad.totalMetrics.cpm,
        spend: ad.totalMetrics.spend,
        conversions: ad.totalMetrics.conversions,
      }))
      .sort((a, b) => b.spend - a.spend);

    return NextResponse.json({
      summary,
      dailyMetrics,
      adsComparison,
      topBySpend,
      topByConversions,
      timeRange,
    });
  } catch (error) {
    console.error("Error fetching ads analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
