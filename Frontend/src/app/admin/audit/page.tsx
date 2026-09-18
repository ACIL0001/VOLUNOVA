'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  User,
  Terminal,
  Key,
  CheckCircle2,
  XCircle,
  FileCode,
} from 'lucide-react';
import { adminApi, AdminAuditLog } from '@/lib/adminApi';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAuditLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || "Impossible de charger le journal d'audit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actorId.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.targetId && log.targetId.toLowerCase().includes(search.toLowerCase())) ||
      (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(search.toLowerCase()));

    const matchesAction =
      filterAction === 'ALL' ||
      (filterAction === 'AUTH' &&
        (log.action.includes('login') ||
          log.action.includes('register') ||
          log.action.includes('signup') ||
          log.action.includes('auth'))) ||
      (filterAction === 'MISSION' && log.action.includes('mission')) ||
      (filterAction === 'ORG' && log.action.includes('org'));

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('login') || action.includes('register') || action.includes('signup')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#eef2f6] text-[#0b1f3a] border border-[#d8e0ea]">
          <Key className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes('verify') || action.includes('join') || action.includes('create')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#e6f4f2] text-[#0d7a6f]">
          <CheckCircle2 className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes('cancel') || action.includes('reject') || action.includes('delete')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700">
          <XCircle className="w-3 h-3" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#f3f5f8] text-[#5b6b7c] border border-[#d8e0ea]">
        <Terminal className="w-3 h-3" />
        {action}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#0d7a6f] uppercase">
            <ShieldCheck className="w-4 h-4" />
            Sécurité & Traçabilité
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0b1f3a] mt-1 font-display">
            Journal d&apos;Audit Zero-Trust
          </h1>
          <p className="text-sm text-[#5b6b7c] mt-0.5">
            Historique des connexions, approbations et actions d&apos;impact.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-white border border-[#d8e0ea] text-[#5b6b7c] hover:text-[#0b1f3a] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0d7a6f]' : ''}`} />
          Rafraîchir
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-panel rounded-xl p-5">
          <div className="flex items-center justify-between text-[#5b6b7c] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total événements</span>
            <Terminal className="w-4 h-4 text-[#0d7a6f]" />
          </div>
          <div className="text-2xl font-bold text-[#0b1f3a]">{logs.length}</div>
        </div>
        <div className="surface-panel rounded-xl p-5">
          <div className="flex items-center justify-between text-[#5b6b7c] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Intégrité</span>
            <ShieldCheck className="w-4 h-4 text-[#0d7a6f]" />
          </div>
          <div className="text-2xl font-bold text-[#0d7a6f]">SHA-256</div>
        </div>
        <div className="surface-panel rounded-xl p-5">
          <div className="flex items-center justify-between text-[#5b6b7c] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Rétention</span>
            <Clock className="w-4 h-4 text-[#0b1f3a]" />
          </div>
          <div className="text-2xl font-bold text-[#0b1f3a]">365 jours</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl surface-panel">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#5b6b7c]" />
          <input
            type="text"
            placeholder="Filtrer par acteur, action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9 pe-4 py-2 rounded-lg bg-white border border-[#d8e0ea] text-sm text-[#0b1f3a] placeholder:text-[#8fa0b3] focus:outline-none focus:border-[#0d7a6f]"
          />
        </div>
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'AUTH', label: 'Auth' },
            { id: 'MISSION', label: 'Missions' },
            { id: 'ORG', label: 'ONG' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterAction(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterAction === tab.id
                  ? 'bg-[#0b1f3a] text-white'
                  : 'text-[#5b6b7c] hover:text-[#0b1f3a] hover:bg-[#f3f5f8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="surface-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#0b1f3a]">
            <thead className="bg-[#f8fafc] text-xs font-semibold uppercase text-[#5b6b7c] border-b border-[#d8e0ea]">
              <tr>
                <th className="px-5 py-3.5">Horodatage</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Acteur</th>
                <th className="px-5 py-3.5">Cible</th>
                <th className="px-5 py-3.5 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f6]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#5b6b7c]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0d7a6f] mb-2" />
                    Chargement...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[#5b6b7c]">
                    Aucun événement ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-[#5b6b7c] font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">{getActionBadge(log.action)}</td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-xs text-[#0d7a6f]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-[#5b6b7c]" />
                        <span className="truncate max-w-[140px]">{log.actorId}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-[#5b6b7c] font-mono">
                      {log.targetId || '—'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#f3f5f8] border border-[#d8e0ea] text-[#0b1f3a] hover:border-[#0d7a6f]"
                        >
                          <FileCode className="w-3 h-3 text-[#0d7a6f]" />
                          JSON
                        </button>
                      ) : (
                        <span className="text-xs text-[#8fa0b3]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1f3a]/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white border border-[#d8e0ea] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#d8e0ea] pb-3">
              <h3 className="font-semibold text-[#0b1f3a] text-sm">Métadonnées événement</h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-[#5b6b7c] hover:text-[#0b1f3a] text-sm px-2"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#eef2f6]">
                <span className="text-[#5b6b7c]">ID</span>
                <span className="font-mono text-[#0b1f3a]">{selectedLog._id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#eef2f6]">
                <span className="text-[#5b6b7c]">Action</span>
                <span className="font-semibold text-[#0d7a6f]">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#eef2f6]">
                <span className="text-[#5b6b7c]">Acteur</span>
                <span className="font-mono text-[#0b1f3a]">{selectedLog.actorId}</span>
              </div>
            </div>
            <pre className="p-3 rounded-lg bg-[#f8fafc] border border-[#d8e0ea] text-xs font-mono text-[#0d7a6f] overflow-x-auto max-h-60">
              {JSON.stringify(selectedLog.metadata, null, 2)}
            </pre>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
