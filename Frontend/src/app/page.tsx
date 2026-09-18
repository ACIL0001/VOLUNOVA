'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TreePine,
  Clock,
  Users,
  Zap,
  ArrowLeft,
  ArrowRight,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Compass,
  Activity,
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
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-32 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -left-20 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-[160px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-10 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[130px]" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-16 sm:px-6 lg:px-8 text-center">
        

        {/* Main Headline */}
        <h1
          className={`mx-auto max-w-5xl text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] xl:text-[5.25rem] font-black tracking-tight leading-[1.08] text-white ${
            locale === 'ar' ? 'font-cairo' : 'font-display'
          }`}
        >
          <span className="drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">
            {t('hero.title_p1')}
          </span>{' '}
          <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-blue-400 via-sky-300 to-white bg-clip-text text-transparent filter drop-shadow-[0_4px_24px_rgba(56,189,248,0.25)]">
            {t('hero.title_gradient')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-7 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          {t('hero.subtitle')}
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/missions/create"
            className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all transform hover:-translate-y-0.5 border border-blue-400/40"
          >
            <Sparkles className="h-4 w-4 text-sky-200" />
            <span>{t('hero.cta_ai')}</span>
            <ArrowIcon className="h-4 w-4" />
          </Link>

          <Link
            href="/demo"
            className="flex items-center gap-2.5 rounded-xl border border-blue-500/40 bg-[#0b142c]/90 px-6 py-4 text-sm font-bold text-sky-300 hover:bg-[#101c3e] hover:border-sky-400 transition-all shadow-lg shadow-blue-950/50"
          >
            <Smartphone className="h-4 w-4 text-sky-400" />
            <span>{t('hero.cta_demo')}</span>
          </Link>

          <Link
            href="/missions/browse"
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-4 text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <Compass className="h-4 w-4 text-slate-400" />
            <span>{t('hero.cta_browse')}</span>
          </Link>
        </div>
      </section>

      {/* Live Impact Wall */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-blue-900/35 bg-gradient-to-br from-[#0c1633]/90 via-[#080f24]/95 to-[#040814]/98 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          
          <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-l from-sky-400 via-blue-500 to-indigo-600" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-blue-900/30 pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-sky-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">{t('impact_wall.badge')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gradient-white-blue mt-1.5">{t('impact_wall.title')}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-slate-800">
              <Activity className="h-3.5 w-3.5 text-sky-400" />
              <span>{t('impact_wall.subtitle')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Metric 1 */}
            <div className="rounded-2xl border border-blue-900/30 bg-[#070e22]/80 p-5 text-center hover:border-blue-500/40 transition-all shadow-md group">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-sky-400 mb-3 group-hover:scale-110 transition-transform">
                <TreePine className="h-6 w-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {stats.treesPlanted.toLocaleString()}+
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-400">{t('impact_wall.trees')}</div>
            </div>

            {/* Metric 2 */}
            <div className="rounded-2xl border border-blue-900/30 bg-[#070e22]/80 p-5 text-center hover:border-blue-500/40 transition-all shadow-md group">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {stats.totalImpactHours.toLocaleString()}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-400">{t('impact_wall.hours')}</div>
            </div>

            {/* Metric 3 */}
            <div className="rounded-2xl border border-blue-900/30 bg-[#070e22]/80 p-5 text-center hover:border-blue-500/40 transition-all shadow-md group">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300 mb-3 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {stats.volunteersMobilized.toLocaleString()}+
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-400">{t('impact_wall.volunteers')}</div>
            </div>

            {/* Metric 4 */}
            <div className="rounded-2xl border border-blue-900/30 bg-[#070e22]/80 p-5 text-center hover:border-blue-500/40 transition-all shadow-md group">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                %{stats.fillRatePercentage}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-400">{t('impact_wall.fill_rate')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works: 3 Steps Architecture */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-950/60 border border-blue-500/25 px-3 py-1 text-xs font-bold text-sky-400 mb-3">
            <span>{t('how_it_works.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gradient-white-blue">{t('how_it_works.title')}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-2xl border border-blue-900/30 bg-gradient-to-b from-[#0b142d]/80 to-[#060a17]/90 p-7 hover:border-blue-500/50 transition-all shadow-xl group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-sky-400 font-black text-lg mb-5 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition-all">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t('how_it_works.step1_title')}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('how_it_works.step1_desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-blue-900/30 bg-gradient-to-b from-[#0b142d]/80 to-[#060a17]/90 p-7 hover:border-indigo-500/50 transition-all shadow-xl group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 font-black text-lg mb-5 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t('how_it_works.step2_title')}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('how_it_works.step2_desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-blue-900/30 bg-gradient-to-b from-[#0b142d]/80 to-[#060a17]/90 p-7 hover:border-sky-500/50 transition-all shadow-xl group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600/20 text-sky-400 font-black text-lg mb-5 border border-sky-500/30 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t('how_it_works.step3_title')}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('how_it_works.step3_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Active Missions Showcase */}
      {recentMissions.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gradient-white-blue">{t('missions.recent_title')}</h2>
              <p className="text-xs text-slate-400 mt-1">{t('missions.recent_subtitle')}</p>
            </div>
            <Link
              href="/missions/browse"
              className="flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 bg-blue-950/50 px-3.5 py-1.5 rounded-xl border border-blue-500/30 transition-all"
            >
              <span>{t('missions.view_all')}</span>
              <ChevronIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {recentMissions.map((mission) => {
              const locMission = getLocalizedMission(mission, locale);
              const fillPercentage = locMission.totalSlotsNeeded > 0
                ? Math.round((locMission.totalSlotsFilled / locMission.totalSlotsNeeded) * 100)
                : 0;

              return (
                <div
                  key={locMission._id}
                  className="rounded-2xl border border-blue-900/30 bg-gradient-to-b from-[#0b142d]/75 to-[#060a17]/90 p-6 flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-xl hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-sky-300 border border-blue-500/20">
                        {getLocalizedCategory(locMission.category, t)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        📍 {locMission.venueName}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-snug">
                      {locMission.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {locMission.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-blue-900/30">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-400">{t('missions.team_completion')}:</span>
                      <span className="font-bold text-sky-400">{fillPercentage}% ({mission.totalSlotsFilled}/{mission.totalSlotsNeeded})</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className="h-full progress-bar-green transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, fillPercentage)}%` }}
                      />
                    </div>

                    <Link
                      href={`/missions/${mission._id}`}
                      className="mt-4 block w-full rounded-xl bg-blue-600/20 py-2.5 text-center text-xs font-bold text-sky-300 hover:bg-blue-600 hover:text-white transition-all border border-blue-500/30 shadow-md"
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
