import React from 'react';
import { AlertCircle } from 'lucide-react';
import { HelpTooltip } from '../accessibility/HelpTooltip';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  helpTooltip?: string;
  helpTitle?: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  error,
  helperText,
  helpTooltip,
  helpTitle,
  rightAction,
  children,
  className = '',
  disabled = false,
}) => {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  // Compute aria-describedby IDs
  const describedBy = [
    error ? errorId : null,
    helperText ? helperId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`w-full max-w-[640px] space-y-1.5 ${disabled ? 'opacity-60' : ''} ${className}`}>
      {/* Persistently visible Label tied to input id */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label
          htmlFor={id}
          id={`${id}-label`}
          className="block text-sm font-medium text-[#1B1E22] select-none"
        >
          <span>{label}</span>
          {required && (
            <span className="text-[#C23B22] font-bold ml-1" title="Required field" aria-hidden="true">
              *
            </span>
          )}
          {helpTooltip && (
            <HelpTooltip content={helpTooltip} title={helpTitle} term={label} />
          )}
        </label>
        {rightAction && <div className="shrink-0">{rightAction}</div>}
        {required && <span className="sr-only">(required)</span>}
      </div>

      {/* Input Slot with augmented accessibility */}
      <div className="relative">
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              id: (children.props as any)?.id || id,
              'aria-describedby': (children.props as any)?.['aria-describedby'] || describedBy,
              'aria-invalid': error ? 'true' : (children.props as any)?.['aria-invalid'],
              'aria-errormessage': error ? errorId : undefined,
            })
          : children}
      </div>

      {/* Field-scoped Error with aria-live="assertive" */}
      {error ? (
        <div
          id={errorId}
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-1.5 text-xs text-[#C23B22] font-semibold pt-0.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-[#575D65] pt-0.5 leading-normal">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

