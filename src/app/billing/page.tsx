'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { getTranslation, t } from '@/lib/translations';
import { formatIndianCurrency, generateWhatsAppReminder, resolveDocType } from '@/lib/gstUtils';
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
  Clock,
  DollarSign,
  CreditCard,
  Building,
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import { Invoice } from '@/lib/types';

export default function InvoicesListPage() {
  const { invoices, company, bankAccounts, recordPayment, deleteInvoice, language } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | 'tax_invoice' | 'quotation_estimate' | 'delivery_challan' | 'credit_note'>('all');

  // Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts[0]?.id || '');
  const [payRef, setPayRef] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  // Filter calculations
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.party.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.party.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'paid'
        ? inv.status === 'paid' || inv.balanceAmount <= 0
        : inv.balanceAmount > 0;

    const invDocType = resolveDocType(inv.docType, inv.invoiceNumber);
    const matchesDocType =
      docTypeFilter === 'all'
        ? true
        : invDocType === docTypeFilter;

    return matchesSearch && matchesStatus && matchesDocType;
  });

  // KPI calculations
  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.finalAmount || 0), 0);
  const totalReceived = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalBalanceDue = invoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0);

  const openPaymentModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.balanceAmount > 0 ? inv.balanceAmount : inv.finalAmount);
    setPayMode('UPI');
    setSelectedBankId(bankAccounts[0]?.id || '');
    setPayRef('');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPaySuccessMsg(null);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const amt = Number(payAmount);
    if (isNaN(amt) || amt <= 0) {
      alert(language === 'hi' ? 'कृपया सही भुगतान राशि दर्ज करें।' : 'Please enter a valid amount.');
      return;
    }

    recordPayment({
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      partyId: selectedInvoice.partyId,
      partyName: selectedInvoice.party.businessName || selectedInvoice.party.name,
      amount: amt,
      date: payDate,
      paymentMode: payMode,
      bankAccountId: payMode === 'Cash' ? undefined : selectedBankId,
      referenceNo: payRef,
      type: 'received',
    });

    const targetDest = payMode === 'Cash' ? 'Cash in Hand (नकद गल्ला)' : (bankAccounts.find(b => b.id === selectedBankId)?.bankName || 'Bank Account');
    setPaySuccessMsg(`✓ भुगतान दर्ज सफल! ₹${amt.toLocaleString('en-IN')} ${targetDest} में जुड़ गए और बिल व खाता बही अपडेट हो गई।`);
    setSelectedInvoice(null);
    setTimeout(() => setPaySuccessMsg(null), 4500);
  };

  const handleWhatsApp = (inv: Invoice) => {
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {paySuccessMsg && (
        <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-lg flex items-center justify-between text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{paySuccessMsg}</span>
          </div>
          <button onClick={() => setPaySuccessMsg(null)} className="p-1 hover:bg-emerald-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-7 h-7 text-indigo-600" />
            {t('billing_title', language)}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'hi' 
              ? 'मंडी बिल बनाएं, पेमेंट स्टेटस चुकता/पेंडिंग बदलें और सीधे बैंक या नकद में हिसाब जोड़ें'
              : 'Create mandi bills, record invoice payments, and track live cash/bank accounting'}
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

      {/* Quick KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {language === 'hi' ? 'कुल बिलिंग राशि' : 'Total Billed Amount'}
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatIndianCurrency(totalBilled)}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {invoices.length} {language === 'hi' ? 'कुल बिल' : 'Total Invoices'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {language === 'hi' ? 'कुल जमा भुगतान' : 'Total Received / Paid'}
            </p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatIndianCurrency(totalReceived)}
            </p>
            <p className="text-[10px] text-emerald-600/80 mt-0.5">
              {invoices.filter(i => i.status === 'paid' || i.balanceAmount <= 0).length} {language === 'hi' ? 'बिल चुकता' : 'Paid Bills'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              {language === 'hi' ? 'कुल बाकी लेना (Pending)' : 'Total Pending Balance'}
            </p>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {formatIndianCurrency(totalBalanceDue)}
            </p>
            <p className="text-[10px] text-rose-600/80 mt-0.5">
              {invoices.filter(i => i.balanceAmount > 0).length} {language === 'hi' ? 'बिल बकाया' : 'Unpaid Bills'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Document Type & Status Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        {/* Document Type Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-500 mr-1">
            {language === 'hi' ? 'दस्तावेज़ प्रकार:' : 'Doc Type:'}
          </span>
          {[
            { id: 'all', label: language === 'hi' ? 'सभी प्रकार (All)' : 'All Documents', count: invoices.length },
            { id: 'tax_invoice', label: language === 'hi' ? '🧾 टैक्स बिल (Invoices)' : 'Tax Invoices', count: invoices.filter(i => resolveDocType(i.docType, i.invoiceNumber) === 'tax_invoice').length },
            { id: 'quotation_estimate', label: language === 'hi' ? '📄 कोटेशन (Estimates)' : 'Quotations', count: invoices.filter(i => resolveDocType(i.docType, i.invoiceNumber) === 'quotation_estimate').length },
            { id: 'delivery_challan', label: language === 'hi' ? '📦 चालान (Challans)' : 'Delivery Challans', count: invoices.filter(i => resolveDocType(i.docType, i.invoiceNumber) === 'delivery_challan').length },
            { id: 'credit_note', label: language === 'hi' ? '🔄 क्रेडिट नोट (Credit Notes)' : 'Credit Notes', count: invoices.filter(i => resolveDocType(i.docType, i.invoiceNumber) === 'credit_note').length },
          ].map((dt) => (
            <button
              key={dt.id}
              onClick={() => setDocTypeFilter(dt.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                docTypeFilter === dt.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <span>{dt.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                docTypeFilter === dt.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200'
              }`}>
                {dt.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search and Payment Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
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
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st === 'all'
                    ? `${t('filter_all_docs', language)} (${invoices.length})`
                    : st === 'unpaid'
                    ? `⚠️ ${t('pending', language)} (${invoices.filter(i => i.balanceAmount > 0).length})`
                    : `✓ ${t('paid', language)} (${invoices.filter(i => i.status === 'paid' || i.balanceAmount <= 0).length})`}
                </button>
              ))}
            </div>
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
                <th className="py-3 px-4 text-right">{language === 'hi' ? 'कुल बिल राशि' : 'Total Bill'}</th>
                <th className="py-3 px-4 text-right text-emerald-700 dark:text-emerald-400">{language === 'hi' ? 'जमा मिला (Paid)' : 'Paid Amount'}</th>
                <th className="py-3 px-4 text-right text-rose-700 dark:text-rose-400">{language === 'hi' ? 'बाकी लेना (Balance)' : 'Balance Due'}</th>
                <th className="py-3 px-4 text-center">{t('status', language)}</th>
                <th className="py-3 px-4 text-right">{language === 'hi' ? 'भुगतान दर्ज / एक्शन' : 'Payment & Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    {language === 'hi' ? 'कोई दस्तावेज़ / बिल नहीं मिला।' : language === 'en' ? 'No documents found.' : 'Koi bill nahi mila.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'paid' || inv.balanceAmount <= 0;
                  const isPartial = (inv.paidAmount || 0) > 0 && inv.balanceAmount > 0;
                  const paidPercent = inv.finalAmount > 0 ? Math.round(((inv.paidAmount || 0) / inv.finalAmount) * 100) : 0;
                  const isCustomPrefix = inv.invoiceNumber.startsWith('EST-') || inv.invoiceNumber.startsWith('DC-') || inv.invoiceNumber.startsWith('CN-') || inv.invoiceNumber.startsWith('#');

                  const effectiveDocType = resolveDocType(inv.docType, inv.invoiceNumber);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition">
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-xs">
                          {isCustomPrefix ? inv.invoiceNumber : `#${inv.invoiceNumber}`}
                        </span>
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 ${
                          effectiveDocType === 'quotation_estimate'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : effectiveDocType === 'delivery_challan'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : effectiveDocType === 'credit_note'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}>
                          {effectiveDocType === 'quotation_estimate'
                            ? (language === 'hi' ? 'कोटेशन / एस्टीमेट' : 'Estimate')
                            : effectiveDocType === 'delivery_challan'
                            ? (language === 'hi' ? 'डिलीवरी चालान' : 'Challan')
                            : effectiveDocType === 'credit_note'
                            ? (language === 'hi' ? 'क्रेडिट नोट' : 'Credit Note')
                            : (language === 'hi' ? 'टैक्स बिल' : 'Tax Invoice')}
                        </span>
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
                        <p className="font-medium">{inv.invoiceDate}</p>
                        <p className="text-[10px] text-slate-400">Due: {inv.dueDate}</p>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatIndianCurrency(inv.finalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {(inv.paidAmount || 0) > 0 ? (
                          <div>
                            <span className="font-bold text-emerald-600">
                              {formatIndianCurrency(inv.paidAmount || 0)}
                            </span>
                            <span className="block text-[9.5px] text-emerald-600 font-semibold">
                              ({paidPercent}% जमा)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">₹0.00</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                        {inv.balanceAmount > 0 ? (
                          <div>
                            <span className="text-rose-600 font-black">{formatIndianCurrency(inv.balanceAmount)}</span>
                            <span className="block text-[9.5px] text-rose-500 font-medium">
                              ({100 - paidPercent}% बाकी)
                            </span>
                          </div>
                        ) : (
                          <span className="text-emerald-600 font-black">₹0.00 (चुकता)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {t('paid', language)}
                          </span>
                        ) : isPartial ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                            <Clock className="w-3 h-3 text-sky-600" />
                            {language === 'hi' ? 'आंशिक (Partial)' : 'Partial'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {t('pending', language)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Record Payment Button */}
                          {!isPaid && (
                            <button
                              onClick={() => openPaymentModal(inv)}
                              title={language === 'hi' ? 'भुगतान दर्ज करें' : 'Record Payment'}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>{language === 'hi' ? 'पेमेंट लें' : 'Pay'}</span>
                            </button>
                          )}

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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Recording Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {language === 'hi' ? 'बिल भुगतान दर्ज करें (Record Payment)' : 'Record Invoice Payment'}
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  बिल #{selectedInvoice.invoiceNumber} • {selectedInvoice.party.businessName || selectedInvoice.party.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              {/* Outstanding Info Box */}
              <div className="bg-slate-50 dark:bg-slate-700/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">{language === 'hi' ? 'कुल बिल राशि' : 'Total Bill'}:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {formatIndianCurrency(selectedInvoice.finalAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">{language === 'hi' ? 'पहले से जमा' : 'Already Paid'}:</span>
                  <span className="font-bold text-emerald-600 text-xs sm:text-sm">
                    {formatIndianCurrency(selectedInvoice.paidAmount || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">{language === 'hi' ? 'वर्तमान बाकी' : 'Balance Due'}:</span>
                  <span className="font-black text-rose-600 text-xs sm:text-sm">
                    {formatIndianCurrency(selectedInvoice.balanceAmount)}
                  </span>
                </div>
              </div>

              {/* Amount Input & Quick Fraction Presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {language === 'hi' ? 'अब भुगतान राशि दर्ज करें (₹ Amount to Receive)' : 'Amount to Receive (₹)'}
                  </label>
                  <span className="text-[10px] text-slate-500">
                    बाकी: ₹{selectedInvoice.balanceAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Quick Fraction Buttons (Half, Full, etc.) */}
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setPayAmount(Math.round(selectedInvoice.balanceAmount / 2))}
                    className="py-1 px-2 text-[10.5px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition text-center"
                  >
                    ½ आधा (50%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmount(Math.round(selectedInvoice.balanceAmount * 0.25))}
                    className="py-1 px-2 text-[10.5px] font-bold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 transition text-center"
                  >
                    ¼ 25%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmount(Math.round(selectedInvoice.balanceAmount * 0.75))}
                    className="py-1 px-2 text-[10.5px] font-bold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 transition text-center"
                  >
                    ¾ 75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmount(selectedInvoice.balanceAmount)}
                    className="py-1 px-2 text-[10.5px] font-bold rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 transition text-center"
                  >
                    ✓ पूरा (100%)
                  </button>
                </div>

                <input
                  type="number"
                  step="any"
                  min="1"
                  max={selectedInvoice.balanceAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  required
                  className="w-full text-base font-bold bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-emerald-500"
                />

                {/* Live Math Subtraction Calculation */}
                {payAmount > 0 && (
                  <div className="mt-2 bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                    <span>
                      इस भुगतान के बाद बाकी बचेगा:
                    </span>
                    <span className="font-black text-xs">
                      {formatIndianCurrency(Math.max(0, selectedInvoice.balanceAmount - Number(payAmount)))}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {language === 'hi' ? 'भुगतान का माध्यम (Payment Mode)' : 'Payment Mode'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['UPI', 'Cash', 'Bank Transfer', 'Cheque'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPayMode(mode)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition text-center ${
                        payMode === mode
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {mode === 'Cash' ? (language === 'hi' ? '💵 नकद' : 'Cash') : mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit Into Account */}
              {payMode !== 'Cash' && bankAccounts.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    {language === 'hi' ? 'जमा बैंक खाता (Deposit Bank Account)' : 'Deposit Bank Account'}
                  </label>
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-emerald-500"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - A/C: {b.accountNumber.slice(-4).padStart(b.accountNumber.length, '*')} (शेष: ₹{b.currentBalance.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reference / UTR Number & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    {language === 'hi' ? 'रेफरेंस / UTR / चेक नं.' : 'Ref / UTR / Cheque No.'}
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. UPI-490219"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    {language === 'hi' ? 'भुगतान दिनांक' : 'Payment Date'}
                  </label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition transform active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'hi' ? 'जमा करें और खाता अपडेट करें' : 'Save & Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

