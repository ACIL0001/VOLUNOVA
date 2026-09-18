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
    ar: { ar: 'العربية', fr: 'الفرنسية', en: 'الإنجليزية' },
    en: { ar: 'Arabic', fr: 'French', en: 'English' },
    fr: { ar: 'Arabe', fr: 'Français', en: 'Anglais' },
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
    <div className="fixed bottom-6 end-6 z-50 select-none" ref={menuRef}>
      {isOpen && (
        <div className="absolute bottom-14 end-0 mb-1 w-48 rounded-xl border border-[#d8e0ea] bg-white p-2 shadow-lg animate-fade-in">
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#d8e0ea] mb-1">
            <span className="text-[11px] font-semibold text-[#5b6b7c]">{POPUP_TITLES[locale]}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#5b6b7c] hover:text-[#0b1f3a]"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
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
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold ${
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
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b1f3a] text-white shadow-md hover:bg-[#163356] transition-colors"
        aria-label="Floating language switcher"
      >
        <Globe className="h-5 w-5" />
        <span className="absolute -top-1 -end-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-md bg-[#0d7a6f] text-[9px] font-bold text-white">
          {LOCALE_METADATA[locale].code}
        </span>
      </button>
    </div>
  );
}
