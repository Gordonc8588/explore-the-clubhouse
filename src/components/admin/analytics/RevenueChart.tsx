'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueDataPoint } from '@/lib/analytics-queries';

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

function formatPrice(value: number): string {
  return `£${(value / 100).toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-bark mb-4">Revenue Trend</h3>
        <div className="h-64 flex items-center justify-center text-stone">
          No data available for this period
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-bark mb-4">Revenue Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatPrice}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [formatPrice(value as number), 'Revenue']}
              labelFormatter={(label) => formatDate(label as string)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2D5A3D"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#2D5A3D' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
