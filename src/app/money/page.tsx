'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
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
  CreditCard
} from 'lucide-react';

export default function MoneyPage() {
  const { cashInHand, bankAccounts, transactions, addTransaction, addBankAccount } = useAppStore();

  const [showTxModal, setShowTxModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

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
            रोकड़ बही व बैंक खाता (Money & Bank Accounts)
          </h1>
          <p className="text-xs text-slate-500">
            मंडी रोकड़ (Cash In Hand), हम्माली-भाड़ा खर्च, बैंक खाते व फंड ट्रांसफर
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTxModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            + रोकड़ खर्च / आमदनी (Record Tx)
          </button>
        </div>
      </div>

      {/* Top Balances Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Cash in hand */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">दुकान रोकड़ (Cash in Hand)</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatIndianCurrency(cashInHand)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">दुकान की गद्दी पर रोकड़</p>
        </div>

        {/* Bank Total */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">कुल बैंक बैलेंस (All Banks)</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/40">
              <Building2 className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-indigo-600 mt-2">
            {formatIndianCurrency(totalBankBalance)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{bankAccounts.length} बैंक खाते जुड़े हैं</p>
        </div>

        {/* Total Liquidity */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">कुल उपलब्ध नकदी (Total Liquidity)</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-black text-emerald-600 mt-2">
            {formatIndianCurrency(totalNetLiquidity)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">रोकड़ + बैंक राशि</p>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            बैंक खाते (Registered Bank Accounts)
          </h2>
          <button
            onClick={() => setShowBankModal(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            + नया बैंक खाता जोड़ें
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankAccounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-slate-700 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-sky-400">{acc.bankName}</span>
                  {acc.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Primary (बिल पर प्रिंट)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 font-medium mt-1">{acc.accountName}</p>
                <p className="text-lg font-mono font-bold tracking-wider mt-2 text-white">
                  {acc.accountNumber}
                </p>
                <div className="text-[11px] text-slate-400 mt-1 flex gap-4">
                  <span>IFSC: <span className="text-white font-mono">{acc.ifsc}</span></span>
                  <span>UPI: <span className="text-sky-300">{acc.upiId}</span></span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">वर्तमान बैलेंस:</span>
                <span className="text-lg font-black text-white font-mono">
                  {formatIndianCurrency(acc.currentBalance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-indigo-600" />
          रोकड़ व बैंक लेन-देन बही (Transaction Daybook)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-2.5 px-3">तारीख</th>
                <th className="py-2.5 px-3">प्रकार (Type)</th>
                <th className="py-2.5 px-3">कैटेगरी / मद</th>
                <th className="py-2.5 px-3">विवरण / नोट</th>
                <th className="py-2.5 px-3 text-right">राशि (Amount)</th>
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
                          ? 'Cash In'
                          : tx.type === 'bank_deposit'
                          ? 'Bank Deposit'
                          : 'Cash Out / Expense'}
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
      {showTxModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                रोकड़ एंट्री दर्ज करें (Cash / Expense Entry)
              </h3>
              <button onClick={() => setShowTxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  एंट्री का प्रकार
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
                    खर्च (Expense Out)
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
                    आय / आमद (Cash In)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  राशि (Amount in ₹) *
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
                  कैटेगरी चुनें
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                >
                  <option value="मंडी हम्माली व तुलाई">मंडी हम्माली व तुलाई (Labour/Hammali)</option>
                  <option value="भाड़ा व परिवहन (Freight)">भाड़ा व परिवहन (Freight / Gadi Bhada)</option>
                  <option value="बारदान व कट्टा खर्च">बारदान व कट्टा खर्च (Bags / Packaging)</option>
                  <option value="चाय-पानी व नाश्ता">चाय-पानी व नाश्ता (Tea/Snacks)</option>
                  <option value="दुकान किराया व बिजली">दुकान किराया व बिजली (Shop Rent & Power)</option>
                  <option value="मंडी टैक्स व सेस">मंडी टैक्स व सेस (Mandi Cess)</option>
                  <option value="विविध खर्च">विविध खर्च (Miscellaneous)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  विवरण / रिमार्क
                </label>
                <input
                  type="text"
                  placeholder="e.g. 50 बोरी लोडिंग मजदूरी"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                >
                  सुरक्षित करें
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
                नया बैंक खाता जोड़ें (Add Bank Account)
              </h3>
              <button onClick={() => setShowBankModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  बैंक का नाम (e.g. HDFC Bank, SBI) *
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
                    खाता धारक का नाम *
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
                    खाता नंबर (A/C No) *
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
                    IFSC कोड *
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
                  शाखा (Branch Address)
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
                  className="w-1/2 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                >
                  खाता जोड़ें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
