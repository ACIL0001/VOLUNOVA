'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PlusCircle,
  ListChecks,
  Building2,
  ShieldCheck,
  Users,
  MapPin,
  Clock,
  Flame,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import OrgHeader from '@/components/layout/OrgHeader';
import CreateMissionStudio from '@/components/missions/CreateMissionStudio';
import OrgProfileTab from '@/components/dashboard/OrgProfileTab';
import OrgSupportTab from '@/components/dashboard/OrgSupportTab';
import { api, Mission } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';

type TabId = 'overview' | 'create' | 'missions' | 'profile' | 'support';

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

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { t, locale } = useTranslation();

  const initialTab = (searchParams.get('tab') as TabId) || 'overview';
  const [tab, setTab] = useState<TabId>(
    ['overview', 'create', 'missions', 'profile', 'support'].includes(initialTab) ? initialTab : 'overview'
  );
  const [missions, setMissions] = useState<Mission[]>([]);
  const [organization, setOrganization] = useState<any>(user?.organization || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishNotice, setPublishNotice] = useState<string | null>(null);

  const loadMine = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyMissions();
      setMissions(data.missions || []);
      if (data.organization) setOrganization(data.organization);
    } catch (err: any) {
      setError(err?.message || t('dashboard.load_error'));
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadMine();
    void refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMine]);

  useEffect(() => {
    const q = searchParams.get('tab') as TabId;
    if (q && ['overview', 'create', 'missions', 'profile', 'support'].includes(q) && q !== tab) {
      setTab(q);
    }
  }, [searchParams, tab]);

  const switchTab = (next: TabId) => {
    setTab(next);
    router.replace(`/dashboard?tab=${next}`, { scroll: false });
  };

  const stats = useMemo(() => {
    const active = missions.filter((m) => m.status === 'active' || m.status === 'in_progress').length;
    const filled = missions.reduce((acc, m) => acc + (m.totalSlotsFilled || 0), 0);
    const needed = missions.reduce((acc, m) => acc + (m.totalSlotsNeeded || 0), 0);
    return {
      total: missions.length,
      active,
      filled,
      needed,
      fillRate: needed > 0 ? Math.round((filled / needed) * 100) : 0,
    };
  }, [missions]);

  const verification = organization?.verificationStatus || user?.organization?.verificationStatus || 'pending';

  const headerTitle =
    tab === 'create'
      ? t('dashboard.tab_create')
      : tab === 'missions'
        ? t('dashboard.tab_missions')
        : tab === 'profile'
          ? (t('dashboard.tab_profile') || 'Profil Organisation')
          : tab === 'support'
            ? (t('dashboard.tab_support') || 'Support & Réclamations')
            : t('dashboard.tab_overview');

  return (
    <>
      <OrgHeader
        title={headerTitle}
        subtitle={organization?.name || user?.name}
        onRefresh={tab !== 'create' ? loadMine : undefined}
        loading={loading}
      />

      <main className="p-6 space-y-6 max-w-6xl w-full mx-auto">
        {publishNotice && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1 font-medium">{publishNotice}</span>
            <button type="button" onClick={() => setPublishNotice(null)} className="text-xs font-semibold underline">
              OK
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={loadMine}
              className="inline-flex items-center gap-1 text-xs font-bold underline"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t('dashboard.retry')}
            </button>
          </div>
        )}

        {tab === 'overview' && (
          <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#0d7a6f]">
                  {t('dashboard.badge')}
                </p>
                <h2
                  className={`mt-1 text-2xl font-semibold text-[#0b1f3a] ${
                    locale === 'ar' ? 'font-cairo' : 'font-display'
                  }`}
                >
                  {organization?.name || user?.name || t('dashboard.title')}
                </h2>
                <p className="mt-1 text-sm text-[#5b6b7c]">{t('dashboard.subtitle')}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                      verification === 'verified'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : verification === 'rejected'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    {verification === 'verified'
                      ? t('dashboard.verified')
                      : verification === 'rejected'
                        ? t('dashboard.rejected')
                        : t('dashboard.pending')}
                  </span>
                  {organization?.category && (
                    <span className="inline-flex items-center rounded-lg border border-[#d8e0ea] bg-white px-2.5 py-1 text-xs font-medium text-[#5b6b7c]">
                      {organization.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => switchTab('create')}
                className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                <PlusCircle className="h-4 w-4" />
                {t('dashboard.cta_create')}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t('dashboard.stat_missions'), value: stats.total, icon: ListChecks },
                { label: t('dashboard.stat_active'), value: stats.active, icon: Flame },
                { label: t('dashboard.stat_volunteers'), value: stats.filled, icon: Users },
                { label: t('dashboard.stat_fill'), value: `${stats.fillRate}%`, icon: ShieldCheck },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5b6b7c]">{s.label}</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f4f2] text-[#0d7a6f]">
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-[#0b1f3a] tracking-tight">{loading ? '—' : s.value}</p>
                  </div>
                );
              })}
            </div>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#0b1f3a]">{t('dashboard.recent_missions')}</h3>
                <button
                  type="button"
                  onClick={() => switchTab('missions')}
                  className="text-sm font-semibold text-[#0d7a6f] hover:underline inline-flex items-center gap-1"
                >
                  {t('dashboard.view_all')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {loading ? (
                <div className="py-16 flex justify-center">
                  <div className="h-8 w-8 border-3 border-[#0d7a6f] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : missions.length === 0 ? (
                <div className="surface-panel rounded-2xl border border-dashed border-[#d8e0ea] bg-white p-10 text-center">
                  <ListChecks className="h-10 w-10 text-[#b8c6d6] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[#0b1f3a]">{t('dashboard.empty_missions')}</p>
                  <p className="mt-1 text-xs text-[#5b6b7c]">{t('dashboard.empty_missions_hint')}</p>
                  <button
                    type="button"
                    onClick={() => switchTab('create')}
                    className="btn-primary mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {t('dashboard.cta_create')}
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {missions.slice(0, 4).map((m) => (
                    <MissionRow key={m._id} mission={m} t={t} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {tab === 'create' && (
          <div className="animate-fade-up">
            <CreateMissionStudio
              embedded
              skipAuthRedirect
              onPublished={(mission) => {
                setPublishNotice(t('dashboard.publish_success', { title: mission.title }));
                loadMine();
                switchTab('missions');
              }}
            />
          </div>
        )}

        {tab === 'missions' && (
          <div className="animate-fade-up space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#0b1f3a]">{t('dashboard.tab_missions')}</h3>
              <button
                type="button"
                onClick={() => switchTab('create')}
                className="btn-primary inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                {t('dashboard.cta_create')}
              </button>
            </div>

            {loading ? (
              <div className="py-16 flex justify-center">
                <div className="h-8 w-8 border-3 border-[#0d7a6f] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : missions.length === 0 ? (
              <div className="surface-panel rounded-2xl border border-dashed border-[#d8e0ea] bg-white p-10 text-center">
                <p className="text-sm font-semibold text-[#0b1f3a]">{t('dashboard.empty_missions')}</p>
                <button
                  type="button"
                  onClick={() => switchTab('create')}
                  className="btn-primary mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                >
                  <PlusCircle className="h-4 w-4" />
                  {t('dashboard.cta_create')}
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {missions.map((m) => (
                  <MissionRow key={m._id} mission={m} t={t} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <OrgProfileTab
            organization={organization}
            user={user}
            onUpdated={(updatedOrg) => {
              setOrganization(updatedOrg);
              void refreshUser();
            }}
          />
        )}

        {tab === 'support' && (
          <OrgSupportTab />
        )}
      </main>
    </>
  );
}

function MissionRow({ mission, t }: { mission: Mission; t: (k: string) => string }) {
  return (
    <Link
      href={`/missions/${mission._id}`}
      className="surface-panel group flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-[#d8e0ea] bg-white p-4 sm:p-5 hover:border-[#0d7a6f]/40 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="rounded-md bg-[#e6f4f2] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0d7a6f]">
            {statusLabel(mission.status, t)}
          </span>
          <span className="text-[11px] font-medium text-[#8fa0b3]">{mission.category}</span>
        </div>
        <h3 className="text-base font-bold text-[#0b1f3a] truncate group-hover:text-[#0d7a6f] transition-colors">
          {mission.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#5b6b7c]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-[#0d7a6f]" />
            {mission.venueName}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {mission.totalSlotsFilled}/{mission.totalSlotsNeeded}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {mission.estimatedHoursPerVolunteer}h
          </span>
          <span className="inline-flex items-center gap-1 capitalize">
            <Flame className="h-3.5 w-3.5 text-amber-600" />
            {mission.urgency}
          </span>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-[#b8c6d6] group-hover:text-[#0d7a6f] flex-shrink-0 hidden sm:block" />
    </Link>
  );
}

export default function OrganizationDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="h-8 w-8 border-3 border-[#0d7a6f] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardInner />
    </React.Suspense>
  );
}
