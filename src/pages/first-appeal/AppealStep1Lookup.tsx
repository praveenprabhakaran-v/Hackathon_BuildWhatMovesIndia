import React, { useState } from 'react';
import { FormSection } from '../../components/forms/FormSection';
import { FormField } from '../../components/forms/FormField';
import { TextInput } from '../../components/forms/TextInput';
import { mockApi } from '../../lib/mockApi';
import { RTIApplication } from '../../types/rti';
import { EMAIL_REGEX } from '../../lib/validation';
import { useLanguage } from '../../lib/context/LanguageContext';
import { Search, ArrowRight, CheckCircle2, RotateCw } from 'lucide-react';

interface AppealStep1LookupProps {
  initialRegNo?: string;
  initialEmail?: string;
  onOriginalFound: (app: RTIApplication, email: string) => void;
}

export const AppealStep1Lookup: React.FC<AppealStep1LookupProps> = ({
  initialRegNo = '',
  initialEmail = '',
  onOriginalFound,
}) => {
  const { t } = useLanguage();
  const [regNo, setRegNo] = useState(initialRegNo);
  const [email, setEmail] = useState(initialEmail);
  const [errors, setErrors] = useState<{ regNo?: string; email?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [matchedApp, setMatchedApp] = useState<RTIApplication | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { regNo?: string; email?: string } = {};

    if (!regNo.trim()) {
      newErrors.regNo = t('appeal.errEnterReg');
    }
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      newErrors.email = t('appeal.errEnterEmail');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    setMatchedApp(null);

    try {
      const app = await mockApi.getApplicationByRegNo(regNo.trim());
      if (!app) {
        setErrors({ general: t('appeal.errNotFound', { regNo }) });
        return;
      }

      setMatchedApp(app);
    } catch (err: any) {
      setErrors({ general: err.message || t('appeal.errSearchFailed') });
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
      <form onSubmit={handleLookup}>
        <FormSection
          title={t('appeal.step1Title')}
          description={t('appeal.step1Desc')}
        >
          <FormField
            id="appeal-reg-no"
            label={t('appeal.origRegInput')}
            required
            error={errors.regNo}
            helperText={t('appeal.origRegHelper')}
          >
            <TextInput
              id="appeal-reg-no"
              value={regNo}
              onChange={(e) => {
                setRegNo(e.target.value);
                setMatchedApp(null);
              }}
              placeholder="e.g. DORF/R/E/26/00482"
              error={!!errors.regNo}
            />
          </FormField>

          <FormField
            id="appeal-email"
            label={t('appeal.emailInput')}
            required
            error={errors.email}
            helperText={t('appeal.emailHelper')}
          >
            <TextInput
              id="appeal-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMatchedApp(null);
              }}
              placeholder="demo.citizen@example.com"
              error={!!errors.email}
            />
          </FormField>

          {errors.general && (
            <div role="alert" className="p-3.5 bg-[#FDEEED] border border-[#C23B22]/30 rounded-xl text-xs text-[#C23B22] leading-relaxed break-words">
              {errors.general}
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
