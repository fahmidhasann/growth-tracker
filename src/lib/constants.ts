export const MOOD_EMOJIS = ['😫', '😕', '😐', '🙂', '🤩'] as const;

export const SKILL_LEVELS = [
  {
    value: 1,
    label: 'Beginner',
    color: 'bg-zinc-800 text-zinc-400 [.light_&]:bg-zinc-200 [.light_&]:text-zinc-700',
  },
  {
    value: 2,
    label: 'Novice',
    color: 'bg-emerald-900/50 text-emerald-400 [.light_&]:bg-emerald-100 [.light_&]:text-emerald-700',
  },
  {
    value: 3,
    label: 'Intermediate',
    color: 'bg-blue-900/50 text-blue-400 [.light_&]:bg-blue-100 [.light_&]:text-blue-700',
  },
  {
    value: 4,
    label: 'Advanced',
    color: 'bg-purple-900/50 text-purple-400 [.light_&]:bg-purple-100 [.light_&]:text-purple-700',
  },
  {
    value: 5,
    label: 'Expert',
    color: 'bg-amber-900/50 text-amber-400 [.light_&]:bg-amber-100 [.light_&]:text-amber-700',
  },
] as const;

export const HEATMAP_COLORS = [
  'bg-zinc-800/50',
  'bg-emerald-900/50',
  'bg-emerald-700/60',
  'bg-emerald-500/80',
  'bg-emerald-400',
] as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '8px',
} as const;

export const CHART_AXIS_PROPS = {
  stroke: '#52525b',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

export function getMoodEmoji(mood: number): string {
  return MOOD_EMOJIS[mood - 1] ?? '😐';
}

export function getSkillLabel(level: number): string {
  return SKILL_LEVELS.find(s => s.value === level)?.label ?? 'Beginner';
}
