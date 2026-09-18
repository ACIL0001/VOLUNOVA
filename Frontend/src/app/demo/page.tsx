'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  TreePine,
  Clock,
  Users,
  CheckCircle2,
  RefreshCw,
  Award,
  Smartphone,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTranslation } from '@/context/LanguageContext';

export default function DualScreenDemoPage() {
  const { t } = useTranslation();
  const [designerFilled, setDesignerFilled] = useState(false);
  const [totalHours, setTotalHours] = useState(8650);
  const [joinedMessage, setJoinedMessage] = useState(false);
  const [joining, setJoining] = useState(false);

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#38BDF8', '#818CF8', '#34D399', '#FFFFFF'],
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleVolunteerJoin = async () => {
    if (designerFilled) return;
    setJoining(true);

    try {
      await api.seedDatabase().catch(() => null);
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      setDesignerFilled(true);
      setJoinedMessage(true);
      setTotalHours((prev) => prev + 4);
      setJoining(false);
      fireConfetti();
    }, 500);
  };

  const handleReset = () => {
    setDesignerFilled(false);
    setJoinedMessage(false);
    setTotalHours(8650);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Demo Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-900/40 bg-gradient-to-r from-[#0c183b]/80 via-[#081028]/90 to-[#050a16]/95 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/20 text-sky-400 border border-blue-500/30">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {t('demo.banner_title')}
              </span>
              <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-black text-sky-300 border border-blue-500/30">
                {t('demo.banner_tag')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('demo.banner_desc')}
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:border-blue-500/50 transition-all shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5 text-sky-400" />
          <span>{t('demo.reset_btn')}</span>
        </button>
      </div>

      {/* Split Grid */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left 65%: Organization Command Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-blue-900/35 bg-gradient-to-br from-[#0c1633]/90 via-[#070e22]/95 to-[#040814]/98 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-blue-900/30 pb-4 mb-6">
              <div>
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  {t('demo.org_badge')}
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  {t('demo.org_title')}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-300 bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-500/30">
                <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                <span>{t('demo.live_tag')}</span>
              </div>
            </div>

            {/* Total Counters */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="rounded-2xl border border-blue-900/30 bg-[#070e22]/90 p-4 text-center">
                <div className="text-xs text-slate-400">{t('demo.completed_slots')}</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {designerFilled ? '8 / 12' : '7 / 12'}
                </div>
              </div>
              <div className="rounded-2xl border border-blue-900/30 bg-[#070e22]/90 p-4 text-center">
                <div className="text-xs text-slate-400">{t('demo.progress_rate')}</div>
                <div className="text-2xl sm:text-3xl font-black text-sky-400 mt-1">
                  {designerFilled ? '67%' : '58%'}
                </div>
              </div>
              <div className="rounded-2xl border border-blue-900/30 bg-[#070e22]/90 p-4 text-center">
                <div className="text-xs text-slate-400">{t('demo.total_hours')}</div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-300 mt-1">
                  {totalHours.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Realtime Slots Progress */}
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              {t('demo.roles_status_title')}
            </h3>

            <div className="space-y-3">
              {/* Slot 1: Diggers */}
              <div className="rounded-2xl border border-blue-900/30 bg-[#080f24]/80 p-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-white">{t('demo.role1_title')}</span>
                  <span className="text-slate-400 font-semibold">{t('demo.role1_status')}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-sky-400" style={{ width: '70%' }} />
                </div>
              </div>

              {/* Slot 2: Drone Operator */}
              <div className="rounded-2xl border border-blue-900/30 bg-[#080f24]/80 p-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-white">{t('demo.role2_title')}</span>
                  <span className="text-slate-400 font-semibold">{t('demo.role2_status')}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div className="h-full bg-slate-800" style={{ width: '0%' }} />
                </div>
              </div>

              {/* Slot 3: Graphic Designer */}
              <div
                className={`rounded-2xl border p-4 transition-all duration-700 ${
                  designerFilled
                    ? 'border-blue-500/80 bg-[#0d2250]/70 shadow-xl shadow-blue-500/20'
                    : 'border-blue-900/30 bg-[#080f24]/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{t('demo.role3_title')}</span>
                    {designerFilled && (
                      <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-sky-300 border border-blue-500/30 animate-pulse">
                        {t('demo.role3_joined_badge')}
                      </span>
                    )}
                  </div>
                  <span className={`font-bold ${designerFilled ? 'text-sky-300' : 'text-slate-400'}`}>
                    {designerFilled ? t('demo.role3_full') : t('demo.role3_vacant')}
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-700 rounded-full ${
                      designerFilled
                        ? 'progress-bar-green w-full'
                        : 'bg-slate-800 w-0'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Live Activity Ticker */}
            <div className="mt-6 rounded-2xl border border-blue-900/30 bg-[#050a16]/80 p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {t('demo.ticker_title')}
              </span>
              <div className="space-y-2 text-xs">
                {designerFilled ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold animate-fadeIn">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>{t('demo.ticker_joined')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>{t('demo.ticker_waiting')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t('demo.ticker_prev')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 35%: Simulated Mobile Viewport (Ahmed's Phone) */}
        <div className="lg:col-span-5 flex justify-center">
          {/* Phone Frame */}
          <div className="w-[360px] rounded-[44px] border-[10px] border-[#101b38] bg-[#070c18] p-4 shadow-2xl relative overflow-hidden ring-1 ring-blue-500/20">
            {/* Camera notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-28 rounded-full bg-[#101b38] z-30" />

            <div className="pt-5 pb-2">
              {/* Mobile Header */}
              <div className="flex items-center justify-between border-b border-blue-900/30 pb-3 mb-4">
                <div>
                  <div className="text-xs text-slate-400">{t('demo.mobile_greeting')}</div>
                  <div className="text-sm font-bold text-white">{t('demo.mobile_name')}</div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-bold text-sky-300 border border-blue-500/25">
                  <Award className="h-3.5 w-3.5 text-sky-400" />
                  <span>{designerFilled ? '38' : '34'} {t('demo.mobile_hours_badge')}</span>
                </div>
              </div>

              {/* Push Notification Toast */}
              <div className="mb-4 rounded-2xl border border-blue-500/40 bg-blue-950/40 p-3.5 shadow-lg shadow-blue-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-sky-400 animate-spin" />
                  <span className="text-xs font-bold text-sky-200">{t('demo.mobile_notif_title')}</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {t('demo.mobile_notif_desc')}
                </p>
              </div>

              {/* Matched Mission Card */}
              <div className="rounded-2xl border border-blue-900/40 bg-[#0c1633]/90 p-4 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold text-sky-300 border border-blue-500/20">
                    {t('demo.mobile_category')}
                  </span>
                  <span className="rounded-full bg-blue-500/25 px-2.5 py-0.5 text-[10px] font-black text-sky-300 border border-blue-400/40">
                    {t('demo.mobile_match')}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug mb-2">
                  {t('demo.mobile_campaign_title')}
                </h4>

                <div className="space-y-1.5 text-xs text-slate-300 bg-[#060a16]/80 p-3 rounded-xl mb-3 border border-blue-900/30">
                  <div>
                    {t('demo.mobile_role_label')}: <strong className="text-sky-300">{t('demo.mobile_role_name')}</strong>
                  </div>
                  <div className="text-slate-400">{t('demo.mobile_venue')}</div>
                  <div className="text-slate-400">{t('demo.mobile_time')}</div>
                </div>

                {/* 1-Tap RSVP Button / Green Accept Confirmation */}
                {designerFilled ? (
                  <div className="rounded-xl popup-accept-green p-3.5 text-center animate-fadeIn">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>{t('demo.mobile_rsvp_success')}</span>
                    </div>
                    <div className="text-[10px] text-emerald-300/80 mt-1">
                      {t('demo.mobile_rsvp_added')}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleVolunteerJoin}
                    disabled={joining}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 py-3 text-xs font-bold text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-sky-400 transition-all transform active:scale-95 disabled:opacity-50 border border-blue-400/30"
                  >
                    <Sparkles className="h-4 w-4 text-sky-200" />
                    <span>{joining ? t('demo.mobile_rsvp_joining') : t('demo.mobile_rsvp_btn')}</span>
                  </button>
                )}
              </div>

              {/* Passport preview */}
              <div className="mt-4 rounded-xl border border-blue-900/30 bg-[#091124]/60 p-3">
                <div className="text-[11px] font-bold text-slate-400 mb-2">{t('demo.mobile_badges_title')}</div>
                <div className="flex gap-2 text-[10px]">
                  <span className="rounded-lg bg-blue-950/60 border border-blue-900/40 px-2 py-1 text-slate-300">{t('demo.badge_eco')}</span>
                  <span className="rounded-lg bg-blue-950/60 border border-blue-900/40 px-2 py-1 text-slate-300">{t('demo.badge_art')}</span>
                  <span className="rounded-lg bg-blue-950/60 border border-blue-900/40 px-2 py-1 text-slate-300">{t('demo.badge_speed')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
