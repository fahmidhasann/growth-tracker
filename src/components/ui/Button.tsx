import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-zinc-100 text-zinc-900 hover:bg-white',
  secondary: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700',
  danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
  ghost: 'text-zinc-400 hover:text-zinc-100',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-6 py-3 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      className={cn(
        'font-medium transition-colors inline-flex items-center justify-center gap-2',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
