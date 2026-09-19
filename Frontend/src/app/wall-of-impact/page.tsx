'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Sparkles,
  Share2,
  Heart,
  Users,
  Clock,
  TreePine,
  CheckCircle2,
  MapPin,
  Flame,
  ArrowRight,
  Send,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

export default function WallOfImpactPage() {
  const { t, locale, dir } = useTranslation();
  const [heroes, setHeroes] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [heroesData, challengesData] = await Promise.all([
          api.getWallOfImpact().catch(() => []),
          api.getChallenges().catch(() => []),
        ]);
        setHeroes(heroesData || []);
        setChallenges(challengesData || []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCopyShare = (hero: any) => {
    const text = hero.sharePayload?.text || `🇩🇿 بطل الأسبوع في فولونوفا: ${hero.name}!`;
    navigator.clipboard.writeText(text);
    setCopiedId(hero.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleWhatsAppShare = (hero: any) => {
    const text = encodeURIComponent(
      hero.sharePayload?.text || `🇩🇿 بطل الأسبوع في فولونوفا: ${hero.name}!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#071322] text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-white" dir={dir}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-4 h-4" />
            <span>{locale === 'ar' ? '🇩🇿 حائط الأثر المدني' : 'Mur de l’Impact Citoyen'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 font-serif leading-tight">
            {locale === 'ar' ? (
              <>
                أبطال هذا الأسبوع في <span className="text-teal-400">فولونوفا</span>
              </>
            ) : (
              <>
                Les Héros de la Semaine sur <span className="text-teal-400">VOLUNOVA</span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {locale === 'ar'
              ? 'ليسوا مشاهير... بل شباب ورجال ونساء من مختلف أحياء الجزائر يغيرون واقع مجتمعنا بسواعدهم المخلصة. التقدير هنا إنساني، اجتماعي، وحقيقي.'
              : 'Ni célébrités, ni influenceurs... de véritables bénévoles algériens qui font bouger leurs quartiers. Une reconnaissance humaine, fière et partagée.'}
          </p>
        </div>

        {/* Collective Community Challenges Bar */}
        {challenges.length > 0 && (
          <div className="mb-16 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  {locale === 'ar' ? '🎯 تحديات المجتمع الكبرى' : 'Défis Collectifs en Cours'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {locale === 'ar' ? 'معاً نصنع الفارق في أحيائنا' : 'Ensemble, faisons avancer nos communes'}
                </h2>
              </div>
              <Link
                href="/neighborhood/bab-ezzouar"
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
              >
                <span>{locale === 'ar' ? 'استكشف تحدي الحومة →' : 'Voir les Défis de Quartier →'}</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {challenges.map((c) => {
                const pct = c.progressPercentage || Math.min(100, Math.round((c.currentQuantity / (c.targetQuantity || 1)) * 100));
                return (
                  <div
                    key={c._id}
                    className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between hover:border-teal-500/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 font-medium">
                          📍 {c.neighborhood === 'All' ? (locale === 'ar' ? 'كل الجزائر' : 'Toute l’Algérie') : c.neighborhood}
                        </span>
                        <span className="text-xs font-bold text-teal-400">{pct}%</span>
                      </div>
                      <h3 className="font-bold text-white text-sm line-clamp-2 mb-3">
                        {locale === 'ar' ? c.titleAr : c.titleFr || c.titleAr}
                      </h3>
                    </div>

                    <div>
                      <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden mb-2">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>{c.currentQuantity} / {c.targetQuantity}</span>
                        <span>{c.remainingQuantity > 0 ? (locale === 'ar' ? `متبقي ${c.remainingQuantity}` : `${c.remainingQuantity} restants`) : '✅'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Heroes of the Week Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Award className="w-6 h-6 text-yellow-400" />
              <span>{locale === 'ar' ? 'سواعد من ذهب — أبطال الأسبوع' : 'Bénévoles à l’Honneur'}</span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">
              <div className="inline-block w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p>{locale === 'ar' ? 'جارٍ تحميل حائط الأثر...' : 'Chargement du mur d’impact...'}</p>
            </div>
          ) : heroes.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-slate-300">
                {locale === 'ar' ? 'كن أول من يظهر في حائط الأثر هذا الأسبوع!' : 'Soyez le premier bénévole à l’honneur cette semaine !'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {locale === 'ar' ? 'شارك في مهام تطوعية وساهم في بناء مجتمعك.' : 'Rejoignez une mission citoyenne et inspirez votre entourage.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroes.map((hero) => (
                <div
                  key={hero.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl -z-10 group-hover:bg-teal-500/15 transition-all" />

                  {/* Header info */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {hero.name ? hero.name.charAt(0).toUpperCase() : 'V'}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                            {hero.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-teal-400" />
                            <span>{hero.neighborhood} ({hero.city})</span>
                          </div>
                        </div>
                      </div>

                      {/* Qualitative Badge */}
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 border border-amber-400/30 text-amber-300 shrink-0">
                        {hero.topBadge}
                      </span>
                    </div>

                    {/* Stats Highlights */}
                    <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 mb-5 text-center">
                      <div>
                        <span className="block text-base font-extrabold text-teal-400">{hero.stats.missions}</span>
                        <span className="text-[11px] text-slate-400">{locale === 'ar' ? 'مهام' : 'Missions'}</span>
                      </div>
                      <div className="border-x border-slate-700/60">
                        <span className="block text-base font-extrabold text-teal-400">{hero.stats.hours}h</span>
                        <span className="text-[11px] text-slate-400">{locale === 'ar' ? 'ساعات' : 'Heures'}</span>
                      </div>
                      <div>
                        <span className="block text-base font-extrabold text-teal-400">{hero.stats.peopleHelped}</span>
                        <span className="text-[11px] text-slate-400">{locale === 'ar' ? 'أثر إنساني' : 'Impact'}</span>
                      </div>
                    </div>

                    {/* Heart Thank You Message */}
                    <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-center font-semibold text-sm mb-6">
                      {hero.thankYouMessage}
                    </div>
                  </div>

                  {/* Social Sharing Actions */}
                  <div className="pt-4 border-t border-slate-800/80">
                    <p className="text-xs text-slate-400 mb-2.5 font-medium">
                      {locale === 'ar' ? 'شارك هذا التكريم بفخر:' : 'Partagez cette reconnaissance :'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleWhatsAppShare(hero)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() => handleCopyShare(hero)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        {copiedId === hero.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-teal-400" />
                            <span className="text-teal-400">{locale === 'ar' ? 'تم النسخ!' : 'Copié !'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Story / Post</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleFacebookShare}
                        className="py-2 px-3 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 text-xs font-bold transition-all"
                        title="Facebook"
                      >
                        f
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Neighborhood Section */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-900/60 via-slate-900 to-slate-900 border border-teal-500/30 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              {locale === 'ar' ? 'هل تريد أن تنافس حومتك لتكون الأفضل؟' : 'Votre quartier est-il prêt à relever le défi ?'}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base mb-6">
              {locale === 'ar'
                ? 'استكشف صفحات الأحياء في الجزائر وتحدي الحومة الجماعي، وشاهد رفقاءك وسواعد منطقتك.'
                : 'Découvrez la page de votre commune, formez une squad et participez au défi solidaire.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/neighborhood/bab-ezzouar"
                className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/25"
              >
                {locale === 'ar' ? 'تحدي باب الزوار 📍' : 'Défi Bab Ezzouar 📍'}
              </Link>
              <Link
                href="/neighborhood/belouizdad"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all"
              >
                {locale === 'ar' ? 'تحدي بلوزداد 📍' : 'Défi Belouizdad 📍'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
