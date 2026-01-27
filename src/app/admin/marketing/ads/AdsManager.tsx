"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Pause,
  Play,
  Copy,
  Trash2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import type { MetaAd, Club, PromoCode } from "@/types/database";

interface AdsManagerProps {
  initialAds: (MetaAd & { clubs: Pick<Club, "id" | "name" | "slug"> | null })[];
  clubs: Pick<Club, "id" | "name" | "slug">[];
  promoCodes: Pick<PromoCode, "id" | "code" | "discount_percent">[];
}

type AdStatus = "all" | "draft" | "publishing" | "pending_review" | "active" | "paused" | "rejected" | "completed";

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700",
  },
  publishing: {
    label: "Publishing...",
    className: "bg-blue-100 text-blue-700",
  },
  pending_review: {
    label: "Pending Review",
    className: "bg-amber-100 text-amber-700",
  },
  active: {
    label: "Active",
    className: "bg-green-100 text-green-700",
  },
  paused: {
    label: "Paused",
    className: "bg-gray-100 text-gray-600",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700",
  },
  completed: {
    label: "Completed",
    className: "bg-purple-100 text-purple-700",
  },
};

export function AdsManager({ initialAds, clubs }: AdsManagerProps) {
  const [ads, setAds] = useState(initialAds);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdStatus>("all");
  const [clubFilter, setClubFilter] = useState<string>("all");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter ads based on search and filters
  const filteredAds = ads.filter((ad) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = ad.name.toLowerCase().includes(query);
      const matchesHeadline = ad.headline?.toLowerCase().includes(query);
      const matchesPrimaryText = ad.primary_text?.toLowerCase().includes(query);
      if (!matchesName && !matchesHeadline && !matchesPrimaryText) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "all" && ad.status !== statusFilter) {
      return false;
    }

    // Club filter
    if (clubFilter !== "all" && ad.club_id !== clubFilter) {
      return false;
    }

    return true;
  });

  // Handle pause/resume ad
  const handleToggleStatus = async (ad: typeof ads[0]) => {
    const newStatus = ad.status === "active" ? "paused" : "active";

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/ads/${ad.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setAds(ads.map((a) => (a.id === ad.id ? { ...a, status: newStatus } : a)));
      }
    } catch (error) {
      console.error("Error updating ad status:", error);
    } finally {
      setIsLoading(false);
      setActiveMenu(null);
    }
  };

  // Handle duplicate ad
  const handleDuplicate = async (ad: typeof ads[0]) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${ad.name} (Copy)`,
          club_id: ad.club_id,
          promo_code_id: ad.promo_code_id,
          objective: ad.objective,
          primary_text: ad.primary_text,
          headline: ad.headline,
          description: ad.description,
          cta_type: ad.cta_type,
          cta_url: ad.cta_url,
          image_urls: ad.image_urls,
          targeting_preset: ad.targeting_preset,
          custom_targeting: ad.custom_targeting,
          budget_type: ad.budget_type,
          budget_amount: ad.budget_amount,
        }),
      });

      if (response.ok) {
        const { ad: newAd } = await response.json();
        setAds([{ ...newAd, clubs: ad.clubs }, ...ads]);
      }
    } catch (error) {
      console.error("Error duplicating ad:", error);
    } finally {
      setIsLoading(false);
      setActiveMenu(null);
    }
  };

  // Handle delete ad
  const handleDelete = async (ad: typeof ads[0]) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/ads/${ad.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAds(ads.filter((a) => a.id !== ad.id));
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
    } finally {
      setIsLoading(false);
      setActiveMenu(null);
    }
  };

  // Format budget in pounds
  const formatBudget = (pence: number | null, type: string) => {
    if (!pence) return "Not set";
    const pounds = (pence / 100).toFixed(2);
    return `£${pounds}/${type === "daily" ? "day" : "total"}`;
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
            style={{ color: "var(--craigies-dark-olive)" }}
          />
          <input
            type="text"
            placeholder="Search ads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2"
            style={
              {
                "--tw-ring-color": "var(--craigies-burnt-orange)",
              } as React.CSSProperties
            }
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter
            className="h-5 w-5"
            style={{ color: "var(--craigies-dark-olive)" }}
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AdStatus)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2"
            style={
              {
                "--tw-ring-color": "var(--craigies-burnt-orange)",
              } as React.CSSProperties
            }
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="publishing">Publishing</option>
            <option value="pending_review">Pending Review</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>

          {/* Club Filter */}
          <select
            value={clubFilter}
            onChange={(e) => setClubFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2"
            style={
              {
                "--tw-ring-color": "var(--craigies-burnt-orange)",
              } as React.CSSProperties
            }
          >
            <option value="all">All Clubs</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p
        className="mb-4 text-sm"
        style={{ color: "var(--craigies-dark-olive)" }}
      >
        Showing {filteredAds.length} of {ads.length} ads
      </p>

      {/* Ads Grid */}
      {filteredAds.length === 0 ? (
        <div className="py-12 text-center">
          <p style={{ color: "var(--craigies-dark-olive)" }}>
            No ads found matching your filters.
          </p>
          <Link
            href="/admin/marketing/ads/create"
            className="mt-4 inline-block rounded-lg px-6 py-2 font-semibold text-white"
            style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
          >
            Create your first ad
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className="relative overflow-hidden rounded-xl border border-gray-200 transition-shadow hover:shadow-lg"
            >
              {/* Image Preview */}
              <div className="relative aspect-square bg-gray-100">
                {ad.image_urls && ad.image_urls.length > 0 ? (
                  <Image
                    src={ad.image_urls[0]}
                    alt={ad.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-gray-400">No image</p>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute left-3 top-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      STATUS_BADGES[ad.status]?.className || "bg-gray-100"
                    }`}
                  >
                    {STATUS_BADGES[ad.status]?.label || ad.status}
                  </span>
                </div>

                {/* Actions Menu */}
                <div className="absolute right-3 top-3">
                  <button
                    onClick={() =>
                      setActiveMenu(activeMenu === ad.id ? null : ad.id)
                    }
                    className="rounded-full bg-white/90 p-2 shadow-sm hover:bg-white"
                    disabled={isLoading}
                  >
                    <MoreVertical className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenu === ad.id && (
                    <div className="absolute right-0 top-10 z-10 w-48 rounded-lg bg-white py-2 shadow-lg">
                      <Link
                        href={`/admin/marketing/ads/${ad.id}`}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>

                      {(ad.status === "active" || ad.status === "paused") && (
                        <button
                          onClick={() => handleToggleStatus(ad)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          {ad.status === "active" ? (
                            <>
                              <Pause className="h-4 w-4" />
                              Pause Ad
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              Resume Ad
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleDuplicate(ad)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </button>

                      {ad.meta_ad_id && (
                        <a
                          href={`https://www.facebook.com/adsmanager/manage/ads?act=${process.env.NEXT_PUBLIC_META_AD_ACCOUNT_ID}&selected_ad_ids=${ad.meta_ad_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View in Ads Manager
                        </a>
                      )}

                      {!ad.meta_ad_id && (
                        <button
                          onClick={() => handleDelete(ad)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Rejection Warning */}
                {ad.status === "rejected" && ad.meta_rejection_reason && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 px-3 py-2 text-xs text-white">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {ad.meta_rejection_reason}
                    </div>
                  </div>
                )}
              </div>

              {/* Ad Info */}
              <div className="p-4">
                <Link href={`/admin/marketing/ads/${ad.id}`}>
                  <h3
                    className="font-semibold hover:underline"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "var(--craigies-dark-olive)",
                    }}
                  >
                    {ad.name}
                  </h3>
                </Link>

                {ad.clubs && (
                  <p className="mt-1 text-sm text-gray-500">{ad.clubs.name}</p>
                )}

                {ad.headline && (
                  <p
                    className="mt-2 line-clamp-2 text-sm"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    {ad.headline}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{formatBudget(ad.budget_amount, ad.budget_type)}</span>
                  <span className="capitalize">{ad.objective}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}
