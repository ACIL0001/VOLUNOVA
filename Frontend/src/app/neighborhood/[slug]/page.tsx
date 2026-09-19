'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin,
  Sparkles,
  TreePine,
  Heart,
  Users,
  Clock,
  CheckCircle2,
  Flame,
  ArrowRight,
  ShieldCheck,
  Compass,
  Award,
  Sparkle,
  Share2,
  Target,
  Sparkles as SparklesIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

const NEIGHBORHOOD_CHOICES = [
  { slug: 'bab-ezzouar', nameAr: 'باب الزوار', nameFr: 'Bab Ezzouar', icon: '📍' },
  { slug: 'belouizdad', nameAr: 'بلوزداد (Belcourt)', nameFr: 'Belouizdad', icon: '⚽' },
  { slug: 'kouba', nameAr: 'القبة', nameFr: 'Kouba', icon: '🏛️' },
  { slug: 'casbah', nameAr: 'القصبة العتيقة', nameFr: 'La Casbah', icon: '🕌' },
  { slug: 'hydra', nameAr: 'حيدرة', nameFr: 'Hydra', icon: '🌲' },
  { slug: 'oran-centre', nameAr: 'وهران (عقيد لطفي)', nameFr: 'Oran - Akid Lotfi', icon: '🌊' },
  { slug: 'constantine', nameAr: 'قسنطينة (الجسور)', nameFr: 'Constantine', icon: '🌉' },
];

