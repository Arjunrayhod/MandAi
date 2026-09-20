'use client';

import React, { useState } from 'react';
import { Invoice, CompanyProfile } from '@/lib/types';
import { generateWhatsAppReminder } from '@/lib/gstUtils';
import { useAppStore } from '@/lib/store';
import { getTranslation } from '@/lib/translations';
import { Printer, Share2, DollarSign, Download, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  invoice: Invoice;
  company: CompanyProfile;
  currentTemplate: string;
  onTemplateChange: (template: string) => void;
}

export const InvoicePrintActions: React.FC<Props> = ({
  invoice,
  company,
  currentTemplate,
  onTemplateChange,
}) => {
  const { recordPayment, language } = useAppStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState(invoice.balanceAmount);
  const [payMode, setPayMode] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('Cash');
  const [payRef, setPayRef] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = (lang: 'hi' | 'en') => {
    const { url } = generateWhatsAppReminder({
      customerName: invoice.party.businessName || invoice.party.name,
      businessName: invoice.party.businessName || invoice.party.name,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.balanceAmount > 0 ? invoice.balanceAmount : invoice.finalAmount,
      dueDate: invoice.dueDate,
      companyName: company.name,
      upiId: company.bankDetails.upiId,
      phone: invoice.party.phone,
      lang,
    });
    window.open(url, '_blank');
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    recordPayment({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      partyId: invoice.partyId,
      partyName: invoice.party.businessName || invoice.party.name,
      amount: Number(payAmount),
      date: new Date().toISOString().split('T')[0],
      paymentMode: payMode,
      referenceNo: payRef,
      type: 'received',
    });
    setPaySuccess(true);
    setTimeout(() => {
      setPaySuccess(false);
      setShowPaymentModal(false);
    }, 1200);
  };

  return (
    <>
      {/* Top Action Bar (hidden on print) */}
      <div className="print:hidden bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/billing"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {getTranslation('back_to_invoices_btn', language)}
          </Link>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
          
          {/* Template Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">{getTranslation('design_template_label', language)}</span>
            <select
              value={currentTemplate}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-indigo-500"
            >
              <option value="classic_rathore">Classic Mandi GST (Rathore Trading)</option>
              <option value="modern_mandi">Modern Vyapar Indigo</option>
              <option value="thermal_pos">Thermal 80mm POS Slip</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* WhatsApp Share */}
          <div className="relative group">
            <button
              onClick={() => handleWhatsApp(language === 'en' ? 'en' : 'hi')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              {getTranslation('whatsapp_reminder', language)}
            </button>
          </div>

          {/* Receive Payment */}
          {invoice.balanceAmount > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-xs"
            >
              <DollarSign className="w-4 h-4" />
              {getTranslation('record_payment_btn_text', language)}
            </button>
          )}

          {/* Print / Save PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            {getTranslation('print_save_pdf_text', language)}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {getTranslation('payment_modal_heading', language)}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              #{invoice.invoiceNumber} • {invoice.party.businessName} • {getTranslation('closing_due', language)}: ₹{invoice.balanceAmount.toFixed(2)}
            </p>

            {paySuccess ? (
              <div className="py-8 text-center text-emerald-600 space-y-2">
                <CheckCircle className="w-12 h-12 mx-auto" />
                <p className="font-bold text-base">{getTranslation('payment_recorded_success_msg', language)}</p>
              </div>
            ) : (
              <form onSubmit={submitPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {getTranslation('payment_amount_label', language)}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    max={invoice.balanceAmount}
                    className="w-full text-base font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {getTranslation('payment_mode_dropdown', language)}
                    </label>
                    <select
                      value={payMode}
                      onChange={(e) => setPayMode(e.target.value as any)}
                      className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Cash">{getTranslation('mode_cash', language)}</option>
                      <option value="UPI">{getTranslation('mode_upi', language)}</option>
                      <option value="Bank Transfer">{getTranslation('mode_bank', language)}</option>
                      <option value="Cheque">{getTranslation('mode_cheque', language)}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {getTranslation('payment_ref_label', language)}
                    </label>
                    <input
                      type="text"
                      placeholder="Optional ref"
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    {getTranslation('cancel_action', language)}
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    {getTranslation('confirm_action', language)}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

