'use client';

import { useState, useEffect } from 'react';
import { DateRangePicker } from '@/components/admin/analytics/DateRangePicker';
import type { DateRange, NewsletterMetric } from '@/lib/analytics-queries';

function formatPrice(pence: number): string {
  return `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function NewsletterAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [loading, setLoading] = useState(true);
  const [newsletters, setNewsletters] = useState<NewsletterMetric[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics/newsletters?range=${dateRange}`);
        if (res.ok) {
          const data = await res.json();
          setNewsletters(data.newsletters || []);
        }
      } catch (error) {
        console.error('Failed to fetch newsletter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Calculate totals
  const totals = newsletters.reduce(
    (acc, n) => ({
      sent: acc.sent + n.recipientCount,
      clicks: acc.clicks + n.clicks,
      conversions: acc.conversions + n.conversions,
      revenue: acc.revenue + n.revenue,
    }),
    { sent: 0, clicks: 0, conversions: 0, revenue: 0 }
  );

  const avgClickRate = totals.sent > 0 ? (totals.clicks / totals.sent) * 100 : 0;
  const avgConversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bark">Newsletter Attribution</h1>
          <p className="text-stone mt-1">Track conversions from email newsletters</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-stone">Newsletters Sent</p>
          <p className="mt-2 text-3xl font-bold text-bark">{newsletters.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-stone">Avg Click Rate</p>
          <p className="mt-2 text-3xl font-bold text-bark">{avgClickRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-stone">Total Conversions</p>
          <p className="mt-2 text-3xl font-bold text-forest">{totals.conversions}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-stone">Newsletter Revenue</p>
          <p className="mt-2 text-3xl font-bold text-forest">{formatPrice(totals.revenue)}</p>
        </div>
      </div>

      {/* Newsletter Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-bark mb-4">Newsletter Performance</h3>
        {loading ? (
          <p className="text-center text-stone py-12">Loading newsletter data...</p>
        ) : newsletters.length === 0 ? (
          <p className="text-center text-stone py-12">No newsletters sent in this period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cloud">
                  <th className="text-left py-3 px-2 text-sm font-medium text-stone">Subject</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-stone">Sent</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-stone">Recipients</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-stone">Clicks</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-stone">CTR</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-stone">Conv.</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-stone">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {newsletters.map((newsletter) => (
                  <tr key={newsletter.id} className="border-b border-cloud last:border-0">
                    <td className="py-3 px-2">
                      <span className="text-sm font-medium text-bark line-clamp-1">
                        {newsletter.subject}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-right text-stone">
                      {formatDate(newsletter.sentAt)}
                    </td>
                    <td className="py-3 px-2 text-sm text-right text-stone">
                      {newsletter.recipientCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-sm text-right text-stone">
                      {newsletter.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-sm text-right text-stone">
                      {newsletter.clickRate.toFixed(1)}%
                    </td>
                    <td className="py-3 px-2 text-sm text-right font-medium text-forest">
                      {newsletter.conversions}
                    </td>
                    <td className="py-3 px-2 text-sm text-right font-medium text-forest">
                      {formatPrice(newsletter.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
