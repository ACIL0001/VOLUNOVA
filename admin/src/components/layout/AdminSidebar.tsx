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
  Shield,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Vue d\'Ensemble', href: '/', icon: LayoutDashboard },
  { name: 'Validation des ONG', href: '/organizations', icon: ShieldCheck },
  { name: 'Contrôle des Missions', href: '/missions', icon: Compass },
  { name: 'Répertoire Bénévoles', href: '/volunteers', icon: Users },
  { name: 'Journal d\'Audit Zero-Trust', href: '/audit', icon: Activity },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#060b18] border-r border-blue-900/30 flex flex-col justify-between p-5 min-h-screen">
      <div>
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 p-[1.5px] shadow-lg shadow-blue-600/30">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#070b16]">
              <Shield className="h-5 w-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="text-lg font-black tracking-wider text-white">VOLUNOVA</div>
            <div className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Admin Control</div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                    : 'text-slate-300 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 opacity-90" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Cross-Platform Ecosystem Jump Links */}
      <div className="pt-5 border-t border-blue-900/30 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
          Écosystème VOLUNOVA
        </div>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-950/30 border border-blue-900/30 text-xs font-semibold text-slate-300 hover:text-sky-300 transition-colors"
        >
          <span>Portail Web ONG (:3000)</span>
          <ExternalLink className="h-3 w-3 text-slate-500" />
        </a>

        <a
          href="http://localhost:3000/demo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-950/30 border border-blue-900/30 text-xs font-semibold text-slate-300 hover:text-sky-300 transition-colors"
        >
          <span>Mode Démo Split (:3000)</span>
          <ExternalLink className="h-3 w-3 text-slate-500" />
        </a>
      </div>
    </aside>
  );
}
