'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Least-privilege route guard for organization dashboard.
 * - Unauthenticated → login with safe redirect
 * - Wrong role → 403 (no content leak)
 * - organization (or admin for support) → children
 */
export default function OrgGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/dashboard')}`);
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-civic p-4">
        <div className="h-10 w-10 border-3 border-[#0d7a6f] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-[#5b6b7c]">
          Vérification des habilitations...
        </p>
      </div>
    );
  }

  if (user.role !== 'organization' && user.role !== 'admin') {
    const roleLabel =
      user.role === 'volunteer' ? 'Bénévole Citoyen' : user.role;

    return (
      <div className="min-h-screen flex items-center justify-center bg-civic p-4 sm:p-6">
        <div className="max-w-md w-full surface-panel p-8 rounded-2xl border border-red-200 bg-white text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-200 text-red-600 mb-5">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 mb-3">
            <Lock className="h-3 w-3" />
            Accès 403 Restreint
          </span>

          <h1 className="text-2xl font-extrabold text-[#0b1f3a]">
            Espace Réservé aux Organisations
          </h1>

          <p className="mt-3 text-sm text-[#5b6b7c] leading-relaxed">
            Ce tableau de bord est réservé aux comptes association / ONG vérifiés sur VOLUNOVA.
          </p>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-[#d8e0ea] text-xs text-left text-[#0b1f3a]">
            <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Session en cours :
            </p>
            <p className="font-bold text-sm mt-0.5">{user.name}</p>
            <p className="text-slate-500">{user.email}</p>
            <p className="mt-1 font-semibold text-amber-700">Rôle : {roleLabel}</p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="btn-primary flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Accueil
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/login?redirect=/dashboard');
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-red-200 bg-white text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Changer de compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
