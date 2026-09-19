'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Hammer,
  Camera,
  Palette,
  Heart,
  Truck,
  Code,
  Users,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Flame,
  Edit3,
  Search,
  Check,
} from 'lucide-react';
import { api, ExtractedNeedsResponse } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

const ICON_MAP: Record<string, any> = {
  hammer: Hammer,
  camera: Camera,
  palette: Palette,
  heart: Heart,
  truck: Truck,
  code: Code,
  users: Users,
  sparkles: Sparkles,
};

export default function CreateMissionPage() {
  const router = useRouter();
  const { t, isRTL, locale } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedNeedsResponse | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registered Skills State
  const [registeredSkills, setRegisteredSkills] = useState<any[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Route guard: only authenticated users can access the creation studio
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch real registered volunteer skills from platform
  useEffect(() => {
    api.getRegisteredSkills()
      .then((data) => {
        if (Array.isArray(data)) {
          setRegisteredSkills(data);
        }
      })
      .catch((err) => console.warn('Could not load registered volunteer skills:', err))
      .finally(() => setLoadingSkills(false));
  }, []);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 border-3 border-[#0d7a6f] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-[#5b6b7c]">Redirection vers la connexion...</p>
      </div>
    );
  }

  const samplePrompts = [
    { title: t('create_mission.sample1_title'), text: t('create_mission.sample1_text') },
    { title: t('create_mission.sample2_title'), text: t('create_mission.sample2_text') },
    { title: t('create_mission.sample3_title'), text: t('create_mission.sample3_text') },
  ];

  const handleExtract = async (textToUse?: string) => {
    const text = textToUse || prompt;
    if (!text || text.trim().length < 5) {
      setError(t('create_mission.error_empty'));
      return;
    }

    setError(null);
    setExtracting(true);
    try {
      const data = await api.extractNeeds(text);
      setExtractedData(data);
    } catch (err: any) {
      setError(err?.message || t('create_mission.error_extract'));
    } finally {
      setExtracting(false);
    }
  };

  const handleQuantityChange = (index: number, delta: number) => {
    if (!extractedData) return;
    const updated = [...extractedData.needs];
    updated[index].quantityNeeded = Math.max(1, updated[index].quantityNeeded + delta);
    setExtractedData({ ...extractedData, needs: updated });
  };

  const handleRemoveNeed = (index: number) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      needs: extractedData.needs.filter((_, i) => i !== index),
    });
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const handleInjectInPrompt = () => {
    if (selectedSkills.length === 0) return;
    const names = selectedSkills.map((id) => {
      const s = registeredSkills.find((item) => item.id === id);
      return s ? (locale === 'ar' ? s.nameAr : locale === 'fr' ? s.nameFr : s.nameEn) : id;
    });
    const addition = ` Besoin de bénévoles en : ${names.join(', ')}.`;
    setPrompt((prev) => (prev ? prev + addition : addition.trim()));
  };

  const handleAddSelectedToNeeds = () => {
    if (selectedSkills.length === 0) return;
    const newNeeds = selectedSkills.map((id) => {
      const s = registeredSkills.find((item) => item.id === id);
      const roleTitle = s ? (locale === 'ar' ? s.nameAr : s.nameFr) : id;
      const icon = s?.icon || 'sparkles';
      return {
        roleName: roleTitle,
        skillTag: s?.nameFr || id,
        icon,
        quantityNeeded: 2,
      };
    });

    if (!extractedData) {
      setExtractedData({
        title: 'Nouvelle Mission de Solidarité',
        category: 'Humanitarian',
        urgency: 'medium',
        venue: 'Alger',
        suggestedHoursPerPerson: 4,
        needs: newNeeds,
      });
    } else {
      setExtractedData({
        ...extractedData,
        needs: [...extractedData.needs, ...newNeeds],
      });
    }
  };

  const filteredSkills = registeredSkills.filter((s) => {
    const q = skillSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.nameFr && s.nameFr.toLowerCase().includes(q)) ||
      (s.nameEn && s.nameEn.toLowerCase().includes(q)) ||
      (s.nameAr && s.nameAr.includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q)) ||
      s.id.toLowerCase().includes(q)
    );
  });

  const handlePublish = async () => {
    if (!extractedData) return;
    setPublishing(true);
    setError(null);

    try {
      const mission = await api.createMission({
        title: extractedData.title,
        category: extractedData.category,
        venueName: extractedData.venue,
        urgency: extractedData.urgency,
        estimatedHoursPerVolunteer: extractedData.suggestedHoursPerPerson,
        rawPrompt: prompt,
        needs: extractedData.needs,
      });
      router.push(`/missions/${mission._id}`);
    } catch (err: any) {
      setError(err.message || t('create_mission.error_publish'));
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className={`text-3xl sm:text-4xl font-semibold text-[#0b1f3a] leading-tight ${locale === 'ar' ? 'font-cairo' : 'font-display'}`}>
          {t('create_mission.title')}
        </h1>
        <p className="mt-2 text-sm text-[#5b6b7c]">{t('create_mission.subtitle')}</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Prompt Box */}
      <div className="surface-panel rounded-xl p-6 sm:p-8 mb-8">
        <label className="block text-sm font-semibold text-[#0b1f3a] mb-2">
          {t('create_mission.prompt_label')}
        </label>
        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('create_mission.placeholder')}
          className="w-full rounded-xl border border-[#d8e0ea] bg-white p-4 text-sm text-[#0b1f3a] placeholder:text-[#8fa0b3] focus:border-[#0d7a6f] focus:outline-none focus:ring-2 focus:ring-[#0d7a6f]/15"
        />

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#5b6b7c]">{t('create_mission.sample_label')}</span>
          {samplePrompts.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPrompt(chip.text);
                handleExtract(chip.text);
              }}
              className="rounded-lg border border-[#d8e0ea] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#0b1f3a] hover:border-[#0d7a6f] hover:text-[#0d7a6f] transition-colors"
            >
              {chip.title}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => handleExtract()}
            disabled={extracting}
            className="btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${extracting ? 'animate-spin' : ''}`} />
            {extracting ? t('create_mission.extracting') : t('create_mission.extract_btn')}
          </button>
        </div>
      </div>

      {/* Dynamic Registered Volunteer Skills Explorer Panel */}
      <div className="surface-panel rounded-xl p-6 sm:p-8 mb-8 border border-[#d8e0ea] bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#0b1f3a] flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6f4f2] text-[#0d7a6f] text-xs">
                🎯
              </span>
              {t('create_mission.registered_skills_title')}
            </h3>
            <p className="text-xs text-[#5b6b7c] mt-0.5">
              {t('create_mission.registered_skills_subtitle')}
            </p>
          </div>

          {/* Live Search Input for Skills */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8fa0b3]" />
            <input
              type="text"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder={t('create_mission.search_skills_placeholder')}
              className="w-full rounded-lg border border-[#d8e0ea] bg-[#f8fafc] pl-8 pr-3 py-1.5 text-xs text-[#0b1f3a] placeholder:text-[#8fa0b3] focus:border-[#0d7a6f] focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Skills Chips Grid */}
        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
          {filteredSkills.map((skill) => {
            const isSelected = selectedSkills.includes(skill.id);
            const IconComp = ICON_MAP[skill.icon] || Sparkles;
            const label = locale === 'ar' ? skill.nameAr : locale === 'fr' ? skill.nameFr : skill.nameEn;

            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-[#0d7a6f] text-white border-[#0d7a6f] shadow-sm'
                    : 'bg-[#f8fafc] text-[#0b1f3a] border-[#d8e0ea] hover:border-[#0d7a6f] hover:bg-[#e6f4f2]/40'
                }`}
              >
                <IconComp className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-[#0d7a6f]'}`} />
                <span>{label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : skill.volunteerCount > 0
                      ? 'bg-[#e6f4f2] text-[#0d7a6f]'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {skill.volunteerCount} {t('create_mission.volunteers_count')}
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 ml-0.5 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Action Buttons when skills are selected */}
        {selectedSkills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#d8e0ea] flex flex-wrap items-center justify-between gap-2 animate-fade-up">
            <span className="text-xs font-medium text-[#0d7a6f]">
              ✓ {selectedSkills.length} compétence(s) sélectionnée(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInjectInPrompt}
                className="rounded-lg border border-[#d8e0ea] bg-white px-3 py-1.5 text-xs font-semibold text-[#0b1f3a] hover:border-[#0d7a6f] hover:text-[#0d7a6f] transition-colors"
              >
                {t('create_mission.inject_in_prompt')}
              </button>
              <button
                type="button"
                onClick={handleAddSelectedToNeeds}
                className="btn-primary rounded-lg px-3.5 py-1.5 text-xs font-semibold"
              >
                {t('create_mission.add_selected_to_needs')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedSkills([])}
                className="text-xs text-[#8fa0b3] hover:text-red-600 px-2 py-1"
              >
                {t('create_mission.deselect_all')}
              </button>
            </div>
          </div>
        )}
      </div>

      {extractedData && (
        <div className="surface-panel rounded-xl p-6 sm:p-8 animate-fade-up">
          <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-[#d8e0ea] pb-5 mb-6 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[#0d7a6f] mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {t('create_mission.extract_success')}
                </span>
              </div>
              <div className="group relative">
                <input
                  type="text"
                  value={extractedData.title}
                  onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                  maxLength={120}
                  className="w-full text-xl sm:text-2xl font-bold text-[#0b1f3a] bg-transparent hover:bg-slate-50 focus:bg-white border-b-2 border-dashed border-slate-300 focus:border-[#0d7a6f] focus:border-solid transition-all rounded-md px-1.5 py-1 outline-none"
                  placeholder="Titre de la mission..."
                  aria-label="Titre de la mission"
                />
                <p className="flex items-center gap-1 mt-1 text-[11px] text-[#5b6b7c]">
                  <Edit3 className="h-3 w-3 text-[#0d7a6f]" />
                  <span>{t('create_mission.editable_title_hint')}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5b6b7c]">
              <span className="inline-flex items-center gap-1 rounded-md border border-[#d8e0ea] bg-white px-2.5 py-1">
                <MapPin className="h-3.5 w-3.5 text-[#0d7a6f]" />
                {extractedData.venue}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[#d8e0ea] bg-white px-2.5 py-1">
                <Clock className="h-3.5 w-3.5" />
                {extractedData.suggestedHoursPerPerson} {t('create_mission.hours_tag')}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#f8f1e4] text-[#8a5a10] px-2.5 py-1 font-semibold">
                <Flame className="h-3.5 w-3.5" />
                {t('create_mission.urgency_tag')}: {extractedData.urgency}
              </span>
            </div>
          </div>

          <div className="mb-4 text-sm font-semibold text-[#0b1f3a]">
            {t('create_mission.roles_title')}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            {extractedData.needs.map((need, index) => {
              const IconComp = ICON_MAP[need.icon] || Sparkles;

              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#d8e0ea] bg-[#f8fafc] p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e6f4f2] text-[#0d7a6f]">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNeed(index)}
                        className="text-[#8fa0b3] hover:text-red-600 p-1"
                        title="Delete Role"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <h4 className="text-sm font-semibold text-[#0b1f3a] mb-1.5">{need.roleName}</h4>
                    
                    {/* Selectable Skill Dropdown Linked to Platform Pool */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[11px] font-semibold text-[#5b6b7c]">
                        {t('create_mission.skill_label')}:
                      </span>
                      <select
                        value={need.skillTag}
                        onChange={(e) => {
                          const updated = [...extractedData.needs];
                          updated[index].skillTag = e.target.value;
                          const found = registeredSkills.find((s) => s.nameFr === e.target.value || s.id === e.target.value);
                          if (found?.icon) {
                            updated[index].icon = found.icon;
                          }
                          setExtractedData({ ...extractedData, needs: updated });
                        }}
                        className="rounded-md bg-white border border-[#d8e0ea] px-2 py-0.5 text-[11px] font-semibold text-[#0b1f3a] focus:outline-none focus:border-[#0d7a6f]"
                      >
                        {registeredSkills.map((s) => (
                          <option key={s.id} value={s.nameFr}>
                            {locale === 'ar' ? s.nameAr : s.nameFr} ({s.volunteerCount} {t('create_mission.volunteers_count')})
                          </option>
                        ))}
                        {!registeredSkills.some((s) => s.nameFr === need.skillTag) && (
                          <option value={need.skillTag}>{need.skillTag}</option>
                        )}
                      </select>
                    </div>

                    {need.equipmentRequired && (
                      <p className="text-[11px] text-[#5b6b7c] mb-2">
                        {t('create_mission.equipment_label')}: {need.equipmentRequired}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#d8e0ea] flex items-center justify-between">
                    <span className="text-xs text-[#5b6b7c]">{t('create_mission.quantity_label')}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(index, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[#d8e0ea] bg-white text-[#0b1f3a] hover:border-[#0d7a6f]"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-[#0d7a6f]">
                        {need.quantityNeeded}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(index, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[#d8e0ea] bg-white text-[#0b1f3a] hover:border-[#0d7a6f]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#d8e0ea] pt-6">
            <p className="text-xs text-[#5b6b7c]">{t('create_mission.publish_notice')}</p>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="btn-primary flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {publishing ? t('create_mission.publishing') : t('create_mission.publish_btn')}
              <ArrowIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
