import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  className,
  type = 'text',
  icon: Icon,
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label className="block text-xs font-medium uppercase tracking-wider text-charcoal/80">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-taupe">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={twMerge(
            clsx(
              'w-full bg-white border border-[#E5D2B8] rounded-sm text-sm text-espresso placeholder:text-taupe/60 transition-all duration-200',
              'focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold',
              Icon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5',
              error && 'border-status-error focus:border-status-error focus:ring-status-error',
              className
            )
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-status-error font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-taupe">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

