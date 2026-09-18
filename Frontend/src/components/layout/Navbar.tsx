'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  RefreshCw,
  CheckCircle2,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  Compass,
  LayoutDashboard,
  Info,
  Phone,
  CircleHelp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import LanguageSelector from '@/components/ui/LanguageSelector';

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useTranslation();
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
    { name: t('nav.about'), href: '/about', icon: Info },
    { name: t('nav.help'), href: '/aide', icon: CircleHelp },
    { name: t('nav.contact'), href: '/contact', icon: Phone },
    { name: t('nav.admin'), href: '/admin', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d8e0ea] bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[88px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center flex-shrink-0 group rounded-none">
            <Image
              src="/logo.png"
              alt="Volunteer Community"
              width={220}
              height={80}
              priority
              className="h-[72px] w-auto object-contain rounded-none group-hover:opacity-90 transition-opacity"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {mainLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname?.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive
                      ? 'text-[#0d7a6f] bg-[#e6f4f2]'
                      : 'text-[#5b6b7c] hover:text-[#0b1f3a] hover:bg-[#f3f5f8]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={handleSeed}
              disabled={seeding}
              title={t('nav.seed')}
              aria-label={t('nav.seed')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8e0ea] bg-white text-[#5b6b7c] hover:text-[#0b1f3a] hover:border-[#b8c6d6] transition-colors"
            >
              {seedSuccess ? (
                <CheckCircle2 className="h-4 w-4 text-[#0d7a6f]" />
              ) : (
                <RefreshCw className={`h-4 w-4 ${seeding ? 'animate-spin text-[#0d7a6f]' : ''}`} />
              )}
            </button>

            <Link
              href="/missions/create"
              className="btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t('nav.create_mission')}</span>
            </Link>

            <div className="ms-2 ps-3 border-s border-[#d8e0ea]">
              <LanguageSelector />
            </div>
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg border border-[#d8e0ea] bg-white p-2 text-[#5b6b7c]"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden pb-4 pt-2 border-t border-[#d8e0ea] space-y-1">
            {mainLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname?.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    isActive ? 'bg-[#e6f4f2] text-[#0d7a6f]' : 'text-[#0b1f3a]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/missions/create"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary mt-2 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              {t('nav.create_mission')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
