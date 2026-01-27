"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Target,
  DollarSign,
  Calendar,
} from "lucide-react";
import { TargetingSelector, type TargetingConfig } from "../../create/TargetingSelector";
import { BudgetSchedule, type BudgetConfig } from "../../create/BudgetSchedule";
import type { MetaAd, Club, PromoCode } from "@/types/database";

interface PublishAdClientProps {
  ad: MetaAd & {
    club: Pick<Club, "id" | "name" | "slug"> | null;
    promo_code: Pick<PromoCode, "id" | "code" | "discount_percent"> | null;
  };
}

export function PublishAdClient({ ad }: PublishAdClientProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Targeting state - Craigies Farm, South Queensferry
  const [targeting, setTargeting] = useState<TargetingConfig>({
    preset: "local_parents",
    ageMin: 25,
    ageMax: 45,
    genders: [],
    radius: 32,
    latitude: 55.983,
    longitude: -3.402,
  });

  // Budget state - defaults
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

  const [budget, setBudget] = useState<BudgetConfig>({
    budgetType: "daily",
    amount: 1000, // £10 in pence
    startDate: tomorrow.toISOString().split("T")[0],
    endDate: twoWeeksLater.toISOString().split("T")[0],
    startTime: "",
    endTime: "",
  });

  const handlePublish = async () => {
    // Validate budget
    const minBudget = budget.budgetType === "daily" ? 500 : 2000;
    if (budget.amount < minBudget) {
      setError(`Minimum ${budget.budgetType} budget is £${(minBudget / 100).toFixed(2)}`);
      return;
    }

    // Validate dates
    if (!budget.startDate || !budget.endDate) {
      setError("Please set start and end dates for your campaign");
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ads/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adId: ad.id,
          targeting,
          budget,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to publish ad");
      }

      setPublishSuccess(true);
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push(`/admin/marketing/ads/${ad.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish ad");
    } finally {
      setIsPublishing(false);
    }
  };

  // Calculate total spend
  const getTotalSpend = () => {
    if (budget.budgetType === "lifetime") {
      return budget.amount;
    }
    const start = new Date(budget.startDate);
    const end = new Date(budget.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? budget.amount * days : budget.amount;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/marketing/ads/${ad.id}`}
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
            Publish Ad
          </h1>
          <p className="text-sm text-gray-500">{ad.name}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {publishSuccess && (
        <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4 text-green-700">
          <CheckCircle className="h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-semibold">Ad Published Successfully!</p>
            <p className="text-sm">
              Your ad has been submitted to Meta for review. Redirecting...
            </p>
          </div>
        </div>
      )}

      {!publishSuccess && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Targeting Section */}
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h2
                className="mb-4 flex items-center gap-2 text-lg font-semibold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                <Target className="h-5 w-5" />
                Targeting
              </h2>
              <TargetingSelector value={targeting} onChange={setTargeting} />
            </div>

            {/* Budget & Schedule Section */}
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h2
                className="mb-4 flex items-center gap-2 text-lg font-semibold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                <DollarSign className="h-5 w-5" />
                Budget & Schedule
              </h2>
              <BudgetSchedule value={budget} onChange={setBudget} />
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Ad Preview Card */}
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h2
                className="mb-4 text-lg font-semibold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Ad Summary
              </h2>

              {/* Image Preview */}
              {ad.image_urls && ad.image_urls.length > 0 && (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={ad.image_urls[0]}
                      alt={ad.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">{ad.name}</p>
                </div>
                {ad.headline && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Headline</p>
                    <p className="text-sm text-gray-900">{ad.headline}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500">Images</p>
                  <p className="text-sm text-gray-900">{ad.image_urls?.length || 0} image(s)</p>
                </div>
                {ad.club && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Linked Club</p>
                    <p className="text-sm text-gray-900">{ad.club.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Final Summary */}
            <div className="rounded-2xl bg-white p-6 shadow-md">
              <h2
                className="mb-4 flex items-center gap-2 text-lg font-semibold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                <Calendar className="h-5 w-5" />
                Campaign Summary
              </h2>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">Audience</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                    {targeting.preset === "local_parents"
                      ? "Local Parents"
                      : targeting.preset === "school_holiday"
                      ? "School Holiday"
                      : "Custom"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Schedule</p>
                  <p className="text-sm text-gray-900">
                    {budget.startDate} to {budget.endDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Est. Total Spend</p>
                  <p className="text-lg font-bold" style={{ color: "var(--craigies-burnt-orange)" }}>
                    £{(getTotalSpend() / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Your ad will be submitted to Meta for review. This typically takes 24 hours.
                The ad will start paused - you can activate it once approved.
              </p>
            </div>

            {/* Publish Button */}
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-4 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                fontFamily: "'Playfair Display', serif",
                backgroundColor: "var(--craigies-burnt-orange)",
              }}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Publish to Meta
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
