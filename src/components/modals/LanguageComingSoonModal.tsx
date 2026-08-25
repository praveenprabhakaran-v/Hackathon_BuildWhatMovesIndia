import React, { useEffect, useRef, useState } from 'react';
import { Globe, X, Sparkles, CheckCircle2, Languages, Search } from 'lucide-react';
import { useLanguage } from '../../lib/context/LanguageContext';

export const LanguageComingSoonModal: React.FC = () => {
  const { isComingSoonOpen, closeComingSoon, supportedLanguages, upcomingLanguages, t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Save previous focused element and restore on close
  useEffect(() => {
    if (isComingSoonOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      // Focus first element after modal render
      const timer = setTimeout(() => {
        if (firstFocusableRef.current) {
          firstFocusableRef.current.focus();
        } else if (modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0].focus();
          }
        }
      }, 50);

      // Prevent background scrolling
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isComingSoonOpen]);

  // Focus trap & Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isComingSoonOpen || !modalRef.current) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeComingSoon();
        return;
      }

      if (e.key === 'Tab') {
        const nodeList = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );
        const focusableElements: HTMLElement[] = [];
        nodeList.forEach((el) => {
          if (el.offsetParent !== null) {
            focusableElements.push(el);
          }
        });

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: if on first element, wrap to last
          if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isComingSoonOpen, closeComingSoon]);

  if (!isComingSoonOpen) return null;

  const filteredUpcoming = upcomingLanguages.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.native.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSupported = supportedLanguages.filter((l) =>
    l.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.native.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      aria-describedby="language-modal-description"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeComingSoon();
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]"
      >
        {/* Tricolor Ribbon Header */}
        <div className="h-1.5 w-full flex shrink-0">
          <div className="w-1/3 bg-[#FF9933]"></div>
          <div className="w-1/3 bg-[#FFFFFF]"></div>
          <div className="w-1/3 bg-[#138808]"></div>
        </div>

        {/* Modal Top Bar */}
        <div className="bg-[#1B4B8F] text-white p-5 sm:p-6 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0 border border-white/20">
              <Languages className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-semibold tracking-wide uppercase font-mono-code mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Digital India Bhashini Mission</span>
              </div>
              <h2 id="language-modal-title" className="text-xl font-bold font-display text-white leading-tight">
                {t('lang.modalTitle')}
              </h2>
              <p id="language-modal-description" className="text-xs text-blue-100 mt-0.5">
                {t('lang.modalSubtitle')}
              </p>
            </div>
          </div>

          <button
            ref={firstFocusableRef}
            type="button"
            onClick={closeComingSoon}
            className="p-2 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B4B8F] shrink-0 cursor-pointer"
            aria-label="Close language modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Search Bar for Quick Keyboard Navigation */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by language name (e.g. Gujarati, Tamil, Urdu)..."
              aria-label="Search official and upcoming languages"
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4B8F] focus:border-[#1B4B8F] transition-all"
            />
          </div>
        </div>

        {/* Body Content with Keyboard Scrollable Region */}
        <div
          tabIndex={0}
          role="region"
          aria-label="List of supported and upcoming Eighth Schedule official languages"
          className="p-6 space-y-6 overflow-y-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1B4B8F]"
        >
          {/* Active Languages Section */}
          {filteredSupported.length > 0 && (
            <div className="bg-[#EEF3FA] border border-[#1B4B8F]/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B4B8F]">
                  Currently Active & Functional ({filteredSupported.length} Languages):
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredSupported.map((lang) => (
                  <div
                    key={lang.code}
                    tabIndex={0}
                    aria-label={`${lang.native}, ${lang.label} - Active`}
                    className="bg-white px-3 py-2 rounded-lg border border-[#1B4B8F]/15 flex items-center justify-between shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4B8F]"
                  >
                    <span className="text-xs font-bold text-gray-800">{lang.native}</span>
                    <span className="text-[10px] text-gray-500 font-mono-code">({lang.label})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation Text */}
          <div className="text-xs text-gray-600 leading-relaxed space-y-2">
            <p>
              {t('lang.modalNotice')}
            </p>
            <p className="text-[11px] text-gray-500 italic">
              All statutory RTI legal terms, section 6(1) filing steps, payment workflows, and status tracking milestones are being systematically translated and verified under the National Language Translation Mission (NLTM).
            </p>
          </div>

          {/* Upcoming Languages Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#1B4B8F]" aria-hidden="true" />
                <span>{t('lang.modalUpcomingTitle')}</span>
              </h3>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-medium">
                {filteredUpcoming.length} Languages in Pipeline
              </span>
            </div>

            {filteredUpcoming.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No languages matched &quot;{searchQuery}&quot;. Clear search to see all 22 official languages.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {filteredUpcoming.map((lang) => (
                  <div
                    key={lang.code}
                    tabIndex={0}
                    aria-label={`${lang.native}, ${lang.name} - In development`}
                    className="p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-[#1B4B8F]/40 transition-all flex flex-col justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4B8F]"
                  >
                    <div className="text-xs font-bold text-gray-800 font-display">
                      {lang.native}
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center justify-between mt-0.5">
                      <span>{lang.name}</span>
                      <span className="text-[9px] uppercase font-mono-code text-amber-600 bg-amber-100/60 px-1 rounded">
                        In Dev
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-[11px] sm:text-xs">
              Use <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono text-gray-700">Tab</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono text-gray-700">Esc</kbd> to close.
            </span>
          </div>

          <button
            type="button"
            onClick={closeComingSoon}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#1B4B8F] text-white text-xs font-bold rounded-xl hover:bg-[#123362] transition-colors shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1B4B8F] cursor-pointer"
          >
            {t('lang.modalClose')}
          </button>
        </div>
      </div>
    </div>
  );
};

