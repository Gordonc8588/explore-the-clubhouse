/**
 * Survey Export API Route
 * GET /api/admin/survey/export - Export all survey responses as CSV
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get('admin-session')?.value === 'authenticated';
}

// Escape CSV field
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    return `"${value.join('; ').replace(/"/g, '""')}"`;
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * GET /api/admin/survey/export
 * Export all survey responses as CSV
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Optional filters
    const isComplete = searchParams.get('is_complete');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    // Build query
    let query = supabase
      .from('survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (isComplete !== null && isComplete !== 'all') {
      query = query.eq('is_complete', isComplete === 'true');
    }

    if (fromDate) {
      query = query.gte('submitted_at', fromDate);
    }

    if (toDate) {
      query = query.lte('submitted_at', toDate);
    }

    const { data: responses, error } = await query;

    if (error) {
      console.error('Error fetching survey responses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch survey responses' },
        { status: 500 }
      );
    }

    // Define CSV headers
    const headers = [
      'ID',
      'Submitted At',
      'Is Complete',
      'Number of Children',
      'Children Ages',
      'Has Children 2-4',
      'Open Play Interest (2-4s)',
      'Interest Level',
      'Holiday Periods',
      'Preferred Days',
      'Specific Days',
      'Preferred Times',
      'Days Per Week',
      'Activities',
      'Activities Notes',
      'Age Group Preference',
      'Structure Preference',
      'Important Factors',
      'Additional Services',
      'Postcode',
      'Other Feedback',
      'Next Holiday Interest',
      'Contact Consent',
      'Email',
      'GDPR Consent',
    ];

    // Build CSV rows
    const rows = responses.map(r => [
      escapeCSV(r.id),
      escapeCSV(r.submitted_at),
      escapeCSV(r.is_complete),
      escapeCSV(r.num_children),
      escapeCSV(r.children_ages),
      escapeCSV(r.has_younger_children),
      escapeCSV(r.younger_children_open_play),
      escapeCSV(r.interest_level),
      escapeCSV(r.holiday_periods),
      escapeCSV(r.preferred_days),
      escapeCSV(r.specific_days),
      escapeCSV(r.preferred_times),
      escapeCSV(r.days_per_week),
      escapeCSV(r.activities),
      escapeCSV(r.activities_notes),
      escapeCSV(r.age_group_preference),
      escapeCSV(r.structure_preference),
      escapeCSV(r.important_factors),
      escapeCSV(r.additional_services),
      escapeCSV(r.postcode),
      escapeCSV(r.other_feedback),
      escapeCSV(r.next_holiday_interest),
      escapeCSV(r.contact_consent),
      escapeCSV(r.email),
      escapeCSV(r.gdpr_consent),
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `survey-responses-${date}.csv`;

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/survey/export:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
