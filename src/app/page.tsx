'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { getTranslation } from '@/lib/translations';
import { formatIndianCurrency } from '@/lib/gstUtils';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Building2, 
  AlertTriangle, 
  Receipt, 
  Users, 
  Package, 
  Plus, 
  Share2,
  Printer,
  ChevronRight,
  Sparkles,
  Scale
} from 'lucide-react';

export default function DashboardPage() {
  const { invoices, parties, products, company, getMetrics, cashInHand, language } = useAppStore();
  const metrics = getMetrics();

  const recentInvoices = invoices.slice(0, 5);
  const topReceivables = parties
    .filter((p) => p.currentBalance > 0 && p.balanceType === 'to_receive')
    .sort((a, b) => b.currentBalance - a.currentBalance)
    .slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-900/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              {language === 'hi' ? 'मंडी व्यापार डैशबोर्ड' : language === 'en' ? 'Mandi Trade Dashboard' : 'Mandi Vyapar Dashboard'}
            </span>
            <span className="text-xs text-slate-400">Neemuch Krishi Mandi</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">{company.name}</h1>
          <p className="text-xs text-slate-300">
            GSTIN: <span className="font-mono text-indigo-400 font-bold">{company.gstin}</span> • {language === 'hi' ? 'प्रोपराइटर' : 'Proprietor'}: {company.ownerName}
          </p>
        </div>

        {/* Quick Button Group */}
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/billing/new"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {getTranslation('new_bill_btn', language)}
          </Link>
          <Link
            href="/sauda"
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
          >
            <Scale className="w-4 h-4" />
            {getTranslation('nav_sauda', language)}
          </Link>
          <Link
            href="/money"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition"
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            {getTranslation('nav_money', language)}
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{getTranslation('today_sales', language)}</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {formatIndianCurrency(metrics.todaySales)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-bold">16-Sep Sample Bill</span> included
            </p>
          </div>
        </div>

        {/* Total Receivable */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{getTranslation('market_receivable', language)}</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/40">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-amber-600">
              {formatIndianCurrency(metrics.totalReceivable)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {language === 'hi' ? 'पार्टियों से लेना बाकी (लेन-देन)' : language === 'en' ? 'Outstanding from buyers' : 'Parties se lena baaki'}
            </p>
          </div>
        </div>

        {/* Bank & Cash Balance */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{getTranslation('bank_balance', language)}</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {formatIndianCurrency(metrics.bankBalance)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {getTranslation('cash_in_hand', language)}: <span className="font-bold text-slate-700 dark:text-slate-300">{formatIndianCurrency(cashInHand)}</span>
            </p>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{getTranslation('stock_alert', language)}</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/40">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {products.length} <span className="text-xs font-medium text-slate-500">{language === 'hi' ? 'जिंस' : 'Items'}</span>
            </h3>
            <p className="text-[11px] text-rose-600 font-medium mt-1">
              {metrics.lowStockCount > 0 
                ? (language === 'hi' ? `${metrics.lowStockCount} आइटम री-ऑर्डर स्तर पर` : `${metrics.lowStockCount} low stock alerts`)
                : (language === 'hi' ? 'स्टॉक पर्याप्त है' : 'Stock is sufficient')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Invoices & Party Udhaar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Recent Invoices */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                {getTranslation('recent_invoices', language)}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'मंडी व्यापार खरीदारों के जारी बिल' : language === 'en' ? 'Invoices issued to mandi buyers' : 'Mandi vyapar party bills'}
              </p>
            </div>
            <Link
              href="/billing"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              {language === 'hi' ? 'सभी देखें' : language === 'en' ? 'View All' : 'Sabhi Dekhein'} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-2.5 px-3">{getTranslation('col_bill_no', language)}</th>
                  <th className="py-2.5 px-3">{getTranslation('col_party', language)}</th>
                  <th className="py-2.5 px-3">{getTranslation('invoice_date', language)}</th>
                  <th className="py-2.5 px-3 text-right">{getTranslation('col_total_amount', language)}</th>
                  <th className="py-2.5 px-3 text-center">{getTranslation('status', language)}</th>
                  <th className="py-2.5 px-3 text-right">{getTranslation('actions', language)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                    <td className="py-3 px-3 font-bold font-mono text-indigo-600">
                      #{inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900 dark:text-white">{inv.party.businessName || inv.party.name}</p>
                      <p className="text-[10px] text-slate-500">{inv.placeOfSupply}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {inv.invoiceDate}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatIndianCurrency(inv.finalAmount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {inv.status === 'paid' ? getTranslation('paid', language) : getTranslation('pending', language)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/billing/${inv.id}`}
                        className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold px-2.5 py-1 rounded-lg text-[11px] transition"
                      >
                        <Printer className="w-3 h-3" />
                        {language === 'hi' ? 'देखें / प्रिंट' : language === 'en' ? 'View / Print' : 'Dekhein / Print'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: Party Udhaar Ledger */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" />
                  {getTranslation('party_udhaar_ledger', language)}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'hi' ? 'सर्वोच्च बकाया वाले व्यापारी' : language === 'en' ? 'Top outstanding parties' : 'Top baaki parties'}
                </p>
              </div>
              <Link href="/parties" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                {language === 'hi' ? 'सब' : 'All'} <ChevronRight className="w-3.5 h-3.5 inline" />
              </Link>
            </div>

            <div className="space-y-3">
              {topReceivables.map((party) => (
                <div key={party.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {party.businessName || party.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {party.city} • {party.phone}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-xs text-rose-600 block">
                      {formatIndianCurrency(party.currentBalance)}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {getTranslation('balance_to_receive', language)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Link
              href="/parties"
              className="w-full block text-center py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 font-bold text-xs rounded-xl transition"
            >
              {getTranslation('add_party_btn', language)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}