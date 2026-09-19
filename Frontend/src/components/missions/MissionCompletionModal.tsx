'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Heart,
  Sparkles,
  TreePine,
  Users,
  Send,
  Award,
  Zap,
  Smile,
  ShieldCheck,
  Brain,
  Palette,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

interface VolunteerApplicant {
  _id: string;
  volunteerId: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

interface MissionCompletionModalProps {
  missionId: string;
  missionTitle: string;
  applicants: any[];
  isOpen: boolean;
  onClose: () => void;
  onCompletedSuccess: () => void;
}

const APPRECIATION_OPTIONS = [
  { id: 'thank_you', labelAr: '❤️ شكراً على حضورك', labelFr: 'Merci pour votre présence' },
  { id: 'team_spirit', labelAr: '🤝 روح الفريق', labelFr: 'Esprit d’équipe' },
  { id: 'vital_role', labelAr: '👏 دور محوري', labelFr: 'Rôle essentiel' },
  { id: 'rapid_responder', labelAr: '⚡ أسرع استجابة', labelFr: 'Intervention rapide' },
  { id: 'problem_solver', labelAr: '🧠 عقل الفريق', labelFr: 'Résolveur de problèmes' },
  { id: 'most_reliable', labelAr: '💪 أكثر واحد يعتمد عليه', labelFr: 'Pilier de confiance' },
  { id: 'creative', labelAr: '🎨 المبدع', labelFr: 'Créatif inspirant' },
];

export default function MissionCompletionModal({
  missionId,
  missionTitle,
  applicants,
  isOpen,
  onClose,
  onCompletedSuccess,
}: MissionCompletionModalProps) {
  const { locale, dir } = useTranslation();

  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [treesPlanted, setTreesPlanted] = useState<number>(0);
  const [familiesAssisted, setFamiliesAssisted] = useState<number>(0);
  const [beneficiariesCount, setBeneficiariesCount] = useState<number>(0);

  // Map of volunteerId -> chosen appreciation kind
  const [volunteerAppreciations, setVolunteerAppreciations] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const validApplicants = applicants.filter((a) => a.volunteerId && (a.status === 'accepted' || a.status === 'attended'));

  const handleSelectAppreciation = (volunteerId: string, kind: string) => {
    setVolunteerAppreciations((prev) => ({
      ...prev,
      [volunteerId]: prev[volunteerId] === kind ? '' : kind,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Complete mission with tangible outcome story
      await api.completeMissionWithStory(missionId, {
        headline: headline.trim() || 'مهمة تطوعية ناجحة أحدثت أثراً حقيقياً ❤️',
        summary: summary.trim() || 'شكراً لجميع المتطوعين على جهدهم وعطائهم الميداني المخلص.',
        treesPlanted: Number(treesPlanted) || 0,
        familiesAssisted: Number(familiesAssisted) || 0,
        beneficiariesCount: Number(beneficiariesCount) || 0,
      });

      // 2. Dispatch human thank-yous for selected volunteers
      const appreciationPromises = Object.entries(volunteerAppreciations).map(
        ([vId, kind]) => {
          if (!kind) return Promise.resolve();
          return api.sendAppreciation({
            missionId,
            toUserId: vId,
            kind,
            note: 'شكراً على عطائك الميداني الرائع معنا!',
          }).catch(() => {});
        }
      );

      await Promise.all(appreciationPromises);

      onCompletedSuccess();
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Erreur lors de la validation de la mission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" dir={dir}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-white p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {locale === 'ar' ? 'توثيق الأثر والتقدير الإنساني' : 'Bilan d’Impact & Remerciements'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{missionTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tangible Headline */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {locale === 'ar' ? 'عنوان قصة الأثر الحقيقي (ماذا تحقق بالواقع؟) *' : 'Titre du Bilan d’Impact Concret *'}
            </label>
            <input
              type="text"
              required
              placeholder={locale === 'ar' ? 'مثال: 127 معطفاً شتوياً وُزّع على 127 عائلة في باب الزوار' : 'Ex: 127 manteaux distribués à 127 familles'}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {locale === 'ar'
                ? 'سيصل هذا العنوان كإشعار فوري لجميع المتطوعين الذين شاركوا ليشعروا بقيمة عملهم.'
                : 'Cette phrase sera envoyée en notification push à tous les bénévoles participants.'}
            </p>
          </div>

          {/* Metrics Inputs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                🌳 {locale === 'ar' ? 'أشجار مغروسة' : 'Arbres plantés'}
              </label>
              <input
                type="number"
                min="0"
                value={treesPlanted}
                onChange={(e) => setTreesPlanted(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                ❤️ {locale === 'ar' ? 'عائلات مدعومة' : 'Familles aidées'}
              </label>
              <input
                type="number"
                min="0"
                value={familiesAssisted}
                onChange={(e) => setFamiliesAssisted(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                👥 {locale === 'ar' ? 'مستفيدون إجماليون' : 'Bénéficiaires'}
              </label>
              <input
                type="number"
                min="0"
                value={beneficiariesCount}
                onChange={(e) => setBeneficiariesCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm"
              />
            </div>
          </div>

          {/* Summary Text */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {locale === 'ar' ? 'رسالة الجمعية للمتطوعين' : 'Message de remerciement de l’association'}
            </label>
            <textarea
              rows={2}
              placeholder={locale === 'ar' ? 'بفضل حضوركم يوم السبت حققنا الهدف المنشود...' : 'Grâce à votre présence et votre énergie...'}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* 1-Click Human Gratitude / Appreciations per Volunteer */}
          {validApplicants.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-bold text-teal-400 uppercase tracking-wider mb-3">
                {locale === 'ar' ? '❤️ كلمات شكر وتقدير من القلب للمتطوعين (اختياري)' : 'Remerciements individuels aux bénévoles (optionnel)'}
              </label>
              <p className="text-xs text-slate-400 mb-3">
                {locale === 'ar'
                  ? 'اختر بطاقة التقدير المناسبة لكل متطوع لتظهر على ملفه الشخصي وجواز سفره المدني.'
                  : 'Attribuez un badge de reconnaissance sincère à chaque bénévole.'}
              </p>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {validApplicants.map((app) => {
                  const v = app.volunteerId;
                  const chosen = volunteerAppreciations[v._id];
                  return (
                    <div
                      key={app._id}
                      className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-600/30 text-teal-300 flex items-center justify-center font-bold text-xs">
                          {v.name?.charAt(0) || 'V'}
                        </div>
                        <span className="text-sm font-bold text-white">{v.name}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {APPRECIATION_OPTIONS.map((opt) => {
                          const isSelected = chosen === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectAppreciation(v._id, opt.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                                  : 'bg-slate-700/70 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {locale === 'ar' ? opt.labelAr : opt.labelFr}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              {locale === 'ar' ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {submitting
                  ? (locale === 'ar' ? 'جارٍ التوثيق...' : 'Validation...')
                  : (locale === 'ar' ? 'توثيق المهمة وإرسال التقدير ❤️' : 'Valider et remercier')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
