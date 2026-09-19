import React, { Suspense } from 'react';
import OrgGuard from '@/components/auth/OrgGuard';
import OrgSidebar from '@/components/layout/OrgSidebar';

export const metadata = {
  title: 'VOLUNOVA — Tableau de bord Organisation',
  description: 'Espace sécurisé des associations pour gérer et publier des missions civiques.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrgGuard>
      <div className="min-h-screen flex flex-col md:flex-row bg-civic text-[#0b1f3a] font-ui">
        <Suspense
          fallback={
            <aside className="hidden md:block w-64 flex-shrink-0 bg-white border-r border-[#d8e0ea]" />
          }
        >
          <OrgSidebar />
        </Suspense>
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">{children}</div>
      </div>
    </OrgGuard>
  );
}
