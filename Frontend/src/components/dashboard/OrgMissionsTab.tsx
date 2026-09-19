'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  MapPin,
  Users,
  Clock,
  Flame,
  ArrowRight,
  History,
  CalendarClock,
  PlayCircle,
  UserRound,
} from 'lucide-react';
import { Mission, MissionApplicant } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

type SectionId = 'upcoming' | 'current' | 'history';

function statusLabel(status: string, t: (k: string) => string) {
  const map: Record<string, string> = {
    draft: t('dashboard.status_draft'),
    active: t('dashboard.status_active'),
    in_progress: t('dashboard.status_in_progress'),
    completed: t('dashboard.status_completed'),
    cancelled: t('dashboard.status_cancelled'),
  };
  return map[status] || status;
}

function volunteerName(a: MissionApplicant) {
  const v = a.volunteerId;
  if (v && typeof v === 'object') return v.name || '—';
  return '—';
}

function volunteerMeta(a: MissionApplicant) {
  const v = a.volunteerId;
  if (v && typeof v === 'object') {
    return {
      initials: (v.name || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() || '')
        .join(''),
      city: v.city,
      email: v.email,
    };
  }
  return { initials: '?', city: undefined, email: undefined };
}

function roleName(a: MissionApplicant) {
  const n = a.needId;
  if (n && typeof n === 'object') return n.roleName || '';
  return '';
}

function classifyMission(m: Mission, now: number): SectionId {
  if (m.status === 'completed' || m.status === 'cancelled') return 'history';
  if (m.status === 'in_progress') return 'current';

  const start = m.dateStart ? new Date(m.dateStart).getTime() : NaN;
  if (!Number.isNaN(start)) {
    const dayMs = 24 * 60 * 60 * 1000;
    if (start < now - dayMs) return 'history';
    if (start > now + dayMs && (m.status === 'active' || m.status === 'draft')) return 'upcoming';
    if (m.status === 'active') return 'current';
    if (start >= now) return 'upcoming';
  }

  if (m.status === 'active') return 'current';
  if (m.status === 'draft') return 'upcoming';
  return 'history';
}

