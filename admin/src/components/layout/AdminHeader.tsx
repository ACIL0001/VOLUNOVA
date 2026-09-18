'use client';

import React from 'react';
import { Bell, ShieldCheck, RefreshCw } from 'lucide-react';

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
  return (
    <header className="h-[70px] bg-[#060b18]/80 border-b border-blue-900/30 px-6 flex items-center justify-between backdrop-blur-xl sticky top-0 z-40">
      <div>
        <h1 className="text-lg font-black text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:border-sky-400/40 hover:text-sky-300 transition-all active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            <span>Actualiser</span>
          </button>
        )}

        {/* Live System Guard Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-xs font-bold text-sky-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
          </span>
          <span>Serveur Actif (:5000)</span>
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-blue-900/30">
          <div className="h-8 w-8 rounded-full bg-blue-600 border border-blue-400/40 flex items-center justify-center font-bold text-xs text-white shadow-md">
            AD
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white">Super Admin</div>
            <div className="text-[10px] text-slate-400">Gouvernance Nationale</div>
          </div>
        </div>
      </div>
    </header>
  );
}
