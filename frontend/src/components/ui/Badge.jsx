import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({
  children,
  variant = 'default',
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-cream text-espresso border-gold/30',
    confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    checked_in: 'bg-sky-50 text-sky-800 border-sky-200',
    in_service: 'bg-purple-50 text-purple-800 border-purple-200',
    completed: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
    no_show: 'bg-gray-100 text-gray-700 border-gray-300',
    gold: 'bg-gold/15 text-gold-dark border-gold/40 font-semibold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase border',
          variants[variant] || variants.default,
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};

