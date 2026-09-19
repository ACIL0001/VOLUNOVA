'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreateMissionStudio from '@/components/missions/CreateMissionStudio';
import { useAuth } from '@/context/AuthContext';

/**
 * Public create route — organizations are redirected into the secured dashboard
 * create tab (least privilege / single entry for org workflows).
 */
export default function CreateMissionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?redirect=/missions/create');
      return;
    }
    if (user.role === 'organization') {
      router.replace('/dashboard?tab=create');
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/missions/browse');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-3 border-[#0d7a6f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user.role === 'organization') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-3 border-[#0d7a6f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user.role !== 'admin') {
    return null;
  }

  return <CreateMissionStudio />;
}
