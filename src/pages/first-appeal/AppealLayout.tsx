import React from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { useLanguage } from '../../lib/context/LanguageContext';

interface AppealLayoutProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
  children: React.ReactNode;
}

export const AppealLayout: React.FC<AppealLayoutProps> = ({
  currentStep,
  totalSteps = 4,
  onStepClick,
  children,
}) => {
  const { t } = useLanguage();

  const APPEAL_STEPS = [
    t('appeal.step1'),
    t('appeal.step2'),
    t('appeal.step3'),
    t('appeal.step4'),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="no-print">
        <Breadcrumbs
          items={[
            { label: t('nav.firstAppeal'), onClick: () => onStepClick?.(1) },
            { label: `${t('step.stepNum', { current: currentStep, total: totalSteps })}: ${APPEAL_STEPS[currentStep - 1] || ''}`, current: true },
          ]}
        />
      </div>

      <div className="space-y-4 no-print px-1">
        <div>
          <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded inline-block whitespace-normal break-words">
            Form 2 — First Appeal under Section 19(1) of RTI Act
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B1E22] mt-1 font-display break-words">
            {t('appeal.title')}
          </h1>
          <p className="text-xs text-[#575D65] mt-1 leading-relaxed break-words">
            {t('appeal.subtitle')} <strong>{t('appeal.feeNotice')}</strong>
          </p>
        </div>

        {/* Appeal Progress Bar */}
        {currentStep <= 4 && (
          <div className="bg-white border border-[#E2DDD5] rounded-xl p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
              <span className="font-semibold text-[#1B4B8F] font-mono-code">
                {t('step.stepNum', { current: currentStep, total: totalSteps })}
              </span>
              <span className="text-[#575D65] font-medium break-words">
                {APPEAL_STEPS[currentStep - 1]}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#1B4B8F] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <main id="main-content" className="max-w-[720px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
