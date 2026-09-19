'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

export default function NeighborhoodHubPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'bab-ezzouar';
  const { t, locale, dir } = useTranslation();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNeighborhood() {
      try {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071322] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">
            {locale === 'ar' ? 'جارٍ تحميل بيانات الحومة...' : 'Chargement du quartier...'}
          </p>
        </div>
      </div>
    );
  }

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
    titleFr: `Défi ${meta.nameFr} Plus Propre et Plus Verte`,
    progressPercentage: 82,
    remainingPercentage: 18,
    currentQuantity: 8,
    targetQuantity: 10,
  };

  const squads = data?.squads || [];
  const upcomingMissions = data?.upcomingMissions || [];

  return (
    <div className="min-h-screen bg-[#071322] text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-white" dir={dir}>
      <div className="max-w-7xl mx-auto">
        {/* Neighborhood Breadcrumb & Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>{meta.wilaya}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-serif">
                {locale === 'ar' ? `📍 حومة ${meta.nameAr}` : `📍 Quartier ${meta.nameFr}`}
              </h1>
              <p className="text-slate-400 mt-2 text-base sm:text-lg max-w-2xl">
                {locale === 'ar'
                  ? 'حومتنا لا تنتظر... سواعد أبنائها وبناتها تتكاتف وتتنافس مع ذاتها لتصنع حياً أنظف، أكثر خضرة، وأكثر تضامناً.'
                  : 'Solidarité locale et fierté citoyenne : les bénévoles s’unissent pour faire de leur quartier un exemple.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/wall-of-impact"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-700 transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-yellow-400" />
                <span>{locale === 'ar' ? 'حائط الأثر الوطني' : 'Mur d’Impact'}</span>
              </Link>
              <Link
                href="/missions"
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>{locale === 'ar' ? 'استكشف المهام الميدانية' : 'Missions du Quartier'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Local Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{locale === 'ar' ? 'مهام منجزة' : 'Missions'}</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-3xl font-black text-white">{metrics.completedMissionsCount}</span>
            <span className="text-[11px] text-slate-500 mt-1">{locale === 'ar' ? 'هذا الشهر' : 'Ce mois-ci'}</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{locale === 'ar' ? 'أشجار مغروسة' : 'Arbres'}</span>
              <TreePine className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-3xl font-black text-emerald-400">{metrics.treesPlanted}</span>
            <span className="text-[11px] text-slate-500 mt-1">{locale === 'ar' ? 'في الأحياء والمساحات' : 'Plantations'}</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{locale === 'ar' ? 'عائلات مدعومة' : 'Familles'}</span>
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-3xl font-black text-rose-400">{metrics.familiesHelped}</span>
            <span className="text-[11px] text-slate-500 mt-1">{locale === 'ar' ? 'طرود ومساعدات' : 'Colis d’aide'}</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{locale === 'ar' ? 'سواعد في الميدان' : 'Bénévoles'}</span>
              <Users className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-3xl font-black text-white">{metrics.activeVolunteersCount}</span>
            <span className="text-[11px] text-slate-500 mt-1">{locale === 'ar' ? 'متطوع مسجل' : 'Actifs'}</span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{locale === 'ar' ? 'ساعات التطوع' : 'Heures'}</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-3xl font-black text-amber-400">{metrics.totalImpactHours}h</span>
            <span className="text-[11px] text-slate-500 mt-1">{locale === 'ar' ? 'وقت مستثمر للخير' : 'Temps donné'}</span>
          </div>
        </div>

        {/* Current Active Neighborhood Challenge ("تحدي الحومة") */}
        <div className="mb-14 rounded-3xl bg-gradient-to-br from-teal-950/70 via-slate-900 to-slate-900 border-2 border-teal-500/40 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold mb-3">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>{locale === 'ar' ? 'التحدي الجماعي الحالي للحومة' : 'Défi Collectif du Quartier'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {locale === 'ar' ? challenge.titleAr : challenge.titleFr || challenge.titleAr}
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-2">
                {locale === 'ar'
                  ? 'كل مهمة يشارك فيها متطوع تزيد من نسبة الامتلاء. أصدقاؤك في الميدان يساهمون الآن لإكمال الهدف قبل نهاية الشهر.'
                  : 'Chaque participation compte. Complétons l’objectif solidaire avant la fin du mois !'}
              </p>
            </div>

            <div className="text-left lg:text-right shrink-0">
              <span className="text-5xl font-black text-teal-400 tracking-tight">
                {challenge.progressPercentage}%
              </span>
              <span className="block text-xs font-bold text-slate-400 uppercase mt-1">
                {locale === 'ar'
                  ? `متبقي ${100 - challenge.progressPercentage}% لإتمام الهدف 🎉`
                  : `${100 - challenge.progressPercentage}% restant pour valider le défi 🎉`}
              </span>
            </div>
          </div>

          {/* Large Progress Bar */}
          <div className="w-full bg-slate-800/80 rounded-2xl h-6 p-1 border border-slate-700/60 mb-6">
            <div
              className="bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 h-full rounded-xl transition-all duration-1000 shadow-lg shadow-teal-500/50"
              style={{ width: `${challenge.progressPercentage}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-4 h-4 text-teal-400" />
              <span>
                {locale === 'ar'
                  ? 'أصدقاؤك في فرق "Green Squad" و "شباب الخير" في الميدان الآن'
                  : 'Des membres des Squads locales sont mobilisés sur le terrain'}
              </span>
            </div>

            <Link
              href="/missions"
              className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
            >
              <span>{locale === 'ar' ? 'انضم للمهمة القادمة في حومتك' : 'Participer à la mission'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>

        {/* Squads in the Neighborhood */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="w-6 h-6 text-teal-400" />
                <span>{locale === 'ar' ? 'مجموعات الحي (Squads)' : 'Les Squads du Quartier'}</span>
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {locale === 'ar'
                  ? 'أصدقاء يتطوعون معاً تحت راية واحدة'
                  : 'Groupes d’amis qui s’engagent ensemble'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">🟢</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  12 {locale === 'ar' ? 'عضواً' : 'membres'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Green Squad</h3>
              <p className="text-xs text-slate-400 mb-4">
                {locale === 'ar'
                  ? 'فريق متخصص في التشجير وتهيئة المساحات الخضراء في الحومة.'
                  : 'Spécialisé dans le reboisement et l’aménagement des parcs.'}
              </p>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                <span>🏆 14 {locale === 'ar' ? 'مهمة' : 'missions'}</span>
                <span>🌳 83 {locale === 'ar' ? 'شجرة' : 'arbres'}</span>
                <span>⏱️ 126h</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">🔵</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                  24 {locale === 'ar' ? 'عضواً' : 'membres'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">شباب الخير</h3>
              <p className="text-xs text-slate-400 mb-4">
                {locale === 'ar'
                  ? 'مجموعة شبابية متخصصة في الدعم الإنساني والطرود الشتوية.'
                  : 'Groupe d’action solidaire et d’aide aux familles du quartier.'}
              </p>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                <span>🏆 22 {locale === 'ar' ? 'مهمة' : 'missions'}</span>
                <span>❤️ 91 {locale === 'ar' ? 'عائلة' : 'familles'}</span>
                <span>⏱️ 210h</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">🟠</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                  18 {locale === 'ar' ? 'عضواً' : 'membres'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Team {meta.nameFr}</h3>
              <p className="text-xs text-slate-400 mb-4">
                {locale === 'ar'
                  ? 'فريق الاستجابة اللوجستية السريعة والأنشطة الشبابية الميدانية.'
                  : 'Équipe d’intervention rapide et logistique de proximité.'}
              </p>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                <span>🏆 18 {locale === 'ar' ? 'مهمة' : 'missions'}</span>
                <span>🤝 55 {locale === 'ar' ? 'مستفيداً' : 'bénéficiaires'}</span>
                <span>⏱️ 174h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Other Neighborhood Portals Selector */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center">
          <h3 className="text-lg font-bold text-white mb-3">
            {locale === 'ar' ? 'استكشف صفحات أحياء أخرى في الجزائر' : 'Découvrez d’autres communes'}
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { slug: 'bab-ezzouar', name: 'باب الزوار (Bab Ezzouar)' },
              { slug: 'belouizdad', name: 'بلوزداد (Belouizdad)' },
              { slug: 'algiers-centre', name: 'الجزائر الوسطى (Alger Centre)' },
              { slug: 'oran-centre', name: 'وهران المركز (Oran)' },
              { slug: 'constantine', name: 'قسنطينة (Constantine)' },
            ].map((n) => (
              <Link
                key={n.slug}
                href={`/neighborhood/${n.slug}`}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  slug === n.slug
                    ? 'bg-teal-500 text-slate-950 border-teal-500 font-bold'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                📍 {n.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
