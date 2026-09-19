'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  Home,
  Bell,
  ChevronDown,
  Globe,
  Check,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import { api, NotificationItem } from '@/lib/api';
import { subscribeToUserNotifications } from '@/lib/socket';
import { Locale, LOCALE_METADATA } from '@/locales';

interface OrgHeaderProps {
  title: string;
  subtitle?: string;
}

const LOCALES: Locale[] = ['ar', 'fr', 'en'];

const LANGUAGE_NAMES: Record<Locale, Record<Locale, string>> = {
  ar: { ar: 'العربية', fr: 'الفرنسية', en: 'الإنجليزية' },
  en: { ar: 'Arabic', fr: 'French', en: 'English' },
  fr: { ar: 'Arabe', fr: 'Français', en: 'Anglais' },
};

export default function OrgHeader({ title, subtitle }: OrgHeaderProps) {
  const { user, logout } = useAuth();
  const { t, locale, setLocale, dir } = useTranslation();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = React.useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      if (res?.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // ignore transient errors
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const unsubscribe = subscribeToUserNotifications(user._id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n._id !== newNotif._id)]);
      setUnreadCount((prev) => prev + 1);
    });
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
    } catch {
      // ignore
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
      } catch {
        // ignore
      }
    }
    setNotificationOpen(false);
    if (notif.payload?.missionId) {
      router.push(`/missions/${notif.payload.missionId}`);
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push('/login');
  };

  const initials = (user?.name || 'O')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'O';

  return (
    <header className="min-h-[72px] bg-white/90 border-b border-[#d8e0ea] px-4 sm:px-6 py-4 flex items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-40">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-[#0b1f3a] font-display truncate">{title}</h1>
        {subtitle && <p className="text-xs text-[#5b6b7c] mt-0.5 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => {
              setNotificationOpen((o) => !o);
              setMenuOpen(false);
            }}
            aria-expanded={notificationOpen}
            aria-label={t('nav.notifications')}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8e0ea] bg-white text-[#5b6b7c] hover:text-[#0b1f3a] hover:border-[#b8c6d6] transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -end-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div
              className={`absolute mt-2 w-80 sm:w-96 rounded-2xl border border-[#d8e0ea] bg-white shadow-xl py-2 z-50 ${
                dir === 'rtl' ? 'left-0' : 'right-0'
              }`}
            >
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
                            <span
                              className={`text-xs font-bold truncate ${
                                isUnread ? 'text-[#0b1f3a]' : 'text-[#5b6b7c]'
                              }`}
                            >
                              {isAcceptance
                                ? t('nav.invitation_accepted_title')
                                : notif.payload?.title || 'Notification'}
                            </span>
                            {isUnread && <span className="h-2 w-2 rounded-full bg-[#0d7a6f] flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-[#5b6b7c] mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.payload?.message ||
                              (notif.payload?.volunteerName
                                ? `${notif.payload.volunteerName} ${t('nav.volunteer_joined')} "${notif.payload?.missionTitle}"`
                                : 'Nouvelle mise à jour')}
                          </p>
                          <span className="text-[10px] text-[#8fa0b3] mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
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

        {/* Profile dropdown: home + language + logout */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setMenuOpen((o) => !o);
              setNotificationOpen(false);
            }}
            aria-expanded={menuOpen}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-[#d8e0ea] bg-white hover:border-[#0d7a6f] hover:bg-[#f8fafb] transition-all"
          >
            <div className="h-8 w-8 rounded-lg bg-[#0b1f3a] flex items-center justify-center font-semibold text-xs text-white">
              {initials}
            </div>
            <div className="hidden md:block text-start max-w-[140px]">
              <div className="text-xs font-semibold text-[#0b1f3a] truncate">{user?.name}</div>
              <div className="text-[10px] text-[#5b6b7c] truncate">{user?.email}</div>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-[#5b6b7c] me-1 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {menuOpen && (
            <div
              className={`absolute mt-2 w-64 rounded-xl border border-[#d8e0ea] bg-white shadow-xl py-2 z-50 ${
                dir === 'rtl' ? 'left-0' : 'right-0'
              }`}
            >
              <div className="px-4 py-3 border-b border-[#eef2f6]">
                <p className="text-sm font-bold text-[#0b1f3a] truncate">{user?.name}</p>
                <p className="text-xs text-[#5b6b7c] truncate mt-0.5">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0b1f3a] hover:bg-[#f3f5f8] transition-colors"
                >
                  <Home className="h-4 w-4 text-[#0d7a6f]" />
                  <span>{t('dashboard.back_home')}</span>
                </Link>
              </div>

              <div className="border-t border-[#eef2f6] px-3 py-2">
                <div className="flex items-center gap-1.5 px-1 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8fa0b3]">
                  <Globe className="h-3 w-3" />
                  <span>Langue</span>
                </div>
                <div className="space-y-0.5">
                  {LOCALES.map((loc) => {
                    const selected = locale === loc;
                    const meta = LOCALE_METADATA[loc];
                    const label = LANGUAGE_NAMES[locale]?.[loc] || meta.nativeName;
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocale(loc)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
                          selected
                            ? 'bg-[#e6f4f2] text-[#0d7a6f]'
                            : 'text-[#0b1f3a] hover:bg-[#f3f5f8]'
                        }`}
                      >
                        <span>
                          {meta.code} · {label}
                        </span>
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-1 border-t border-[#eef2f6]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-start"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('auth.logout_btn')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
