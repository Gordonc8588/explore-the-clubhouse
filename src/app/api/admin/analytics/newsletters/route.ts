import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getNewsletterMetrics, type DateRange } from '@/lib/analytics-queries';

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
    const newsletters = await getNewsletterMetrics({ range });
    return NextResponse.json({ newsletters });
  } catch (error) {
    console.error('[Analytics API] Newsletters error:', error);
    return NextResponse.json({ error: 'Failed to fetch newsletter data' }, { status: 500 });
  }
}
