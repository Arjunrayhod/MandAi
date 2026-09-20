'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Party } from '@/lib/types';
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
  const { parties, company, addParty, deleteParty } = useAppStore();
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
      lang: 'hi',
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
            पार्टी व खाता प्रबंधन (Mandi Parties & Khatabook)
          </h1>
          <p className="text-xs text-slate-500">
            मंडी व्यापारी, आढ़ती, खरीदार और किसान खाता बही
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          + नई पार्टी / व्यापारी जोड़ें
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-slate-500">मार्केट से कुल लेना (Receivables / उधारी)</span>
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
            <span className="text-xs font-semibold text-slate-500">किसानों / सप्लायर को कुल देना (Payables)</span>
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
            placeholder="पार्टी का नाम, फोन, GSTIN या शहर खोजें..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-indigo-500"
          />
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
          {(['all', 'customer', 'supplier'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg capitalize transition ${
                typeFilter === t
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t === 'all' ? 'सभी पार्टियां' : t === 'customer' ? 'खरीदार व्यापारी (Buyers)' : 'सप्लायर / किसान'}
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
                  {party.type === 'customer' ? 'खरीदार' : party.type === 'supplier' ? 'सप्लायर' : 'व्यापारी/दोनों'}
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
                  {party.balanceType === 'to_receive' ? 'लेना बाकी (Receivable)' : 'देना बाकी (Payable)'}
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
                    title="WhatsApp तगादा / Reminder"
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                )}

                <Link
                  href={`/parties/${party.id}`}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
                >
                  खाता बही (Ledger)
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
                नई पार्टी / फर्म जोड़ें (Add New Party)
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
                    फर्म का नाम (Business Name) *
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
                    व्यापारी का नाम (Contact Person)
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
                    मोबाइल नंबर (Mobile) *
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
                    पार्टी प्रकार (Type)
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  >
                    <option value="customer">खरीदार व्यापारी (Customer / Buyer)</option>
                    <option value="supplier">सप्लायर / मिलर (Supplier)</option>
                    <option value="both">दोनों (Customer & Supplier)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN (यदि हो)
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
                    मंडी दुकान नं. (Mandi Shop No)
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
                  पता (Billing Address)
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
                    शहर (City)
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
                    राज्य (State)
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
                    पिनकोड
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
                    प्रारंभिक बाकी (Opening Balance ₹)
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
                    भुगतान समय (Credit Days)
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
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                >
                  पार्टी सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
