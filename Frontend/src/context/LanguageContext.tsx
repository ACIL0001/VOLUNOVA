'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, dictionaries, DEFAULT_LOCALE, LOCALE_METADATA } from '@/locales';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
  metadata: typeof LOCALE_METADATA[Locale];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if client has a saved locale in localStorage
    const saved = localStorage.getItem('volunova_locale') as Locale | null;
    if (saved && (saved === 'ar' || saved === 'fr' || saved === 'en')) {
      if (saved !== locale) {
        setLocaleState(saved);
      }
      document.cookie = `volunova_locale=${saved}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = saved;
      document.documentElement.dir = LOCALE_METADATA[saved].dir;
    } else {
      document.cookie = `volunova_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem('volunova_locale', locale);
      document.documentElement.lang = locale;
      document.documentElement.dir = LOCALE_METADATA[locale].dir;
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('volunova_locale', newLocale);
      document.cookie = `volunova_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLocale;
      document.documentElement.dir = LOCALE_METADATA[newLocale].dir;
    }
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

  const dir = LOCALE_METADATA[locale]?.dir || 'rtl';
  const isRTL = dir === 'rtl';

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        dir,
        isRTL,
        metadata: LOCALE_METADATA[locale],
      }}
    >
      <div dir={dir} className={isRTL ? 'font-sans' : 'font-sans'}>
        {children}
      </div>
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
