import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Cron job to clean up old analytics events (90-day retention)
 *
 * Add to vercel.json to schedule:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-analytics",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 *
 * Or call the cleanup_old_analytics_events() function directly in Supabase
 */
export async function GET(request: NextRequest) {
  // Verify cron secret for security (set CRON_SECRET in environment)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Delete analytics events older than 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    // First count events to delete
    const { count } = await supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', cutoffDate.toISOString());

    // Then delete them
    const { error } = await supabase
      .from('analytics_events')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('[Analytics Cleanup] Error:', error);
      return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }

    console.log(`[Analytics Cleanup] Deleted ${count || 0} old events`);
    return NextResponse.json({
      success: true,
      deleted: count || 0,
      cutoffDate: cutoffDate.toISOString(),
    });
  } catch (error) {
    console.error('[Analytics Cleanup] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
