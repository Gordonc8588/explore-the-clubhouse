'use client';

import type { FunnelStep } from '@/lib/analytics-queries';

interface FunnelChartProps {
  data: FunnelStep[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-bark mb-4">Booking Funnel</h3>
        <div className="h-64 flex items-center justify-center text-stone">
          No funnel data available
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-bark mb-4">Booking Funnel</h3>
      <div className="space-y-3">
        {data.map((step, index) => {
          const widthPercent = (step.count / maxCount) * 100;
          const isLast = index === data.length - 1;

          return (
            <div key={step.step}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-bark">{step.label}</span>
                <span className="text-sm text-stone">{step.count.toLocaleString()}</span>
              </div>
              <div className="relative">
                <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
                  <div
                    className={`h-full rounded-md transition-all ${
                      isLast ? 'bg-sunshine' : 'bg-forest'
                    }`}
                    style={{ width: `${Math.max(widthPercent, 2)}%` }}
                  />
                </div>
                {step.dropOff > 0 && index > 0 && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-600">
                    -{step.dropOff.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
