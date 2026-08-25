import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: boolean;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, error, placeholder, className = '', id, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full min-w-0">
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={props['aria-describedby'] || (error ? (id ? `${id}-error` : undefined) : (id ? `${id}-helper` : undefined))}
          className={`w-full min-h-[44px] appearance-none px-3.5 py-2.5 pr-10 text-base bg-white rounded-lg border transition-all text-[#1B1E22] disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error
              ? 'border-2 border-[#C23B22] focus:border-[#C23B22] focus:ring-2 focus:ring-[#C23B22]/20'
              : 'border-[#E2DDD5] focus:border-[#1B4B8F] focus:ring-2 focus:ring-[#1B4B8F]/20'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" aria-hidden="true">
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

