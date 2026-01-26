/**
 * Analytics data queries for admin dashboard
 * All queries filter by date range and return aggregated metrics
 */

import { createAdminClient } from '@/lib/supabase/admin';

export type DateRange = '7d' | '30d' | '90d' | 'custom';

interface DateRangeParams {
  range: DateRange;
  startDate?: string;
  endDate?: string;
}

function getDateRange(params: DateRangeParams): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  let start: Date;

  switch (params.range) {
    case '7d':
      start = new Date();
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start = new Date();
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start = new Date();
      start.setDate(start.getDate() - 90);
      break;
    case 'custom':
      start = params.startDate ? new Date(params.startDate) : new Date();
      if (params.endDate) {
        return { start, end: new Date(params.endDate) };
      }
      break;
    default:
      start = new Date();
      start.setDate(start.getDate() - 30);
  }

  start.setHours(0, 0, 0, 0);
  return { start, end };
}

// =============================================================================
// OVERVIEW METRICS
// =============================================================================

export interface OverviewMetrics {
  totalRevenue: number;
  totalBookings: number;
  conversionRate: number;
  averageOrderValue: number;
  revenueChange: number; // percentage change vs previous period
  bookingsChange: number;
}

export async function getOverviewMetrics(params: DateRangeParams): Promise<OverviewMetrics> {
  const supabase = createAdminClient();
  const { start, end } = getDateRange(params);

  // Current period bookings
  const { data: currentBookings } = await supabase
    .from('bookings')
    .select('id, total_amount, status, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .in('status', ['paid', 'complete']);

  // Previous period (same duration)
  const duration = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - duration);
  const prevEnd = new Date(start.getTime());

  const { data: prevBookings } = await supabase
    .from('bookings')
    .select('id, total_amount')
    .gte('created_at', prevStart.toISOString())
    .lt('created_at', prevEnd.toISOString())
    .in('status', ['paid', 'complete']);

  // Get funnel data for conversion rate
  const { data: funnelStarts } = await supabase
    .from('analytics_events')
    .select('id')
    .eq('event_name', 'funnel_start_booking')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  const current = currentBookings || [];
  const prev = prevBookings || [];

  const totalRevenue = current.reduce((sum, b) => sum + b.total_amount, 0);
  const prevRevenue = prev.reduce((sum, b) => sum + b.total_amount, 0);
  const totalBookings = current.length;
  const prevBookingsCount = prev.length;

  const funnelStartCount = funnelStarts?.length || 0;
  const conversionRate = funnelStartCount > 0 ? (totalBookings / funnelStartCount) * 100 : 0;
  const averageOrderValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const revenueChange = prevRevenue > 0
    ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
    : totalRevenue > 0 ? 100 : 0;

  const bookingsChange = prevBookingsCount > 0
    ? ((totalBookings - prevBookingsCount) / prevBookingsCount) * 100
    : totalBookings > 0 ? 100 : 0;

  return {
    totalRevenue,
    totalBookings,
    conversionRate,
    averageOrderValue,
    revenueChange,
    bookingsChange,
  };
}

// =============================================================================
// FUNNEL METRICS
// =============================================================================

export interface FunnelStep {
  step: string;
  label: string;
  count: number;
  dropOff: number; // percentage drop from previous step
}

export async function getFunnelMetrics(params: DateRangeParams): Promise<FunnelStep[]> {
  const supabase = createAdminClient();
  const { start, end } = getDateRange(params);

  const steps = [
    { name: 'funnel_view_club', label: 'View Club' },
    { name: 'funnel_start_booking', label: 'Start Booking' },
    { name: 'funnel_select_option', label: 'Select Option' },
    { name: 'funnel_enter_children', label: 'Enter Children' },
    { name: 'funnel_enter_details', label: 'Enter Details' },
    { name: 'funnel_initiate_payment', label: 'Initiate Payment' },
    { name: 'purchase', label: 'Purchase Complete' },
  ];

  const results: FunnelStep[] = [];
  let prevCount = 0;

  for (const step of steps) {
    const { count } = await supabase
      .from('analytics_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_name', step.name)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    const stepCount = count || 0;
    const dropOff = prevCount > 0 ? ((prevCount - stepCount) / prevCount) * 100 : 0;

    results.push({
      step: step.name,
      label: step.label,
      count: stepCount,
      dropOff,
    });

    prevCount = stepCount;
  }

  return results;
}

