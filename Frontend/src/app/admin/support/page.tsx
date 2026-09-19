'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  FileWarning,
  MessageSquare,
  HelpCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  Mail,
  ShieldCheck,
  RefreshCw,
  X,
  AlertCircle,
  CornerDownRight,
} from 'lucide-react';
import AdminHeader from '@/components/layout/AdminHeader';
import { api, SupportTicket } from '@/lib/api';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    unread: 0,
    warnings: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Selected ticket for modal / drawer review
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<'in_progress' | 'resolved'>('resolved');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminSupportTickets({
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: search.trim() ? search.trim() : undefined,
      });
      setTickets(res.tickets || []);
      if (res.metrics) setMetrics(res.metrics);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.adminReply || '');
    setReplyStatus(ticket.status === 'resolved' ? 'resolved' : 'in_progress');
    setActionNotice(null);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSubmittingReply(true);
    setActionNotice(null);

    try {
      const updated = await api.replyAdminSupportTicket(selectedTicket._id, {
        adminReply: replyText.trim(),
        status: replyStatus,
      });

      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setActionNotice('Réponse enregistrée et transmise à l’organisation avec succès.');
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l’envoi de la réponse');
    } finally {
      setSubmittingReply(false);
    }
  };

  const typeConfig: Record<string, { label: string; icon: any; color: string; badge: string }> = {
    warning: {
      label: 'Avertissement',
      icon: AlertTriangle,
      color: 'text-red-700',
      badge: 'bg-red-50 text-red-800 border-red-200',
    },
    reclamation: {
      label: 'Réclamation',
      icon: FileWarning,
      color: 'text-amber-700',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    note: {
      label: 'Note & Suggestion',
      icon: MessageSquare,
      color: 'text-blue-700',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    assistance: {
      label: 'Assistance',
      icon: HelpCircle,
      color: 'text-teal-700',
      badge: 'bg-teal-50 text-teal-800 border-teal-200',
    },
  };

  return (
    <>
      <AdminHeader
        title="Support & Réclamations des Organisations"
        subtitle="Supervision nationale des signalements, litiges, et demandes d'assistance des ONG."
        onRefresh={fetchTickets}
        loading={loading}
      />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* KPI Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5b6b7c]">
                Total Signalements
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f4f2] text-[#0d7a6f]">
                <MessageSquare className="h-4 w-4" />
              </span>
            </div>
            <p className="text-3xl font-bold text-[#0b1f3a]">{metrics.total}</p>
          </div>

          <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                Avertissements
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
            <p className="text-3xl font-bold text-red-700">{metrics.warnings}</p>
          </div>

          <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                En Attente (Non Lus)
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <p className="text-3xl font-bold text-amber-800">{metrics.unread}</p>
          </div>

          <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Traités & Résolus
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <p className="text-3xl font-bold text-emerald-800">{metrics.resolved}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[#f8fafc] p-1 rounded-xl border border-[#d8e0ea]">
              {['all', 'warning', 'reclamation', 'note', 'assistance'].map((tKey) => {
                const isSelected = filterType === tKey;
                const labels: Record<string, string> = {
                  all: 'Tous',
                  warning: 'Avertissements',
                  reclamation: 'Réclamations',
                  note: 'Notes',
                  assistance: 'Assistance',
                };
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setFilterType(tKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-[#0d7a6f] text-white shadow-sm'
                        : 'text-[#5b6b7c] hover:text-[#0b1f3a]'
                    }`}
                  >
                    {labels[tKey]}
                  </button>
                );
              })}
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#d8e0ea] text-xs font-semibold text-[#0b1f3a] bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="unread">Non lus uniquement</option>
              <option value="in_progress">En cours d’examen</option>
              <option value="resolved">Résolus</option>
            </select>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8fa0b3]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par ONG ou sujet..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#d8e0ea] text-xs text-[#0b1f3a] focus:border-[#0d7a6f] focus:outline-none"
            />
          </div>
        </div>

        {/* Tickets Table / List */}
        <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="h-8 w-8 border-3 border-[#0d7a6f] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#8fa0b3]">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              Aucun ticket ne correspond aux filtres actuels.
            </div>
          ) : (
            <div className="divide-y divide-[#eef2f6]">
              {tickets.map((t) => {
                const conf = typeConfig[t.type] || typeConfig.note;
                const Icon = conf.icon;
                const isUnread = t.status === 'unread';

                return (
                  <div
                    key={t._id}
                    onClick={() => handleOpenTicket(t)}
                    className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#f8fafc] cursor-pointer transition-colors ${
                      isUnread ? 'bg-[#fffaf0]/80' : ''
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold border ${conf.badge}`}>
                          <Icon className="h-3 w-3" />
                          {conf.label}
                        </span>

                        <span className="text-[11px] font-bold text-[#0b1f3a] flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-[#0d7a6f]" />
                          {t.orgName}
                        </span>

                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#5b6b7c]">
                          Priorité {t.priority}
                        </span>

                        {isUnread && (
                          <span className="rounded-full bg-red-600 h-2 w-2 ring-2 ring-red-200 animate-pulse" />
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-[#0b1f3a] truncate">
                        {t.subject}
                      </h3>

                      <p className="text-xs text-[#5b6b7c] line-clamp-2">
                        {t.message}
                      </p>
                    </div>

                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2 flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          t.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status === 'resolved'
                          ? 'Traité & Résolu'
                          : t.status === 'in_progress'
                            ? 'En cours'
                            : 'Non lu'}
                      </span>

                      <span className="text-xs text-[#8fa0b3] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Detail & Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#eef2f6] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold border ${(typeConfig[selectedTicket.type] || typeConfig.note).badge}`}>
                  {React.createElement((typeConfig[selectedTicket.type] || typeConfig.note).icon, { className: 'h-3.5 w-3.5' })}
                  {(typeConfig[selectedTicket.type] || typeConfig.note).label}
                </span>
                <h2 className="text-sm font-bold text-[#0b1f3a] truncate max-w-md">
                  {selectedTicket.subject}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-[#8fa0b3] hover:text-[#0b1f3a] hover:bg-[#eef2f6] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {actionNotice && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{actionNotice}</span>
                </div>
              )}

              {/* Organization Meta */}
              <div className="rounded-xl border border-[#d8e0ea] bg-[#f8fafc] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[#0b1f3a] text-sm block">{selectedTicket.orgName}</span>
                  <span className="text-[#5b6b7c] flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3 text-[#0d7a6f]" />
                    {selectedTicket.orgEmail}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#5b6b7c] block">Date de transmission</span>
                  <span className="font-semibold text-[#0b1f3a]">
                    {new Date(selectedTicket.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Original Message */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5b6b7c] block mb-1.5">
                  Contenu du signalement transmis par l’organisation :
                </span>
                <div className="rounded-xl border border-[#d8e0ea] bg-white p-4 text-xs sm:text-sm text-[#0b1f3a] whitespace-pre-line leading-relaxed">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Response Form */}
              <form onSubmit={handleSendReply} className="space-y-4 pt-4 border-t border-[#eef2f6]">
                <div>
                  <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                    Réponse de la Gouvernance Nationale & Résolution :
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Écrivez votre réponse officielle à l'organisation (visible instantanément dans son tableau de bord)..."
                    className="w-full p-3 rounded-xl border border-[#d8e0ea] text-xs sm:text-sm text-[#0b1f3a] focus:border-[#0d7a6f] focus:outline-none focus:ring-1 focus:ring-[#0d7a6f]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0b1f3a]">Statut final :</span>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value as any)}
                      className="px-3 py-1.5 rounded-lg border border-[#d8e0ea] text-xs font-semibold bg-white text-[#0b1f3a]"
                    >
                      <option value="in_progress">En cours d’examen</option>
                      <option value="resolved">Résolu & Clôturé</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReply || !replyText.trim()}
                    className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{submittingReply ? 'Envoi...' : 'Transmettre la réponse'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
