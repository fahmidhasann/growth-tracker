import { useMemo, useCallback } from 'react';
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

  const { totalActivities, activeDays } = useMemo(() => {
    let total = 0;
    let active = 0;
    const dayKeys = new Set(days.map((d) => format(d, 'yyyy-MM-dd')));
    for (const [key, count] of Object.entries(activityMap)) {
      if (dayKeys.has(key)) {
        total += count as number;
        active++;
      }
    }
    return { totalActivities: total, activeDays: active };
  }, [activityMap, days]);

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

  const getIntensity = useCallback((count: number) => {
    if (count === 0) return HEATMAP_COLORS[0];
    if (count === 1) return HEATMAP_COLORS[1];
    if (count === 2) return HEATMAP_COLORS[2];
    if (count === 3) return HEATMAP_COLORS[3];
    return HEATMAP_COLORS[4];
  }, []);

  return (
    <div className="gt-panel overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
      <div className="mb-4 flex min-w-max flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Learning activity</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Your last 52 weeks of logged growth.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
          <span>{totalActivities} {totalActivities === 1 ? 'activity' : 'activities'} this year</span>
          <span className="text-[var(--text-soft)]">·</span>
          <span>{activeDays} {activeDays === 1 ? 'day' : 'days'} active</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-max" role="grid" aria-label="Learning activity heatmap">
          <div className="mb-1 flex gap-1 pl-0" role="row">
        {Array.from({ length: 52 }).map((_, weekIndex) => {
          const label = monthLabels.find((m) => m.col === weekIndex);
          return (
                <div key={weekIndex} className="w-3 text-center" role="columnheader">
              {label && (
                    <span className="text-[9px] font-medium text-[var(--text-soft)]">{label.label}</span>
              )}
            </div>
          );
        })}
          </div>

          <div className="flex min-w-max gap-1" role="rowgroup">
        {Array.from({ length: 52 }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1" role="row">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const day = days[weekIndex * 7 + dayIndex];
              if (!day) return null;

              const dateStr = format(day, 'yyyy-MM-dd');
              const count = activityMap[dateStr] || 0;

              return (
                <div
                  key={dateStr}
                  role="gridcell"
                  tabIndex={0}
                  title={`${format(day, 'MMM dd, yyyy')}: ${count} ${count === 1 ? 'activity' : 'activities'}`}
                  aria-label={`${format(day, 'MMMM dd, yyyy')}: ${count} ${count === 1 ? 'activity' : 'activities'}`}
                  className={cn('h-3 w-3 rounded-[4px] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)]')}
                  style={{ backgroundColor: getIntensity(count) }}
                />
              );
            })}
          </div>
        ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-[var(--text-muted)]">
        <span>Less</span>
        <div className="flex gap-1">
          {HEATMAP_COLORS.map((color, i) => (
            <div key={i} className="h-3 w-3 rounded-[4px]" style={{ backgroundColor: color }} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
