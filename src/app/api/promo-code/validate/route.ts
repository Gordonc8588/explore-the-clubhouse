import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { code, clubId } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Promo code is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const normalizedCode = code.trim().toUpperCase();

    // Fetch promo code from database
    const { data: promo, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", normalizedCode)
      .single();

    if (error || !promo) {
      return NextResponse.json(
        { error: "Invalid promo code" },
        { status: 400 }
      );
    }

    // Validate promo code
    if (!promo.is_active) {
      return NextResponse.json(
        { error: "This promo code is no longer active" },
        { status: 400 }
      );
    }

    const now = new Date();
    const validFrom = new Date(promo.valid_from);
    const validUntil = new Date(promo.valid_until);

    if (now < validFrom || now > validUntil) {
      return NextResponse.json(
        { error: "This promo code has expired" },
        { status: 400 }
      );
    }

    if (promo.max_uses !== null && promo.times_used >= promo.max_uses) {
      return NextResponse.json(
        { error: "This promo code has reached its usage limit" },
        { status: 400 }
      );
    }

    if (promo.club_id !== null && promo.club_id !== clubId) {
      return NextResponse.json(
        { error: "This promo code is not valid for this club" },
        { status: 400 }
      );
    }

    // Return valid promo code
    return NextResponse.json({
      id: promo.id,
      code: promo.code,
      discount_percent: promo.discount_percent,
      valid_from: promo.valid_from,
      valid_until: promo.valid_until,
      max_uses: promo.max_uses,
      times_used: promo.times_used,
      club_id: promo.club_id,
      is_active: promo.is_active,
      created_at: promo.created_at,
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { error: "Failed to validate promo code" },
      { status: 500 }
    );
  }
}
