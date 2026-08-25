import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { StatusBadge } from '../../components/status/StatusBadge';
import { Notice } from '../../components/status/Notice';
import { JourneyRail } from '../../components/navigation/JourneyRail';
import { MultiCpioGroup } from '../../components/applications/MultiCpioGroup';
import { FileUpload } from '../../components/forms/FileUpload';
import { mockApi } from '../../lib/mockApi';
import { RTIApplication, FirstAppealApplication, SupportingDocument } from '../../types/rti';
import { useLanguage } from '../../lib/context/LanguageContext';
import {
  ArrowLeft,
  Building,
  User,
  CreditCard,
  Download,
  Printer,
  Scale,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Send,
} from 'lucide-react';

interface TrackDetailPageProps {
  registrationNumber: string;
  onBackToSearch: () => void;
  onFileAppeal: (regNo: string, email: string) => void;
  onNavigateTrack: (regNo: string) => void;
}

export const TrackDetailPage: React.FC<TrackDetailPageProps> = ({
  registrationNumber,
  onBackToSearch,
  onFileAppeal,
  onNavigateTrack,
}) => {
  const { t } = useLanguage();
  const [app, setApp] = useState<RTIApplication | null>(null);
  const [appeal, setAppeal] = useState<FirstAppealApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Action states for Additional Fee & Document Upload
  const [feePaying, setFeePaying] = useState(false);
  const [docUploadState, setDocUploadState] = useState<{
    file: SupportingDocument | null;
    remarks: string;
    submitting: boolean;
  }>({ file: null, remarks: '', submitting: false });

  const loadData = async () => {
    setIsLoading(true);
    setNotFound(false);

    try {
      if (registrationNumber.includes('/A/')) {
        const appealRes = await mockApi.getAppealByRegNo(registrationNumber);
        if (appealRes) {
          setAppeal(appealRes);
        } else {
          setNotFound(true);
        }
      } else {
        const appRes = await mockApi.getApplicationByRegNo(registrationNumber);
        if (appRes) {
          setApp(appRes);
        } else {
          setNotFound(true);
        }
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [registrationNumber]);

  const handlePayAdditionalFee = async () => {
    if (!app || !app.actionRequired?.amount) return;
    setFeePaying(true);
    try {
      const res = await mockApi.payAdditionalFee(app.registrationNumber, app.actionRequired.amount, 'UPI');
      setApp(res.application);
    } catch (err: any) {
      alert(err.message || 'Payment failed.');
    } finally {
      setFeePaying(false);
    }
  };

  const handleSubmitAdditionalDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !docUploadState.file) return;

    setDocUploadState((prev) => ({ ...prev, submitting: true }));
    try {
      const res = await mockApi.submitSupportingDocument(
        app.registrationNumber,
        docUploadState.file,
        docUploadState.remarks || 'Clarification documents attached'
      );
      setApp(res.application);
      setDocUploadState({ file: null, remarks: '', submitting: false });
    } catch (err: any) {
      alert(err.message || 'Failed to submit document.');
      setDocUploadState((prev) => ({ ...prev, submitting: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#1B4B8F] animate-spin mx-auto" />
        <p className="text-sm font-semibold text-gray-700">Loading Application Status from Central RTI Registry...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 bg-white p-8 rounded-2xl border border-[#E2DDD5] shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#FDEEED] text-[#C23B22] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#1B1E22] font-display">
          Registration Number Not Found
        </h2>
        <p className="text-xs text-[#575D65] leading-relaxed break-words">
          No records match <strong className="font-mono-code">{registrationNumber}</strong>. Please check your registration slip for typos, or use the Payment Reconciliation tool if your session interrupted during checkout.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={onBackToSearch}
            className="px-5 py-2.5 bg-[#1B4B8F] text-white text-xs font-semibold rounded-lg hover:bg-[#123362]"
          >
            Try Another Search
          </button>
        </div>
      </div>
    );
  }

  // RENDER APPEAL VIEW
  if (appeal) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <Breadcrumbs
          items={[
            { label: t('nav.track'), onClick: onBackToSearch },
            { label: appeal.appealRegistrationNumber, current: true },
          ]}
        />

        {/* Appeal Header */}
        <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded inline-block whitespace-normal">
                  First Appeal Case Record
                </span>
                <span className="text-xs text-gray-500">· Section 19(1)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-mono-code text-[#1B4B8F] break-all">
                {appeal.appealRegistrationNumber}
              </h1>
              <p className="text-xs text-[#575D65] mt-0.5">
                Filed on {new Date(appeal.filedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <StatusBadge status={appeal.status as any} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#F6F4EF]/60 p-4 rounded-xl space-y-1.5 border border-[#E2DDD5]">
              <span className="font-bold text-[#1B1E22]">First Appellate Authority (FAA):</span>
              <div className="text-gray-900 font-semibold break-words">{appeal.faaOfficer.name}</div>
              <div className="text-gray-600 break-words">{appeal.faaOfficer.designation}</div>
              <div className="text-gray-500 break-words">{appeal.authority.name}</div>
            </div>

            <div className="bg-[#F6F4EF]/60 p-4 rounded-xl space-y-1.5 border border-[#E2DDD5]">
              <span className="font-bold text-[#1B1E22]">Original RTI Reference:</span>
              <div className="font-mono-code font-semibold text-[#1B4B8F] break-all">{appeal.originalRegistrationNumber}</div>
              <div className="text-gray-700 break-words"><strong>Ground:</strong> {appeal.groundLabel}</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-xs">
            <span className="font-bold text-[#1B1E22] block mb-1">Appeal Grievance Text:</span>
            <p className="bg-[#F6F4EF]/80 p-3 rounded-lg text-gray-800 leading-relaxed font-mono-code text-[11px] whitespace-pre-wrap break-words">
              {appeal.appealText}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 shadow-xs">
          <JourneyRail mode="timeline" timelineEvents={appeal.timeline} />
        </div>
      </div>
    );
  }

  // RENDER RTI APPLICATION VIEW (app)
  if (!app) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Breadcrumbs
        items={[
          { label: t('nav.track'), onClick: onBackToSearch },
          { label: app.registrationNumber, current: true },
        ]}
      />

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded inline-block whitespace-normal">
                RTI Application Record
              </span>
              <span className="text-xs text-gray-500">· Section 6(1)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono-code text-[#1B4B8F] break-all">
              {app.registrationNumber}
            </h1>
            <p className="text-xs text-[#575D65] mt-0.5">
              Filed on {new Date(app.filedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <StatusBadge status={app.status} />
        </div>

        {/* 2-Column Authority and Applicant Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-5">
          <div className="bg-[#F6F4EF]/60 p-4 rounded-xl border border-[#E2DDD5] space-y-1.5">
            <div className="font-bold text-[#1B1E22] flex items-center gap-1.5 pb-1 border-b border-gray-200">
              <Building className="w-3.5 h-3.5 text-[#1B4B8F] shrink-0" />
              <span>Public Authority & CPIO</span>
            </div>
            <div>
              <span className="text-gray-500">Ministry: </span> <strong className="text-gray-800 break-words">{app.authority.ministry}</strong>
            </div>
            <div>
              <span className="text-gray-500">Authority: </span> <span className="text-gray-900 break-words">{app.authority.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Assigned CPIO: </span> <span className="text-gray-900 font-medium break-words">{app.authority.cpioName} ({app.authority.cpioDesignation})</span>
            </div>
            <div>
              <span className="text-gray-500">Contact: </span> <span className="text-gray-600 break-all">{app.authority.cpioEmail} · {app.authority.cpioPhone}</span>
            </div>
          </div>

          <div className="bg-[#F6F4EF]/60 p-4 rounded-xl border border-[#E2DDD5] space-y-1.5">
            <div className="font-bold text-[#1B1E22] flex items-center gap-1.5 pb-1 border-b border-gray-200">
              <User className="w-3.5 h-3.5 text-[#1B4B8F] shrink-0" />
              <span>Applicant & Statutory Fee</span>
            </div>
            <div>
              <span className="text-gray-500">Applicant: </span> <strong className="text-gray-800 break-words">{app.applicant.fullName}</strong>
            </div>
            <div>
              <span className="text-gray-500">Email: </span> <span className="font-mono-code text-gray-900 break-all">{app.applicant.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Fee Status: </span>{' '}
              <span className="font-mono-code font-semibold text-[#1E7A46]">
                {app.isBplExempt ? 'Fee Waived (BPL Card)' : `₹${app.applicationFee}.00 (${app.paymentMethod || 'Paid'})`}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Dispatch Address: </span>{' '}
              <span className="text-gray-700 break-words">{app.applicant.city}, {app.applicant.state}</span>
            </div>
          </div>
        </div>

        {/* Query Summary Box */}
        <div className="border-t border-gray-100 pt-4 text-xs">
          <span className="font-bold text-[#1B1E22] block mb-1">RTI Query on Record:</span>
          <p className="bg-[#F6F4EF]/80 p-3.5 rounded-lg text-gray-800 leading-relaxed font-mono-code text-[11px] whitespace-pre-wrap break-words">
            {app.requestText}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDGE STATE 1: RESPONSE AVAILABLE (Signed PDF, Remarks, Appeal CTA)        */}
      {/* ========================================================================= */}
      {app.status === 'RESPONSE_AVAILABLE' && app.responseDocument && (
        <div className="bg-[#EAF6EE] border-2 border-[#1E7A46] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1E7A46] bg-white px-2.5 py-0.5 rounded border border-[#1E7A46]/30 inline-block whitespace-normal">
                {t('track.responseTitle')}
              </span>
              <h3 className="text-xl font-bold text-[#11502C] mt-1 font-display break-words">
                Information Disclosed by Public Authority
              </h3>
              <p className="text-xs text-[#1E7A46] mt-0.5">
                Released on {new Date(app.responseDocument.releasedOn).toLocaleDateString('en-IN')} · Dispatch Ref: {app.responseDocument.dispatchRef}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-[#1E7A46] shrink-0" />
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#BCE2C9] text-xs space-y-2">
            <span className="font-bold text-gray-900 block">CPIO Official Remarks & Order Summary:</span>
            <p className="text-gray-700 leading-relaxed font-mono-code text-[11px] bg-[#F6F4EF] p-3 rounded-lg break-words">
              {app.responseDocument.cpioRemarks}
            </p>
          </div>

          {/* Download Response PDF & First Appeal CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => alert(`Simulated downloading official response letter: ${app.responseDocument?.fileName}`)}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] bg-[#1E7A46] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#155a33] transition-colors shadow-xs whitespace-normal break-words"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>{t('track.downloadResponse')} ({app.responseDocument.fileName})</span>
            </button>

            {app.canAppeal && (
              <button
                type="button"
                onClick={() => onFileAppeal(app.registrationNumber, app.applicant.email)}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] bg-white border border-[#1B4B8F] text-[#1B4B8F] text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#EEF3FA] transition-colors whitespace-normal break-words"
              >
                <Scale className="w-4 h-4 shrink-0" />
                <span>{t('track.fileAppealCta')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDGE STATE 2: ADDITIONAL FEE REQUIRED (Section 7(3))                       */}
      {/* ========================================================================= */}
      {app.status === 'ADDITIONAL_FEE_REQUIRED' && app.actionRequired && (
        <Notice
          variant="warning"
          title="Action Required: Deposit Additional Copy Fee (Section 7(3))"
          action={
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={feePaying}
                onClick={handlePayAdditionalFee}
                className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[40px] bg-[#B7791F] text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-[#7C4E0A] transition-colors shadow-xs disabled:opacity-50 whitespace-normal break-words"
              >
                {feePaying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    <span>Processing Mock Fee Deposit...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span>Deposit Additional Fee of ₹{app.actionRequired.amount}.00</span>
                  </>
                )}
              </button>
            </div>
          }
        >
          <p className="text-xs leading-relaxed break-words">{app.actionRequired.reason}</p>
          {app.actionRequired.feeBreakdown && (
            <div className="bg-white rounded-lg p-3 border border-[#F4E3B5] mt-2 space-y-1 font-mono-code text-xs text-[#7C4E0A]">
              <div>Pages Collated: <strong>{app.actionRequired.feeBreakdown.pages} pages</strong></div>
              <div>Statutory Rate (RTI Rules 2012): ₹{app.actionRequired.feeBreakdown.ratePerPage}.00 per photostat page</div>
              <div>Total Amount Demanded: <strong>₹{app.actionRequired.amount}.00</strong></div>
            </div>
          )}
          <p className="text-[11px] text-[#7C4E0A] mt-1 break-words">
            Note: Under Section 7(3), the intervening period between fee demand and deposit is excluded from the 30-day calculation.
          </p>
        </Notice>
      )}

      {/* ========================================================================= */}
      {/* EDGE STATE 3: SUPPORTING DOCUMENT REQUIRED                                 */}
      {/* ========================================================================= */}
      {app.status === 'SUPPORTING_DOCUMENT_REQUIRED' && app.actionRequired && (
        <div className="bg-[#FEF8E7] border-2 border-[#B7791F] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-[#B7791F] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-[#7C4E0A] break-words">
                Action Required: Additional Clarification / Authorization Needed
              </h3>
              <p className="text-xs text-[#1B1E22]/90 mt-1 leading-relaxed break-words">
                {app.actionRequired.reason}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitAdditionalDoc} className="bg-white p-4 rounded-xl border border-[#F4E3B5] space-y-3">
            <FileUpload
              id="doc-clarification-upload"
              onFileSelect={(doc) => setDocUploadState((prev) => ({ ...prev, file: doc }))}
              onFileRemove={() => setDocUploadState((prev) => ({ ...prev, file: null }))}
              existingFile={docUploadState.file}
              label="Upload Requested PDF Document"
            />

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Applicant Clarification Note / Remarks:
              </label>
              <textarea
                rows={2}
                value={docUploadState.remarks}
                onChange={(e) => setDocUploadState((prev) => ({ ...prev, remarks: e.target.value }))}
                placeholder="Brief explanation of the attached document..."
                className="w-full p-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4B8F]/20"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!docUploadState.file || docUploadState.submitting}
                className="inline-flex items-center gap-2 px-5 py-2 min-h-[40px] bg-[#1B4B8F] text-white text-xs font-semibold rounded-lg hover:bg-[#123362] transition-colors disabled:opacity-50 whitespace-normal break-words"
              >
                {docUploadState.submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>Submitting Clarification...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 shrink-0" />
                    <span>Submit Document to CPIO</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDGE STATE 4: TRANSFERRED TO ANOTHER AUTHORITY (Section 6(3))              */}
      {/* ========================================================================= */}
      {app.status === 'TRANSFERRED' && app.transferredTo && (
        <div className="bg-white border-2 border-[#1B4B8F] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded border border-[#1B4B8F]/30 inline-block whitespace-normal">
              Statutory Transfer Notice · Section 6(3)
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#1B1E22] font-display break-words">
              Transferred to Competent Public Authority
            </h3>
            <p className="text-xs text-[#575D65] mt-1 leading-relaxed break-words">
              Under Section 6(3) of the RTI Act 2005, when subject matter is more closely connected with the functions of another public authority, the application must be transferred within 5 days.
            </p>
          </div>

          <div className="bg-[#EEF3FA] rounded-xl p-4 border border-[#1B4B8F]/20 space-y-2 text-xs">
            <div>
              <span className="text-gray-500 block">Receiving Public Authority:</span>
              <strong className="text-base text-[#1B1E22] block mt-0.5 break-words">{app.transferredTo.authority}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">New Transferred Registration Number:</span>
              <span className="font-mono-code font-bold text-sm text-[#1B4B8F] break-all">{app.transferredTo.registrationNumber}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Ground for Transfer:</span>
              <span className="text-gray-700 break-words">{app.transferredTo.reason}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDGE STATE 5: MULTIPLE CPIO GROUP (Split child cases)                      */}
      {/* ========================================================================= */}
      {app.status === 'MULTIPLE_CPIO' && app.childApplications && (
        <MultiCpioGroup
          childApplications={app.childApplications}
          onSelectChild={(childReg) => onNavigateTrack(childReg)}
        />
      )}

      {/* ========================================================================= */}
      {/* EDGE STATE 6: RETURNED / EXEMPT UNDER SECTION 8                            */}
      {/* ========================================================================= */}
      {app.status === 'RETURNED' && (
        <div className="bg-[#FDEEED] border-2 border-[#C23B22] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#C23B22] bg-white px-2.5 py-0.5 rounded border border-[#C23B22]/30 inline-block whitespace-normal">
                Information Request Declined
              </span>
              <h3 className="text-xl font-bold text-[#8A1F0C] mt-1 font-display break-words">
                Exempted under {app.returnSection || 'Section 8(1) of RTI Act'}
              </h3>
            </div>
            <AlertTriangle className="w-7 h-7 text-[#C23B22] shrink-0" />
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#F6C6BF] text-xs space-y-1.5">
            <span className="font-bold text-gray-900 block">Reason for Rejection:</span>
            <p className="text-gray-700 leading-relaxed font-mono-code text-[11px] break-words">
              {app.returnReason}
            </p>
          </div>

          {app.canAppeal && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onFileAppeal(app.registrationNumber, app.applicant.email)}
                className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[40px] bg-[#C23B22] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#8A1F0C] transition-colors shadow-xs whitespace-normal break-words"
              >
                <Scale className="w-4 h-4 shrink-0" />
                <span>File First Appeal Against Rejection (₹0 Fee)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Processing Timeline Rail */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 shadow-xs">
        <JourneyRail
          mode="timeline"
          timelineEvents={app.timeline}
          currentStatus={app.status}
        />
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print bg-white p-4 rounded-xl border border-[#E2DDD5]">
        <button
          type="button"
          onClick={onBackToSearch}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors whitespace-normal break-words"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Search Another Case</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] bg-white border border-[#1B4B8F] text-[#1B4B8F] text-xs font-semibold rounded-lg hover:bg-[#EEF3FA] whitespace-normal break-words"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span>Print Timeline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
