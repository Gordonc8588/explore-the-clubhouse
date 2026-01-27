"use client";

import { useState } from "react";
import {
  X,
  Monitor,
  Smartphone,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Newsletter, Club, PromoCode } from "@/types/database";

interface NewsletterPreviewProps {
  newsletter: Newsletter;
  club?: Club | null;
  promoCode?: PromoCode | null;
  onClose: () => void;
}

// Format date to readable string
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Format time to readable string
function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes}${ampm}`;
}

/**
 * Check if images are already embedded in the HTML body
 */
function hasEmbeddedImages(bodyHtml: string): boolean {
  const imgRegex = /<img[^>]+src\s*=\s*["'][^"']+["'][^>]*>/i;
  return imgRegex.test(bodyHtml);
}

/**
 * Check if a CTA button is already embedded in the HTML body
 * This detects AI-generated CTA buttons to avoid duplication
 */
function hasEmbeddedCTA(bodyHtml: string): boolean {
  // Check for button-styled table cells (email-safe button pattern)
  const tableButtonRegex = /<td[^>]+background-color:\s*#D4843E[^>]*>/i;
  if (tableButtonRegex.test(bodyHtml)) return true;

  // Check for anchor tags with button-like inline styling (inline-block + padding)
  const inlineButtonRegex = /<a[^>]+style\s*=\s*["'][^"']*display:\s*inline-block[^"']*padding[^"']*["'][^>]*>/i;
  if (inlineButtonRegex.test(bodyHtml)) return true;

  // Check for anchor tags with href="#" (AI placeholder pattern) inside styled containers
  const placeholderButtonRegex = /<a[^>]+href\s*=\s*["']#["'][^>]+style[^>]*>/i;
  if (placeholderButtonRegex.test(bodyHtml)) return true;

  return false;
}

function buildPreviewHtml(
  newsletter: Newsletter,
  club?: Club | null,
  promoCode?: PromoCode | null
): string {
  // Check if AI has embedded images in the body (indicates AI-generated content)
  const imagesEmbedded = hasEmbeddedImages(newsletter.body_html);

  // Build hero images section - SKIP if AI has embedded images
  let heroSection = "";
  if (!imagesEmbedded && newsletter.image_urls && newsletter.image_urls.length > 0) {
    const images = newsletter.image_urls
      .map(
        (url) => `
        <img src="${url}" alt="The Clubhouse" style="width: 100%; max-width: 560px; height: auto; border-radius: 12px; margin-bottom: 16px; display: block;" />
      `
      )
      .join("");
    heroSection = `
      <div style="margin-bottom: 24px;">
        ${images}
      </div>
    `;
  }

  // Build featured club section - SKIP if AI has embedded images (AI handles this)
  let clubSection = "";
  if (club && !imagesEmbedded) {
    clubSection = `
      <div style="background-color: #F5F4ED; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #7A7C4A;">
        <h3 style="margin: 0 0 12px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 600; color: #7A7C4A;">
          ${club.name}
        </h3>
        <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%;">
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6B7280; width: 100px;">Dates</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 500; color: #3D3D3D;">${formatDate(club.start_date)} - ${formatDate(club.end_date)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Times</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 500; color: #3D3D3D;">${formatTime(club.morning_start)} - ${formatTime(club.afternoon_end)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #6B7280;">Ages</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 500; color: #3D3D3D;">${club.min_age} - ${club.max_age} years</td>
          </tr>
        </table>
        ${club.description ? `<p style="margin: 12px 0 0; font-size: 14px; color: #3D3D3D; line-height: 1.6;">${club.description}</p>` : ""}
      </div>
    `;
  }

  // Build promo code section - SKIP if AI has embedded images (AI handles this)
  let promoSection = "";
  if (promoCode && !imagesEmbedded) {
    promoSection = `
      <div style="background-color: #F5F4ED; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #7A7C4A;">
        <h3 style="margin: 0 0 8px; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 600; color: #5A5C3A;">Use code ${promoCode.code} for ${promoCode.discount_percent}% off!</h3>
        <p style="margin: 0; font-size: 14px; color: #3D3D3D; line-height: 1.6;">Valid until ${formatDate(promoCode.valid_until)}. ${promoCode.max_uses ? `Limited to ${promoCode.max_uses} uses.` : ""}</p>
      </div>
    `;
  }

  // Build CTA section - SKIP if AI has embedded a CTA in the body
  let ctaSection = "";
  if (newsletter.cta_text && newsletter.cta_url && !imagesEmbedded && !hasEmbeddedCTA(newsletter.body_html)) {
    ctaSection = `
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
        <tr>
          <td align="center" style="background-color: #D4843E; border-radius: 8px;">
            <a href="${newsletter.cta_url}" style="display: inline-block; padding: 14px 28px; font-family: 'Nunito Sans', sans-serif; font-size: 16px; font-weight: 600; color: #FFFFFF; text-decoration: none;">
              ${newsletter.cta_text}
            </a>
          </td>
        </tr>
      </table>
    `;
  }

  // Build unsubscribe link
  const unsubscribeSection = `
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
        You received this email because you subscribed to The Clubhouse newsletter.<br>
        <a href="#" style="color: #7A7C4A; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  `;

  const content = `
    ${heroSection}
    <div style="font-size: 16px; line-height: 1.7; color: #3D3D3D;">
      ${newsletter.body_html}
    </div>
    ${clubSection}
    ${promoSection}
    ${ctaSection}
    ${unsubscribeSection}
  `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Clubhouse</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F5F4ED; color: #3D3D3D;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F5F4ED;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; color: #7A7C4A;">
                The Clubhouse
              </h1>
            </td>
          </tr>
          <!-- Content Card -->
          <tr>
            <td style="background-color: #FFFFFF; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(122, 124, 74, 0.1);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6B7280;">
                The Clubhouse | Fun-filled farm experiences for children aged 5-11
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                If you have any questions, please contact us at<br>
                <a href="mailto:hello@exploretheclubhouse.co.uk" style="color: #7A7C4A;">hello@exploretheclubhouse.co.uk</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function NewsletterPreview({
  newsletter,
  club,
  promoCode,
  onClose,
}: NewsletterPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [testError, setTestError] = useState<string | null>(null);

  const previewHtml = buildPreviewHtml(newsletter, club, promoCode);

  const handleSendTest = async () => {
    if (!testEmail || newsletter.id === "preview") {
      setTestError("Please save the newsletter first and enter a valid email");
      setTestStatus("error");
      return;
    }

    setIsSendingTest(true);
    setTestStatus("idle");
    setTestError(null);

    try {
      const response = await fetch("/api/admin/newsletters/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletterId: newsletter.id,
          testEmail,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send test email");
      }

      setTestStatus("success");
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "Failed to send test email");
      setTestStatus("error");
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-3">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Email Preview</h2>
          <div className="flex rounded-lg bg-gray-700 p-1">
            <button
              onClick={() => setViewMode("desktop")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                viewMode === "desktop"
                  ? "bg-white text-gray-900"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Monitor className="h-4 w-4" />
              Desktop
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                viewMode === "mobile"
                  ? "bg-white text-gray-900"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Test Email */}
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@email.com"
              className="w-48 rounded-lg border border-gray-600 bg-gray-700 px-3 py-1.5 text-sm text-white placeholder:text-gray-400 focus:border-white focus:outline-none"
            />
            <button
              onClick={handleSendTest}
              disabled={isSendingTest || !testEmail || newsletter.id === "preview"}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSendingTest ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : testStatus === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : testStatus === "error" ? (
                <AlertCircle className="h-4 w-4 text-red-400" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Test
            </button>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Test status message */}
      {testStatus === "success" && (
        <div className="bg-green-600 px-4 py-2 text-center text-sm text-white">
          Test email sent successfully to {testEmail}
        </div>
      )}
      {testStatus === "error" && testError && (
        <div className="bg-red-600 px-4 py-2 text-center text-sm text-white">
          {testError}
        </div>
      )}

      {/* Subject & Preview Text */}
      <div className="border-b border-gray-700 bg-gray-800/50 px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-gray-400">
            <span className="font-medium text-gray-300">Subject:</span>{" "}
            {newsletter.subject}
          </p>
          {newsletter.preview_text && (
            <p className="mt-1 text-sm text-gray-400">
              <span className="font-medium text-gray-300">Preview:</span>{" "}
              {newsletter.preview_text}
            </p>
          )}
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 overflow-auto p-4">
        <div
          className="mx-auto bg-white shadow-2xl"
          style={{
            width: viewMode === "desktop" ? "640px" : "375px",
            minHeight: "100%",
            transition: "width 0.3s ease",
          }}
        >
          <iframe
            srcDoc={previewHtml}
            title="Newsletter Preview"
            className="h-full w-full border-0"
            style={{ minHeight: "800px" }}
          />
        </div>
      </div>
    </div>
  );
}
