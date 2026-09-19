'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  ExternalLink,
  Building2,
  Building,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';

const NAV_ITEMS = [
  { id: 'overview', href: '/dashboard', tab: 'overview', icon: LayoutDashboard, labelKey: 'dashboard.tab_overview' },
  { id: 'create', href: '/dashboard?tab=create', tab: 'create', icon: PlusCircle, labelKey: 'dashboard.tab_create' },
  { id: 'missions', href: '/dashboard?tab=missions', tab: 'missions', icon: ListChecks, labelKey: 'dashboard.tab_missions' },
  { id: 'profile', href: '/dashboard?tab=profile', tab: 'profile', icon: Building, labelKey: 'dashboard.tab_profile' },
  { id: 'support', href: '/dashboard?tab=support', tab: 'support', icon: LifeBuoy, labelKey: 'dashboard.tab_support' },
] as const;

function isTabActive(activeTab: string, itemTab: string, searchParams: ReturnType<typeof useSearchParams>) {
  if (itemTab === 'overview') {
    return activeTab === 'overview' || !searchParams.get('tab');
  }
  return activeTab === itemTab;
}

export default function OrgSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();

  const activeTab = searchParams.get('tab') || 'overview';
  const orgName = user?.organization?.name || user?.name || 'Organisation';

  return (
    <>
      {/* Mobile top tabs */}
      <nav className="md:hidden sticky top-0 z-50 bg-white border-b border-[#d8e0ea] px-3 py-2 flex gap-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname?.startsWith('/dashboard') && isTabActive(activeTab, item.tab, searchParams);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap ${
                active ? 'bg-[#e6f4f2] text-[#0d7a6f]' : 'text-[#5b6b7c]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-white border-r border-[#d8e0ea] flex-col justify-between p-5 sticky top-0 h-screen overflow-y-auto">
        <div>
          <Link href="/dashboard" className="flex items-center gap-3 mb-8 group">
            <Image
              src="/logo.png"
              alt="VOLUNOVA"
              width={140}
              height={48}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          <div className="mb-6 rounded-xl border border-[#d8e0ea] bg-[#f8fafc] p-3">
            <div className="flex items-center gap-2 text-[#0d7a6f] mb-1">
              <Building2 className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {t('dashboard.badge')}
              </span>
            </div>
            <p className="text-sm font-semibold text-[#0b1f3a] line-clamp-2 leading-snug">{orgName}</p>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname?.startsWith('/dashboard') && isTabActive(activeTab, item.tab, searchParams);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#e6f4f2] text-[#0d7a6f]'
                      : 'text-[#5b6b7c] hover:bg-[#f3f5f8] hover:text-[#0b1f3a]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-5 border-t border-[#d8e0ea] space-y-2">
          <div className="text-[10px] font-semibold text-[#5b6b7c] uppercase tracking-wider px-2">
            {t('dashboard.public_site')}
          </div>
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#d8e0ea] bg-[#f8fafc] text-xs font-semibold text-[#0b1f3a] hover:border-[#0d7a6f] hover:text-[#0d7a6f] transition-colors"
          >
            <span>{t('dashboard.back_home')}</span>
            <ExternalLink className="h-3 w-3 text-[#5b6b7c]" />
          </Link>
          <Link
            href="/missions/browse"
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#d8e0ea] bg-[#f8fafc] text-xs font-semibold text-[#0b1f3a] hover:border-[#0d7a6f] hover:text-[#0d7a6f] transition-colors"
          >
            <span>{t('dashboard.explore_public')}</span>
            <ExternalLink className="h-3 w-3 text-[#5b6b7c]" />
          </Link>
        </div>
      </aside>
    </>
  );
}
