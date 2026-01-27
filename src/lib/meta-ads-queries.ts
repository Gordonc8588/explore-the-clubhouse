/**
 * Meta Ads Analytics Queries
 * Helper functions for aggregating ad performance data
 */

import { createAdminClient } from "@/lib/supabase/server";
import type { MetaAd, MetaAdMetrics } from "@/types/database";

export interface AdWithMetrics extends MetaAd {
  metrics: MetaAdMetrics | null;
  totalMetrics: AggregatedMetrics;
}

export interface AggregatedMetrics {
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;  // In pence
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
}

export interface DailyMetrics {
  date: string;
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export interface AdPerformanceSummary {
  totalSpend: number;
  totalConversions: number;
  totalImpressions: number;
  totalClicks: number;
  totalReach: number;
  averageCtr: number;
  averageCpc: number;
  averageCpm: number;
  roas: number;  // Return on ad spend
  attributedRevenue: number;
}

export interface TimeRange {
  since: string;  // YYYY-MM-DD
  until: string;  // YYYY-MM-DD
}

/**
 * Get all ads with their aggregated metrics
 */
export async function getAdsWithMetrics(
  timeRange?: TimeRange
): Promise<AdWithMetrics[]> {
  const supabase = createAdminClient();

  // Get all ads
  const { data: ads, error: adsError } = await supabase
    .from("meta_ads")
    .select("*")
    .order("created_at", { ascending: false });

  if (adsError || !ads) {
    console.error("Failed to fetch ads:", adsError);
    return [];
  }

  // Get metrics for each ad
  const adsWithMetrics: AdWithMetrics[] = [];

  for (const ad of ads) {
    const totalMetrics = await getAdAggregatedMetrics(ad.id, timeRange);
    const latestMetric = await getAdLatestMetric(ad.id);

    adsWithMetrics.push({
      ...ad,
      metrics: latestMetric,
      totalMetrics,
    });
  }

  return adsWithMetrics;
}

/**
 * Get aggregated metrics for a single ad
 */
export async function getAdAggregatedMetrics(
  adId: string,
  timeRange?: TimeRange
): Promise<AggregatedMetrics> {
  const supabase = createAdminClient();

  let query = supabase
    .from("meta_ad_metrics")
    .select("*")
    .eq("ad_id", adId);

  if (timeRange) {
    query = query
      .gte("date", timeRange.since)
      .lte("date", timeRange.until);
  }

  const { data: metrics, error } = await query;

  if (error || !metrics || metrics.length === 0) {
    return {
      impressions: 0,
      reach: 0,
      clicks: 0,
      spend: 0,
      conversions: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
    };
  }

  // Aggregate all metrics
  const totals = metrics.reduce(
    (acc, m) => ({
      impressions: acc.impressions + (m.impressions || 0),
      reach: acc.reach + (m.reach || 0),
      clicks: acc.clicks + (m.clicks || 0),
      spend: acc.spend + (m.spend || 0),
      conversions: acc.conversions + (m.conversions || 0),
    }),
    { impressions: 0, reach: 0, clicks: 0, spend: 0, conversions: 0 }
  );

  // Calculate derived metrics
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const cpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;

  return {
    ...totals,
    ctr,
    cpc,
    cpm,
  };
}

/**
 * Get the latest metric record for an ad
 */
export async function getAdLatestMetric(adId: string): Promise<MetaAdMetrics | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("meta_ad_metrics")
    .select("*")
    .eq("ad_id", adId)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Get daily metrics for charting
 */
export async function getDailyMetrics(
  adId?: string,
  timeRange?: TimeRange
): Promise<DailyMetrics[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("meta_ad_metrics")
    .select("date, impressions, reach, clicks, spend, conversions");

  if (adId) {
    query = query.eq("ad_id", adId);
  }

  if (timeRange) {
    query = query
      .gte("date", timeRange.since)
      .lte("date", timeRange.until);
  }

  const { data, error } = await query.order("date", { ascending: true });

  if (error || !data) {
    return [];
  }

  // If no adId specified, aggregate by date
  if (!adId) {
    const dateMap = new Map<string, DailyMetrics>();

    for (const row of data) {
      const existing = dateMap.get(row.date);
      if (existing) {
        existing.impressions += row.impressions || 0;
        existing.reach += row.reach || 0;
        existing.clicks += row.clicks || 0;
        existing.spend += row.spend || 0;
        existing.conversions += row.conversions || 0;
      } else {
        dateMap.set(row.date, {
          date: row.date,
          impressions: row.impressions || 0,
          reach: row.reach || 0,
          clicks: row.clicks || 0,
          spend: row.spend || 0,
          conversions: row.conversions || 0,
        });
      }
    }

    return Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  return data.map((row) => ({
    date: row.date,
    impressions: row.impressions || 0,
    reach: row.reach || 0,
    clicks: row.clicks || 0,
    spend: row.spend || 0,
    conversions: row.conversions || 0,
  }));
}

/**
 * Get overall performance summary for all ads
 */
export async function getPerformanceSummary(
  timeRange?: TimeRange
): Promise<AdPerformanceSummary> {
  const supabase = createAdminClient();

  // Get aggregated metrics
  let metricsQuery = supabase
    .from("meta_ad_metrics")
    .select("impressions, reach, clicks, spend, conversions");

  if (timeRange) {
    metricsQuery = metricsQuery
      .gte("date", timeRange.since)
      .lte("date", timeRange.until);
  }

  const { data: metrics, error: metricsError } = await metricsQuery;

  // Get attributed bookings revenue
  let bookingsQuery = supabase
    .from("bookings")
    .select("total_amount, utm_source, utm_campaign, created_at")
    .eq("utm_source", "facebook")
    .eq("utm_medium", "paid")
    .in("status", ["paid", "complete"]);

  if (timeRange) {
    bookingsQuery = bookingsQuery
      .gte("created_at", timeRange.since)
      .lte("created_at", timeRange.until + "T23:59:59Z");
  }

  const { data: bookings, error: bookingsError } = await bookingsQuery;

  // Calculate totals
  const totals = (metrics || []).reduce(
    (acc, m) => ({
      impressions: acc.impressions + (m.impressions || 0),
      reach: acc.reach + (m.reach || 0),
      clicks: acc.clicks + (m.clicks || 0),
      spend: acc.spend + (m.spend || 0),
      conversions: acc.conversions + (m.conversions || 0),
    }),
    { impressions: 0, reach: 0, clicks: 0, spend: 0, conversions: 0 }
  );

  // Calculate attributed revenue
  const attributedRevenue = (bookings || []).reduce(
    (acc, b) => acc + (b.total_amount || 0),
    0
  );

  // Calculate derived metrics
  const averageCtr = totals.impressions > 0
    ? (totals.clicks / totals.impressions) * 100
    : 0;
  const averageCpc = totals.clicks > 0
    ? totals.spend / totals.clicks
    : 0;
  const averageCpm = totals.impressions > 0
    ? (totals.spend / totals.impressions) * 1000
    : 0;
  const roas = totals.spend > 0
    ? attributedRevenue / totals.spend
    : 0;

  return {
    totalSpend: totals.spend,
    totalConversions: totals.conversions,
    totalImpressions: totals.impressions,
    totalClicks: totals.clicks,
    totalReach: totals.reach,
    averageCtr,
    averageCpc,
    averageCpm,
    roas,
    attributedRevenue,
  };
}

/**
 * Get attributed bookings for an ad
 */
export async function getAdAttributedBookings(
  adId: string,
  timeRange?: TimeRange
): Promise<{ count: number; revenue: number }> {
  const supabase = createAdminClient();

  let query = supabase
    .from("bookings")
    .select("total_amount")
    .eq("utm_source", "facebook")
    .eq("utm_medium", "paid")
    .eq("utm_campaign", adId)
    .in("status", ["paid", "complete"]);

  if (timeRange) {
    query = query
      .gte("created_at", timeRange.since)
      .lte("created_at", timeRange.until + "T23:59:59Z");
  }

  const { data, error } = await query;

  if (error || !data) {
    return { count: 0, revenue: 0 };
  }

  return {
    count: data.length,
    revenue: data.reduce((acc, b) => acc + (b.total_amount || 0), 0),
  };
}

/**
 * Get top performing ads by a metric
 */
export async function getTopPerformingAds(
  metric: "spend" | "clicks" | "conversions" | "impressions",
  limit: number = 5,
  timeRange?: TimeRange
): Promise<Array<{ adId: string; adName: string; value: number }>> {
  const supabase = createAdminClient();

  // Get all ads with their names
  const { data: ads, error: adsError } = await supabase
    .from("meta_ads")
    .select("id, name");

  if (adsError || !ads) {
    return [];
  }

  // Build a map of ad names
  const adNames = new Map<string, string>();
  for (const ad of ads) {
    adNames.set(ad.id, ad.name);
  }

  // Get metrics
  let query = supabase
    .from("meta_ad_metrics")
    .select("ad_id, impressions, clicks, spend, conversions");

  if (timeRange) {
    query = query
      .gte("date", timeRange.since)
      .lte("date", timeRange.until);
  }

  const { data: metrics, error: metricsError } = await query;

  if (metricsError || !metrics) {
    return [];
  }

  // Aggregate by ad
  const adTotals = new Map<string, number>();

  for (const m of metrics) {
    const current = adTotals.get(m.ad_id) || 0;
    adTotals.set(m.ad_id, current + (m[metric] || 0));
  }

  // Sort and get top N
  const sorted = Array.from(adTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  return sorted.map(([adId, value]) => ({
    adId,
    adName: adNames.get(adId) || "Unknown",
    value,
  }));
}
