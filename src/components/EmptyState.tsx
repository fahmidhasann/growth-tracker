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
      className="gt-panel flex flex-col items-center rounded-[1.75rem] border-dashed px-6 py-16 text-center"
    >
      {Icon && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[var(--surface-soft)] text-[var(--text-muted)]"
        >
          <Icon className="h-6 w-6" />
        </motion.div>
      )}
      <p className="max-w-md text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">{message}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="md" onClick={onAction} className="mt-5 rounded-2xl">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
