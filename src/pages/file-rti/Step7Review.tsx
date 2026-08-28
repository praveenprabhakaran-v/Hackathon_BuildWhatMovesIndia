import React, { useState } from 'react';
import { useRTIDraft } from '../../lib/context/rti-draft';
import { useLanguage } from '../../lib/context/LanguageContext';
import { FormSection } from '../../components/forms/FormSection';
import { Captcha } from '../../components/forms/Captcha';
import { PaymentCard } from '../../components/payments/PaymentCard';
import { ArrowLeft, ArrowRight, Edit2, Building, User, FileText, CreditCard } from 'lucide-react';

interface Step7ReviewProps {
  onContinue: () => void;
  onBack: () => void;
  onEditStep: (step: number) => void;
}

export const Step7Review: React.FC<Step7ReviewProps> = ({ onContinue, onBack, onEditStep }) => {
  const { draft } = useRTIDraft();
  const { currentLocale, t } = useLanguage();
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const isBpl = !!draft.bpl?.isBpl;
  const feeAmount = isBpl ? 0 : 10;

  const getLocalizedName = () => {
    const auth = draft.authority;
    if (!auth) return 'Not selected';
    if (currentLocale === 'hi' && auth.name_hi) return auth.name_hi;
    if (currentLocale === 'bn' && auth.name_bn) return auth.name_bn;
    if (currentLocale === 'mr' && auth.name_mr) return auth.name_mr;
    if (currentLocale === 'te' && auth.name_te) return auth.name_te;
    if (currentLocale === 'ta' && auth.name_ta) return auth.name_ta;
    return auth.name_en || auth.name;
  };

  const getLocalizedMinistry = () => {
    const auth = draft.authority;
    if (!auth) return '';
    if (currentLocale === 'hi' && auth.ministry_hi) return auth.ministry_hi;
    if (currentLocale === 'bn' && auth.ministry_bn) return auth.ministry_bn;
    if (currentLocale === 'mr' && auth.ministry_mr) return auth.ministry_mr;
    if (currentLocale === 'te' && auth.ministry_te) return auth.ministry_te;
    if (currentLocale === 'ta' && auth.ministry_ta) return auth.ministry_ta;
    return auth.ministry_en || auth.ministry;
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified) {
      setCaptchaError('Please solve the captcha security verification before submitting.');
      return;
    }

    onContinue();
  };

  return (
    <form onSubmit={handleProceed} className="space-y-6">
      <FormSection
        title={t('form.review.title')}
        description={t('form.review.desc')}
      >
        {/* Section 1: Public Authority Summary */}
        <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
            <h4 className="text-sm font-bold text-[#1B1E22] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#1B4B8F]" />
              <span>{t('form.review.authoritySection')}</span>
            </h4>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="inline-flex items-center gap-1 text-xs text-[#1B4B8F] font-semibold hover:underline"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="text-xs space-y-1">
            <div className="font-semibold text-gray-900 text-sm break-words">{getLocalizedName()}</div>
            <div className="text-gray-600 break-words">{getLocalizedMinistry()} (Code: {draft.authority?.code})</div>
            <div className="text-gray-500 pt-1 break-words">CPIO: {draft.authority?.cpioName} ({draft.authority?.cpioDesignation})</div>
          </div>
        </div>

        {/* Section 2: Applicant Details Summary */}
        <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
            <h4 className="text-sm font-bold text-[#1B1E22] flex items-center gap-2">
              <User className="w-4 h-4 text-[#1B4B8F]" />
              <span>{t('form.review.applicantSection')}</span>
            </h4>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="inline-flex items-center gap-1 text-xs text-[#1B4B8F] font-semibold hover:underline"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500 block">{t('form.applicant.fullName')}:</span>
              <span className="font-semibold text-gray-900 break-words">{draft.applicant?.fullName}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{t('form.applicant.gender')}:</span>
              <span className="text-gray-900">{draft.applicant?.gender}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{t('form.applicant.email')}:</span>
              <span className="font-mono-code text-gray-900 break-words">{draft.applicant?.email}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{t('form.applicant.mobile')}:</span>
              <span className="font-mono-code text-gray-900">{draft.applicant?.mobile}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-500 block">{t('form.applicant.address1')}:</span>
              <span className="text-gray-900 break-words">
                {draft.applicant?.addressLine1}
                {draft.applicant?.addressLine2 ? `, ${draft.applicant.addressLine2}` : ''}
                {`, ${draft.applicant?.city}, ${draft.applicant?.state} - ${draft.applicant?.pincode}`}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: RTI Request Summary */}
        <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
            <h4 className="text-sm font-bold text-[#1B1E22] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1B4B8F]" />
              <span>{t('form.review.requestSection')}</span>
            </h4>
            <button
              type="button"
              onClick={() => onEditStep(5)}
              className="inline-flex items-center gap-1 text-xs text-[#1B4B8F] font-semibold hover:underline"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="text-xs space-y-3">
            <div className="p-3.5 bg-gray-50 rounded-lg text-[#1B1E22] leading-relaxed whitespace-pre-wrap font-mono-code text-[12px] break-words">
              {draft.request?.text}
            </div>

            {draft.documents && draft.documents.length > 0 && (
              <div className="text-xs text-gray-600 flex items-center gap-1.5">
                <span className="font-semibold">Attached PDF:</span>
                <span className="font-mono-code text-[#1B4B8F]">{draft.documents[0].fileName}</span>
                <span className="text-gray-400">({draft.documents[0].sizeKb} KB)</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Fee Structure */}
        <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-xs">
          <h4 className="text-sm font-bold text-[#1B1E22] flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-[#1B4B8F]" />
            <span>{t('form.review.feeSection')}</span>
          </h4>

          <PaymentCard
            amount={feeAmount}
            isBpl={isBpl}
            bplCardNumber={draft.bpl?.cardNumber}
          />
        </div>

        {/* Captcha Security Check */}
        <div className="pt-2">
          <Captcha
            onVerify={(token) => {
              setCaptchaVerified(true);
              setCaptchaToken(token);
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
          className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-[#1B4B8F] text-white text-sm font-semibold rounded-xl hover:bg-[#123362] transition-colors shadow-sm focus:ring-4 focus:ring-[#1B4B8F]/20 whitespace-normal break-words"
        >
          <span>{isBpl ? t('btn.submitRti') : t('btn.proceedPayment')}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </form>
  );
};