function MissionCard({ mission, t }: { mission: Mission; t: (k: string, vars?: Record<string, string | number>) => string }) {
  const applicants = mission.applicants || [];
  const dateStr = mission.dateStart
    ? new Date(mission.dateStart).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  return (
    <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="rounded-md bg-[#e6f4f2] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0d7a6f]">
              {statusLabel(mission.status, t)}
            </span>
            <span className="text-[11px] font-medium text-[#8fa0b3]">{mission.category}</span>
          </div>
          <Link
            href={`/missions/${mission._id}`}
            className="text-base font-bold text-[#0b1f3a] hover:text-[#0d7a6f] transition-colors inline-flex items-center gap-1.5"
          >
            {mission.title}
            <ArrowRight className="h-3.5 w-3.5 opacity-50" />
          </Link>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#5b6b7c]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#0d7a6f]" />
              {mission.venueName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {dateStr}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {mission.totalSlotsFilled}/{mission.totalSlotsNeeded}
            </span>
            <span className="inline-flex items-center gap-1 capitalize">
              <Flame className="h-3.5 w-3.5 text-amber-600" />
              {mission.urgency}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#e8eef4] bg-[#f8fafc] p-3">
        <div className="flex items-center justify-between mb-2.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#5b6b7c]">
            <UserRound className="h-3.5 w-3.5 text-[#0d7a6f]" />
            {t('dashboard.mission_volunteers')}
          </span>
          <span className="text-[11px] font-bold text-[#0d7a6f]">{applicants.length}</span>
        </div>

        {applicants.length === 0 ? (
          <p className="text-xs text-[#8fa0b3] py-1">{t('dashboard.mission_no_volunteers')}</p>
        ) : (
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {applicants.map((a) => {
              const meta = volunteerMeta(a);
              const role = roleName(a);
              return (
                <li
                  key={a._id}
                  className="flex items-center gap-2.5 rounded-lg bg-white border border-[#eef2f6] px-2.5 py-2"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0b1f3a] text-[10px] font-bold text-white">
                    {meta.initials}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0b1f3a] truncate">{volunteerName(a)}</p>
                    <p className="text-[10px] text-[#8fa0b3] truncate">
                      {[role, meta.city].filter(Boolean).join(' · ') || meta.email || '—'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                      a.status === 'accepted'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : a.status === 'rejected'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {a.status}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function OrgMissionsTab({
  missions,
  loading,
  onCreate,
}: {
  missions: Mission[];
  loading?: boolean;
  onCreate: () => void;
}) {
  const { t } = useTranslation();
  const [section, setSection] = useState<SectionId>('current');

  const groups = useMemo(() => {
    const now = Date.now();
    const upcoming: Mission[] = [];
    const current: Mission[] = [];
    const history: Mission[] = [];

    for (const m of missions) {
      const bucket = classifyMission(m, now);
      if (bucket === 'upcoming') upcoming.push(m);
      else if (bucket === 'current') current.push(m);
      else history.push(m);
    }

    const byStartDesc = (a: Mission, b: Mission) =>
      new Date(b.dateStart || 0).getTime() - new Date(a.dateStart || 0).getTime();
    const byStartAsc = (a: Mission, b: Mission) =>
      new Date(a.dateStart || 0).getTime() - new Date(b.dateStart || 0).getTime();

    upcoming.sort(byStartAsc);
    current.sort(byStartDesc);
    history.sort(byStartDesc);

    return { upcoming, current, history };
  }, [missions]);

  const tabs: {
    id: SectionId;
    label: string;
    hint: string;
    empty: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
  }[] = [
    {
      id: 'upcoming',
      label: t('dashboard.missions_upcoming'),
      hint: t('dashboard.missions_upcoming_hint'),
      empty: t('dashboard.missions_upcoming_empty'),
      icon: CalendarClock,
      count: groups.upcoming.length,
    },
    {
      id: 'current',
      label: t('dashboard.missions_current'),
      hint: t('dashboard.missions_current_hint'),
      empty: t('dashboard.missions_current_empty'),
      icon: PlayCircle,
      count: groups.current.length,
    },
    {
      id: 'history',
      label: t('dashboard.missions_history'),
      hint: t('dashboard.missions_history_hint'),
      empty: t('dashboard.missions_history_empty'),
      icon: History,
      count: groups.history.length,
    },
  ];

  const activeTab = tabs.find((tab) => tab.id === section) || tabs[1];
  const activeMissions = groups[section];
  const ActiveIcon = activeTab.icon;

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="h-8 w-8 border-3 border-[#0d7a6f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#0b1f3a]">{t('dashboard.tab_missions')}</h3>
          <p className="text-xs text-[#5b6b7c] mt-0.5">{t('dashboard.missions_sections_hint')}</p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="btn-primary inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold self-start"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          {t('dashboard.cta_create')}
        </button>
      </div>

      {missions.length === 0 ? (
        <div className="surface-panel rounded-2xl border border-dashed border-[#d8e0ea] bg-white p-10 text-center">
          <p className="text-sm font-semibold text-[#0b1f3a]">{t('dashboard.empty_missions')}</p>
          <button
            type="button"
            onClick={onCreate}
            className="btn-primary mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            <PlusCircle className="h-4 w-4" />
            {t('dashboard.cta_create')}
          </button>
        </div>
      ) : (
        <>
          <div
            role="tablist"
            aria-label={t('dashboard.tab_missions')}
            className="grid grid-cols-3 gap-1 p-1 rounded-2xl border border-[#d8e0ea] bg-[#f3f5f8]"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = section === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSection(tab.id)}
                  className={`relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl px-2 sm:px-3 py-2.5 text-center transition-all ${
                    active
                      ? 'bg-white text-[#0d7a6f] shadow-sm border border-[#d8e0ea]'
                      : 'text-[#5b6b7c] hover:text-[#0b1f3a]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] sm:text-xs font-bold leading-tight">{tab.label}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                      active ? 'bg-[#e6f4f2] text-[#0d7a6f]' : 'bg-white/70 text-[#8fa0b3]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#d8e0ea] bg-white text-[#0d7a6f]">
              <ActiveIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-[#0b1f3a]">{activeTab.label}</h4>
              <p className="text-xs text-[#5b6b7c] mt-0.5">{activeTab.hint}</p>
            </div>
          </div>

          {activeMissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d8e0ea] bg-white/80 px-4 py-10 text-center text-xs text-[#8fa0b3]">
              {activeTab.empty}
            </div>
          ) : (
            <div className="grid gap-3">
              {activeMissions.map((m) => (
                <MissionCard key={m._id} mission={m} t={t} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
