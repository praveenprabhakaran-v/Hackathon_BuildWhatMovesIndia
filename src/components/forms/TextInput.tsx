import React from 'react';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, leftIcon, rightIcon, className = '', id, disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full min-w-0">
        {leftIcon && (
          <div className="absolute left-3 text-gray-500 pointer-events-none flex items-center justify-center" aria-hidden="true">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={props['aria-describedby'] || (error ? (id ? `${id}-error` : undefined) : (id ? `${id}-helper` : undefined))}
          className={`w-full min-h-[44px] px-3.5 py-2.5 text-base bg-white rounded-lg border transition-all placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed text-[#1B1E22] ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error
              ? 'border-2 border-[#C23B22] focus:border-[#C23B22] focus:ring-2 focus:ring-[#C23B22]/20'
              : 'border-[#E2DDD5] focus:border-[#1B4B8F] focus:ring-2 focus:ring-[#1B4B8F]/20'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 text-gray-500 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

