'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  MapPin,
  Building2,
  HeartHandshake,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Tag,
  Wrench,
} from 'lucide-react';
import { useAuth, postAuthPath } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, signup } = useAuth();
  const { t } = useTranslation();

  const [role, setRole] = useState<'organization' | 'volunteer'>('organization');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [city, setCity] = useState('Alger');
  const [category, setCategory] = useState('Humanitarian');
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect by role
  React.useEffect(() => {
    if (user) {
      router.push(postAuthPath(user.role));
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const skillsArray = skillsInput
        ? skillsInput.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await signup({
        name,
        email,
        password,
        role,
        city,
        ...(role === 'organization' ? { category, orgName: name } : { skills: skillsArray }),
      });

      setSuccessMsg(t('auth.account_created'));
      setTimeout(() => {
        router.push(postAuthPath(res?.user?.role || role));
      }, 500);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'inscription. Veuillez vérifier vos données.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-88px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f8fafb]">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1f3a] tracking-tight">
            {t('auth.register_title')}
          </h1>
          <p className="text-sm text-[#5b6b7c]">
            {t('auth.register_subtitle')}
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

          {/* Role selector switcher */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-2">
              {t('auth.role_label')}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#f3f5f8] rounded-xl border border-[#d8e0ea]">
              <button
                type="button"
                onClick={() => setRole('organization')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'organization'
                    ? 'bg-white text-[#0d7a6f] shadow-xs border border-[#d8e0ea]'
                    : 'text-[#5b6b7c] hover:text-[#0b1f3a]'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>{t('auth.role_org')}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  role === 'volunteer'
                    ? 'bg-white text-[#0d7a6f] shadow-xs border border-[#d8e0ea]'
                    : 'text-[#5b6b7c] hover:text-[#0b1f3a]'
                }`}
              >
                <HeartHandshake className="h-4 w-4" />
                <span>{t('auth.role_vol')}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                {role === 'organization' ? 'Nom de l’Organisation / Association' : 'Nom et Prénom'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5b6b7c]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'organization' ? 'Croissant-Rouge Algérien, Ness El Khir...' : 'Amina Mansouri'}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e0ea] bg-[#f8fafb] text-sm text-[#0b1f3a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:border-[#0d7a6f] focus:ring-2 focus:ring-[#0d7a6f]/20 transition-all"
                />
              </div>
            </div>

            {/* Email */}
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
                  placeholder="contact@organisation.dz"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e0ea] bg-[#f8fafb] text-sm text-[#0b1f3a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:border-[#0d7a6f] focus:ring-2 focus:ring-[#0d7a6f]/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
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
                  placeholder="Au moins 6 caractères"
                  minLength={6}
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

            {/* City / Wilaya */}
            <div>
              <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                {t('auth.city_label')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5b6b7c]">
                  <MapPin className="h-4 w-4" />
                </div>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e0ea] bg-[#f8fafb] text-sm text-[#0b1f3a] focus:bg-white focus:outline-none focus:border-[#0d7a6f] focus:ring-2 focus:ring-[#0d7a6f]/20 transition-all appearance-none"
                >
                  <option value="Alger">Alger (16)</option>
                  <option value="Oran">Oran (31)</option>
                  <option value="Constantine">Constantine (25)</option>
                  <option value="Blida">Blida (09)</option>
                  <option value="Tizi Ouzou">Tizi Ouzou (15)</option>
                  <option value="Béjaïa">Béjaïa (06)</option>
                  <option value="Sétif">Sétif (19)</option>
                  <option value="Annaba">Annaba (23)</option>
                  <option value="Batna">Batna (05)</option>
                  <option value="Ghardaïa">Ghardaïa (47)</option>
                  <option value="Tlemcen">Tlemcen (13)</option>
                </select>
              </div>
            </div>

            {/* Role specific field */}
            {role === 'organization' ? (
              <div>
                <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                  Secteur d'Activité
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5b6b7c]">
                    <Tag className="h-4 w-4" />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e0ea] bg-[#f8fafb] text-sm text-[#0b1f3a] focus:bg-white focus:outline-none focus:border-[#0d7a6f] focus:ring-2 focus:ring-[#0d7a6f]/20 transition-all appearance-none"
                  >
                    <option value="Humanitarian">Humanitaire & Urgences</option>
                    <option value="Environmental">Environnement & Reboisement</option>
                    <option value="Health">Santé & Secourisme</option>
                    <option value="Education">Éducation & Formation</option>
                    <option value="Technology">Numérique & Innovation</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                  Compétences Clés (séparées par des virgules)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5b6b7c]">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="Secourisme, Permis B, Logistique, Réseaux sociaux..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#d8e0ea] bg-[#f8fafb] text-sm text-[#0b1f3a] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:border-[#0d7a6f] focus:ring-2 focus:ring-[#0d7a6f]/20 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>{t('auth.signup_btn')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer link to Login */}
        <p className="text-center text-sm text-[#5b6b7c]">
          {t('auth.has_account')}{' '}
          <Link
            href="/login"
            className="font-bold text-[#0d7a6f] hover:underline inline-flex items-center gap-1"
          >
            <span>{t('auth.link_login')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}
