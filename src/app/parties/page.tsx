'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Party } from '@/lib/types';
import { getTranslation, t } from '@/lib/translations';
import { formatIndianCurrency, generateWhatsAppReminder, INDIAN_STATES } from '@/lib/gstUtils';
import { 
  Users, 
  Plus, 
  Search, 
  Share2, 
  Phone, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2,
  FileText,
  Building,
  CheckCircle2,
  X
} from 'lucide-react';

export default function PartiesListPage() {
  const { parties, company, addParty, deleteParty, language } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'customer' | 'supplier' | 'farmer'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Party Form State
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    type: 'customer' as Party['type'],
    phone: '',
    email: '',
    billingAddress: '',
    city: 'Neemuch',
    state: 'Madhya Pradesh',
    stateCode: '23',
    pincode: '458441',
    gstin: '',
    pan: '',
    mandiShopNo: '',
    openingBalance: 0,
    balanceType: 'to_receive' as Party['balanceType'],
    creditLimit: 500000,
    paymentTermsDays: 15,
    notes: '',
  });

  const filteredParties = parties.filter((p) => {
    const matchesSearch =
      p.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.gstin?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === 'all'
        ? true
        : typeFilter === 'customer'
        ? p.type === 'customer' || p.type === 'both'
        : typeFilter === 'supplier'
        ? p.type === 'supplier' || p.type === 'both'
        : p.type === 'farmer';

    return matchesSearch && matchesType;
  });

  const totalReceivable = parties
    .filter((p) => p.balanceType === 'to_receive')
    .reduce((sum, p) => sum + p.currentBalance, 0);

  const totalPayable = parties
    .filter((p) => p.balanceType === 'to_pay')
    .reduce((sum, p) => sum + p.currentBalance, 0);

  const handleStateChange = (stateName: string) => {
    const found = INDIAN_STATES.find((s) => s.name === stateName);
    setFormData({
      ...formData,
      state: stateName,
      stateCode: found ? found.code : '23',
    });
  };

  const handleCreateParty = (e: React.FormEvent) => {
    e.preventDefault();
    addParty({
      name: formData.name || formData.businessName,
      businessName: formData.businessName || formData.name,
      type: formData.type,
      phone: formData.phone,
      email: formData.email,
      billingAddress: formData.billingAddress,
      city: formData.city,
      state: formData.state,
      stateCode: formData.stateCode,
      pincode: formData.pincode,
      gstin: formData.gstin.toUpperCase(),
      pan: formData.pan.toUpperCase() || (formData.gstin.length >= 12 ? formData.gstin.substring(2, 12).toUpperCase() : ''),
      mandiShopNo: formData.mandiShopNo,
      openingBalance: Number(formData.openingBalance || 0),
      balanceType: formData.balanceType,
      creditLimit: Number(formData.creditLimit || 0),
      paymentTermsDays: Number(formData.paymentTermsDays || 15),
      notes: formData.notes,
    });
    setShowAddModal(false);
    setFormData({
      name: '',
      businessName: '',
      type: 'customer',
      phone: '',
      email: '',
      billingAddress: '',
      city: 'Neemuch',
      state: 'Madhya Pradesh',
      stateCode: '23',
      pincode: '458441',
      gstin: '',
      pan: '',
      mandiShopNo: '',
      openingBalance: 0,
      balanceType: 'to_receive',
      creditLimit: 500000,
      paymentTermsDays: 15,
      notes: '',
    });
  };

  const sendWhatsAppReminder = (party: Party) => {
    const { url } = generateWhatsAppReminder({
      customerName: party.businessName || party.name,
      businessName: party.businessName || party.name,
      invoiceNumber: 'Ledger Balance',
      amount: party.currentBalance,
      dueDate: 'Immediate',
      companyName: company.name,
      upiId: company.bankDetails.upiId,
      phone: party.phone,
      lang: language === 'en' ? 'en' : 'hi',
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            {t('parties_title', language)}
          </h1>
          <p className="text-xs text-slate-500">
            {t('parties_subtitle', language)}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('add_party_btn', language)}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500">{t('total_receivable', language)}</span>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {formatIndianCurrency(totalReceivable)}
            </h3>
          </div>
          <span className="p-3 bg-amber-50 dark:bg-amber-900/40 text-amber-600 rounded-2xl">
            <ArrowDownRight className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500">{t('total_payable', language)}</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {formatIndianCurrency(totalPayable)}
            </h3>
          </div>
          <span className="p-3 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rounded-2xl">
            <ArrowUpRight className="w-6 h-6" />
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search_party_placeholder', language)}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-indigo-500"
          />
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
          {(['all', 'customer', 'supplier'] as const).map((filterVal) => (
            <button
              key={filterVal}
              onClick={() => setTypeFilter(filterVal)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg capitalize transition ${
                typeFilter === filterVal
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {filterVal === 'all'
                ? t('filter_all_parties', language)
                : filterVal === 'customer'
                ? t('filter_buyers', language)
                : t('filter_suppliers', language)}
            </button>
          ))}
        </div>
      </div>

      {/* Parties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParties.map((party) => (
          <div
            key={party.id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {party.businessName || party.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{party.name}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
                  {party.type === 'customer'
                    ? (language === 'hi' ? 'खरीदार' : language === 'en' ? 'Buyer' : 'Kharidar')
                    : party.type === 'supplier'
                    ? (language === 'hi' ? 'सप्लायर' : language === 'en' ? 'Supplier' : 'Supplier')
                    : (language === 'hi' ? 'व्यापारी/दोनों' : language === 'en' ? 'Trader/Both' : 'Vyapari/Dono')}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{party.phone}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{party.city}, {party.state}</span>
                </p>
                {party.gstin && (
                  <p className="text-[11px] text-slate-500 font-mono">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">GST:</span> {party.gstin}
                  </p>
                )}
                {party.mandiShopNo && (
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    🏪 {party.mandiShopNo}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {party.balanceType === 'to_receive'
                    ? t('balance_to_receive', language)
                    : t('balance_to_pay', language)}
                </span>
                <span className={`text-base font-black ${
                  party.currentBalance > 0 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {formatIndianCurrency(party.currentBalance)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {party.currentBalance > 0 && (
                  <button
                    onClick={() => sendWhatsAppReminder(party)}
                    title={t('whatsapp_reminder', language)}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}

                <Link
                  href={`/parties/${party.id}`}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
                >
                  {t('ledger_btn', language)}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Party Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                {t('add_party_modal_title', language)}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParty} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('field_firm_name', language)} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. M/s Raj And Company"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('field_party_name', language)}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajendra Singh"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('phone', language)} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="98260XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('field_party_type', language)}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  >
                    <option value="customer">{t('type_customer', language)}</option>
                    <option value="supplier">{t('type_supplier', language)}</option>
                    <option value="both">{t('type_both', language)}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('gstin', language)} ({language === 'hi' ? 'यदि हो' : language === 'en' ? 'Optional' : 'Yadi ho'})
                  </label>
                  <input
                    type="text"
                    placeholder="23ADQPJ0979E1ZG"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full text-xs uppercase font-mono bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('field_mandi_shop_no', language)}
                  </label>
                  <input
                    type="text"
                    placeholder="Dukaan No. 25 Katju Market"
                    value={formData.mandiShopNo}
                    onChange={(e) => setFormData({ ...formData, mandiShopNo: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('address', language)}
                </label>
                <input
                  type="text"
                  placeholder="Ward No 25, Opposite Katju Market"
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'hi' ? 'शहर' : language === 'en' ? 'City' : 'Shahar'}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'hi' ? 'राज्य' : language === 'en' ? 'State' : 'Rajya'}
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-2 py-2"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'hi' ? 'पिनकोड' : language === 'en' ? 'Pincode' : 'Pincode'}
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('field_opening_balance', language)}
                  </label>
                  <input
                    type="number"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: Number(e.target.value) })}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('field_payment_terms', language)}
                  </label>
                  <input
                    type="number"
                    value={formData.paymentTermsDays}
                    onChange={(e) => setFormData({ ...formData, paymentTermsDays: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
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
