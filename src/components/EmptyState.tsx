import { type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="text-center py-20 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl border-dashed"
    >
      {Icon && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="mx-auto w-14 h-14 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500 mb-4"
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      )}
      <p className="text-zinc-500">{message}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
