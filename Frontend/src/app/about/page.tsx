'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles, Users, Activity } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function AboutPage() {
  const { t, isRTL, locale } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const steps = [
    { title: t('about.how_1_title'), body: t('about.how_1_body'), icon: Sparkles },
    { title: t('about.how_2_title'), body: t('about.how_2_body'), icon: Users },
    { title: t('about.how_3_title'), body: t('about.how_3_body'), icon: Activity },
  ];

  const values = [t('about.value_1'), t('about.value_2'), t('about.value_3')];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0d7a6f] mb-2">
          {t('about.badge')}
        </p>
        <h1
          className={`text-3xl sm:text-4xl font-semibold text-[#0b1f3a] leading-tight ${
            locale === 'ar' ? 'font-cairo' : 'font-display'
          }`}
        >
          {t('about.title')}
        </h1>
        <p className="mt-4 text-base text-[#5b6b7c] leading-relaxed">{t('about.intro')}</p>
      </div>

      <section className="surface-panel rounded-xl p-6 sm:p-8 mb-10">
        <h2 className={`text-xl font-semibold text-[#0b1f3a] mb-3 ${locale === 'ar' ? 'font-cairo' : 'font-display'}`}>
          {t('about.mission_title')}
        </h2>
        <p className="text-sm text-[#5b6b7c] leading-relaxed max-w-3xl">{t('about.mission_body')}</p>
      </section>

      <section className="mb-12">
        <h2 className={`text-xl font-semibold text-[#0b1f3a] mb-6 ${locale === 'ar' ? 'font-cairo' : 'font-display'}`}>
          {t('about.how_title')}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="border-t-2 border-[#0d7a6f] pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold tracking-widest text-[#0d7a6f]">
                    0{i + 1}
                  </span>
                  <Icon className="h-4 w-4 text-[#0d7a6f]" />
                </div>
                <h3 className="text-base font-semibold text-[#0b1f3a] mb-2">{step.title}</h3>
                <p className="text-sm text-[#5b6b7c] leading-relaxed">{step.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <h2 className={`text-xl font-semibold text-[#0b1f3a] mb-4 ${locale === 'ar' ? 'font-cairo' : 'font-display'}`}>
          {t('about.values_title')}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {values.map((value) => (
            <li
              key={value}
              className="rounded-xl border border-[#d8e0ea] bg-white px-4 py-4 text-sm font-medium text-[#0b1f3a]"
            >
              {value}
            </li>
          ))}
        </ul>
      </section>

      <Link
        href="/missions/browse"
        className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold"
      >
        {t('about.cta')}
        <ArrowIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
