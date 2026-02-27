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
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
};

export function StatCard({ icon: Icon, color, count, label, index = 0 }: StatCardProps) {
  const colors = colorMap[color] ?? colorMap.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl flex flex-col gap-3"
    >
      <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center ${colors.text}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-3xl font-light text-zinc-100">{count}</p>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mt-1">{label}</p>
      </div>
    </motion.div>
  );
}
