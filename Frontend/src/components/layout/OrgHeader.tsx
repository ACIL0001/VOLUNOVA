'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import LanguageSelector from '@/components/ui/LanguageSelector';

interface OrgHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function OrgHeader({ title, subtitle, onRefresh, loading }: OrgHeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = (user?.name || 'O')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'O';

  return (
    <header className="min-h-[72px] bg-white/90 border-b border-[#d8e0ea] px-6 py-4 flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-40">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-[#0b1f3a] font-display truncate">{title}</h1>
        {subtitle && <p className="text-xs text-[#5b6b7c] mt-0.5 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d8e0ea] bg-white text-xs font-semibold text-[#5b6b7c] hover:text-[#0b1f3a] hover:border-[#b8c6d6] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#0d7a6f]' : ''}`} />
            <span className="hidden sm:inline">{t('dashboard.refresh')}</span>
          </button>
        )}

        <LanguageSelector />

        <div className="flex items-center gap-2 ps-3 border-s border-[#d8e0ea]">
          <div className="h-8 w-8 rounded-lg bg-[#0b1f3a] flex items-center justify-center font-semibold text-xs text-white">
            {initials}
          </div>
          <div className="hidden md:block text-left max-w-[140px]">
            <div className="text-xs font-semibold text-[#0b1f3a] truncate">{user?.name}</div>
            <div className="text-[10px] text-[#5b6b7c] truncate">{user?.email}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title={t('auth.logout_btn')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d8e0ea] text-[#5b6b7c] hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
