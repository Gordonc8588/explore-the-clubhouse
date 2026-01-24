import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin-session")?.value === "authenticated";
}

// Validation schema for newsletter
const newsletterSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  preview_text: z.string().optional().nullable(),
  body_html: z.string().min(1, "Body content is required"),
  image_urls: z.array(z.string().url()).optional().default([]),
  featured_club_id: z.string().uuid().optional().nullable(),
  promo_code_id: z.string().uuid().optional().nullable(),
  cta_text: z.string().optional().nullable(),
  cta_url: z.string().url().optional().nullable(),
});

const updateSchema = newsletterSchema.partial().extend({
  id: z.string().uuid(),
});

// GET - List all newsletters with pagination
export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const offset = (page - 1) * limit;

    const supabase = createAdminClient();

    let query = supabase
      .from("newsletters")
      .select("*, clubs(name), promo_codes(code)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      newsletters: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletters" },
      { status: 500 }
    );
  }
}

// POST - Create new draft newsletter
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("newsletters")
      .insert({
        subject: parsed.data.subject,
        preview_text: parsed.data.preview_text || null,
        body_html: parsed.data.body_html,
        image_urls: parsed.data.image_urls,
        featured_club_id: parsed.data.featured_club_id || null,
        promo_code_id: parsed.data.promo_code_id || null,
        cta_text: parsed.data.cta_text || null,
        cta_url: parsed.data.cta_url || null,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating newsletter:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create newsletter" },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating newsletter:", error);
    return NextResponse.json(
      { error: "Failed to create newsletter" },
      { status: 500 }
    );
  }
}

// PATCH - Update existing draft newsletter
export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsed.data;

    const supabase = createAdminClient();

    // First check if newsletter is still a draft
    const { data: existing, error: fetchError } = await supabase
      .from("newsletters")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Newsletter not found" },
        { status: 404 }
      );
    }

    if (existing.status === "sent") {
      return NextResponse.json(
        { error: "Cannot edit a newsletter that has already been sent" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("newsletters")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating newsletter:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update newsletter" },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating newsletter:", error);
    return NextResponse.json(
      { error: "Failed to update newsletter" },
      { status: 500 }
    );
  }
}

// DELETE - Delete draft newsletter
export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Newsletter ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if newsletter is a draft
    const { data: existing, error: fetchError } = await supabase
      .from("newsletters")
      .select("status")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Newsletter not found" },
        { status: 404 }
      );
    }

    if (existing.status === "sent") {
      return NextResponse.json(
        { error: "Cannot delete a newsletter that has already been sent" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("newsletters").delete().eq("id", id);

    if (error) {
      console.error("Error deleting newsletter:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete newsletter" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting newsletter:", error);
    return NextResponse.json(
      { error: "Failed to delete newsletter" },
      { status: 500 }
    );
  }
}
