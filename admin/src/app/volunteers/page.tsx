'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Award,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
} from 'lucide-react';
import AdminHeader from '@/components/layout/AdminHeader';
import { adminApi, AdminVolunteer } from '@/lib/api';

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<AdminVolunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getVolunteers();
      setVolunteers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = volunteers.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.city?.toLowerCase().includes(search.toLowerCase()) ||
      v.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <AdminHeader
        title="Répertoire National des Bénévoles & Compétences"
        subtitle="Consultez les profils des citoyens engagés, leurs compétences certifiées et leur indice de fiabilité"
        onRefresh={loadData}
        loading={loading}
      />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* Search */}
        <div className="flex justify-between items-center">
          <div className="relative w-80">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, wilaya ou compétence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#070e24] border border-blue-900/40 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="text-xs text-slate-400">
            Total : <strong className="text-white">{volunteers.length}</strong> bénévoles vérifiés
          </div>
        </div>

        {/* Volunteers Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070e24] border-b border-blue-900/30 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Bénévole</th>
                  <th className="py-3.5 px-4">Wilaya</th>
                  <th className="py-3.5 px-4">Compétences Déclarées</th>
                  <th className="py-3.5 px-4">Heures d'Impact</th>
                  <th className="py-3.5 px-4">Fiabilité</th>
                  <th className="py-3.5 px-4">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20">
                {filtered.map((v) => {
                  const initial = v.name ? v.name.trim().charAt(0) : 'B';

                  return (
                    <tr key={v._id} className="hover:bg-blue-950/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-600 border border-blue-400/40 flex items-center justify-center font-bold text-white text-sm">
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{v.name}</div>
                            <div className="text-[11px] text-slate-400">{v.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-300 font-medium">
                        📍 {v.city || 'Alger'}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {v.skills && v.skills.length > 0 ? (
                            v.skills.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-500/25 text-[10px] text-sky-300 font-semibold"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[10px]">Général</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-white text-xs bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                          <Award className="h-3 w-3 text-sky-400" />
                          <span>{v.impactHours || 0} h</span>
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-400 text-xs">
                            {v.reliabilityScore || 95}%
                          </span>
                          <div className="h-1.5 w-16 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${v.reliabilityScore || 95}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-400 text-[11px]">
                        {new Date(v.createdAt).toLocaleDateString()}
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
