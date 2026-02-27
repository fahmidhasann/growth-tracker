import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-zinc-400 mb-2">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 resize-none",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-zinc-600",
          "transition-all placeholder:text-zinc-600",
          className
        )}
        {...props}
      />
    </div>
  );
}
