import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import {
  getAdAggregatedMetrics,
  getDailyMetrics,
  getAdAttributedBookings,
} from "@/lib/meta-ads-queries";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/ads/[id]/metrics
 * Get metrics for a single ad
 */
export async function GET(request: Request, { params }: RouteParams) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const url = new URL(request.url);
    const since = url.searchParams.get("since");
    const until = url.searchParams.get("until");

    const supabase = createAdminClient();

    // Verify ad exists
    const { data: ad, error: adError } = await supabase
      .from("meta_ads")
      .select("id, name, status, meta_ad_id")
      .eq("id", id)
      .single();

    if (adError || !ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    const timeRange = since && until ? { since, until } : undefined;

    // Get aggregated metrics
    const aggregatedMetrics = await getAdAggregatedMetrics(id, timeRange);

    // Get daily metrics for charting
    const dailyMetrics = await getDailyMetrics(id, timeRange);

    // Get attributed bookings
    const attributedBookings = await getAdAttributedBookings(id, timeRange);

    // Calculate ROAS
    const roas = aggregatedMetrics.spend > 0
      ? attributedBookings.revenue / aggregatedMetrics.spend
      : 0;

    return NextResponse.json({
      ad: {
        id: ad.id,
        name: ad.name,
        status: ad.status,
        hasMetaId: !!ad.meta_ad_id,
      },
      metrics: {
        ...aggregatedMetrics,
        attributedBookings: attributedBookings.count,
        attributedRevenue: attributedBookings.revenue,
        roas,
      },
      dailyMetrics,
      timeRange: timeRange || { since: "all", until: "time" },
    });
  } catch (error) {
    console.error("Error fetching ad metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch ad metrics" },
      { status: 500 }
    );
  }
}
