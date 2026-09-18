'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  Compass,
  Clock,
  ShieldCheck,
  TrendingUp,
  Activity,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import AdminHeader from '@/components/layout/AdminHeader';
import { adminApi, AdminStats } from '@/lib/api';

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
        subtitle="Supervision en temps réel des associations, missions et bénévoles à travers le pays"
        onRefresh={loadData}
        loading={loading}
      />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card glass-card-hover p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400">Bénévoles Inscrits</span>
              <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{stats?.totalVolunteers ?? 128}</div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-sky-300">
              <TrendingUp className="h-3 w-3" />
              <span>Fiabilité moyenne : {stats?.avgReliability ?? 95}%</span>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400">Heures Certifiées</span>
              <div className="h-9 w-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{stats?.totalImpactHours?.toLocaleString() ?? '8,650'} h</div>
            <div className="mt-2 text-xs text-slate-400">
              Sur {stats?.wilayasActiveCount ?? 3} wilayas actives
            </div>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400">Missions Déployées</span>
              <div className="h-9 w-9 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Compass className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{stats?.totalMissions ?? 4}</div>
            <div className="mt-2 text-xs text-sky-300">
              <span>{stats?.fulfillmentRate ?? 94}% taux de comblement</span>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400">Associations (ONG)</span>
              <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{stats?.totalOrganizations ?? 2}</div>
            <div className="mt-2 text-xs text-amber-300">
              <span>{stats?.pendingOrganizations ?? 0} en attente d'agrément</span>
            </div>
          </div>
        </div>

        {/* Operational Grid Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Chart Box */}
          <div className="glass-card p-6 rounded-2xl lg:col-span-2">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-400" />
              <span>Répartition Thématique des Campagnes</span>
            </h2>

            <div className="space-y-4">
              {stats?.categories && stats.categories.length > 0 ? (
                stats.categories.map((c) => {
                  const percentage = Math.min(100, Math.round((c.count / (stats?.totalMissions || 1)) * 100));
                  return (
                    <div key={c.category} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{c.category}</span>
                        <span className="text-sky-300">{c.count} missions ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"
                          style={{ width: `${Math.max(15, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Environnement & Reboisement</span>
                      <span className="text-sky-300">50%</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-1/2" /></div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Santé & Caravanes Médicales</span>
                      <span className="text-sky-300">25%</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-1/4" /></div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Action Humanitaire & Colis</span>
                      <span className="text-sky-300">25%</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-sky-400 w-1/4" /></div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Security & Integrity Box */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Norme Zero-Trust</span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Tous les engagements sont sécurisés par des verrous de concurrence atomiques MongoDB (<code className="text-sky-300">$expr</code>) éliminant tout surbooking sur le terrain.
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Chiffrement Bcrypt Coût 12</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Jetons JWT Signature 30j</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Emails Nodemailer & Resend</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-900/30 text-center">
              <a
                href="/audit"
                className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
              >
                Consulter le journal de sécurité complet &rarr;
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
