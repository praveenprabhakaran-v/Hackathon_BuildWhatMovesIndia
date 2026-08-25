import React from 'react';
import { ShieldAlert, FileText, PhoneCall } from 'lucide-react';
import { useLanguage } from '../../lib/context/LanguageContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t, openComingSoon } = useLanguage();

  return (
    <footer className="bg-[#1B1E22] text-gray-300 pt-12 pb-8 border-t-4 border-[#1B4B8F] no-print" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Prototype Warning Header in Footer */}
        <div className="bg-amber-950/60 border border-amber-500/30 rounded-xl p-4 sm:p-5 mb-10 text-amber-200">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300">
                {t('banner.prototype')} Disclaimer
              </h4>
              <p className="text-xs text-amber-200/90 leading-relaxed mt-1">
                This website is an independent frontend engineering reconstruction prototype for demonstration and evaluation. It is <strong>NOT</strong> affiliated with, operated by, or endorsed by the Department of Personnel and Training (DoPT) or the Government of India. No real government filing, fee collection, or PII processing occurs here.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-sm">
          {/* Col 1: About RTI */}
          <div>
            <h4 className="text-white font-bold font-display text-base mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1B4B8F]" aria-hidden="true" />
              <span>{t('app.title')}</span>
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Enacted under RTI Act, 2005 to promote transparency, accountability in working of every public authority, and contain corruption.
            </p>
            <div className="text-xs font-mono-code text-gray-400 space-y-1">
              <div>Portal Version: <span className="text-white">v2.4-prototype</span></div>
              <div>Turnaround Standard: <span className="text-emerald-400">30 Calendar Days</span></div>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div>
            <h4 className="text-white font-bold font-display text-base mb-3">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/file-rti')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav.fileRti')} (Section 6)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/track')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav.track')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/first-appeal')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav.firstAppeal')} (Section 19)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/history')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav.history')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/payment-reconciliation')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav.reconciliation')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Law */}
          <div>
            <h4 className="text-white font-bold font-display text-base mb-3">
              Legal & Guidelines
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/guidelines')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav.guidelines')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/authorities')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav.authorities')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/faq')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t('nav.faq')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openComingSoon}
                  className="text-amber-400 hover:text-amber-300 transition-colors text-left font-medium"
                >
                  🌐 {t('lang.moreLanguages')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div>
            <h4 className="text-white font-bold font-display text-base mb-3 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>{t('nav.help')}</span>
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              For technical queries regarding application submission and fee payment reconciliation:
            </p>
            <div className="text-xs space-y-1.5 text-gray-300">
              <div>Toll-Free Helpline: <span className="text-white font-mono-code">1800-11-2005</span></div>
              <div>Operating Hours: 09:00 to 17:30 IST (Mon-Fri)</div>
              <div>Demo Support: <span className="font-mono-code text-amber-300">helpdesk@demo-rti.gov.in</span></div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © 2026 RTI Online Citizen Portal Reconstruction Prototype. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">WCAG 2.1 AA Compliant</span>
            <span>·</span>
            <span className="text-gray-400">Mobile-First</span>
            <span>·</span>
            <span className="text-gray-400">Zero Commercial PII</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
