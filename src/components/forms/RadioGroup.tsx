import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  error,
  className = '',
  disabled = false,
}) => {
  const errorId = `${name}-error`;

  return (
    <div className={`space-y-2.5 w-full min-w-0 ${className}`} role="radiogroup" aria-invalid={error ? 'true' : undefined} aria-describedby={error ? errorId : undefined}>
      {options.map((option) => {
        const isChecked = value === option.value;
        const inputId = `${name}-${option.value}`;

        return (
          <label
            key={option.value}
            htmlFor={inputId}
            className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
              isChecked
                ? 'border-[#1B4B8F] bg-[#EEF3FA]/40 ring-1 ring-[#1B4B8F]'
                : error
                ? 'border-2 border-[#C23B22]/60 bg-white hover:bg-gray-50'
                : 'border-[#E2DDD5] bg-white hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              id={inputId}
              name={name}
              value={option.value}
              checked={isChecked}
              disabled={disabled}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={() => onChange(option.value)}
              className="mt-0.5 w-4 h-4 text-[#1B4B8F] border-gray-300 focus:ring-[#1B4B8F] shrink-0"
            />
            <div className="text-sm min-w-0">
              <span className="font-semibold text-[#1B1E22] block">{option.label}</span>
              {option.description && (
                <span className="text-xs text-[#575D65] block mt-0.5 leading-relaxed">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        );
      })}

      {error && (
        <div id={errorId} role="alert" aria-live="assertive" className="flex items-center gap-1.5 text-xs text-[#C23B22] font-semibold pt-1">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

