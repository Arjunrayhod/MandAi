'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SmartAiAssistant } from '@/components/ai/SmartAiAssistant';
import { StoreHydrator } from '@/components/common/StoreHydrator';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isHydrated } = useAppStore();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (isHydrated) {
      if (!currentUser && !isLoginPage) {
        router.push('/login');
      }
    }
  }, [isHydrated, currentUser, isLoginPage, router]);

  // If on login page, render only the login interface
  if (isLoginPage) {
    return (
      <>
        <StoreHydrator />
        <main className="h-screen w-full overflow-y-auto bg-slate-950">
          {children}
        </main>
      </>
    );
  }

  // If loading or unauthenticated while not on login page, show smooth branded loader
  if (!isHydrated || !currentUser) {
    return (
      <>
        <StoreHydrator />
        <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-semibold text-slate-400">सत्र लोड हो रहा है (Loading MandAi)...</p>
        </div>
      </>
    );
  }

  // Full Authenticated Application Layout
  return (
    <>
      <StoreHydrator />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 p-3 sm:p-6 md:p-8 w-full max-w-full">
          {children}
        </main>
      </div>
      <SmartAiAssistant />
    </>
  );
}
