import React from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Authority } from '../../types/rti';
import { Building, User, Mail, Phone, MapPin, Clock, FileText, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

interface AuthorityDetailPageProps {
  authority: Authority;
  onBack: () => void;
  onFileRti: (auth: Authority) => void;
}

export const AuthorityDetailPage: React.FC<AuthorityDetailPageProps> = ({
  authority,
  onBack,
  onFileRti,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Breadcrumbs
        items={[
          { label: 'Public Authorities', onClick: onBack },
          { label: authority.name, current: true },
        ]}
      />

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
          <div>
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded border border-[#1B4B8F]/20">
              Authority Code: {authority.code}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1B1E22] mt-2 font-display">
              {authority.name}
            </h1>
            <p className="text-xs text-[#575D65] mt-1">{authority.ministry}</p>
          </div>

          <button
            type="button"
            onClick={() => onFileRti(authority)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B4B8F] text-white font-semibold text-sm rounded-xl hover:bg-[#123362] transition-colors shadow-sm self-start sm:self-auto"
          >
            <FileText className="w-4 h-4" />
            <span>File RTI with this Body</span>
          </button>
        </div>

        {/* CPIO & FAA 2-Column Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
          {/* CPIO Card */}
          <div className="bg-[#F6F4EF]/60 p-5 rounded-xl border border-[#E2DDD5] space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#1B1E22] pb-2 border-b border-gray-200">
              <User className="w-4 h-4 text-[#1B4B8F]" />
              <span>Central Public Information Officer (CPIO)</span>
            </div>

            <div>
              <span className="text-gray-500 block">Designated Officer:</span>
              <strong className="text-sm text-gray-900">{authority.cpioName}</strong>
              <div className="text-gray-600">{authority.cpioDesignation}</div>
            </div>

            <div>
              <span className="text-gray-500 block">Official Email:</span>
              <span className="font-mono-code text-[#1B4B8F]">{authority.cpioEmail}</span>
            </div>

            <div>
              <span className="text-gray-500 block">Office Telephone:</span>
              <span className="font-mono-code text-gray-800">{authority.cpioPhone}</span>
            </div>
          </div>

          {/* FAA Card */}
          <div className="bg-[#F6F4EF]/60 p-5 rounded-xl border border-[#E2DDD5] space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#1B1E22] pb-2 border-b border-gray-200">
              <ShieldCheck className="w-4 h-4 text-[#1E7A46]" />
              <span>First Appellate Authority (FAA)</span>
            </div>

            <div>
              <span className="text-gray-500 block">Appellate Officer:</span>
              <strong className="text-sm text-gray-900">{authority.faaName}</strong>
              <div className="text-gray-600">{authority.faaDesignation}</div>
            </div>

            <div>
              <span className="text-gray-500 block">Appellate Jurisdiction:</span>
              <span className="text-gray-700">Adjudicates First Appeals preferred under Section 19(1) of RTI Act 2005.</span>
            </div>
          </div>
        </div>

        {/* Address & SLA Metadata */}
        <div className="bg-[#EEF3FA] rounded-xl p-4 border border-[#1B4B8F]/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#1B4B8F] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900">Office Postal Address:</span>
              <div className="text-gray-700">{authority.address}</div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 font-mono-code text-xs font-semibold text-[#1E7A46] bg-white px-3 py-1.5 rounded-lg border border-[#1E7A46]/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Average Disposal: {authority.avgTurnaroundDays} days</span>
          </div>
        </div>
      </div>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Authorities Directory</span>
        </button>
      </div>
    </div>
  );
};
