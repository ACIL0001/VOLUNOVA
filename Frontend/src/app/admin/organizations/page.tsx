'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import AdminHeader from '@/components/layout/AdminHeader';
import { adminApi, AdminOrganization } from '@/lib/adminApi';

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
        title="Validation & Agrément des Associations"
        subtitle="Vérifiez et accordez l'agrément officiel aux ONG"
        onRefresh={loadData}
        loading={loading}
      />

      <main className="p-6 space-y-6 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(
              [
                { id: 'all' as const, label: `Toutes (${orgs.length})` },
                {
                  id: 'pending' as const,
                  label: `En attente (${orgs.filter((o) => o.verificationStatus === 'pending').length})`,
                },
                {
                  id: 'verified' as const,
                  label: `Vérifiées (${orgs.filter((o) => o.verificationStatus === 'verified').length})`,
                },
              ]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === tab.id
                    ? 'bg-[#0b1f3a] text-white'
                    : 'bg-white border border-[#d8e0ea] text-[#5b6b7c] hover:text-[#0b1f3a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-[#5b6b7c] absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une association..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-[#d8e0ea] rounded-lg ps-9 pe-4 py-1.5 text-xs text-[#0b1f3a] placeholder:text-[#8fa0b3] focus:outline-none focus:border-[#0d7a6f] focus:ring-2 focus:ring-[#0d7a6f]/15"
            />
          </div>
        </div>

        <div className="surface-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#d8e0ea] text-[#5b6b7c] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Association</th>
                  <th className="py-3.5 px-4">Responsable</th>
                  <th className="py-3.5 px-4">Catégorie</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4">Missions</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6]">
                {filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#5b6b7c]">
                      Aucune organisation enregistrée pour le moment.
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => {
                    const isVerified = org.verificationStatus === 'verified';
                    const isPending = org.verificationStatus === 'pending';

                    return (
                      <tr key={org._id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-[#e6f4f2] text-[#0d7a6f] flex items-center justify-center font-bold">
                            {org.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#0b1f3a] text-sm">{org.name}</div>
                            <div className="text-[10px] text-[#5b6b7c]">
                              Créée le {new Date(org.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#0b1f3a]">{org.userId?.name || 'Responsable'}</div>
                        <div className="text-[#5b6b7c] text-[11px]">{org.userId?.email || '—'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-[#f3f5f8] border border-[#d8e0ea] text-[#5b6b7c] font-medium">
                          {org.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {isVerified && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#e6f4f2] text-[#0d7a6f] font-semibold text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Vérifiée
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f8f1e4] text-[#8a5a10] font-semibold text-[11px]">
                            <Clock className="h-3.5 w-3.5" />
                            En attente
                          </span>
                        )}
                        {org.verificationStatus === 'rejected' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-semibold text-[11px]">
                            <XCircle className="h-3.5 w-3.5" />
                            Rejetée
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#0b1f3a]">
                        {org.totalMissions || 0}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isVerified && (
                            <button
                              type="button"
                              onClick={() => handleVerify(org._id, 'verified')}
                              className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Valider
                            </button>
                          )}
                          {isVerified && (
                            <button
                              type="button"
                              onClick={() => handleVerify(org._id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50"
                            >
                              Suspendre
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
