'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

type AuthBrandProps = {
  title: string;
  subtitle?: string;
};

/** Animated brand mark for login / register (civic portal). */
export default function AuthBrand({ title, subtitle }: AuthBrandProps) {
  return (
    <div className="text-center auth-brand-enter">
      <Link
        href="/"
        className="auth-logo-wrap group relative mx-auto mb-6 inline-flex items-center justify-center"
        aria-label="VOLUNOVA — Accueil"
      >
        <span className="auth-logo-ring" aria-hidden />
        <span className="auth-logo-ring auth-logo-ring--delay" aria-hidden />
        <span className="relative z-10 flex h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white border border-[#d8e0ea]/80 shadow-[0_8px_30px_-8px_rgba(11,31,58,0.18)] auth-logo-float">
          <Image
            src="/logo.png"
            alt="VOLUNOVA"
            width={120}
            height={48}
            className="h-10 sm:h-11 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.04]"
            priority
          />
        </span>
      </Link>

      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0d7a6f] mb-2 auth-brand-enter-delay-1">
        VOLUNOVA
      </p>
      <h1 className="text-2xl sm:text-[1.75rem] font-semibold text-[#0b1f3a] tracking-tight font-display auth-brand-enter-delay-2">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm text-[#5b6b7c] max-w-sm mx-auto leading-relaxed auth-brand-enter-delay-3">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-card relative overflow-hidden rounded-2xl border border-white/70 bg-white/85 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(11,31,58,0.28)] p-6 sm:p-8 auth-card-enter">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0d7a6f]/45 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 -end-16 h-48 w-48 rounded-full bg-[#0d7a6f]/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -start-12 h-40 w-40 rounded-full bg-[#0b1f3a]/[0.04] blur-3xl"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function AuthPageShell({
  children,
  maxWidth = 'md',
}: {
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg';
}) {
  const { t } = useTranslation();
  const width = maxWidth === 'lg' ? 'max-w-lg' : 'max-w-md';

  return (
    <div className="auth-page relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="auth-page-bg pointer-events-none absolute inset-0" aria-hidden />

      <Link
        href="/"
        className="absolute top-5 start-5 sm:top-6 sm:start-6 z-20 inline-flex items-center gap-1.5 rounded-xl border border-[#d8e0ea] bg-white/90 px-3 py-2 text-xs font-semibold text-[#5b6b7c] shadow-sm backdrop-blur-sm hover:text-[#0d7a6f] hover:border-[#0d7a6f]/40 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>{t('nav.home')}</span>
      </Link>

      <div className={`relative z-10 w-full ${width} space-y-7`}>{children}</div>
    </div>
  );
}
