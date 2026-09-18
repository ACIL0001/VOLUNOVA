import { ar } from './ar';
import { fr } from './fr';
import { en } from './en';

export type MobileLocale = 'ar' | 'fr' | 'en';

export const dictionaries = {
  ar,
  fr,
  en,
};

export type MobileDictionary = typeof ar;

export const DEFAULT_LOCALE: MobileLocale = 'ar';

export const MOBILE_LOCALE_METADATA: Record<
  MobileLocale,
  { name: string; nativeName: string; flag: string; dir: 'rtl' | 'ltr' }
> = {
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇩🇿',
    dir: 'rtl',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    dir: 'ltr',
  },
};