// =============================================================================
// CAMPAIGN PERFORMANCE
// =============================================================================

export interface CampaignMetric {
  source: string;
  medium: string;
  campaign: string;
  visits: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
}

export async function getCampaignPerformance(params: DateRangeParams): Promise<CampaignMetric[]> {
  const supabase = createAdminClient();
  const { start, end } = getDateRange(params);

  // Get bookings with UTM data
  const { data: bookings } = await supabase
    .from('bookings')
    .select('utm_source, utm_medium, utm_campaign, total_amount')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .in('status', ['paid', 'complete'])
    .not('utm_source', 'is', null);

  // Get analytics events for visit counts
  const { data: events } = await supabase
    .from('analytics_events')
    .select('utm_source, utm_medium, utm_campaign')
    .eq('event_name', 'funnel_view_club')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .not('utm_source', 'is', null);

  // Aggregate by campaign
  const campaignMap = new Map<string, CampaignMetric>();

  // Count visits
  (events || []).forEach((event) => {
    const key = `${event.utm_source || ''}|${event.utm_medium || ''}|${event.utm_campaign || ''}`;
    const existing = campaignMap.get(key) || {
      source: event.utm_source || 'direct',
      medium: event.utm_medium || 'none',
      campaign: event.utm_campaign || 'none',
      visits: 0,
      conversions: 0,
      revenue: 0,
      conversionRate: 0,
    };
    existing.visits++;
    campaignMap.set(key, existing);
  });

  // Count conversions and revenue
  (bookings || []).forEach((booking) => {
    const key = `${booking.utm_source || ''}|${booking.utm_medium || ''}|${booking.utm_campaign || ''}`;
    const existing = campaignMap.get(key) || {
      source: booking.utm_source || 'direct',
      medium: booking.utm_medium || 'none',
      campaign: booking.utm_campaign || 'none',
      visits: 0,
      conversions: 0,
      revenue: 0,
      conversionRate: 0,
    };
    existing.conversions++;
    existing.revenue += booking.total_amount;
    campaignMap.set(key, existing);
  });

  // Calculate conversion rates
  const results = Array.from(campaignMap.values()).map((c) => ({
    ...c,
    conversionRate: c.visits > 0 ? (c.conversions / c.visits) * 100 : 0,
  }));

  // Sort by revenue descending
  return results.sort((a, b) => b.revenue - a.revenue);
}

// =============================================================================
// NEWSLETTER METRICS
// =============================================================================

export interface NewsletterMetric {
  id: string;
  subject: string;
  sentAt: string;
  recipientCount: number;
  clicks: number;
  conversions: number;
  revenue: number;
  clickRate: number;
  conversionRate: number;
}

