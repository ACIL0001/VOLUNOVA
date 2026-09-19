'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  FileWarning,
  MessageSquare,
  HelpCircle,
  Send,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CornerDownRight,
} from 'lucide-react';
import { api, SupportTicket } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

export default function OrgSupportTab() {
  const { t } = useTranslation();

  const [type, setType] = useState<'warning' | 'reclamation' | 'note' | 'assistance'>('warning');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const data = await api.getMySupportTickets();
      setTickets(data || []);
    } catch {
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    setSuccessNotice(null);
    setErrorMessage(null);

    try {
      const newTicket = await api.createSupportTicket({
        type,
        priority,
        subject: subject.trim(),
        message: message.trim(),
      });

      setTickets((prev) => [newTicket, ...prev]);
      setSuccessNotice('Votre message a été transmis directement à la gouvernance nationale Super Admin.');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Échec de l’envoi du signalement.');
    } finally {
      setSubmitting(false);
    }
  };

  const typeConfig = {
    warning: {
      label: 'Avertissement',
      desc: 'Signalement de comportement, incident sur le terrain ou litige avec un bénévole',
      color: 'border-red-300 bg-red-50 text-red-800',
      activeColor: 'border-red-500 bg-red-100 text-red-900 ring-2 ring-red-500',
      icon: AlertTriangle,
    },
    reclamation: {
      label: 'Réclamation',
      desc: 'Problème de validation, blocage technique ou contestation officielle',
      color: 'border-amber-300 bg-amber-50 text-amber-800',
      activeColor: 'border-amber-500 bg-amber-100 text-amber-900 ring-2 ring-amber-500',
      icon: FileWarning,
    },
    note: {
      label: 'Note & Suggestion',
      desc: 'Recommandation, amélioration de la plateforme ou retour d’expérience',
      color: 'border-blue-300 bg-blue-50 text-blue-800',
      activeColor: 'border-blue-500 bg-blue-100 text-blue-900 ring-2 ring-blue-500',
      icon: MessageSquare,
    },
    assistance: {
      label: 'Demande d’Aide',
      desc: 'Assistance pour la gestion de mission ou question administrative',
      color: 'border-teal-300 bg-teal-50 text-teal-800',
      activeColor: 'border-teal-500 bg-teal-100 text-teal-900 ring-2 ring-teal-500',
      icon: HelpCircle,
    },
  };

  return (
    <div className="space-y-8 animate-fade-up max-w-4xl">
      {/* Title Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#0d7a6f]">
          Gouvernance & Sécurité
        </span>
        <h1 className="text-2xl font-bold text-[#0b1f3a] mt-1">
          Centre d’Alertes & Contact Super Admin
        </h1>
        <p className="text-sm text-[#5b6b7c] mt-1">
          Signalez un comportement, déposez une réclamation ou envoyez une note officielle à l’administration nationale. Votre demande s’affichera directement dans la cloche et le centre de support du Super Admin.
        </p>
      </div>

      {successNotice && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium flex-1">{successNotice}</span>
          <button type="button" onClick={() => setSuccessNotice(null)} className="text-xs font-bold underline">
            OK
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium flex-1">{errorMessage}</span>
        </div>
      )}

      {/* Creation Card */}
      <form onSubmit={handleSubmit} className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-2">
            1. Choisissez le type de transmission *
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(typeConfig) as (keyof typeof typeConfig)[]).map((key) => {
              const conf = typeConfig[key];
              const Icon = conf.icon;
              const isSelected = type === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setType(key)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isSelected ? conf.activeColor : 'border-[#d8e0ea] hover:border-[#b8c6d6] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{conf.label}</span>
                  </div>
                  <p className="text-xs text-[#5b6b7c] leading-relaxed">{conf.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
              Degré de priorité *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#d8e0ea] text-sm text-[#0b1f3a] bg-white focus:border-[#0d7a6f] focus:outline-none focus:ring-1 focus:ring-[#0d7a6f]"
            >
              <option value="low">Faible — Note d’information générale</option>
              <option value="medium">Moyen — Réclamation standard</option>
              <option value="high">Élevé — Avertissement important</option>
              <option value="urgent">Urgent — Incident critique ou blocage immédiat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
              Objet / Sujet du signalement *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#d8e0ea] text-sm text-[#0b1f3a] focus:border-[#0d7a6f] focus:outline-none focus:ring-1 focus:ring-[#0d7a6f]"
              placeholder="Ex: Avertissement concernant un désistement de groupe..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
            Description détaillée & Faits constatés *
          </label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#d8e0ea] text-sm text-[#0b1f3a] focus:border-[#0d7a6f] focus:outline-none focus:ring-1 focus:ring-[#0d7a6f]"
            placeholder="Détaillez le contexte, les personnes ou missions concernées, et toute information utile pour l'examen par le Super Admin..."
          />
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-[#eef2f6]">
          <button
            type="submit"
            disabled={submitting || !subject.trim() || !message.trim()}
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{submitting ? 'Transmission en cours...' : 'Transmettre au Super Admin'}</span>
          </button>
        </div>
      </form>

      {/* History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0b1f3a]">
            Historique de vos échanges avec la gouvernance ({tickets.length})
          </h2>
          <button
            type="button"
            onClick={loadTickets}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0d7a6f] hover:underline"
          >
            <RefreshCw className={`h-3 w-3 ${loadingTickets ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {loadingTickets ? (
          <div className="py-12 flex justify-center">
            <div className="h-8 w-8 border-3 border-[#0d7a6f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="surface-panel rounded-2xl border border-dashed border-[#d8e0ea] bg-white p-8 text-center">
            <ShieldAlert className="h-10 w-10 text-[#b8c6d6] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#0b1f3a]">Aucun signalement ni réclamation transmis</p>
            <p className="text-xs text-[#5b6b7c] mt-1">
              Les demandes et alertes que vous enverrez au Super Admin s’afficheront ici avec leur état d’avancement.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => {
              const conf = typeConfig[t.type] || typeConfig.note;
              const Icon = conf.icon;
              return (
                <div
                  key={t._id}
                  className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eef2f6] pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${conf.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {conf.label}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#f1f5f9] text-[#5b6b7c]">
                        Priorité {t.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          t.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {t.status === 'resolved'
                          ? 'Traité & Résolu'
                          : t.status === 'in_progress'
                            ? 'En cours d’examen'
                            : 'En attente de lecture'}
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

                  <div>
                    <h3 className="font-bold text-sm text-[#0b1f3a]">{t.subject}</h3>
                    <p className="text-xs text-[#5b6b7c] mt-1 whitespace-pre-line leading-relaxed">
                      {t.message}
                    </p>
                  </div>

                  {/* Admin Reply Section */}
                  {t.adminReply && (
                    <div className="rounded-xl border border-teal-200 bg-[#f0fdfa] p-3.5 mt-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d7a6f]">
                        <CornerDownRight className="h-3.5 w-3.5" />
                        <span>Réponse officielle du Super Admin :</span>
                      </div>
                      <p className="text-xs text-[#0f3d37] whitespace-pre-line leading-relaxed ps-5">
                        {t.adminReply}
                      </p>
                      {t.repliedAt && (
                        <p className="text-[10px] text-[#5b6b7c] ps-5 pt-1">
                          Répondu le {new Date(t.repliedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
