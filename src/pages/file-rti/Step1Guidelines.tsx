import React, { useState } from 'react';
import { useRTIDraft } from '../../lib/context/rti-draft';
import { useLanguage } from '../../lib/context/LanguageContext';
import { FormSection } from '../../components/forms/FormSection';
import { Checkbox } from '../../components/forms/Checkbox';
import { Notice } from '../../components/status/Notice';
import { ArrowRight } from 'lucide-react';

interface Step1GuidelinesProps {
  onContinue: () => void;
}

export const Step1Guidelines: React.FC<Step1GuidelinesProps> = ({ onContinue }) => {
  const { draft, setGuidelinesAcknowledged } = useRTIDraft();
  const { t } = useLanguage();
  const [acknowledged, setAcknowledged] = useState(draft.guidelinesAcknowledged);
  const [error, setError] = useState<string | null>(null);

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acknowledged) {
      setError(t('form.guidelines.errorAgree'));
      return;
    }
    setGuidelinesAcknowledged(true);
    setError(null);
    onContinue();
  };

  return (
    <form onSubmit={handleProceed} className="space-y-6">
      <FormSection
        title={t('form.guidelines.title')}
        description={t('form.guidelines.desc')}
      >
        {/* Central Government Warning Notice */}
        <Notice variant="warning" title={t('form.guidelines.warningTitle')}>
          <p className="text-xs break-words leading-relaxed">
            {t('form.guidelines.warningText')}
          </p>
        </Notice>

        {/* Guidelines List */}
        <div className="bg-[#F6F4EF]/70 border border-[#E2DDD5] rounded-xl p-5 text-xs text-[#1B1E22] space-y-3.5 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1B4B8F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <div className="break-words">
              <strong className="font-semibold text-gray-900">{t('form.guidelines.point1Title')} </strong>
              <span>{t('form.guidelines.point1Desc')}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1B4B8F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <div className="break-words">
              <strong className="font-semibold text-gray-900">{t('form.guidelines.point2Title')} </strong>
              <span>{t('form.guidelines.point2Desc')}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1B4B8F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              3
            </span>
            <div className="break-words">
              <strong className="font-semibold text-gray-900">{t('form.guidelines.point3Title')} </strong>
              <span>{t('form.guidelines.point3Desc')}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1B4B8F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              4
            </span>
            <div className="break-words">
              <strong className="font-semibold text-gray-900">{t('form.guidelines.point4Title')} </strong>
              <span>{t('form.guidelines.point4Desc')}</span>
            </div>
          </div>
        </div>

        {/* Checkbox Acknowledgment */}
        <div className="pt-2">
          <Checkbox
            id="acknowledge-guidelines"
            checked={acknowledged}
            onChange={(val) => {
              setAcknowledged(val);
              if (val) setError(null);
            }}
            label={
              <span className="font-semibold text-sm text-[#1B1E22] break-words">
                {t('form.guidelines.agree')}
              </span>
            }
            error={error || undefined}
          />
        </div>
      </FormSection>

      {/* Navigation Footer */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-[#1B4B8F] text-white text-sm font-semibold rounded-xl hover:bg-[#123362] transition-colors shadow-sm focus:ring-4 focus:ring-[#1B4B8F]/20 whitespace-normal break-words"
        >
          <span>{t('btn.continue')}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </form>
  );
};
