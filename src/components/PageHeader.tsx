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
    <header className="flex flex-col gap-4 border-b gt-hairline pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">Workspace</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">{subtitle}</p>
      </div>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="lg"
          onClick={onAction}
          className="self-start shrink-0 rounded-2xl sm:self-auto"
        >
          <ActionIcon className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </header>
  );
}
