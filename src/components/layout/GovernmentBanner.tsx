import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../lib/context/LanguageContext';

export const GovernmentBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-[#123362] text-white text-xs border-b border-white/10 no-print select-none">
      {/* Tricolor top border */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-[#FFFFFF]"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
          <span className="font-semibold tracking-wide text-amber-300 uppercase">
            {t('banner.prototype')}
          </span>
          <span className="text-gray-300 hidden sm:inline">·</span>
          <span className="text-gray-200">
            {t('banner.disclaimer')}
          </span>
        </div>

        <div className="flex items-center gap-4 text-gray-300 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
            <span>{t('banner.simulated')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
