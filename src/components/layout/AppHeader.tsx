import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Scale,
  History,
  Building2,
  HelpCircle,
  Menu,
  X,
  User,
  PlusCircle,
  BookOpen,
  CreditCard,
  PhoneCall,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { EmblemLogo } from './EmblemLogo';
import { FontSizeToggle } from '../accessibility/FontSizeToggle';
import { useLanguage } from '../../lib/context/LanguageContext';

interface AppHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currentUser?: { email: string; name?: string } | null;
  onLogout?: () => void;
  onStartNewRti?: () => void;
  onTrackQuick?: (regNo: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentPath,
  onNavigate,
  currentUser,
  onLogout,
  onStartNewRti,
}) => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change or ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { label: t('nav.fileRti'), path: '/file-rti', icon: FileText },
    { label: t('nav.track'), path: '/track', icon: Search },
    { label: t('nav.firstAppeal'), path: '/first-appeal', icon: Scale },
    { label: t('nav.history'), path: '/history', icon: History },
    { label: t('nav.authorities'), path: '/authorities', icon: Building2 },
    { label: t('nav.faq'), path: '/faq', icon: HelpCircle },
  ];

  const utilityLinks = [
    { label: t('nav.guidelines'), path: '/guidelines', icon: BookOpen },
    { label: t('nav.reconciliation'), path: '/payment-reconciliation', icon: CreditCard },
    { label: t('nav.help'), path: '/help', icon: PhoneCall },
  ];

  const handleNav = (path: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const handleFileRtiClick = () => {
    if (onStartNewRti) {
      onStartNewRti();
    } else {
      onNavigate('/file-rti');
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white/98 backdrop-blur-md border-b border-[#E2DDD5] shadow-xs transition-shadow duration-200">
        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[4rem] sm:min-h-[5rem] py-2">
            {/* Logo & Portal Identity */}
            <div
              className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none group min-w-0"
              onClick={() => handleNav('/')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleNav('/');
              }}
              aria-label="Go to RTI Online homepage"
            >
              {/* National Emblem Badge */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-13 lg:h-13 rounded-xl bg-[#1B4B8F] text-white flex items-center justify-center p-1 sm:p-1.5 shadow-xs shrink-0 group-hover:bg-[#123362] transition-colors">
                <EmblemLogo variant="white" size="sm" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-[#1B4B8F] font-display truncate">
                    {t('app.title')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-mono-code font-bold bg-[#EEF3FA] text-[#1B4B8F] px-1.5 sm:px-2 py-0.5 rounded border border-[#1B4B8F]/20 shrink-0">
                    {t('app.badge')}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#575D65] hidden sm:block font-medium truncate">
                  {t('app.tagline')}
                </p>
              </div>
            </div>

            {/* Desktop Right Tools (>= 1024px) */}
            <div className="hidden lg:flex items-center gap-2.5 xl:gap-3">
              <FontSizeToggle />
              <LanguageSelector />

              {currentUser ? (
                <div className="flex items-center gap-2 pl-3 border-l border-gray-200 text-xs">
                  <button
                    type="button"
                    onClick={() => handleNav('/history')}
                    className="flex items-center gap-1.5 text-gray-700 font-medium hover:text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-1.5 rounded-lg border border-[#1B4B8F]/20 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#1B4B8F]" aria-hidden="true" />
                    <span className="max-w-[130px] truncate font-semibold">
                      {currentUser.name || currentUser.email}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-red-700 hover:text-red-900 font-semibold px-2 py-1 hover:underline transition-colors cursor-pointer"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNav('/login')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1B4B8F] bg-[#EEF3FA] hover:bg-[#1B4B8F] hover:text-white rounded-lg border border-[#1B4B8F]/20 transition-all shadow-2xs cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('nav.login')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleFileRtiClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#1B4B8F] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#123362] active:scale-[0.98] transition-all shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" aria-hidden="true" />
                <span>{t('btn.fileRtiApp')}</span>
              </button>
            </div>

            {/* Mobile & Tablet Tools (< 1024px) */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
              <FontSizeToggle />
              <LanguageSelector />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:text-[#1B4B8F] hover:bg-[#EEF3FA] focus:outline-none focus:ring-2 focus:ring-[#1B4B8F] cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Primary Nav Bar (>= 1024px) */}
          <nav
            className="hidden lg:flex items-center justify-between border-t border-gray-100 py-1"
            aria-label="Main Navigation"
          >
            {/* Main 6 Navigation Options */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentPath === item.path ||
                  (item.path !== '/' && currentPath.startsWith(item.path + '/'));

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1B4B8F] text-white font-semibold shadow-xs'
                        : 'text-[#1B1E22] hover:bg-[#EEF3FA] hover:text-[#1B4B8F]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Secondary Utility Links */}
            <div className="flex items-center gap-1.5 text-xs text-[#575D65]">
              <button
                type="button"
                onClick={() => handleNav('/guidelines')}
                className={`px-2 py-1 rounded hover:text-[#1B4B8F] hover:bg-[#EEF3FA] transition-colors cursor-pointer ${
                  currentPath === '/guidelines' ? 'text-[#1B4B8F] font-bold bg-[#EEF3FA]' : ''
                }`}
              >
                {t('nav.guidelines')}
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleNav('/payment-reconciliation')}
                className={`px-2 py-1 rounded hover:text-[#1B4B8F] hover:bg-[#EEF3FA] transition-colors cursor-pointer ${
                  currentPath === '/payment-reconciliation' ? 'text-[#1B4B8F] font-bold bg-[#EEF3FA]' : ''
                }`}
              >
                {t('nav.reconciliation')}
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => handleNav('/help')}
                className={`px-2 py-1 rounded hover:text-[#1B4B8F] hover:bg-[#EEF3FA] transition-colors cursor-pointer ${
                  currentPath === '/help' ? 'text-[#1B4B8F] font-bold bg-[#EEF3FA]' : ''
                }`}
              >
                {t('nav.help')}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile / Tablet Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white shadow-xl max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            {/* Primary Action in Mobile Menu */}
            <div className="p-4 border-b border-gray-100 bg-[#FAF9F5]">
              <button
                type="button"
                onClick={handleFileRtiClick}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1B4B8F] text-white text-sm font-semibold rounded-xl hover:bg-[#123362] active:scale-[0.98] shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('btn.fileRtiApp')} (₹10)</span>
              </button>
            </div>

            {/* 6 Primary Services Links */}
            <div className="p-3 space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono-code font-bold uppercase tracking-wider text-gray-400">
                Primary Citizen Services
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentPath === item.path ||
                  (item.path !== '/' && currentPath.startsWith(item.path + '/'));

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#1B4B8F] text-white font-semibold shadow-xs'
                        : 'text-gray-800 hover:bg-[#EEF3FA] hover:text-[#1B4B8F]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 opacity-50 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Secondary Utilities & Account */}
            <div className="p-3 border-t border-gray-100 space-y-1 bg-gray-50/50">
              <div className="px-3 py-1 text-[10px] font-mono-code font-bold uppercase tracking-wider text-gray-400">
                Resources & Legal
              </div>
              {utilityLinks.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#EEF3FA] text-[#1B4B8F] font-bold'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-gray-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* User Account / Session in Mobile Drawer */}
              <div className="pt-2 mt-2 border-t border-gray-200">
                {currentUser ? (
                  <div className="p-2 bg-white rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-7 h-7 rounded-full bg-[#EEF3FA] text-[#1B4B8F] flex items-center justify-center font-bold">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                          {currentUser.name || 'Citizen'}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono-code truncate">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onLogout?.();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-700 bg-red-50 hover:bg-red-100 rounded-lg font-semibold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleNav('/login')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#1B4B8F]/30 bg-[#EEF3FA] text-[#1B4B8F] text-xs font-bold hover:bg-[#1B4B8F] hover:text-white transition-all shadow-2xs"
                  >
                    <User className="w-4 h-4" />
                    <span>Citizen Convenience Login</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-xs lg:hidden no-print"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
