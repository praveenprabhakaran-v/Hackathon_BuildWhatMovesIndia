import React, { useState } from 'react';
import { FormSection } from '../../components/forms/FormSection';
import { RadioGroup } from '../../components/forms/RadioGroup';
import { AppealGround } from '../../types/rti';
import { useLanguage } from '../../lib/context/LanguageContext';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

interface AppealStep2EligibilityProps {
  initialGround?: AppealGround;
  onContinue: (ground: AppealGround) => void;
  onBack: () => void;
}

export const AppealStep2Eligibility: React.FC<AppealStep2EligibilityProps> = ({
  initialGround,
  onContinue,
  onBack,
}) => {
  const { t } = useLanguage();
  const [selectedGround, setSelectedGround] = useState<AppealGround | ''>(initialGround || '');
  const [error, setError] = useState<string | null>(null);

  const grounds = [
    {
      value: 'NO_RESPONSE_RECEIVED',
      label: t('appeal.ground.noResponse.label'),
      description: t('appeal.ground.noResponse.desc'),
    },
    {
      value: 'INCOMPLETE_INFORMATION',
      label: t('appeal.ground.incomplete.label'),
      description: t('appeal.ground.incomplete.desc'),
    },
    {
      value: 'INFORMATION_REFUSED',
      label: t('appeal.ground.refused.label'),
      description: t('appeal.ground.refused.desc'),
    },
    {
      value: 'MISLEADING_INFORMATION',
      label: t('appeal.ground.misleading.label'),
      description: t('appeal.ground.misleading.desc'),
    },
    {
      value: 'EXORBITANT_FEES_DEMANDED',
      label: t('appeal.ground.exorbitantFee.label'),
      description: t('appeal.ground.exorbitantFee.desc'),
    },
    {
      value: 'OTHER',
      label: t('appeal.ground.other.label'),
      description: t('appeal.ground.other.desc'),
    },
  ];

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGround) {
      setError(t('appeal.errSelectGround'));
      return;
    }
    onContinue(selectedGround as AppealGround);
  };

  return (
    <form onSubmit={handleProceed} className="space-y-6">
      <FormSection
        title={t('appeal.step2Title')}
        description={t('appeal.step2Desc')}
      >
        <RadioGroup
          name="appeal-ground"
          value={selectedGround}
          onChange={(val) => {
            setSelectedGround(val as AppealGround);
            setError(null);
          }}
          options={grounds}
        />

        {error && (
          <div role="alert" className="flex items-center gap-1 text-xs text-[#C23B22] font-semibold pt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}
      </FormSection>

      {/* Navigation buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-gray-700 bg-white border border-[#E2DDD5] rounded-xl hover:bg-gray-50 transition-colors whitespace-normal break-words"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>{t('btn.back')}</span>
        </button>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-[#1B4B8F] text-white text-sm font-semibold rounded-xl hover:bg-[#123362] transition-colors shadow-sm focus:ring-4 focus:ring-[#1B4B8F]/20 whitespace-normal break-words"
        >
          <span>{t('btn.continue')}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </form>
  );
};
