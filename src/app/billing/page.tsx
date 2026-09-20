'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { getTranslation, t } from '@/lib/translations';
import { formatIndianCurrency, generateWhatsAppReminder } from '@/lib/gstUtils';
import { 
  Receipt, 
  Plus, 
  Search, 
  Share2, 
  Printer, 
  Eye, 
  Trash2, 
  FileText,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function InvoicesListPage() {
  const { invoices, company, deleteInvoice, language } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.party.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.party.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'paid'
        ? inv.status === 'paid'
        : statusFilter === 'unpaid'
        ? inv.balanceAmount > 0
        : inv.status === 'overdue';

    return matchesSearch && matchesStatus;
  });

  const handleWhatsApp = (inv: typeof invoices[0]) => {
    const { url } = generateWhatsAppReminder({
      customerName: inv.party.businessName || inv.party.name,
      businessName: inv.party.businessName || inv.party.name,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.balanceAmount > 0 ? inv.balanceAmount : inv.finalAmount,
      dueDate: inv.dueDate,
      companyName: company.name,
      upiId: company.bankDetails.upiId,
      phone: inv.party.phone,
      lang: language === 'en' ? 'en' : 'hi',
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-7 h-7 text-indigo-600" />
            {t('billing_title', language)}
          </h1>
          <p className="text-xs text-slate-500">
            {t('billing_subtitle', language)}
          </p>
        </div>

        <Link
          href="/billing/new"
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('new_bill_btn', language)}
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search_placeholder', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
            {(['all', 'unpaid', 'paid'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg capitalize transition ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {st === 'all'
                  ? t('filter_all_docs', language)
                  : st === 'unpaid'
                  ? t('pending', language)
                  : t('paid', language)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">{t('col_bill_no', language)}</th>
                <th className="py-3 px-4">{t('col_party', language)}</th>
                <th className="py-3 px-4">{t('invoice_date', language)}</th>
                <th className="py-3 px-4">{t('due_date', language)}</th>
                <th className="py-3 px-4 text-right">{t('taxable_subtotal', language)}</th>
                <th className="py-3 px-4 text-right">{t('col_total_amount', language)}</th>
                <th className="py-3 px-4 text-right">{t('balance_to_receive', language)}</th>
                <th className="py-3 px-4 text-center">{t('status', language)}</th>
                <th className="py-3 px-4 text-right">{t('actions', language)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    {language === 'hi' ? 'कोई बिल नहीं मिला।' : language === 'en' ? 'No invoices found.' : 'Koi bill nahi mila.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition">
                    <td className="py-3.5 px-4 font-bold font-mono text-indigo-600">
                      #{inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {inv.party.businessName || inv.party.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {inv.party.city} • GST: {inv.party.gstin || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {inv.invoiceDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {inv.dueDate}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                      ₹{inv.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatIndianCurrency(inv.finalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600 whitespace-nowrap">
                      {inv.balanceAmount > 0 ? formatIndianCurrency(inv.balanceAmount) : '₹0.00'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {inv.status === 'paid' ? (
                          <><CheckCircle2 className="w-3 h-3" /> {t('paid', language)}</>
                        ) : (
                          <><Clock className="w-3 h-3" /> {t('pending', language)}</>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleWhatsApp(inv)}
                          title={t('whatsapp_reminder', language)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/billing/${inv.id}`}
                          title={t('view', language)}
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(t('confirm_delete', language))) {
                              deleteInvoice(inv.id);
                            }
                          }}
                          title={t('delete', language)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
