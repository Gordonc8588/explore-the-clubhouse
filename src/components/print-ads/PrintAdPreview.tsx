"use client";

import Image from "next/image";
import { TEMPLATES } from "@/lib/print-ads/templates";
import { BRAND_COLORS, countWords } from "@/lib/print-ads/types";
import type { PrintAdType, PrintAdClubData } from "@/types/database";

interface PrintAdPreviewProps {
  adType: PrintAdType;
  headline: string;
  bodyCopy: string;
  ctaText: string;
  mainImageUrl: string | null;
  flyerImageUrl?: string | null;
  clubData: PrintAdClubData | null;
}

/**
 * Format price for display (pence to pounds)
 */
function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(0)}`;
}

export function PrintAdPreview({
  adType,
  headline,
  bodyCopy,
  ctaText,
  mainImageUrl,
  flyerImageUrl,
  clubData,
}: PrintAdPreviewProps) {
  const template = TEMPLATES[adType];
  const wordCount = countWords(bodyCopy);

  // Calculate aspect ratio for preview scaling
  const aspectRatio = template.width / template.height;

  // Get minimum price from club data
  const minPrice = clubData?.prices?.length
    ? Math.min(...clubData.prices.map((p) => p.price))
    : null;

  return (
    <div className="space-y-3">
      {/* Header with template info */}
      <div className="flex items-center justify-between">
        <h3
          className="font-medium"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--craigies-dark-olive)",
          }}
        >
          Preview
        </h3>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
          {template.name} • {template.width}×{template.height}mm
        </span>
      </div>

      {/* Preview container - scaled to fit */}
      <div
        className="relative mx-auto overflow-hidden rounded-lg shadow-lg"
        style={{
          width: "100%",
          maxWidth: "320px",
          aspectRatio: aspectRatio,
        }}
      >
        {/* Ad content */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{
            backgroundColor: BRAND_COLORS.cream,
            padding: `${(template.margins.top / template.height) * 100}%`,
            fontFamily: "'Nunito Sans', sans-serif",
          }}
        >
          {/* Main Image */}
          <div
            className="relative flex-shrink-0 overflow-hidden rounded-sm bg-gray-200"
            style={{
              height: `${((template.zones.image.height || 50) / template.height) * 100}%`,
            }}
          >
            {mainImageUrl ? (
              <Image
                src={mainImageUrl}
                alt="Ad image"
                fill
                className="object-cover"
                sizes="320px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <span className="text-xs">No image selected</span>
              </div>
            )}
          </div>

          {/* Content area */}
          <div className="flex flex-1 flex-col pt-2">
            {/* Headline */}
            <h2
              className="mb-1 leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: adType === "magazine_quarter_page" ? "0.75rem" : "1rem",
                fontWeight: 700,
                color: BRAND_COLORS.darkOlive,
              }}
            >
              {headline || "Your Headline Here"}
            </h2>

            {/* Club info line */}
            {clubData && (
              <p
                className="mb-1"
                style={{
                  fontSize: adType === "magazine_quarter_page" ? "0.5rem" : "0.65rem",
                  color: BRAND_COLORS.olive,
                }}
              >
                <span style={{ fontWeight: 600, color: BRAND_COLORS.darkOlive }}>
                  {clubData.name}
                </span>
                {" • "}
                {clubData.dates}
                {" • Ages "}
                {clubData.age_range}
                {minPrice && ` • From ${formatPrice(minPrice)}`}
              </p>
            )}

            {/* Body copy */}
            <p
              className="flex-1 overflow-hidden text-justify"
              style={{
                fontSize: adType === "magazine_quarter_page" ? "0.45rem" : "0.6rem",
                lineHeight: 1.5,
                color: BRAND_COLORS.darkOlive,
              }}
            >
              {bodyCopy || "Your editorial copy will appear here. Aim for 80-100 words in third person style."}
            </p>

            {/* CTA Button */}
            <div
              className="mt-2 self-start rounded px-2 py-1"
              style={{
                backgroundColor: BRAND_COLORS.burntOrange,
              }}
            >
              <span
                style={{
                  fontSize: adType === "magazine_quarter_page" ? "0.5rem" : "0.65rem",
                  fontWeight: 600,
                  color: BRAND_COLORS.white,
                }}
              >
                {ctaText || "Book Now"}
              </span>
            </div>

            {/* Flyer image (optional) */}
            {flyerImageUrl && (
              <div className="relative mt-2 h-8 overflow-hidden rounded-sm">
                <Image
                  src={flyerImageUrl}
                  alt="Flyer"
                  fill
                  className="object-contain"
                  sizes="200px"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="mt-auto border-t pt-1"
            style={{
              borderColor: BRAND_COLORS.olive,
            }}
          >
            <p
              className="text-center"
              style={{
                fontSize: adType === "magazine_quarter_page" ? "0.4rem" : "0.55rem",
                color: BRAND_COLORS.olive,
              }}
            >
              exploretheclubhouse.com • {clubData?.location || "Craigies Farm, South Queensferry"}
            </p>
          </div>
        </div>
      </div>

      {/* Word count indicator */}
      <div className="flex items-center justify-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            wordCount.isValid
              ? "bg-green-100 text-green-700"
              : bodyCopy
              ? "bg-amber-100 text-amber-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {wordCount.message}
        </span>
      </div>

      {/* Content warnings */}
      <div className="space-y-1 text-center">
        {!mainImageUrl && (
          <p className="text-xs text-amber-600">⚠ Please select a main image</p>
        )}
        {!clubData && (
          <p className="text-xs text-amber-600">⚠ Please select a club</p>
        )}
        {!headline && (
          <p className="text-xs text-amber-600">⚠ Please add a headline</p>
        )}
        {!wordCount.isValid && bodyCopy && (
          <p className="text-xs text-amber-600">⚠ Body copy needs more words</p>
        )}
      </div>
    </div>
  );
}

export default PrintAdPreview;
