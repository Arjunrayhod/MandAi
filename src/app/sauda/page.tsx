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

export default function SaudaParchaPage() {
  const router = useRouter();
  const { saudaSlips, parties, products, company, addSaudaSlip, language } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<MandiSaudaSlip | null>(null);

  // Form State
  const [partyName, setPartyName] = useState(parties[0]?.businessName || 'M/s Raj And Company');
  const [partyPhone, setPartyPhone] = useState(parties[0]?.phone || '9826012345');
  const [commodity, setCommodity] = useState(products[0]?.name || 'Musakadana');
  const [bags, setBags] = useState<number>(44);
  const [grossWeightKg, setGrossWeightKg] = useState<number>(2244);
  const [tareWeightKg, setTareWeightKg] = useState<number>(44); // 1kg per bag tare
  const [ratePerQuintal, setRatePerQuintal] = useState<number>(21500); // 215/kg = 21500/quintal
  const [katotiAmount, setKatotiAmount] = useState<number>(1760);
  const [hammaliAmount, setHammaliAmount] = useState<number>(880); // 20 rs per bag

  const netWeightKg = Math.max(0, grossWeightKg - tareWeightKg);
  const netWeightQuintal = netWeightKg / 100;
  const grossAmount = (netWeightQuintal * ratePerQuintal);
  const netPayable = Math.max(0, grossAmount - katotiAmount - hammaliAmount);

  const handleCreateSlip = (e: React.FormEvent) => {
    e.preventDefault();
    const saudaNumber = 'SP-' + (saudaSlips.length + 101);
    const newSlip = addSaudaSlip({
      saudaNumber,
      date: new Date().toISOString().split('T')[0],
      partyName,
      partyPhone,
      commodity,
      bags: Number(bags),
      netWeightQuintal: Number(netWeightQuintal.toFixed(2)),
      ratePerQuintal: Number(ratePerQuintal),
      totalAmount: Number(grossAmount.toFixed(2)),
      katotiAmount: Number(katotiAmount),
      hammaliAmount: Number(hammaliAmount),
      netPayable: Number(netPayable.toFixed(2)),
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

      {/* Print Slip Preview Modal */}
      {selectedSlipForPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white text-black p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-400 font-mono text-xs">
            <div className="text-center pb-2 border-b border-black">
              <h2 className="font-bold text-sm uppercase">{company.name}</h2>
              <p className="text-[10px]">{company.city}, {company.state}</p>
              <h3 className="font-bold text-xs mt-1 bg-amber-100 py-0.5 border border-amber-300 inline-block px-3">
                {t('sauda_slip_preview_title', language)}
              </h3>
            </div>

            <div className="py-2 space-y-1 border-b border-black text-[11px]">
              <div className="flex justify-between">
                <span>{t('sauda_slip_no', language)}: <span className="font-bold">{selectedSlipForPrint.saudaNumber}</span></span>
                <span>{t('date', language)}: {selectedSlipForPrint.date}</span>
              </div>
              <p>{t('col_party', language)}: <span className="font-bold">{selectedSlipForPrint.partyName}</span></p>
              <p>{t('col_commodity', language)}: <span className="font-bold">{selectedSlipForPrint.commodity}</span></p>
            </div>

            <div className="py-2 space-y-1 border-b border-black text-[11px]">
              <div className="flex justify-between">
                <span>{t('bags_count', language)}:</span>
                <span className="font-bold">{selectedSlipForPrint.bags} {language === 'hi' ? 'बोरी' : language === 'en' ? 'Bags' : 'Bori'}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'hi' ? 'शुद्ध वजन:' : language === 'en' ? 'Net Weight:' : 'Shuddh Vajan:'}</span>
                <span className="font-bold">{selectedSlipForPrint.netWeightQuintal} {language === 'hi' ? 'क्विंटल' : 'Qtl'}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'hi' ? 'भाव प्रति क्विंटल:' : language === 'en' ? 'Rate per Qtl:' : 'Bhaav Prati Qtl:'}</span>
                <span className="font-bold">₹{selectedSlipForPrint.ratePerQuintal}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>{t('gross_amount_label', language)}:</span>
                <span>₹{selectedSlipForPrint.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>- {language === 'hi' ? 'कट्ट/कटौती:' : language === 'en' ? 'Katoti / Deductions:' : 'Katoti:'}</span>
                <span>₹{selectedSlipForPrint.katotiAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>- {language === 'hi' ? 'हम्माली व तुलाई:' : language === 'en' ? 'Hammali & Labour:' : 'Hammali & Tulai:'}</span>
                <span>₹{selectedSlipForPrint.hammaliAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-black">
                <span>{language === 'hi' ? 'शुद्ध देय राशि:' : language === 'en' ? 'Net Payable Amount:' : 'Net Deva Rashi:'}</span>
                <span>{formatIndianCurrency(selectedSlipForPrint.netPayable)}</span>
              </div>
            </div>

            <div className="text-center pt-3 text-[10px] space-y-1">
              <p>{t('auth_sign_label', language)}</p>
              <div className="h-6"></div>
              <p className="border-t border-black inline-block px-4">Authorised</p>
            </div>

            <div className="flex gap-2 pt-4 no-print">
              <button
                onClick={() => setSelectedSlipForPrint(null)}
                className="w-1/2 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold hover:bg-slate-100 transition"
              >
                {t('btn_close', language)}
              </button>
              <button
                onClick={() => window.print()}
                className="w-1/2 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition"
              >
                {t('btn_print_slip', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}