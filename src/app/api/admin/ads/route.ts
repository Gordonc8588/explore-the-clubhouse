/**
 * Meta Ads API Routes
 * GET /api/admin/ads - List all ads with optional filters
 * POST /api/admin/ads - Create a new draft ad
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for creating an ad
const createAdSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  club_id: z.string().uuid().nullable().optional(),
  promo_code_id: z.string().uuid().nullable().optional(),
  objective: z.enum(['awareness', 'traffic', 'conversions']).default('conversions'),
  primary_text: z.string().max(2200).nullable().optional(),
  headline: z.string().max(255).nullable().optional(),
  description: z.string().max(255).nullable().optional(),
  cta_type: z.enum(['LEARN_MORE', 'BOOK_NOW', 'SHOP_NOW', 'SIGN_UP', 'CONTACT_US', 'GET_OFFER']).default('LEARN_MORE'),
  cta_url: z.string().url().nullable().optional(),
  image_urls: z.array(z.string().url()).default([]),
  targeting_preset: z.enum(['local_parents', 'school_holiday', 'retargeting', 'lookalike']).nullable().optional(),
  custom_targeting: z.record(z.string(), z.unknown()).nullable().optional(),
  budget_type: z.enum(['daily', 'lifetime']).default('daily'),
  budget_amount: z.number().int().positive().nullable().optional(),
  schedule_start: z.string().datetime().nullable().optional(),
  schedule_end: z.string().datetime().nullable().optional(),
});

/**
 * GET /api/admin/ads
 * List ads with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get('status');
    const clubId = searchParams.get('club_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('meta_ads')
      .select('*, clubs(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (clubId) {
      query = query.eq('club_id', clubId);
    }

    const { data: ads, error, count } = await query;

    if (error) {
      console.error('Error fetching ads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ads' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ads,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/ads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ads
 * Create a new draft ad
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = createAdSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = createAdminClient();

    // Create the ad with draft status
    const { data: ad, error } = await supabase
      .from('meta_ads')
      .insert({
        name: data.name,
        club_id: data.club_id || null,
        promo_code_id: data.promo_code_id || null,
        objective: data.objective,
        primary_text: data.primary_text || null,
        headline: data.headline || null,
        description: data.description || null,
        cta_type: data.cta_type,
        cta_url: data.cta_url || null,
        image_urls: data.image_urls,
        targeting_preset: data.targeting_preset || null,
        custom_targeting: data.custom_targeting || null,
        budget_type: data.budget_type,
        budget_amount: data.budget_amount || null,
        schedule_start: data.schedule_start || null,
        schedule_end: data.schedule_end || null,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating ad:', error);
      return NextResponse.json(
        { error: 'Failed to create ad' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ad }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/ads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
