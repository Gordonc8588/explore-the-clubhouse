'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import type { CampaignMetric } from '@/lib/analytics-queries';

interface CampaignTableProps {
  data: CampaignMetric[];
}

function formatPrice(value: number): string {
  return `£${(value / 100).toFixed(2)}`;
}

export function CampaignTable({ data }: CampaignTableProps) {
  const [sortField, setSortField] = useState<keyof CampaignMetric>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const multiplier = sortDirection === 'desc' ? -1 : 1;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * multiplier;
    }
    return String(aVal).localeCompare(String(bVal)) * multiplier;
  });

  const handleSort = (field: keyof CampaignMetric) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    const headers = ['Source', 'Medium', 'Campaign', 'Visits', 'Conversions', 'Revenue', 'Conversion Rate'];
    const rows = data.map((row) => [
      row.source,
      row.medium,
      row.campaign,
      row.visits,
      row.conversions,
      (row.revenue / 100).toFixed(2),
      `${row.conversionRate.toFixed(1)}%`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaign-performance.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-bark mb-4">Campaign Performance</h3>
        <p className="text-stone text-center py-8">No campaign data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-bark">Campaign Performance</h3>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone hover:text-bark bg-cloud rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cloud">
              <th
                className="text-left py-3 px-2 text-sm font-medium text-stone cursor-pointer hover:text-bark"
                onClick={() => handleSort('source')}
              >
                Source {sortField === 'source' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th
                className="text-left py-3 px-2 text-sm font-medium text-stone cursor-pointer hover:text-bark"
                onClick={() => handleSort('medium')}
              >
                Medium {sortField === 'medium' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th
                className="text-left py-3 px-2 text-sm font-medium text-stone cursor-pointer hover:text-bark"
                onClick={() => handleSort('campaign')}
              >
                Campaign {sortField === 'campaign' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th
                className="text-right py-3 px-2 text-sm font-medium text-stone cursor-pointer hover:text-bark"
                onClick={() => handleSort('visits')}
              >
                Visits {sortField === 'visits' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th
                className="text-right py-3 px-2 text-sm font-medium text-stone cursor-pointer hover:text-bark"
                onClick={() => handleSort('conversions')}
              >
                Conv. {sortField === 'conversions' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th
                className="text-right py-3 px-2 text-sm font-medium text-stone cursor-pointer hover:text-bark"
                onClick={() => handleSort('revenue')}
              >
                Revenue {sortField === 'revenue' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
              <th
                className="text-right py-3 px-2 text-sm font-medium text-stone cursor-pointer hover:text-bark"
                onClick={() => handleSort('conversionRate')}
              >
                CVR {sortField === 'conversionRate' && (sortDirection === 'desc' ? '↓' : '↑')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={`${row.source}-${row.medium}-${row.campaign}-${index}`} className="border-b border-cloud last:border-0">
                <td className="py-3 px-2 text-sm text-bark">{row.source}</td>
                <td className="py-3 px-2 text-sm text-stone">{row.medium}</td>
                <td className="py-3 px-2 text-sm text-stone">{row.campaign}</td>
                <td className="py-3 px-2 text-sm text-right text-stone">{row.visits}</td>
                <td className="py-3 px-2 text-sm text-right text-stone">{row.conversions}</td>
                <td className="py-3 px-2 text-sm text-right font-medium text-bark">{formatPrice(row.revenue)}</td>
                <td className="py-3 px-2 text-sm text-right text-stone">{row.conversionRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