export async function getNewsletterMetrics(params: DateRangeParams): Promise<NewsletterMetric[]> {
  const supabase = createAdminClient();
  const { start, end } = getDateRange(params);

  // Get sent newsletters in date range
  const { data: newsletters } = await supabase
    .from('newsletters')
    .select('id, subject, sent_at, recipient_count')
    .eq('status', 'sent')
    .gte('sent_at', start.toISOString())
    .lte('sent_at', end.toISOString())
    .order('sent_at', { ascending: false });

  if (!newsletters || newsletters.length === 0) {
    return [];
  }

  const results: NewsletterMetric[] = [];

  for (const newsletter of newsletters) {
    // Get click count
    const { count: clickCount } = await supabase
      .from('newsletter_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('newsletter_id', newsletter.id);

    // Get conversions (bookings attributed to this newsletter)
    const { data: attributedBookings } = await supabase
      .from('bookings')
      .select('total_amount')
      .eq('attributed_newsletter_id', newsletter.id)
      .in('status', ['paid', 'complete']);

    const conversions = attributedBookings?.length || 0;
    const revenue = attributedBookings?.reduce((sum, b) => sum + b.total_amount, 0) || 0;
    const clicks = clickCount || 0;
    const recipientCount = newsletter.recipient_count || 1;

    results.push({
      id: newsletter.id,
      subject: newsletter.subject,
      sentAt: newsletter.sent_at || '',
      recipientCount,
      clicks,
      conversions,
      revenue,
      clickRate: (clicks / recipientCount) * 100,
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
    });
  }

  return results;
}

// =============================================================================
// REVENUE TIMESERIES
// =============================================================================

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

export async function getRevenueTimeseries(params: DateRangeParams): Promise<RevenueDataPoint[]> {
  const supabase = createAdminClient();
  const { start, end } = getDateRange(params);

  const { data: bookings } = await supabase
    .from('bookings')
    .select('total_amount, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .in('status', ['paid', 'complete'])
    .order('created_at', { ascending: true });

  if (!bookings || bookings.length === 0) {
    return [];
  }

  // Group by date
  const dateMap = new Map<string, { revenue: number; bookings: number }>();

  bookings.forEach((booking) => {
    const date = booking.created_at.split('T')[0];
    const existing = dateMap.get(date) || { revenue: 0, bookings: 0 };
    existing.revenue += booking.total_amount;
    existing.bookings++;
    dateMap.set(date, existing);
  });

  // Fill in missing dates
  const results: RevenueDataPoint[] = [];
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const data = dateMap.get(dateStr) || { revenue: 0, bookings: 0 };
    results.push({
      date: dateStr,
      ...data,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return results;
}

// =============================================================================
// SOURCE BREAKDOWN
// =============================================================================

export interface SourceMetric {
  source: string;
  visits: number;
  conversions: number;
  revenue: number;
  percentage: number;
}

export async function getSourceBreakdown(params: DateRangeParams): Promise<SourceMetric[]> {
  const supabase = createAdminClient();
  const { start, end } = getDateRange(params);

  // Get bookings grouped by source
  const { data: bookings } = await supabase
    .from('bookings')
    .select('utm_source, total_amount')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .in('status', ['paid', 'complete']);

  const sourceMap = new Map<string, { conversions: number; revenue: number }>();
  let totalRevenue = 0;

  (bookings || []).forEach((booking) => {
    const source = booking.utm_source || 'direct';
    const existing = sourceMap.get(source) || { conversions: 0, revenue: 0 };
    existing.conversions++;
    existing.revenue += booking.total_amount;
    totalRevenue += booking.total_amount;
    sourceMap.set(source, existing);
  });

  // Convert to array with percentages
  const results: SourceMetric[] = Array.from(sourceMap.entries()).map(([source, data]) => ({
    source,
    visits: 0, // Would need analytics_events query for this
    conversions: data.conversions,
    revenue: data.revenue,
    percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
  }));

  return results.sort((a, b) => b.revenue - a.revenue);
}

// =============================================================================
// RECENT CONVERSIONS
// =============================================================================

export interface RecentConversion {
  id: string;
  parentName: string;
  parentEmail: string;
  clubName: string;
  amount: number;
  source: string;
  createdAt: string;
}

export async function getRecentConversions(limit: number = 10): Promise<RecentConversion[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('bookings')
    .select(`
      id,
      parent_name,
      parent_email,
      total_amount,
      utm_source,
      created_at,
      clubs (name)
    `)
    .in('status', ['paid', 'complete'])
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data || []).map((booking) => {
    // clubs is returned as an object (single relation), not an array
    const club = booking.clubs as unknown as { name: string } | null;
    return {
      id: booking.id,
      parentName: booking.parent_name,
      parentEmail: booking.parent_email,
      clubName: club?.name || 'Unknown',
      amount: booking.total_amount,
      source: booking.utm_source || 'direct',
      createdAt: booking.created_at,
    };
  });
}
