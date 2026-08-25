import React from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { JourneyRail } from '../../components/navigation/JourneyRail';
import { useRTIDraft } from '../../lib/context/rti-draft';
import { useLanguage } from '../../lib/context/LanguageContext';
import { RotateCcw } from 'lucide-react';

interface FileRtiLayoutProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
  onNavigateHome: () => void;
  children: React.ReactNode;
}

export const FileRtiLayout: React.FC<FileRtiLayoutProps> = ({
  currentStep,
  totalSteps = 8,
  onStepClick,
  onNavigateHome,
  children,
}) => {
  const { resetDraft, isDraftEmpty } = useRTIDraft();
  const { t } = useLanguage();

  const RTI_STEPS = [
    { title: t('step.guidelines'), subtitle: t('step.guidelines.sub') },
    { title: t('step.authority'), subtitle: t('step.authority.sub') },
    { title: t('step.applicant'), subtitle: t('step.applicant.sub') },
    { title: t('step.bpl'), subtitle: t('step.bpl.sub') },
    { title: t('step.request'), subtitle: t('step.request.sub') },
    { title: t('step.documents'), subtitle: t('step.documents.sub') },
    { title: t('step.review'), subtitle: t('step.review.sub') },
    { title: t('step.payment'), subtitle: t('step.payment.sub') },
  ];

  const handleReset = () => {
    if (window.confirm(t('btn.discardDraft') + '?')) {
      resetDraft();
      onStepClick?.(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Breadcrumbs */}
      <div className="no-print">
        <Breadcrumbs
          items={[
            { label: t('nav.fileRti'), onClick: () => onStepClick?.(1) },
            { label: `${t('step.stepNum', { current: currentStep, total: totalSteps })}: ${RTI_STEPS[currentStep - 1]?.title || ''}`, current: true },
          ]}
        />
      </div>

      {/* Top Banner / Stepper Rail */}
      <div className="space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded inline-block whitespace-normal">
              Form 1 — RTI Request Filing (Section 6(1))
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1B1E22] mt-1 font-display break-words">
              {t('svc.fileRti.title')}
            </h1>
          </div>

          {!isDraftEmpty && currentStep < 9 && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-[#C23B22] hover:text-[#8A1F0C] font-semibold self-start sm:self-auto py-1 px-2.5 rounded border border-[#C23B22]/30 hover:bg-[#FDEEED] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('btn.discardDraft')}</span>
            </button>
          )}
        </div>

        {/* Stepper Rail Component */}
        {currentStep <= 8 && (
          <JourneyRail
            mode="stepper"
            currentStep={currentStep}
            totalSteps={totalSteps}
            steps={RTI_STEPS}
            onStepClick={onStepClick}
          />
        )}
      </div>

      {/* Form Content Body (720px max reading width as per spec §4) */}
      <main id="main-content" className="max-w-[720px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
