import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getFunnelMetrics, type DateRange } from '@/lib/analytics-queries';

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
    const funnel = await getFunnelMetrics({ range });
    return NextResponse.json({ funnel });
  } catch (error) {
    console.error('[Analytics API] Funnel error:', error);
    return NextResponse.json({ error: 'Failed to fetch funnel data' }, { status: 500 });
  }
}
