import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { FormField } from '../../components/forms/FormField';
import { TextInput } from '../../components/forms/TextInput';
import { useLanguage } from '../../lib/context/LanguageContext';
import { Search, ArrowRight } from 'lucide-react';

interface TrackLookupPageProps {
  onSearch: (regNo: string) => void;
  onNavigateHome: () => void;
}

export const TrackLookupPage: React.FC<TrackLookupPageProps> = ({ onSearch, onNavigateHome }) => {
  const { t } = useLanguage();
  const [regNo, setRegNo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim()) {
      setError(t('track.searchPlaceholder') || 'Please enter a valid Registration Number.');
      return;
    }
    onSearch(regNo.trim());
  };

  const sampleCases = [
    { label: t('status.RESPONSE_AVAILABLE'), reg: 'DORF/R/E/26/00482', desc: 'GST guidelines response with official certified download' },
    { label: t('status.ADDITIONAL_FEE_REQUIRED'), reg: 'MOHAF/R/E/26/00109', desc: 'Action required: Deposit ₹120 copy fees (60 pages @ ₹2)' },
    { label: t('status.DOC_REQUIRED'), reg: 'CBICD/R/2026/38102', desc: 'Action required: Upload proprietor authorization' },
    { label: t('status.TRANSFERRED'), reg: 'MEAF/R/E/26/00994', desc: 'Transferred to CPV Division & RPO (Sec 6(3))' },
    { label: t('status.MULTIPLE_CPIOS'), reg: 'RAILW/R/E/26/01205', desc: 'Split into parallel Railway Board & Safety reviews' },
    { label: t('status.REJECTED'), reg: 'MINHA/R/2026/12093', desc: 'Declined under Section 8(1)(a) Security exemption' },
    { label: t('status.UNDER_PROCESSING'), reg: 'DOPTR/R/E/26/00991', desc: 'Active CPIO collation milestone' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <Breadcrumbs
        items={[
          { label: t('nav.track'), current: true },
        ]}
      />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 px-2">
        <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded inline-block whitespace-normal break-words">
          Central RTI Registry
        </span>
        <h1 className="text-3xl font-bold text-[#1B1E22] font-display break-words">
          {t('track.title')}
        </h1>
        <p className="text-sm text-[#575D65] leading-relaxed break-words">
          {t('track.subtitle')}
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 max-w-xl mx-auto shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="track-reg-input"
            label={t('track.regLabel')}
            required
            error={error || undefined}
            helperText="Format: [AUTH]/[R or A]/[YEAR]/[NUMBER] (e.g. DORF/R/E/26/00482)"
          >
            <TextInput
              id="track-reg-input"
              value={regNo}
              onChange={(e) => {
                setRegNo(e.target.value);
                setError(null);
              }}
              placeholder={t('track.searchPlaceholder')}
              error={!!error}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </FormField>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 min-h-[44px] bg-[#1B4B8F] text-white font-semibold text-sm rounded-xl hover:bg-[#123362] transition-colors shadow-sm focus:ring-4 focus:ring-[#1B4B8F]/20 whitespace-normal break-words cursor-pointer"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>{t('track.btnTrack')}</span>
          </button>
        </form>
      </div>

      {/* Pre-seeded Test Sandbox Section */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 shadow-xs">
        <div className="border-b border-gray-100 pb-3 mb-4">
          <h2 className="text-base font-bold text-[#1B1E22] font-display flex items-center gap-2 break-words">
            <span>Instant Test Matrix: All 7 Application Lifecycle States</span>
          </h2>
          <p className="text-xs text-[#575D65] mt-0.5 break-words">
            Click any pre-seeded scenario below to verify that the portal renders the exact statutory UI corresponding to that state:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sampleCases.map((c, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSearch(c.reg)}
              className="text-left p-3.5 rounded-xl border border-gray-200 hover:border-[#1B4B8F] hover:bg-[#EEF3FA]/40 transition-all group flex flex-col justify-between min-h-[96px] cursor-pointer"
            >
              <div>
                <span className="text-[11px] font-bold text-[#1B4B8F] block group-hover:underline break-words">
                  {c.label}
                </span>
                <span className="text-xs font-mono-code font-bold text-[#1B1E22] block mt-0.5">
                  {c.reg}
                </span>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed break-words">
                  {c.desc}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#1B4B8F] font-semibold mt-2 group-hover:translate-x-0.5 transition-transform">
                <span>{t('btn.trackStatus')}</span>
                <ArrowRight className="w-3 h-3 shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
