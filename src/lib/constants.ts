export const MOOD_EMOJIS = ['😫', '😕', '😐', '🙂', '🤩'] as const;
export const MOOD_LABELS = ['Drained', 'Low', 'Steady', 'Good', 'Excellent'] as const;

export const SKILL_LEVELS = [
  {
    value: 1,
    label: 'Beginner',
    color: 'bg-[var(--surface-soft)] text-[var(--text-secondary)]',
  },
  {
    value: 2,
    label: 'Novice',
    color: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    value: 3,
    label: 'Intermediate',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    value: 4,
    label: 'Advanced',
    color: 'bg-violet-500/10 text-violet-500',
  },
  {
    value: 5,
    label: 'Expert',
    color: 'bg-amber-500/10 text-amber-500',
  },
] as const;

export const HEATMAP_COLORS = [
  'var(--heat-0)',
  'var(--heat-1)',
  'var(--heat-2)',
  'var(--heat-3)',
  'var(--heat-4)',
] as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'var(--chart-tooltip-bg)',
  border: '1px solid var(--chart-tooltip-border)',
  borderRadius: '16px',
  color: 'var(--text-primary)',
  boxShadow: 'var(--shadow-soft)',
} as const;

export const CHART_AXIS_PROPS = {
  stroke: 'var(--chart-axis)',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

export function getMoodEmoji(mood: number): string {
  return MOOD_EMOJIS[mood - 1] ?? '😐';
}

export function getMoodLabel(mood: number): string {
  return MOOD_LABELS[mood - 1] ?? 'Steady';
}

export function getSkillLabel(level: number): string {
  return SKILL_LEVELS.find(s => s.value === level)?.label ?? 'Beginner';
}
