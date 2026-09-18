'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, X } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { Locale, LOCALE_METADATA } from '@/locales';

export default function FloatingLanguageButton() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const locales: Locale[] = ['ar', 'fr', 'en'];

  const LANGUAGE_NAMES: Record<Locale, Record<Locale, string>> = {
    ar: {
      ar: 'العربية',
      fr: 'الفرنسية',
      en: 'الإنجليزية',
    },
    en: {
      ar: 'Arabic',
      fr: 'French',
      en: 'English',
    },
    fr: {
      ar: 'Arabe',
      fr: 'Français',
      en: 'Anglais',
    },
  };

  const POPUP_TITLES: Record<Locale, string> = {
    ar: 'تغيير لغة العرض',
    fr: 'Changer la langue',
    en: 'Change Language',
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none" ref={menuRef}>
      {/* Upward Floating Language Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 w-52 rounded-2xl border border-blue-900/50 bg-[#070d1e]/98 backdrop-blur-2xl p-2 shadow-2xl shadow-blue-950/80 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-blue-900/40 mb-1">
            <span className="text-[11px] font-bold text-sky-300">
              {POPUP_TITLES[locale]}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {locales.map((loc) => {
              const isSelected = locale === loc;
              const meta = LOCALE_METADATA[loc];
              const localizedLabel = LANGUAGE_NAMES[locale]?.[loc] || meta.nativeName;

              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setLocale(loc);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{meta.flag}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold tracking-wider">{meta.code}</span>
                      <span className="text-[11px] opacity-80 font-normal">({localizedLabel})</span>
                    </div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 p-[2px] shadow-2xl shadow-blue-950/80 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all"
        title="Change Language / تغيير اللغة / Changer de langue"
        aria-label="Floating language switcher"
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#070b18] group-hover:bg-[#0c142c] transition-colors">
          <Globe className="h-5 w-5 text-sky-400 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
        </div>

        {/* Current Active Language Code Badge */}
        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-blue-600 border border-blue-400/60 text-[9px] font-black text-white shadow-md">
          {LOCALE_METADATA[locale].code}
        </span>
      </button>
    </div>
  );
}
