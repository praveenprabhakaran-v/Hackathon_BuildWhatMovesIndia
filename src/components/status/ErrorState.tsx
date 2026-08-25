import React from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while communicating with the RTI portal server. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`border border-[#F6C6BF] bg-[#FDEEED] rounded-xl p-6 sm:p-8 text-center max-w-lg mx-auto my-6 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-white text-[#C23B22] flex items-center justify-center mx-auto mb-4 shadow-xs">
        <AlertOctagon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-[#8A1F0C] mb-2">{title}</h3>
      <p className="text-sm text-[#575D65] leading-relaxed mb-6">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C23B22] text-white text-sm font-medium rounded-lg hover:bg-[#8A1F0C] transition-colors focus:ring-4 focus:ring-[#C23B22]/20"
        >
          <RotateCw className="w-4 h-4" aria-hidden="true" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
