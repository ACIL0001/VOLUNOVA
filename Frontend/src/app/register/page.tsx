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
  Wrench,
  Plus,
  X,
} from 'lucide-react';
import { useAuth, postAuthPath } from '@/context/AuthContext';
import { useTranslation } from '@/context/LanguageContext';
import AuthBrand, { AuthCard, AuthPageShell } from '@/components/auth/AuthBrand';

const ORG_SECTOR_OPTIONS = [
  { value: 'Humanitarian', label: 'Humanitaire & Urgences' },
  { value: 'Environmental', label: 'Environnement & Reboisement' },
  { value: 'Health', label: 'Santé & Secourisme' },
  { value: 'Education', label: 'Éducation & Formation' },
  { value: 'Technology', label: 'Numérique & Innovation' },
  { value: 'Culture', label: 'Culture & Arts' },
  { value: 'Sports', label: 'Sport & Jeunesse' },
  { value: 'Social', label: 'Action sociale & Solidarité' },
] as const;

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
  const [categories, setCategories] = useState<string[]>([]);
  const [sectorPick, setSectorPick] = useState('');
  const [customSector, setCustomSector] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      router.push(postAuthPath(user.role));
    }
  }, [user, router]);

  const sectorLabel = (value: string) =>
    ORG_SECTOR_OPTIONS.find((o) => o.value === value)?.label || value;

  const addSector = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const exists = categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setCategories((prev) => [...prev, trimmed]);
    }
  };

  const addFromSelect = () => {
    if (!sectorPick) return;
    addSector(sectorPick);
    setSectorPick('');
  };

  const addCustomSector = () => {
    addSector(customSector);
    setCustomSector('');
  };

  const removeCategory = (value: string) => {
    setCategories((prev) => prev.filter((c) => c !== value));
  };

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
    if (role === 'organization' && categories.length === 0) {
      setError("Sélectionnez au moins un secteur d'activité, ou ajoutez le vôtre.");
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
        ...(role === 'organization'
          ? { category: categories, orgName: name }
          : { skills: skillsArray }),
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

  const knownValues = new Set(ORG_SECTOR_OPTIONS.map((o) => o.value));
  const availableOptions = ORG_SECTOR_OPTIONS.filter((o) => !categories.includes(o.value));

  return (
    <AuthPageShell maxWidth="lg">
      <AuthBrand title={t('auth.register_title')} subtitle={t('auth.register_subtitle')} />

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

          <div className="mb-6">
            <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-2">
              {t('auth.role_label')}
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#f3f5f8]/90 rounded-2xl border border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setRole('organization')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  role === 'organization'
                    ? 'bg-white text-[#0d7a6f] shadow-sm border border-[#d8e0ea]'
                    : 'text-[#5b6b7c] hover:text-[#0b1f3a]'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>{t('auth.role_org')}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('volunteer')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  role === 'volunteer'
                    ? 'bg-white text-[#0d7a6f] shadow-sm border border-[#d8e0ea]'
                    : 'text-[#5b6b7c] hover:text-[#0b1f3a]'
                }`}
              >
                <HeartHandshake className="h-4 w-4" />
                <span>{t('auth.role_vol')}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                {role === 'organization' ? "Nom de l'Organisation / Association" : 'Nom et Prénom'}
              </label>
              <div className="relative group">
                <User className="h-4 w-4 text-[#8fa0b3] group-focus-within:text-[#0d7a6f] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    role === 'organization'
                      ? 'Croissant-Rouge Algérien, Ness El Khir...'
                      : 'Amina Mansouri'
                  }
                  required
                  className="auth-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                {t('auth.email_label')}
              </label>
              <div className="relative group">
                <Mail className="h-4 w-4 text-[#8fa0b3] group-focus-within:text-[#0d7a6f] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@organisation.dz"
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Au moins 6 caractères"
                  minLength={6}
                  required
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

            <div>
              <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                {t('auth.city_label')}
              </label>
              <div className="relative group">
                <MapPin className="h-4 w-4 text-[#8fa0b3] group-focus-within:text-[#0d7a6f] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="auth-input appearance-none pe-8"
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

            {role === 'organization' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                    Secteur d&apos;Activité
                  </label>
                  <p className="text-[11px] text-[#5b6b7c] mb-2">
                    Choisissez un secteur puis cliquez sur Ajouter. Vous pouvez aussi écrire un secteur personnalisé.
                  </p>

                  {/* Add from predefined list */}
                  <div className="flex gap-2 mb-2">
                    <select
                      value={sectorPick}
                      onChange={(e) => setSectorPick(e.target.value)}
                      className="auth-input !ps-3.5 flex-1 appearance-none"
                    >
                      <option value="">— Choisir un secteur —</option>
                      {availableOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addFromSelect}
                      disabled={!sectorPick}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#0d7a6f] bg-white px-3.5 py-2.5 text-xs font-bold text-[#0d7a6f] hover:bg-[#e6f4f2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Ajouter
                    </button>
                  </div>

                  {/* Add custom if not in list */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSector}
                      onChange={(e) => setCustomSector(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomSector();
                        }
                      }}
                      placeholder="Autre secteur (écrire si absent)…"
                      className="auth-input !ps-3.5 flex-1"
                    />
                    <button
                      type="button"
                      onClick={addCustomSector}
                      disabled={!customSector.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#0d7a6f] bg-white px-3.5 py-2.5 text-xs font-bold text-[#0d7a6f] hover:bg-[#e6f4f2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Ajouter
                    </button>
                  </div>
                </div>

                {/* Selected sectors as a list */}
                <div className="rounded-xl border border-[#d8e0ea] bg-[#f8fafc]/90 overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#e8eef4] bg-white/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5b6b7c]">
                      Secteurs ajoutés
                    </span>
                    <span className="text-[11px] font-semibold text-[#0d7a6f]">
                      {categories.length}
                    </span>
                  </div>
                  {categories.length === 0 ? (
                    <p className="px-3.5 py-4 text-xs text-[#8fa0b3] text-center">
                      Aucun secteur pour le moment — ajoutez-en au moins un.
                    </p>
                  ) : (
                    <ul className="divide-y divide-[#e8eef4]">
                      {categories.map((c, index) => (
                        <li
                          key={c}
                          className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/80 transition-colors"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#e6f4f2] text-[11px] font-bold text-[#0d7a6f]">
                            {index + 1}
                          </span>
                          <span className="flex-1 min-w-0 text-sm font-medium text-[#0b1f3a] truncate">
                            {sectorLabel(c)}
                            {!knownValues.has(c as (typeof ORG_SECTOR_OPTIONS)[number]['value']) && (
                              <span className="ms-2 text-[10px] font-semibold uppercase tracking-wide text-[#8fa0b3]">
                                perso
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeCategory(c)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#d8e0ea] text-[#8fa0b3] hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                            aria-label={`Retirer ${sectorLabel(c)}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
                  Compétences Clés (séparées par des virgules)
                </label>
                <div className="relative group">
                  <Wrench className="h-4 w-4 text-[#8fa0b3] group-focus-within:text-[#0d7a6f] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="Secourisme, Permis B, Logistique, Réseaux sociaux..."
                    className="auth-input"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
      </AuthCard>

      <p className="text-center text-sm text-[#5b6b7c] auth-brand-enter-delay-3">
        {t('auth.has_account')}{' '}
        <Link
          href="/login"
          className="font-bold text-[#0d7a6f] hover:underline inline-flex items-center gap-1"
        >
          <span>{t('auth.link_login')}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </p>
    </AuthPageShell>
  );
}
