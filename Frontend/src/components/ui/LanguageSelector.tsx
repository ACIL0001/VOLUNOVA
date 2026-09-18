'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { Locale, LOCALE_METADATA } from '@/locales';

export default function LanguageSelector() {
  const { locale, setLocale, dir } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const locales: Locale[] = ['ar', 'fr', 'en'];

  // Localized language name translations based on the user's active locale
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-1.5 rounded-full border border-blue-900/50 bg-[#070d1d]/90 p-1 pr-2.5 text-xs font-bold text-slate-200 hover:border-sky-400/60 hover:bg-blue-950/80 hover:text-white transition-all shadow-md shadow-blue-950/40 active:scale-95"
        title="Change Language / تغيير اللغة / Changer de langue"
        aria-label="Change Language"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/25 border border-blue-400/30 text-sky-300 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
          <Globe className="h-3.5 w-3.5" />
        </div>
        <span className="font-extrabold tracking-wider text-[11px] text-sky-200 font-sans">
          {LOCALE_METADATA[locale].code}
        </span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-sky-400' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            dir === 'rtl' ? 'left-0' : 'right-0'
          } mt-2 w-44 rounded-2xl border border-blue-900/50 bg-[#070d1e]/98 backdrop-blur-2xl p-1.5 shadow-2xl shadow-blue-950/80 z-50`}
        >
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
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{meta.flag}</span>
                  <span className="font-bold tracking-wider">{meta.code}</span>
                  <span className="text-[11px] text-slate-400 font-normal">({localizedLabel})</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
