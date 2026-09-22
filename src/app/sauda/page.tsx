'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { MandiSaudaSlip } from '@/lib/types';
import { getTranslation, t } from '@/lib/translations';
import { formatIndianCurrency } from '@/lib/gstUtils';
import { 
  ScrollText, 
  Plus, 
  Search, 
  Printer, 
  ArrowRight, 
  Wheat, 
  Scale, 
  Receipt,
  X,
  CheckCircle2, 
  Calendar
} from 'lucide-react';
import { MandiBhugtanSlip } from '@/components/invoices/MandiBhugtanSlip';

export default function SaudaParchaPage() {
  const router = useRouter();
  const { saudaSlips, parties, products, company, addSaudaSlip, language } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<MandiSaudaSlip | null>(null);

  // Form State
  const [partyName, setPartyName] = useState(parties[0]?.businessName || 'KUNDAN');
  const [sellerFatherName, setSellerFatherName] = useState('MUKESH RATHORE');
  const [village, setVillage] = useState('BISALWASKALA');
  const [partyPhone, setPartyPhone] = useState(parties[0]?.phone || '9993782187');
  const [anubandhNo, setAnubandhNo] = useState('2051/97');
  const [tulaiNo, setTulaiNo] = useState('');
  const [entryPassNo, setEntryPassNo] = useState('');
  const [aadharNo, setAadharNo] = useState('');
  const [commodity, setCommodity] = useState(products[0]?.name || 'ISABGOL');
  const [bags, setBags] = useState<number>(17);
  const [bagWeightKg, setBagWeightKg] = useState<number>(60);
  const [kattaWeightKg, setKattaWeightKg] = useState<number>(17);
  const [grossWeightKg, setGrossWeightKg] = useState<number>(1054);
  const [tareWeightKg, setTareWeightKg] = useState<number>(17); // 1kg per bag tare
  const [ratePerQuintal, setRatePerQuintal] = useState<number>(12050);
  const [katotiAmount, setKatotiAmount] = useState<number>(0);
  const [hammaliAmount, setHammaliAmount] = useState<number>(162);
  const [paymentMode, setPaymentMode] = useState<string>('NEFT');
  const [bankIfsc, setBankIfsc] = useState<string>('HDFC0000624');
  const [bankAccountNo, setBankAccountNo] = useState<string>('50100757992379');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const netWeightKg = Math.max(0, grossWeightKg - tareWeightKg);
  const netWeightQuintal = netWeightKg / 100;
  const grossAmount = (netWeightQuintal * ratePerQuintal);
  const netPayable = Math.max(0, grossAmount - katotiAmount - hammaliAmount);

  const handleCreateSlip = (e: React.FormEvent) => {
    e.preventDefault();
    const saudaNumber = '0-' + (saudaSlips.length + 20340);
    const newSlip = addSaudaSlip({
      saudaNumber,
      date: new Date().toISOString().split('T')[0],
      partyName,
      sellerFatherName,
      village,
      partyPhone,
      anubandhNo,
      tulaiNo,
      entryPassNo,
      aadharNo,
      commodity,
      bags: Number(bags),
      bagWeightKg: Number(bagWeightKg),
      kattaWeightKg: Number(kattaWeightKg),
      netWeightQuintal: Number(netWeightQuintal.toFixed(3)),
      ratePerQuintal: Number(ratePerQuintal),
      totalAmount: Number(grossAmount.toFixed(2)),
      katotiAmount: Number(katotiAmount),
      hammaliAmount: Number(hammaliAmount),
      netPayable: Number(netPayable.toFixed(2)),
      paymentMode,
      bankIfsc,
      bankAccountNo,
      bankPayAmount: paymentMode === 'Cash' ? 0 : Number(netPayable.toFixed(2)),
      cashPayAmount: paymentMode === 'Cash' ? Number(netPayable.toFixed(2)) : 0,
      isPaid: true,
      status: 'pending',
    });

    setShowAddModal(false);
    setSelectedSlipForPrint(newSlip);
  };

  const convertToInvoice = (slip: MandiSaudaSlip) => {
    // Route to new billing with query params
    const matchedParty = parties.find((p) => p.businessName === slip.partyName || p.name === slip.partyName) || parties[0];
    router.push('/billing/new');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ScrollText className="w-7 h-7 text-amber-500" />
            {t('sauda_title', language)}
          </h1>
          <p className="text-xs text-slate-500">
            {t('sauda_subtitle', language)}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('btn_new_sauda', language)}
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">
            {language === 'hi' ? 'कुल सौदा पर्चे' : language === 'en' ? 'Total Sauda Slips' : 'Total Sauda Parche'}
          </span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {saudaSlips.length} <span className="text-xs font-medium text-slate-400">{language === 'hi' ? 'पर्चे' : 'Slips'}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'hi' ? 'मंडी यार्ड नीलाम व खरीद' : language === 'en' ? 'Mandi yard trades' : 'Mandi yard trades'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">
            {t('card_total_bags', language)}
          </span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">
            {saudaSlips.reduce((sum, s) => sum + s.bags, 0)} <span className="text-xs font-medium text-slate-400">{t('bags_count', language)}</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'hi' ? 'नीलामी में खरीदी गई' : language === 'en' ? 'Purchased in auction' : 'Nilami me kharidi gayi'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">
            {t('col_net_payable', language)}
          </span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {formatIndianCurrency(saudaSlips.reduce((sum, s) => sum + s.netPayable, 0))}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {language === 'hi' ? 'कटौती पश्चात शुद्ध देय' : language === 'en' ? 'Net after deductions' : 'Katoti baad shuddh deya'}
          </p>
        </div>
      </div>

      {/* Slips Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-4">{t('sauda_slip_no', language)}</th>
                <th className="py-3 px-4">{t('date', language)}</th>
                <th className="py-3 px-4">{t('col_party', language)}</th>
                <th className="py-3 px-4">{t('col_commodity', language)}</th>
                <th className="py-3 px-4 text-center">{t('bags_count', language)}</th>
                <th className="py-3 px-4 text-right">{t('net_weight_qtl', language)}</th>
                <th className="py-3 px-4 text-right">{t('col_bhaav', language)}</th>
                <th className="py-3 px-4 text-right">{t('katoti_other_charges', language)}</th>
                <th className="py-3 px-4 text-right">{t('col_net_payable', language)}</th>
                <th className="py-3 px-4 text-right">{t('actions', language)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {saudaSlips.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Scale className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
                    {language === 'hi' ? 'कोई सौदा पर्चा अभी नहीं बनाया गया है।' : language === 'en' ? 'No sauda slips created yet.' : 'Koi sauda parcha nahi banaya gaya hai.'}
                  </td>
                </tr>
              ) : (
                saudaSlips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="py-3 px-4 font-bold font-mono text-amber-600">
                      {slip.saudaNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {slip.date}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{slip.partyName}</p>
                      <p className="text-[10px] text-slate-500">{slip.partyPhone}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {slip.commodity}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {slip.bags}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {slip.netWeightQuintal} Qtl
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-600">
                      ₹{slip.ratePerQuintal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-600 font-medium">
                      - ₹{(slip.katotiAmount + slip.hammaliAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                      {formatIndianCurrency(slip.netPayable)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSlipForPrint(slip)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white font-bold text-[11px] transition"
                        >
                          <Printer className="w-3 h-3 inline mr-1" />
                          {t('print', language)}
                        </button>
                        <button
                          onClick={() => convertToInvoice(slip)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          {t('convert_to_invoice', language)}
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-500" />
                {t('create_sauda_title', language)}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlip} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('party_farmer_name', language)}
                  </label>
                  <input
                    type="text"
                    required
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('phone', language)}
                  </label>
                  <input
                    type="text"
                    value={partyPhone}
                    onChange={(e) => setPartyPhone(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('col_commodity', language)} *
                  </label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} {p.hindiName && language !== 'en' ? `(${p.hindiName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('bags_count', language)} *
                  </label>
                  <input
                    type="number"
                    required
                    value={bags}
                    onChange={(e) => {
                      const b = Number(e.target.value);
                      setBags(b);
                      setTareWeightKg(b * 1); // 1kg tare per bag
                      setHammaliAmount(b * 20);
                    }}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              {/* Weight & Rate Grid */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('gross_weight', language)} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={grossWeightKg}
                    onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-white dark:bg-slate-700 dark:text-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('tare_weight', language)}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={tareWeightKg}
                    onChange={(e) => setTareWeightKg(Number(e.target.value))}
                    className="w-full text-xs bg-white dark:bg-slate-700 dark:text-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('net_weight_qtl', language)}
                  </label>
                  <div className="text-xs font-black text-slate-900 dark:text-white pt-2">
                    {netWeightQuintal.toFixed(2)} Qtl
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('col_bhaav', language)} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ratePerQuintal}
                    onChange={(e) => setRatePerQuintal(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('katoti_amount_label', language)}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={katotiAmount}
                    onChange={(e) => setKatotiAmount(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('hammali_amount_label', language)}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={hammaliAmount}
                    onChange={(e) => setHammaliAmount(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              {/* Collapsible Bhugtan Patrak Details */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/50 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <span className="flex items-center gap-1.5">
                    📜 || भुगतान पत्रक / किसान व बैंक विवरण ||
                  </span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                    {showAdvanced ? 'कम दिखाएं ▲' : 'विवरण भरें ▼'}
                  </span>
                </button>

                {showAdvanced && (
                  <div className="p-3 bg-white dark:bg-slate-800 space-y-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          पिता का नाम (S/O):
                        </label>
                        <input
                          type="text"
                          value={sellerFatherName}
                          onChange={(e) => setSellerFatherName(e.target.value)}
                          placeholder="MUKESH RATHORE"
                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          गांव / स्थान (Village):
                        </label>
                        <input
                          type="text"
                          value={village}
                          onChange={(e) => setVillage(e.target.value)}
                          placeholder="BISALWASKALA"
                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          अनुबंध क्र. (Anubandh):
                        </label>
                        <input
                          type="text"
                          value={anubandhNo}
                          onChange={(e) => setAnubandhNo(e.target.value)}
                          placeholder="2051/97"
                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          तौल क्र. (T.No.):
                        </label>
                        <input
                          type="text"
                          value={tulaiNo}
                          onChange={(e) => setTulaiNo(e.target.value)}
                          placeholder="T-41"
                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          गेट प्रवेश पर्ची (Entry Pno):
                        </label>
                        <input
                          type="text"
                          value={entryPassNo}
                          onChange={(e) => setEntryPassNo(e.target.value)}
                          placeholder="E-882"
                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-100 dark:border-slate-700">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          भुगतान माध्यम (Mode):
                        </label>
                        <select
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs font-bold"
                        >
                          <option value="NEFT">NEFT (बैंक)</option>
                          <option value="Cash">Cash (नकद)</option>
                          <option value="RTGS">RTGS</option>
                          <option value="UPI">UPI / PhonePe</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          IFSC कोड:
                        </label>
                        <input
                          type="text"
                          value={bankIfsc}
                          onChange={(e) => setBankIfsc(e.target.value)}
                          placeholder="HDFC0000624"
                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          बैंक खाता क्र. (A/C No.):
                        </label>
                        <input
                          type="text"
                          value={bankAccountNo}
                          onChange={(e) => setBankAccountNo(e.target.value)}
                          placeholder="50100757992379"
                          className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Net Payable Summary */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">
                    {language === 'hi' ? 'कटौती पश्चात शुद्ध देय राशि:' : language === 'en' ? 'Net Payable After Deductions:' : 'Katoti Baad Shuddh Rashi:'}
                  </span>
                  <p className="text-xs text-slate-300">
                    {bags} {language === 'hi' ? 'बोरी' : language === 'en' ? 'Bags' : 'Bori'} • {netWeightQuintal.toFixed(2)} {language === 'hi' ? 'क्विंटल' : 'Qtl'} @ ₹{ratePerQuintal}/Qtl
                  </p>
                </div>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {formatIndianCurrency(netPayable)}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition"
                >
                  {t('save_sauda_btn', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Slip Preview Modal - Authentic Mandi Bhugtan Patrak */}
      {selectedSlipForPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-300 max-h-[92vh] overflow-y-auto flex flex-col items-center p-3 sm:p-5">
            <div className="w-full flex justify-between items-center pb-2 mb-2 border-b border-gray-200 no-print">
              <span className="text-xs font-bold text-slate-700">
                || भुगतान पत्रक प्रपत्र IV 17(4) ||
              </span>
              <button
                onClick={() => setSelectedSlipForPrint(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Authentic Mandi Bhugtan Patrak Component */}
            <div id="printable-invoice" className="w-full">
              <MandiBhugtanSlip slip={selectedSlipForPrint} company={company} />
            </div>

            <div className="flex gap-2 pt-4 w-full no-print">
              <button
                onClick={() => setSelectedSlipForPrint(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                {t('btn_close', language)}
              </button>
              <button
                onClick={() => window.print()}
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                {t('btn_print_slip', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}