export default function NeighborhoodHubPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || 'bab-ezzouar';
  const { t, locale, dir } = useTranslation();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    async function loadNeighborhood() {
      try {
        setLoading(true);
        const res = await api.getNeighborhood(slug);
        setData(res?.data || res);
      } catch (err) {
        console.error('Failed to load neighborhood:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNeighborhood();
  }, [slug]);

  const meta = data?.meta || {
    nameAr: slug.replace(/-/g, ' ').toUpperCase(),
    nameFr: slug.replace(/-/g, ' '),
    wilaya: 'الجزائر (Alger)',
  };

  const metrics = data?.metrics || {
    completedMissionsCount: 8,
    totalImpactHours: 1240,
    treesPlanted: 120,
    familiesHelped: 42,
    activeVolunteersCount: 183,
  };

  const challenge = data?.currentChallenge || {
    titleAr: `تحدي ${meta.nameAr} أكثر نظافة واخضراراً`,
    titleFr: `Make ${meta.nameFr} Greener`,
    progressPercentage: 82,
    remainingPercentage: 18,
    currentQuantity: 8,
    targetQuantity: 10,
  };

  const squads = data?.squads || [];
  const upcomingMissions = data?.upcomingMissions || [];

  // Generate ASCII progress representation: ████████░░ 82%
  const totalBlocks = 10;
  const filledBlocks = Math.min(10, Math.max(0, Math.round((challenge.progressPercentage || 82) / 10)));
  const emptyBlocks = 10 - filledBlocks;
  const asciiProgress = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

  const handleShare = () => {
    const text = `🇩🇿 تحدي حومة ${meta.nameAr} في فولونوفا!\n🎯 الهدف: ${challenge.titleAr}\nنسبة الإنجاز: ${challenge.progressPercentage}% (${asciiProgress})\nانضم معنا: https://volunova.dz/neighborhood/${slug}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#071322] text-white py-10 px-4 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-white" dir={dir}>
      <div className="max-w-6xl mx-auto">
        
        {/* Neighborhood Selector Bar */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider pl-1 pr-2">
              {locale === 'ar' ? 'اختر الحومة :' : 'Changer de quartier :'}
            </span>
            {NEIGHBORHOOD_CHOICES.map((choice) => {
              const isCurrent = choice.slug === slug;
              return (
                <button
                  key={choice.slug}
                  onClick={() => router.push(`/neighborhood/${choice.slug}`)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30 ring-2 ring-teal-400'
                      : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span>{choice.icon}</span>
                  <span>{locale === 'ar' ? choice.nameAr : choice.nameFr}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>{meta.wilaya}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-3">
                <span>📍</span>
                <span>{locale === 'ar' ? meta.nameAr : meta.nameFr}</span>
              </h1>
              <p className="text-teal-400/90 font-medium text-sm sm:text-base mt-2 flex items-center gap-2">
                <span>⚡</span>
                <span>
                  {locale === 'ar'
                    ? 'حومتنا تتحدى ذاتها لتصبح أفضل وأجمل بسواعد أبنائها وبناتها.'
                    : 'Notre quartier se mobilise pour devenir chaque jour plus solidaire et plus vert.'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
              >
                <Share2 className="w-4 h-4 text-teal-400" />
                <span>{copiedShare ? (locale === 'ar' ? 'تم نسخ الرابط!' : 'Lien copié !') : (locale === 'ar' ? 'مشاركة الحومة' : 'Partager')}</span>
              </button>
              <Link
                href="/wall-of-impact"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-yellow-400" />
                <span>{locale === 'ar' ? 'أبطال الأسبوع 🇩🇿' : 'Héros de la semaine'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 1. Monthly Telemetry Showcase (This Month) */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-300 flex items-center gap-2">
              <CalendarIcon />
              <span>{locale === 'ar' ? 'إنجازات هذا الشهر في الحومة :' : 'Ce mois-ci dans le quartier :'}</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {locale === 'ar' ? 'تحديث لحظي من الميدان' : 'Temps réel'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* 🧹 Clean-up missions */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-teal-500/30 transition-all group">
              <div className="flex items-center justify-between mb-3 text-2xl">
                <span>🧹</span>
                <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full uppercase">
                  {locale === 'ar' ? 'نظافة' : 'Clean-up'}
                </span>
              </div>
              <div className="text-3xl font-black text-white group-hover:text-teal-400 transition-colors">
                {metrics.completedMissionsCount}
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-1">
                {locale === 'ar' ? 'مهام تنظيف وتجميل' : 'Missions de nettoyage'}
              </div>
            </div>

            {/* 🌳 Trees planted */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center justify-between mb-3 text-2xl">
                <span>🌳</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                  {locale === 'ar' ? 'تشجير' : 'Éco'}
                </span>
              </div>
              <div className="text-3xl font-black text-emerald-400">
                {metrics.treesPlanted}
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-1">
                {locale === 'ar' ? 'أشجار مغروسة' : 'Arbres plantés'}
              </div>
            </div>

            {/* ❤️ Families helped */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-rose-500/30 transition-all group">
              <div className="flex items-center justify-between mb-3 text-2xl">
                <span>❤️</span>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase">
                  {locale === 'ar' ? 'تضامن' : 'Solidarité'}
                </span>
              </div>
              <div className="text-3xl font-black text-rose-400">
                {metrics.familiesHelped}
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-1">
                {locale === 'ar' ? 'عائلات مدعومة' : 'Familles aidées'}
              </div>
            </div>

            {/* 👥 Active volunteers */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-teal-500/30 transition-all group">
              <div className="flex items-center justify-between mb-3 text-2xl">
                <span>👥</span>
                <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full uppercase">
                  {locale === 'ar' ? 'سواعد' : 'Actifs'}
                </span>
              </div>
              <div className="text-3xl font-black text-white">
                {metrics.activeVolunteersCount}
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-1">
                {locale === 'ar' ? 'متطوعين في الميدان' : 'Bénévoles actifs'}
              </div>
            </div>

            {/* ⏱️ Hours */}
            <div className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/30 transition-all group">
              <div className="flex items-center justify-between mb-3 text-2xl">
                <span>⏱️</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                  {locale === 'ar' ? 'وقت' : 'Temps'}
                </span>
              </div>
              <div className="text-3xl font-black text-amber-400">
                {metrics.totalImpactHours.toLocaleString()}h
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-1">
                {locale === 'ar' ? 'ساعة عطاء ميداني' : 'Heures d’action'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. THE KILLER FEATURE: 🎯 Current Challenge ("تحدي الحومة") */}
        <div className="mb-12 rounded-3xl bg-linear-to-br from-[#0c2238] via-[#091829] to-[#071322] border-2 border-teal-500/40 p-6 sm:p-9 shadow-2xl relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider mb-2.5">
                <Target className="w-3.5 h-3.5 text-teal-400" />
                <span>{locale === 'ar' ? '🎯 التحدي الحالي للحومة' : '🎯 Défi Actuel du Quartier'}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                "{locale === 'ar' ? challenge.titleAr : challenge.titleFr || challenge.titleAr}"
              </h2>

              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">
                {locale === 'ar'
                  ? 'كل مهمة يشارك فيها متطوع تزيد من نسبة الامتلاء لتتويج حومتنا كأنظف وأخضر حي هذا الشهر.'
                  : 'Chaque heure donnée contribue à compléter ce défi solidaire collectif.'}
              </p>
            </div>

            {/* Percentage Badge & ASCII Progress */}
            <div className="text-left lg:text-right shrink-0 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-3xl sm:text-4xl font-black text-teal-400 font-mono">
                {challenge.progressPercentage}%
              </div>
              <div className="text-xs font-mono text-teal-300/80 mt-1 tracking-widest hidden sm:block">
                {asciiProgress}
              </div>
              <div className="text-xs font-bold text-amber-400 mt-1">
                {locale === 'ar'
                  ? `متبقي ${100 - challenge.progressPercentage}% لإتمام الهدف`
                  : `${100 - challenge.progressPercentage}% restant pour valider`}
              </div>
            </div>
          </div>

          {/* Large Visual Progress Bar */}
          <div className="w-full bg-slate-950/80 rounded-2xl h-6 p-1 border border-slate-800 mb-6">
            <div
              className="bg-linear-to-r from-teal-500 via-teal-400 to-emerald-400 h-full rounded-xl transition-all duration-1000 shadow-lg shadow-teal-500/40 relative"
              style={{ width: `${challenge.progressPercentage}%` }}
            >
              <span className="absolute right-2 top-0 bottom-0 flex items-center text-[10px] font-black text-slate-950">
                {challenge.progressPercentage}%
              </span>
            </div>
          </div>

          {/* Social Proof & Join Mission Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-800/90">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 overflow-hidden rtl:space-x-reverse">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#071322] bg-teal-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  A
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#071322] bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  F
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#071322] bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  Y
                </div>
              </div>
              <span className="text-sm text-slate-200 font-medium">
                {locale === 'ar'
                  ? '👥 أصدقاؤك ورفقاء الحومة يشاركون الآن.'
                  : '👥 Vos amis et voisins participent déjà.'}
              </span>
            </div>

            <Link
              href="/missions/browse"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>{locale === 'ar' ? 'انضم للمهمة القادمة ←' : 'Rejoindre la prochaine mission →'}</span>
            </Link>
          </div>
        </div>

        {/* 3. Neighborhood Squads & Upcoming Missions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Local Squads ("فرق الحومة") */}
          <div className="lg:col-span-1 rounded-2xl bg-slate-900/90 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">
                  {locale === 'ar' ? 'فرق الحومة (Squads)' : 'Squads du quartier'}
                </h3>
              </div>
              <span className="text-xs text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full">
                {squads.length || 2}
              </span>
            </div>

            <div className="space-y-3">
              {squads.length > 0 ? (
                squads.map((sq: any, i: number) => (
                  <div key={sq._id || i} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sq.avatar === 'tree' ? '🌱' : '👥'}</span>
                      <div>
                        <p className="text-sm font-bold text-white">{sq.name}</p>
                        <p className="text-xs text-slate-400">{sq.members?.length || 1} {locale === 'ar' ? 'أعضاء' : 'membres'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-teal-400">{sq.totalImpactHours || 0}h</span>
                      <span className="block text-[10px] text-slate-500">{locale === 'ar' ? 'أثر ميداني' : 'impact'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🌱</span>
                      <div>
                        <p className="text-sm font-bold text-white">Green Squad {meta.nameFr}</p>
                        <p className="text-xs text-slate-400">12 {locale === 'ar' ? 'عضو' : 'membres'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">142h</span>
                      <span className="block text-[10px] text-slate-500">{locale === 'ar' ? 'أثر جماعي' : 'collectif'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🤝</span>
                      <div>
                        <p className="text-sm font-bold text-white">شباب الخير {meta.nameAr}</p>
                        <p className="text-xs text-slate-400">8 {locale === 'ar' ? 'أعضاء' : 'membres'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-teal-400">96h</span>
                      <span className="block text-[10px] text-slate-500">{locale === 'ar' ? 'أثر جماعي' : 'collectif'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              href="/missions/browse"
              className="mt-5 w-full py-2.5 rounded-xl border border-slate-700 hover:border-teal-500 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>{locale === 'ar' ? 'إنشاء أو الانضمام لفريق +' : 'Rejoindre une squad +'}</span>
            </Link>
          </div>

          {/* Upcoming missions in this neighborhood */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">
                  {locale === 'ar' ? `مهام قادمة في ${meta.nameAr}` : `Missions à ${meta.nameFr}`}
                </h3>
              </div>
              <Link href="/missions/browse" className="text-xs text-teal-400 hover:underline font-bold">
                {locale === 'ar' ? 'عرض الكل ←' : 'Tout voir →'}
              </Link>
            </div>

            <div className="space-y-3.5">
              {upcomingMissions.length > 0 ? (
                upcomingMissions.map((m: any) => (
                  <div key={m._id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                          {m.category || 'ميداني'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {m.venueName || meta.nameFr}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{m.title}</h4>
                    </div>

                    <Link
                      href={`/missions/${m._id}`}
                      className="px-4 py-2 rounded-lg bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950 text-xs font-bold transition-all shrink-0 text-center"
                    >
                      {locale === 'ar' ? 'غرفة العمليات ←' : 'Salle d’opérations →'}
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
                  <Flame className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
                  <p className="text-sm font-bold text-slate-300">
                    {locale === 'ar' ? 'مهام جديدة قيد التحضير في هذا الحي!' : 'Nouvelles missions en cours de validation !'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {locale === 'ar'
                      ? 'الجمعيات المحلية والبلدية بصدد إطلاق المبادرة القادمة. تفقد الدليل العام للمهام المتاحة.'
                      : 'Les associations locales préparent de nouvelles actions. Consultez le catalogue général.'}
                  </p>
                  <Link
                    href="/missions/browse"
                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-lg bg-teal-500 text-slate-950 text-xs font-black shadow-md shadow-teal-500/20 hover:bg-teal-400 transition-all"
                  >
                    <span>{locale === 'ar' ? 'تصفح كل المهام المتاحة' : 'Voir toutes les missions'}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16" x2="16" y1="2" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="8" x2="8" y1="2" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="3" x2="21" y1="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
