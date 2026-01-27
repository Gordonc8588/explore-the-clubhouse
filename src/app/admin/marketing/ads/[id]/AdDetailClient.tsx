"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Copy,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  TrendingUp,
  MousePointer,
  DollarSign,
  Users,
  BarChart3,
  Loader2,
  RefreshCw,
  Edit,
  Calendar,
  Target,
} from "lucide-react";
import type { MetaAd, MetaAdMetrics, Club, PromoCode } from "@/types/database";

interface AdDetailClientProps {
  ad: MetaAd & {
    club: Pick<Club, "id" | "name" | "slug"> | null;
    promo_code: Pick<PromoCode, "id" | "code" | "discount_percent"> | null;
  };
  metrics: MetaAdMetrics[] | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; bgColor: string }> = {
  draft: { label: "Draft", color: "text-gray-600", icon: Edit, bgColor: "bg-gray-100" },
  publishing: { label: "Publishing...", color: "text-blue-600", icon: Loader2, bgColor: "bg-blue-100" },
  pending_review: { label: "Pending Review", color: "text-amber-600", icon: Clock, bgColor: "bg-amber-100" },
  active: { label: "Active", color: "text-green-600", icon: CheckCircle, bgColor: "bg-green-100" },
  paused: { label: "Paused", color: "text-gray-600", icon: Pause, bgColor: "bg-gray-100" },
  rejected: { label: "Rejected", color: "text-red-600", icon: XCircle, bgColor: "bg-red-100" },
  completed: { label: "Completed", color: "text-blue-600", icon: CheckCircle, bgColor: "bg-blue-100" },
};

