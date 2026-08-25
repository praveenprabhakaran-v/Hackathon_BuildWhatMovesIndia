import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Locale,
  SUPPORTED_LANGUAGES,
  UPCOMING_LANGUAGES,
  LanguageOption,
  getLocale as getStoredLocale,
  setLocale as setStoredLocale,
  t as translateHelper,
} from '../i18n';

interface LanguageContextType {
  currentLocale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isComingSoonOpen: boolean;
  openComingSoon: () => void;
  closeComingSoon: () => void;
  supportedLanguages: LanguageOption[];
  upcomingLanguages: typeof UPCOMING_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocale, setCurrentLocaleState] = useState<Locale>(getStoredLocale());
  const [isComingSoonOpen, setIsComingSoonOpen] = useState<boolean>(false);

  const handleSetLocale = (locale: Locale) => {
    setStoredLocale(locale);
    setCurrentLocaleState(locale);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    return translateHelper(key, params, currentLocale);
  };

  // Sync document lang attribute and dir
  useEffect(() => {
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);

  return (
    <LanguageContext.Provider
      value={{
        currentLocale,
        setLocale: handleSetLocale,
        t,
        isComingSoonOpen,
        openComingSoon: () => setIsComingSoonOpen(true),
        closeComingSoon: () => setIsComingSoonOpen(false),
        supportedLanguages: SUPPORTED_LANGUAGES,
        upcomingLanguages: UPCOMING_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      currentLocale: getStoredLocale(),
      setLocale: setStoredLocale,
      t: (key: string, params?: Record<string, string | number>) => translateHelper(key, params),
      isComingSoonOpen: false,
      openComingSoon: () => {},
      closeComingSoon: () => {},
      supportedLanguages: SUPPORTED_LANGUAGES,
      upcomingLanguages: UPCOMING_LANGUAGES,
    };
  }
  return context;
}

export function useTranslation() {
  const { t, currentLocale } = useLanguage();
  return { t, locale: currentLocale };
}
