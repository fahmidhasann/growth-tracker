import { type LucideIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl border-dashed">
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500 mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <p className="text-zinc-500">{message}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
