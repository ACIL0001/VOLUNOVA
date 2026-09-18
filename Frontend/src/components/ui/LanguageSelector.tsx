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

  const LANGUAGE_NAMES: Record<Locale, Record<Locale, string>> = {
    ar: { ar: 'العربية', fr: 'الفرنسية', en: 'الإنجليزية' },
    en: { ar: 'Arabic', fr: 'French', en: 'English' },
    fr: { ar: 'Arabe', fr: 'Français', en: 'Anglais' },
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
        className="flex items-center gap-1.5 rounded-lg border border-[#d8e0ea] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0b1f3a] hover:border-[#b8c6d6] transition-colors"
        aria-label="Change Language"
      >
        <Globe className="h-3.5 w-3.5 text-[#0d7a6f]" />
        <span className="tracking-wide">{LOCALE_METADATA[locale].code}</span>
        <ChevronDown className={`h-3 w-3 text-[#5b6b7c] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            dir === 'rtl' ? 'left-0' : 'right-0'
          } mt-2 w-44 rounded-xl border border-[#d8e0ea] bg-white p-1.5 shadow-lg z-50`}
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
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-[#e6f4f2] text-[#0d7a6f]'
                    : 'text-[#0b1f3a] hover:bg-[#f3f5f8]'
                }`}
              >
                <span>
                  {meta.code} · {localizedLabel}
                </span>
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
