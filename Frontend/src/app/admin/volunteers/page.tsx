'use client';

import React, { useEffect, useState } from 'react';
import { Search, Award } from 'lucide-react';
import AdminHeader from '@/components/layout/AdminHeader';
import { adminApi, AdminVolunteer } from '@/lib/adminApi';

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
        title="Répertoire National des Bénévoles"
        subtitle="Profils, compétences et indice de fiabilité"
        onRefresh={loadData}
        loading={loading}
      />

      <main className="p-6 space-y-6 max-w-6xl">
        <div className="flex justify-between items-center gap-4">
          <div className="relative w-80">
            <Search className="h-3.5 w-3.5 text-[#5b6b7c] absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nom, wilaya ou compétence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#d8e0ea] rounded-lg ps-9 pe-4 py-2 text-xs text-[#0b1f3a] placeholder:text-[#8fa0b3] focus:outline-none focus:border-[#0d7a6f] focus:ring-2 focus:ring-[#0d7a6f]/15"
            />
          </div>
          <div className="text-xs text-[#5b6b7c]">
            Total : <strong className="text-[#0b1f3a]">{volunteers.length}</strong>
          </div>
        </div>

        <div className="surface-panel rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] border-b border-[#d8e0ea] text-[#5b6b7c] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Bénévole</th>
                  <th className="py-3.5 px-4">Wilaya</th>
                  <th className="py-3.5 px-4">Compétences</th>
                  <th className="py-3.5 px-4">Impact</th>
                  <th className="py-3.5 px-4">Fiabilité</th>
                  <th className="py-3.5 px-4">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2f6]">
                {filtered.map((v) => (
                  <tr key={v._id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[#0b1f3a] flex items-center justify-center font-semibold text-white text-sm">
                          {v.name ? v.name.trim().charAt(0) : 'B'}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0b1f3a] text-sm">{v.name}</div>
                          <div className="text-[11px] text-[#5b6b7c]">{v.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#0b1f3a] font-medium">{v.city || 'Alger'}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {v.skills?.length ? (
                          v.skills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md bg-[#e6f4f2] text-[10px] text-[#0d7a6f] font-semibold"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#8fa0b3] text-[10px]">Général</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#0b1f3a] text-xs bg-[#f8fafc] px-2.5 py-1 rounded-md border border-[#d8e0ea]">
                        <Award className="h-3 w-3 text-[#0d7a6f]" />
                        {v.impactHours || 0} h
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#0d7a6f] text-xs">
                          {v.reliabilityScore || 95}%
                        </span>
                        <div className="h-1.5 w-16 bg-[#eef2f6] rounded-full overflow-hidden">
                          <div
                            className="h-full progress-bar-civic rounded-full"
                            style={{ width: `${v.reliabilityScore || 95}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#5b6b7c] text-[11px]">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
