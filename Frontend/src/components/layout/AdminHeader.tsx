'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

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
    <header className="min-h-[72px] bg-white/90 border-b border-[#d8e0ea] px-6 py-4 flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-40">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-[#0b1f3a] font-display truncate">{title}</h1>
        {subtitle && <p className="text-xs text-[#5b6b7c] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d8e0ea] bg-white text-xs font-semibold text-[#5b6b7c] hover:text-[#0b1f3a] hover:border-[#b8c6d6] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#0d7a6f]' : ''}`} />
            <span>Actualiser</span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#e6f4f2] text-xs font-semibold text-[#0d7a6f]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0d7a6f]" />
          <span>API :5000</span>
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
