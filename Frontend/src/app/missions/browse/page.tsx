'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, Search, MapPin, Clock, Flame, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { api, Mission } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import { getLocalizedMission, getLocalizedCategory, getLocalizedUrgency } from '@/lib/i18nData';

const CATEGORIES = ['All', 'Environmental', 'Humanitarian', 'Health', 'Education', 'Technology'];

export default function BrowseMissionsPage() {
  const { t, isRTL, locale } = useTranslation();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const data = await api.getMissions();
      setMissions(data);
    } catch (err) {
      console.error('Error fetching missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const filteredMissions = missions.filter((m) => {
    const matchesCat = selectedCat === 'All' || m.category === selectedCat;
    const matchesSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.venueName.toLowerCase().includes(search.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-950/60 border border-blue-500/25 px-3.5 py-1 text-xs font-bold text-sky-300 mb-3 shadow-sm">
          <Compass className="h-3.5 w-3.5 text-sky-400" />
          <span>{t('browse.badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gradient-white-blue">{t('browse.title')}</h1>
        <p className="mt-2 text-sm text-slate-400">
          {t('browse.subtitle')}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-blue-900/30 bg-gradient-to-r from-[#0c1633]/80 via-[#070e22]/90 to-[#050914]/95 p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl shadow-xl">
        {/* Search Input */}
        <div className="relative w-full md:w-88">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('browse.search_placeholder')}
            className="w-full rounded-xl border border-slate-800 bg-[#050a16]/90 pr-10 pl-4 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedCat === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/40'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Missions Grid */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-sky-400" />
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="rounded-3xl border border-blue-900/30 bg-[#080e22]/60 p-12 text-center">
          <Compass className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white">{t('browse.no_results_title')}</h3>
          <p className="mt-1 text-sm text-slate-400">{t('browse.no_results_desc')}</p>
          <Link
            href="/missions/create"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/25"
          >
            <span>{t('browse.create_btn')}</span>
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMissions.map((mission) => {
            const locMission = getLocalizedMission(mission, locale);
            const fillPct = locMission.totalSlotsNeeded > 0
              ? Math.round((locMission.totalSlotsFilled / locMission.totalSlotsNeeded) * 100)
              : 0;

            return (
              <div
                key={locMission._id}
                className="rounded-3xl border border-blue-900/30 bg-gradient-to-b from-[#0c1633]/80 via-[#070e22]/90 to-[#040814]/95 p-6 flex flex-col justify-between hover:border-blue-500/45 transition-all shadow-xl hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-sky-300 border border-blue-500/20">
                      {getLocalizedCategory(locMission.category, t)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-amber-300 bg-amber-950/30 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                      <Flame className="h-3.5 w-3.5 text-amber-400" /> {getLocalizedUrgency(locMission.urgency, t)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug">
                    {locMission.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {locMission.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
                      <MapPin className="h-3.5 w-3.5 text-sky-400" /> {locMission.venueName}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" /> {locMission.estimatedHoursPerVolunteer} {t('browse.hours_suffix')}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-900/30">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400">{t('browse.slots_completion')}:</span>
                    <span className="font-bold text-sky-400">
                      {mission.totalSlotsFilled} / {mission.totalSlotsNeeded} ({fillPct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden mb-4 border border-slate-800">
                    <div
                      className="h-full progress-bar-green transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, fillPct)}%` }}
                    />
                  </div>

                  <Link
                    href={`/missions/${mission._id}`}
                    className="block w-full rounded-xl bg-blue-600/20 py-2.5 text-center text-xs font-bold text-sky-300 hover:bg-blue-600 hover:text-white transition-all border border-blue-500/30 shadow-md"
                  >
                    {t('missions.open_ops_room')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
