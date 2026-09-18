import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingLanguageButton from '@/components/ui/FloatingLanguageButton';
import { LanguageProvider } from '@/context/LanguageContext';
import { Locale, LOCALE_METADATA, DEFAULT_LOCALE } from '@/locales';

export const metadata: Metadata = {
  title: 'VOLUNOVA — AI-First Volunteer Operating System',
  description: 'منصة ذكية تحول الوصف اللغوي للمبادرات إلى احتياجات تشغيلية فورية، ومطابقة دقيقة للكفاءات، ومتابعة لحظية للأثر الميداني.',
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
    <html lang={initialLocale} dir={dir} className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Anti-flash inline script to instantly sync lang and dir before paint */}
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
      <body className="min-h-full flex flex-col bg-[#050811] bg-mesh-dark text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative">
        <LanguageProvider initialLocale={initialLocale}>
          <Navbar />
          <main className="flex-1 pt-2">{children}</main>
          <Footer />
          <FloatingLanguageButton />
        </LanguageProvider>
      </body>
    </html>
  );
}
