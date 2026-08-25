import React, { useState, useEffect } from 'react';
import { useRTIDraft } from '../../lib/context/rti-draft';
import { useLanguage } from '../../lib/context/LanguageContext';
import { FormSection } from '../../components/forms/FormSection';
import { FormField } from '../../components/forms/FormField';
import { SearchableSelect } from '../../components/forms/SearchableSelect';
import { mockApi } from '../../lib/mockApi';
import { Authority } from '../../types/rti';
import { ArrowRight, ArrowLeft, CheckCircle2, User, Clock, MapPin } from 'lucide-react';

interface Step2AuthorityProps {
  onContinue: () => void;
  onBack: () => void;
}

export const Step2Authority: React.FC<Step2AuthorityProps> = ({ onContinue, onBack }) => {
  const { draft, updateAuthority } = useRTIDraft();
  const { t } = useLanguage();
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [selected, setSelected] = useState<Authority | undefined>(draft.authority);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mockApi.searchAuthorities().then((res) => {
      setAuthorities(res.results);
      setIsLoading(false);
    });
  }, []);

  const handleSelect = (auth: Authority) => {
    setSelected(auth);
    setError(null);
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      setError(t('form.authority.errorSelect'));
      return;
    }
    updateAuthority(selected);
    onContinue();
  };

  return (
    <form onSubmit={handleProceed} className="space-y-6">
      <FormSection
        title={t('form.authority.title')}
        description={t('form.authority.desc')}
      >
        <FormField
          id="authority-select"
          label={t('form.authority.label')}
          required
          error={error || undefined}
          helperText={t('form.authority.helper')}
          helpTooltip="Under Section 5(1), every Public Authority designates Central Public Information Officers (CPIOs) to receive RTI requests."
          helpTitle="Public Authority Definition"
        >
          <SearchableSelect
            id="authority-select"
            authorities={authorities}
            selectedAuthority={selected}
            onSelect={handleSelect}
            error={error || undefined}
          />
        </FormField>

        {/* Selected Authority Confirmation Sub-card */}
        {selected && (
          <div className="bg-[#EEF3FA] border border-[#1B4B8F]/30 rounded-xl p-5 mt-4 space-y-3 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-white px-2 py-0.5 rounded border border-[#1B4B8F]/20 inline-block whitespace-normal">
                  {t('form.authority.confirmed', { code: selected.code })}
                </span>
                <h4 className="text-base font-bold text-[#1B1E22] mt-1 font-display break-words">
                  {selected.name}
                </h4>
                <p className="text-xs text-[#575D65] break-words">{selected.ministry}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#1E7A46] shrink-0" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#1B4B8F]/15 text-xs">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-[#1B4B8F] shrink-0 mt-0.5" />
                <div className="break-words">
                  <span className="font-semibold text-gray-800">{t('form.authority.cpio')}</span>
                  <div className="text-gray-600">{selected.cpioName}</div>
                  <div className="text-[11px] text-gray-500">{selected.cpioDesignation}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#1E7A46] shrink-0 mt-0.5" />
                <div className="break-words">
                  <span className="font-semibold text-gray-800">
                    {t('form.authority.turnaround', { days: selected.avgTurnaroundDays })}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1B4B8F]/10 flex items-center gap-1.5 text-[11px] text-[#575D65]">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="break-words truncate">{selected.address}</span>
            </div>
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
