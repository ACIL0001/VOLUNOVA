'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import AdminHeader from '@/components/layout/AdminHeader';
import { adminApi, AdminOrganization } from '@/lib/api';

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<AdminOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getOrganizations();
      setOrgs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (id: string, status: 'verified' | 'rejected') => {
    try {
      await adminApi.verifyOrganization(id, status);
      setOrgs((prev) =>
        prev.map((o) => (o._id === id ? { ...o, verificationStatus: status } : o))
      );
    } catch (e: any) {
      alert(`Erreur: ${e.message}`);
    }
  };

  const filteredOrgs = orgs.filter((o) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && o.verificationStatus === 'pending') ||
      (filter === 'verified' && o.verificationStatus === 'verified');

    const matchesSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.category.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <AdminHeader
        title="Validation & Agrément des Associations (ONG)"
        subtitle="Vérifiez les documents légaux et accordez le badge officiel de conformité républicaine"
        onRefresh={loadData}
        loading={loading}
      />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Toutes ({orgs.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              En Attente ({orgs.filter((o) => o.verificationStatus === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'verified'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Vérifiées ({orgs.filter((o) => o.verificationStatus === 'verified').length})
            </button>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une association..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#070e24] border border-blue-900/40 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        {/* Organizations Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070e24] border-b border-blue-900/30 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Association</th>
                  <th className="py-3.5 px-4">Responsable & Contact</th>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4">Statut d'Agrément</th>
                  <th className="py-3.5 px-4">Missions</th>
                  <th className="py-3.5 px-4 text-right">Actions d'Agrément</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20">
                {filteredOrgs.map((org) => {
                  const isVerified = org.verificationStatus === 'verified';
                  const isPending = org.verificationStatus === 'pending';

                  return (
                    <tr key={org._id} className="hover:bg-blue-950/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-blue-900/30 border border-blue-500/30 flex items-center justify-center font-bold text-sky-400">
                            {org.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{org.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Créée le {new Date(org.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-300">
                        <div className="font-semibold text-white">{org.userId?.name || 'Responsable'}</div>
                        <div className="text-slate-400 text-[11px]">{org.userId?.email || 'contact@org.dz'}</div>
                        {org.userId?.phone && (
                          <div className="text-sky-300 text-[10px] font-mono">{org.userId.phone}</div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                          {org.category}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {isVerified && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Vérifiée & Certifiée</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold text-[11px]">
                            <Clock className="h-3.5 w-3.5" />
                            <span>En attente de contrôle</span>
                          </span>
                        )}
                        {org.verificationStatus === 'rejected' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 font-bold text-[11px]">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Rejetée</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-300 font-bold">
                        {org.totalMissions || 1} missions
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isVerified && (
                            <button
                              onClick={() => handleVerify(org._id, 'verified')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Valider</span>
                            </button>
                          )}
                          {isVerified && (
                            <button
                              onClick={() => handleVerify(org._id, 'rejected')}
                              className="px-3 py-1.5 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 font-semibold transition-all border border-red-700/50"
                            >
                              Suspendre
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
