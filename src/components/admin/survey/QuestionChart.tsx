'use client';

interface QuestionChartProps {
  title: string;
  data: Record<string, number>;
  type?: 'bar' | 'horizontal';
  showPercentages?: boolean;
}

export default function QuestionChart({
  title,
  data,
  type = 'horizontal',
  showPercentages = true,
}: QuestionChartProps) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const maxValue = Math.max(...entries.map(([, count]) => count));

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
        <p className="text-sm text-gray-500">No data yet</p>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-800 mb-4">{title}</h4>
        <div className="flex items-end gap-2 h-40">
          {entries.map(([label, count]) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            const height = maxValue > 0 ? (count / maxValue) * 100 : 0;

            return (
              <div key={label} className="flex-1 flex flex-col items-center">
                <span className="text-xs font-medium text-gray-600 mb-1">
                  {count}
                </span>
                <div
                  className="w-full bg-[#7a7c4a] rounded-t transition-all duration-300"
                  style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                />
                <span className="text-xs text-gray-500 mt-2 text-center truncate w-full" title={label}>
                  {label.length > 8 ? `${label.slice(0, 8)}...` : label}
                </span>
                {showPercentages && (
                  <span className="text-xs text-gray-400">{percentage}%</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-semibold text-gray-800 mb-4">{title}</h4>
      <div className="space-y-3">
        {entries.map(([label, count]) => {
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const width = maxValue > 0 ? (count / maxValue) * 100 : 0;

          return (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 truncate pr-2" title={label}>
                  {label}
                </span>
                <span className="text-gray-500 flex-shrink-0">
                  {count} {showPercentages && <span className="text-gray-400">({percentage}%)</span>}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7a7c4a] rounded-full transition-all duration-300"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
