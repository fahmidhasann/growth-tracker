import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_AXIS_PROPS, CHART_TOOLTIP_STYLE } from '../../lib/constants';

interface SkillLevelsChartProps {
  data: { name: string; level: number }[];
}

export function SkillLevelsChart({ data }: SkillLevelsChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="name" {...CHART_AXIS_PROPS} />
        <YAxis {...CHART_AXIS_PROPS} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
        <Tooltip cursor={{ fill: 'var(--surface-soft)' }} contentStyle={CHART_TOOLTIP_STYLE} />
        <Bar dataKey="level" fill="var(--accent-strong)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
