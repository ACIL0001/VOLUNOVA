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
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
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
      const res = await login(email, password);
      setSuccessMsg(t('auth.welcome_back'));
      const redirectParam = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;

      setTimeout(() => {
        if (redirectParam) {
          router.push(redirectParam);
        } else if (res?.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/missions/browse');
        }
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Identifiants invalides ou serveur indisponible.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = async () => {
    setEmail('admin@gmail.com');
    setPassword('admin1234');
    setError(null);
    setLoading(true);

    try {
      const res = await login('admin@gmail.com', 'admin1234');
      setSuccessMsg(t('auth.welcome_back'));
      const redirectParam = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;

      setTimeout(() => {
        if (redirectParam) {
          router.push(redirectParam);
        } else if (res?.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/missions/browse');
        }
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Connexion administrateur échouée.');
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
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                {t('auth.email_label')}
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-[#5b6b7c] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full bg-[#f8fafc] border border-[#d8e0ea] rounded-xl ps-10 pe-4 py-2.5 text-sm text-[#0b1f3a] placeholder:text-[#8fa0b3] focus:bg-white focus:outline-none focus:border-[#0d7a6f] focus:ring-2 focus:ring-[#0d7a6f]/15 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider">
                  {t('auth.password_label')}
                </label>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-[#5b6b7c] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f8fafc] border border-[#d8e0ea] rounded-xl ps-10 pe-10 py-2.5 text-sm text-[#0b1f3a] placeholder:text-[#8fa0b3] focus:bg-white focus:outline-none focus:border-[#0d7a6f] focus:ring-2 focus:ring-[#0d7a6f]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[#5b6b7c] hover:text-[#0b1f3a] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
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

          {/* Standard Admin Access */}
          <div className="mt-6 pt-5 border-t border-[#d8e0ea]">
            <p className="text-xs font-bold text-[#5b6b7c] uppercase tracking-wider mb-3 text-center">
              Accès Administrateur Standard
            </p>
            <button
              type="button"
              onClick={handleQuickAdmin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold transition-all shadow-sm"
            >
              <ShieldCheck className="h-4 w-4 text-purple-700 flex-shrink-0" />
              <span>Connexion Administrateur (admin@gmail.com)</span>
            </button>
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
