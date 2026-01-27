"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  Eye,
  MousePointerClick,
  Users,
  TrendingUp,
  RefreshCw,
  BarChart3,
  ExternalLink,
  Download,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { KPICard } from "@/components/admin/analytics/KPICard";

type DateRange = "7d" | "30d" | "90d";

interface PerformanceSummary {
  totalSpend: number;
  totalConversions: number;
  totalImpressions: number;
  totalClicks: number;
  totalReach: number;
  averageCtr: number;
  averageCpc: number;
  averageCpm: number;
  roas: number;
  attributedRevenue: number;
}

interface DailyMetric {
  date: string;
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  conversions: number;
}

interface AdComparison {
  id: string;
  name: string;
  status: string;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  spend: number;
  conversions: number;
}

function formatPrice(pence: number): string {
  return `£${(pence / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  publishing: { label: "Publishing", className: "bg-blue-100 text-blue-700" },
  pending_review: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
  },
  active: { label: "Active", className: "bg-green-100 text-green-700" },
  paused: { label: "Paused", className: "bg-gray-100 text-gray-600" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  completed: { label: "Completed", className: "bg-purple-100 text-purple-700" },
};

interface ImportResult {
  success: boolean;
  message: string;
  stats?: {
    total: number;
    imported: number;
    updated: number;
    skipped: number;
    errors: number;
  };
}

export function AdsAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [adsComparison, setAdsComparison] = useState<AdComparison[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ads/analytics?range=${dateRange}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setDailyMetrics(data.dailyMetrics || []);
        setAdsComparison(data.adsComparison || []);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncMetrics = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/ads/metrics/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datePreset: "last_7d" }),
      });
      if (res.ok) {
        // Refresh data after sync
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to sync metrics:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleImportFromMeta = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/admin/ads/import", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setImportResult({
          success: true,
          message: data.message,
          stats: data.stats,
        });
        // Refresh data after import
        await fetchData();
      } else {
        setImportResult({
          success: false,
          message: data.error || "Failed to import ads",
        });
      }
    } catch (error) {
      console.error("Failed to import from Meta:", error);
      setImportResult({
        success: false,
        message: "Failed to connect to server",
      });
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Calculate max value for chart scaling
  const maxSpend = Math.max(...dailyMetrics.map((d) => d.spend), 1);
  const maxConversions = Math.max(...dailyMetrics.map((d) => d.conversions), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Ads Analytics
          </h1>
          <p
            className="mt-1"
            style={{ color: "var(--craigies-dark-olive)", opacity: 0.7 }}
          >
            Track your Meta ad performance and ROI
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Import from Meta Button */}
          <button
            onClick={handleImportFromMeta}
            disabled={importing}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <Download
              className={`h-4 w-4 ${importing ? "animate-pulse" : ""}`}
            />
            {importing ? "Importing..." : "Import from Meta"}
          </button>

          {/* Sync Metrics Button */}
          <button
            onClick={handleSyncMetrics}
            disabled={syncing}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing..." : "Sync Metrics"}
          </button>

          {/* Date Range Picker */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {(["7d", "30d", "90d"] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  dateRange === range
                    ? "text-white"
                    : "hover:bg-gray-100"
                }`}
                style={
                  dateRange === range
                    ? { backgroundColor: "var(--craigies-burnt-orange)" }
                    : { color: "var(--craigies-dark-olive)" }
                }
              >
                {range === "7d" && "7 days"}
                {range === "30d" && "30 days"}
                {range === "90d" && "90 days"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Import Result Message */}
      {importResult && (
        <div
          className={`flex items-start gap-3 rounded-xl p-4 ${
            importResult.success
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {importResult.success ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          )}
          <div className="flex-1">
            <p className="font-medium">{importResult.message}</p>
            {importResult.stats && (
              <p className="mt-1 text-sm opacity-80">
                {importResult.stats.imported} imported, {importResult.stats.updated} updated
                {importResult.stats.errors > 0 && `, ${importResult.stats.errors} errors`}
              </p>
            )}
          </div>
          <button
            onClick={() => setImportResult(null)}
            className="text-current opacity-60 hover:opacity-100"
          >
            &times;
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Ad Spend"
          value={loading ? "..." : formatPrice(summary?.totalSpend || 0)}
          icon={
            <DollarSign
              className="h-5 w-5"
              style={{ color: "var(--craigies-burnt-orange)" }}
            />
          }
        />
        <KPICard
          title="Impressions"
          value={loading ? "..." : formatNumber(summary?.totalImpressions || 0)}
          icon={
            <Eye
              className="h-5 w-5"
              style={{ color: "var(--craigies-burnt-orange)" }}
            />
          }
        />
        <KPICard
          title="Clicks"
          value={loading ? "..." : formatNumber(summary?.totalClicks || 0)}
          icon={
            <MousePointerClick
              className="h-5 w-5"
              style={{ color: "var(--craigies-burnt-orange)" }}
            />
          }
        />
        <KPICard
          title="Conversions"
          value={loading ? "..." : String(summary?.totalConversions || 0)}
          icon={
            <Users
              className="h-5 w-5"
              style={{ color: "var(--craigies-burnt-orange)" }}
            />
          }
        />
        <KPICard
          title="ROAS"
          value={loading ? "..." : `${(summary?.roas || 0).toFixed(2)}x`}
          icon={
            <TrendingUp
              className="h-5 w-5"
              style={{ color: "var(--craigies-burnt-orange)" }}
            />
          }
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Avg. CTR</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: "var(--craigies-dark-olive)" }}>
            {loading ? "..." : `${(summary?.averageCtr || 0).toFixed(2)}%`}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Avg. CPC</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: "var(--craigies-dark-olive)" }}>
            {loading ? "..." : formatPrice(summary?.averageCpc || 0)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Avg. CPM</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: "var(--craigies-dark-olive)" }}>
            {loading ? "..." : formatPrice(summary?.averageCpm || 0)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Attributed Revenue</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: "var(--craigies-dark-olive)" }}>
            {loading ? "..." : formatPrice(summary?.attributedRevenue || 0)}
          </p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--craigies-dark-olive)" }}
          >
            Performance Over Time
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
              />
              Spend
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              Conversions
            </span>
          </div>
        </div>

        {dailyMetrics.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">No data available for this period</p>
              <p className="text-sm">Sync metrics from Meta to see performance</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <div className="flex h-full items-end gap-1">
              {dailyMetrics.map((day, i) => (
                <div
                  key={day.date}
                  className="group relative flex flex-1 flex-col items-center gap-1"
                >
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                    <p className="font-medium">
                      {new Date(day.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p>Spend: {formatPrice(day.spend)}</p>
                    <p>Conversions: {day.conversions}</p>
                  </div>

                  {/* Bars */}
                  <div
                    className="w-full rounded-t transition-all hover:opacity-80"
                    style={{
                      backgroundColor: "var(--craigies-burnt-orange)",
                      height: `${(day.spend / maxSpend) * 100}%`,
                      minHeight: day.spend > 0 ? "4px" : "0",
                    }}
                  />
                  <div
                    className="w-full rounded-t bg-green-500 transition-all hover:opacity-80"
                    style={{
                      height: `${(day.conversions / maxConversions) * 30}%`,
                      minHeight: day.conversions > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ads Comparison Table */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--craigies-dark-olive)" }}
          >
            Ad Performance Comparison
          </h2>
          <Link
            href="/admin/marketing/ads"
            className="flex items-center gap-1 text-sm hover:underline"
            style={{ color: "var(--craigies-burnt-orange)" }}
          >
            View All Ads
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {adsComparison.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p>No published ads found</p>
            <Link
              href="/admin/marketing/ads/create"
              className="mt-2 inline-block rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
            >
              Create Your First Ad
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className="border-b"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  <th className="pb-3 font-medium">Ad Name</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Impressions</th>
                  <th className="pb-3 text-right font-medium">Reach</th>
                  <th className="pb-3 text-right font-medium">Clicks</th>
                  <th className="pb-3 text-right font-medium">CTR</th>
                  <th className="pb-3 text-right font-medium">CPC</th>
                  <th className="pb-3 text-right font-medium">Spend</th>
                  <th className="pb-3 text-right font-medium">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {adsComparison.map((ad) => (
                  <tr key={ad.id} className="border-b last:border-0">
                    <td className="py-3">
                      <Link
                        href={`/admin/marketing/ads/${ad.id}`}
                        className="font-medium hover:underline"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
                        {ad.name}
                      </Link>
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          STATUS_BADGES[ad.status]?.className || "bg-gray-100"
                        }`}
                      >
                        {STATUS_BADGES[ad.status]?.label || ad.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      {formatNumber(ad.impressions)}
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      {formatNumber(ad.reach)}
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      {formatNumber(ad.clicks)}
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      {ad.ctr.toFixed(2)}%
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      {formatPrice(ad.cpc)}
                    </td>
                    <td className="py-3 text-right font-medium" style={{ color: "var(--craigies-dark-olive)" }}>
                      {formatPrice(ad.spend)}
                    </td>
                    <td className="py-3 text-right font-medium text-green-600">
                      {ad.conversions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
