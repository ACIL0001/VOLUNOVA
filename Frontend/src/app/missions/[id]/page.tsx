'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  Clock,
  Flame,
  CheckCircle2,
  Users,
  Send,
  RefreshCw,
  Award,
  ArrowRight,
  ArrowLeft,
  Activity,
} from 'lucide-react';
import { api, Mission } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import { getLocalizedMission, getLocalizedCategory, getLocalizedUrgency, getLocalizedVolunteerSkill } from '@/lib/i18nData';

export default function MissionOpsRoom() {
  const params = useParams();
  const missionId = params?.id as string;
  const { t, isRTL, locale } = useTranslation();

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>({});
  const [autoRefreshCount, setAutoRefreshCount] = useState(0);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const fetchMission = async () => {
    if (!missionId) return;
    try {
      const data = await api.getMission(missionId);
      setMission(data);
    } catch (err) {
      console.error('Error fetching mission ops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMission();
    // Poll every 3 seconds to capture live joins from phone/demo screen
    const timer = setInterval(() => {
      fetchMission();
      setAutoRefreshCount((c) => c + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, [missionId]);

  const handleInvite = (volId: string) => {
    setInvitedMap((prev) => ({ ...prev, [volId]: true }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-sky-400" />
          <span className="text-sm font-semibold text-slate-400">{t('ops.loading')}</span>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <h2 className="text-xl font-bold text-white">{t('ops.not_found')}</h2>
        <Link href="/missions/browse" className="mt-4 inline-block text-sm text-sky-400">
          {t('ops.back')}
        </Link>
      </div>
    );
  }

  const locMission = getLocalizedMission(mission, locale);
  const fillPercentage = locMission.totalSlotsNeeded > 0
    ? Math.round((locMission.totalSlotsFilled / locMission.totalSlotsNeeded) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back link & Live status banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/missions/browse"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-all bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800"
        >
          <BackArrow className="h-4 w-4" />
          <span>{t('ops.back')}</span>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/50 px-4 py-1.5 text-xs font-bold text-sky-300 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
          </span>
          <span>{t('ops.live_badge')}</span>
        </div>
      </div>

      {/* Mission Title Header */}
      <div className="rounded-3xl border border-blue-900/35 bg-gradient-to-br from-[#0c1633]/90 via-[#070e22]/95 to-[#040814]/98 p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-sky-300 border border-blue-500/20">
                {getLocalizedCategory(locMission.category, t)}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <MapPin className="h-3.5 w-3.5 text-sky-400" /> {locMission.venueName}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <Clock className="h-3.5 w-3.5 text-indigo-400" /> {locMission.estimatedHoursPerVolunteer} {t('browse.hours_suffix')}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-500/30">
                <Flame className="h-3.5 w-3.5 text-amber-400" /> {t('create_mission.urgency_tag')}: {getLocalizedUrgency(locMission.urgency, t)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gradient-white-blue leading-tight">
              {locMission.title}
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed font-normal">
              {locMission.description}
            </p>
          </div>

          {/* Quick Stats Block */}
          <div className="flex md:flex-col items-center justify-center rounded-2xl border border-blue-900/30 bg-[#070e22]/90 p-5 text-center min-w-[200px] shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('ops.completion_rate')}</span>
            <span className="text-4xl font-black text-sky-400 my-1">{fillPercentage}%</span>
            <span className="text-xs text-slate-400 font-medium">
              {locMission.totalSlotsFilled} {t('ops.slots_of')} {locMission.totalSlotsNeeded} {t('ops.slots_filled_desc')}
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-8 pt-6 border-t border-blue-900/30">
          <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full progress-bar-green transition-all duration-700 shadow-md rounded-full"
              style={{ width: `${Math.min(100, fillPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Extracted Operational Needs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-400" />
              <span>{t('ops.roles_title')}</span>
            </h2>
            <span className="text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
              {locMission.needs?.length || 0} {t('ops.extracted_roles_count')}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {locMission.needs?.map((need) => {
              const isFilled = need.quantityFulfilled >= need.quantityNeeded;
              const pct = need.quantityNeeded > 0
                ? Math.round((need.quantityFulfilled / need.quantityNeeded) * 100)
                : 0;

              return (
                <div
                  key={need._id}
                  className={`rounded-2xl p-5 border transition-all shadow-lg ${
                    isFilled
                      ? 'border-blue-500/50 bg-[#0c1a3b]/50'
                      : 'border-blue-900/30 bg-[#080f24]/80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-bold text-white leading-snug">{need.roleName}</h3>
                    {isFilled ? (
                      <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-bold text-sky-300 border border-blue-500/30">
                        <CheckCircle2 className="h-3 w-3 text-sky-400" /> {t('ops.status_completed')}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
                        {t('ops.status_open')}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 mb-4">
                    {t('ops.skill_required')}: <span className="text-slate-200 font-semibold">{need.skillTag}</span>
                  </div>

                  {/* Need Progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">{t('ops.available_slots')}:</span>
                      <span className="font-bold text-sky-400">
                        {need.quantityFulfilled} / {need.quantityNeeded} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isFilled ? 'progress-bar-green' : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Smart Matchmaking Pool */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-400" />
              <span>{t('ops.smart_match_title')}</span>
            </h2>
            <span className="text-xs text-slate-400">{t('ops.smart_match_algo')}</span>
          </div>

          <div className="rounded-2xl border border-blue-900/30 bg-[#080f24]/80 p-4 divide-y divide-blue-900/25 shadow-xl">
            {mission.matchedVolunteers?.slice(0, 5).map((vol) => {
              const isInvited = invitedMap[vol._id];

              return (
                <div key={vol._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {vol.avatar ? (
                      <img
                        src={vol.avatar}
                        alt={vol.name}
                        className="h-11 w-11 rounded-full object-cover border border-blue-500/30 flex-shrink-0"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center border border-blue-400/30 flex-shrink-0 shadow-inner">
                        {vol.name ? vol.name.trim().charAt(0).toUpperCase() : 'V'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{vol.name}</span>
                        {vol.impactHours > 0 && vol.matchScore ? (
                          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-black text-sky-300 border border-blue-500/30">
                            {vol.matchScore}% {t('ops.match_score')}
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                            ✨ {t('ops.new_profile')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        📍 {vol.city} | {t('ops.suggested_role')}: <span className="text-slate-300 font-semibold">{vol.matchedRole}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                        {vol.reliabilityScore > 0 ? (
                          <span>🎖️ {t('ops.reliability')}: {vol.reliabilityScore}%</span>
                        ) : (
                          <span className="text-slate-400">🎖️ {t('ops.new_volunteer')}</span>
                        )}
                        <span>•</span>
                        <span>⏱️ {vol.impactHours || 0} {t('ops.prev_hours')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInvite(vol._id)}
                    disabled={isInvited}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex-shrink-0 ${
                      isInvited
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600/20 text-sky-300 hover:bg-blue-600 hover:text-white border border-blue-500/30 shadow-sm'
                    }`}
                  >
                    {isInvited ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{t('ops.invited_btn')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>{t('ops.invite_btn')}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
