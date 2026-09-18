'use client';

import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

const PHONES = [
  { key: 'phone_1_label', value: '0562242628', href: 'tel:+213562242628' },
  { key: 'phone_2_label', value: '0660295655', href: 'tel:+213660295655' },
];

const EMAILS = [
  { key: 'email_1_label', value: 'voulnteer.dz@gmail.com', href: 'mailto:voulnteer.dz@gmail.com' },
  {
    key: 'email_2_label',
    value: 'support.voulnteer.dz@gmail.com',
    href: 'mailto:support.voulnteer.dz@gmail.com',
  },
];

export default function ContactPage() {
  const { t, locale } = useTranslation();

  const locations = [
    { key: 'loc_1_label', value: t('contact.loc_1_value') },
    { key: 'loc_2_label', value: t('contact.loc_2_value') },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0d7a6f] mb-2">
          {t('contact.badge')}
        </p>
        <h1
          className={`text-3xl sm:text-4xl font-semibold text-[#0b1f3a] leading-tight ${
            locale === 'ar' ? 'font-cairo' : 'font-display'
          }`}
        >
          {t('contact.title')}
        </h1>
        <p className="mt-3 text-sm text-[#5b6b7c] leading-relaxed">{t('contact.subtitle')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="surface-panel rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-lg bg-[#e6f4f2] flex items-center justify-center text-[#0d7a6f]">
              <Phone className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-[#0b1f3a]">{t('contact.phones_title')}</h2>
          </div>
          <ul className="space-y-4">
            {PHONES.map((phone) => (
              <li key={phone.value}>
                <div className="text-xs font-medium text-[#5b6b7c] mb-0.5">{t(`contact.${phone.key}`)}</div>
                <a
                  href={phone.href}
                  className="text-sm font-semibold text-[#0b1f3a] hover:text-[#0d7a6f] transition-colors"
                  dir="ltr"
                >
                  {phone.value}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-panel rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-lg bg-[#e6f4f2] flex items-center justify-center text-[#0d7a6f]">
              <Mail className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-[#0b1f3a]">{t('contact.emails_title')}</h2>
          </div>
          <ul className="space-y-4">
            {EMAILS.map((email) => (
              <li key={email.value}>
                <div className="text-xs font-medium text-[#5b6b7c] mb-0.5">{t(`contact.${email.key}`)}</div>
                <a
                  href={email.href}
                  className="text-sm font-semibold text-[#0b1f3a] hover:text-[#0d7a6f] transition-colors break-all"
                  dir="ltr"
                >
                  {email.value}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-panel rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-lg bg-[#e6f4f2] flex items-center justify-center text-[#0d7a6f]">
              <MapPin className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-[#0b1f3a]">{t('contact.locations_title')}</h2>
          </div>
          <ul className="space-y-4">
            {locations.map((loc) => (
              <li key={loc.key}>
                <div className="text-xs font-medium text-[#5b6b7c] mb-0.5">{t(`contact.${loc.key}`)}</div>
                <div className="text-sm font-semibold text-[#0b1f3a]">{loc.value}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-8 text-xs text-[#5b6b7c]">{t('contact.note')}</p>
    </div>
  );
}
