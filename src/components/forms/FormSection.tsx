import React, { useId } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  badge,
  children,
  className = '',
  id,
}) => {
  const generatedId = useId();
  const sectionId = id || `form-sec-${generatedId}`;
  const headingId = `${sectionId}-title`;

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      className={`bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-7 shadow-xs w-full min-w-0 ${className}`}
    >
      {/* Form Section Header */}
      <div className="w-full mb-6 pb-4 border-b border-[#E2DDD5]/80">
        <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
          <h2
            id={headingId}
            className="text-lg sm:text-xl font-bold text-[#1B1E22] font-display flex items-center gap-2 leading-snug"
          >
            {title}
          </h2>
          {badge && (
            <span className="text-xs font-mono-code font-semibold px-2.5 py-0.5 rounded-full bg-[#EEF3FA] text-[#1B4B8F] shrink-0">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-[#575D65] mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Form Section Body */}
      <div className="space-y-5 w-full min-w-0">{children}</div>
    </section>
  );
};

