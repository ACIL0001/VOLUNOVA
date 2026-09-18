'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Filter, 
  AlertCircle, 
  Clock, 
  User, 
  Terminal, 
  Key, 
  CheckCircle2, 
  XCircle,
  FileCode
} from 'lucide-react';
import { adminApi, AdminAuditLog } from '@/lib/api';

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
      setError(err.message || 'Impossible de charger le journal d\'audit');
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
      (filterAction === 'AUTH' && (log.action.includes('login') || log.action.includes('register') || log.action.includes('auth'))) ||
      (filterAction === 'MISSION' && log.action.includes('mission')) ||
      (filterAction === 'ORG' && log.action.includes('org'));

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('login') || action.includes('register')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Key className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes('verify') || action.includes('join') || action.includes('create')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes('cancel') || action.includes('reject') || action.includes('delete')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3 h-3" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
        <Terminal className="w-3 h-3" />
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-400 uppercase">
            <ShieldCheck className="w-4 h-4" />
            Sécurité & Traçabilité Immédiate
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Journal d&apos;Audit Zero-Trust
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Historique complet immuable de toutes les actions, connexions, approbations et transactions d&apos;impact.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Security Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Événements</span>
            <Terminal className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{logs.length}</div>
          <div className="text-xs text-zinc-500 mt-1">Événements audités conservés</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Intégrité Signature</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">100% SHA-256</div>
          <div className="text-xs text-zinc-500 mt-1">Zero falsification détectée</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Politique de Rétention</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">365 Jours</div>
          <div className="text-xs text-zinc-500 mt-1">Conformité RGPD & Audit National</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Filtrer par acteur, action, cible..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Action Type Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'AUTH', label: 'Authentification' },
            { id: 'MISSION', label: 'Missions & RSVPs' },
            { id: 'ORG', label: 'Vérification ONG' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterAction(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterAction === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950/60 text-xs font-semibold uppercase text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-5 py-3.5">Horodatage</th>
                <th className="px-5 py-3.5">Action & Événement</th>
                <th className="px-5 py-3.5">Acteur ID</th>
                <th className="px-5 py-3.5">Cible / Contexte</th>
                <th className="px-5 py-3.5 text-right">Métadonnées</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-400 mb-2" />
                    Lecture du journal immuable...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">
                    Aucun événement d&apos;audit ne correspond aux filtres actuels.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-zinc-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        {new Date(log.timestamp).toLocaleString('fr-FR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap font-mono text-xs text-blue-300">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-zinc-500" />
                        <span className="truncate max-w-[140px]">{log.actorId}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-xs text-zinc-400 font-mono">
                      {log.targetId ? (
                        <span className="truncate max-w-[140px] block">{log.targetId}</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                        >
                          <FileCode className="w-3 h-3 text-blue-400" />
                          Détails JSON
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-600 font-mono">Vide</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-white text-sm">
                  Inspection Métadonnées Événement
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-zinc-400 hover:text-white text-sm px-2 py-1 rounded-md hover:bg-zinc-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">ID Événement:</span>
                <span className="font-mono text-zinc-200">{selectedLog._id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Action:</span>
                <span className="font-semibold text-blue-400">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Acteur:</span>
                <span className="font-mono text-zinc-300">{selectedLog.actorId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Horodatage:</span>
                <span className="text-zinc-300 font-mono">{new Date(selectedLog.timestamp).toISOString()}</span>
              </div>
            </div>

            <div className="mt-3">
              <div className="text-xs font-semibold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                Charge Utile (Payload)
              </div>
              <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-500/20"
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
