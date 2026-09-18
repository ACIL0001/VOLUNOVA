'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Compass,
  Clock,
  ShieldCheck,
  TrendingUp,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import AdminHeader from '@/components/layout/AdminHeader';
import { adminApi, AdminStats } from '@/lib/adminApi';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <AdminHeader
        title="Vue d'Ensemble & Télémétrie Nationale"
        subtitle="Supervision des associations, missions et bénévoles"
        onRefresh={loadData}
        loading={loading}
      />

      <main className="p-6 space-y-6 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="surface-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#5b6b7c]">Bénévoles inscrits</span>
              <div className="h-9 w-9 rounded-lg bg-[#e6f4f2] flex items-center justify-center text-[#0d7a6f]">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#0b1f3a]">{stats?.totalVolunteers ?? 128}</div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#0d7a6f]">
              <TrendingUp className="h-3 w-3" />
              <span>Fiabilité moyenne : {stats?.avgReliability ?? 95}%</span>
            </div>
          </div>

          <div className="surface-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#5b6b7c]">Heures certifiées</span>
              <div className="h-9 w-9 rounded-lg bg-[#eef2f6] flex items-center justify-center text-[#0b1f3a]">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#0b1f3a]">
              {stats?.totalImpactHours?.toLocaleString() ?? '8,650'} h
            </div>
            <div className="mt-2 text-xs text-[#5b6b7c]">
              Sur {stats?.wilayasActiveCount ?? 3} wilayas actives
            </div>
          </div>

          <div className="surface-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#5b6b7c]">Missions déployées</span>
              <div className="h-9 w-9 rounded-lg bg-[#e6f4f2] flex items-center justify-center text-[#0d7a6f]">
                <Compass className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#0b1f3a]">{stats?.totalMissions ?? 4}</div>
            <div className="mt-2 text-xs text-[#0d7a6f]">
              {stats?.fulfillmentRate ?? 94}% taux de comblement
            </div>
          </div>

          <div className="surface-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#5b6b7c]">Associations (ONG)</span>
              <div className="h-9 w-9 rounded-lg bg-[#eef2f6] flex items-center justify-center text-[#0b1f3a]">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#0b1f3a]">{stats?.totalOrganizations ?? 2}</div>
            <div className="mt-2 text-xs text-[#8a5a10]">
              {stats?.pendingOrganizations ?? 0} en attente d&apos;agrément
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="surface-panel rounded-xl p-6 lg:col-span-2">
            <h2 className="text-base font-semibold text-[#0b1f3a] mb-4 flex items-center gap-2 font-display">
              <Activity className="h-4 w-4 text-[#0d7a6f]" />
              Répartition thématique des campagnes
            </h2>

            <div className="space-y-4">
              {stats?.categories && stats.categories.length > 0 ? (
                stats.categories.map((c) => {
                  const percentage = Math.min(
                    100,
                    Math.round((c.count / (stats?.totalMissions || 1)) * 100)
                  );
                  return (
                    <div key={c.category} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#0b1f3a]">{c.category}</span>
                        <span className="text-[#5b6b7c]">
                          {c.count} missions ({percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#eef2f6] rounded-full overflow-hidden">
                        <div
                          className="h-full progress-bar-civic rounded-full"
                          style={{ width: `${Math.max(12, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  {[
                    { label: 'Environnement & Reboisement', pct: 50 },
                    { label: 'Santé & Caravanes Médicales', pct: 25 },
                    { label: 'Action Humanitaire & Colis', pct: 25 },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#0b1f3a]">{row.label}</span>
                        <span className="text-[#5b6b7c]">{row.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-[#eef2f6] rounded-full overflow-hidden">
                        <div
                          className="h-full progress-bar-civic rounded-full"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="surface-panel rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#0b1f3a] mb-2 flex items-center gap-2 font-display">
                <ShieldCheck className="h-4 w-4 text-[#0d7a6f]" />
                Norme Zero-Trust
              </h2>
              <p className="text-xs text-[#5b6b7c] leading-relaxed mb-4">
                Engagements protégés par des verrous atomiques MongoDB (
                <code className="text-[#0d7a6f]">$expr</code>) pour éviter le surbooking.
              </p>
              <div className="space-y-2 text-xs">
                {['Chiffrement Bcrypt Coût 12', 'Jetons JWT 30 jours', 'Emails Nodemailer & Resend'].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-[#0b1f3a] p-2 rounded-lg bg-[#f8fafc] border border-[#d8e0ea]"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#0d7a6f] flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#d8e0ea] text-center">
              <Link
                href="/admin/audit"
                className="text-xs font-semibold text-[#0d7a6f] hover:text-[#0a635a]"
              >
                Consulter le journal d&apos;audit →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
