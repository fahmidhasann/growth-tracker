import { useMemo } from 'react';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { HEATMAP_COLORS } from '../lib/constants';

export function Heatmap() {
  const logs = useStore((state) => state.logs);

  const today = new Date();
  const startDate = startOfWeek(subDays(today, 364));

  const days = useMemo(
    () => Array.from({ length: 365 }).map((_, i) => addDays(startDate, i)),
    [startDate.getTime()]
  );

  const activityMap = useMemo(() => {
    return logs.reduce((acc, log) => {
      const dateStr = format(new Date(log.date), 'yyyy-MM-dd');
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [logs]);

  // Generate month labels with their column positions
  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    for (let weekIndex = 0; weekIndex < 52; weekIndex++) {
      const day = days[weekIndex * 7];
      if (day) {
        const month = day.getMonth();
        if (month !== lastMonth) {
          labels.push({ label: format(day, 'MMM'), col: weekIndex });
          lastMonth = month;
        }
      }
    }
    return labels;
  }, [days]);

  const getIntensity = (count: number) => {
    if (count === 0) return HEATMAP_COLORS[0];
    if (count === 1) return HEATMAP_COLORS[1];
    if (count === 2) return HEATMAP_COLORS[2];
    if (count === 3) return HEATMAP_COLORS[3];
    return HEATMAP_COLORS[4];
  };

  return (
    <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-x-auto">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">Learning Activity</h3>

      {/* Month labels */}
      <div className="flex gap-1 min-w-max mb-1 pl-0">
        {Array.from({ length: 52 }).map((_, weekIndex) => {
          const label = monthLabels.find((m) => m.col === weekIndex);
          return (
            <div key={weekIndex} className="w-3 text-center">
              {label && (
                <span className="text-[9px] text-zinc-500 font-medium">{label.label}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-1 min-w-max">
        {Array.from({ length: 52 }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const day = days[weekIndex * 7 + dayIndex];
              if (!day) return null;

              const dateStr = format(day, 'yyyy-MM-dd');
              const count = activityMap[dateStr] || 0;

              return (
                <div
                  key={dateStr}
                  title={`${format(day, 'MMM dd, yyyy')}: ${count} ${count === 1 ? 'entry' : 'entries'}`}
                  className={cn(
                    'w-3 h-3 rounded-sm transition-colors',
                    getIntensity(count)
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500 justify-end">
        <span>Less</span>
        <div className="flex gap-1">
          {HEATMAP_COLORS.map((color, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
