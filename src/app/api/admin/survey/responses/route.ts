/**
 * Survey Responses API Route
 * GET /api/admin/survey/responses - List all survey responses with pagination and filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get('admin-session')?.value === 'authenticated';
}

/**
 * GET /api/admin/survey/responses
 * List survey responses with pagination and filters
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const isComplete = searchParams.get('is_complete');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    const interestLevel = searchParams.get('interest_level');

    // Build query
    let query = supabase
      .from('survey_responses')
      .select('*', { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (isComplete !== null && isComplete !== 'all') {
      query = query.eq('is_complete', isComplete === 'true');
    }

    if (fromDate) {
      query = query.gte('submitted_at', fromDate);
    }

    if (toDate) {
      query = query.lte('submitted_at', toDate);
    }

    if (interestLevel && interestLevel !== 'all') {
      query = query.eq('interest_level', interestLevel);
    }

    const { data: responses, error, count } = await query;

    if (error) {
      console.error('Error fetching survey responses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch survey responses' },
        { status: 500 }
      );
    }

    // Get summary counts
    const { data: allResponses } = await supabase
      .from('survey_responses')
      .select('is_complete, interest_level');

    const summary = {
      total: allResponses?.length || 0,
      complete: allResponses?.filter(r => r.is_complete).length || 0,
      partial: allResponses?.filter(r => !r.is_complete).length || 0,
      interested: allResponses?.filter(r => r.interest_level === 'Yes, definitely').length || 0,
      possibly: allResponses?.filter(r => r.interest_level === 'Possibly').length || 0,
      notInterested: allResponses?.filter(r => r.interest_level === 'No').length || 0,
    };

    return NextResponse.json({
      responses,
      summary,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/survey/responses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
