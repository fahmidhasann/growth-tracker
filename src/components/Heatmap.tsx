import { useMemo } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { HEATMAP_COLORS } from '../lib/constants';

export function Heatmap() {
  const logs = useStore((state) => state.logs);
  const projects = useStore((state) => state.projects);
  const milestones = useStore((state) => state.milestones);
  const skills = useStore((state) => state.skills);

  const days = useMemo(() => {
    const start = subDays(new Date(), 363);
    return Array.from({ length: 364 }).map((_, i) => addDays(start, i));
  }, []);

  const toDateKey = (value: string) => value.slice(0, 10);

  const activityMap = useMemo(() => {
    const acc: Record<string, number> = {};

    const increment = (date: string) => {
      if (!date) return;
      const dateStr = toDateKey(date);
      acc[dateStr] = (acc[dateStr] || 0) + 1;
    };

    logs.forEach((log) => increment(log.date));
    projects.forEach((project) => increment(project.date));
    milestones.forEach((milestone) => increment(milestone.date));
    skills.forEach((skill) => skill.history.forEach((entry) => increment(entry.date)));

    return acc;
  }, [logs, projects, milestones, skills]);

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
                  title={`${format(day, 'MMM dd, yyyy')}: ${count} ${count === 1 ? 'activity' : 'activities'}`}
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
