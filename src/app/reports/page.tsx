'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getTranslation, t } from '@/lib/translations';
import { formatIndianCurrency } from '@/lib/gstUtils';
import { 
  BarChart3, 
  FileText, 
  Printer, 
  Download, 
  Receipt, 
  Users, 
  Package, 
  TrendingUp,
  Filter,
  CheckCircle
} from 'lucide-react';

export default function ReportsPage() {
  const { invoices, parties, products, company, language } = useAppStore();
  const [activeTab, setActiveTab] = useState<'sales' | 'gstr1' | 'outstanding' | 'commodity'>('sales');

  const totalSales = invoices.reduce((sum, i) => sum + i.finalAmount, 0);
  const totalTaxable = invoices.reduce((sum, i) => sum + i.taxableAmount, 0);
  const totalCgst = invoices.reduce((sum, i) => sum + i.totalCgst, 0);
  const totalSgst = invoices.reduce((sum, i) => sum + i.totalSgst, 0);
  const totalIgst = invoices.reduce((sum, i) => sum + i.totalIgst, 0);
  const totalTax = totalCgst + totalSgst + totalIgst;

  const totalOutstanding = parties
    .filter((p) => p.balanceType === 'to_receive')
    .reduce((sum, p) => sum + p.currentBalance, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            {t('reports_title', language)}
          </h1>
          <p className="text-xs text-slate-500">
            {t('reports_subtitle', language)}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition"
        >
          <Printer className="w-4 h-4" />
          {t('print', language)}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1 overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === 'sales'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          📈 {t('sales_report', language)}
        </button>
        <button
          onClick={() => setActiveTab('gstr1')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === 'gstr1'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          🏛️ {t('gstr1_summary', language)}
        </button>
        <button
          onClick={() => setActiveTab('outstanding')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === 'outstanding'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          👥 {t('outstanding_report', language)}
        </button>
        <button
          onClick={() => setActiveTab('commodity')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeTab === 'commodity'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          🌾 {language === 'hi' ? 'जिंस-वार बिक्री' : language === 'en' ? 'Commodity Sales' : 'Jins Sales'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-500">{t('rep_total_sales', language)}</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatIndianCurrency(totalSales)}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-500">{t('rep_taxable_value', language)}</span>
          <h3 className="text-xl font-black text-indigo-600 mt-1">
            {formatIndianCurrency(totalTaxable)}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-500">{t('rep_gst_collected', language)}</span>
          <h3 className="text-xl font-black text-emerald-600 mt-1">
            {formatIndianCurrency(totalTax)}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-500">{t('total_receivable', language)}</span>
          <h3 className="text-xl font-black text-amber-600 mt-1">
            {formatIndianCurrency(totalOutstanding)}
          </h3>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'sales' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            बिक्री बिल विवरण (Detailed Sales Register)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-2.5 px-3">बिल नं.</th>
                  <th className="py-2.5 px-3">तारीख</th>
                  <th className="py-2.5 px-3">ग्राहक / फर्म</th>
                  <th className="py-2.5 px-3">जिंस आइटम</th>
                  <th className="py-2.5 px-3 text-right">Taxable</th>
                  <th className="py-2.5 px-3 text-right">CGST</th>
                  <th className="py-2.5 px-3 text-right">SGST</th>
                  <th className="py-2.5 px-3 text-right">कुल बिल राशि</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 px-3 font-bold font-mono text-indigo-600">#{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{inv.invoiceDate}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{inv.party.businessName}</td>
                    <td className="py-3 px-3">{inv.items.map((i) => i.name).join(', ')}</td>
                    <td className="py-3 px-3 text-right font-medium">₹{inv.taxableAmount.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right">₹{inv.totalCgst.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right">₹{inv.totalSgst.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatIndianCurrency(inv.finalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'gstr1' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              GSTR-1 B2B इनवॉइस समरी (Tax Filing Summary)
            </h3>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">
              GSTIN: {company.gstin}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-2.5 px-3">पार्टी GSTIN</th>
                  <th className="py-2.5 px-3">पार्टी नाम</th>
                  <th className="py-2.5 px-3">बिल नं.</th>
                  <th className="py-2.5 px-3">Place of Supply</th>
                  <th className="py-2.5 px-3 text-right">कर योग्य मूल्य</th>
                  <th className="py-2.5 px-3 text-right">CGST (2.5%)</th>
                  <th className="py-2.5 px-3 text-right">SGST (2.5%)</th>
                  <th className="py-2.5 px-3 text-right">IGST (5%)</th>
                  <th className="py-2.5 px-3 text-right">कुल सेस/टैक्स</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {inv.party.gstin || 'Unregistered'}
                    </td>
                    <td className="py-3 px-3 font-semibold">{inv.party.businessName}</td>
                    <td className="py-3 px-3 font-mono text-indigo-600 font-bold">#{inv.invoiceNumber}</td>
                    <td className="py-3 px-3">{inv.placeOfSupply}</td>
                    <td className="py-3 px-3 text-right font-bold">₹{inv.taxableAmount.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right">₹{inv.totalCgst.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right">₹{inv.totalSgst.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right">₹{inv.totalIgst.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-black text-emerald-600">
                      ₹{inv.totalTax.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'outstanding' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            पार्टी उधारी व बकाया रिपोर्ट (Party Outstanding Ageing)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-2.5 px-3">फर्म / पार्टी</th>
                  <th className="py-2.5 px-3">संपर्क व्यक्ति</th>
                  <th className="py-2.5 px-3">फोन नंबर</th>
                  <th className="py-2.5 px-3">शहर</th>
                  <th className="py-2.5 px-3 text-right">क्रेडिट लिमिट</th>
                  <th className="py-2.5 px-3 text-right">बाकी राशि (Due)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {parties.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{p.businessName}</td>
                    <td className="py-3 px-3">{p.name}</td>
                    <td className="py-3 px-3 font-mono">{p.phone}</td>
                    <td className="py-3 px-3">{p.city}</td>
                    <td className="py-3 px-3 text-right">₹{(p.creditLimit || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right font-black text-rose-600">
                      {formatIndianCurrency(p.currentBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'commodity' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            जिंस अनुसार स्टॉक व बिक्री रिपोर्ट (Commodity Breakdown)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{prod.name}</h4>
                  <p className="text-xs text-slate-500">{prod.hindiName || prod.category}</p>
                  <p className="text-[11px] text-slate-400 mt-1">HSN: {prod.hsnSac} • भाव: ₹{prod.sellingPrice}/{prod.unit}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-indigo-600 block">
                    {prod.currentStock} {prod.unit}
                  </span>
                  <span className="text-[11px] text-slate-500">{prod.bagCount || 0} बोरी स्टॉक</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
