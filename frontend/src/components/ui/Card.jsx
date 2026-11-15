import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({
  children,
  className,
  glass = false,
  hover = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-sm transition-all duration-300',
          glass ? 'glass-panel' : 'bg-white border border-[#E5D2B8]/60 shadow-sm',
          hover && 'hover:shadow-luxury-hover hover:border-gold/60 transform hover:-translate-y-0.5',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => (
  <div className={twMerge('px-6 py-5 border-b border-[#F1EAE1]', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={twMerge('text-lg font-serif font-semibold text-espresso', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className, ...props }) => (
  <p className={twMerge('text-xs text-taupe mt-0.5', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={twMerge('p-6', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={twMerge('px-6 py-4 bg-cream/30 border-t border-[#F1EAE1]', className)} {...props}>
    {children}
  </div>
);

