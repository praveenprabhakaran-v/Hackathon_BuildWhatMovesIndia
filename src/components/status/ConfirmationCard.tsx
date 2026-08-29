import React, { useState } from 'react';
import { Download, Printer, ArrowRight, Building, User, Check } from 'lucide-react';
import { RegistrationSeal } from './RegistrationSeal';
import { RTIApplication, FirstAppealApplication } from '../../types/rti';
import { generateRtiReceiptPdf } from '../../lib/pdfGenerator';
import { printReceipt } from '../../lib/receiptPrinter';
import { useLanguage } from '../../lib/context/LanguageContext';

interface ConfirmationCardProps {
  application?: RTIApplication;
  appeal?: FirstAppealApplication;
  onTrack: (regNo: string) => void;
  onFileAnother: () => void;
  className?: string;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  application,
  appeal,
  onTrack,
  onFileAnother,
  className = '',
}) => {
  const { t } = useLanguage();
  const [downloaded, setDownloaded] = useState(false);
  const isAppeal = !!appeal;
  const target = appeal || application;
  const regNo = isAppeal ? appeal!.appealRegistrationNumber : application!.registrationNumber;
  const auth = isAppeal ? appeal!.authority : application!.authority;
  const applicant = isAppeal ? appeal!.applicant : application!.applicant;
  const filedDateStr = isAppeal ? appeal!.filedOn : application!.filedOn;

  const filedFormatted = new Date(filedDateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    if (target) {
      printReceipt(target);
    } else {
      window.print();
    }
  };

  const handleDownloadPdf = () => {
    if (target) {
      generateRtiReceiptPdf(target);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Official Acknowledgment Slip Card */}
      <div id="rti-printable-receipt" className="bg-white border-2 border-[#1B4B8F]/30 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-gray-100 pb-6 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#EAF6EE] text-[#1E7A46] border border-[#1E7A46]/30 inline-block whitespace-normal">
                {t('form.success.receiptBadge')}
              </span>
              <span className="text-xs text-gray-400">· RTI Act, 2005</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B1E22] font-display break-words">
              {isAppeal ? t('appeal.successTitle') : t('form.success.title')}
            </h2>
            <p className="text-xs text-[#575D65] mt-1 break-words">
              {t('form.success.desc')}
            </p>
          </div>

          {/* Registration Seal (Signature Element) */}
          <div className="self-center sm:self-auto shrink-0">
            <RegistrationSeal
              registrationNumber={regNo}
              authorityCode={auth?.code}
              timestamp={filedDateStr}
              size="md"
            />
          </div>
        </div>

        {/* Primary Highlight Box for Registration Number */}
        <div className="bg-[#EEF3FA] border border-[#1B4B8F]/30 rounded-xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-[#1B4B8F] font-bold uppercase tracking-wider block">
              {isAppeal ? (t('track.appealRegistrationNumber') || 'Appeal Registration Number') : t('form.success.regNum')}
            </span>
            <span className="text-2xl sm:text-3xl font-mono-code font-bold text-[#1B4B8F] select-all break-all">
              {regNo}
            </span>
            <p className="text-[11px] text-[#575D65] mt-0.5 break-words">
              {t('form.success.quoteHint')}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-gray-500 block font-mono-code">{t('track.filingTimestamp') || 'Filing Timestamp'}</span>
            <span className="text-xs font-mono-code font-semibold text-gray-900">{filedFormatted}</span>
          </div>
        </div>

        {/* Two Column Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
          {/* Public Authority Info */}
          <div className="bg-[#F6F4EF]/60 rounded-xl p-4 border border-[#E2DDD5] space-y-2">
            <div className="font-bold text-[#1B1E22] text-sm flex items-center gap-1.5 pb-1 border-b border-gray-200">
              <Building className="w-4 h-4 text-[#1B4B8F] shrink-0" />
              <span>{t('form.review.authoritySection')}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{t('track.ministry')}</span>
              <span className="font-semibold text-gray-900 break-words">{auth?.ministry}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{t('track.authority')}</span>
              <span className="font-semibold text-gray-900 break-words">{auth?.name}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{t('track.assignedCpio')}</span>
              <span className="text-gray-900 break-words">{auth?.cpioName} ({auth?.cpioDesignation})</span>
            </div>
            <div>
              <span className="text-gray-500 block">{t('track.turnaroundSla') || 'Turnaround SLA:'}</span>
              <span className="text-[#1E7A46] font-semibold">{t('track.slaDuration') || '30 Calendar Days (Statutory)'}</span>
            </div>
          </div>

          {/* Applicant & Payment Info */}
          <div className="bg-[#F6F4EF]/60 rounded-xl p-4 border border-[#E2DDD5] space-y-2">
            <div className="font-bold text-[#1B1E22] text-sm flex items-center gap-1.5 pb-1 border-b border-gray-200">
              <User className="w-4 h-4 text-[#1B4B8F] shrink-0" />
              <span>{t('form.review.applicantSection')} & {t('form.review.feeSection')}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{t('form.applicant.fullName')}:</span>
              <span className="font-semibold text-gray-900 break-words">{applicant?.fullName}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{t('form.applicant.email')} & {t('form.applicant.mobile')}:</span>
              <span className="text-gray-900 break-all">{applicant?.email} · {applicant?.mobile}</span>
            </div>
            <div>
              <span className="text-gray-500 block">{t('track.feeStatus')}</span>
              <span className="font-mono-code font-semibold text-gray-900">
                {isAppeal
                  ? t('appeal.zeroFeeTitle')
                  : application?.isBplExempt
                  ? t('track.feeWaivedBpl')
                  : `₹${application?.applicationFee || 10}.00 (${application?.paymentMethod || 'Paid'})`}
              </span>
            </div>
            {application?.paymentRef && (
              <div>
                <span className="text-gray-500 block">{t('track.txRef') || 'Transaction Reference:'}</span>
                <span className="font-mono-code text-gray-700">{application.paymentRef}</span>
              </div>
            )}
          </div>
        </div>

        {/* Query Extract */}
        <div className="border-t border-gray-200 pt-4 text-xs">
          <span className="font-bold text-[#1B1E22] block mb-1">{t('track.rtiQueryOnRecord')}</span>
          <p className="bg-[#F6F4EF]/80 p-3 rounded-lg text-gray-700 leading-relaxed font-mono-code text-[11px] whitespace-pre-wrap break-words">
            {isAppeal ? appeal?.appealText : application?.requestText}
          </p>
        </div>
      </div>

      {/* Action Bar (No-Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print bg-white p-4 sm:p-5 rounded-xl border border-[#E2DDD5] shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] bg-[#1B4B8F] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#123362] transition-colors shadow-xs whitespace-normal break-words"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 shrink-0" />
                <span>{t('btn.downloadPdf')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] bg-white border border-[#1B4B8F] text-[#1B4B8F] text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#EEF3FA] transition-colors whitespace-normal break-words"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>{t('btn.print')}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 ml-auto sm:ml-0">
          <button
            type="button"
            onClick={onFileAnother}
            className="px-4 py-2 min-h-[40px] text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors whitespace-normal break-words"
          >
            {t('btn.fileAnother')}
          </button>
          <button
            type="button"
            onClick={() => onTrack(regNo)}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] bg-[#1E7A46] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#155a33] transition-colors shadow-xs whitespace-normal break-words"
          >
            <span>{t('btn.trackStatus')}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
