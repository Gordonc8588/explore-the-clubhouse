"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Smartphone,
  Monitor,
  ChevronDown,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Share2,
  Globe,
  AlertTriangle,
} from "lucide-react";

interface AdPreviewProps {
  images: { url: string; label: string }[];
  primaryText: string;
  headline: string;
  description: string;
  ctaType: string;
  ctaUrl: string;
  pageName?: string;
  pageImageUrl?: string;
}

type Platform = "facebook" | "instagram";
type Placement = "feed" | "stories";
type Device = "mobile" | "desktop";

const CTA_LABELS: Record<string, string> = {
  BOOK_NOW: "Book Now",
  LEARN_MORE: "Learn More",
  SIGN_UP: "Sign Up",
  SHOP_NOW: "Shop Now",
  CONTACT_US: "Contact Us",
  GET_OFFER: "Get Offer",
};

const CHAR_LIMITS = {
  primaryText: { recommended: 125, max: 1000 },
  headline: { recommended: 40, max: 255 },
  description: { recommended: 30, max: 255 },
};

export function AdPreview({
  images,
  primaryText,
  headline,
  description,
  ctaType,
  ctaUrl,
  pageName = "The Clubhouse",
  pageImageUrl,
}: AdPreviewProps) {
  const [platform, setPlatform] = useState<Platform>("facebook");
  const [placement, setPlacement] = useState<Placement>("feed");
  const [device, setDevice] = useState<Device>("mobile");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImage = images[currentImageIndex]?.url || "";
  const ctaLabel = CTA_LABELS[ctaType] || "Learn More";

  // Check character limits
  const primaryTextOverLimit = primaryText.length > CHAR_LIMITS.primaryText.recommended;
  const headlineOverLimit = headline.length > CHAR_LIMITS.headline.recommended;
  const descriptionOverLimit = description.length > CHAR_LIMITS.description.recommended;
  const hasWarnings = primaryTextOverLimit || headlineOverLimit || descriptionOverLimit;

  // Truncate text for preview (simulating Meta's truncation)
  const truncateText = (text: string, limit: number) => {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + "...";
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Platform Selector */}
        <div className="flex rounded-lg border border-gray-200 p-1">
          <button
            type="button"
            onClick={() => setPlatform("facebook")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              platform === "facebook"
                ? "bg-[var(--craigies-olive)] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Facebook
          </button>
          <button
            type="button"
            onClick={() => setPlatform("instagram")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              platform === "instagram"
                ? "bg-[var(--craigies-olive)] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Instagram
          </button>
        </div>

        {/* Placement Selector */}
        <div className="flex rounded-lg border border-gray-200 p-1">
          <button
            type="button"
            onClick={() => setPlacement("feed")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              placement === "feed"
                ? "bg-[var(--craigies-olive)] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Feed
          </button>
          <button
            type="button"
            onClick={() => setPlacement("stories")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              placement === "stories"
                ? "bg-[var(--craigies-olive)] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Stories
          </button>
        </div>

        {/* Device Toggle (Feed only) */}
        {placement === "feed" && (
          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                device === "mobile"
                  ? "bg-[var(--craigies-olive)] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </button>
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                device === "desktop"
                  ? "bg-[var(--craigies-olive)] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Monitor className="h-4 w-4" />
              Desktop
            </button>
          </div>
        )}

        {/* Image Selector (if multiple images) */}
        {images.length > 1 && (
          <div className="relative">
            <select
              value={currentImageIndex}
              onChange={(e) => setCurrentImageIndex(Number(e.target.value))}
              className="appearance-none rounded-lg border border-gray-200 bg-white px-3 py-1.5 pr-8 text-sm font-medium text-gray-600"
            >
              {images.map((img, idx) => (
                <option key={idx} value={idx}>
                  {img.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        )}
      </div>

      {/* Character Limit Warnings */}
      {hasWarnings && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-medium">Character limit warnings:</p>
            <ul className="mt-1 list-inside list-disc">
              {primaryTextOverLimit && (
                <li>
                  Primary text: {primaryText.length}/{CHAR_LIMITS.primaryText.recommended} chars
                  (may be truncated)
                </li>
              )}
              {headlineOverLimit && (
                <li>
                  Headline: {headline.length}/{CHAR_LIMITS.headline.recommended} chars
                </li>
              )}
              {descriptionOverLimit && (
                <li>
                  Description: {description.length}/{CHAR_LIMITS.description.recommended} chars
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Preview Container */}
      <div className="flex justify-center rounded-lg bg-gray-100 p-6">
        {placement === "feed" ? (
          platform === "facebook" ? (
            <FacebookFeedPreview
              image={currentImage}
              primaryText={primaryText}
              headline={headline}
              description={description}
              ctaLabel={ctaLabel}
              pageName={pageName}
              pageImageUrl={pageImageUrl}
              device={device}
              truncateText={truncateText}
            />
          ) : (
            <InstagramFeedPreview
              image={currentImage}
              primaryText={primaryText}
              headline={headline}
              ctaLabel={ctaLabel}
              pageName={pageName}
              pageImageUrl={pageImageUrl}
              truncateText={truncateText}
            />
          )
        ) : platform === "facebook" ? (
          <FacebookStoriesPreview
            image={currentImage}
            headline={headline}
            ctaLabel={ctaLabel}
            pageName={pageName}
            pageImageUrl={pageImageUrl}
          />
        ) : (
          <InstagramStoriesPreview
            image={currentImage}
            headline={headline}
            ctaLabel={ctaLabel}
            pageName={pageName}
            pageImageUrl={pageImageUrl}
          />
        )}
      </div>

      <p className="text-center text-xs text-gray-500">
        This is an approximate preview. Actual appearance may vary.
      </p>
    </div>
  );
}

// Facebook Feed Preview
function FacebookFeedPreview({
  image,
  primaryText,
  headline,
  description,
  ctaLabel,
  pageName,
  pageImageUrl,
  device,
  truncateText,
}: {
  image: string;
  primaryText: string;
  headline: string;
  description: string;
  ctaLabel: string;
  pageName: string;
  pageImageUrl?: string;
  device: Device;
  truncateText: (text: string, limit: number) => string;
}) {
  const isMobile = device === "mobile";
  const containerWidth = isMobile ? "w-[320px]" : "w-[500px]";

  return (
    <div className={`${containerWidth} overflow-hidden rounded-lg bg-white shadow-lg`}>
      {/* Header */}
      <div className="flex items-center gap-2 p-3">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-[var(--craigies-olive)]">
          {pageImageUrl ? (
            <Image
              src={pageImageUrl}
              alt={pageName}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
              {pageName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{pageName}</p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            Sponsored · <Globe className="h-3 w-3" />
          </p>
        </div>
        <button type="button" className="p-1 text-gray-400">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Primary Text */}
      <div className="px-3 pb-2">
        <p className="text-sm text-gray-900">
          {truncateText(primaryText, isMobile ? 125 : 200)}
        </p>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-gray-200">
        {image ? (
          <Image src={image} alt="Ad preview" fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No image selected
          </div>
        )}
      </div>

      {/* Link Preview */}
      <div className="border-t border-gray-100 bg-gray-50 p-3">
        <p className="mb-1 text-xs uppercase text-gray-500">exploretheclubhouse.com</p>
        <p className="text-sm font-semibold text-gray-900">
          {truncateText(headline, 40)}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500">
            {truncateText(description, 30)}
          </p>
        )}
      </div>

      {/* CTA Button */}
      <div className="border-t border-gray-100 p-3">
        <button
          type="button"
          className="w-full rounded-md bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white"
        >
          {ctaLabel}
        </button>
      </div>

      {/* Engagement Bar */}
      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
        <button type="button" className="flex items-center gap-1 text-sm text-gray-500">
          <ThumbsUp className="h-4 w-4" /> Like
        </button>
        <button type="button" className="flex items-center gap-1 text-sm text-gray-500">
          <MessageCircle className="h-4 w-4" /> Comment
        </button>
        <button type="button" className="flex items-center gap-1 text-sm text-gray-500">
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
    </div>
  );
}

// Instagram Feed Preview
function InstagramFeedPreview({
  image,
  primaryText,
  headline,
  ctaLabel,
  pageName,
  pageImageUrl,
  truncateText,
}: {
  image: string;
  primaryText: string;
  headline: string;
  ctaLabel: string;
  pageName: string;
  pageImageUrl?: string;
  truncateText: (text: string, limit: number) => string;
}) {
  return (
    <div className="w-[320px] overflow-hidden rounded-lg bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 p-3">
        <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5">
          <div className="h-full w-full overflow-hidden rounded-full bg-white">
            {pageImageUrl ? (
              <Image
                src={pageImageUrl}
                alt={pageName}
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--craigies-olive)] text-xs font-bold text-white">
                {pageName.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{pageName.toLowerCase().replace(/\s+/g, "")}</p>
          <p className="text-xs text-gray-500">Sponsored</p>
        </div>
        <button type="button" className="p-1 text-gray-400">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-gray-200">
        {image ? (
          <Image src={image} alt="Ad preview" fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No image selected
          </div>
        )}
        {/* CTA Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <button
            type="button"
            className="w-full rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900"
          >
            {ctaLabel}
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <Heart className="h-6 w-6 text-gray-900" />
          <MessageCircle className="h-6 w-6 text-gray-900" />
          <Send className="h-6 w-6 text-gray-900" />
        </div>
        <Bookmark className="h-6 w-6 text-gray-900" />
      </div>

      {/* Headline & Caption */}
      <div className="px-3 pb-3">
        <p className="text-sm font-semibold text-gray-900">
          {truncateText(headline, 40)}
        </p>
        <p className="mt-1 text-sm text-gray-900">
          <span className="font-semibold">{pageName.toLowerCase().replace(/\s+/g, "")}</span>{" "}
          {truncateText(primaryText, 100)}
        </p>
      </div>
    </div>
  );
}

// Facebook Stories Preview
function FacebookStoriesPreview({
  image,
  headline,
  ctaLabel,
  pageName,
  pageImageUrl,
}: {
  image: string;
  headline: string;
  ctaLabel: string;
  pageName: string;
  pageImageUrl?: string;
}) {
  return (
    <div className="relative h-[568px] w-[320px] overflow-hidden rounded-2xl bg-gray-900 shadow-lg">
      {/* Background Image */}
      {image ? (
        <Image src={image} alt="Ad preview" fill className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          No image selected
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Progress Bar */}
      <div className="absolute left-2 right-2 top-2">
        <div className="h-0.5 rounded-full bg-white/30">
          <div className="h-full w-1/3 rounded-full bg-white" />
        </div>
      </div>

      {/* Header */}
      <div className="absolute left-0 right-0 top-4 flex items-center gap-2 px-3">
        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-[var(--craigies-olive)]">
          {pageImageUrl ? (
            <Image
              src={pageImageUrl}
              alt={pageName}
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
              {pageName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{pageName}</p>
          <p className="text-xs text-white/70">Sponsored</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {headline && (
          <p className="mb-3 text-center text-lg font-semibold text-white drop-shadow-lg">
            {headline}
          </p>
        )}
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900"
        >
          {ctaLabel}
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
        </button>
      </div>
    </div>
  );
}

// Instagram Stories Preview
function InstagramStoriesPreview({
  image,
  headline,
  ctaLabel,
  pageName,
  pageImageUrl,
}: {
  image: string;
  headline: string;
  ctaLabel: string;
  pageName: string;
  pageImageUrl?: string;
}) {
  return (
    <div className="relative h-[568px] w-[320px] overflow-hidden rounded-2xl bg-gray-900 shadow-lg">
      {/* Background Image */}
      {image ? (
        <Image src={image} alt="Ad preview" fill className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          No image selected
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* Progress Bar */}
      <div className="absolute left-2 right-2 top-2">
        <div className="h-0.5 rounded-full bg-white/30">
          <div className="h-full w-1/3 rounded-full bg-white" />
        </div>
      </div>

      {/* Header */}
      <div className="absolute left-0 right-0 top-4 flex items-center gap-2 px-3">
        <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-0.5">
          <div className="h-full w-full overflow-hidden rounded-full">
            {pageImageUrl ? (
              <Image
                src={pageImageUrl}
                alt={pageName}
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--craigies-olive)] text-xs font-bold text-white">
                {pageName.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            {pageName.toLowerCase().replace(/\s+/g, "")}
          </p>
        </div>
        <span className="rounded bg-white/20 px-2 py-0.5 text-xs text-white">
          Sponsored
        </span>
      </div>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {headline && (
          <p className="mb-3 text-center text-lg font-semibold text-white drop-shadow-lg">
            {headline}
          </p>
        )}
        <div className="flex flex-col items-center gap-2">
          <ChevronDown className="h-6 w-6 animate-bounce text-white" />
          <button
            type="button"
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
