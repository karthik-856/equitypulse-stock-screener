import React, { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  prefixNode?: ReactNode;
  suffixNode?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, prefixNode, suffixNode, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {prefixNode && (
          <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
            {prefixNode}
          </div>
        )}
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500 transition-colors',
              prefixNode ? 'pl-9' : '',
              suffixNode ? 'pr-9' : '',
              className
            )
          )}
          {...props}
        />
        {suffixNode && (
          <div className="absolute right-3 flex items-center pointer-events-none text-gray-400">
            {suffixNode}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
