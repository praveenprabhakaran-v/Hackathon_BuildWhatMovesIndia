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
      label: 'No Response Received within 30 Days (Deemed Refusal)',
      description: 'The statutory 30-day timeline under Section 7(1) expired without any communication or order from the CPIO.',
    },
    {
      value: 'INCOMPLETE_INFORMATION',
      label: 'Incomplete or Partial Information Provided',
      description: 'The CPIO answered only a subset of questions or omitted key annexures/records requested.',
    },
    {
      value: 'INFORMATION_REFUSED',
      label: 'Information Unlawfully Refused / Rejected',
      description: 'The CPIO rejected the application incorrectly citing exemptions under Section 8 or Section 9.',
    },
    {
      value: 'MISLEADING_INFORMATION',
      label: 'Misleading, False, or Distorted Information',
      description: 'The information or data furnished is demonstrably inaccurate or contradicts official records.',
    },
    {
      value: 'EXORBITANT_FEES_DEMANDED',
      label: 'Unreasonable / Exorbitant Additional Fee Demanded',
      description: 'Additional fee demanded under Section 7(3) is calculated incorrectly or in violation of RTI Rules 2012.',
    },
    {
      value: 'OTHER',
      label: 'Other Grievance Against CPIO Order',
      description: 'Any other violation of citizen rights guaranteed under the RTI Act, 2005.',
    },
  ];

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGround) {
      setError('Please select the statutory ground for filing this First Appeal.');
      return;
    }
    onContinue(selectedGround as AppealGround);
  };

  return (
    <form onSubmit={handleProceed} className="space-y-6">
      <FormSection
        title="2. Statutory Ground for Appeal (Section 19(1))"
        description="Select the primary legal ground on which you are seeking appellate review before the First Appellate Authority."
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
