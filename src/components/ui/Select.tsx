import type { SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children?: ReactNode;
}

export function Select({ label, className, id, children, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-zinc-400 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 appearance-none pr-10",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-zinc-600",
            "transition-all",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
      </div>
    </div>
  );
}
