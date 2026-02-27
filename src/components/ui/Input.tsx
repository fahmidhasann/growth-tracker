import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-zinc-400 mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-zinc-600",
          "transition-all placeholder:text-zinc-600",
          className
        )}
        {...props}
      />
    </div>
  );
}
