'use client';

import { useState, useEffect } from 'react';
import { DateRangePicker } from '@/components/admin/analytics/DateRangePicker';
import { FunnelChart } from '@/components/admin/analytics/FunnelChart';
import type { DateRange, FunnelStep } from '@/lib/analytics-queries';

export default function FunnelAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics/funnel?range=${dateRange}`);
        if (res.ok) {
          const data = await res.json();
          setFunnelData(data.funnel || []);
        }
      } catch (error) {
        console.error('Failed to fetch funnel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Calculate overall conversion rate
  const overallConversion = funnelData.length >= 2 && funnelData[0].count > 0
    ? (funnelData[funnelData.length - 1].count / funnelData[0].count) * 100
    : 0;

  // Find biggest drop-off
  const biggestDropOff = funnelData.reduce((max, step) =>
    step.dropOff > max.dropOff ? step : max,
    { step: '', label: '', count: 0, dropOff: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bark">Booking Funnel</h1>
          <p className="text-stone mt-1">Analyze where users drop off in the booking process</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-stone">Overall Conversion</p>
          <p className="mt-2 text-3xl font-bold text-forest">{overallConversion.toFixed(1)}%</p>
          <p className="mt-1 text-sm text-pebble">View to Purchase</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-stone">Biggest Drop-off</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{biggestDropOff.dropOff.toFixed(0)}%</p>
          <p className="mt-1 text-sm text-pebble">{biggestDropOff.label || 'N/A'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-stone">Total Purchases</p>
          <p className="mt-2 text-3xl font-bold text-bark">
            {funnelData.length > 0 ? funnelData[funnelData.length - 1].count : 0}
          </p>
          <p className="mt-1 text-sm text-pebble">In this period</p>
        </div>
      </div>

      {/* Funnel Visualization */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-center text-stone py-12">Loading funnel data...</p>
        </div>
      ) : (
        <FunnelChart data={funnelData} />
      )}

      {/* Step Details Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-bark mb-4">Step Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cloud">
                <th className="text-left py-3 px-2 text-sm font-medium text-stone">Step</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-stone">Users</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-stone">Drop-off</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-stone">Cumulative Rate</th>
              </tr>
            </thead>
            <tbody>
              {funnelData.map((step, index) => {
                const cumulativeRate = funnelData[0].count > 0
                  ? (step.count / funnelData[0].count) * 100
                  : 0;

                return (
                  <tr key={step.step} className="border-b border-cloud last:border-0">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-forest text-white text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-bark">{step.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-right text-bark font-medium">
                      {step.count.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-sm text-right">
                      {step.dropOff > 0 ? (
                        <span className="text-red-600">-{step.dropOff.toFixed(1)}%</span>
                      ) : (
                        <span className="text-stone">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-sm text-right text-stone">
                      {cumulativeRate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
