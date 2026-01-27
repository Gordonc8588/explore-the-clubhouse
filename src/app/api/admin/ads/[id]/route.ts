/**
 * Single Meta Ad API Routes
 * GET /api/admin/ads/[id] - Get ad details
 * PATCH /api/admin/ads/[id] - Update ad
 * DELETE /api/admin/ads/[id] - Delete draft ad
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for updating an ad
const updateAdSchema = z.object({
  name: z.string().min(1).optional(),
  club_id: z.string().uuid().nullable().optional(),
  promo_code_id: z.string().uuid().nullable().optional(),
  objective: z.enum(['awareness', 'traffic', 'conversions']).optional(),
  primary_text: z.string().max(2200).nullable().optional(),
  headline: z.string().max(255).nullable().optional(),
  description: z.string().max(255).nullable().optional(),
  cta_type: z.enum(['LEARN_MORE', 'BOOK_NOW', 'SHOP_NOW', 'SIGN_UP', 'CONTACT_US', 'GET_OFFER']).optional(),
  cta_url: z.string().url().nullable().optional(),
  image_urls: z.array(z.string().url()).optional(),
  targeting_preset: z.enum(['local_parents', 'school_holiday', 'retargeting', 'lookalike']).nullable().optional(),
  custom_targeting: z.record(z.string(), z.unknown()).nullable().optional(),
  budget_type: z.enum(['daily', 'lifetime']).optional(),
  budget_amount: z.number().int().positive().nullable().optional(),
  schedule_start: z.string().datetime().nullable().optional(),
  schedule_end: z.string().datetime().nullable().optional(),
  status: z.enum(['draft', 'pending', 'active', 'paused', 'rejected', 'completed']).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/ads/[id]
 * Get ad details with related data
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch ad with related club and promo code
    const { data: ad, error } = await supabase
      .from('meta_ads')
      .select(`
        *,
        clubs(id, name, slug),
        promo_codes(id, code, discount_percent)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ad not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching ad:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ad' },
        { status: 500 }
      );
    }

    // Fetch latest metrics if ad has been published
    let metrics = null;
    if (ad.meta_ad_id) {
      const { data: metricsData } = await supabase
        .from('meta_ad_metrics')
        .select('*')
        .eq('ad_id', id)
        .order('date', { ascending: false })
        .limit(30);

      metrics = metricsData;
    }

    return NextResponse.json({ ad, metrics });
  } catch (error) {
    console.error('Error in GET /api/admin/ads/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/ads/[id]
 * Update an ad (only drafts and rejected can be fully edited)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = updateAdSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = createAdminClient();

    // Check current ad status
    const { data: existingAd, error: fetchError } = await supabase
      .from('meta_ads')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ad not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Only allow full edits on draft or rejected ads
    const editableStatuses = ['draft', 'rejected'];
    if (!editableStatuses.includes(existingAd.status)) {
      // For non-editable ads, only allow status changes (pause/resume)
      if (data.status && ['active', 'paused'].includes(data.status)) {
        const { data: updatedAd, error: updateError } = await supabase
          .from('meta_ads')
          .update({ status: data.status })
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;
        return NextResponse.json({ ad: updatedAd });
      }

      return NextResponse.json(
        { error: 'Cannot edit ad in current status. Only draft or rejected ads can be edited.' },
        { status: 400 }
      );
    }

    // Update the ad
    const { data: ad, error } = await supabase
      .from('meta_ads')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ad:', error);
      return NextResponse.json(
        { error: 'Failed to update ad' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ad });
  } catch (error) {
    console.error('Error in PATCH /api/admin/ads/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ads/[id]
 * Delete a draft ad (cannot delete published ads)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Check current ad status
    const { data: existingAd, error: fetchError } = await supabase
      .from('meta_ads')
      .select('status, meta_ad_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ad not found' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Only allow deleting drafts (ads that haven't been published to Meta)
    if (existingAd.meta_ad_id) {
      return NextResponse.json(
        { error: 'Cannot delete an ad that has been published to Meta. Pause it instead.' },
        { status: 400 }
      );
    }

    // Delete the ad
    const { error } = await supabase
      .from('meta_ads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting ad:', error);
      return NextResponse.json(
        { error: 'Failed to delete ad' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/ads/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
