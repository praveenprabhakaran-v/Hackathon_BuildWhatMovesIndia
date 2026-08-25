import React, { useState } from 'react';
import { useRTIDraft } from '../../lib/context/rti-draft';
import { useLanguage } from '../../lib/context/LanguageContext';
import { FormSection } from '../../components/forms/FormSection';
import { FormField } from '../../components/forms/FormField';
import { RadioGroup } from '../../components/forms/RadioGroup';
import { TextInput } from '../../components/forms/TextInput';
import { FileUpload } from '../../components/forms/FileUpload';
import { Notice } from '../../components/status/Notice';
import { validateBplDetails } from '../../lib/validation';
import { BplDetails, SupportingDocument } from '../../types/rti';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

interface Step4BplProps {
  onContinue: () => void;
  onBack: () => void;
}

export const Step4Bpl: React.FC<Step4BplProps> = ({ onContinue, onBack }) => {
  const { draft, updateBpl } = useRTIDraft();
  const { t } = useLanguage();

  const [isBpl, setIsBpl] = useState<boolean>(draft.bpl?.isBpl || false);
  const [cardNumber, setCardNumber] = useState(draft.bpl?.cardNumber || '');
  const [yearOfIssue, setYearOfIssue] = useState(draft.bpl?.yearOfIssue || '');
  const [issuingAuthority, setIssuingAuthority] = useState(draft.bpl?.issuingAuthority || '');
  const [bplDoc, setBplDoc] = useState<SupportingDocument | null>(
    draft.bpl?.docName
      ? {
          fileId: draft.bpl.docId || 'bpl_doc_existing',
          fileName: draft.bpl.docName,
          sizeKb: draft.bpl.docSizeKb || 350,
          uploadedAt: new Date().toISOString(),
        }
      : null
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();

    const data: BplDetails = {
      isBpl,
      cardNumber: isBpl ? cardNumber : undefined,
      yearOfIssue: isBpl ? yearOfIssue : undefined,
      issuingAuthority: isBpl ? issuingAuthority : undefined,
      docId: isBpl ? bplDoc?.fileId : undefined,
      docName: isBpl ? bplDoc?.fileName : undefined,
      docSizeKb: isBpl ? bplDoc?.sizeKb : undefined,
    };

    const result = validateBplDetails({
      isBpl,
      cardNumber,
      yearOfIssue,
      issuingAuthority,
      docName: bplDoc?.fileName,
    });

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    updateBpl(data);
    onContinue();
  };

  return (
    <form onSubmit={handleProceed} className="space-y-6">
      <FormSection
        title={t('form.bpl.title')}
        description={t('form.bpl.desc')}
      >
        {/* Radio selector for BPL */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-[#1B1E22] break-words">
            {t('form.bpl.question')} <span className="text-[#C23B22]">*</span>
          </label>
          <RadioGroup
            name="is-bpl-option"
            value={isBpl ? 'YES' : 'NO'}
            onChange={(val) => {
              const boolVal = val === 'YES';
              setIsBpl(boolVal);
              setErrors({});
            }}
            options={[
              {
                value: 'NO',
                label: t('form.bpl.no'),
                description: 'Standard statutory application fee of ₹10.00 applies.',
              },
              {
                value: 'YES',
                label: t('form.bpl.yes'),
                description: 'Zero application fee (₹0.00). Requires uploading a copy of your valid BPL card.',
              },
            ]}
          />
        </div>

        {/* Conditional BPL Form Card */}
        {isBpl && (
          <div className="bg-[#EAF6EE] border border-[#1E7A46]/30 rounded-xl p-5 space-y-4 transition-all">
            <div className="flex items-center gap-2 text-[#1E7A46] font-bold text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span className="break-words">{t('form.bpl.waiverNotice')}</span>
            </div>

            <FormField
              id="bpl-cardNumber"
              label={t('form.bpl.cardNo')}
              required
              error={errors.cardNumber}
              helperText="Enter the full alphanumeric number printed on your BPL / Rashan Card."
            >
              <TextInput
                id="bpl-cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="e.g. BPL/DL/2022/98472"
                error={!!errors.cardNumber}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="bpl-yearOfIssue"
                label={t('form.bpl.year')}
                required
                error={errors.yearOfIssue}
              >
                <TextInput
                  id="bpl-yearOfIssue"
                  maxLength={4}
                  value={yearOfIssue}
                  onChange={(e) => setYearOfIssue(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 2022"
                  error={!!errors.yearOfIssue}
                />
              </FormField>

              <FormField
                id="bpl-issuingAuthority"
                label={t('form.bpl.authority')}
                required
                error={errors.issuingAuthority}
              >
                <TextInput
                  id="bpl-issuingAuthority"
                  value={issuingAuthority}
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                  placeholder="e.g. Food & Civil Supplies Dept."
                  error={!!errors.issuingAuthority}
                />
              </FormField>
            </div>

            {/* Document Upload for Proof */}
            <div>
              <FileUpload
                id="bpl-doc-upload"
                label={t('form.bpl.proofLabel')}
                onFileSelect={(doc) => setBplDoc(doc)}
                onFileRemove={() => setBplDoc(null)}
                existingFile={bplDoc}
                maxSizeKb={2048}
                helperText="Upload a scanned PDF copy (maximum 2 MB) of your valid BPL card."
              />
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
