import React, { useState, useRef } from 'react';
import { useRTIDraft } from '../../lib/context/rti-draft';
import { useLanguage } from '../../lib/context/LanguageContext';
import { FormSection } from '../../components/forms/FormSection';
import { FormField } from '../../components/forms/FormField';
import { CharacterCounter } from '../../components/forms/CharacterCounter';
import { VirtualKeyboardWrapper } from '../../components/accessibility/VirtualKeyboardWrapper';
import { validateRtiRequestText } from '../../lib/validation';
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';

interface Step5RequestProps {
  onContinue: () => void;
  onBack: () => void;
}

export const Step5Request: React.FC<Step5RequestProps> = ({ onContinue, onBack }) => {
  const { draft, updateRequest } = useRTIDraft();
  const { t } = useLanguage();
  const [text, setText] = useState(draft.request?.text || '');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sampleQueries = [
    'Kindly furnish certified copies of tender notices, committee meeting minutes, and vendor evaluation criteria for the digital procurement project in FY 2024-25.',
    'Please provide the total number of vacancies sanctioned, recruitment exams conducted, and pending appointment orders in Group A & B posts as on 31st July 2026.',
  ];

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateRtiRequestText(text);

    if (!result.isValid) {
      setError(result.errors.text);
      return;
    }

    updateRequest(result.data.text);
    onContinue();
  };

  return (
    <form onSubmit={handleProceed} className="space-y-6">
      <FormSection
        title={t('form.request.title')}
        description={t('form.request.desc')}
      >
        <FormField
          id="rti-request-text"
          label={t('form.request.textLabel')}
          required
          error={error || undefined}
          helpTooltip="Under Section 6(1), state the particulars of the information sought. You do not need to give any reasons for requesting the information."
          helpTitle="Section 6(1) Guidance"
          rightAction={
            <VirtualKeyboardWrapper
              value={text}
              onChange={(val) => {
                setText(val);
                if (error) setError(null);
              }}
              targetInputRef={textareaRef}
            />
          }
        >
          <div className="space-y-1">
            <textarea
              ref={textareaRef}
              id="rti-request-text"
              rows={8}
              value={text}
              maxLength={3000}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t('form.request.placeholder')}
              aria-invalid={error ? 'true' : undefined}
              className={`w-full p-3.5 text-base font-normal rounded-lg border leading-relaxed transition-all placeholder:text-gray-400 ${
                error
                  ? 'border-2 border-[#C23B22] focus:ring-2 focus:ring-[#C23B22]/20'
                  : 'border-[#E2DDD5] bg-white focus:border-[#1B4B8F] focus:ring-2 focus:ring-[#1B4B8F]/20'
              }`}
            />

            <CharacterCounter current={text.length} max={3000} min={10} />
          </div>
        </FormField>

        {/* Pro-Tips & Sample Questions */}
        <div className="bg-[#FEF8E7] border border-[#F4E3B5] rounded-xl p-4 text-xs text-[#7C4E0A] space-y-2.5">
          <div className="flex items-center gap-2 font-bold">
            <Lightbulb className="w-4 h-4 text-[#B7791F] shrink-0" />
            <span className="break-words">{t('form.request.tips')}</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 leading-relaxed text-[#1B1E22]/80">
            <li className="break-words">{t('form.request.tip1')}</li>
            <li className="break-words">{t('form.request.tip2')}</li>
            <li className="break-words">{t('form.request.charLimit')}</li>
          </ul>

          <div className="pt-2 border-t border-[#B7791F]/20 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[#7C4E0A]">Try Sample Query:</span>
            {sampleQueries.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setText(sample);
                  setError(null);
                }}
                className="text-[11px] bg-white border border-[#B7791F]/40 text-[#7C4E0A] px-2.5 py-1 rounded hover:bg-amber-50 transition-colors whitespace-normal break-words"
              >
                Insert Sample {idx + 1}
              </button>
            ))}
          </div>
        </div>
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
