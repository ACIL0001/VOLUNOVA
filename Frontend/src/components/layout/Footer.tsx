'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-[#d8e0ea] bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-start">
            <span className="font-display font-semibold tracking-wide text-[#0b1f3a]">
              {t('footer.brand_title')}
            </span>
            <span className="hidden sm:inline text-[#c5d0de]">|</span>
            <span className="text-[#5b6b7c]">{t('footer.tagline')}</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/about" className="text-[#5b6b7c] hover:text-[#0d7a6f] transition-colors">
              {t('footer.about')}
            </Link>
            <Link href="/aide" className="text-[#5b6b7c] hover:text-[#0d7a6f] transition-colors">
              {t('footer.help')}
            </Link>
            <Link href="/contact" className="text-[#5b6b7c] hover:text-[#0d7a6f] transition-colors">
              {t('footer.contact')}
            </Link>
          </div>
        </div>
        <p className="text-[#5b6b7c] text-xs text-center sm:text-start">
          © {new Date().getFullYear()} {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
