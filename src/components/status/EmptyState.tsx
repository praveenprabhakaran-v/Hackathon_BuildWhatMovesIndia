import React from 'react';
import { FileQuestion, SearchX, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  icon?: 'search' | 'inbox' | 'file';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Applications you submit will appear here.',
  actionLabel = 'File an RTI Application',
  onAction,
  actionHref,
  icon = 'file',
  className = '',
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'search':
        return SearchX;
      case 'inbox':
        return Inbox;
      case 'file':
      default:
        return FileQuestion;
    }
  };

  const Icon = getIcon();

  return (
    <div
      className={`border-2 border-dashed border-[#E2DDD5] bg-white rounded-xl p-8 sm:p-12 text-center max-w-lg mx-auto my-6 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[#EEF3FA] text-[#1B4B8F] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-[#1B1E22] mb-2">{title}</h3>
      <p className="text-sm text-[#575D65] leading-relaxed mb-6">{description}</p>
      {actionLabel && (
        <div>
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#1B4B8F] text-white text-sm font-medium rounded-lg hover:bg-[#123362] transition-colors focus:ring-4 focus:ring-[#1B4B8F]/20"
            >
              {actionLabel}
            </a>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#1B4B8F] text-white text-sm font-medium rounded-lg hover:bg-[#123362] transition-colors focus:ring-4 focus:ring-[#1B4B8F]/20"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
