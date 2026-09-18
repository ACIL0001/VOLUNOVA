'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    // If finished loading and not authenticated at all, redirect to login
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/admin')}`);
    }
  }, [user, loading, router, pathname]);

  // 1. Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1f3a] text-white p-4">
        <div className="h-10 w-10 border-3 border-[#0d7a6f] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Vérification des habilitations d'administration...
        </p>
      </div>
    );
  }

  // 2. Not logged in (handled by useEffect redirect, but show loading while redirecting)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1f3a] text-white p-4">
        <div className="h-10 w-10 border-3 border-[#0d7a6f] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Redirection vers la page de connexion...
        </p>
      </div>
    );
  }

  // 3. Logged in, but NOT an admin (Volunteer or Organization)
  if (user.role !== 'admin') {
    const roleLabel =
      user.role === 'organization'
        ? 'Organisation / Association'
        : user.role === 'volunteer'
        ? 'Bénévole Citoyen'
        : user.role;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] p-4 sm:p-6">
        <div className="max-w-md w-full surface-panel p-8 rounded-2xl border border-red-200 bg-white text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-200 text-red-600 mb-5 shadow-inner">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 mb-3">
            <Lock className="h-3 w-3" />
            Accès 403 Restreint
          </span>

          <h1 className="text-2xl font-extrabold text-[#0b1f3a]">
            Espace Réservé aux Administrateurs
          </h1>

          <p className="mt-3 text-sm text-[#5b6b7c] leading-relaxed">
            Cette section de gouvernance nationale est strictement réservée aux administrateurs certifiés de la plateforme VOLUNOVA.
          </p>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-[#d8e0ea] text-xs text-left text-[#0b1f3a]">
            <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Session en cours :</p>
            <p className="font-bold text-sm text-[#0b1f3a] mt-0.5">{user.name}</p>
            <p className="text-slate-500">{user.email}</p>
            <p className="mt-1 font-semibold text-amber-700">Rôle : {roleLabel}</p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="btn-primary flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Accueil</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/login?redirect=/admin');
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Changer de compte</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin
  return <>{children}</>;
}
