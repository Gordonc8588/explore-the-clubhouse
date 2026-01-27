"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  Save,
  AlertCircle,
  Check,
  RefreshCw,
  Eye,
  Send,
  CheckCircle,
} from "lucide-react";
import { AdImageUploader } from "./AdImageUploader";
import { AdPreview } from "./AdPreview";
import { TargetingSelector, type TargetingConfig } from "./TargetingSelector";
import { BudgetSchedule, type BudgetConfig } from "./BudgetSchedule";
import type { Club, PromoCode } from "@/types/database";

interface AdFormProps {
  clubs: Pick<Club, "id" | "name" | "slug" | "start_date" | "end_date">[];
  promoCodes: Pick<PromoCode, "id" | "code" | "discount_percent">[];
}

interface AdImage {
  url: string;
  label: string;
  description?: string;
}

interface GeneratedContent {
  primaryText: string;
  headline: string;
  description: string;
}

type Step = 1 | 2 | 3 | 4;

const OBJECTIVES = [
  { value: "OUTCOME_SALES", label: "Conversions", description: "Drive bookings and purchases" },
  { value: "OUTCOME_TRAFFIC", label: "Traffic", description: "Send people to your website" },
  { value: "OUTCOME_AWARENESS", label: "Awareness", description: "Reach people likely to remember your ad" },
];

const CTA_TYPES = [
  { value: "BOOK_NOW", label: "Book Now" },
  { value: "LEARN_MORE", label: "Learn More" },
  { value: "SIGN_UP", label: "Sign Up" },
  { value: "SHOP_NOW", label: "Shop Now" },
  { value: "CONTACT_US", label: "Contact Us" },
  { value: "GET_OFFER", label: "Get Offer" },
];

// Character limits (recommended)
const CHAR_LIMITS = {
  primaryText: { recommended: 125, max: 2200 },
  headline: { recommended: 40, max: 255 },
  description: { recommended: 30, max: 255 },
};

