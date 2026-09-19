'use client';

import React, { useMemo } from 'react';
import {
  BarChart3,
  Users,
  ListChecks,
  Flame,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Mission } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  active: '#0d7a6f',
  in_progress: '#2563eb',
  completed: '#059669',
  cancelled: '#dc2626',
};

const URGENCY_COLORS: Record<string, string> = {
  low: '#94a3b8',
  medium: '#0d7a6f',
  high: '#d97706',
  urgent: '#dc2626',
};

function DonutChart({
  segments,
  size = 160,
  thickness = 18,
  centerLabel,
  centerSub,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel: string;
  centerSub?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#eef2f6"
          strokeWidth={thickness}
        />
        {segments
          .filter((s) => s.value > 0)
          .map((s) => {
            const len = (s.value / total) * c;
            const dash = `${len} ${c - len}`;
            const el = (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        <span className="text-xl font-bold text-[#0b1f3a] leading-none">{centerLabel}</span>
        {centerSub && <span className="text-[10px] font-semibold text-[#8fa0b3] mt-1 uppercase tracking-wide">{centerSub}</span>}
      </div>
    </div>
  );
}

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-[#0b1f3a] truncate">{label}</span>
        <span className="font-bold text-[#5b6b7c] tabular-nums shrink-0">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#eef2f6] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function OrgStatsTab({ missions }: { missions: Mission[] }) {
  const { t } = useTranslation();

  const analytics = useMemo(() => {
    const byStatus: Record<string, number> = {
      draft: 0,
      active: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
    const byUrgency: Record<string, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
    const byCategory: Record<string, number> = {};

    let filled = 0;
    let needed = 0;
    let hours = 0;
    const volunteerIds = new Set<string>();

    for (const m of missions) {
      byStatus[m.status] = (byStatus[m.status] || 0) + 1;
      byUrgency[m.urgency] = (byUrgency[m.urgency] || 0) + 1;
      byCategory[m.category || 'Other'] = (byCategory[m.category || 'Other'] || 0) + 1;
      filled += m.totalSlotsFilled || 0;
      needed += m.totalSlotsNeeded || 0;
      hours += (m.estimatedHoursPerVolunteer || 0) * (m.totalSlotsFilled || 0);

      for (const a of m.applicants || []) {
        const v = a.volunteerId;
        if (v && typeof v === 'object' && v._id) volunteerIds.add(v._id);
      }
    }

    const missionBars = [...missions]
      .sort((a, b) => (b.totalSlotsFilled || 0) - (a.totalSlotsFilled || 0))
      .slice(0, 8)
      .map((m) => ({
        label: m.title,
        filled: m.totalSlotsFilled || 0,
        needed: m.totalSlotsNeeded || 0,
      }));

    return {
      byStatus,
      byUrgency,
      byCategory,
      filled,
      needed,
      hours,
      uniqueVolunteers: volunteerIds.size,
      fillRate: needed > 0 ? Math.round((filled / needed) * 100) : 0,
      missionBars,
      maxFilled: Math.max(...missionBars.map((b) => b.filled), 1),
      activeCount: (byStatus.active || 0) + (byStatus.in_progress || 0),
      completedCount: byStatus.completed || 0,
    };
  }, [missions]);

  const statusSegments = Object.entries(analytics.byStatus).map(([k, v]) => ({
    label: t(`dashboard.status_${k}`),
    value: v,
    color: STATUS_COLORS[k] || '#94a3b8',
  }));

  const urgencySegments = Object.entries(analytics.byUrgency).map(([k, v]) => ({
    label: k,
    value: v,
    color: URGENCY_COLORS[k] || '#94a3b8',
  }));

  const categoryEntries = Object.entries(analytics.byCategory).sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(...categoryEntries.map(([, v]) => v), 1);

  const kpis = [
    { label: t('dashboard.stat_missions'), value: missions.length, icon: ListChecks, color: 'text-[#0d7a6f]', bg: 'bg-[#e6f4f2]' },
    { label: t('dashboard.stat_active'), value: analytics.activeCount, icon: Flame, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: t('dashboard.stats_unique_volunteers'), value: analytics.uniqueVolunteers, icon: Users, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: t('dashboard.stat_fill'), value: `${analytics.fillRate}%`, icon: ShieldCheck, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: t('dashboard.stats_hours'), value: analytics.hours, icon: Clock, color: 'text-[#0b1f3a]', bg: 'bg-slate-100' },
    { label: t('dashboard.stats_completed'), value: analytics.completedCount, icon: BarChart3, color: 'text-teal-800', bg: 'bg-teal-50' },
  ];

  if (missions.length === 0) {
    return (
      <div className="surface-panel rounded-2xl border border-dashed border-[#d8e0ea] bg-white p-12 text-center">
        <BarChart3 className="h-10 w-10 text-[#b8c6d6] mx-auto mb-3" />
        <p className="text-sm font-semibold text-[#0b1f3a]">{t('dashboard.stats_empty')}</p>
        <p className="mt-1 text-xs text-[#5b6b7c]">{t('dashboard.stats_empty_hint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0d7a6f]">{t('dashboard.tab_stats')}</p>
        <h2 className="mt-1 text-xl font-bold text-[#0b1f3a]">{t('dashboard.stats_title')}</h2>
        <p className="mt-1 text-sm text-[#5b6b7c]">{t('dashboard.stats_subtitle')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-4 flex items-center gap-3">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${k.bg} ${k.color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8fa0b3]">{k.label}</p>
                <p className="text-2xl font-bold text-[#0b1f3a] tabular-nums leading-tight">{k.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Status donut */}
        <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-5 sm:p-6">
          <h3 className="text-sm font-bold text-[#0b1f3a] mb-4">{t('dashboard.stats_by_status')}</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <DonutChart
              segments={statusSegments}
              centerLabel={String(missions.length)}
              centerSub={t('dashboard.stat_missions')}
            />
            <ul className="flex-1 w-full space-y-2">
              {statusSegments.map((s) => (
                <li key={s.label} className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 font-semibold text-[#0b1f3a]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-bold text-[#5b6b7c] tabular-nums">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Fill rate circle */}
        <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-5 sm:p-6">
          <h3 className="text-sm font-bold text-[#0b1f3a] mb-4">{t('dashboard.stats_fill_detail')}</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <DonutChart
              segments={[
                { label: 'filled', value: analytics.filled, color: '#0d7a6f' },
                { label: 'open', value: Math.max(analytics.needed - analytics.filled, 0), color: '#e2e8f0' },
              ]}
              centerLabel={`${analytics.fillRate}%`}
              centerSub={t('dashboard.stat_fill')}
            />
            <div className="flex-1 w-full space-y-3 text-sm">
              <div className="flex justify-between border-b border-[#eef2f6] pb-2">
                <span className="text-[#5b6b7c]">{t('dashboard.stats_slots_filled')}</span>
                <span className="font-bold text-[#0b1f3a]">{analytics.filled}</span>
              </div>
              <div className="flex justify-between border-b border-[#eef2f6] pb-2">
                <span className="text-[#5b6b7c]">{t('dashboard.stats_slots_needed')}</span>
                <span className="font-bold text-[#0b1f3a]">{analytics.needed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5b6b7c]">{t('dashboard.stats_slots_open')}</span>
                <span className="font-bold text-[#0b1f3a]">{Math.max(analytics.needed - analytics.filled, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Urgency donut */}
        <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-5 sm:p-6">
          <h3 className="text-sm font-bold text-[#0b1f3a] mb-4">{t('dashboard.stats_by_urgency')}</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <DonutChart
              segments={urgencySegments}
              size={140}
              centerLabel={String(missions.length)}
              centerSub="100%"
            />
            <ul className="flex-1 w-full space-y-2">
              {urgencySegments.map((s) => (
                <li key={s.label} className="flex items-center justify-between text-xs capitalize">
                  <span className="inline-flex items-center gap-2 font-semibold text-[#0b1f3a]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-bold text-[#5b6b7c] tabular-nums">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Categories bars */}
        <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-5 sm:p-6">
          <h3 className="text-sm font-bold text-[#0b1f3a] mb-4">{t('dashboard.stats_by_category')}</h3>
          <div className="space-y-3">
            {categoryEntries.map(([cat, count], i) => (
              <BarRow
                key={cat}
                label={cat}
                value={count}
                max={maxCat}
                color={['#0d7a6f', '#0b1f3a', '#2563eb', '#d97706', '#059669'][i % 5]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Volunteers per mission bars */}
      <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-5 sm:p-6">
        <h3 className="text-sm font-bold text-[#0b1f3a] mb-1">{t('dashboard.stats_volunteers_per_mission')}</h3>
        <p className="text-xs text-[#5b6b7c] mb-4">{t('dashboard.stats_volunteers_per_mission_hint')}</p>
        <div className="space-y-3">
          {analytics.missionBars.map((b) => (
            <div key={b.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#0b1f3a] truncate">{b.label}</span>
                <span className="font-bold text-[#5b6b7c] tabular-nums shrink-0">
                  {b.filled}/{b.needed}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[#eef2f6] overflow-hidden relative">
                <div
                  className="absolute inset-y-0 start-0 rounded-full bg-[#0d7a6f]/25"
                  style={{ width: `${b.needed > 0 ? 100 : 0}%` }}
                />
                <div
                  className="absolute inset-y-0 start-0 rounded-full bg-[#0d7a6f] transition-all duration-700"
                  style={{
                    width: `${b.needed > 0 ? Math.min(100, Math.round((b.filled / b.needed) * 100)) : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
