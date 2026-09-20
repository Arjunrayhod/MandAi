'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getTranslation, t } from '@/lib/translations';
import { formatIndianCurrency } from '@/lib/gstUtils';
import { 
  Wallet, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  ArrowRightLeft, 
  DollarSign, 
  Receipt, 
  Calendar,
  X,
  CreditCard,
  Trash2,
  Star,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function MoneyPage() {
  const { 
    cashInHand, 
    bankAccounts, 
    transactions, 
    addTransaction, 
    addBankAccount, 
    deleteBankAccount,
    setDefaultBankAccount,
    language 
  } = useAppStore();

  const [showTxModal, setShowTxModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [deletingBankId, setDeletingBankId] = useState<string | null>(null);

  // Tx Form
  const [txType, setTxType] = useState<'income' | 'expense' | 'bank_deposit' | 'bank_withdrawal'>('expense');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txCategory, setTxCategory] = useState<string>('मंडी हम्माली व तुलाई');
  const [txDesc, setTxDesc] = useState<string>('');
  const [txBankId, setTxBankId] = useState<string>(bankAccounts[0]?.id || '');

  // Bank Form
  const [bankFormData, setBankFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    ifsc: '',
    branch: '',
    upiId: '',
    openingBalance: 0,
  });

  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);
  const totalNetLiquidity = cashInHand + totalBankBalance;

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      type: txType,
      amount: Number(txAmount),
      date: new Date().toISOString().split('T')[0],
      category: txCategory,
      description: txDesc || txCategory,
      bankAccountId: txBankId,
    });
    setShowTxModal(false);
    setTxAmount(0);
    setTxDesc('');
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBankAccount({
      ...bankFormData,
      openingBalance: Number(bankFormData.openingBalance || 0),
      currentBalance: Number(bankFormData.openingBalance || 0),
      isDefault: bankAccounts.length === 0,
    });
    setShowBankModal(false);
    setBankFormData({
      bankName: '',
      accountName: '',
      accountNumber: '',
      ifsc: '',
      branch: '',
      upiId: '',
      openingBalance: 0,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-7 h-7 text-indigo-600" />
            {t('money_title', language)}
          </h1>
          <p className="text-xs text-slate-500">
            {t('money_subtitle', language)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTxModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t('record_tx', language)}
          </button>
        </div>
      </div>

      {/* Top Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Cash in hand */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('cash_in_hand', language)}</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatIndianCurrency(cashInHand)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'hi' ? 'दुकान की गद्दी पर रोकड़' : language === 'en' ? 'Physical cash in shop' : 'Dukaan ki rokad'}
          </p>
        </div>

        {/* Bank Total */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('bank_balance', language)}</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40">
              <Building2 className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-indigo-600 mt-2">
            {formatIndianCurrency(totalBankBalance)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{bankAccounts.length} {language === 'hi' ? 'बैंक खाते जुड़े हैं' : language === 'en' ? 'Bank accounts linked' : 'Bank accounts linked'}</p>
        </div>

        {/* Total Liquidity */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {language === 'hi' ? 'कुल उपलब्ध नकदी' : language === 'en' ? 'Total Net Liquidity' : 'Total Net Cash'}
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-emerald-600 mt-2">
            {formatIndianCurrency(totalNetLiquidity)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'hi' ? 'रोकड़ + बैंक राशि' : language === 'en' ? 'Cash + Bank accounts' : 'Rokad + Bank balance'}
          </p>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            {t('bank_accounts', language)}
          </h2>
          <button
            onClick={() => setShowBankModal(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            {t('btn_add_bank', language)}
          </button>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {language === 'hi' ? 'कोई बैंक खाता नहीं है' : 'No Bank Accounts Added'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {language === 'hi' 
                ? 'बिल पर बैंक विवरण व क्यूआर कोड प्रिंट करने के लिए नया बैंक खाता जोड़ें।'
                : 'Add a bank account to enable bank transfers and UPI QR printing on invoices.'}
            </p>
            <button
              onClick={() => setShowBankModal(true)}
              className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              {t('btn_add_bank', language)}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-slate-700 flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-sky-400" />
                      {acc.bankName}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {acc.isDefault ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {language === 'hi' ? 'Primary (बिल प्रिंट)' : 'Primary'}
                        </span>
                      ) : (
                        <button
                          onClick={() => setDefaultBankAccount(acc.id)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 border border-indigo-500/30 transition"
                          title="इस खाते को बिल पर प्रिंट करने हेतु Primary बनाएं"
                        >
                          {language === 'hi' ? 'Primary बनाएं' : 'Make Primary'}
                        </button>
                      )}

                      {/* Delete Bank Account Button */}
                      <button
                        onClick={() => setDeletingBankId(acc.id)}
                        className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 border border-rose-500/20 transition"
                        title={language === 'hi' ? 'यह बैंक खाता हटाएं (Remove Account)' : 'Remove Bank Account'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-medium mt-2">{acc.accountName}</p>
                  <p className="text-lg font-mono font-bold tracking-wider mt-1 text-white">
                    {acc.accountNumber}
                  </p>
                  <div className="text-[11px] text-slate-400 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    <span>IFSC: <span className="text-white font-mono font-semibold">{acc.ifsc}</span></span>
                    {acc.upiId && <span>UPI: <span className="text-sky-300 font-medium">{acc.upiId}</span></span>}
                  </div>
                  {acc.branch && (
                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                      📍 {acc.branch}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{t('closing_due', language)}:</span>
                  <span className="text-lg font-black text-white font-mono">
                    {formatIndianCurrency(acc.currentBalance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-indigo-600" />
          {t('daybook', language)}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-2.5 px-3">{t('col_date', language)}</th>
                <th className="py-2.5 px-3">{t('col_tx_type', language)}</th>
                <th className="py-2.5 px-3">{language === 'hi' ? 'कैटेगरी / मद' : language === 'en' ? 'Category' : 'Category'}</th>
                <th className="py-2.5 px-3">{t('col_particulars', language)}</th>
                <th className="py-2.5 px-3 text-right">{t('col_amount', language)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {transactions.map((tx) => {
                const isPositive = tx.type === 'income' || tx.type === 'cash_in' || tx.type === 'bank_deposit';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isPositive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isPositive ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {tx.type === 'income' || tx.type === 'cash_in'
                          ? (language === 'hi' ? 'आवक' : 'Cash In')
                          : tx.type === 'bank_deposit'
                          ? (language === 'hi' ? 'बैंक जमा' : 'Bank Deposit')
                          : (language === 'hi' ? 'जावक / खर्च' : 'Cash Out')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {tx.category}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {tx.description}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold text-sm whitespace-nowrap ${
                      isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {isPositive ? '+' : '-'} {formatIndianCurrency(tx.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tx Modal */}
      {/* Add Tx Modal */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('modal_cash_entry_title', language)}
              </h3>
              <button onClick={() => setShowTxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('entry_type', language)}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxType('expense')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      txType === 'expense'
                        ? 'bg-rose-100 border-rose-400 text-rose-700'
                        : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    {t('expense_out', language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('income')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      txType === 'income'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
                        : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    {t('income_in', language)}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('amount_label', language)}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="₹ 1,500"
                  value={txAmount || ''}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  className="w-full text-base font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('select_category', language)}
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                >
                  <option value="मंडी हम्माली व तुलाई">{language === 'hi' ? 'मंडी हम्माली व तुलाई' : language === 'en' ? 'Labour / Hammali' : 'Hammali & Tulai'}</option>
                  <option value="भाड़ा व परिवहन (Freight)">{language === 'hi' ? 'भाड़ा व परिवहन (गाड़ी भाड़ा)' : language === 'en' ? 'Freight & Transportation' : 'Gadi Bhada & Freight'}</option>
                  <option value="बारदान व कट्टा खर्च">{language === 'hi' ? 'बारदान व कट्टा खर्च' : language === 'en' ? 'Bags & Packaging' : 'Bardan & Packaging'}</option>
                  <option value="चाय-पानी व नाश्ता">{language === 'hi' ? 'चाय-पानी व नाश्ता' : language === 'en' ? 'Tea & Refreshments' : 'Chai-Pani & Snacks'}</option>
                  <option value="दुकान किराया व बिजली">{language === 'hi' ? 'दुकान किराया व बिजली' : language === 'en' ? 'Shop Rent & Electricity' : 'Shop Rent & Electricity'}</option>
                  <option value="मंडी टैक्स व सेस">{language === 'hi' ? 'मंडी टैक्स व सेस' : language === 'en' ? 'Mandi Tax & Cess' : 'Mandi Tax & Cess'}</option>
                  <option value="विविध खर्च">{language === 'hi' ? 'विविध खर्च' : language === 'en' ? 'Miscellaneous Expenses' : 'Vividh Kharch'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('description_remark', language)}
                </label>
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'उदा. 50 बोरी लोडिंग मजदूरी' : language === 'en' ? 'e.g. 50 Bags loading labour' : 'e.g. 50 Bori loading hammali'}
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                >
                  {t('save', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('add_bank_account_title', language)}
              </h3>
              <button onClick={() => setShowBankModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('bank_name_label', language)}
                </label>
                <input
                  type="text"
                  required
                  placeholder="HDFC Bank"
                  value={bankFormData.bankName}
                  onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('account_holder_name', language)}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="RATHORE TRADING CO."
                    value={bankFormData.accountName}
                    onChange={(e) => setBankFormData({ ...bankFormData, accountName: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('account_number_label', language)}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="50200098211151"
                    value={bankFormData.accountNumber}
                    onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })}
                    className="w-full text-xs font-mono font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('ifsc_code_label', language)}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="HDFC0000624"
                    value={bankFormData.ifsc}
                    onChange={(e) => setBankFormData({ ...bankFormData, ifsc: e.target.value.toUpperCase() })}
                    className="w-full text-xs font-mono uppercase bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    UPI ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="9340829951@hdfcbank"
                    value={bankFormData.upiId}
                    onChange={(e) => setBankFormData({ ...bankFormData, upiId: e.target.value })}
                    className="w-full text-xs text-indigo-600 font-medium bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('branch_address_label', language)}
                </label>
                <input
                  type="text"
                  placeholder="Vijay talkies compound neemuch 458441"
                  value={bankFormData.branch}
                  onChange={(e) => setBankFormData({ ...bankFormData, branch: e.target.value })}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                >
                  {t('btn_add_account', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Bank Confirmation Modal */}
      {deletingBankId && (() => {
        const targetBank = bankAccounts.find(b => b.id === deletingBankId);
        if (!targetBank) return null;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'hi' ? 'बैंक खाता हटाएं (Remove Bank Account)' : 'Remove Bank Account'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'hi' ? 'क्या आप इस बैंक खाते को हटाना चाहते हैं?' : 'Are you sure you want to delete this bank account?'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-600 mb-5">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{targetBank.bankName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300 font-mono mt-0.5">A/C: {targetBank.accountNumber}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300 font-mono">IFSC: {targetBank.ifsc}</p>
                {targetBank.isDefault && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2">
                    ⚠️ {language === 'hi' ? 'नोट: यह खाता वर्तमान में बिल प्रिंट हेतु Primary खाता है।' : 'Note: This account is currently set as Primary for billing.'}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingBankId(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteBankAccount(deletingBankId);
                    setDeletingBankId(null);
                  }}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  {language === 'hi' ? 'हाँ, खाता हटाएं' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
