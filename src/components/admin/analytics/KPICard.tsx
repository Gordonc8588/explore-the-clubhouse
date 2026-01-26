'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
}

export function KPICard({ title, value, change, changeLabel = 'vs previous period', icon }: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-stone">{title}</p>
          <p className="mt-2 text-3xl font-bold text-bark">{value}</p>
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-sage/20">
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {isPositive && (
            <>
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">+{change.toFixed(1)}%</span>
            </>
          )}
          {isNegative && (
            <>
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">{change.toFixed(1)}%</span>
            </>
          )}
          {!isPositive && !isNegative && (
            <span className="text-sm font-medium text-stone">0%</span>
          )}
          <span className="text-sm text-pebble ml-1">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
