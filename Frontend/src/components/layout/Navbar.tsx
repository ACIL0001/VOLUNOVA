'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
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
  Bell,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { api, NotificationItem } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { subscribeToUserNotifications } from '@/lib/socket';
import LanguageSelector from '@/components/ui/LanguageSelector';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  // Notification state (specifically for organization & admin)
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route changes
  useEffect(() => {
    setAvatarMenuOpen(false);
    setMobileMenuOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  // Real-time polling for organization notifications
  const fetchNotifications = React.useCallback(async () => {
    if (!user || (user.role !== 'organization' && user.role !== 'admin')) return;
    try {
      const res = await api.getNotifications();
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // Silently ignore network hiccups
    }
  }, [user]);

  // ⚡ Real-Time Socket Connection & Notification Listener
  useEffect(() => {
    if (!user || (user.role !== 'organization' && user.role !== 'admin')) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Initial data fetch
    fetchNotifications();

    // Subscribe to real-time private user socket channel
    const unsubscribe = subscribeToUserNotifications(user._id, (newNotif) => {
      console.log('⚡ [Navbar Socket] Real-time notification received:', newNotif);
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n._id !== newNotif._id)]);
      setUnreadCount((prev) => prev + 1);
    });

    // Fallback heartbeat polling
    const interval = setInterval(fetchNotifications, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Error marking all notifications as read:', err);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.readAt) {
      try {
        await api.markNotificationRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.warn('Error marking notification as read:', err);
      }
    }
    setNotificationOpen(false);
    if (notif.payload?.missionId) {
      router.push(`/missions/${notif.payload.missionId}`);
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
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
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
            {/* Org / admin: go to secured dashboard (not create mission on public chrome) */}
            {user && user.role === 'organization' && (
              <Link
                href="/dashboard"
                className="btn-primary inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{t('auth.go_dashboard')}</span>
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link
                href="/admin"
                className="btn-primary inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{t('auth.admin_portal')}</span>
              </Link>
            )}

            {/* Notification Bell (Only for Organization & Admin) */}
            {user && (user.role === 'organization' || user.role === 'admin') && (
              <div className="relative" ref={notificationRef}>
                <button
                  type="button"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  aria-expanded={notificationOpen}
                  aria-label={t('nav.notifications')}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8e0ea] bg-white text-[#5b6b7c] hover:text-[#0b1f3a] hover:border-[#b8c6d6] transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-xs animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#d8e0ea] bg-white shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#eef2f6]">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-[#0d7a6f]" />
                        <span className="text-sm font-bold text-[#0b1f3a]">{t('nav.notifications')}</span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-black text-red-600 border border-red-200">
                            {unreadCount} {t('nav.new_badge')}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-[#0d7a6f] hover:underline"
                        >
                          {t('nav.mark_all_read')}
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#f1f5f9]">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center px-4">
                          <Bell className="h-7 w-7 text-[#b8c6d6] mx-auto mb-2 opacity-50" />
                          <p className="text-xs text-[#8fa0b3] font-medium">{t('nav.no_notifications')}</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const isUnread = !notif.readAt;
                          const isAcceptance = notif.type === 'application_accepted';

                          return (
                            <button
                              key={notif._id}
                              type="button"
                              onClick={() => handleNotificationClick(notif)}
                              className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                                isUnread ? 'bg-[#f0f9f8]/70 hover:bg-[#e6f4f2]' : 'hover:bg-[#f8fafc]'
                              }`}
                            >
                              <div
                                className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  isAcceptance
                                    ? 'bg-[#e6f4f2] text-[#0d7a6f] border border-[#0d7a6f]/20'
                                    : 'bg-[#eef2f6] text-[#0b1f3a]'
                                }`}
                              >
                                {isAcceptance ? <UserCheck className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-xs font-bold truncate ${isUnread ? 'text-[#0b1f3a]' : 'text-[#5b6b7c]'}`}>
                                    {isAcceptance ? t('nav.invitation_accepted_title') : (notif.payload?.title || 'Notification')}
                                  </span>
                                  {isUnread && <span className="h-2 w-2 rounded-full bg-[#0d7a6f] flex-shrink-0" />}
                                </div>

                                <p className="text-xs text-[#5b6b7c] mt-0.5 line-clamp-2 leading-relaxed">
                                  {notif.payload?.message || (
                                    notif.payload?.volunteerName
                                      ? `${notif.payload.volunteerName} ${t('nav.volunteer_joined')} "${notif.payload?.missionTitle}"`
                                      : 'Nouvelle mise à jour'
                                  )}
                                </p>

                                <span className="text-[10px] text-[#8fa0b3] mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#0b1f3a] hover:bg-[#f3f5f8] transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-[#0d7a6f]" />
                          <span>{t('auth.go_dashboard')}</span>
                        </Link>
                      )}
                      {user.role === 'admin' && (
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
            {user && (user.role === 'organization' || user.role === 'admin') && (
              <button
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8e0ea] bg-white text-[#5b6b7c]"
                aria-label={t('nav.notifications')}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
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
            {user && user.role === 'organization' && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary mt-2 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold"
              >
                <LayoutDashboard className="h-4 w-4" />
                {t('auth.go_dashboard')}
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary mt-2 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold"
              >
                <ShieldCheck className="h-4 w-4" />
                {t('auth.admin_portal')}
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

