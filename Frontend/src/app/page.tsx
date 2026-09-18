'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TreePine,
  Clock,
  Users,
  Zap,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Compass,
} from 'lucide-react';
import { api, ImpactStats, Mission } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import { getLocalizedMission, getLocalizedCategory } from '@/lib/i18nData';

export default function LandingPage() {
  const { t, isRTL, locale } = useTranslation();
  const [stats, setStats] = useState<ImpactStats>({
    treesPlanted: 1420,
    totalImpactHours: 8650,
    volunteersMobilized: 128,
    activeMissionsCount: 4,
    fillRatePercentage: 94,
  });
  const [recentMissions, setRecentMissions] = useState<Mission[]>([]);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, missionsData] = await Promise.all([
          api.getImpactStats().catch(() => null),
          api.getMissions().catch(() => []),
        ]);
        if (statsData) setStats(statsData);
        if (missionsData) setRecentMissions(missionsData.slice(0, 3));
      } catch {
        // keep defaults
      }
    }
    loadData();
  }, []);

  return (
    <div className="relative pb-20">
      {/* Hero — full-bleed visual, brand-first, single composition */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=2400&q=80"
            alt=""
            fill
            priority
            className="object-cover animate-soft-zoom"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f3a]/92 via-[#0b1f3a]/55 to-[#0b1f3a]/25" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16 pt-28">
          <p
            className={`animate-fade-up text-white/90 tracking-[0.28em] text-sm sm:text-base font-semibold uppercase mb-4 ${
              locale === 'ar' ? 'font-cairo' : 'font-display'
            }`}
          >
            VOLUNOVA
          </p>
          <h1
            className={`animate-fade-up max-w-3xl text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-[1.1] tracking-tight ${
              locale === 'ar' ? 'font-cairo' : 'font-display'
            }`}
            style={{ animationDelay: '80ms' }}
          >
            {t('hero.title_p1')}{' '}
            <span className="text-[#9fd9d2]">{t('hero.title_gradient')}</span>
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-xl text-base sm:text-lg text-white/80 leading-relaxed"
            style={{ animationDelay: '160ms' }}
          >
            {t('hero.subtitle')}
          </p>
          <div
            className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: '240ms' }}
          >
            <Link
              href="/missions/create"
              className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold"
            >
              <Sparkles className="h-4 w-4" />
              {t('hero.cta_ai')}
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/missions/browse"
              className="inline-flex items-center gap-2 rounded-lg border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <Compass className="h-4 w-4" />
              {t('hero.cta_browse')}
            </Link>
          </div>
        </div>
      </section>

      {/* Impact metrics — below first viewport */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="surface-panel rounded-2xl p-6 sm:p-8 bg-civic-grid">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0d7a6f]">
              {t('impact_wall.badge')}
            </p>
            <h2 className={`mt-1 text-2xl sm:text-3xl font-semibold text-[#0b1f3a] ${locale === 'ar' ? 'font-cairo' : 'font-display'}`}>
              {t('impact_wall.title')}
            </h2>
            <p className="mt-1 text-sm text-[#5b6b7c]">{t('impact_wall.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { icon: TreePine, value: `${stats.treesPlanted.toLocaleString()}+`, label: t('impact_wall.trees') },
              { icon: Clock, value: stats.totalImpactHours.toLocaleString(), label: t('impact_wall.hours') },
              { icon: Users, value: `${stats.volunteersMobilized.toLocaleString()}+`, label: t('impact_wall.volunteers') },
              { icon: Zap, value: `${stats.fillRatePercentage}%`, label: t('impact_wall.fill_rate') },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl border border-[#d8e0ea] bg-white p-4 text-center">
                  <Icon className="mx-auto h-5 w-5 text-[#0d7a6f] mb-2" />
                  <div className="text-2xl sm:text-3xl font-bold text-[#0b1f3a] tracking-tight">
                    {item.value}
                  </div>
                  <div className="mt-1 text-xs font-medium text-[#5b6b7c] leading-snug">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0d7a6f]">
            {t('how_it_works.badge')}
          </p>
          <h2 className={`mt-1 text-3xl font-semibold text-[#0b1f3a] ${locale === 'ar' ? 'font-cairo' : 'font-display'}`}>
            {t('how_it_works.title')}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: '01', title: t('how_it_works.step1_title'), desc: t('how_it_works.step1_desc') },
            { n: '02', title: t('how_it_works.step2_title'), desc: t('how_it_works.step2_desc') },
            { n: '03', title: t('how_it_works.step3_title'), desc: t('how_it_works.step3_desc') },
          ].map((step) => (
            <div key={step.n} className="border-t-2 border-[#0d7a6f] pt-5">
              <div className="text-xs font-bold tracking-widest text-[#0d7a6f] mb-3">{step.n}</div>
              <h3 className="text-lg font-semibold text-[#0b1f3a] mb-2">{step.title}</h3>
              <p className="text-sm text-[#5b6b7c] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent missions */}
      {recentMissions.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className={`text-2xl font-semibold text-[#0b1f3a] ${locale === 'ar' ? 'font-cairo' : 'font-display'}`}>
                {t('missions.recent_title')}
              </h2>
              <p className="text-sm text-[#5b6b7c] mt-1">{t('missions.recent_subtitle')}</p>
            </div>
            <Link
              href="/missions/browse"
              className="flex items-center gap-1 text-sm font-semibold text-[#0d7a6f] hover:text-[#0a635a]"
            >
              {t('missions.view_all')}
              <ChevronIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {recentMissions.map((mission) => {
              const locMission = getLocalizedMission(mission, locale);
              const fillPercentage =
                locMission.totalSlotsNeeded > 0
                  ? Math.round((locMission.totalSlotsFilled / locMission.totalSlotsNeeded) * 100)
                  : 0;

              return (
                <div
                  key={locMission._id}
                  className="surface-panel surface-panel-hover rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold text-[#0d7a6f] bg-[#e6f4f2] px-2.5 py-1 rounded-md">
                        {getLocalizedCategory(locMission.category, t)}
                      </span>
                      <span className="text-xs text-[#5b6b7c]">{locMission.venueName}</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#0b1f3a] mb-2 line-clamp-2 leading-snug">
                      {locMission.title}
                    </h3>
                    <p className="text-sm text-[#5b6b7c] line-clamp-2 mb-4">{locMission.description}</p>
                  </div>

                  <div className="pt-4 border-t border-[#d8e0ea]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[#5b6b7c]">{t('missions.team_completion')}</span>
                      <span className="font-semibold text-[#0b1f3a]">
                        {fillPercentage}% ({mission.totalSlotsFilled}/{mission.totalSlotsNeeded})
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#eef2f6] overflow-hidden mb-4">
                      <div
                        className="h-full progress-bar-civic rounded-full transition-all"
                        style={{ width: `${Math.min(100, fillPercentage)}%` }}
                      />
                    </div>
                    <Link
                      href={`/missions/${mission._id}`}
                      className="block w-full rounded-lg border border-[#d8e0ea] py-2.5 text-center text-sm font-semibold text-[#0b1f3a] hover:border-[#0d7a6f] hover:text-[#0d7a6f] transition-colors"
                    >
                      {t('missions.open_ops_room')}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
