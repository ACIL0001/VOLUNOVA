import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MobileLocale,
  dictionaries,
  DEFAULT_LOCALE,
  MOBILE_LOCALE_METADATA,
} from '../locales';

interface LanguageContextType {
  locale: MobileLocale;
  setLocale: (locale: MobileLocale) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
  textAlign: 'right' | 'left';
  flexDirection: 'row-reverse' | 'row';
  metadata: typeof MOBILE_LOCALE_METADATA[MobileLocale];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<MobileLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    AsyncStorage.getItem('volunova_locale').then((saved) => {
      if (saved === 'ar' || saved === 'fr' || saved === 'en') {
        setLocaleState(saved);
      }
    }).catch(() => {});
  }, []);

  const setLocale = (next: MobileLocale) => {
    setLocaleState(next);
    AsyncStorage.setItem('volunova_locale', next).catch(() => {});
  };

  const t = (path: string, vars?: Record<string, string | number>): string => {
    const currentDict = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
    const fallbackDict = dictionaries[DEFAULT_LOCALE];

    const keys = path.split('.');
    let val: any = currentDict;
    for (const k of keys) {
      if (val && typeof val === 'object' && k in val) {
        val = val[k];
      } else {
        val = undefined;
        break;
      }
    }

    if (val === undefined) {
      let fallbackVal: any = fallbackDict;
      for (const k of keys) {
        if (fallbackVal && typeof fallbackVal === 'object' && k in fallbackVal) {
          fallbackVal = fallbackVal[k];
        } else {
          fallbackVal = undefined;
          break;
        }
      }
      val = fallbackVal !== undefined ? fallbackVal : path;
    }

    let text = String(val);
    if (vars) {
      for (const [key, replacement] of Object.entries(vars)) {
        text = text.replace(new RegExp(`{${key}}`, 'g'), String(replacement));
      }
    }

    return text;
  };

  const isRTL = locale === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        isRTL,
        dir,
        textAlign,
        flexDirection,
        metadata: MOBILE_LOCALE_METADATA[locale],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
