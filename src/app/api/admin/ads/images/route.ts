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
  // Optional: import from newsletter library
  importFromNewsletter: z.boolean().optional(),
  newsletterImageId: z.string().uuid().optional(),
});

// Schema for updating an image
const updateImageSchema = z.object({
  id: z.string().uuid(),
  label: z.string().optional(),
  description: z.string().optional(),
});

/**
 * GET /api/admin/ads/images
 * List images from ad library and/or newsletter library
 * Query params:
 *   - source: "ads" | "newsletter" | "all" (default: "all")
 *   - search: filter by label/description
 *   - limit/offset: pagination
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const source = searchParams.get("source") || "all";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    interface ImageResult {
      id: string;
      url: string;
      public_id: string | null;
      label: string | null;
      description: string | null;
      tags?: string[];
      width: number | null;
      height: number | null;
      created_at: string;
      source: "ads" | "newsletter";
    }

    const allImages: ImageResult[] = [];

    // Fetch from meta_ad_images if source is "ads" or "all"
    if (source === "ads" || source === "all") {
      let adsQuery = supabase
        .from("meta_ad_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (search) {
        adsQuery = adsQuery.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data: adsImages, error: adsError } = await adsQuery;

      if (adsError) {
        console.error("Error fetching ad images:", adsError);
      } else if (adsImages) {
        allImages.push(
          ...adsImages.map((img) => ({
            ...img,
            source: "ads" as const,
          }))
        );
      }
    }

    // Fetch from newsletter_images if source is "newsletter" or "all"
    if (source === "newsletter" || source === "all") {
      let newsletterQuery = supabase
        .from("newsletter_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (search) {
        newsletterQuery = newsletterQuery.or(`label.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data: newsletterImages, error: newsletterError } = await newsletterQuery;

      if (newsletterError) {
        console.error("Error fetching newsletter images:", newsletterError);
      } else if (newsletterImages) {
        // Filter out duplicates (same URL already in ads library)
        const existingUrls = new Set(allImages.map((img) => img.url));
        const uniqueNewsletterImages = newsletterImages.filter(
          (img) => !existingUrls.has(img.url)
        );

        allImages.push(
          ...uniqueNewsletterImages.map((img) => ({
            ...img,
            source: "newsletter" as const,
          }))
        );
      }
    }

    // Sort by created_at descending
    allImages.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Apply pagination
    const paginatedImages = allImages.slice(offset, offset + limit);

    return NextResponse.json({
      images: paginatedImages,
      total: allImages.length,
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
 * Add a new image to the library, optionally importing from newsletter library
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

    // If importing from newsletter, fetch the newsletter image first
    if (result.data.importFromNewsletter && result.data.newsletterImageId) {
      const { data: newsletterImage, error: fetchError } = await supabase
        .from("newsletter_images")
        .select("*")
        .eq("id", result.data.newsletterImageId)
        .single();

      if (fetchError || !newsletterImage) {
        return NextResponse.json(
          { error: "Newsletter image not found" },
          { status: 404 }
        );
      }

      // Check if already imported
      const { data: existingAd } = await supabase
        .from("meta_ad_images")
        .select("id")
        .eq("url", newsletterImage.url)
        .single();

      if (existingAd) {
        const { data: existingImage } = await supabase
          .from("meta_ad_images")
          .select("*")
          .eq("id", existingAd.id)
          .single();

        return NextResponse.json({
          image: { ...existingImage, source: "ads" },
          message: "Image already imported to ads library",
        });
      }

      // Import the newsletter image to ads library
      const { data: importedImage, error: importError } = await supabase
        .from("meta_ad_images")
        .insert({
          url: newsletterImage.url,
          public_id: newsletterImage.public_id,
          label: newsletterImage.label,
          description: newsletterImage.description,
          width: newsletterImage.width,
          height: newsletterImage.height,
        })
        .select()
        .single();

      if (importError) {
        console.error("Error importing newsletter image:", importError);
        return NextResponse.json(
          { error: "Failed to import image" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        image: { ...importedImage, source: "ads" },
        message: "Image imported from newsletter library",
      }, { status: 201 });
    }

    // Standard flow: check if image already exists
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
        image: { ...existingImage, source: "ads" },
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

    return NextResponse.json({ image: { ...data, source: "ads" } }, { status: 201 });
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
