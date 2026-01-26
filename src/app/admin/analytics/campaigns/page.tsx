'use client';

import { useState, useEffect } from 'react';
import { DateRangePicker } from '@/components/admin/analytics/DateRangePicker';
import { CampaignTable } from '@/components/admin/analytics/CampaignTable';
import type { DateRange, CampaignMetric } from '@/lib/analytics-queries';

function formatPrice(pence: number): string {
  return `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

export default function CampaignsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignMetric[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics/campaigns?range=${dateRange}`);
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (error) {
        console.error('Failed to fetch campaign data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Calculate totals
  const totals = campaigns.reduce(
    (acc, c) => ({
      visits: acc.visits + c.visits,
      conversions: acc.conversions + c.conversions,
      revenue: acc.revenue + c.revenue,
    }),
    { visits: 0, conversions: 0, revenue: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bark">Campaign Performance</h1>
          <p className="text-stone mt-1">Track UTM campaigns and marketing channels</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-stone">Active Campaigns</p>
          <p className="mt-2 text-3xl font-bold text-bark">{campaigns.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-stone">Total Visits</p>
          <p className="mt-2 text-3xl font-bold text-bark">{totals.visits.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-stone">Conversions</p>
          <p className="mt-2 text-3xl font-bold text-forest">{totals.conversions}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-stone">Campaign Revenue</p>
          <p className="mt-2 text-3xl font-bold text-forest">{formatPrice(totals.revenue)}</p>
        </div>
      </div>

      {/* Campaign Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-center text-stone py-12">Loading campaign data...</p>
        </div>
      ) : (
        <CampaignTable data={campaigns} />
      )}
    </div>
  );
}
