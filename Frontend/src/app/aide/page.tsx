'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  Sparkles,
  ListChecks,
  Radio,
  UserPlus,
  UserRound,
  Compass,
  HandHelping,
  Award,
  ArrowLeft,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

type Audience = 'org' | 'vol';

export default function AidePage() {
  const { t, isRTL, locale } = useTranslation();
  const [audience, setAudience] = useState<Audience>('org');
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const orgSteps = [
    { title: t('help.org_1_title'), body: t('help.org_1_body'), icon: Sparkles },
    { title: t('help.org_2_title'), body: t('help.org_2_body'), icon: ListChecks },
    { title: t('help.org_3_title'), body: t('help.org_3_body'), icon: Radio },
    { title: t('help.org_4_title'), body: t('help.org_4_body'), icon: UserPlus },
  ];

  const volSteps = [
    { title: t('help.vol_1_title'), body: t('help.vol_1_body'), icon: UserRound },
    { title: t('help.vol_2_title'), body: t('help.vol_2_body'), icon: Compass },
    { title: t('help.vol_3_title'), body: t('help.vol_3_body'), icon: HandHelping },
    { title: t('help.vol_4_title'), body: t('help.vol_4_body'), icon: Award },
  ];

  const steps = audience === 'org' ? orgSteps : volSteps;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0d7a6f] mb-2">
          {t('help.badge')}
        </p>
        <h1
          className={`text-3xl sm:text-4xl font-semibold text-[#0b1f3a] leading-tight ${
            locale === 'ar' ? 'font-cairo' : 'font-display'
          }`}
        >
          {t('help.title')}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#5b6b7c] leading-relaxed">
          {t('help.subtitle')}
        </p>
      </div>

      {/* Audience switcher */}
      <div className="mb-10 inline-flex rounded-xl border border-[#d8e0ea] bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setAudience('org')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            audience === 'org'
              ? 'bg-[#0b1f3a] text-white'
              : 'text-[#5b6b7c] hover:text-[#0b1f3a]'
          }`}
        >
          <Building2 className="h-4 w-4" />
          {t('help.for_orgs')}
        </button>
        <button
          type="button"
          onClick={() => setAudience('vol')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            audience === 'vol'
              ? 'bg-[#0b1f3a] text-white'
              : 'text-[#5b6b7c] hover:text-[#0b1f3a]'
          }`}
        >
          <Users className="h-4 w-4" />
          {t('help.for_vols')}
        </button>
      </div>

      {/* Modern vertical timeline */}
      <ol className="relative space-y-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <li key={`${audience}-${index}`} className="relative flex gap-5 sm:gap-8 pb-10 last:pb-0 animate-fade-up" style={{ animationDelay: `${index * 70}ms` }}>
              {/* Track */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0d7a6f] text-white shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                {!isLast && (
                  <div className="mt-2 w-px flex-1 min-h-[48px] bg-gradient-to-b from-[#0d7a6f] to-[#d8e0ea]" />
                )}
              </div>

              {/* Content card */}
              <div className="surface-panel surface-panel-hover flex-1 rounded-xl p-5 sm:p-6 mb-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0d7a6f]">
                    {t('help.step')} {index + 1}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-[#0b1f3a] mb-2">{step.title}</h2>
                <p className="text-sm text-[#5b6b7c] leading-relaxed max-w-2xl">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Tip + CTAs */}
      <div className="mt-12 surface-panel rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-civic-grid">
        <div className="max-w-xl">
          <h3 className={`text-lg font-semibold text-[#0b1f3a] mb-1 ${locale === 'ar' ? 'font-cairo' : 'font-display'}`}>
            {t('help.tip_title')}
          </h3>
          <p className="text-sm text-[#5b6b7c] leading-relaxed">{t('help.tip_body')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
          >
            <Phone className="h-4 w-4" />
            {t('help.cta_contact')}
          </Link>
          {audience === 'org' ? (
            <Link
              href="/missions/create"
              className="btn-secondary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
            >
              {t('help.cta_create')}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/missions/browse"
              className="btn-secondary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
            >
              {t('help.cta_browse')}
              <ArrowIcon className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
