import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormSection } from '../../components/forms/FormSection';
import { FormField } from '../../components/forms/FormField';
import { TextInput } from '../../components/forms/TextInput';
import { mockApi } from '../../lib/mockApi';
import { RTIApplication } from '../../types/rti';
import { EMAIL_REGEX } from '../../lib/validation';
import { useLanguage } from '../../lib/context/LanguageContext';
import { Search, ArrowRight, CheckCircle2, RotateCw, Wand2 } from 'lucide-react';

interface AppealStep1LookupProps {
  initialRegNo?: string;
  initialEmail?: string;
  onOriginalFound: (app: RTIApplication, email: string) => void;
}

interface AppealLookupFormData {
  registrationNumber: string;
  email: string;
}

export const AppealStep1Lookup: React.FC<AppealStep1LookupProps> = ({
  initialRegNo = '',
  initialEmail = '',
  onOriginalFound,
}) => {
  const { t } = useLanguage();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [matchedApp, setMatchedApp] = useState<RTIApplication | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppealLookupFormData>({
    defaultValues: {
      registrationNumber: initialRegNo,
      email: initialEmail,
    },
  });

  const registrationNumber = watch('registrationNumber');
  const email = watch('email');

  const handleAutoFill = () => {
    setValue('registrationNumber', 'DORF/R/E/26/00482', {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue('email', 'demo.citizen@example.com', {
      shouldValidate: true,
      shouldDirty: true,
    });
    setGeneralError(null);
    setMatchedApp(null);
  };

  const executeLookup = async (data: AppealLookupFormData) => {
    setGeneralError(null);
    setIsLoading(true);
    setMatchedApp(null);

    try {
      const app = await mockApi.getApplicationByRegNo(data.registrationNumber.trim());
      if (!app) {
        setGeneralError(t('appeal.errNotFound', { regNo: data.registrationNumber }));
        return;
      }

      setMatchedApp(app);
    } catch (err: any) {
      setGeneralError(err.message || t('appeal.errSearchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (matchedApp) {
      onOriginalFound(matchedApp, email.trim());
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(executeLookup)}>
        <FormSection
          title={t('appeal.step1Title')}
          description={t('appeal.step1Desc')}
        >
          {/* Quick Auto-fill Action */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Quick Test Credentials</span>
            <button
              type="button"
              onClick={handleAutoFill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1B4B8F] bg-[#EEF3FA] hover:bg-[#1B4B8F] hover:text-white border border-[#1B4B8F]/30 rounded-lg transition-all cursor-pointer shadow-2xs"
            >
              <Wand2 className="w-3.5 h-3.5 shrink-0" />
              <span>Auto-fill Test Data</span>
            </button>
          </div>

          <FormField
            id="appeal-reg-no"
            label={t('appeal.origRegInput')}
            required
            error={errors.registrationNumber?.message}
            helperText={t('appeal.origRegHelper')}
          >
            <TextInput
              id="appeal-reg-no"
              value={registrationNumber}
              {...register('registrationNumber', {
                required: t('appeal.errEnterReg') || 'Please enter original Registration Number',
              })}
              onChange={(e) => {
                setValue('registrationNumber', e.target.value, { shouldValidate: true });
                setMatchedApp(null);
              }}
              placeholder="e.g. DORF/R/E/26/00482"
              error={!!errors.registrationNumber}
            />
          </FormField>

          <FormField
            id="appeal-email"
            label={t('appeal.emailInput')}
            required
            error={errors.email?.message}
            helperText={t('appeal.emailHelper')}
          >
            <TextInput
              id="appeal-email"
              type="email"
              value={email}
              {...register('email', {
                required: t('appeal.errEnterEmail') || 'Please enter applicant email',
                pattern: {
                  value: EMAIL_REGEX,
                  message: t('appeal.errEnterEmail') || 'Please enter a valid email address',
                },
              })}
              onChange={(e) => {
                setValue('email', e.target.value, { shouldValidate: true });
                setMatchedApp(null);
              }}
              placeholder="demo.citizen@example.com"
              error={!!errors.email}
            />
          </FormField>

          {generalError && (
            <div role="alert" className="p-3.5 bg-[#FDEEED] border border-[#C23B22]/30 rounded-xl text-xs text-[#C23B22] leading-relaxed break-words">
              {generalError}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] bg-[#1B4B8F] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#123362] transition-colors disabled:opacity-50 whitespace-normal break-words cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>{t('appeal.searchingOrig')}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 shrink-0" />
                  <span>{t('appeal.btnSearchOrig')}</span>
                </>
              )}
            </button>
          </div>
        </FormSection>
      </form>

      {/* Matched Application Preview */}
      {matchedApp && (
        <div className="bg-[#EAF6EE] border-2 border-[#1E7A46] rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1E7A46] bg-white px-2.5 py-0.5 rounded border border-[#1E7A46]/30 inline-block whitespace-normal">
                {t('appeal.origVerified')}
              </span>
              <h3 className="text-base font-bold text-[#11502C] mt-1 font-display break-words">
                {matchedApp.authority.name}
              </h3>
              <p className="text-xs text-[#1E7A46] break-words">{matchedApp.authority.ministry}</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-[#1E7A46] shrink-0" />
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#BCE2C9] text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
              <span className="text-gray-500 font-mono-code">{t('appeal.regNo')} <strong>{matchedApp.registrationNumber}</strong></span>
              <span className="text-gray-500 font-mono-code">{t('appeal.filed')} <strong>{new Date(matchedApp.filedOn).toLocaleDateString('en-IN')}</strong></span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">{t('appeal.origRequestText')}</span>
              <p className="text-gray-700 bg-gray-50 p-2.5 rounded text-[11px] font-mono-code leading-relaxed break-words">
                {matchedApp.requestText}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleProceed}
              className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-[#1E7A46] text-white text-sm font-semibold rounded-xl hover:bg-[#155a33] transition-colors shadow-xs whitespace-normal break-words cursor-pointer"
            >
              <span>{t('btn.continue')}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
