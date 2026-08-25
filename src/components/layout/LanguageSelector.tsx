import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useLanguage } from '../../lib/context/LanguageContext';
import { Locale } from '../../lib/i18n';

interface LanguageSelectorProps {
  onLanguageChange?: (locale: Locale) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const { currentLocale, setLocale, supportedLanguages, openComingSoon, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
    if (onLanguageChange) {
      onLanguageChange(code);
    }
  };

  const handleOpenComingSoon = () => {
    setIsOpen(false);
    openComingSoon();
  };

  const currentLangObj = supportedLanguages.find((l) => l.code === currentLocale) || supportedLanguages[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select language. Currently selected: ${currentLangObj.native}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B1E22] bg-white border border-[#E2DDD5] hover:bg-[#EEF3FA] hover:border-[#1B4B8F]/30 focus:outline-none focus:ring-2 focus:ring-[#1B4B8F] transition-all shadow-2xs"
      >
        <Globe className="w-3.5 h-3.5 text-[#1B4B8F]" aria-hidden="true" />
        <span className="font-medium text-gray-900">{currentLangObj.native}</span>
        <span className="text-[10px] text-gray-500 hidden sm:inline font-mono-code">
          ({currentLangObj.label})
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-[#1B4B8F]' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white shadow-xl ring-1 ring-black/5 z-50 py-1.5 text-xs border border-gray-200 divide-y divide-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Select Portal Language / भाषा चुनें
          </div>

          {/* 6 Supported Languages */}
          <div className="py-1">
            {supportedLanguages.map((lang) => {
              const isSelected = currentLocale === lang.code;
              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-[#EEF3FA] transition-colors ${
                    isSelected ? 'font-bold text-[#1B4B8F] bg-[#EEF3FA]/70' : 'text-gray-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-900">{lang.native}</span>
                    <span className="text-[10px] text-gray-500">{lang.label}</span>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] text-[#1B4B8F] font-bold">
                      <Check className="w-4 h-4 text-[#1B4B8F]" aria-hidden="true" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Other Languages (Coming Soon) Dialog Trigger */}
          <div className="p-1.5 bg-amber-50/50">
            <button
              type="button"
              onClick={handleOpenComingSoon}
              className="w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-semibold text-[#1B4B8F] hover:bg-[#EEF3FA] hover:text-[#123362] transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{t('lang.moreLanguages')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
