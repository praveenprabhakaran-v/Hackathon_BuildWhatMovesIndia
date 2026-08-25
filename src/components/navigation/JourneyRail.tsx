import React from 'react';
import { Check, Circle, Clock, FileText, CreditCard, Send, Search, CheckCircle2, Scale, AlertTriangle, ArrowRight } from 'lucide-react';
import { ApplicationStatus, TimelineEvent } from '../../types/rti';
import { useLanguage } from '../../lib/context/LanguageContext';

export type JourneyMode = 'explainer' | 'stepper' | 'timeline';

interface JourneyRailProps {
  mode: JourneyMode;
  currentStep?: number; // 1-8 for stepper
  totalSteps?: number;
  steps?: { title: string; subtitle?: string; completed?: boolean }[];
  timelineEvents?: TimelineEvent[];
  currentStatus?: ApplicationStatus;
  className?: string;
  onStepClick?: (stepIndex: number) => void;
}

export const JourneyRail: React.FC<JourneyRailProps> = ({
  mode,
  currentStep = 1,
  totalSteps = 8,
  steps = [],
  timelineEvents = [],
  currentStatus,
  className = '',
  onStepClick,
}) => {
  const { t } = useLanguage();

  const explainerStages = [
    {
      num: 1,
      title: t('svc.fileRti.title'),
      description: t('svc.fileRti.desc'),
      icon: FileText,
    },
    {
      num: 2,
      title: t('step.payment'),
      description: t('form.guidelines.point2Desc'),
      icon: CreditCard,
    },
    {
      num: 3,
      title: t('step.success'),
      description: t('form.success.desc'),
      icon: Send,
    },
    {
      num: 4,
      title: t('status.UNDER_PROCESSING'),
      description: t('form.guidelines.point3Desc'),
      icon: Search,
    },
    {
      num: 5,
      title: t('status.RESPONSE_AVAILABLE'),
      description: t('journey.responseAvailableDesc'),
      icon: CheckCircle2,
    },
    {
      num: 6,
      title: t('nav.firstAppeal'),
      description: t('svc.appeal.desc'),
      icon: Scale,
    },
  ];

  // 1. EXPLAINER MODE (Homepage / Guidelines)
  if (mode === 'explainer') {
    return (
      <div className={`w-full py-4 ${className}`}>
        <div className="text-center mb-8 px-2">
          <span className="text-xs font-bold font-mono-code uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-3 py-1 rounded-full inline-block whitespace-normal break-words">
            {t('hero.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B1E22] mt-2 font-display break-words">
            {t('journey.title')}
          </h2>
          <p className="text-sm text-[#575D65] max-w-xl mx-auto mt-2 break-words leading-relaxed">
            {t('journey.subtitle')}
          </p>
        </div>

        {/* Rail Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch relative">
          {explainerStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isLast = idx === explainerStages.length - 1;

            return (
              <div
                key={stage.num}
                className="bg-white rounded-xl p-4 border border-[#E2DDD5] shadow-xs flex flex-col h-full relative transition-transform hover:-translate-y-1 min-w-0"
              >
                {/* Connecting arrow for desktop */}
                {!isLast && (
                  <div className="hidden lg:block absolute -right-3 top-8 z-10 text-gray-300 pointer-events-none">
                    <ArrowRight className="w-5 h-5 text-gray-300" aria-hidden="true" />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3 shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF3FA] text-[#1B4B8F] flex items-center justify-center font-bold text-sm font-mono-code shrink-0">
                    0{stage.num}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#F6F4EF] text-[#1B1E22] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#1B4B8F]" aria-hidden="true" />
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-[#1B1E22] mb-1 font-display break-words shrink-0">
                  {stage.title}
                </h3>
                <p className="text-xs text-[#575D65] leading-[1.6] flex-1 break-words mt-1 mb-2">
                  {stage.description}
                </p>
                <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono-code text-[#1B4B8F] font-semibold shrink-0">
                  <span>Stage 0{stage.num}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. STEPPER MODE (Multi-step Form)
  if (mode === 'stepper') {
    const progressPercent = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

    return (
      <div className={`w-full ${className}`}>
        {/* Mobile View: Condensed Step Indicator (< 768px) */}
        <div className="block md:hidden bg-white border border-[#E2DDD5] rounded-lg p-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs mb-1.5">
            <span className="font-semibold text-[#1B4B8F] font-mono-code whitespace-nowrap">
              {t('step.stepNum', { current: currentStep, total: totalSteps }) || `Step ${currentStep} of ${totalSteps}`}
            </span>
            <span className="text-[#575D65] truncate font-medium max-w-[200px]">
              {steps[currentStep - 1]?.title || `Step ${currentStep}`}
            </span>
            <span className="text-xs font-mono-code text-[#575D65] shrink-0">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#E07A2C] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
            ></div>
          </div>
        </div>

        {/* Tablet & Desktop View (>= 768px): Full Horizontal Journey Rail */}
        <div className="hidden md:block bg-white border border-[#E2DDD5] rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="relative flex items-center justify-between">
            {/* Connecting Track Line */}
            <div
              className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#E2DDD5] -z-0"
              aria-hidden="true"
            />

            {steps.map((step, idx) => {
              const stepNumber = idx + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              const isClickable = onStepClick && isCompleted;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center relative z-10 group min-w-0"
                  style={{ width: `${100 / steps.length}%` }}
                >
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && onStepClick(stepNumber)}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`Step ${stepNumber}: ${step.title}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                    className={`flex items-center justify-center rounded-full transition-all select-none shrink-0 ${
                      isCompleted
                        ? 'w-8 h-8 bg-[#1E7A46] text-white shadow-xs hover:ring-2 hover:ring-[#1E7A46]/40 cursor-pointer'
                        : isCurrent
                        ? 'w-10 h-10 bg-[#E07A2C] text-white shadow-md ring-4 ring-[#E07A2C]/25 ring-offset-2 ring-offset-white font-bold'
                        : 'w-8 h-8 bg-white border-2 border-gray-300 text-[#1B1E22]/40 font-medium'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                    ) : (
                      <span className="text-xs font-mono-code">{stepNumber}</span>
                    )}
                  </button>

                  <div className="mt-2 text-center w-full px-0.5 min-w-0">
                    <p
                      className={`text-[11px] sm:text-xs font-medium leading-snug break-words whitespace-normal ${
                        isCurrent
                          ? 'text-[#1B1E22] font-bold'
                          : isCompleted
                          ? 'text-[#1E7A46]'
                          : 'text-[#1B1E22]/50'
                      }`}
                      title={step.title}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. TIMELINE MODE (Vertical timeline on Track page)
  if (mode === 'timeline') {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-base font-bold text-[#1B1E22] font-display flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#1B4B8F]" aria-hidden="true" />
          <span>{t('track.timelineTitle')}</span>
        </h3>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2DDD5]">
          {timelineEvents.map((event, idx) => {
            const isLatest = idx === timelineEvents.length - 1;
            const eventDate = new Date(event.at);
            const formattedDate = eventDate.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const formattedTime = eventDate.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={idx} className="relative group">
                {/* Node marker */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 flex items-center justify-center rounded-full z-10 transition-all ${
                    isLatest
                      ? 'w-6 h-6 -translate-x-[9px] bg-[#E07A2C] text-white ring-4 ring-[#E07A2C]/20 shadow-xs'
                      : 'w-5 h-5 -translate-x-[7px] bg-[#1E7A46] text-white'
                  }`}
                  aria-hidden="true"
                >
                  {isLatest ? (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  ) : (
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  )}
                </div>

                <div className="bg-white border border-[#E2DDD5] rounded-xl p-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-[#1B1E22] font-display break-words">
                      {event.title}
                    </h4>
                    <span className="text-xs font-mono-code text-[#575D65] shrink-0">
                      {formattedDate} · {formattedTime}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-xs text-[#575D65] leading-relaxed break-words mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
