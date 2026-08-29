import React, { useState } from 'react';
import { FormSection } from '../../components/forms/FormSection';
import { Checkbox } from '../../components/forms/Checkbox';
import { Captcha } from '../../components/forms/Captcha';
import { RTIApplication, AppealGround, FirstAppealDraft, FirstAppealApplication } from '../../types/rti';
import { mockApi } from '../../lib/mockApi';
import { useLanguage } from '../../lib/context/LanguageContext';
import { ArrowLeft, ArrowRight, Building, User, Scale, FileText, CheckCircle2, RotateCw } from 'lucide-react';

interface AppealStep4ReviewProps {
  originalApp: RTIApplication;
  applicantEmail: string;
  ground: AppealGround;
  appealText: string;
  supportingDoc?: any;
  onSuccess: (appeal: FirstAppealApplication) => void;
  onBack: () => void;
}

export const AppealStep4Review: React.FC<AppealStep4ReviewProps> = ({
  originalApp,
  applicantEmail,
  ground,
  appealText,
  supportingDoc,
  onSuccess,
  onBack,
}) => {
  const { t } = useLanguage();
  const [certified, setCertified] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [certError, setCertError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groundLabels: Record<string, string> = {
    NO_RESPONSE_RECEIVED: t('appeal.ground.noResponse.label'),
    INCOMPLETE_INFORMATION: t('appeal.ground.incomplete.label'),
    INFORMATION_REFUSED: t('appeal.ground.refused.label'),
    MISLEADING_INFORMATION: t('appeal.ground.misleading.label'),
    EXORBITANT_FEES_DEMANDED: t('appeal.ground.exorbitantFee.label'),
    OTHER: t('appeal.ground.other.label'),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!certified) {
      setCertError(t('appeal.errCertify'));
      hasError = true;
    }
    if (!captchaVerified) {
      setCaptchaError(t('appeal.errCaptcha'));
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      const draft: FirstAppealDraft = {
        originalRegistrationNumber: originalApp.registrationNumber,
        applicantEmail,
        originalAuthority: originalApp.authority,
        ground,
        appealText,
        supportingDocuments: supportingDoc ? [supportingDoc] : [],
        guidelinesAcknowledged: true,
      };

      const res = await mockApi.submitFirstAppeal(draft);
      onSuccess(res);
    } catch (err: any) {
      alert(err.message || t('appeal.errSubmitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection
        title={t('appeal.step4Title')}
        description={t('appeal.step4Desc')}
      >
        {/* Zero Fee Banner */}
        <div className="bg-[#EAF6EE] border border-[#BCE2C9] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white text-[#1E7A46] flex items-center justify-center font-bold font-mono-code border border-[#BCE2C9] shrink-0">
              ₹0
            </div>
            <div>
              <div className="text-sm font-bold text-[#11502C] break-words">{t('appeal.zeroFeeTitle')}</div>
              <div className="text-xs text-[#1E7A46] break-words">{t('appeal.zeroFeeDesc')}</div>
            </div>
          </div>
          <span className="text-xs font-mono-code font-bold uppercase bg-white text-[#1E7A46] px-2.5 py-1 rounded border border-[#BCE2C9] shrink-0">
            {t('appeal.zeroFeeTag')}
          </span>
        </div>

        {/* Appellate Authority Card */}
        <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-[#1B1E22] flex items-center gap-2">
            <Building className="w-4 h-4 text-[#1B4B8F] shrink-0" />
            <span>{t('appeal.targetFaaHeader')}</span>
          </h4>
          <div className="text-xs space-y-1">
            <div className="font-semibold text-gray-900 text-sm break-words">{originalApp.authority.name}</div>
            <div className="text-gray-600 break-words">{originalApp.authority.ministry}</div>
            <div className="text-gray-500 pt-1 break-words">
              {t('appeal.faaDesignation', { authority: originalApp.authority.name })}
            </div>
          </div>
        </div>

        {/* Appeal Ground & Original Ref */}
        <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs space-y-3 text-xs">
          <h4 className="text-sm font-bold text-[#1B1E22] flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#1B4B8F] shrink-0" />
            <span>{t('appeal.statutoryGroundHeader')}</span>
          </h4>
          <div>
            <span className="text-gray-500 block">{t('appeal.origRegLabel')}</span>
            <span className="font-mono-code font-bold text-[#1B4B8F] text-sm break-all">{originalApp.registrationNumber}</span>
          </div>
          <div>
            <span className="text-gray-500 block">{t('appeal.selectedGroundLabel')}</span>
            <span className="font-semibold text-gray-900 break-words">{groundLabels[ground]}</span>
          </div>
          <div>
            <span className="text-gray-500 block">{t('appeal.applicantGrievanceLabel')}</span>
            <p className="bg-gray-50 p-3 rounded-lg text-gray-700 font-mono-code text-[11px] leading-relaxed whitespace-pre-wrap mt-1 break-words">
              {appealText}
            </p>
          </div>
        </div>

        {/* Statutory Certification */}
        <div className="pt-2">
          <Checkbox
            id="certify-appeal"
            checked={certified}
            onChange={(val) => {
              setCertified(val);
              if (val) setCertError(null);
            }}
            label={
              <span className="text-xs font-semibold text-[#1B1E22] leading-snug break-words">
                {t('appeal.certifyDeclaration')}
              </span>
            }
            error={certError || undefined}
          />
        </div>

        {/* Captcha */}
        <div className="pt-2">
          <Captcha
            onVerify={() => {
              setCaptchaVerified(true);
              setCaptchaError(null);
            }}
            error={captchaError || undefined}
          />
        </div>
      </FormSection>

      {/* Navigation Footer */}
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
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-7 py-3 min-h-[44px] bg-[#1B4B8F] text-white text-sm font-semibold rounded-xl hover:bg-[#123362] transition-colors shadow-sm focus:ring-4 focus:ring-[#1B4B8F]/20 disabled:opacity-50 whitespace-normal break-words"
        >
          {isSubmitting ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin shrink-0" />
              <span>{t('appeal.submittingAppeal')}</span>
            </>
          ) : (
            <>
              <span>{t('appeal.btnSubmitAppeal')}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
