import AdminSidebar from '@/components/layout/AdminSidebar';

export const metadata = {
  title: 'VOLUNOVA Admin — Gouvernance & Statistiques Nationales',
  description: 'Tableau de bord de supervision et contrôle national pour la plateforme VOLUNOVA.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-civic text-[#0b1f3a] font-ui" dir="ltr" lang="fr">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">{children}</div>
    </div>
  );
}
