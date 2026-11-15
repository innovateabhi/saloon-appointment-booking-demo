import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs';

  const variants = {
    primary: 'bg-espresso text-ivory hover:bg-black focus:ring-espresso shadow-sm',
    gold: 'bg-gold text-white hover:bg-gold-dark focus:ring-gold shadow-luxury hover:shadow-luxury-hover',
    outline: 'border border-gold text-espresso hover:bg-gold/10 focus:ring-gold',
    secondary: 'bg-cream text-espresso hover:bg-champagne/50 focus:ring-cream',
    ghost: 'text-espresso hover:bg-cream/60 focus:ring-gold',
    danger: 'bg-status-error text-white hover:bg-red-700 focus:ring-status-error',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[11px] gap-1.5',
    md: 'px-5 py-2.5 text-xs gap-2',
    lg: 'px-7 py-3 text-sm gap-2.5',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

