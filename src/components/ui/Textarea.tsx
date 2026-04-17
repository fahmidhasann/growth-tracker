import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const hintId = `${textareaId}-hint`;
  const errorId = `${textareaId}-error`;
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'gt-field min-h-28 w-full rounded-2xl px-4 py-3 text-sm transition-all placeholder:text-[var(--text-soft)] resize-none',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)] focus-visible:border-[var(--border-strong)]',
          error && 'border-red-500/40 focus-visible:border-red-500/40 focus-visible:ring-red-500/15',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...props}
      />
      {error ? <p id={errorId} className="text-sm text-[var(--danger)]">{error}</p> : null}
      {!error && hint ? <p id={hintId} className="text-sm text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  );
}
