import React from 'react';
import { AlertCircle } from 'lucide-react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  error,
  disabled = false,
  className = '',
}) => {
  const errorId = `${id}-error`;

  return (
    <div className={`space-y-1 w-full min-w-0 ${className}`}>
      <label
        htmlFor={id}
        className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer select-none transition-all ${
          checked
            ? 'border-[#1B4B8F] bg-[#EEF3FA]/30 ring-1 ring-[#1B4B8F]'
            : error
            ? 'border-2 border-[#C23B22] bg-[#FDEEED]/30'
            : 'border-[#E2DDD5] bg-white hover:bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 text-[#1B4B8F] rounded border-gray-300 focus:ring-[#1B4B8F] shrink-0"
        />
        <div className="text-sm min-w-0">
          <span className="font-medium text-[#1B1E22] block leading-snug">{label}</span>
          {description && (
            <span className="text-xs text-[#575D65] block mt-1 leading-relaxed">
              {description}
            </span>
          )}
        </div>
      </label>

      {error && (
        <div id={errorId} role="alert" aria-live="assertive" className="flex items-center gap-1.5 text-xs text-[#C23B22] font-semibold pt-0.5">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

