import { createClient } from "@/lib/supabase/server";
import { Tag } from "lucide-react";
import { PromoCodesManager } from "./PromoCodesManager";

async function getPromoCodesData() {
  const supabase = await createClient();

  // Get all promo codes with club info
  const { data: promoCodes } = await supabase
    .from("promo_codes")
    .select(`
      id,
      code,
      discount_percent,
      valid_from,
      valid_until,
      max_uses,
      times_used,
      club_id,
      is_active,
      clubs(id, name)
    `)
    .order("created_at", { ascending: false });

  // Get all clubs for the dropdown
  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return {
    promoCodes: promoCodes || [],
    clubs: clubs || [],
  };
}

export default async function PromoCodesPage() {
  const { promoCodes, clubs } = await getPromoCodesData();

  // Transform promo codes for the component
  const transformedPromoCodes = promoCodes.map((pc: any) => ({
    id: pc.id,
    code: pc.code,
    discountPercent: pc.discount_percent,
    validFrom: pc.valid_from,
    validUntil: pc.valid_until,
    maxUses: pc.max_uses,
    timesUsed: pc.times_used,
    clubId: pc.club_id,
    clubName: pc.clubs?.name || null,
    isActive: pc.is_active,
  }));

  // Calculate stats
  const totalCodes = transformedPromoCodes.length;
  const activeCodes = transformedPromoCodes.filter((pc) => pc.isActive).length;
  const totalRedemptions = transformedPromoCodes.reduce((sum, pc) => sum + pc.timesUsed, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--craigies-dark-olive)",
            }}
          >
            Promo Codes
          </h2>
          <p className="mt-1" style={{ color: "var(--craigies-dark-olive)" }}>
            Manage discount codes for bookings
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
            >
              <Tag className="h-6 w-6" style={{ color: "var(--craigies-olive)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Total Codes
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {totalCodes}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <Tag className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Active Codes
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {activeCodes}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full p-3"
              style={{ backgroundColor: "rgba(212, 132, 62, 0.1)" }}
            >
              <Tag className="h-6 w-6" style={{ color: "var(--craigies-burnt-orange)" }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: "var(--craigies-dark-olive)" }}>
                Total Redemptions
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "var(--craigies-dark-olive)",
                }}
              >
                {totalRedemptions}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Codes Manager (Client Component) */}
      <PromoCodesManager promoCodes={transformedPromoCodes} clubs={clubs} />
    </div>
  );
}
