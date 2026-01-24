"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Sparkles,
  Loader2,
  Save,
  Eye,
  Send,
  AlertCircle,
} from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import type { Newsletter, Club, PromoCode } from "@/types/database";

const newsletterSchema = z.object({
  roughDraft: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  preview_text: z.string().optional(),
  body_html: z.string().min(1, "Body content is required"),
  image_urls: z.array(z.string()),
  featured_club_id: z.string().optional(),
  promo_code_id: z.string().optional(),
  cta_text: z.string().optional(),
  cta_url: z.string().optional(),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
  newsletter?: Newsletter | null;
  clubs: Club[];
  promoCodes: PromoCode[];
  onClose: () => void;
  onSaved: () => void;
  onPreview: (newsletter: Newsletter) => void;
}

export function NewsletterForm({
  newsletter,
  clubs,
  promoCodes,
  onClose,
  onSaved,
  onPreview,
}: NewsletterFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  const isEditing = !!newsletter;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      roughDraft: "",
      subject: newsletter?.subject || "",
      preview_text: newsletter?.preview_text || "",
      body_html: newsletter?.body_html || "",
      image_urls: newsletter?.image_urls || [],
      featured_club_id: newsletter?.featured_club_id || "",
      promo_code_id: newsletter?.promo_code_id || "",
      cta_text: newsletter?.cta_text || "Book Now",
      cta_url: newsletter?.cta_url || "https://exploretheclubhouse.co.uk/clubs",
    },
  });

  const imageUrls = watch("image_urls");
  const featuredClubId = watch("featured_club_id");
  const promoCodeId = watch("promo_code_id");

  // Fetch subscriber count
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/admin/newsletters?limit=1");
        if (res.ok) {
          // This is a simplified approach; in production you might want a dedicated endpoint
          const subRes = await fetch("/api/admin/marketing/subscribers/count");
          if (subRes.ok) {
            const data = await subRes.json();
            setSubscriberCount(data.count);
          }
        }
      } catch {
        // Silently fail
      }
    }
    fetchCount();
  }, []);

  const handleGenerateAI = async () => {
    const roughDraft = watch("roughDraft");
    if (!roughDraft?.trim()) {
      setError("Please enter some notes for the AI to work with");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/newsletters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roughDraft,
          clubId: featuredClubId || null,
          promoCodeId: promoCodeId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate content");
      }

      const data = await response.json();
      setValue("subject", data.subject);
      setValue("preview_text", data.previewText);
      setValue("body_html", data.bodyHtml);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (data: NewsletterFormData) => {
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        ...(isEditing ? { id: newsletter.id } : {}),
        subject: data.subject,
        preview_text: data.preview_text || null,
        body_html: data.body_html,
        image_urls: data.image_urls,
        featured_club_id: data.featured_club_id || null,
        promo_code_id: data.promo_code_id || null,
        cta_text: data.cta_text || null,
        cta_url: data.cta_url || null,
      };

      const response = await fetch("/api/admin/newsletters", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save newsletter");
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save newsletter");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewClick = () => {
    const data = watch();
    const previewNewsletter: Newsletter = {
      id: newsletter?.id || "preview",
      subject: data.subject,
      preview_text: data.preview_text || null,
      body_html: data.body_html,
      image_urls: data.image_urls,
      featured_club_id: data.featured_club_id || null,
      promo_code_id: data.promo_code_id || null,
      cta_text: data.cta_text || null,
      cta_url: data.cta_url || null,
      status: "draft",
      sent_at: null,
      recipient_count: 0,
      created_at: newsletter?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onPreview(previewNewsletter);
  };

  const handleSendNewsletter = async () => {
    if (!newsletter?.id) {
      setError("Please save the newsletter first before sending");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/newsletters/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterId: newsletter.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send newsletter");
      }

      const data = await response.json();
      alert(`Newsletter sent successfully to ${data.sentCount} subscribers!`);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send newsletter");
    } finally {
      setIsSending(false);
      setShowSendConfirm(false);
    }
  };

  // Filter active clubs and promo codes
  const activeClubs = clubs.filter((c) => c.is_active);
  const activePromoCodes = promoCodes.filter((p) => p.is_active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2
            className="text-xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            {isEditing ? "Edit Newsletter" : "Create Newsletter"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" style={{ color: "var(--craigies-dark-olive)" }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleSave)} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* AI Generation Section */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles
                className="h-5 w-5"
                style={{ color: "var(--craigies-burnt-orange)" }}
              />
              <h3
                className="font-semibold"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                AI Content Generation
              </h3>
            </div>

            <div className="space-y-4">
              {/* Club & Promo Selection for AI */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="featured_club_id"
                    className="mb-1 block text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Feature a Club (optional)
                  </label>
                  <select
                    id="featured_club_id"
                    {...register("featured_club_id")}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    <option value="">No club</option>
                    {activeClubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="promo_code_id"
                    className="mb-1 block text-sm font-medium"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    Include Promo Code (optional)
                  </label>
                  <select
                    id="promo_code_id"
                    {...register("promo_code_id")}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    <option value="">No promo code</option>
                    {activePromoCodes.map((promo) => (
                      <option key={promo.id} value={promo.id}>
                        {promo.code} ({promo.discount_percent}% off)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rough Draft */}
              <div>
                <label
                  htmlFor="roughDraft"
                  className="mb-1 block text-sm font-medium"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Your Notes for AI
                </label>
                <textarea
                  id="roughDraft"
                  {...register("roughDraft")}
                  rows={3}
                  placeholder="Enter your rough ideas, key points, or notes... The AI will transform these into polished newsletter content."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
                  style={{ color: "var(--craigies-dark-olive)" }}
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="subject"
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Subject Line <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              {...register("subject")}
              placeholder="Enter email subject..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
              style={{ color: "var(--craigies-dark-olive)" }}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
            )}
          </div>

          {/* Preview Text */}
          <div>
            <label
              htmlFor="preview_text"
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Preview Text
              <span className="ml-1 text-xs text-gray-500">
                (appears in email inbox preview)
              </span>
            </label>
            <input
              type="text"
              id="preview_text"
              {...register("preview_text")}
              placeholder="Brief preview shown in inbox..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
              style={{ color: "var(--craigies-dark-olive)" }}
            />
          </div>

          {/* Body HTML */}
          <div>
            <label
              htmlFor="body_html"
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Email Body <span className="text-red-500">*</span>
            </label>
            <textarea
              id="body_html"
              {...register("body_html")}
              rows={10}
              placeholder="Enter HTML content for the email body..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-mono text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
              style={{ color: "var(--craigies-dark-olive)" }}
            />
            {errors.body_html && (
              <p className="mt-1 text-sm text-red-500">{errors.body_html.message}</p>
            )}
          </div>

          {/* Images */}
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              Newsletter Images
            </label>
            <ImageUploader
              images={imageUrls}
              onChange={(urls) => setValue("image_urls", urls)}
              maxImages={3}
            />
          </div>

          {/* CTA */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="cta_text"
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                CTA Button Text
              </label>
              <input
                type="text"
                id="cta_text"
                {...register("cta_text")}
                placeholder="e.g., Book Now"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
                style={{ color: "var(--craigies-dark-olive)" }}
              />
            </div>
            <div>
              <label
                htmlFor="cta_url"
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--craigies-dark-olive)" }}
              >
                CTA Button URL
              </label>
              <input
                type="url"
                id="cta_url"
                {...register("cta_url")}
                placeholder="https://exploretheclubhouse.co.uk/clubs"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
                style={{ color: "var(--craigies-dark-olive)" }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePreviewClick}
                className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
                style={{
                  borderColor: "var(--craigies-olive)",
                  color: "var(--craigies-olive)",
                }}
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--craigies-olive)" }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Draft
                  </>
                )}
              </button>

              {isEditing && newsletter?.status === "draft" && (
                <button
                  type="button"
                  onClick={() => setShowSendConfirm(true)}
                  disabled={isSending}
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Newsletter
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Send Confirmation Modal */}
        {showSendConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3
                className="text-lg font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                Confirm Send
              </h3>
              <p className="mt-3 text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Are you sure you want to send this newsletter
                {subscriberCount !== null ? ` to ${subscriberCount} subscribers` : ""}?
                This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowSendConfirm(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNewsletter}
                  disabled={isSending}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Yes, Send Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
