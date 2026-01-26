'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { SourceMetric } from '@/lib/analytics-queries';

interface SourcePieChartProps {
  data: SourceMetric[];
}

const COLORS = ['#2D5A3D', '#4A7C59', '#87A878', '#F5A623', '#E8912D', '#E07A5F'];

function formatPrice(value: number): string {
  return `£${(value / 100).toFixed(0)}`;
}

export function SourcePieChart({ data }: SourcePieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-bark mb-4">Revenue by Source</h3>
        <div className="h-64 flex items-center justify-center text-stone">
          No data available
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.source,
    value: item.revenue,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-bark mb-4">Revenue by Source</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatPrice(value as number)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-sm text-stone">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
