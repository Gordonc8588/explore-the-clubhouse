import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

// Schema for adding a new image
const addImageSchema = z.object({
  url: z.string().url(),
  public_id: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

// Schema for updating an image
const updateImageSchema = z.object({
  id: z.string().uuid(),
  label: z.string().optional(),
  description: z.string().optional(),
});

/**
 * GET /api/admin/ads/images
 * List all images in the ad image library
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("meta_ad_images")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by search term (label or description)
    if (search) {
      query = query.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching ad images:", error);
      return NextResponse.json(
        { error: "Failed to fetch images" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      images: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/ads/images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ads/images
 * Add a new image to the library
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = addImageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.issues },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if image already exists
    const { data: existing } = await supabase
      .from("meta_ad_images")
      .select("id")
      .eq("url", result.data.url)
      .single();

    if (existing) {
      // Return existing image instead of creating duplicate
      const { data: existingImage } = await supabase
        .from("meta_ad_images")
        .select("*")
        .eq("id", existing.id)
        .single();

      return NextResponse.json({
        image: existingImage,
        message: "Image already exists in library",
      });
    }

    // Insert new image
    const { data, error } = await supabase
      .from("meta_ad_images")
      .insert({
        url: result.data.url,
        public_id: result.data.public_id || null,
        label: result.data.label || null,
        description: result.data.description || null,
        width: result.data.width || null,
        height: result.data.height || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving ad image:", error);
      return NextResponse.json(
        { error: "Failed to save image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ image: data }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/ads/images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/ads/images
 * Update an existing image in the library
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = updateImageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: result.error.issues },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (result.data.label !== undefined) updateData.label = result.data.label;
    if (result.data.description !== undefined) updateData.description = result.data.description;

    const { data, error } = await supabase
      .from("meta_ad_images")
      .update(updateData)
      .eq("id", result.data.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating ad image:", error);
      return NextResponse.json(
        { error: "Failed to update image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ image: data });
  } catch (error) {
    console.error("Error in PATCH /api/admin/ads/images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ads/images
 * Remove an image from the library
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("meta_ad_images")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting ad image:", error);
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/ads/images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
