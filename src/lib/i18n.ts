/**
 * RTI Online - Multilingual Translation Engine & Dictionary
 * Supported Locales:
 * - en: English (Default)
 * - hi: Hindi (हिन्दी)
 * - bn: Bengali (বাংলা)
 * - mr: Marathi (मराठी)
 * - te: Telugu (తెలుగు)
 * - ta: Tamil (தமிழ்)
 */

import { en } from './i18n/translations/en';
import { hi } from './i18n/translations/hi';
import { bn } from './i18n/translations/bn';
import { mr } from './i18n/translations/mr';
import { te } from './i18n/translations/te';
import { ta } from './i18n/translations/ta';

export type Locale = 'en' | 'hi' | 'bn' | 'mr' | 'te' | 'ta';

export interface LanguageOption {
  code: Locale;
  label: string;
  native: string;
  script: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English', script: 'Latin' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', script: 'Devanagari' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', script: 'Bengali' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', script: 'Devanagari' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', script: 'Telugu' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', script: 'Tamil' },
];

export const UPCOMING_LANGUAGES = [
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली' },
  { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'ks', name: 'Kashmiri', native: 'کٲشُر' },
  { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
  { code: 'sd', name: 'Sindhi', native: 'सिंधी / سنڌي' },
  { code: 'dgo', name: 'Dogri', native: 'डोगरी' },
  { code: 'mni', name: 'Manipuri', native: 'ꯃꯤꯇꯩꯂꯣꯟ' },
  { code: 'brx', name: 'Bodo', native: 'बड़ो' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
];

export const translations: Record<Locale, Record<string, string>> = {
  en,
  hi,
  bn,
  mr,
  te,
  ta,
};

const STORAGE_KEY = 'rti_portal_active_locale_v1';

let currentLocale: Locale = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['en', 'hi', 'bn', 'mr', 'te', 'ta'].includes(saved)) {
      return saved as Locale;
    }
  } catch {
    // ignore
  }
  return 'en';
})();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  } catch {
    // ignore
  }
}

export function t(key: string, params?: Record<string, string | number>, localeOverride?: Locale): string {
  const active = localeOverride || currentLocale;
  const dict = translations[active] || translations.en;
  let text = dict[key] || translations.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    });
  }

  return text;
}
