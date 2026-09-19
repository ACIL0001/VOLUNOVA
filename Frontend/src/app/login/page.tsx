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
import { useAuth, postAuthPath } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import AuthBrand, { AuthCard, AuthPageShell } from '@/components/auth/AuthBrand';

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

  React.useEffect(() => {
    if (user) {
      const redirectParam =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('redirect')
          : null;
      router.push(postAuthPath(user.role, redirectParam));
    }
  }, [user, router]);

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
      const redirectParam =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('redirect')
          : null;

      setTimeout(() => {
        router.push(postAuthPath(res?.user?.role, redirectParam));
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
      const redirectParam =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('redirect')
          : null;

      setTimeout(() => {
        router.push(postAuthPath(res?.user?.role, redirectParam));
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Connexion administrateur échouée.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthBrand title={t('auth.login_title')} subtitle={t('auth.login_subtitle')} />

      <AuthCard>
        {error && (
          <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-sm">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
              {t('auth.email_label')}
            </label>
            <div className="relative group">
              <Mail className="h-4 w-4 text-[#8fa0b3] group-focus-within:text-[#0d7a6f] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="auth-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
              {t('auth.password_label')}
            </label>
            <div className="relative group">
              <Lock className="h-4 w-4 text-[#8fa0b3] group-focus-within:text-[#0d7a6f] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input pe-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-[#8fa0b3] hover:text-[#0b1f3a] transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
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

        <div className="mt-6 pt-5 border-t border-[#e8eef4]">
          <p className="text-[10px] font-bold text-[#8fa0b3] uppercase tracking-wider mb-3 text-center">
            Accès Administrateur
          </p>
          <button
            type="button"
            onClick={handleQuickAdmin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#0b1f3a]/12 bg-[#0b1f3a]/[0.03] hover:bg-[#0b1f3a]/[0.06] text-[#0b1f3a] text-xs font-semibold transition-all"
          >
            <ShieldCheck className="h-4 w-4 text-[#0d7a6f] flex-shrink-0" />
            <span>Connexion Administrateur (admin@gmail.com)</span>
          </button>
        </div>
      </AuthCard>

      <p className="text-center text-sm text-[#5b6b7c] auth-brand-enter-delay-3">
        {t('auth.no_account')}{' '}
        <Link
          href="/register"
          className="font-bold text-[#0d7a6f] hover:underline inline-flex items-center gap-1"
        >
          <span>{t('auth.link_register')}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </p>
    </AuthPageShell>
  );
}
