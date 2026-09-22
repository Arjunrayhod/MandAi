'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Language, getTranslation } from '@/lib/translations';
import { Store, ReceiptText, Bell, Globe, Wifi, WifiOff, Menu, LogOut, User, Zap } from 'lucide-react';
import { MandAiLogo } from '@/components/common/MandAiLogo';

export const Header: React.FC = () => {
  const { company, getMetrics, language, setLanguage, toggleMobileSidebar, currentUser, logout } = useAppStore();
  const metrics = getMetrics();
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between shrink-0 print:hidden select-none">
      {/* Left Search / Mobile Menu / Info */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 sm:px-3 py-1.5 rounded-xl">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-5 h-5 rounded-md object-contain bg-white p-0.5 border border-slate-200 dark:border-slate-700 shrink-0"
            />
          ) : (
            <MandAiLogo size={22} showSparkle={false} />
          )}
          <span className="font-bold truncate max-w-[130px] sm:max-w-[200px]">{company.name}</span>
          {currentUser?.isDemo ? (
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-600" />
              डेमो मोड
            </span>
          ) : (
            company.gstin && (
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono px-1.5 py-0.5 rounded-md hidden sm:inline-block">
                GST: {company.gstin}
              </span>
            )
          )}
        </div>

        {/* Offline / Local Storage Badge */}
        <div 
          title={isOnline ? 'Online • Auto-saved locally in browser' : 'Offline Mode • 100% functional with local storage'}
          className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl transition ${
            isOnline 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 animate-pulse'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">
                {language === 'hi' ? 'ऑफलाइन सुरक्षित' : language === 'en' ? 'Offline Ready' : 'Offline Active'}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'hi' ? 'ऑफलाइन मोड' : language === 'en' ? 'Offline Mode' : 'Offline Mode'}</span>
            </>
          )}
        </div>
      </div>

      {/* Right Actions & Language Switcher & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 3-Language Selector */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {(['hi', 'en', 'hinglish'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
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

        {/* User Account & Logout Button */}
        {currentUser ? (
          <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('क्या आप सचमुच लॉगआउट (Logout) करना चाहते हैं?')) {
                  logout();
                }
              }}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs px-2.5 py-1.5 rounded-xl transition"
              title="अकाउंट से बाहर आएं / लॉगआउट करें"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">लॉगआउट</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs px-3 py-1.5 rounded-xl transition"
          >
            <User className="w-3.5 h-3.5" />
            लॉगिन
          </Link>
        )}
      </div>
    </header>
  );
};