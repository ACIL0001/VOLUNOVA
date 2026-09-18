'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push('/missions/browse');
    }
  }, [user, router]);

  // Check if arriving immediately after registration
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('registered') === 'true') {
        setSuccessMsg(t('auth.account_created'));
      }
    }
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez renseigner tous les champs.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      setSuccessMsg(t('auth.welcome_back'));
      setTimeout(() => {
        router.push('/missions/browse');
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Identifiants invalides ou serveur indisponible.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
    setLoading(true);

    try {
      await login(demoEmail, 'password123');
      setSuccessMsg(t('auth.welcome_back'));
      setTimeout(() => {
        router.push('/missions/browse');
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Connexion démo échouée. Assurez-vous que la base de données est initialisée.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-88px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f8fafb]">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            {t('auth.login_title')}
          </h1>
          <p className="text-sm text-[#5b6b7c]">
            {t('auth.login_subtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="surface-panel p-6 sm:p-8 rounded-2xl border border-[#d8e0ea] bg-white shadow-xl">
          {error && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <p className="font-medium">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                {t('auth.email_label')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5b6b7c]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.dz"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e0ea] bg-[#f8fafb] text-sm text-[#0b1f3a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:border-[#0d7a6f] focus:ring-2 focus:ring-[#0d7a6f]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                {t('auth.password_label')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5b6b7c]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#d8e0ea] bg-[#f8fafb] text-sm text-[#0b1f3a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:border-[#0d7a6f] focus:ring-2 focus:ring-[#0d7a6f]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5b6b7c] hover:text-[#0b1f3a]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>{t('auth.signin_btn')}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for judges / testing */}
          <div className="mt-6 pt-5 border-t border-[#d8e0ea]">
            <p className="text-xs font-bold text-[#5b6b7c] uppercase tracking-wider mb-3 text-center">
              Accès Démo 1-Clic (Évaluation / Pitch)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('org@volunova.dz')}
                disabled={loading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold transition-all"
              >
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t('auth.demo_org_btn')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ahmed@volunova.dz')}
                disabled={loading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-50 text-blue-800 text-xs font-semibold transition-all"
              >
                <HeartHandshake className="h-3.5 w-3.5 text-blue-600" />
                <span>{t('auth.demo_vol_btn')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer link to Register */}
        <p className="text-center text-sm text-[#5b6b7c]">
          {t('auth.no_account')}{' '}
          <Link
            href="/register"
            className="font-bold text-[#0d7a6f] hover:underline inline-flex items-center gap-1"
          >
            <span>{t('auth.link_register')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}
