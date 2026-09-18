import { ar } from './ar';
import { fr } from './fr';
import { en } from './en';

export type Locale = 'ar' | 'fr' | 'en';

export const dictionaries = {
  ar,
  fr,
  en,
};

export type Dictionary = typeof ar;

export const DEFAULT_LOCALE: Locale = 'ar';

export const LOCALE_METADATA: Record<
  Locale,
  { name: string; nativeName: string; code: string; flag: string; dir: 'rtl' | 'ltr' }
> = {
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    code: 'AR',
    flag: '🇩🇿',
    dir: 'rtl',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    code: 'FR',
    flag: '🇫🇷',
    dir: 'ltr',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    code: 'ENG',
    flag: '🇬🇧',
    dir: 'ltr',
  },
};
