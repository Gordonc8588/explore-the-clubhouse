import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCampaignPerformance, type DateRange } from '@/lib/analytics-queries';

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
    const campaigns = await getCampaignPerformance({ range });
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('[Analytics API] Campaigns error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaign data' }, { status: 500 });
  }
}
