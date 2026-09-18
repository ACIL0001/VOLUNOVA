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
          <RefreshCw className="h-8 w-8 animate-spin text-[#0d7a6f]" />
          <span className="text-sm font-semibold text-[#5b6b7c]">{t('ops.loading')}</span>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <h2 className="text-xl font-bold text-[#0b1f3a]">{t('ops.not_found')}</h2>
        <Link href="/missions/browse" className="mt-4 inline-block text-sm font-semibold text-[#0d7a6f] hover:underline">
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
          className="flex items-center gap-1.5 text-xs font-semibold text-[#5b6b7c] hover:text-[#0b1f3a] transition-all bg-white px-3.5 py-2 rounded-xl border border-[#d8e0ea] shadow-xs hover:border-[#b8c6d6]"
        >
          <BackArrow className="h-4 w-4" />
          <span>{t('ops.back')}</span>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>{t('ops.live_badge')}</span>
        </div>
      </div>

      {/* Mission Title Header Container */}
      <div className="surface-panel rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden bg-white border border-[#d8e0ea] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full bg-[#e6f4f2] px-3 py-1 text-xs font-bold text-[#0d7a6f] border border-[#0d7a6f]/20">
                {getLocalizedCategory(locMission.category, t)}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#5b6b7c] bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#d8e0ea]">
                <MapPin className="h-3.5 w-3.5 text-[#0d7a6f]" /> {locMission.venueName}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#5b6b7c] bg-[#f8fafc] px-2.5 py-1 rounded-lg border border-[#d8e0ea]">
                <Clock className="h-3.5 w-3.5 text-[#5b6b7c]" /> {locMission.estimatedHoursPerVolunteer} {t('browse.hours_suffix')}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Flame className="h-3.5 w-3.5 text-amber-600" /> {t('create_mission.urgency_tag')}: {getLocalizedUrgency(locMission.urgency, t)}
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold text-[#0b1f3a] leading-tight ${locale === 'ar' ? 'font-cairo' : 'font-display'}`}>
              {locMission.title}
            </h1>
            <p className="mt-3 text-sm text-[#5b6b7c] leading-relaxed font-normal">
              {locMission.description}
            </p>
          </div>

          {/* Quick Stats Block */}
          <div className="flex md:flex-col items-center justify-center rounded-xl border border-[#d8e0ea] bg-[#f8fafc] p-5 text-center min-w-[200px] shadow-xs">
            <span className="text-xs font-bold text-[#5b6b7c] uppercase tracking-wider">{t('ops.completion_rate')}</span>
            <span className="text-4xl font-black text-[#0d7a6f] my-1">{fillPercentage}%</span>
            <span className="text-xs text-[#5b6b7c] font-medium">
              {locMission.totalSlotsFilled} {t('ops.slots_of')} {locMission.totalSlotsNeeded} {t('ops.slots_filled_desc')}
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-8 pt-6 border-t border-[#d8e0ea]">
          <div className="h-3 w-full rounded-full bg-[#eef2f6] overflow-hidden border border-[#d8e0ea]">
            <div
              className="h-full progress-bar-civic transition-all duration-700 rounded-full"
              style={{ width: `${Math.min(100, fillPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Extracted Operational Needs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#0d7a6f]" />
              <span>{t('ops.roles_title')}</span>
            </h2>
            <span className="text-xs font-semibold text-[#5b6b7c] bg-white px-2.5 py-1 rounded-lg border border-[#d8e0ea] shadow-xs">
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
                  className={`rounded-2xl p-5 border transition-all shadow-xs ${
                    isFilled
                      ? 'border-[#0d7a6f]/30 bg-[#f0f9f8]'
                      : 'border-[#d8e0ea] bg-white hover:border-[#b8c6d6]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#0b1f3a] leading-snug">{need.roleName}</h3>
                    {isFilled ? (
                      <span className="flex items-center gap-1 rounded-full bg-[#e6f4f2] px-2.5 py-0.5 text-[11px] font-bold text-[#0d7a6f] border border-[#0d7a6f]/30">
                        <CheckCircle2 className="h-3 w-3 text-[#0d7a6f]" /> {t('ops.status_completed')}
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] font-semibold text-[#5b6b7c] border border-[#d8e0ea]">
                        {t('ops.status_open')}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#5b6b7c] mb-4">
                    {t('ops.skill_required')}: <span className="text-[#0b1f3a] font-semibold">{need.skillTag}</span>
                  </div>

                  {/* Need Progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#5b6b7c]">{t('ops.available_slots')}:</span>
                      <span className="font-bold text-[#0d7a6f]">
                        {need.quantityFulfilled} / {need.quantityNeeded} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#eef2f6] overflow-hidden border border-[#d8e0ea]">
                      <div
                        className="h-full progress-bar-civic transition-all duration-500 rounded-full"
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
            <h2 className="text-lg font-bold text-[#0b1f3a] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#0d7a6f]" />
              <span>{t('ops.smart_match_title')}</span>
            </h2>
            <span className="text-xs font-medium text-[#5b6b7c]">{t('ops.smart_match_algo')}</span>
          </div>

          <div className="rounded-2xl border border-[#d8e0ea] bg-white p-4 divide-y divide-[#d8e0ea] shadow-xs">
            {mission.matchedVolunteers?.slice(0, 5).map((vol) => {
              const isInvited = invitedMap[vol._id];

              return (
                <div key={vol._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {vol.avatar ? (
                      <img
                        src={vol.avatar}
                        alt={vol.name}
                        className="h-11 w-11 rounded-full object-cover border border-[#d8e0ea] flex-shrink-0"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-linear-to-br from-[#0d7a6f] to-[#0b1f3a] text-white font-bold text-sm flex items-center justify-center border border-[#0d7a6f]/30 flex-shrink-0 shadow-xs">
                        {vol.name ? vol.name.trim().charAt(0).toUpperCase() : 'V'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#0b1f3a]">{vol.name}</span>
                        {vol.impactHours > 0 && vol.matchScore ? (
                          <span className="rounded-full bg-[#e6f4f2] px-2 py-0.5 text-[10px] font-bold text-[#0d7a6f] border border-[#0d7a6f]/25">
                            {vol.matchScore}% {t('ops.match_score')}
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            ✨ {t('ops.new_profile')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#5b6b7c] mt-0.5">
                        📍 {vol.city} | {t('ops.suggested_role')}: <span className="text-[#0b1f3a] font-semibold">{vol.matchedRole}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#5b6b7c] mt-1">
                        {vol.reliabilityScore > 0 ? (
                          <span>🎖️ {t('ops.reliability')}: {vol.reliabilityScore}%</span>
                        ) : (
                          <span className="text-[#0d7a6f] font-medium">🎖️ {t('ops.new_volunteer')}</span>
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
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all flex-shrink-0 ${
                      isInvited
                        ? 'bg-[#f1f5f9] text-[#8fa0b3] border border-[#d8e0ea] cursor-not-allowed'
                        : 'btn-primary'
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
