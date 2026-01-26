'use client';

import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Percent, TrendingUp } from 'lucide-react';
import { KPICard } from '@/components/admin/analytics/KPICard';
import { DateRangePicker } from '@/components/admin/analytics/DateRangePicker';
import { RevenueChart } from '@/components/admin/analytics/RevenueChart';
import { SourcePieChart } from '@/components/admin/analytics/SourcePieChart';
import type { DateRange } from '@/lib/analytics-queries';
import type {
  OverviewMetrics,
  RevenueDataPoint,
  SourceMetric,
  RecentConversion,
} from '@/lib/analytics-queries';

function formatPrice(pence: number): string {
  return `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AnalyticsOverviewPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [sourceData, setSourceData] = useState<SourceMetric[]>([]);
  const [recentConversions, setRecentConversions] = useState<RecentConversion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics/overview?range=${dateRange}`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
          setRevenueData(data.revenueTimeseries || []);
          setSourceData(data.sourceBreakdown || []);
          setRecentConversions(data.recentConversions || []);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bark">Analytics Overview</h1>
          <p className="text-stone mt-1">Track your booking performance and marketing effectiveness</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={loading ? '...' : formatPrice(metrics?.totalRevenue || 0)}
          change={metrics?.revenueChange}
          icon={<DollarSign className="h-5 w-5 text-forest" />}
        />
        <KPICard
          title="Bookings"
          value={loading ? '...' : String(metrics?.totalBookings || 0)}
          change={metrics?.bookingsChange}
          icon={<ShoppingCart className="h-5 w-5 text-forest" />}
        />
        <KPICard
          title="Conversion Rate"
          value={loading ? '...' : `${(metrics?.conversionRate || 0).toFixed(1)}%`}
          icon={<Percent className="h-5 w-5 text-forest" />}
        />
        <KPICard
          title="Avg Order Value"
          value={loading ? '...' : formatPrice(metrics?.averageOrderValue || 0)}
          icon={<TrendingUp className="h-5 w-5 text-forest" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>
        <div>
          <SourcePieChart data={sourceData} />
        </div>
      </div>

      {/* Recent Conversions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-bark mb-4">Recent Conversions</h3>
        {recentConversions.length === 0 ? (
          <p className="text-stone text-center py-8">No recent conversions</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cloud">
                  <th className="text-left py-3 px-2 text-sm font-medium text-stone">Parent</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-stone">Club</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-stone">Source</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-stone">Amount</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-stone">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentConversions.map((conversion) => (
                  <tr key={conversion.id} className="border-b border-cloud last:border-0">
                    <td className="py-3 px-2">
                      <div className="text-sm font-medium text-bark">{conversion.parentName}</div>
                      <div className="text-xs text-pebble">{conversion.parentEmail}</div>
                    </td>
                    <td className="py-3 px-2 text-sm text-stone">{conversion.clubName}</td>
                    <td className="py-3 px-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-sage/20 text-forest">
                        {conversion.source}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-right font-medium text-bark">
                      {formatPrice(conversion.amount)}
                    </td>
                    <td className="py-3 px-2 text-sm text-right text-stone">
                      {formatDate(conversion.createdAt)}
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
