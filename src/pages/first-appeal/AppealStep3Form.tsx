import React, { useState } from 'react';
import { FormSection } from '../../components/forms/FormSection';
import { FormField } from '../../components/forms/FormField';
import { CharacterCounter } from '../../components/forms/CharacterCounter';
import { FileUpload } from '../../components/forms/FileUpload';
import { SupportingDocument } from '../../types/rti';
import { useLanguage } from '../../lib/context/LanguageContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface AppealStep3FormProps {
  initialText?: string;
  initialDoc?: SupportingDocument | null;
  onContinue: (text: string, doc?: SupportingDocument | null) => void;
  onBack: () => void;
}

export const AppealStep3Form: React.FC<AppealStep3FormProps> = ({
  initialText = '',
  initialDoc = null,
  onContinue,
  onBack,
}) => {
  const { t } = useLanguage();
  const [appealText, setAppealText] = useState(initialText);
  const [supportingDoc, setSupportingDoc] = useState<SupportingDocument | null>(initialDoc);
  const [error, setError] = useState<string | null>(null);

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealText.trim() || appealText.trim().length < 15) {
      setError('Please provide a detailed statement of grievance for the First Appellate Authority (min 15 characters).');
      return;
    }
    if (appealText.trim().length > 4000) {
      setError('Appeal statement exceeds the maximum limit of 4,000 characters.');
      return;
    }

    onContinue(appealText.trim(), supportingDoc);
  };

  return (
    <form onSubmit={handleProceed} className="space-y-6">
      <FormSection
        title="3. Appeal Grievance & Statement of Facts"
        description="Provide a clear factual summary explaining why the CPIO's reply or lack of response is unsatisfactory and what specific relief is sought from the First Appellate Authority."
      >
        <FormField
          id="appeal-grievance-text"
          label="Detailed Grounds / Prayer for Relief before FAA"
          required
          error={error || undefined}
          helperText="State specific points from your original RTI query that remain unanswered or unlawfully denied."
        >
          <div className="space-y-1">
            <textarea
              id="appeal-grievance-text"
              rows={8}
              value={appealText}
              maxLength={4000}
              onChange={(e) => {
                setAppealText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. The CPIO in order dated 15-July-2026 rejected Point 2 citing Section 8(1)(d), without demonstrating any commercial confidence or competitive harm. As substantial public interest is involved, I pray that the FAA set aside the CPIO order and direct disclosure..."
              className={`w-full p-3.5 text-base rounded-lg border leading-relaxed transition-all placeholder:text-gray-400 ${
                error
                  ? 'border-2 border-[#C23B22] focus:ring-2 focus:ring-[#C23B22]/20'
                  : 'border-[#E2DDD5] bg-white focus:border-[#1B4B8F] focus:ring-2 focus:ring-[#1B4B8F]/20'
              }`}
            />
            <CharacterCounter current={appealText.length} max={4000} min={15} />
          </div>
        </FormField>

        {/* Optional Document Upload */}
        <div className="pt-2">
          <label className="block text-sm font-medium text-[#1B1E22] mb-1.5 break-words">
            Supporting Document / CPIO Order Copy (Optional PDF)
          </label>
          <FileUpload
            id="appeal-doc-upload"
            onFileSelect={(doc) => setSupportingDoc(doc)}
            onFileRemove={() => setSupportingDoc(null)}
            existingFile={supportingDoc}
            maxSizeKb={1024}
            helperText="You may upload a copy of the CPIO's written communication or additional evidence (PDF max 1 MB)."
          />
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
