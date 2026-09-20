'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Language, getTranslation } from '@/lib/translations';
import { Store, ReceiptText, Bell, Languages, Globe } from 'lucide-react';

export const Header: React.FC = () => {
  const { company, getMetrics, language, setLanguage } = useAppStore();
  const metrics = getMetrics();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 print:hidden select-none">
      {/* Left Search / Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
          <Store className="w-4 h-4 text-indigo-600" />
          <span className="font-bold">{company.name}</span>
          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono px-1.5 py-0.5 rounded-md">
            GST: {company.gstin}
          </span>
        </div>
      </div>

      {/* Right Actions & Language Switcher */}
      <div className="flex items-center gap-3">
        {/* 3-Language Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {(['hi', 'en', 'hinglish'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                language === lang
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang === 'hi' ? 'हिंदी' : lang === 'en' ? 'English' : 'Hinglish'}
            </button>
          ))}
        </div>

        {metrics.lowStockCount > 0 && (
          <Link
            href="/inventory"
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1.5 rounded-xl hover:bg-amber-100 transition hidden sm:flex"
          >
            <Bell className="w-3.5 h-3.5 animate-bounce text-amber-600" />
            <span>{metrics.lowStockCount} Alert</span>
          </Link>
        )}

        <Link
          href="/billing/new"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs whitespace-nowrap"
        >
          <ReceiptText className="w-4 h-4" />
          <span>{getTranslation('new_bill_btn', language)}</span>
        </Link>
      </div>
    </header>
  );
};