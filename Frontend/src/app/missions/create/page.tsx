'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { api, ExtractedNeedsResponse } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

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
  const { t, isRTL } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedNeedsResponse | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Preset inspiration prompts for quick 1-click test during demo
  const samplePrompts = [
    {
      title: t('create_mission.sample1_title'),
      text: t('create_mission.sample1_text'),
    },
    {
      title: t('create_mission.sample2_title'),
      text: t('create_mission.sample2_text'),
    },
    {
      title: t('create_mission.sample3_title'),
      text: t('create_mission.sample3_text'),
    },
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
      setError(t('create_mission.error_extract'));
    } finally {
      setExtracting(false);
    }
  };

  const handleQuantityChange = (index: number, delta: number) => {
    if (!extractedData) return;
    const updated = [...extractedData.needs];
    const newQty = Math.max(1, updated[index].quantityNeeded + delta);
    updated[index].quantityNeeded = newQty;
    setExtractedData({ ...extractedData, needs: updated });
  };

  const handleRemoveNeed = (index: number) => {
    if (!extractedData) return;
    const updated = extractedData.needs.filter((_, i) => i !== index);
    setExtractedData({ ...extractedData, needs: updated });
  };

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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-gradient-white-blue leading-tight">
          {t('create_mission.title')}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {t('create_mission.subtitle')}
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300 backdrop-blur-md">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Stage */}
      <div className="rounded-3xl border border-blue-900/30 bg-gradient-to-br from-[#0c1633]/80 via-[#070e22]/90 to-[#040814]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-8">
        <label className="block text-sm font-bold text-white mb-2.5">
          {t('create_mission.prompt_label')}
        </label>
        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t('create_mission.placeholder')}
          className="w-full rounded-2xl border border-slate-800 bg-[#050a16]/90 p-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
        />

        {/* Preset Chips for 1-click test */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">{t('create_mission.sample_label')}</span>
          {samplePrompts.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPrompt(chip.text);
                handleExtract(chip.text);
              }}
              className="rounded-xl border border-blue-900/40 bg-blue-950/30 px-3.5 py-1.5 text-xs text-sky-200 hover:border-blue-500/60 hover:bg-blue-900/40 hover:text-white transition-all shadow-sm"
            >
              {chip.title}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => handleExtract()}
            disabled={extracting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 border border-blue-400/30"
          >
            <Sparkles className={`h-4 w-4 ${extracting ? 'animate-spin text-sky-200' : 'text-sky-300'}`} />
            <span>{extracting ? t('create_mission.extracting') : t('create_mission.extract_btn')}</span>
          </button>
        </div>
      </div>

      {/* Extracted Roles Stage */}
      {extractedData && (
        <div className="rounded-3xl border border-blue-500/35 bg-gradient-to-br from-[#0c1633]/90 via-[#070e22]/95 to-[#040814]/98 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-blue-900/30 pb-5 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  {t('create_mission.extract_success')}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">{extractedData.title}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                <MapPin className="h-3.5 w-3.5 text-sky-400" /> {extractedData.venue}
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                <Clock className="h-3.5 w-3.5 text-indigo-400" /> {extractedData.suggestedHoursPerPerson} {t('create_mission.hours_tag')}
              </span>
              <span className="flex items-center gap-1 bg-amber-950/40 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg font-semibold">
                <Flame className="h-3.5 w-3.5 text-amber-400" /> {t('create_mission.urgency_tag')}: {extractedData.urgency}
              </span>
            </div>
          </div>

          <div className="mb-4 text-sm font-bold text-slate-200">
            {t('create_mission.roles_title')}
          </div>

          {/* Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {extractedData.needs.map((need, index) => {
              const IconComp = ICON_MAP[need.icon] || Sparkles;

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-blue-900/30 bg-[#070e22]/80 p-5 flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-lg group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/15 text-sky-400 border border-blue-500/25 group-hover:scale-105 transition-transform">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNeed(index)}
                        title="Delete Role"
                        className="text-slate-500 hover:text-red-400 transition-all p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">{need.roleName}</h4>
                    <div className="inline-block rounded-full bg-blue-950/60 border border-blue-500/20 px-3 py-0.5 text-[11px] font-semibold text-sky-300 mb-3">
                      {t('create_mission.skill_label')}: {need.skillTag}
                    </div>

                    {need.equipmentRequired && (
                      <div className="text-[11px] text-slate-400 mb-3 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                        {t('create_mission.equipment_label')}: {need.equipmentRequired}
                      </div>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="pt-3 border-t border-blue-900/30 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">{t('create_mission.quantity_label')}:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(index, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-black text-sky-400">
                        {need.quantityNeeded}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(index, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Launch & Match Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-blue-900/30 pt-6">
            <div className="text-xs text-slate-400">
              {t('create_mission.publish_notice')}
            </div>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 border border-blue-400/40"
            >
              <Sparkles className="h-4 w-4" />
              <span>{publishing ? t('create_mission.publishing') : t('create_mission.publish_btn')}</span>
              <ArrowIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
