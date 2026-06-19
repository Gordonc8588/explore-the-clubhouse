import { verifyAdminSessionToken } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { computeReschedulePricing, getRefundState } from "@/lib/booking-modify";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get("admin-session")?.value);
}

/**
 * POST /api/admin/bookings/[id]/reprice
 * Dry-run preview for a reschedule (no mutation). The confirm button renders the
 * server-computed number returned here — the client never invents the figure.
 * Body: { newClubId, clubDayIds: string[] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const { newClubId, clubDayIds } = await request.json();

    if (!newClubId || !Array.isArray(clubDayIds) || clubDayIds.length === 0) {
      return NextResponse.json(
        { error: "newClubId and clubDayIds are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const pricing = await computeReschedulePricing(supabase, bookingId, newClubId, clubDayIds.length);
    if (pricing.error || !pricing.booking) {
      return NextResponse.json({ error: pricing.error || "Could not price this change" }, { status: 400 });
    }

    const delta = pricing.deltaPence ?? 0;
    const direction = delta > 0 ? "charge" : delta < 0 ? "refund" : "none";

    let refundablePence: number | null = null;
    if (delta < 0) {
      const rs = await getRefundState(pricing.booking.stripe_payment_intent_id);
      refundablePence = rs.ok ? rs.refundablePence ?? 0 : null;
    }

    return NextResponse.json({
      oldTotalPence: pricing.oldTotalPence,
      newTotalPence: pricing.newTotalPence,
      deltaPence: delta,
      direction,
      refundablePence,
      optionName: pricing.targetOption?.name ?? null,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/bookings/[id]/reprice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
