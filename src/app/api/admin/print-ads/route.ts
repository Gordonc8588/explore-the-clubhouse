/**
 * Print Ads API Routes
 * GET /api/admin/print-ads - List all print ads with optional filters
 * POST /api/admin/print-ads - Create a new draft print ad
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

// Validation schema for creating a print ad
const createPrintAdSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ad_type: z.enum(['newsletter_digital', 'magazine_quarter_page']).default('magazine_quarter_page'),
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
  status: z.enum(['draft', 'final']).default('draft'),
});

/**
 * GET /api/admin/print-ads
 * List print ads with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('print_ads')
      .select('*, clubs(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: printAds, error, count } = await query;

    if (error) {
      console.error('Error fetching print ads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch print ads' },
        { status: 500 }
      );
    }

    // Get counts by status
    const { data: statusCounts } = await supabase
      .from('print_ads')
      .select('status')
      .then(({ data }) => {
        const counts = { draft: 0, final: 0 };
        data?.forEach(ad => {
          if (ad.status === 'draft') counts.draft++;
          if (ad.status === 'final') counts.final++;
        });
        return { data: counts };
      });

    return NextResponse.json({
      printAds,
      counts: statusCounts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/print-ads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/print-ads
 * Create a new draft print ad
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = createPrintAdSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = createAdminClient();

    // Create the print ad
    const { data: printAd, error } = await supabase
      .from('print_ads')
      .insert({
        name: data.name,
        ad_type: data.ad_type,
        club_id: data.club_id || null,
        club_data: data.club_data || null,
        headline: data.headline || null,
        body_copy: data.body_copy || null,
        cta_text: data.cta_text || null,
        main_image_url: data.main_image_url || null,
        flyer_image_url: data.flyer_image_url || null,
        status: data.status,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating print ad:', error);
      return NextResponse.json(
        { error: 'Failed to create print ad' },
        { status: 500 }
      );
    }

    return NextResponse.json({ printAd }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/print-ads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
