'use client';

import React, { useEffect, useState } from 'react';
import {
  Compass,
  ExternalLink,
  Trash2,
  Users,
  Clock,
  AlertCircle,
  Search,
} from 'lucide-react';
import AdminHeader from '@/components/layout/AdminHeader';
import { adminApi, AdminMission } from '@/lib/api';

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
        title="Supervision & Contrôle des Missions Terrain"
        subtitle="Surveillez l'ensemble des opérations publiées via l'IA et modérez les initiatives"
        onRefresh={loadData}
        loading={loading}
      />

      <main className="p-6 space-y-6 max-w-7xl">
        {/* Search */}
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une mission..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#070e24] border border-blue-900/40 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="text-xs text-slate-400">
            Total : <strong className="text-white">{missions.length}</strong> campagnes actives
          </div>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMissions.map((m) => {
            const isCancelled = m.status === 'cancelled';
            const slotsPercent =
              m.totalSlotsNeeded > 0
                ? Math.min(100, Math.round((m.totalSlotsFilled / m.totalSlotsNeeded) * 100))
                : 90;

            return (
              <div
                key={m._id}
                className={`glass-card p-5 rounded-2xl flex flex-col justify-between ${
                  isCancelled ? 'opacity-60 border-red-900/40' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-950 border border-blue-500/30 text-[11px] font-bold text-sky-300">
                      {m.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        m.urgency === 'urgent'
                          ? 'bg-red-950 text-red-300 border border-red-500/40'
                          : 'bg-slate-900 text-slate-300'
                      }`}
                    >
                      {m.urgency.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base mb-1.5 leading-snug">{m.title}</h3>
                  <div className="text-xs text-slate-400 mb-3 flex items-center gap-1.5">
                    <span>📍 {m.venueName}</span>
                    <span>•</span>
                    <span>⏱️ {m.estimatedHoursPerVolunteer || 4}h</span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {m.description || 'Description non renseignée.'}
                  </p>

                  {/* Slots Fulfillment Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Équipe terrain</span>
                      <span className="text-sky-300">
                        {m.totalSlotsFilled || 0} / {m.totalSlotsNeeded || 3} ({slotsPercent}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"
                        style={{ width: `${slotsPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-blue-900/30 flex items-center justify-between">
                  <a
                    href={`http://localhost:3000/missions/${m._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300"
                  >
                    <span>Salle Ops Live</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {!isCancelled && (
                    <button
                      onClick={() => handleCancel(m._id, m.title)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-all"
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
