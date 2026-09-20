'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { InvoiceItem, DocumentType } from '@/lib/types';
import { getTranslation } from '@/lib/translations';
import { INDIAN_STATES, formatIndianCurrency, numberToIndianWords } from '@/lib/gstUtils';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Save, 
  Truck, 
  FileText,
  Wheat,
  FileCheck2,
  PackageCheck,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';

export default function CreateInvoicePage() {
  const router = useRouter();
  const { company, parties, products, addInvoice, language } = useAppStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const dueDefault = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

  const [docType, setDocType] = useState<DocumentType>('tax_invoice');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(String(company.invoiceNextNumber || 170));
  const [invoiceDate, setInvoiceDate] = useState<string>(todayStr);
  const [dueDate, setDueDate] = useState<string>(dueDefault);
  const [selectedPartyId, setSelectedPartyId] = useState<string>(parties[0]?.id || '');
  
  const [billingAddress, setBillingAddress] = useState<string>(parties[0]?.billingAddress || '');
  const [placeOfSupply, setPlaceOfSupply] = useState<string>(`${parties[0]?.state || 'Madhya Pradesh'} ( ${parties[0]?.stateCode || '23'} )`);
  const [isInterState, setIsInterState] = useState<boolean>(false);
  
  // GoGST Transport & E-Way fields
  const [vehicleNo, setVehicleNo] = useState<string>('MP 44 GA 8819');
  const [biltyNo, setBiltyNo] = useState<string>('');
  const [transporterName, setTransporterName] = useState<string>('Neemuch Roadways Carrier');
  const [transporterId, setTransporterId] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<number>(120);
  const [stationTo, setStationTo] = useState<string>('');

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      productId: products[0]?.id || '',
      name: products[0]?.name || 'Musakadana',
      hsnSac: products[0]?.hsnSac || '12119011',
      qty: 2200,
      unit: 'Kg',
      bags: 44,
      rate: 215,
      ratePer: 'Kg',
      taxableValue: 473000,
      cgstPercent: 2.5,
      cgstAmount: 11825,
      sgstPercent: 2.5,
      sgstAmount: 11825,
      igstPercent: 0,
      igstAmount: 0,
      total: 496650,
    }
  ]);

  // Extra charges
  const [transportCharges, setTransportCharges] = useState<number>(500);
  const [otherCharges, setOtherCharges] = useState<number>(1760);
  const [otherChargesLabel, setOtherChargesLabel] = useState<string>('All other charges (कट्ट)');
  const [notes, setNotes] = useState<string>('');

  const handlePartySelect = (partyId: string) => {
    setSelectedPartyId(partyId);
    const party = parties.find((p) => p.id === partyId);
    if (party) {
      setBillingAddress(party.billingAddress);
      setPlaceOfSupply(`${party.state} ( ${party.stateCode} )`);
      const isInter = party.stateCode !== company.stateCode;
      setIsInterState(isInter);
      recalcItems(items, isInter);
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newItems = [...items];
    const current = newItems[index];
    const gst = prod.gstRate || 5;
    const isInter = isInterState;

    const taxable = current.qty * prod.sellingPrice;
    const halfGst = gst / 2;
    const cgstAmt = isInter ? 0 : (taxable * halfGst) / 100;
    const sgstAmt = isInter ? 0 : (taxable * halfGst) / 100;
    const igstAmt = isInter ? (taxable * gst) / 100 : 0;
    const tot = taxable + cgstAmt + sgstAmt + igstAmt;

    newItems[index] = {
      ...current,
      productId: prod.id,
      name: prod.name,
      hsnSac: prod.hsnSac,
      unit: prod.unit,
      rate: prod.sellingPrice,
      taxableValue: taxable,
      cgstPercent: isInter ? 0 : halfGst,
      cgstAmount: cgstAmt,
      sgstPercent: isInter ? 0 : halfGst,
      sgstAmount: sgstAmt,
      igstPercent: isInter ? gst : 0,
      igstAmount: igstAmt,
      total: tot,
    };
    setItems(newItems);
  };

  const updateItemRow = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    const qty = field === 'qty' ? Number(value) : item.qty;
    const rate = field === 'rate' ? Number(value) : item.rate;
    const taxable = qty * rate;

    const gstRate = (item.cgstPercent + item.sgstPercent) || item.igstPercent || 5;
    const halfGst = gstRate / 2;

    const cgstAmt = isInterState ? 0 : (taxable * halfGst) / 100;
    const sgstAmt = isInterState ? 0 : (taxable * halfGst) / 100;
    const igstAmt = isInterState ? (taxable * gstRate) / 100 : 0;
    const tot = taxable + cgstAmt + sgstAmt + igstAmt;

    newItems[index] = {
      ...item,
      taxableValue: taxable,
      cgstAmount: cgstAmt,
      sgstAmount: sgstAmt,
      igstAmount: igstAmt,
      total: tot,
    };
    setItems(newItems);
  };

  const recalcItems = (currentItems: InvoiceItem[], isInter: boolean) => {
    const updated = currentItems.map((item) => {
      const taxable = item.qty * item.rate;
      const totalGst = (item.cgstPercent + item.sgstPercent) || item.igstPercent || 5;
      const half = totalGst / 2;
      return {
        ...item,
        cgstPercent: isInter ? 0 : half,
        cgstAmount: isInter ? 0 : (taxable * half) / 100,
        sgstPercent: isInter ? 0 : half,
        sgstAmount: isInter ? 0 : (taxable * half) / 100,
        igstPercent: isInter ? totalGst : 0,
        igstAmount: isInter ? (taxable * totalGst) / 100 : 0,
        total: taxable + (taxable * totalGst) / 100,
      };
    });
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: 'item-' + Date.now(),
        name: '',
        hsnSac: '12119011',
        qty: 1000,
        unit: 'Kg',
        bags: 20,
        rate: 200,
        taxableValue: 200000,
        cgstPercent: isInterState ? 0 : 2.5,
        cgstAmount: isInterState ? 0 : 5000,
        sgstPercent: isInterState ? 0 : 2.5,
        sgstAmount: isInterState ? 0 : 5000,
        igstPercent: isInterState ? 5 : 0,
        igstAmount: isInterState ? 10000 : 0,
        total: 210000,
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  // Aggregates
  const totalBags = items.reduce((sum, i) => sum + (Number(i.bags) || 0), 0);
  const totalQty = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  const taxableAmount = items.reduce((sum, i) => sum + (Number(i.taxableValue) || 0), 0);
  const totalCgst = items.reduce((sum, i) => sum + (Number(i.cgstAmount) || 0), 0);
  const totalSgst = items.reduce((sum, i) => sum + (Number(i.sgstAmount) || 0), 0);
  const totalIgst = items.reduce((sum, i) => sum + (Number(i.igstAmount) || 0), 0);
  const totalTax = totalCgst + totalSgst + totalIgst;
  const totalTaxableAmount = taxableAmount + Number(transportCharges || 0) + Number(otherCharges || 0);
  const finalAmount = totalTaxableAmount + totalTax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const party = parties.find((p) => p.id === selectedPartyId) || parties[0];

    const newInvoice = addInvoice({
      docType,
      invoiceNumber: invoiceNumber.trim(),
      invoiceDate,
      dueDate,
      partyId: party.id,
      party,
      billingAddress,
      placeOfSupply,
      isInterState,
      vehicleNo,
      biltyNo,
      transporterName,
      transporterId,
      distanceKm: Number(distanceKm || 0),
      stationTo,
      items,
      totalBags,
      totalQty,
      taxableAmount,
      transportCharges: Number(transportCharges || 0),
      otherCharges: Number(otherCharges || 0),
      otherChargesLabel,
      totalTaxableAmount,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTax,
      roundOff: 0,
      finalAmount,
      totalInWords: numberToIndianWords(finalAmount),
      paidAmount: 0,
      balanceAmount: finalAmount,
      status: 'unpaid',
      notes,
    });

    router.push(`/billing/${newInvoice.id}`);
  };

  const docTitleMap: Record<DocumentType, string> = {
    tax_invoice: getTranslation('doc_tax_invoice', language),
    quotation_estimate: getTranslation('doc_estimate', language),
    delivery_challan: getTranslation('doc_challan', language),
    credit_note: getTranslation('doc_credit_note', language),
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header with GoGST Doc Type Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/billing"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-6 h-6 text-indigo-600" />
              {docTitleMap[docType]}
            </h1>
            <p className="text-xs text-slate-500">
              {company.name} • {getTranslation('mandi_edition', language)}
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition transform active:scale-95"
        >
          <Save className="w-4 h-4" />
          {getTranslation('save_and_print', language)}
        </button>
      </div>

      {/* GoGST Document Type Selector Bar */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap gap-2">
        {[
          { id: 'tax_invoice', label: getTranslation('doc_tax_invoice_full', language), icon: Receipt },
          { id: 'quotation_estimate', label: getTranslation('doc_estimate_full', language), icon: FileText },
          { id: 'delivery_challan', label: getTranslation('doc_challan_full', language), icon: PackageCheck },
          { id: 'credit_note', label: getTranslation('doc_credit_note_full', language), icon: RotateCcw },
        ].map((dt) => {
          const Icon = dt.icon;
          const isSelected = docType === dt.id;
          return (
            <button
              key={dt.id}
              type="button"
              onClick={() => setDocType(dt.id as DocumentType)}
              className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{dt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bill & Party Meta Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Invoice Meta */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <h3 className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
            {getTranslation('heading_invoice_info', language)}
          </h3>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {getTranslation('invoice_number', language)}
            </label>
            <input
              type="text"
              required
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full text-xs font-bold font-mono bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {getTranslation('invoice_date', language)}
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-2"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {getTranslation('due_date', language)}
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-2 text-rose-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Customer / Party Select */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <h3 className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
            {getTranslation('heading_party_info', language)}
          </h3>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {getTranslation('select_party', language)}
            </label>
            <select
              value={selectedPartyId}
              onChange={(e) => handlePartySelect(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
            >
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.businessName || p.name} ({p.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {getTranslation('field_place_of_supply', language)}
            </label>
            <input
              type="text"
              value={placeOfSupply}
              onChange={(e) => setPlaceOfSupply(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
            />
          </div>
        </div>

        {/* GoGST Transport & E-Way Fields */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <h3 className="text-xs font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4" />
            {getTranslation('heading_transport_info', language)}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {getTranslation('label_vehicle_no', language)}
              </label>
              <input
                type="text"
                placeholder="MP 44 GA 8819"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-2 uppercase font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {getTranslation('label_distance_km', language)}
              </label>
              <input
                type="number"
                placeholder="120 Km"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {getTranslation('label_transporter_name', language)}
              </label>
              <input
                type="text"
                placeholder="Transporter Name"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-2"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {getTranslation('label_gst_type', language)}
              </label>
              <button
                type="button"
                onClick={() => {
                  const toggled = !isInterState;
                  setIsInterState(toggled);
                  recalcItems(items, toggled);
                }}
                className={`w-full py-2 px-1 text-[10px] font-bold rounded-xl border transition ${
                  isInterState
                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                    : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                }`}
              >
                {isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wheat className="w-4 h-4 text-indigo-600" />
            {getTranslation('item_table_heading', language)}
          </h3>
          <button
            type="button"
            onClick={addItemRow}
            className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {getTranslation('btn_add_item_line', language)}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-2 px-2 w-8">#</th>
                <th className="py-2 px-2 min-w-[180px]">{getTranslation('col_item_name', language)}</th>
                <th className="py-2 px-2 w-24">{getTranslation('col_hsn', language)}</th>
                <th className="py-2 px-2 w-20">{getTranslation('col_bags', language)}</th>
                <th className="py-2 px-2 w-24">{getTranslation('col_qty_unit', language)}</th>
                <th className="py-2 px-2 w-20">{getTranslation('col_unit', language) || 'यूनिट'}</th>
                <th className="py-2 px-2 w-24">{getTranslation('col_rate', language)}</th>
                <th className="py-2 px-2 text-right w-28">{getTranslation('col_taxable', language)}</th>
                <th className="py-2 px-2 text-right w-28">{getTranslation('col_tax_rate', language)}</th>
                <th className="py-2 px-2 text-right w-32">{getTranslation('col_total_amount', language)}</th>
                <th className="py-2 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                  <td className="py-2 px-2 text-slate-400 font-bold">{idx + 1}</td>
                  
                  {/* Item Name / Selector */}
                  <td className="py-2 px-2">
                    <select
                      value={item.productId || ''}
                      onChange={(e) => handleProductSelect(idx, e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5"
                    >
                      <option value="">{getTranslation('select_commodity_placeholder', language)}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.hindiName ? `(${p.hindiName})` : ''} - ₹{p.sellingPrice}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* HSN */}
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.hsnSac}
                      onChange={(e) => updateItemRow(idx, 'hsnSac', e.target.value)}
                      className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-center"
                    />
                  </td>

                  {/* Bags */}
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      placeholder="44"
                      value={item.bags || ''}
                      onChange={(e) => updateItemRow(idx, 'bags', e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-center font-bold"
                    />
                  </td>

                  {/* Qty */}
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.qty}
                      onChange={(e) => updateItemRow(idx, 'qty', e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-right font-bold"
                    />
                  </td>

                  {/* Unit */}
                  <td className="py-2 px-2">
                    <select
                      value={item.unit}
                      onChange={(e) => updateItemRow(idx, 'unit', e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-1 py-1.5"
                    >
                      <option value="Kg">Kg</option>
                      <option value="Quintal">Quintal</option>
                      <option value="Bori">Bori</option>
                      <option value="Metric Ton">Ton</option>
                    </select>
                  </td>

                  {/* Rate */}
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.rate}
                      onChange={(e) => updateItemRow(idx, 'rate', e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-right font-bold"
                    />
                  </td>

                  {/* Taxable */}
                  <td className="py-2 px-2 text-right font-bold text-slate-800 dark:text-slate-200">
                    ₹{item.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* GST */}
                  <td className="py-2 px-2 text-right text-slate-600 dark:text-slate-400">
                    ₹{(isInterState ? item.igstAmount : item.cgstAmount + item.sgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Total */}
                  <td className="py-2 px-2 text-right font-black text-slate-900 dark:text-white">
                    ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Remove */}
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      disabled={items.length <= 1}
                      className="text-slate-400 hover:text-rose-500 disabled:opacity-30 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Surcharges & Final Grand Total Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left 7 Cols: Extra Mandi Charges & Notes */}
        <div className="md:col-span-7 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
            {getTranslation('transport_charges', language)} & {getTranslation('katoti_other_charges', language)}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {getTranslation('label_transport_charges_box', language)}
              </label>
              <input
                type="number"
                step="0.01"
                value={transportCharges}
                onChange={(e) => setTransportCharges(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {getTranslation('label_katoti_charges_box', language)}
              </label>
              <input
                type="number"
                step="0.01"
                value={otherCharges}
                onChange={(e) => setOtherCharges(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {getTranslation('label_other_charges_text', language)}
            </label>
            <input
              type="text"
              value={otherChargesLabel}
              onChange={(e) => setOtherChargesLabel(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {getTranslation('label_notes_remark', language)}
            </label>
            <textarea
              rows={2}
              placeholder={language === 'hi' ? 'मंडी सौदा पर्चा संदर्भ या शर्त...' : language === 'en' ? 'Mandi agreement terms or notes...' : 'Mandi sauda parcha shart ya notes...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
            />
          </div>
        </div>

        {/* Right 5 Cols: Calculation Box */}
        <div className="md:col-span-5 bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase text-indigo-400 tracking-wider mb-4">
              {getTranslation('bill_summary_heading', language)}
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>{getTranslation('taxable_subtotal', language)}:</span>
                <span className="font-mono font-bold text-white">₹{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>+ Transport Charges:</span>
                <span className="font-mono">₹{transportCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>+ {otherChargesLabel}:</span>
                <span className="font-mono">₹{otherCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sky-400 pt-1 border-t border-slate-700">
                <span>{getTranslation('label_total_taxable_value', language)}</span>
                <span className="font-mono">₹{totalTaxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {!isInterState ? (
                <>
                  <div className="flex justify-between text-slate-300">
                    <span>+ CGST (2.5%):</span>
                    <span className="font-mono">₹{totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>+ SGST (2.5%):</span>
                    <span className="font-mono">₹{totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-300">
                  <span>+ IGST (5%):</span>
                  <span className="font-mono">₹{totalIgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-slate-200">
                <span>{getTranslation('label_total_gst_tax', language)}</span>
                <span className="font-mono">₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-bold text-indigo-300">{getTranslation('grand_total', language)}:</span>
              <span className="text-2xl font-black text-white font-mono">
                {formatIndianCurrency(finalAmount)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-tight leading-tight">
              {numberToIndianWords(finalAmount)}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}