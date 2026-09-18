'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Compass,
  LayoutDashboard,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import LanguageSelector from '@/components/ui/LanguageSelector';

export default function Navbar() {
  const pathname = usePathname();
  const { t, dir, isRTL } = useTranslation();
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.seedDatabase();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
      window.location.reload();
    } catch (err: any) {
      console.error('Seed failed:', err);
      alert('Could not seed database. Make sure backend is running on port 5000.');
    } finally {
      setSeeding(false);
    }
  };

  const mainLinks = [
    { name: t('nav.home'), href: '/', icon: Compass },
    { name: t('nav.browse'), href: '/missions/browse', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-900/35 bg-[#060b18]/92 backdrop-blur-2xl shadow-xl shadow-blue-950/40 transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[70px] items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3.5 group flex-shrink-0">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-400 p-[1.5px] shadow-lg shadow-blue-600/30 group-hover:shadow-blue-500/50 group-hover:scale-105 transition-all">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#070b16]">
                <Shield className="h-5 w-5 text-sky-400 group-hover:scale-105 transition-transform" />
              </div>
            </div>
            <span className="text-xl font-black tracking-wider text-white font-sans">
              VOLUNOVA
            </span>
          </Link>

          {/* Center: Clean Segmented Navigation Dock */}
          <nav className="hidden md:flex items-center gap-1.5 rounded-full border border-blue-900/40 bg-[#081026]/75 p-1.5 shadow-inner shadow-black/40 backdrop-blur-md">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold shadow-md shadow-blue-600/30 border border-blue-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 opacity-90" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Area: Action Tools & Far-Separated Language Selector */}
          <div className="hidden sm:flex items-center">
            {/* Core Action Tools Group */}
            <div className="flex items-center gap-3">
              {/* Live Hackathon Demo Pill */}
              <Link
                href="/demo"
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
                  pathname === '/demo'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                    : 'bg-blue-950/50 text-sky-300 border-blue-500/30 hover:bg-blue-900/50 hover:border-sky-400/60 hover:text-white'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
                </span>
                <Smartphone className="h-3.5 w-3.5" />
                <span>{t('nav.demo')}</span>
              </Link>

              {/* Quick Seed Reset Button (Icon-only) */}
              <button
                onClick={handleSeed}
                disabled={seeding}
                title={t('nav.seed')}
                aria-label={t('nav.seed')}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 text-slate-300 hover:border-blue-500/40 hover:text-sky-300 transition-all shadow-sm active:scale-95 flex-shrink-0"
              >
                {seedSuccess ? (
                  <CheckCircle2 className="h-4 w-4 text-sky-400" />
                ) : (
                  <RefreshCw className={`h-4 w-4 ${seeding ? 'animate-spin text-sky-400' : 'text-slate-400'}`} />
                )}
              </button>

              {/* Primary Action Button: Nouvelle Mission */}
              <Link
                href="/missions/create"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500 transition-all transform hover:-translate-y-0.5 border border-blue-400/30"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>{t('nav.create_mission')}</span>
              </Link>
            </div>

            {/* Distinct Language Switcher Zone: Generously Spaced & Separated */}
            <div className="ms-6 sm:ms-8 ps-6 sm:ps-8 border-s border-blue-900/50 flex items-center">
              <LanguageSelector />
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex sm:hidden items-center gap-2.5">
            <LanguageSelector />
            <Link
              href="/demo"
              className="flex items-center gap-1 rounded-lg bg-blue-950/60 border border-blue-500/30 px-2 py-1 text-[11px] font-bold text-sky-300"
            >
              <span>Demo</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4 pt-2 border-t border-slate-800/80 space-y-2">
            {mainLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={handleSeed}
                disabled={seeding}
                title={t('nav.seed')}
                aria-label={t('nav.seed')}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-sky-300 flex-shrink-0"
              >
                {seedSuccess ? (
                  <CheckCircle2 className="h-4 w-4 text-sky-400" />
                ) : (
                  <RefreshCw className={`h-4 w-4 ${seeding ? 'animate-spin text-sky-400' : ''}`} />
                )}
              </button>
              <Link
                href="/missions/create"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-md"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>{t('nav.create_mission')}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
