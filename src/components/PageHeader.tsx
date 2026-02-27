import { Plus, type LucideIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
}

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  actionIcon: ActionIcon = Plus,
  onAction,
}: PageHeaderProps) {
  return (
    <header className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">{title}</h2>
        <p className="text-zinc-400 mt-2">{subtitle}</p>
      </div>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
          className="rounded-full"
        >
          <ActionIcon className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </header>
  );
}
