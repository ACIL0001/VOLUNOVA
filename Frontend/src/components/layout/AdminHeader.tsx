'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Bell,
  AlertTriangle,
  FileWarning,
  MessageSquare,
  HelpCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { api, SupportTicket } from '@/lib/api';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function AdminHeader({
  title,
  subtitle,
  onRefresh,
  loading,
}: AdminHeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await api.getAdminUnreadTicketsCount();
      setUnreadCount(data.unreadCount || 0);
      setUrgentCount(data.urgentCount || 0);
      setRecentTickets(data.recentTickets || []);
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
    warning: { label: 'Avertissement', icon: AlertTriangle, color: 'text-red-700 bg-red-50' },
    reclamation: { label: 'Réclamation', icon: FileWarning, color: 'text-amber-700 bg-amber-50' },
    note: { label: 'Note', icon: MessageSquare, color: 'text-blue-700 bg-blue-50' },
    assistance: { label: 'Assistance', icon: HelpCircle, color: 'text-teal-700 bg-teal-50' },
  };

  return (
    <header className="min-h-[72px] bg-white/90 border-b border-[#d8e0ea] px-6 py-4 flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-40">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-[#0b1f3a] font-display truncate">{title}</h1>
        {subtitle && <p className="text-xs text-[#5b6b7c] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        {onRefresh && (
          <button
            type="button"
            onClick={() => {
              onRefresh();
              fetchAlerts();
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d8e0ea] bg-white text-xs font-semibold text-[#5b6b7c] hover:text-[#0b1f3a] hover:border-[#b8c6d6] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#0d7a6f]' : ''}`} />
            <span>Actualiser</span>
          </button>
        )}

        {/* Notification Bell with Badge & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown((prev) => !prev)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8e0ea] bg-white text-[#5b6b7c] hover:text-[#0b1f3a] hover:border-[#b8c6d6] transition-colors"
            aria-label="Alertes Organisations"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#d8e0ea] bg-white shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="p-3.5 border-b border-[#eef2f6] flex items-center justify-between bg-[#f8fafc]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#0b1f3a] uppercase tracking-wider">
                    Alertes Organisations
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5">
                      {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {urgentCount > 0 && (
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                    {urgentCount} urgente{urgentCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#f1f5f9]">
                {recentTickets.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#8fa0b3]">
                    <CheckCircle2 className="h-6 w-6 mx-auto mb-1.5 text-emerald-500" />
                    Aucune alerte ni réclamation en attente
                  </div>
                ) : (
                  recentTickets.map((ticket) => {
                    const conf = typeConfig[ticket.type] || typeConfig.note;
                    const Icon = conf.icon;
                    const isUnread = ticket.status === 'unread';

                    return (
                      <Link
                        key={ticket._id}
                        href="/admin/support"
                        onClick={() => setShowDropdown(false)}
                        className={`block p-3.5 hover:bg-[#f8fafc] transition-colors ${
                          isUnread ? 'bg-[#fffaf0]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${conf.color}`}>
                              <Icon className="h-3 w-3" />
                              {conf.label}
                            </span>
                            <span className="font-bold text-xs text-[#0b1f3a] truncate max-w-[150px]">
                              {ticket.orgName}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#8fa0b3] whitespace-nowrap flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(ticket.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#0b1f3a] line-clamp-1">
                          {ticket.subject}
                        </p>
                        <p className="text-[11px] text-[#5b6b7c] line-clamp-1 mt-0.5">
                          {ticket.message}
                        </p>
                      </Link>
                    );
                  })
                )}
              </div>

              <div className="p-2.5 border-t border-[#eef2f6] bg-[#f8fafc] text-center">
                <Link
                  href="/admin/support"
                  onClick={() => setShowDropdown(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0d7a6f] hover:underline"
                >
                  <span>Accéder à la gestion des réclamations</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ps-3 border-s border-[#d8e0ea]">
          <div className="h-8 w-8 rounded-lg bg-[#0b1f3a] flex items-center justify-center font-semibold text-xs text-white">
            AD
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-[#0b1f3a]">Super Admin</div>
            <div className="text-[10px] text-[#5b6b7c]">Gouvernance</div>
          </div>
        </div>
      </div>
    </header>
  );
}
