'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { PlusCircle, Search, Store, ReceiptText, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const { company, getMetrics } = useAppStore();
  const metrics = getMetrics();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 print:hidden">
      {/* Left Search / Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
          <Store className="w-4 h-4 text-indigo-600" />
          <span>{company.name}</span>
          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono px-1.5 py-0.5 rounded">
            GST: {company.gstin}
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {metrics.lowStockCount > 0 && (
          <Link
            href="/inventory"
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition"
          >
            <Bell className="w-3.5 h-3.5 animate-bounce text-amber-600" />
            <span>{metrics.lowStockCount} लो-स्टॉक अलर्ट</span>
          </Link>
        )}

        <Link
          href="/billing/new"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs"
        >
          <ReceiptText className="w-4 h-4" />
          + नया बिल (New Invoice)
        </Link>
      </div>
    </header>
  );
};
