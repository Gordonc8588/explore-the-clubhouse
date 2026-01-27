/**
 * Print Ads List Page
 * Lists all print ads with stats and filtering
 */

import { createAdminClient } from "@/lib/supabase/server";
import { FileText, FilePlus, FileCheck, Clock } from "lucide-react";
import Link from "next/link";
import { PrintAdsManager } from "./PrintAdsManager";

export const dynamic = "force-dynamic";

export default async function PrintAdsPage() {
  const supabase = createAdminClient();

  // Fetch print ads
  const { data: printAds, error } = await supabase
    .from("print_ads")
    .select("*, clubs(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching print ads:", error);
  }

  // Calculate stats
  const allAds = printAds || [];
  const draftCount = allAds.filter((ad) => ad.status === "draft").length;
  const finalCount = allAds.filter((ad) => ad.status === "final").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Print Ads
          </h2>
          <p style={{ color: "var(--craigies-dark-olive)" }}>
            Create newspaper and magazine advertisements
          </p>
        </div>
        <Link
          href="/admin/marketing/print-ads/create"
          className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
        >
          <FilePlus className="h-5 w-5" />
          Create New Ad
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Ads */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
            >
              <FileText
                className="h-6 w-6"
                style={{ color: "var(--craigies-olive)" }}
              />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Total Ads
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {allAds.length}
              </p>
            </div>
          </div>
        </div>

        {/* Drafts */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
            >
              <Clock
                className="h-6 w-6"
                style={{ color: "var(--craigies-burnt-orange)" }}
              />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Drafts
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {draftCount}
              </p>
            </div>
          </div>
        </div>

        {/* Final */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
            >
              <FileCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p
                className="text-sm"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Final
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {finalCount}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p
              className="mb-2 text-sm"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Magazine Quarter Page
            </p>
            <p className="text-xs text-gray-500">105mm × 148mm</p>
          </div>
        </div>
      </div>

      {/* Ads List */}
      <PrintAdsManager initialAds={allAds} />
    </div>
  );
}
