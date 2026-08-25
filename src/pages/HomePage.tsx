import React from 'react';
import {
  FileText,
  Search,
  Scale,
  History,
  Building2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { JourneyRail } from '../components/navigation/JourneyRail';
import { EmblemLogo } from '../components/layout/EmblemLogo';
import { useLanguage } from '../lib/context/LanguageContext';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onQuickTrack: (regNo: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onQuickTrack }) => {
  const { t } = useLanguage();
  const [quickReg, setQuickReg] = React.useState('');

  const handleQuickLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickReg.trim()) {
      onQuickTrack(quickReg.trim());
    }
  };

  const sampleTrackCases = [
    { label: 'Response Available', reg: 'DOTEL/R/2026/10492', desc: '5G spectrum allocation reply with PDF download' },
    { label: 'Additional Fee Required', reg: 'MEITY/R/2026/49201', desc: 'Demand for ₹48 photostat copy fees' },
    { label: 'Document Required', reg: 'CBICD/R/2026/38102', desc: 'Clarification & authorization required' },
    { label: 'Transferred Authority', reg: 'RAILW/R/2026/89401', desc: 'Transferred to Northern Railway Division' },
    { label: 'Multiple CPIOs', reg: 'MORTH/R/2026/77219', desc: 'Split into parallel NHAI & Ministry cases' },
    { label: 'Returned / Exempt', reg: 'MINHA/R/2026/12093', desc: 'Declined under Section 8(1)(a) Security' },
  ];

  const primaryServices = [
    {
      title: t('svc.fileRti.title'),
      label: t('nav.fileRti'),
      path: '/file-rti',
      icon: FileText,
      tag: t('svc.fileRti.tag'),
      description: t('svc.fileRti.desc'),
      actionText: t('svc.fileRti.action'),
      iconBg: '#1B4B8F', // Ashoka Blue (Primary)
    },
    {
      title: t('svc.track.title'),
      label: t('nav.track'),
      path: '/track',
      icon: Search,
      tag: t('svc.track.tag'),
      description: t('svc.track.desc'),
      actionText: t('svc.track.action'),
      iconBg: '#0E7C86', // Teal (Monitoring / Status)
    },
    {
      title: t('svc.appeal.title'),
      label: t('nav.firstAppeal'),
      path: '/first-appeal',
      icon: Scale,
      tag: t('svc.appeal.tag'),
      description: t('svc.appeal.desc'),
      actionText: t('svc.appeal.action'),
      iconBg: '#3E4C9C', // Indigo (Statutory Appeal)
    },
    {
      title: t('svc.history.title'),
      label: t('nav.history'),
      path: '/history',
      icon: History,
      tag: t('svc.history.tag'),
      description: t('svc.history.desc'),
      actionText: t('svc.history.action'),
      iconBg: '#5B6B7C', // Slate Blue-Gray (Archival & Records)
    },
    {
      title: t('svc.authorities.title'),
      label: t('nav.authorities'),
      path: '/authorities',
      icon: Building2,
      tag: t('svc.authorities.tag'),
      description: t('svc.authorities.desc'),
      actionText: t('svc.authorities.action'),
      iconBg: '#A97425', // Ochre (Public Directories)
    },
    {
      title: t('svc.faq.title'),
      label: t('nav.faq'),
      path: '/faq',
      icon: HelpCircle,
      tag: t('svc.faq.tag'),
      description: t('svc.faq.desc'),
      actionText: t('svc.faq.action'),
      iconBg: '#7A4B6E', // Plum (Reference & FAQs)
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-[#F6F4EF] border-b border-[#E2DDD5] pt-8 pb-12 sm:pb-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          {/* Emblem & Official Seal */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1B4B8F] text-white flex items-center justify-center p-2 shadow-md">
              <EmblemLogo variant="white" size="lg" />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EEF3FA] border border-[#1B4B8F]/20 text-[#1B4B8F] text-xs font-semibold uppercase tracking-wider font-mono-code mt-1">
              <span>{t('hero.badge')}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#1B1E22] tracking-tight leading-[1.15] font-display">
            {t('hero.title')} <br className="hidden sm:inline" />
            <span className="text-[#1B4B8F]">{t('hero.titleHighlight')}</span> {t('hero.titleSuffix')}
          </h1>

          <p className="text-base sm:text-lg text-[#575D65] max-w-2xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>

          {/* Quick Track Input Bar */}
          <div className="pt-2 max-w-xl mx-auto">
            <form onSubmit={handleQuickLookup} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-xl border-2 border-[#1B4B8F]/30 shadow-md">
              <label htmlFor="quick-track-reg" className="sr-only">
                {t('hero.quickTrackPlaceholder')}
              </label>
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="quick-track-reg"
                  type="text"
                  value={quickReg}
                  onChange={(e) => setQuickReg(e.target.value)}
                  placeholder={t('hero.quickTrackPlaceholder')}
                  aria-label={t('hero.quickTrackPlaceholder')}
                  className="w-full pl-10 pr-3 py-2.5 text-sm font-mono-code rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4B8F]/20 text-[#1B1E22]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-[#1B4B8F] text-white text-sm font-semibold rounded-lg hover:bg-[#123362] transition-colors whitespace-nowrap"
              >
                {t('hero.quickTrackBtn')}
              </button>
            </form>
          </div>

          {/* Primary Quick CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/file-rti')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B4B8F] text-white font-semibold rounded-xl hover:bg-[#123362] transition-colors shadow-sm text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>{t('svc.fileRti.title')} (₹10)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/first-appeal')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1B4B8F] border-2 border-[#1B4B8F] font-semibold rounded-xl hover:bg-[#EEF3FA] transition-colors text-sm"
            >
              <Scale className="w-4 h-4" />
              <span>{t('svc.appeal.title')} ({t('status.SUBMITTED') === 'Submitted' ? 'Free' : 'निःशुल्क / Free'})</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6 Primary Citizen Services */}
      <section className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div>
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded">
              {t('services.title')}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B1E22] mt-1 font-display">
              {t('app.title')} — {t('app.badge')}
            </h2>
          </div>
          <p className="text-xs text-[#575D65]">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {primaryServices.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.path}
                onClick={() => onNavigate(svc.path)}
                className="bg-white rounded-2xl p-6 border border-[#E2DDD5] shadow-2xs hover:border-[#1B4B8F] hover:shadow-md transition-all cursor-pointer flex flex-col h-full group"
              >
                <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105 shrink-0"
                    style={{ backgroundColor: svc.iconBg }}
                  >
                    <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-mono-code font-bold bg-[#FAF9F5] border border-gray-200 text-gray-700 px-2.5 py-1 rounded-md shrink-0">
                    {svc.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#1B1E22] mb-2 font-display group-hover:text-[#1B4B8F] transition-colors shrink-0">
                  {svc.title}
                </h3>
                <p className="text-xs text-[#575D65] leading-[1.6] flex-1 break-words">
                  {svc.description}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1B4B8F] shrink-0">
                  <span>{svc.actionText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Signature Element: JourneyRail */}
      <section className="max-w-6xl mx-auto">
        <JourneyRail mode="explainer" />
      </section>

      {/* Pre-seeded Demo Edge Cases Showcase */}
      <section className="max-w-6xl mx-auto bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded">
              Interactive Test Suite
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B1E22] mt-1 font-display">
              Pre-Seeded Demo Applications & Edge States
            </h2>
            <p className="text-xs text-[#575D65] mt-0.5">
              Click any pre-configured case below to test all seven lifecycle states required by the specification:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleTrackCases.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onQuickTrack(item.reg)}
              className="text-left p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-[#EEF3FA] hover:border-[#1B4B8F] transition-all group shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#1B4B8F] font-mono-code">
                  {item.reg}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-200">
                  {item.label}
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
