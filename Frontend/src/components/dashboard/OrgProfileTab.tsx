'use client';

import React, { useState } from 'react';
import {
  Building2,
  Mail,
  MapPin,
  Tag,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  Compass,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

interface OrgProfileTabProps {
  organization: any;
  user: any;
  onUpdated: (updatedOrg: any) => void;
}

export default function OrgProfileTab({ organization, user, onUpdated }: OrgProfileTabProps) {
  const { t, locale } = useTranslation();

  // Exactly the fields from registration: name, email, city, category
  const [name, setName] = useState(organization?.name || user?.name || '');
  const [email] = useState(organization?.email || user?.email || '');
  const [city, setCity] = useState(organization?.city || user?.city || 'Alger');
  const [category, setCategory] = useState(organization?.category || 'Humanitarian');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const verificationStatus = organization?.verificationStatus || 'pending';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.updateProfile({
        orgName: name.trim(),
        category: category.trim(),
        city: city.trim(),
      });

      if (res.organization) {
        onUpdated(res.organization);
      }
      setSuccessMsg('Informations de profil mises à jour avec succès.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible d’enregistrer le profil.');
    } finally {
      setSaving(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    Humanitarian: 'Humanitaire & Urgences',
    Environmental: 'Environnement & Reboisement',
    Health: 'Santé & Secourisme',
    Education: 'Éducation & Formation',
    Technology: 'Numérique & Innovation',
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      {/* Header Banner */}
      <div className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0d7a6f] to-[#0b1f3a] text-white flex items-center justify-center font-display text-2xl font-bold flex-shrink-0 shadow-md">
              {name.charAt(0).toUpperCase() || 'O'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0d7a6f]">
                  Profil Officiel
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    verificationStatus === 'verified'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : verificationStatus === 'rejected'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {verificationStatus === 'verified'
                    ? 'Organisation Certifiée'
                    : verificationStatus === 'rejected'
                      ? 'Rejeté'
                      : 'En attente de vérification'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0b1f3a]">{name || 'Nom de l’organisation'}</h1>
              <p className="text-xs text-[#5b6b7c] mt-0.5 flex items-center gap-2">
                <span>{categoryLabels[category] || category}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-[#0d7a6f]" />
                  {city}
                </span>
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-[#eef2f6]">
            <div className="text-center sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5b6b7c]">Missions créées</span>
              <p className="text-lg font-bold text-[#0b1f3a]">{organization?.totalMissions || 0}</p>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5b6b7c]">Bénévoles mobilisés</span>
              <p className="text-lg font-bold text-[#0d7a6f]">{organization?.totalVolunteersMobilized || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium flex-1">{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-xs font-bold underline">
            Fermer
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium flex-1">{errorMsg}</span>
        </div>
      )}

      {/* Edit Form containing strictly the registration fields */}
      <form onSubmit={handleSave} className="surface-panel rounded-2xl border border-[#d8e0ea] bg-white p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-base font-bold text-[#0b1f3a]">Informations de l'Organisation</h2>
          <p className="text-xs text-[#5b6b7c] mt-0.5">
            Données d'enregistrement officielles associées à votre compte organisation.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Organization Name */}
          <div>
            <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
              Nom de l’Organisation / Association *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-[#8fa0b3]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#d8e0ea] text-sm text-[#0b1f3a] focus:border-[#0d7a6f] focus:outline-none focus:ring-1 focus:ring-[#0d7a6f]"
                placeholder="Ex: Croissant-Rouge Algérien, Ness El Khir..."
              />
            </div>
          </div>

          {/* Email (read-only identifier from registration) */}
          <div>
            <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
              Adresse Email (Compte)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#8fa0b3]" />
              <input
                type="email"
                disabled
                value={email}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#d8e0ea] bg-[#f8fafc] text-sm text-[#5b6b7c] cursor-not-allowed"
              />
            </div>
          </div>

          {/* City / Wilaya */}
          <div>
            <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
              Ville / Wilaya *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-[#8fa0b3]" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#d8e0ea] text-sm text-[#0b1f3a] bg-white focus:border-[#0d7a6f] focus:outline-none focus:ring-1 focus:ring-[#0d7a6f]"
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

          {/* Category / Sector */}
          <div>
            <label className="block text-xs font-bold text-[#0b1f3a] uppercase tracking-wider mb-1.5">
              Secteur d'Activité *
            </label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-3 h-4 w-4 text-[#8fa0b3]" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#d8e0ea] text-sm text-[#0b1f3a] bg-white focus:border-[#0d7a6f] focus:outline-none focus:ring-1 focus:ring-[#0d7a6f]"
              >
                <option value="Humanitarian">Humanitaire & Urgences</option>
                <option value="Environmental">Environnement & Reboisement</option>
                <option value="Health">Santé & Secourisme</option>
                <option value="Education">Éducation & Formation</option>
                <option value="Technology">Numérique & Innovation</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-[#eef2f6]">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