export function AdDetailClient({ ad, metrics }: AdDetailClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusConfig = STATUS_CONFIG[ad.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  // Calculate aggregate metrics
  const totalMetrics = metrics?.reduce(
    (acc, m) => ({
      impressions: acc.impressions + m.impressions,
      reach: acc.reach + m.reach,
      clicks: acc.clicks + m.clicks,
      spend: acc.spend + m.spend,
      conversions: acc.conversions + m.conversions,
    }),
    { impressions: 0, reach: 0, clicks: 0, spend: 0, conversions: 0 }
  ) || { impressions: 0, reach: 0, clicks: 0, spend: 0, conversions: 0 };

  const ctr = totalMetrics.impressions > 0
    ? ((totalMetrics.clicks / totalMetrics.impressions) * 100).toFixed(2)
    : "0.00";

  const cpc = totalMetrics.clicks > 0
    ? (totalMetrics.spend / totalMetrics.clicks / 100).toFixed(2)
    : "0.00";

  const handleAction = async (action: "pause" | "resume" | "duplicate" | "delete") => {
    setIsLoading(action);
    setError(null);

    try {
      const endpoint = action === "delete"
        ? `/api/admin/ads/${ad.id}`
        : `/api/admin/ads/${ad.id}/${action}`;

      const response = await fetch(endpoint, {
        method: action === "delete" ? "DELETE" : "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} ad`);
      }

      if (action === "delete") {
        router.push("/admin/marketing/ads");
      } else if (action === "duplicate") {
        const data = await response.json();
        router.push(`/admin/marketing/ads/${data.ad.id}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} ad`);
    } finally {
      setIsLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/marketing/ads"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              {ad.name}
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
              >
                <StatusIcon className={`h-3.5 w-3.5 ${ad.status === "publishing" ? "animate-spin" : ""}`} />
                {statusConfig.label}
              </span>
              {ad.meta_ad_id && (
                <span className="text-xs text-gray-500">
                  Meta ID: {ad.meta_ad_id}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {ad.status === "draft" && (
            <Link
              href={`/admin/marketing/ads/${ad.id}/publish`}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
            >
              <Play className="h-4 w-4" />
              Continue to Publish
            </Link>
          )}
          {ad.status === "active" && (
            <button
              onClick={() => handleAction("pause")}
              disabled={isLoading !== null}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {isLoading === "pause" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
              Pause
            </button>
          )}
          {ad.status === "paused" && (
            <button
              onClick={() => handleAction("resume")}
              disabled={isLoading !== null}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {isLoading === "resume" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Resume
            </button>
          )}
          <button
            onClick={() => handleAction("duplicate")}
            disabled={isLoading !== null}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoading === "duplicate" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Duplicate
          </button>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this ad? This cannot be undone.")) {
                handleAction("delete");
              }
            }}
            disabled={isLoading !== null}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {isLoading === "delete" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Rejection Warning */}
      {ad.status === "rejected" && ad.meta_rejection_reason && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Ad Rejected by Meta</p>
              <p className="mt-1 text-sm text-red-700">{ad.meta_rejection_reason}</p>
              <Link
                href={`/admin/marketing/ads/create?edit=${ad.id}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800"
              >
                <Edit className="h-4 w-4" />
                Edit and Resubmit
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Creative Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ad Creative */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2
              className="mb-4 text-lg font-semibold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Ad Creative
            </h2>

            {/* Image */}
            {ad.image_urls && ad.image_urls.length > 0 && (
              <div className="mb-4 overflow-hidden rounded-lg">
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={ad.image_urls[0]}
                    alt={ad.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {ad.image_urls.length > 1 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                    {ad.image_urls.slice(1).map((url, idx) => (
                      <div
                        key={idx}
                        className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg"
                      >
                        <Image
                          src={url}
                          alt={`${ad.name} - Image ${idx + 2}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Copy */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Primary Text</p>
                <p className="mt-1 text-sm text-gray-900">{ad.primary_text || "(Not set)"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Headline</p>
                <p className="mt-1 font-semibold text-gray-900">{ad.headline || "(Not set)"}</p>
              </div>
              {ad.description && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Description</p>
                  <p className="mt-1 text-sm text-gray-700">{ad.description}</p>
                </div>
              )}
              <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Call to Action</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {ad.cta_type?.replace(/_/g, " ") || "Learn More"}
                  </p>
                </div>
                {ad.cta_url && (
                  <a
                    href={ad.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View URL
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          {ad.meta_ad_id && (
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h2
                  className="text-lg font-semibold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  Performance
                </h2>
                <button
                  onClick={() => router.refresh()}
                  className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs font-medium">Impressions</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold" style={{ color: "var(--craigies-dark-olive)" }}>
                    {totalMetrics.impressions.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-medium">Reach</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold" style={{ color: "var(--craigies-dark-olive)" }}>
                    {totalMetrics.reach.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MousePointer className="h-4 w-4" />
                    <span className="text-xs font-medium">Clicks</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold" style={{ color: "var(--craigies-dark-olive)" }}>
                    {totalMetrics.clicks.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{ctr}% CTR</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs font-medium">Spend</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold" style={{ color: "var(--craigies-burnt-orange)" }}>
                    £{(totalMetrics.spend / 100).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">£{cpc} CPC</p>
                </div>
              </div>

              {totalMetrics.conversions > 0 && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      {totalMetrics.conversions} Conversion{totalMetrics.conversions !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}

              {(!metrics || metrics.length === 0) && (
                <p className="mt-4 text-center text-sm text-gray-500">
                  No performance data yet. Metrics will appear once the ad starts running.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Ad Details */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2
              className="mb-4 text-lg font-semibold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Details
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Objective</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {ad.objective === "OUTCOME_SALES"
                    ? "Conversions"
                    : ad.objective === "OUTCOME_TRAFFIC"
                    ? "Traffic"
                    : ad.objective === "OUTCOME_AWARENESS"
                    ? "Awareness"
                    : ad.objective}
                </p>
              </div>

              {ad.club && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Linked Club</p>
                  <Link
                    href={`/admin/clubs/${ad.club.id}`}
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {ad.club.name}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {ad.promo_code && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Promo Code</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {ad.promo_code.code} ({ad.promo_code.discount_percent}% off)
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-500">Created</p>
                <p className="mt-1 text-sm text-gray-900">{formatDate(ad.created_at)}</p>
              </div>

              {ad.published_at && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Published</p>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(ad.published_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Budget & Schedule */}
          {(ad.budget_amount || ad.schedule_start) && (
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h2
                className="mb-4 text-lg font-semibold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Budget & Schedule
              </h2>

              <div className="space-y-4">
                {ad.budget_amount && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(122,124,74,0.1)]">
                      <DollarSign className="h-5 w-5 text-[var(--craigies-olive)]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        {ad.budget_type === "daily" ? "Daily Budget" : "Lifetime Budget"}
                      </p>
                      <p className="text-lg font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                        £{(ad.budget_amount / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                {ad.schedule_start && ad.schedule_end && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(122,124,74,0.1)]">
                      <Calendar className="h-5 w-5 text-[var(--craigies-olive)]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Schedule</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(ad.schedule_start)} - {formatDate(ad.schedule_end)}
                      </p>
                    </div>
                  </div>
                )}

                {ad.targeting_preset && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(122,124,74,0.1)]">
                      <Target className="h-5 w-5 text-[var(--craigies-olive)]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Targeting</p>
                      <p className="text-sm font-medium text-gray-900">
                        {ad.targeting_preset === "local_parents"
                          ? "Local Parents"
                          : ad.targeting_preset === "school_holiday"
                          ? "School Holiday"
                          : ad.targeting_preset}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meta IDs (for debugging) */}
          {ad.meta_campaign_id && (
            <div className="rounded-2xl bg-gray-50 p-6">
              <h3 className="mb-3 text-sm font-medium text-gray-500">Meta API References</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <p>Campaign: {ad.meta_campaign_id}</p>
                <p>Ad Set: {ad.meta_adset_id}</p>
                <p>Creative: {ad.meta_creative_id}</p>
                <p>Ad: {ad.meta_ad_id}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
