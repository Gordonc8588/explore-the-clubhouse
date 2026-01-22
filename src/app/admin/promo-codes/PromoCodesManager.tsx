"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  validFrom: string;
  validUntil: string;
  maxUses: number | null;
  timesUsed: number;
  clubId: string | null;
  clubName: string | null;
  isActive: boolean;
}

interface Club {
  id: string;
  name: string;
}

interface PromoCodesManagerProps {
  promoCodes: PromoCode[];
  clubs: Club[];
}

interface FormData {
  code: string;
  discountPercent: string;
  validFrom: string;
  validUntil: string;
  maxUses: string;
  clubId: string;
  isActive: boolean;
}

const ITEMS_PER_PAGE = 6;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PromoCodesManager({ promoCodes: initialPromoCodes, clubs }: PromoCodesManagerProps) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    code: "",
    discountPercent: "",
    validFrom: "",
    validUntil: "",
    maxUses: "",
    clubId: "",
    isActive: true,
  });

  // Pagination
  const totalPages = Math.ceil(promoCodes.length / ITEMS_PER_PAGE);
  const paginatedCodes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return promoCodes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [promoCodes, currentPage]);

  const openCreateModal = () => {
    setEditingCode(null);
    setFormData({
      code: "",
      discountPercent: "",
      validFrom: "",
      validUntil: "",
      maxUses: "",
      clubId: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (promoCode: PromoCode) => {
    setEditingCode(promoCode);
    setFormData({
      code: promoCode.code,
      discountPercent: promoCode.discountPercent.toString(),
      validFrom: promoCode.validFrom,
      validUntil: promoCode.validUntil,
      maxUses: promoCode.maxUses?.toString() || "",
      clubId: promoCode.clubId || "",
      isActive: promoCode.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const clubInfo = clubs.find((c) => c.id === formData.clubId);

    const newPromoCode: PromoCode = {
      id: editingCode?.id || crypto.randomUUID(),
      code: formData.code.toUpperCase(),
      discountPercent: parseInt(formData.discountPercent, 10),
      validFrom: formData.validFrom,
      validUntil: formData.validUntil,
      maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : null,
      timesUsed: editingCode?.timesUsed || 0,
      clubId: formData.clubId || null,
      clubName: clubInfo?.name || null,
      isActive: formData.isActive,
    };

    // TODO: Call API to save promo code
    if (editingCode) {
      setPromoCodes((prev) =>
        prev.map((pc) => (pc.id === editingCode.id ? newPromoCode : pc))
      );
    } else {
      setPromoCodes((prev) => [newPromoCode, ...prev]);
    }

    closeModal();
  };

  const handleDelete = async (id: string) => {
    // TODO: Call API to delete promo code
    setPromoCodes((prev) => prev.filter((pc) => pc.id !== id));
    setDeleteConfirmId(null);
    // Adjust page if needed
    const newTotal = promoCodes.length - 1;
    const newTotalPages = Math.ceil(newTotal / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  return (
    <>
      {/* Create Button */}
      <div className="flex justify-end">
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sunshine px-6 py-3 font-display font-semibold text-bark transition-colors hover:bg-amber"
        >
          <Plus className="h-5 w-5" />
          Create New Code
        </button>
      </div>

      {/* Promo Codes Table */}
      <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-md)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-cloud">
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Code
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Discount
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Valid From
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Valid Until
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Max Uses
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Times Used
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Club
                </th>
                <th className="pb-3 text-left font-body text-sm font-semibold text-stone">
                  Status
                </th>
                <th className="pb-3 text-right font-body text-sm font-semibold text-stone">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud">
              {paginatedCodes.map((promoCode) => (
                <tr key={promoCode.id} className="hover:bg-cloud/50">
                  <td className="py-4 font-body text-sm font-medium text-bark">
                    <span className="rounded bg-forest/10 px-2 py-1 font-mono text-forest">
                      {promoCode.code}
                    </span>
                  </td>
                  <td className="py-4 font-body text-sm font-medium text-bark">
                    {promoCode.discountPercent}%
                  </td>
                  <td className="py-4 font-body text-sm text-bark">
                    {formatDate(promoCode.validFrom)}
                  </td>
                  <td className="py-4 font-body text-sm text-bark">
                    {formatDate(promoCode.validUntil)}
                  </td>
                  <td className="py-4 font-body text-sm text-bark">
                    {promoCode.maxUses !== null ? promoCode.maxUses : "Unlimited"}
                  </td>
                  <td className="py-4 font-body text-sm text-bark">
                    {promoCode.timesUsed}
                    {promoCode.maxUses !== null && (
                      <span className="text-stone">
                        {" "}
                        / {promoCode.maxUses}
                      </span>
                    )}
                  </td>
                  <td className="py-4 font-body text-sm text-bark">
                    {promoCode.clubName || "All Clubs"}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 font-body text-xs font-medium ${
                        promoCode.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-cloud text-stone"
                      }`}
                    >
                      {promoCode.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(promoCode)}
                        className="rounded-lg bg-forest p-2 text-white transition-colors hover:bg-meadow"
                        aria-label="Edit promo code"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(promoCode.id)}
                        className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                        aria-label="Delete promo code"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {promoCodes.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-body text-stone">No promo codes found.</p>
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sunshine px-6 py-3 font-display font-semibold text-bark transition-colors hover:bg-amber"
            >
              <Plus className="h-5 w-5" />
              Create Your First Code
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-cloud pt-4">
            <p className="font-body text-sm text-stone">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, promoCodes.length)} of{" "}
              {promoCodes.length} codes
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone/30 text-stone transition-colors hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg font-body text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-forest text-white"
                        : "border border-stone/30 text-stone hover:bg-cloud"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone/30 text-stone transition-colors hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-bark">
                {editingCode ? "Edit Promo Code" : "Create New Promo Code"}
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-stone transition-colors hover:bg-cloud"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Code */}
              <div>
                <label
                  htmlFor="code"
                  className="mb-1 block font-body text-sm font-medium text-stone"
                >
                  Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., SUMMER25"
                  required
                  className="w-full rounded-lg border border-stone/30 bg-white px-4 py-2.5 font-mono text-bark uppercase placeholder:text-pebble placeholder:normal-case focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
                />
              </div>

              {/* Discount Percent */}
              <div>
                <label
                  htmlFor="discountPercent"
                  className="mb-1 block font-body text-sm font-medium text-stone"
                >
                  Discount Percentage
                </label>
                <input
                  type="number"
                  id="discountPercent"
                  value={formData.discountPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, discountPercent: e.target.value })
                  }
                  placeholder="e.g., 25"
                  min="1"
                  max="100"
                  required
                  className="w-full rounded-lg border border-stone/30 bg-white px-4 py-2.5 font-body text-bark placeholder:text-pebble focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
                />
              </div>

              {/* Valid From / Until */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="validFrom"
                    className="mb-1 block font-body text-sm font-medium text-stone"
                  >
                    Valid From
                  </label>
                  <input
                    type="date"
                    id="validFrom"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-stone/30 bg-white px-4 py-2.5 font-body text-bark focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
                  />
                </div>
                <div>
                  <label
                    htmlFor="validUntil"
                    className="mb-1 block font-body text-sm font-medium text-stone"
                  >
                    Valid Until
                  </label>
                  <input
                    type="date"
                    id="validUntil"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-stone/30 bg-white px-4 py-2.5 font-body text-bark focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
                  />
                </div>
              </div>

              {/* Max Uses */}
              <div>
                <label
                  htmlFor="maxUses"
                  className="mb-1 block font-body text-sm font-medium text-stone"
                >
                  Max Uses{" "}
                  <span className="font-normal text-pebble">
                    (leave empty for unlimited)
                  </span>
                </label>
                <input
                  type="number"
                  id="maxUses"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUses: e.target.value })
                  }
                  placeholder="Unlimited"
                  min="1"
                  className="w-full rounded-lg border border-stone/30 bg-white px-4 py-2.5 font-body text-bark placeholder:text-pebble focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
                />
              </div>

              {/* Club */}
              <div>
                <label
                  htmlFor="clubId"
                  className="mb-1 block font-body text-sm font-medium text-stone"
                >
                  Applies To
                </label>
                <select
                  id="clubId"
                  value={formData.clubId}
                  onChange={(e) =>
                    setFormData({ ...formData, clubId: e.target.value })
                  }
                  className="w-full rounded-lg border border-stone/30 bg-white px-4 py-2.5 font-body text-bark focus:border-forest focus:outline-none focus:ring-2 focus:ring-sage/30"
                >
                  <option value="">All Clubs</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Is Active Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isActive: !formData.isActive })
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    formData.isActive ? "bg-forest" : "bg-pebble"
                  }`}
                  role="switch"
                  aria-checked={formData.isActive}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      formData.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <label className="font-body text-sm font-medium text-bark">
                  {formData.isActive ? "Active" : "Inactive"}
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-stone/30 px-4 py-2.5 font-display font-semibold text-stone transition-colors hover:bg-cloud"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-sunshine px-6 py-2.5 font-display font-semibold text-bark transition-colors hover:bg-amber"
                >
                  {editingCode ? "Save Changes" : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[var(--shadow-lg)]">
            <h3 className="font-display text-xl font-bold text-bark">
              Delete Promo Code
            </h3>
            <p className="mt-2 font-body text-stone">
              Are you sure you want to delete this promo code? This action cannot
              be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-stone/30 px-4 py-2.5 font-display font-semibold text-stone transition-colors hover:bg-cloud"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-lg bg-red-500 px-6 py-2.5 font-display font-semibold text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
