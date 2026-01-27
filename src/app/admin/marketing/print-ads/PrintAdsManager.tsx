"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  Download,
  Copy,
  Trash2,
  MoreVertical,
  CheckCircle,
  Clock,
  Loader2,
  Newspaper,
  Monitor,
} from "lucide-react";
import { format } from "date-fns";
import type { PrintAd } from "@/types/database";

interface PrintAdsManagerProps {
  initialAds: (PrintAd & { clubs?: { name: string } | null })[];
}

type StatusFilter = "all" | "draft" | "final";

export function PrintAdsManager({ initialAds }: PrintAdsManagerProps) {
  const router = useRouter();
  const [ads, setAds] = useState(initialAds);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  // Filter ads by status
  const filteredAds = ads.filter((ad) => {
    if (statusFilter === "all") return true;
    return ad.status === statusFilter;
  });

  // Delete an ad
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this print ad?")) return;

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/admin/print-ads/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      setAds(ads.filter((ad) => ad.id !== id));
    } catch (error) {
      console.error("Error deleting ad:", error);
      alert("Failed to delete ad");
    } finally {
      setIsDeleting(null);
      setOpenMenuId(null);
    }
  };

  // Download PDF
  const handleDownloadPdf = async (ad: PrintAd) => {
    // Check if ad is complete
    if (!ad.headline || !ad.body_copy || !ad.main_image_url || !ad.club_data) {
      alert("Please complete all required fields before downloading PDF");
      router.push(`/admin/marketing/print-ads/${ad.id}`);
      return;
    }

    setIsDownloading(ad.id);
    try {
      const response = await fetch("/api/admin/print-ads/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printAdId: ad.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate PDF");
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clubhouse-${ad.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert(error instanceof Error ? error.message : "Failed to generate PDF");
    } finally {
      setIsDownloading(null);
      setOpenMenuId(null);
    }
  };

  // Duplicate an ad
  const handleDuplicate = async (ad: PrintAd) => {
    setIsDuplicating(ad.id);
    try {
      const response = await fetch("/api/admin/print-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${ad.name} (Copy)`,
          ad_type: ad.ad_type,
          club_id: ad.club_id,
          club_data: ad.club_data,
          headline: ad.headline,
          body_copy: ad.body_copy,
          cta_text: ad.cta_text,
          main_image_url: ad.main_image_url,
          flyer_image_url: ad.flyer_image_url,
          status: "draft",
        }),
      });

      if (!response.ok) throw new Error("Failed to duplicate");

      const { printAd: newAd } = await response.json();
      setAds([newAd, ...ads]);
      router.push(`/admin/marketing/print-ads/${newAd.id}`);
    } catch (error) {
      console.error("Error duplicating ad:", error);
      alert("Failed to duplicate ad");
    } finally {
      setIsDuplicating(null);
      setOpenMenuId(null);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {(["all", "draft", "final"] as StatusFilter[]).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === status
                ? "text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={
              statusFilter === status
                ? { backgroundColor: "var(--craigies-olive)" }
                : {}
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === "all" && ` (${ads.length})`}
            {status === "draft" &&
              ` (${ads.filter((a) => a.status === "draft").length})`}
            {status === "final" &&
              ` (${ads.filter((a) => a.status === "final").length})`}
          </button>
        ))}
      </div>

      {/* Ads grid */}
      {filteredAds.length === 0 ? (
        <div className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">No print ads found</p>
          <Link
            href="/admin/marketing/print-ads/create"
            className="mt-4 inline-block text-sm font-medium hover:underline"
            style={{ color: "var(--craigies-burnt-orange)" }}
          >
            Create your first print ad
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
            >
              {/* Image preview */}
              <div className="relative aspect-[4/3] bg-gray-100">
                {ad.main_image_url ? (
                  <Image
                    src={ad.main_image_url}
                    alt={ad.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-300" />
                  </div>
                )}

                {/* Type badge */}
                <div className="absolute left-2 top-2">
                  <span
                    className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    {ad.ad_type === "magazine_quarter_page" ? (
                      <>
                        <Newspaper className="h-3 w-3" />
                        Magazine
                      </>
                    ) : (
                      <>
                        <Monitor className="h-3 w-3" />
                        Digital
                      </>
                    )}
                  </span>
                </div>

                {/* Status badge */}
                <div className="absolute right-2 top-2">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      ad.status === "final"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {ad.status === "final" ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Final
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        Draft
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <Link href={`/admin/marketing/print-ads/${ad.id}`}>
                  <h3
                    className="font-medium hover:underline"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    {ad.name}
                  </h3>
                </Link>

                {ad.clubs?.name && (
                  <p className="mt-1 text-sm text-gray-500">{ad.clubs.name}</p>
                )}

                {ad.headline && (
                  <p
                    className="mt-2 line-clamp-2 text-sm"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "var(--craigies-dark-olive)",
                    }}
                  >
                    {ad.headline}
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-400">
                  {format(new Date(ad.created_at), "d MMM yyyy")}
                </p>
              </div>

              {/* Actions menu */}
              <div className="absolute right-2 top-14">
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === ad.id ? null : ad.id)
                    }
                    className="rounded-full bg-white/90 p-2 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-600" />
                  </button>

                  {openMenuId === ad.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                        <Link
                          href={`/admin/marketing/print-ads/${ad.id}`}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDownloadPdf(ad)}
                          disabled={isDownloading === ad.id}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {isDownloading === ad.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          Download PDF
                        </button>
                        <button
                          onClick={() => handleDuplicate(ad)}
                          disabled={isDuplicating === ad.id}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {isDuplicating === ad.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          Duplicate
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => handleDelete(ad.id)}
                          disabled={isDeleting === ad.id}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {isDeleting === ad.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PrintAdsManager;
