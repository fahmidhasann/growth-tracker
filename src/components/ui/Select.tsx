import type { SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children?: ReactNode;
  hint?: string;
  error?: string;
}

export function Select({ label, className, id, children, hint, error, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'gt-field w-full appearance-none rounded-2xl px-4 py-3 pr-10 text-sm transition-all',
            'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)] focus-visible:border-[var(--border-strong)]',
            error && 'border-red-500/40 focus-visible:border-red-500/40 focus-visible:ring-red-500/15',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-soft)]" />
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      {!error && hint ? <p className="text-sm text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  );
}
