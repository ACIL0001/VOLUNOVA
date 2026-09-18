'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  Compass,
  Users,
  Activity,
  ExternalLink,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: "Vue d'Ensemble", href: '/admin', icon: LayoutDashboard },
  { name: 'Validation des ONG', href: '/admin/organizations', icon: ShieldCheck },
  { name: 'Contrôle des Missions', href: '/admin/missions', icon: Compass },
  { name: 'Répertoire Bénévoles', href: '/admin/volunteers', icon: Users },
  { name: "Journal d'Audit", href: '/admin/audit', icon: Activity },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-[#d8e0ea] flex flex-col justify-between p-5 sticky top-0 h-screen overflow-y-auto">
      <div>
        <Link href="/admin" className="flex items-center gap-3 mb-8 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1f3a] text-white font-display text-lg font-semibold group-hover:bg-[#163356] transition-colors">
            V
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-[0.12em] text-[#0b1f3a] font-display">
              VOLUNOVA
            </div>
            <div className="text-[10px] font-semibold text-[#0d7a6f] uppercase tracking-wider">
              Admin
            </div>
          </div>
        </Link>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#e6f4f2] text-[#0d7a6f]'
                    : 'text-[#5b6b7c] hover:bg-[#f3f5f8] hover:text-[#0b1f3a]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-5 border-t border-[#d8e0ea] space-y-2">
        <div className="text-[10px] font-semibold text-[#5b6b7c] uppercase tracking-wider px-2">
          Portail public
        </div>
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#d8e0ea] bg-[#f8fafc] text-xs font-semibold text-[#0b1f3a] hover:border-[#0d7a6f] hover:text-[#0d7a6f] transition-colors"
        >
          <span>Retour au site</span>
          <ExternalLink className="h-3 w-3 text-[#5b6b7c]" />
        </Link>
        <Link
          href="/demo"
          className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#d8e0ea] bg-[#f8fafc] text-xs font-semibold text-[#0b1f3a] hover:border-[#0d7a6f] hover:text-[#0d7a6f] transition-colors"
        >
          <span>Mode Démo</span>
          <ExternalLink className="h-3 w-3 text-[#5b6b7c]" />
        </Link>
      </div>
    </aside>
  );
}
