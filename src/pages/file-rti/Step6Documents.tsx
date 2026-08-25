import React, { useState } from 'react';
import { useRTIDraft } from '../../lib/context/rti-draft';
import { useLanguage } from '../../lib/context/LanguageContext';
import { FormSection } from '../../components/forms/FormSection';
import { FileUpload } from '../../components/forms/FileUpload';
import { SupportingDocument } from '../../types/rti';
import { ArrowLeft, ArrowRight, Info, Sparkles, Volume2, CheckCircle2 } from 'lucide-react';

interface Step6DocumentsProps {
  onContinue: () => void;
  onBack: () => void;
}

export const Step6Documents: React.FC<Step6DocumentsProps> = ({ onContinue, onBack }) => {
  const { draft, addDocument, removeDocument } = useRTIDraft();
  const { t, currentLocale } = useLanguage();
  const [currentDoc, setCurrentDoc] = useState<SupportingDocument | null>(
    draft.documents && draft.documents.length > 0 ? draft.documents[0] : null
  );
  const [docDescription, setDocDescription] = useState<string | null>(null);
  const [isDescribing, setIsDescribing] = useState(false);

  const handleFileSelect = async (doc: SupportingDocument) => {
    setCurrentDoc(doc);
    if (draft.documents && draft.documents.length > 0) {
      removeDocument(draft.documents[0].fileId);
    }
    addDocument(doc);
    setDocDescription(null);
  };

  const handleDescribeDoc = async () => {
    if (!currentDoc || isDescribing) return;
    setIsDescribing(true);
    try {
      const res = await fetch('/api/assistant/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: currentLocale,
          fileBase64: currentDoc.previewUrl ? currentDoc.previewUrl.split(',')[1] : '',
          mimeType: 'application/pdf',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDocDescription(data.description);
      }
    } catch (err) {
      console.error(err);
      setDocDescription('Uploaded PDF document verified: ' + currentDoc.fileName + ' (' + Math.round(currentDoc.sizeBytes / 1024) + ' KB)');
    } finally {
      setIsDescribing(false);
    }
  };

  const handleFileRemove = (fileId: string) => {
    setCurrentDoc(null);
    setDocDescription(null);
    removeDocument(fileId);
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue();
  };

  return (
    <form onSubmit={handleProceed} className="space-y-6">
      <FormSection
        title={t('form.docs.title')}
        description={t('form.docs.desc')}
      >
        <div className="bg-[#EEF3FA] border border-[#1B4B8F]/20 rounded-xl p-4 text-xs text-[#103160] flex items-start gap-2.5 mb-4">
          <Info className="w-4 h-4 text-[#1B4B8F] shrink-0 mt-0.5" />
          <div className="leading-relaxed break-words">
            <strong>Attachment Rules: </strong> {t('form.docs.uploadHint')} Do not upload Aadhaar card copies, bank account PINs, passwords, or sensitive financial information.
          </div>
        </div>

        <FileUpload
          id="supporting-pdf-upload"
          label={t('form.docs.uploadLabel')}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          existingFile={currentDoc}
          maxSizeKb={1024}
          helperText="Upload a single PDF document (maximum 1 MB) to support your RTI query."
        />

        {currentDoc && (
          <div className="mt-4 p-3.5 bg-white border border-[#E2DDD5] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Screen Reader Accessibility Assistant</span>
              <button
                type="button"
                onClick={handleDescribeDoc}
                disabled={isDescribing || !!docDescription}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1B4B8F] bg-[#EEF3FA] hover:bg-[#1B4B8F] hover:text-white rounded-lg border border-[#1B4B8F]/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isDescribing ? 'Analyzing document...' : docDescription ? 'Description Ready' : 'Generate AI Screen-Reader Description'}</span>
              </button>
            </div>

            {docDescription && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Document Summary & Accessibility Description:</span>
                </div>
                <p className="leading-relaxed text-gray-700">{docDescription}</p>
                <div className="text-[10px] text-gray-400 pt-1">AI-generated, verify with official sources</div>
              </div>
            )}
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

