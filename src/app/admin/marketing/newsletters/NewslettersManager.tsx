"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Send,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";
import { NewsletterPreview } from "./NewsletterPreview";
import type { Newsletter, Club, PromoCode } from "@/types/database";

interface NewslettersManagerProps {
  initialClubs: Club[];
  initialPromoCodes: PromoCode[];
}

interface NewsletterWithRelations extends Newsletter {
  clubs?: { name: string } | null;
  promo_codes?: { code: string } | null;
}

const ITEMS_PER_PAGE = 10;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadgeStyles(status: string): { backgroundColor: string; color: string } {
  if (status === "sent") {
    return {
      backgroundColor: "rgba(122, 124, 74, 0.1)",
      color: "var(--craigies-olive)",
    };
  }
  return {
    backgroundColor: "rgba(212, 132, 62, 0.1)",
    color: "var(--craigies-burnt-orange)",
  };
}

export function NewslettersManager({
  initialClubs,
  initialPromoCodes,
}: NewslettersManagerProps) {
  const [newsletters, setNewsletters] = useState<NewsletterWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null);
  const [previewNewsletter, setPreviewNewsletter] = useState<Newsletter | null>(null);
  const [previewClub, setPreviewClub] = useState<Club | null>(null);
  const [previewPromo, setPreviewPromo] = useState<PromoCode | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNewsletters = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/newsletters?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
      );
      if (response.ok) {
        const data = await response.json();
        setNewsletters(data.newsletters);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching newsletters:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  const handleEdit = (newsletter: NewsletterWithRelations) => {
    // Strip the relation data for the form
    const { clubs: _, promo_codes: __, ...rest } = newsletter;
    setEditingNewsletter(rest as Newsletter);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/newsletters?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchNewsletters();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete newsletter");
      }
    } catch (error) {
      console.error("Error deleting newsletter:", error);
      alert("Failed to delete newsletter");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = (newsletter: Newsletter) => {
    const club = newsletter.featured_club_id
      ? initialClubs.find((c) => c.id === newsletter.featured_club_id) || null
      : null;
    const promo = newsletter.promo_code_id
      ? initialPromoCodes.find((p) => p.id === newsletter.promo_code_id) || null
      : null;

    setPreviewClub(club);
    setPreviewPromo(promo);
    setPreviewNewsletter(newsletter);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingNewsletter(null);
  };

  const handleSaved = () => {
    fetchNewsletters();
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
          {total} newsletter{total !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => {
            setEditingNewsletter(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: "var(--craigies-burnt-orange)" }}
        >
          <Plus className="h-4 w-4" />
          Create Newsletter
        </button>
      </div>

      {/* Newsletters Table */}
      <div className="rounded-2xl bg-white p-6 shadow-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2
              className="h-8 w-8 animate-spin"
              style={{ color: "var(--craigies-olive)" }}
            />
          </div>
        ) : newsletters.length === 0 ? (
          <div className="py-12 text-center">
            <FileText
              className="mx-auto h-12 w-12"
              style={{ color: "var(--craigies-olive)", opacity: 0.5 }}
            />
            <p
              className="mt-4 text-lg font-medium"
              style={{ color: "var(--craigies-dark-olive)" }}
            >
              No newsletters yet
            </p>
            <p className="mt-1 text-sm" style={{ color: "#6B7280" }}>
              Create your first newsletter to engage with subscribers.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="space-y-3 md:hidden">
              {newsletters.map((newsletter) => (
                <div
                  key={newsletter.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3
                        className="truncate text-sm font-medium"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
                        {newsletter.subject}
                      </h3>
                      {newsletter.clubs?.name && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          Featuring: {newsletter.clubs.name}
                        </p>
                      )}
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={getStatusBadgeStyles(newsletter.status)}
                    >
                      {newsletter.status === "sent" && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {newsletter.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    {newsletter.sent_at && (
                      <span>{formatDate(newsletter.sent_at)}</span>
                    )}
                    {newsletter.status === "sent" && newsletter.recipient_count && (
                      <span>{newsletter.recipient_count.toLocaleString()} recipients</span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                    <button
                      onClick={() =>
                        handlePreview({
                          ...newsletter,
                          clubs: undefined,
                          promo_codes: undefined,
                        } as Newsletter)
                      }
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-100"
                      style={{ color: "var(--craigies-olive)" }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </button>
                    {newsletter.status === "draft" && (
                      <>
                        <button
                          onClick={() => handleEdit(newsletter)}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-100"
                          style={{ color: "var(--craigies-burnt-orange)" }}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(newsletter.id)}
                          disabled={deletingId === newsletter.id}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === newsletter.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cloud">
                    <th
                      className="pb-3 text-left text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Subject
                    </th>
                    <th
                      className="pb-3 text-left text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Status
                    </th>
                    <th
                      className="pb-3 text-left text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Sent At
                    </th>
                    <th
                      className="pb-3 text-left text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Recipients
                    </th>
                    <th
                      className="pb-3 text-right text-sm font-semibold"
                      style={{ color: "var(--craigies-dark-olive)" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cloud">
                  {newsletters.map((newsletter) => (
                    <tr
                      key={newsletter.id}
                      className="transition-colors hover:bg-cloud/50"
                    >
                      <td
                        className="py-4 text-sm"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
                        <div className="max-w-xs truncate font-medium">
                          {newsletter.subject}
                        </div>
                        {newsletter.clubs?.name && (
                          <div className="mt-1 text-xs text-gray-500">
                            Featuring: {newsletter.clubs.name}
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={getStatusBadgeStyles(newsletter.status)}
                        >
                          {newsletter.status === "sent" && (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {newsletter.status}
                        </span>
                      </td>
                      <td
                        className="py-4 text-sm"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
                        {newsletter.sent_at
                          ? formatDate(newsletter.sent_at)
                          : "—"}
                      </td>
                      <td
                        className="py-4 text-sm"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
                        {newsletter.status === "sent"
                          ? newsletter.recipient_count?.toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              handlePreview({
                                ...newsletter,
                                clubs: undefined,
                                promo_codes: undefined,
                              } as Newsletter)
                            }
                            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                            title="Preview"
                          >
                            <Eye
                              className="h-4 w-4"
                              style={{ color: "var(--craigies-olive)" }}
                            />
                          </button>
                          {newsletter.status === "draft" && (
                            <>
                              <button
                                onClick={() => handleEdit(newsletter)}
                                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                                title="Edit"
                              >
                                <Edit2
                                  className="h-4 w-4"
                                  style={{ color: "var(--craigies-burnt-orange)" }}
                                />
                              </button>
                              <button
                                onClick={() => handleDelete(newsletter.id)}
                                disabled={deletingId === newsletter.id}
                                className="rounded-lg p-2 transition-colors hover:bg-red-50 disabled:opacity-50"
                                title="Delete"
                              >
                                {deletingId === newsletter.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                )}
                              </button>
                            </>
                          )}
                          {newsletter.status === "sent" && (
                            <span
                              className="rounded-lg p-2"
                              title="Sent"
                            >
                              <Send
                                className="h-4 w-4"
                                style={{ color: "var(--craigies-olive)" }}
                              />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col gap-3 border-t border-cloud pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p
                  className="text-center text-sm sm:text-left"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total}{" "}
                  newsletters
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      borderColor: "#D1D5DB",
                      color: "var(--craigies-dark-olive)",
                    }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {/* Mobile: show current/total */}
                  <span
                    className="px-3 text-sm font-medium sm:hidden"
                    style={{ color: "var(--craigies-dark-olive)" }}
                  >
                    {currentPage} / {totalPages}
                  </span>
                  {/* Desktop: show page numbers */}
                  <div className="hidden sm:flex sm:items-center sm:gap-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                          style={{
                            backgroundColor:
                              currentPage === pageNum
                                ? "var(--craigies-olive)"
                                : "transparent",
                            color:
                              currentPage === pageNum
                                ? "white"
                                : "var(--craigies-dark-olive)",
                            border:
                              currentPage === pageNum ? "none" : "1px solid #D1D5DB",
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      borderColor: "#D1D5DB",
                      color: "var(--craigies-dark-olive)",
                    }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Newsletter Form Modal */}
      {showForm && (
        <NewsletterForm
          newsletter={editingNewsletter}
          clubs={initialClubs}
          promoCodes={initialPromoCodes}
          onClose={handleCloseForm}
          onSaved={handleSaved}
          onPreview={handlePreview}
        />
      )}

      {/* Newsletter Preview Modal */}
      {previewNewsletter && (
        <NewsletterPreview
          newsletter={previewNewsletter}
          club={previewClub}
          promoCode={previewPromo}
          onClose={() => {
            setPreviewNewsletter(null);
            setPreviewClub(null);
            setPreviewPromo(null);
          }}
        />
      )}
    </div>
  );
}
