import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import ConditionalChrome from '@/components/layout/ConditionalChrome';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { Locale, LOCALE_METADATA, DEFAULT_LOCALE } from '@/locales';

export const metadata: Metadata = {
  title: 'VOLUNOVA — Civic Volunteer Operating System',
  description:
    'Official-ready volunteer coordination: describe an initiative, structure field roles with AI, and match citizens to verified civic missions.',
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get('volunova_locale')?.value as Locale | undefined;
  const initialLocale: Locale =
    savedLocale && (savedLocale === 'ar' || savedLocale === 'fr' || savedLocale === 'en')
      ? savedLocale
      : DEFAULT_LOCALE;

  const dir = LOCALE_METADATA[initialLocale]?.dir || 'rtl';

  return (
    <html lang={initialLocale} dir={dir} className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var l = localStorage.getItem('volunova_locale');
                if (l && (l === 'ar' || l === 'fr' || l === 'en')) {
                  document.documentElement.lang = l;
                  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-civic text-[#0b1f3a] font-ui selection:bg-[#0d7a6f]/20 selection:text-[#0b1f3a] relative antialiased">
        <LanguageProvider initialLocale={initialLocale}>
          <AuthProvider>
            <ConditionalChrome>{children}</ConditionalChrome>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
