/**
 * Survey Analytics API Route
 * GET /api/admin/survey/analytics - Get aggregated survey statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Check if user is admin
async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get('admin-session')?.value === 'authenticated';
}

// Helper to count occurrences in array fields
function countArrayValues(responses: Record<string, unknown>[], field: string): Record<string, number> {
  const counts: Record<string, number> = {};
  responses.forEach(r => {
    const values = r[field] as string[] | null;
    if (values && Array.isArray(values)) {
      values.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });
    }
  });
  return counts;
}

// Helper to count occurrences in single value fields
function countSingleValues(responses: Record<string, unknown>[], field: string): Record<string, number> {
  const counts: Record<string, number> = {};
  responses.forEach(r => {
    const value = r[field] as string | null;
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });
  return counts;
}

/**
 * GET /api/admin/survey/analytics
 * Get aggregated survey statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Optional date filters
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    // Fetch all responses
    let query = supabase
      .from('survey_responses')
      .select('*')
      .eq('is_complete', true);

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
        { error: 'Failed to fetch survey data' },
        { status: 500 }
      );
    }

    const typedResponses = responses as Record<string, unknown>[];
    const totalResponses = typedResponses.length;

    // Get session data for completion rate
    const { count: totalSessions } = await supabase
      .from('survey_sessions')
      .select('*', { count: 'exact', head: true });

    // Calculate response rate over time (last 7 days)
    const now = new Date();
    const dailyResponses: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = typedResponses.filter(r => {
        const submitted = (r.submitted_at as string)?.split('T')[0];
        return submitted === dateStr;
      }).length;
      dailyResponses.push({ date: dateStr, count });
    }

    // Build analytics for each question
    const analytics = {
      overview: {
        totalResponses,
        totalSessions: totalSessions || 0,
        completionRate: totalSessions ? Math.round((totalResponses / totalSessions) * 100) : 0,
        responsesThisWeek: dailyResponses.reduce((sum, d) => sum + d.count, 0),
        dailyResponses,
      },

      // Q1: Number of children
      numChildren: countSingleValues(typedResponses, 'num_children'),

      // Q2: Children ages
      childrenAges: countArrayValues(typedResponses, 'children_ages'),

      // Has younger children (2-4)
      hasYoungerChildren: countSingleValues(typedResponses, 'has_younger_children'),

      // Younger children open play interest
      youngerChildrenOpenPlay: countSingleValues(typedResponses, 'younger_children_open_play'),

      // Q3: Interest level
      interestLevel: countSingleValues(typedResponses, 'interest_level'),

      // Q4: Holiday periods
      holidayPeriods: countArrayValues(typedResponses, 'holiday_periods'),

      // Q5: Preferred days
      preferredDays: countSingleValues(typedResponses, 'preferred_days'),

      // Q5b: Specific days
      specificDays: countArrayValues(typedResponses, 'specific_days'),

      // Q6: Preferred times
      preferredTimes: countArrayValues(typedResponses, 'preferred_times'),

      // Q7: Days per week
      daysPerWeek: countSingleValues(typedResponses, 'days_per_week'),

      // Q8: Activities
      activities: countArrayValues(typedResponses, 'activities'),

      // Q10: Age group preference
      ageGroupPreference: countSingleValues(typedResponses, 'age_group_preference'),

      // Q11: Structure preference
      structurePreference: countSingleValues(typedResponses, 'structure_preference'),

      // Q12: Important factors
      importantFactors: countArrayValues(typedResponses, 'important_factors'),

      // Q13: Additional services
      additionalServices: countArrayValues(typedResponses, 'additional_services'),

      // Q15: Next holiday interest
      nextHolidayInterest: countSingleValues(typedResponses, 'next_holiday_interest'),

      // Contact consent
      contactConsent: {
        yes: typedResponses.filter(r => r.contact_consent === true).length,
        no: typedResponses.filter(r => r.contact_consent !== true).length,
      },

      // Postcode distribution (first part only for privacy)
      postcodeAreas: (() => {
        const areas: Record<string, number> = {};
        typedResponses.forEach(r => {
          const postcode = r.postcode as string | null;
          if (postcode) {
            // Get outward code (first part of postcode)
            const outward = postcode.split(' ')[0] || postcode.slice(0, -3).trim();
            areas[outward] = (areas[outward] || 0) + 1;
          }
        });
        return areas;
      })(),
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error in GET /api/admin/survey/analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
