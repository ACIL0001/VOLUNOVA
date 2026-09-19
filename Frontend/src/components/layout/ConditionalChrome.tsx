'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingLanguageButton from '@/components/ui/FloatingLanguageButton';

export default function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isOrgDashboard = pathname?.startsWith('/dashboard');

  if (isAdmin || isOrgDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-2">{children}</main>
      <Footer />
      <FloatingLanguageButton />
    </>
  );
}
