'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  Package, 
  Wallet, 
  BarChart3, 
  Settings, 
  PlusCircle,
  Wheat,
  Scale,
  X,
  LogOut
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getTranslation } from '@/lib/translations';
import { MandAiLogo } from '@/components/common/MandAiLogo';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { company, language, mobileSidebarOpen, setMobileSidebarOpen, currentUser, logout } = useAppStore();

  const navItems = [
    { href: '/', label: getTranslation('nav_dashboard', language), icon: LayoutDashboard },
    { href: '/billing', label: getTranslation('nav_invoices', language), icon: Receipt },
    { href: '/sauda', label: getTranslation('nav_sauda', language), icon: Scale },
    { href: '/parties', label: getTranslation('nav_parties', language), icon: Users },
    { href: '/inventory', label: getTranslation('nav_inventory', language), icon: Package },
    { href: '/money', label: getTranslation('nav_money', language), icon: Wallet },
    { href: '/reports', label: getTranslation('nav_reports', language), icon: BarChart3 },
    { href: '/settings', label: getTranslation('nav_settings', language), icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Brand Logo & Name */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-slate-700 shadow-md shrink-0"
            />
          ) : (
            <MandAiLogo size={40} animated />
          )}
          <div className="overflow-hidden min-w-0">
            <h2 className="text-sm font-bold text-white truncate tracking-tight">
              {company.name || 'MandAi SaaS'}
            </h2>
            <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-full inline-block border border-sky-800/60 mt-0.5">
              {getTranslation('mandi_edition', language)}
            </span>
          </div>
        </div>

        {/* Close Button on Mobile Drawer */}
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <Link
          href="/billing/new"
          onClick={() => setMobileSidebarOpen(false)}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          {getTranslation('new_bill_btn', language)}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Info & Logout Button */}
      <div className="p-3.5 border-t border-slate-800 text-[11px] bg-slate-950/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={currentUser?.name || company.ownerName}
                className="w-8 h-8 rounded-full object-cover bg-white border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {(currentUser?.name || company.ownerName || company.name || 'M')[0].toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-bold text-white truncate text-xs">
                {currentUser?.name || company.ownerName || 'व्यापारी'}
              </p>
              <p className="text-slate-400 text-[10px] truncate">
                {currentUser?.isDemo ? '🌾 डेमो अकाउंट' : `@${currentUser?.username || 'user'}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('क्या आप सचमुच लॉगआउट (Logout) करना चाहते हैं?')) {
                logout();
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition shrink-0"
            title="लॉगआउट करें (Log Out)"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: Permanent on md+ screens */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800 print:hidden select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer: Active when mobileSidebarOpen is true */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative w-4/5 max-w-xs h-full bg-slate-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};