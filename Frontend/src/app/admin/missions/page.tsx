'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Trash2, Search } from 'lucide-react';
import AdminHeader from '@/components/layout/AdminHeader';
import { adminApi, AdminMission } from '@/lib/adminApi';

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<AdminMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getMissions();
      setMissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (id: string, title: string) => {
    if (!confirm(`Voulez-vous modérer et annuler la mission "${title}" ?`)) return;
    try {
      await adminApi.cancelMission(id);
      setMissions((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: 'cancelled' } : m))
      );
    } catch (e: any) {
      alert(`Erreur: ${e.message}`);
    }
  };

  const filteredMissions = missions.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.venueName.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <AdminHeader
        title="Supervision des Missions Terrain"
        subtitle="Surveillez et modérez les opérations publiées"
        onRefresh={loadData}
        loading={loading}
      />

      <main className="p-6 space-y-6 max-w-6xl">
        <div className="flex justify-between items-center gap-4">
          <div className="relative w-72">
            <Search className="h-3.5 w-3.5 text-[#5b6b7c] absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une mission..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#d8e0ea] rounded-lg ps-9 pe-4 py-2 text-xs text-[#0b1f3a] placeholder:text-[#8fa0b3] focus:outline-none focus:border-[#0d7a6f] focus:ring-2 focus:ring-[#0d7a6f]/15"
            />
          </div>
          <div className="text-xs text-[#5b6b7c]">
            Total : <strong className="text-[#0b1f3a]">{missions.length}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMissions.map((m) => {
            const isCancelled = m.status === 'cancelled';
            const slotsPercent =
              m.totalSlotsNeeded > 0
                ? Math.min(100, Math.round((m.totalSlotsFilled / m.totalSlotsNeeded) * 100))
                : 0;

            return (
              <div
                key={m._id}
                className={`surface-panel surface-panel-hover rounded-xl p-5 flex flex-col justify-between ${
                  isCancelled ? 'opacity-60' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#e6f4f2] text-[11px] font-semibold text-[#0d7a6f]">
                      {m.category}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        m.urgency === 'urgent'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-[#f3f5f8] text-[#5b6b7c]'
                      }`}
                    >
                      {m.urgency.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#0b1f3a] text-base mb-1.5 leading-snug">{m.title}</h3>
                  <div className="text-xs text-[#5b6b7c] mb-3">
                    {m.venueName} · {m.estimatedHoursPerVolunteer || 4}h
                  </div>
                  <p className="text-xs text-[#5b6b7c] line-clamp-2 leading-relaxed mb-4">
                    {m.description || 'Description non renseignée.'}
                  </p>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#5b6b7c]">Équipe terrain</span>
                      <span className="text-[#0b1f3a]">
                        {m.totalSlotsFilled || 0} / {m.totalSlotsNeeded || 0} ({slotsPercent}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#eef2f6] rounded-full overflow-hidden">
                      <div
                        className="h-full progress-bar-civic rounded-full"
                        style={{ width: `${slotsPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#d8e0ea] flex items-center justify-between">
                  <Link
                    href={`/missions/${m._id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-[#0d7a6f] hover:text-[#0a635a]"
                  >
                    Salle Ops
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => handleCancel(m._id, m.title)}
                      className="p-1.5 text-[#5b6b7c] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Annuler / Modérer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
