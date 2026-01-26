import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getOverviewMetrics,
  getRevenueTimeseries,
  getSourceBreakdown,
  getRecentConversions,
  type DateRange,
} from '@/lib/analytics-queries';

export async function GET(request: NextRequest) {
  // Check admin auth
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get('range') || '30d') as DateRange;

  try {
    const [metrics, revenueTimeseries, sourceBreakdown, recentConversions] = await Promise.all([
      getOverviewMetrics({ range }),
      getRevenueTimeseries({ range }),
      getSourceBreakdown({ range }),
      getRecentConversions(10),
    ]);

    return NextResponse.json({
      metrics,
      revenueTimeseries,
      sourceBreakdown,
      recentConversions,
    });
  } catch (error) {
    console.error('[Analytics API] Overview error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
