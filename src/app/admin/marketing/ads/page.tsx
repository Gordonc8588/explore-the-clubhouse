import { createAdminClient } from "@/lib/supabase/server";
import { Megaphone, DollarSign, Eye, MousePointer, Plus } from "lucide-react";
import Link from "next/link";
import { AdsManager } from "./AdsManager";
import { isMetaAdsConfigured } from "@/lib/meta-ads";

async function getAdsData() {
  const supabase = createAdminClient();

  // Fetch ads with their clubs
  const { data: ads } = await supabase
    .from("meta_ads")
    .select(`
      *,
      clubs(id, name, slug)
    `)
    .order("created_at", { ascending: false });

  // Fetch clubs for filters/form
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("start_date", { ascending: false });

  // Fetch promo codes for form
  const { data: promoCodes } = await supabase
    .from("promo_codes")
    .select("id, code, discount_percent")
    .eq("is_active", true)
    .order("code", { ascending: true });

  // Calculate stats
  const allAds = ads || [];
  const activeAds = allAds.filter((a) => a.status === "active");
  const draftAds = allAds.filter((a) => a.status === "draft");
  const pendingAds = allAds.filter((a) => a.status === "pending");

  // Fetch total metrics for active ads
  const { data: metrics } = await supabase
    .from("meta_ad_metrics")
    .select("spend, impressions, clicks")
    .in(
      "ad_id",
      activeAds.map((a) => a.id)
    );

  const totalSpend = metrics?.reduce((sum, m) => sum + (m.spend || 0), 0) || 0;
  const totalImpressions = metrics?.reduce((sum, m) => sum + (m.impressions || 0), 0) || 0;
  const totalClicks = metrics?.reduce((sum, m) => sum + (m.clicks || 0), 0) || 0;

  return {
    ads: allAds,
    clubs: clubs || [],
    promoCodes: promoCodes || [],
    stats: {
      totalAds: allAds.length,
      activeAds: activeAds.length,
      draftAds: draftAds.length,
      pendingAds: pendingAds.length,
      totalSpend,
      totalImpressions,
      totalClicks,
    },
  };
}

export default async function AdsPage() {
  const data = await getAdsData();
  const isConfigured = isMetaAdsConfigured();

  // Format spend in pounds
  const formatSpend = (pence: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(pence / 100);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Meta Ads
          </h2>
          <p className="mt-1" style={{ color: "var(--craigies-dark-olive)" }}>
            Create and manage Facebook &amp; Instagram advertising campaigns
          </p>
        </div>
        <Link
          href="/admin/marketing/ads/create"
          className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            fontFamily: "'Playfair Display', serif",
            backgroundColor: "var(--craigies-burnt-orange)",
          }}
        >
          <Plus className="h-5 w-5" />
          Create Ad
        </Link>
      </div>

      {/* Configuration Warning */}
      {!isConfigured && (
        <div
          className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <Megaphone className="h-6 w-6 flex-shrink-0 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800">
                Meta Ads Not Configured
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                Meta Ads API credentials are not fully configured. You can create
                draft ads, but publishing requires META_SYSTEM_USER_TOKEN,
                META_AD_ACCOUNT_ID, and META_PAGE_ID environment variables.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Ads */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
            >
              <Megaphone className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Active Ads
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {data.stats.activeAds}
              </p>
            </div>
          </div>
        </div>

        {/* Total Spend */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
            >
              <DollarSign
                className="h-6 w-6"
                style={{ color: "var(--craigies-burnt-orange)" }}
              />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Total Spend
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {formatSpend(data.stats.totalSpend)}
              </p>
            </div>
          </div>
        </div>

        {/* Impressions */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
            >
              <Eye
                className="h-6 w-6"
                style={{ color: "var(--craigies-olive)" }}
              />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Impressions
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {data.stats.totalImpressions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Clicks */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
            >
              <MousePointer className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Clicks
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {data.stats.totalClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ads Manager Component */}
      <AdsManager
        initialAds={data.ads}
        clubs={data.clubs}
        promoCodes={data.promoCodes}
      />
    </div>
  );
}
