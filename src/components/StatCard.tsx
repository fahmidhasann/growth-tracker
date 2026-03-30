import { type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  icon: LucideIcon;
  color: string;       // e.g. "emerald", "blue", "amber", "purple"
  count: number;
  label: string;
  index?: number;
}

const colorMap: Record<string, { bg: string; text: string }> = {
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
  },
  purple: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-500',
  },
};

export function StatCard({ icon: Icon, color, count, label, index = 0 }: StatCardProps) {
  const colors = colorMap[color] ?? colorMap.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="gt-panel flex flex-col gap-4 rounded-[1.5rem] p-5"
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colors.bg} ${colors.text}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{count}</p>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
      </div>
    </motion.div>
  );
}
