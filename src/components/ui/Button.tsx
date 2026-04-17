import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent-strong)] text-white hover:brightness-110 shadow-[0_12px_28px_rgba(37,99,235,0.24)]',
  secondary:
    'gt-panel text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]',
  danger:
    'border border-red-500/20 bg-red-500/10 text-[var(--danger)] hover:bg-red-500/16',
  ghost:
    'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-9 rounded-xl px-3.5 text-sm',
  md: 'min-h-11 rounded-2xl px-4 py-2.5 text-sm',
  lg: 'min-h-12 rounded-2xl px-5 py-3 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring-focus)]',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && 'cursor-not-allowed opacity-50 shadow-none',
        className
      )}
      {...(props as any)}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