export function AdForm({ clubs, promoCodes }: AdFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Configuration
  const [name, setName] = useState("");
  const [clubId, setClubId] = useState<string>("");
  const [promoCodeId, setPromoCodeId] = useState<string>("");
  const [objective, setObjective] = useState("OUTCOME_SALES");
  const [ctaType, setCtaType] = useState("BOOK_NOW");
  const [ctaUrl, setCtaUrl] = useState("https://exploretheclubhouse.com/clubs");
  const [roughNotes, setRoughNotes] = useState("");
  const [images, setImages] = useState<AdImage[]>([]);

  // Step 2: Generated content
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    primaryText: "",
    headline: "",
    description: "",
  });
  const [hasGenerated, setHasGenerated] = useState(false);

  // Step 4: Targeting & Budget - Craigies Farm, South Queensferry
  const [targeting, setTargeting] = useState<TargetingConfig>({
    preset: "local_parents",
    ageMin: 25,
    ageMax: 45,
    genders: [],
    radius: 32,
    latitude: 55.983,
    longitude: -3.402,
  });

  // Get default dates (tomorrow to 2 weeks from now)
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

  // Publishing state
  const [savedAdId, setSavedAdId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Helper to get character count styling
  const getCharCountStyle = (
    current: number,
    recommended: number,
    max: number
  ) => {
    if (current > max) return "text-red-600 font-semibold";
    if (current > recommended) return "text-amber-600";
    return "text-gray-500";
  };

  // Handle AI generation
  const handleGenerate = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image before generating ad copy.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          clubId: clubId || null,
          promoCodeId: promoCodeId || null,
          objective,
          notes: roughNotes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate ad content");
      }

      const data = await response.json();
      setGeneratedContent({
        primaryText: data.primaryText || "",
        headline: data.headline || "",
        description: data.description || "",
      });
      setHasGenerated(true);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate specific field
  const handleRegenerateField = async (field: keyof GeneratedContent) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images,
          clubId: clubId || null,
          promoCodeId: promoCodeId || null,
          objective,
          notes: roughNotes,
          regenerateField: field,
          existingContent: generatedContent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to regenerate field");
      }

      const data = await response.json();
      setGeneratedContent((prev) => ({
        ...prev,
        [field]: data[field] || prev[field],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate field");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save draft (and optionally continue to targeting)
  const handleSaveDraft = async (continueToTargeting = false) => {
    if (!name.trim()) {
      setError("Please enter an ad name");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          club_id: clubId || null,
          promo_code_id: promoCodeId || null,
          objective,
          primary_text: generatedContent.primaryText || null,
          headline: generatedContent.headline || null,
          description: generatedContent.description || null,
          cta_type: ctaType,
          cta_url: ctaUrl,
          image_urls: images.map((img) => img.url),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save ad");
      }

      const { ad } = await response.json();
      setSavedAdId(ad.id);

      if (continueToTargeting) {
        setStep(4);
      } else {
        router.push(`/admin/marketing/ads/${ad.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save ad");
    } finally {
      setIsSaving(false);
    }
  };

  // Publish to Meta
  const handlePublish = async () => {
    if (!savedAdId) {
      setError("Please save your ad first");
      return;
    }

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
          adId: savedAdId,
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
        router.push(`/admin/marketing/ads/${savedAdId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish ad");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold sm:h-10 sm:w-10 sm:text-sm ${
                  step >= s
                    ? "bg-[var(--craigies-olive)] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : s}
              </div>
              <span
                className={`ml-2 hidden text-xs font-medium lg:inline lg:text-sm ${
                  step >= s ? "text-[var(--craigies-dark-olive)]" : "text-gray-400"
                }`}
              >
                {s === 1 ? "Configure" : s === 2 ? "Generate" : s === 3 ? "Preview" : "Publish"}
              </span>
              {s < 4 && (
                <div
                  className={`mx-4 hidden h-0.5 w-16 sm:block lg:mx-6 lg:w-20 ${
                    step > s ? "bg-[var(--craigies-olive)]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Upload & Configure */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Ad Name */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3
              className="mb-4 text-lg font-semibold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Ad Details
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Ad Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Easter Camp 2026 - Parents"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Internal name to identify this ad (not shown publicly)
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Club Selection */}
                <div>
                  <label
                    htmlFor="club"
                    className="mb-1 block text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Link to Club (optional)
                  </label>
                  <select
                    id="club"
                    value={clubId}
                    onChange={(e) => setClubId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
                  >
                    <option value="">No specific club</option>
                    {clubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Promo Code Selection */}
                <div>
                  <label
                    htmlFor="promo"
                    className="mb-1 block text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Include Promo Code (optional)
                  </label>
                  <select
                    id="promo"
                    value={promoCodeId}
                    onChange={(e) => setPromoCodeId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
                  >
                    <option value="">No promo code</option>
                    {promoCodes.map((promo) => (
                      <option key={promo.id} value={promo.id}>
                        {promo.code} ({promo.discount_percent}% off)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Objective */}
              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Ad Objective
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {OBJECTIVES.map((obj) => (
                    <button
                      key={obj.value}
                      type="button"
                      onClick={() => setObjective(obj.value)}
                      className={`rounded-lg border-2 p-4 text-left transition-colors ${
                        objective === obj.value
                          ? "border-[var(--craigies-olive)] bg-[rgba(122,124,74,0.05)]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p
                        className="font-medium"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
                        {obj.label}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {obj.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA Type & URL */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="cta"
                    className="mb-1 block text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Call to Action Button
                  </label>
                  <select
                    id="cta"
                    value={ctaType}
                    onChange={(e) => setCtaType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
                  >
                    {CTA_TYPES.map((cta) => (
                      <option key={cta.value} value={cta.value}>
                        {cta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ctaUrl"
                    className="mb-1 block text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Destination URL
                  </label>
                  <input
                    id="ctaUrl"
                    type="url"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://exploretheclubhouse.com/clubs"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3
              className="mb-4 text-lg font-semibold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Ad Images
            </h3>
            <AdImageUploader
              images={images}
              onChange={setImages}
              maxImages={10}
            />
          </div>

          {/* Rough Notes for AI */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3
              className="mb-4 text-lg font-semibold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Guidance for AI (optional)
            </h3>
            <textarea
              value={roughNotes}
              onChange={(e) => setRoughNotes(e.target.value)}
              rows={4}
              placeholder="Any specific points to emphasize, tone preferences, or details to include..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
            />
            <p className="mt-2 text-xs text-gray-500">
              The AI will analyze your images and generate ad copy. Add any
              notes to guide the content.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/marketing/ads")}
              className="rounded-lg border-2 border-[var(--craigies-dark-olive)] px-6 py-3 font-semibold text-[var(--craigies-dark-olive)] transition-opacity hover:opacity-80"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || images.length === 0}
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                fontFamily: "'Playfair Display', serif",
                backgroundColor: "var(--craigies-burnt-orange)",
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Ad Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Generate & Edit */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3
              className="mb-4 text-lg font-semibold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Ad Copy
            </h3>

            <div className="space-y-6">
              {/* Primary Text */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="primaryText"
                    className="text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Primary Text
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${getCharCountStyle(
                        generatedContent.primaryText.length,
                        CHAR_LIMITS.primaryText.recommended,
                        CHAR_LIMITS.primaryText.max
                      )}`}
                    >
                      {generatedContent.primaryText.length}/
                      {CHAR_LIMITS.primaryText.recommended} recommended
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRegenerateField("primaryText")}
                      disabled={isGenerating}
                      className="text-[var(--craigies-olive)] hover:text-[var(--craigies-dark-olive)] disabled:opacity-50"
                      title="Regenerate"
                    >
                      <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>
                <textarea
                  id="primaryText"
                  value={generatedContent.primaryText}
                  onChange={(e) =>
                    setGeneratedContent((prev) => ({
                      ...prev,
                      primaryText: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
                />
                <p className="mt-1 text-xs text-gray-500">
                  The main text that appears above your image in the ad
                </p>
              </div>

              {/* Headline */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="headline"
                    className="text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Headline
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${getCharCountStyle(
                        generatedContent.headline.length,
                        CHAR_LIMITS.headline.recommended,
                        CHAR_LIMITS.headline.max
                      )}`}
                    >
                      {generatedContent.headline.length}/
                      {CHAR_LIMITS.headline.recommended} recommended
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRegenerateField("headline")}
                      disabled={isGenerating}
                      className="text-[var(--craigies-olive)] hover:text-[var(--craigies-dark-olive)] disabled:opacity-50"
                      title="Regenerate"
                    >
                      <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>
                <input
                  id="headline"
                  type="text"
                  value={generatedContent.headline}
                  onChange={(e) =>
                    setGeneratedContent((prev) => ({
                      ...prev,
                      headline: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Short, attention-grabbing headline below the image
                </p>
              </div>

              {/* Description */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Description (optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${getCharCountStyle(
                        generatedContent.description.length,
                        CHAR_LIMITS.description.recommended,
                        CHAR_LIMITS.description.max
                      )}`}
                    >
                      {generatedContent.description.length}/
                      {CHAR_LIMITS.description.recommended} recommended
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRegenerateField("description")}
                      disabled={isGenerating}
                      className="text-[var(--craigies-olive)] hover:text-[var(--craigies-dark-olive)] disabled:opacity-50"
                      title="Regenerate"
                    >
                      <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>
                <input
                  id="description"
                  type="text"
                  value={generatedContent.description}
                  onChange={(e) =>
                    setGeneratedContent((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--craigies-burnt-orange)]"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Additional text shown in some placements
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-[var(--craigies-dark-olive)] px-6 py-3 font-semibold text-[var(--craigies-dark-olive)] transition-opacity hover:opacity-80"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-[var(--craigies-olive)] px-6 py-3 font-semibold text-[var(--craigies-olive)] transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <RefreshCw className={`h-5 w-5 ${isGenerating ? "animate-spin" : ""}`} />
                Regenerate All
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!generatedContent.primaryText && !generatedContent.headline}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  backgroundColor: "var(--craigies-burnt-orange)",
                }}
              >
                <Eye className="h-5 w-5" />
                Preview
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Save */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Preview Section */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3
              className="mb-4 text-lg font-semibold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Ad Preview
            </h3>
            <AdPreview
              images={images}
              primaryText={generatedContent.primaryText}
              headline={generatedContent.headline}
              description={generatedContent.description}
              ctaType={ctaType}
              ctaUrl={ctaUrl}
            />
          </div>

          {/* Ad Summary */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3
              className="mb-4 text-lg font-semibold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Ad Summary
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Ad Name</p>
                <p className="text-sm text-gray-900">{name || "(Not set)"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Objective</p>
                <p className="text-sm text-gray-900">
                  {OBJECTIVES.find((o) => o.value === objective)?.label || objective}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Images</p>
                <p className="text-sm text-gray-900">{images.length} image(s)</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Call to Action</p>
                <p className="text-sm text-gray-900">
                  {CTA_TYPES.find((c) => c.value === ctaType)?.label || ctaType}
                </p>
              </div>
              {clubId && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Linked Club</p>
                  <p className="text-sm text-gray-900">
                    {clubs.find((c) => c.id === clubId)?.name || "Unknown"}
                  </p>
                </div>
              )}
              {promoCodeId && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Promo Code</p>
                  <p className="text-sm text-gray-900">
                    {promoCodes.find((p) => p.id === promoCodeId)?.code || "Unknown"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-[var(--craigies-dark-olive)] px-6 py-3 font-semibold text-[var(--craigies-dark-olive)] transition-opacity hover:opacity-80"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <ArrowLeft className="h-5 w-5" />
              Edit Copy
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSaveDraft(false)}
                disabled={isSaving || !name.trim()}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-[var(--craigies-olive)] px-6 py-3 font-semibold text-[var(--craigies-olive)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Draft
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSaveDraft(true)}
                disabled={isSaving || !name.trim()}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  backgroundColor: "var(--craigies-burnt-orange)",
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue to Publish
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Targeting & Publish */}
      {step === 4 && (
        <div className="space-y-6">
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
            <>
              {/* Targeting Section */}
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <h3
                  className="mb-4 text-lg font-semibold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  Targeting
                </h3>
                <TargetingSelector value={targeting} onChange={setTargeting} />
              </div>

              {/* Budget & Schedule Section */}
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <h3
                  className="mb-4 text-lg font-semibold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  Budget & Schedule
                </h3>
                <BudgetSchedule value={budget} onChange={setBudget} />
              </div>

              {/* Final Summary */}
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <h3
                  className="mb-4 text-lg font-semibold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--craigies-dark-olive)",
                  }}
                >
                  Ready to Publish
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Ad Name</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--craigies-dark-olive)" }}>
                      {name}
                    </p>
                  </div>
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
                    <p className="text-xs font-medium text-gray-500">Est. Total Spend</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--craigies-burnt-orange)" }}>
                      £{(budget.budgetType === "lifetime"
                        ? budget.amount / 100
                        : (() => {
                            const start = new Date(budget.startDate);
                            const end = new Date(budget.endDate);
                            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                            return (budget.amount * days) / 100;
                          })()
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  Your ad will be submitted to Meta for review. This typically takes 24 hours.
                  The ad will start paused - you can activate it once approved.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-[var(--craigies-dark-olive)] px-6 py-3 font-semibold text-[var(--craigies-dark-olive)] transition-opacity hover:opacity-80"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Preview
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing || !savedAdId}
                  className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
