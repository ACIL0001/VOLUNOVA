'use client';

import React from 'react';
import { useTranslation } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-blue-900/20 bg-[#060a14]/90 backdrop-blur-xl py-10 text-center text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-white tracking-wide">{t('footer.brand_title')}</span>
          <span className="text-slate-500">—</span>
          <span className="text-slate-400">{t('footer.tagline')}</span>
        </div>
        <p className="text-slate-500">© {new Date().getFullYear()} {t('footer.rights')}</p>
      </div>
    </footer>
  );
}
