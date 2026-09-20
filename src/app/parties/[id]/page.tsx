'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { getTranslation, t } from '@/lib/translations';
import { formatIndianCurrency, generateWhatsAppReminder } from '@/lib/gstUtils';
import { 
  Users, 
  ArrowLeft, 
  Receipt, 
  Share2, 
  DollarSign, 
  Printer, 
  Calendar,
  Building,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

export default function PartyDetailPage() {
  const params = useParams();
  const partyId = params.id as string;
  const { parties, invoices, payments, company, recordPayment, language } = useAppStore();

  const party = parties.find((p) => p.id === partyId);

  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(party ? party.currentBalance : 0);
  const [payMode, setPayMode] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('Cash');
  const [payRef, setPayRef] = useState('');

  if (!party) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">पार्टी नहीं मिली</h2>
        <Link href="/parties" className="text-xs font-bold text-indigo-600">
          पार्टी सूची पर वापस जाएं
        </Link>
      </div>
    );
  }

  // Combine invoices (Debit) and payments (Credit) into a chronological ledger
  const partyInvoices = invoices.filter((inv) => inv.partyId === party.id);
  const partyPayments = payments.filter((pay) => pay.partyId === party.id);

  const totalBilled = partyInvoices.reduce((sum, i) => sum + i.finalAmount, 0);
  const totalPaid = partyPayments.reduce((sum, p) => sum + p.amount, 0);

  // Build Chronological Ledger Rows
  type LedgerEntry = {
    id: string;
    date: string;
    type: 'invoice' | 'payment';
    ref: string;
    description: string;
    debit: number;
    credit: number;
  };

  const ledgerEntries: LedgerEntry[] = [
    ...partyInvoices.map((inv) => ({
      id: inv.id,
      date: inv.invoiceDate,
      type: 'invoice' as const,
      ref: `Bill #${inv.invoiceNumber}`,
      description: `Tax Invoice (${inv.items.map((i) => i.name).join(', ')})`,
      debit: inv.finalAmount,
      credit: 0,
    })),
    ...partyPayments.map((pay) => ({
      id: pay.id,
      date: pay.date,
      type: 'payment' as const,
      ref: `Pay (${pay.paymentMode})`,
      description: `Payment Received ${pay.referenceNo ? `[Ref: ${pay.referenceNo}]` : ''}`,
      debit: 0,
      credit: pay.amount,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = party.openingBalance || 0;
  const ledgerWithBalance = ledgerEntries.map((entry) => {
    runningBalance = runningBalance + entry.debit - entry.credit;
    return {
      ...entry,
      balance: runningBalance,
    };
  });

  const handleWhatsApp = () => {
    const { url } = generateWhatsAppReminder({
      customerName: party.businessName || party.name,
      businessName: party.businessName || party.name,
      invoiceNumber: 'Ledger Statement',
      amount: party.currentBalance,
      dueDate: 'Due',
      companyName: company.name,
      upiId: company.bankDetails.upiId,
      phone: party.phone,
      lang: 'hi',
    });
    window.open(url, '_blank');
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    recordPayment({
      partyId: party.id,
      partyName: party.businessName || party.name,
      amount: Number(payAmount),
      date: new Date().toISOString().split('T')[0],
      paymentMode: payMode,
      referenceNo: payRef,
      type: 'received',
    });
    setShowPayModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/parties"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {party.businessName || party.name}
            </h1>
            <p className="text-xs text-slate-500">
              {party.name} • {party.city}, {party.state} • Phone: {party.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            {t('print_statement_btn', language)}
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition"
          >
            <Share2 className="w-4 h-4" />
            {t('whatsapp_statement_btn', language)}
          </button>

          <button
            onClick={() => setShowPayModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition"
          >
            <DollarSign className="w-4 h-4" />
            {t('record_payment', language)}
          </button>
        </div>
      </div>

      {/* KPI Cards (Hidden on print) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">
            {language === 'hi' ? 'कुल बिल राशि (Total Debit)' : language === 'en' ? 'Total Invoiced (Debit)' : 'Total Bill Amount (Debit)'}
          </span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatIndianCurrency(totalBilled)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {partyInvoices.length} {language === 'hi' ? 'बिल जारी' : language === 'en' ? 'Invoices Issued' : 'Bills Generated'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">
            {language === 'hi' ? 'कुल जमा भुगतान (Total Credit)' : language === 'en' ? 'Total Payments (Credit)' : 'Total Jama (Credit)'}
          </span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {formatIndianCurrency(totalPaid)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {partyPayments.length} {language === 'hi' ? 'भुगतान दर्ज' : language === 'en' ? 'Payments Recorded' : 'Payments Recorded'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">
            {t('closing_due', language)}
          </span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">
            {formatIndianCurrency(party.currentBalance)}
          </h3>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">
            {party.currentBalance > 0
              ? (language === 'hi' ? 'वसूली बाकी है' : language === 'en' ? 'Outstanding' : 'Vasooli Baaki Hai')
              : (language === 'hi' ? 'खाता चुकता' : language === 'en' ? 'Settled' : 'Khata Barabar')}
          </p>
        </div>
      </div>

      {/* Printable Formal Ledger Statement */}
      <div 
        id="printable-invoice" 
        className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0"
      >
        {/* Statement Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{company.name}</h2>
            <p className="text-xs text-slate-600">{company.address}, {company.city} - {company.pincode}</p>
            <p className="text-xs text-slate-600">GSTIN: {company.gstin} • Mo: {company.phone}</p>
          </div>
          <div className="text-right">
            <span className="bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-slate-300 inline-block mb-1">
              {t('ledger_statement_title', language)}
            </span>
            <p className="text-xs text-slate-600">{t('date', language)}: {new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        {/* Party Info Box */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 grid grid-cols-2 text-xs">
          <div>
            <span className="text-slate-500 font-medium">
              {language === 'hi' ? 'खाता धारक (Account of):' : language === 'en' ? 'Account Holder:' : 'Khata Holder:'}
            </span>
            <p className="font-bold text-sm text-slate-900">{party.businessName || party.name}</p>
            <p className="text-slate-700">{party.billingAddress}, {party.city}</p>
            <p className="text-slate-700 font-mono">GSTIN: {party.gstin || 'Unregistered'}</p>
          </div>
          <div className="text-right space-y-1">
            <p><span className="text-slate-500">{t('phone', language)}:</span> {party.phone}</p>
            <p><span className="text-slate-500">{t('field_opening_balance', language)}:</span> <span className="font-bold">{formatIndianCurrency(party.openingBalance)}</span></p>
            <p><span className="text-slate-500">{t('closing_due', language)}:</span> <span className="font-bold text-rose-600">{formatIndianCurrency(party.currentBalance)}</span></p>
          </div>
        </div>

        {/* Ledger Table */}
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 border-y border-slate-400 text-slate-700 uppercase text-[10px] tracking-wider font-bold">
              <th className="py-2.5 px-3 w-24">{t('col_date', language)}</th>
              <th className="py-2.5 px-3 w-32">{t('col_ref', language)}</th>
              <th className="py-2.5 px-3">{t('col_particulars', language)}</th>
              <th className="py-2.5 px-3 text-right w-28">{t('col_debit', language)}</th>
              <th className="py-2.5 px-3 text-right w-28">{t('col_credit', language)}</th>
              <th className="py-2.5 px-3 text-right w-32">{t('col_balance', language)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {/* Opening Balance Row */}
            <tr className="bg-slate-50/60 font-semibold text-slate-700">
              <td className="py-2 px-3">{party.createdAt.split('T')[0]}</td>
              <td className="py-2 px-3 font-mono">OP-BAL</td>
              <td className="py-2 px-3">{t('field_opening_balance', language)}</td>
              <td className="py-2 px-3 text-right">{party.openingBalance > 0 ? formatIndianCurrency(party.openingBalance) : '-'}</td>
              <td className="py-2 px-3 text-right">-</td>
              <td className="py-2 px-3 text-right font-bold">{formatIndianCurrency(party.openingBalance)}</td>
            </tr>

            {ledgerWithBalance.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  {language === 'hi' ? 'कोई नया लेन-देन दर्ज नहीं है।' : language === 'en' ? 'No transactions found.' : 'Koi naya transaction nahi hai.'}
                </td>
              </tr>
            ) : (
              ledgerWithBalance.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono text-slate-600">{row.date}</td>
                  <td className="py-2.5 px-3 font-bold font-mono text-indigo-700">{row.ref}</td>
                  <td className="py-2.5 px-3 text-slate-800">{row.description}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                    {row.debit > 0 ? formatIndianCurrency(row.debit) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                    {row.credit > 0 ? formatIndianCurrency(row.credit) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    {formatIndianCurrency(row.balance)}
                  </td>
                </tr>
              ))
            )}

            {/* Total Summary Row */}
            <tr className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
              <td colSpan={3} className="py-2.5 px-3 text-right uppercase">
                {language === 'hi' ? 'कुल योग (Total):' : language === 'en' ? 'Total Summary:' : 'Total Yog:'}
              </td>
              <td className="py-2.5 px-3 text-right font-bold">
                {formatIndianCurrency(totalBilled + party.openingBalance)}
              </td>
              <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                {formatIndianCurrency(totalPaid)}
              </td>
              <td className="py-2.5 px-3 text-right font-black text-rose-600 text-sm">
                {formatIndianCurrency(party.currentBalance)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer Signatures */}
        <div className="mt-8 pt-6 border-t border-slate-300 flex justify-between items-end text-xs text-slate-700">
          <div>
            <p>• {language === 'hi' ? 'कृपया शेष राशि का मिलान कर लें।' : language === 'en' ? 'Please verify your statement balance.' : 'Kripya balance ka milan kar lein.'}</p>
            <p>• {language === 'hi' ? 'किसी भी त्रुटि की सूचना 7 दिनों के भीतर दें।' : language === 'en' ? 'Report any discrepancies within 7 days.' : 'Kisi bhi truti ki soochna 7 dino me dein.'}</p>
          </div>
          <div className="text-center">
            <p className="font-bold">For {company.name}</p>
            <div className="h-10"></div>
            <p className="border-t border-slate-400 px-6 pt-1">
              {language === 'hi' ? 'अधिकृत हस्ताक्षर (Authorised)' : language === 'en' ? 'Authorised Signatory' : 'Authorised Signature'}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Entry Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t('payment_modal_title', language)}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {party.businessName} • {t('closing_due', language)}: {formatIndianCurrency(party.currentBalance)}
            </p>

            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('field_paid_amount', language)} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full text-base font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('field_payment_mode', language)}
                </label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                >
                  <option value="Cash">{t('mode_cash', language)}</option>
                  <option value="UPI">{t('mode_upi', language)}</option>
                  <option value="Bank Transfer">{t('mode_bank', language)}</option>
                  <option value="Cheque">{t('mode_cheque', language)}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('notes', language)}
                </label>
                <input
                  type="text"
                  placeholder="Optional reference / UTR"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                >
                  {t('save', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}