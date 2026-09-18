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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0d7a6f] mb-2 flex items-center gap-2">
          <Compass className="h-3.5 w-3.5" />
          {t('browse.badge')}
        </p>
        <h1 className={`text-3xl sm:text-4xl font-semibold text-[#0b1f3a] ${locale === 'ar' ? 'font-cairo' : 'font-display'}`}>
          {t('browse.title')}
        </h1>
        <p className="mt-2 text-sm text-[#5b6b7c]">{t('browse.subtitle')}</p>
      </div>

      <div className="surface-panel rounded-xl p-4 mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5b6b7c]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('browse.search_placeholder')}
            className="w-full rounded-lg border border-[#d8e0ea] bg-white ps-10 pe-4 py-2.5 text-sm text-[#0b1f3a] placeholder:text-[#8fa0b3] focus:border-[#0d7a6f] focus:outline-none focus:ring-2 focus:ring-[#0d7a6f]/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCat === cat
                  ? 'bg-[#0b1f3a] text-white'
                  : 'bg-white text-[#5b6b7c] border border-[#d8e0ea] hover:text-[#0b1f3a] hover:border-[#b8c6d6]'
              }`}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <RefreshCw className="h-7 w-7 animate-spin text-[#0d7a6f]" />
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="surface-panel rounded-xl p-12 text-center">
          <Compass className="mx-auto h-10 w-10 text-[#b8c6d6] mb-3" />
          <h3 className="text-lg font-semibold text-[#0b1f3a]">{t('browse.no_results_title')}</h3>
          <p className="mt-1 text-sm text-[#5b6b7c]">{t('browse.no_results_desc')}</p>
          <Link
            href="/missions/create"
            className="btn-primary mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
          >
            {t('browse.create_btn')}
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredMissions.map((mission) => {
            const locMission = getLocalizedMission(mission, locale);
            const fillPct =
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
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#8a5a10] bg-[#f8f1e4] px-2 py-1 rounded-md">
                      <Flame className="h-3 w-3" />
                      {getLocalizedUrgency(locMission.urgency, t)}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#0b1f3a] mb-2 line-clamp-2 leading-snug">
                    {locMission.title}
                  </h3>
                  <p className="text-sm text-[#5b6b7c] line-clamp-3 mb-4 leading-relaxed">
                    {locMission.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#5b6b7c] mb-4">
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#d8e0ea] bg-white px-2 py-1">
                      <MapPin className="h-3.5 w-3.5 text-[#0d7a6f]" />
                      {locMission.venueName}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#d8e0ea] bg-white px-2 py-1">
                      <Clock className="h-3.5 w-3.5 text-[#0b1f3a]" />
                      {locMission.estimatedHoursPerVolunteer} {t('browse.hours_suffix')}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#d8e0ea]">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[#5b6b7c]">{t('browse.slots_completion')}</span>
                    <span className="font-semibold text-[#0b1f3a]">
                      {mission.totalSlotsFilled} / {mission.totalSlotsNeeded} ({fillPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#eef2f6] overflow-hidden mb-4">
                    <div
                      className="h-full progress-bar-civic rounded-full transition-all"
                      style={{ width: `${Math.min(100, fillPct)}%` }}
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
      )}
    </div>
  );
}
