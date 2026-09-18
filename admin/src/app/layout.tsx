import type { Metadata } from 'next';
import './globals.css';
import AdminSidebar from '@/components/layout/AdminSidebar';

export const metadata: Metadata = {
  title: 'VOLUNOVA Admin — Gouvernance & Statistiques Nationales',
  description: 'Tableau de bord de supervision et contrôle national pour la plateforme VOLUNOVA.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex bg-[#040813] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </body>
    </html>
  );
}
