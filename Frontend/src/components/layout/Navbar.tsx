'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
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
  LogIn,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Building2,
  HeartHandshake,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import LanguageSelector from '@/components/ui/LanguageSelector';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route changes
  useEffect(() => {
    setAvatarMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

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

  const handleLogout = () => {
    logout();
    setAvatarMenuOpen(false);
    router.push('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'organization':
        return {
          label: t('auth.role_org'),
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: Building2,
        };
      case 'admin':
        return {
          label: t('auth.role_admin'),
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500',
          icon: ShieldCheck,
        };
      case 'volunteer':
      default:
        return {
          label: t('auth.role_vol'),
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          icon: HeartHandshake,
        };
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

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d8e0ea] bg-white/95 backdrop-blur-md">
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
            {/* Quick Seed Button */}
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

            {/* Create Mission CTA */}
            <Link
              href="/missions/create"
              className="btn-primary inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t('nav.create_mission')}</span>
            </Link>

            {/* Auth section */}
            {user ? (
              <div className="relative" ref={avatarMenuRef}>
                <button
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  aria-expanded={avatarMenuOpen}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-[#d8e0ea] bg-white hover:border-[#0d7a6f] hover:bg-[#f8fafb] transition-all shadow-xs"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#0d7a6f] to-[#0b1f3a] text-white font-bold text-xs shadow-xs">
                    {getInitials(user.name)}
                  </div>
                  <div className="text-left hidden lg:block leading-tight">
                    <p className="text-xs font-bold text-[#0b1f3a] max-w-[110px] truncate">{user.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${roleInfo.dot}`} />
                      <span className="text-[10px] font-medium text-[#5b6b7c] capitalize">{roleInfo.label}</span>
                    </div>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-[#5b6b7c] transition-transform ${avatarMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {avatarMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#d8e0ea] bg-white shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-[#eef2f6]">
                      <p className="text-sm font-bold text-[#0b1f3a] truncate">{user.name}</p>
                      <p className="text-xs text-[#5b6b7c] truncate mt-0.5">{user.email}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${roleInfo.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${roleInfo.dot}`} />
                          {roleInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/missions/browse"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0b1f3a] hover:bg-[#f3f5f8] transition-colors"
                      >
                        <Compass className="h-4 w-4 text-[#0d7a6f]" />
                        <span>{t('nav.browse')}</span>
                      </Link>
                      {user.role === 'organization' && (
                        <Link
                          href="/missions/create"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0b1f3a] hover:bg-[#f3f5f8] transition-colors"
                        >
                          <PlusCircle className="h-4 w-4 text-[#0d7a6f]" />
                          <span>{t('nav.create_mission')}</span>
                        </Link>
                      )}
                      {(user.role === 'admin' || user.role === 'organization') && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0b1f3a] hover:bg-[#f3f5f8] transition-colors"
                        >
                          <ShieldCheck className="h-4 w-4 text-[#0d7a6f]" />
                          <span>{t('auth.admin_portal')}</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-[#eef2f6]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('auth.logout_btn')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-[#d8e0ea] bg-white px-3.5 py-2 text-sm font-semibold text-[#0b1f3a] hover:border-[#0d7a6f] hover:text-[#0d7a6f] transition-all shadow-2xs"
              >
                <LogIn className="h-4 w-4" />
                <span>{t('auth.signin_btn')}</span>
              </Link>
            )}

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
          <div className="sm:hidden pb-4 pt-2 border-t border-[#d8e0ea] space-y-2">
            {/* User card in mobile */}
            {user ? (
              <div className="p-3 mb-2 rounded-xl bg-[#f8fafb] border border-[#d8e0ea]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#0d7a6f] to-[#0b1f3a] text-white font-bold text-sm">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0b1f3a] truncate">{user.name}</p>
                    <p className="text-xs text-[#5b6b7c] truncate">{user.email}</p>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleInfo.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${roleInfo.dot}`} />
                      {roleInfo.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t('auth.logout_btn')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#d8e0ea] bg-white text-sm font-semibold text-[#0b1f3a]"
                >
                  <LogIn className="h-4 w-4" />
                  {t('auth.signin_btn')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0d7a6f] text-white text-sm font-semibold"
                >
                  <UserIcon className="h-4 w-4" />
                  {t('auth.link_register')}
                </Link>
              </div>
            )}

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

