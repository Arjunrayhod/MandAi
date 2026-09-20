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
  Scale
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getTranslation, TRANSLATIONS } from '@/lib/translations';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { company, language } = useAppStore();

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

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 print:hidden select-none">
      {/* Brand Logo & Name */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
          <Wheat className="w-6 h-6" />
        </div>
        <div className="overflow-hidden">
          <h2 className="text-sm font-bold text-white truncate tracking-tight">
            {company.name || 'MandAi SaaS'}
          </h2>
          <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-full inline-block border border-sky-800/60 mt-0.5">
            {getTranslation('mandi_edition', language)}
          </span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <Link
          href="/billing/new"
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

      {/* Bottom Profile Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white truncate">{company.ownerName || 'Kundan Rathore'}</p>
            <p className="text-slate-500 text-[10px]">{company.city}, {company.state}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50"></span>
        </div>
      </div>
    </aside>
  );
};