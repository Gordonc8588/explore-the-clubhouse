/**
 * Print Ad Detail API Routes
 * GET /api/admin/print-ads/[id] - Get single print ad
 * PATCH /api/admin/print-ads/[id] - Update print ad
 * DELETE /api/admin/print-ads/[id] - Delete print ad
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get('admin-session')?.value === 'authenticated';
}

// Validation schema for updating a print ad
const updatePrintAdSchema = z.object({
  name: z.string().min(1).optional(),
  ad_type: z.enum(['newsletter_digital', 'magazine_quarter_page']).optional(),
  club_id: z.string().uuid().nullable().optional(),
  club_data: z.object({
    name: z.string(),
    dates: z.string(),
    age_range: z.string(),
    location: z.string(),
    prices: z.array(z.object({
      option: z.string(),
      price: z.number(),
    })),
  }).nullable().optional(),
  headline: z.string().max(100).nullable().optional(),
  body_copy: z.string().nullable().optional(),
  cta_text: z.string().max(50).nullable().optional(),
  main_image_url: z.string().url().nullable().optional(),
  flyer_image_url: z.string().url().nullable().optional(),
  status: z.enum(['draft', 'final']).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/print-ads/[id]
 * Get a single print ad with club details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check admin auth
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    const { data: printAd, error } = await supabase
      .from('print_ads')
      .select('*, clubs(id, name, slug, start_date, end_date, min_age, max_age)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Print ad not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching print ad:', error);
      return NextResponse.json(
        { error: 'Failed to fetch print ad' },
        { status: 500 }
      );
    }

    return NextResponse.json({ printAd });
  } catch (error) {
    console.error('Error in GET /api/admin/print-ads/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/print-ads/[id]
 * Update a print ad
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check admin auth
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = updatePrintAdSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = createAdminClient();

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.ad_type !== undefined) updateData.ad_type = data.ad_type;
    if (data.club_id !== undefined) updateData.club_id = data.club_id;
    if (data.club_data !== undefined) updateData.club_data = data.club_data;
    if (data.headline !== undefined) updateData.headline = data.headline;
    if (data.body_copy !== undefined) updateData.body_copy = data.body_copy;
    if (data.cta_text !== undefined) updateData.cta_text = data.cta_text;
    if (data.main_image_url !== undefined) updateData.main_image_url = data.main_image_url;
    if (data.flyer_image_url !== undefined) updateData.flyer_image_url = data.flyer_image_url;
    if (data.status !== undefined) updateData.status = data.status;

    const { data: printAd, error } = await supabase
      .from('print_ads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Print ad not found' },
          { status: 404 }
        );
      }
      console.error('Error updating print ad:', error);
      return NextResponse.json(
        { error: 'Failed to update print ad' },
        { status: 500 }
      );
    }

    return NextResponse.json({ printAd });
  } catch (error) {
    console.error('Error in PATCH /api/admin/print-ads/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/print-ads/[id]
 * Delete a print ad
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check admin auth
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('print_ads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting print ad:', error);
      return NextResponse.json(
        { error: 'Failed to delete print ad' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/print-ads/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
