import { AlertCircle, X } from 'lucide-react';

interface StatusBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function StatusBanner({ message, onDismiss }: StatusBannerProps) {
  return (
    <div
      className="gt-panel flex items-start gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--text-secondary)]"
      role="status"
      aria-live="polite"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/12 text-[var(--danger)]">
        <AlertCircle className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[var(--text-primary)]">There was a problem syncing your changes.</p>
        <p className="mt-1 leading-relaxed text-[var(--text-muted)]">{message}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xl p-2 text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)]"
          aria-label="Dismiss message"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
