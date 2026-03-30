import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_AXIS_PROPS, CHART_TOOLTIP_STYLE } from '../../lib/constants';

interface MoodTrendChartProps {
  data: { date: string; mood: number }[];
}

export function MoodTrendChart({ data }: MoodTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="date" {...CHART_AXIS_PROPS} />
        <YAxis {...CHART_AXIS_PROPS} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        <Line
          type="monotone"
          dataKey="mood"
          stroke="var(--warning)"
          strokeWidth={2.5}
          dot={{ fill: 'var(--warning)', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
