import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

// GET - List all promo codes
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch promo codes" },
      { status: 500 }
    );
  }
}

// POST - Create new promo code
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      code,
      discount_percent,
      valid_from,
      valid_until,
      max_uses,
      club_id,
      is_active,
    } = body;

    // Validation
    if (!code || !discount_percent || !valid_from || !valid_until) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("promo_codes")
      .insert({
        code: code.toUpperCase(),
        discount_percent,
        valid_from,
        valid_until,
        max_uses: max_uses || null,
        club_id: club_id || null,
        is_active: is_active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating promo code:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create promo code" },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating promo code:", error);
    return NextResponse.json(
      { error: "Failed to create promo code" },
      { status: 500 }
    );
  }
}

// PATCH - Update promo code
export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      code,
      discount_percent,
      valid_from,
      valid_until,
      max_uses,
      club_id,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Promo code ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("promo_codes")
      .update({
        code: code.toUpperCase(),
        discount_percent,
        valid_from,
        valid_until,
        max_uses: max_uses || null,
        club_id: club_id || null,
        is_active,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating promo code:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update promo code" },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating promo code:", error);
    return NextResponse.json(
      { error: "Failed to update promo code" },
      { status: 500 }
    );
  }
}

// DELETE - Delete promo code
export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Promo code ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);

    if (error) {
      console.error("Error deleting promo code:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete promo code" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promo code:", error);
    return NextResponse.json(
      { error: "Failed to delete promo code" },
      { status: 500 }
    );
  }
}
