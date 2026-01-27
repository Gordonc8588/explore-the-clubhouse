"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  Save,
  Download,
  CheckCircle,
  Newspaper,
  Monitor,
} from "lucide-react";
import { ClubSelector } from "@/components/print-ads/ClubSelector";
import { PrintAdImagePicker } from "@/components/print-ads/PrintAdImagePicker";
import { PrintAdPreview } from "@/components/print-ads/PrintAdPreview";
import { TEMPLATES } from "@/lib/print-ads/templates";
import { countWords, MAX_HEADLINE_LENGTH, MAX_CTA_LENGTH } from "@/lib/print-ads/types";
import type { PrintAdType, PrintAdClubData, PrintAd } from "@/types/database";

interface PrintAdFormProps {
  initialData?: PrintAd;
}

export function PrintAdForm({ initialData }: PrintAdFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [adType, setAdType] = useState<PrintAdType>(
    initialData?.ad_type || "magazine_quarter_page"
  );
  const [clubId, setClubId] = useState<string | null>(initialData?.club_id || null);
  const [clubData, setClubData] = useState<PrintAdClubData | null>(
    initialData?.club_data || null
  );
  const [headline, setHeadline] = useState(initialData?.headline || "");
  const [bodyCopy, setBodyCopy] = useState(initialData?.body_copy || "");
  const [ctaText, setCtaText] = useState(initialData?.cta_text || "Book Now");
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(
    initialData?.main_image_url || null
  );
  const [flyerImageUrl, setFlyerImageUrl] = useState<string | null>(
    initialData?.flyer_image_url || null
  );

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle club selection
  const handleClubSelect = (id: string | null, data: PrintAdClubData | null) => {
    setClubId(id);
    setClubData(data);
    // Auto-set name if empty
    if (data && !name) {
      setName(`${data.name} - Print Ad`);
    }
  };

  // Generate AI copy
  const handleGenerate = async () => {
    if (!clubId) {
      setError("Please select a club first");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/print-ads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          adType,
          mainImageUrl: mainImageUrl || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate copy");
      }

      const data = await response.json();
      setHeadline(data.headline);
      setBodyCopy(data.bodyCopy);
      setCtaText(data.ctaText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate copy");
    } finally {
      setIsGenerating(false);
    }
  };

  // Save draft
  const handleSave = async (markAsFinal = false) => {
    if (!name.trim()) {
      setError("Please enter a name for this ad");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/print-ads/${initialData.id}`
        : "/api/admin/print-ads";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ad_type: adType,
          club_id: clubId,
          club_data: clubData,
          headline: headline || null,
          body_copy: bodyCopy || null,
          cta_text: ctaText || null,
          main_image_url: mainImageUrl,
          flyer_image_url: flyerImageUrl,
          status: markAsFinal ? "final" : "draft",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }

      const { printAd } = await response.json();

      if (!isEditing) {
        router.push(`/admin/marketing/print-ads/${printAd.id}`);
      } else {
        setSuccessMessage(markAsFinal ? "Marked as final!" : "Saved!");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    // Validate required fields
    if (!headline || !bodyCopy || !mainImageUrl || !clubData) {
      setError("Please complete all required fields before downloading PDF");
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/print-ads/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printAdData: {
            adType,
            headline,
            bodyCopy,
            ctaText: ctaText || "Book Now",
            mainImageUrl,
            flyerImageUrl: flyerImageUrl || undefined,
            clubData,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate PDF");
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clubhouse-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const wordCount = countWords(bodyCopy);
  const isComplete = headline && bodyCopy && mainImageUrl && clubData && wordCount.isValid;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form Column */}
      <div className="space-y-6">
        {/* Name & Type */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3
            className="mb-4 font-medium"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Ad Details
          </h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Easter 2026 - Local Magazine"
                className="w-full rounded-lg border p-3 transition-colors focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--craigies-dark-olive)",
                  color: "var(--craigies-dark-olive)",
                }}
              />
            </div>

            {/* Ad Type */}
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                Ad Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(TEMPLATES) as PrintAdType[]).map((type) => {
                  const template = TEMPLATES[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAdType(type)}
                      className={`flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                        adType === type
                          ? "border-current bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={
                        adType === type
                          ? { borderColor: "var(--craigies-olive)" }
                          : {}
                      }
                    >
                      {type === "magazine_quarter_page" ? (
                        <Newspaper
                          className="h-5 w-5"
                          style={{
                            color:
                              adType === type
                                ? "var(--craigies-olive)"
                                : "#9CA3AF",
                          }}
                        />
                      ) : (
                        <Monitor
                          className="h-5 w-5"
                          style={{
                            color:
                              adType === type
                                ? "var(--craigies-olive)"
                                : "#9CA3AF",
                          }}
                        />
                      )}
                      <div className="text-left">
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--craigies-dark-olive)" }}
                        >
                          {template.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {template.width}×{template.height}mm
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Club Selection */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3
            className="mb-4 font-medium"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Select Club
          </h3>
          <ClubSelector selectedClubId={clubId} onSelect={handleClubSelect} />
        </div>

        {/* Images */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h3
            className="mb-4 font-medium"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Images
          </h3>
          <div className="space-y-6">
            <PrintAdImagePicker
              label="Main Image"
              description="Primary photo for the ad (no text on image)"
              imageUrl={mainImageUrl}
              onChange={setMainImageUrl}
            />
            <PrintAdImagePicker
              label="Flyer Image"
              description="Optional promotional flyer at bottom"
              imageUrl={flyerImageUrl}
              onChange={setFlyerImageUrl}
              optional
            />
          </div>
        </div>

        {/* Copy */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h3
              className="font-medium"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "var(--craigies-dark-olive)",
              }}
            >
              Ad Copy
            </h3>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !clubId}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate with AI
            </button>
          </div>

          <div className="space-y-4">
            {/* Headline */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Headline <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-400">
                  {headline.length}/{MAX_HEADLINE_LENGTH}
                </span>
              </div>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value.slice(0, MAX_HEADLINE_LENGTH))}
                placeholder="e.g., Farm Adventures Await This Easter"
                className="w-full rounded-lg border p-3 transition-colors focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--craigies-dark-olive)",
                  color: "var(--craigies-dark-olive)",
                  fontFamily: "'Playfair Display', serif",
                }}
              />
            </div>

            {/* Body Copy */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Body Copy <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    wordCount.isValid ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {wordCount.message}
                </span>
              </div>
              <textarea
                value={bodyCopy}
                onChange={(e) => setBodyCopy(e.target.value)}
                placeholder="Write 80-100 words in third person editorial style..."
                rows={6}
                className="w-full rounded-lg border p-3 transition-colors focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--craigies-dark-olive)",
                  color: "var(--craigies-dark-olive)",
                }}
              />
              <p className="mt-1 text-xs text-gray-500">
                Write in third person (e.g., &quot;Children discover...&quot; not &quot;Your children will...&quot;)
              </p>
            </div>

            {/* CTA Text */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Call to Action
                </label>
                <span className="text-xs text-gray-400">
                  {ctaText.length}/{MAX_CTA_LENGTH}
                </span>
              </div>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value.slice(0, MAX_CTA_LENGTH))}
                placeholder="e.g., Book Now"
                className="w-full rounded-lg border p-3 transition-colors focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--craigies-dark-olive)",
                  color: "var(--craigies-dark-olive)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            {successMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg border-2 px-6 py-3 font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              borderColor: "var(--craigies-dark-olive)",
              color: "var(--craigies-dark-olive)",
            }}
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Save Draft
          </button>

          {isComplete && (
            <>
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--craigies-olive)" }}
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                Mark as Final
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="flex items-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
              >
                {isDownloading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                Download PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Column */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <PrintAdPreview
            adType={adType}
            headline={headline}
            bodyCopy={bodyCopy}
            ctaText={ctaText}
            mainImageUrl={mainImageUrl}
            flyerImageUrl={flyerImageUrl}
            clubData={clubData}
          />
        </div>
      </div>
    </div>
  );
}

export default PrintAdForm;
