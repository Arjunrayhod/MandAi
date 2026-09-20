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
  UserPlus,
  X,
  CheckCircle,
  FileCheck2,
  PackageCheck,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';

export default function CreateInvoicePage() {
  const router = useRouter();
  const { company, parties, products, addInvoice, addParty, addProduct, language } = useAppStore();

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

  // Quick Add Party Modal State
  const [showQuickPartyModal, setShowQuickPartyModal] = useState(false);
  const [partyFormData, setPartyFormData] = useState({
    businessName: '',
    name: '',
    type: 'customer' as 'customer' | 'supplier' | 'farmer' | 'both',
    phone: '',
    email: '',
    mandiShopNo: '',
    city: company.city || 'Neemuch',
    state: company.state || 'Madhya Pradesh',
    stateCode: company.stateCode || '23',
    gstin: '',
    pan: '',
    billingAddress: '',
    openingBalance: 0,
    creditLimit: 500000,
    paymentTermsDays: 15,
  });

  // Quick Add Product / Commodity Modal State
  const [showQuickProdModal, setShowQuickProdModal] = useState(false);
  const [prodFormData, setProdFormData] = useState({
    name: '',
    hindiName: '',
    category: 'Mandi Crop',
    hsnSac: '12119011',
    unit: 'Kg',
    sellingPrice: 200,
    purchasePrice: 190,
    gstRate: 5,
    currentStock: 1000,
    bagCount: 20,
    mandiBagWeightKg: 50,
  });

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

  // Extra Mandi charges
  const [transportCharges, setTransportCharges] = useState<number>(500);
  const [hammaliCharges, setHammaliCharges] = useState<number>(0);
  const [tulaiCharges, setTulaiCharges] = useState<number>(0);
  const [katotiCharges, setKatotiCharges] = useState<number>(1760);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [otherChargesLabel, setOtherChargesLabel] = useState<string>('Custom Surcharge');
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

  const handleCreateQuickParty = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addParty({
      businessName: partyFormData.businessName.trim() || partyFormData.name.trim(),
      name: partyFormData.name.trim() || partyFormData.businessName.trim(),
      type: partyFormData.type,
      phone: partyFormData.phone.trim(),
      email: partyFormData.email.trim(),
      mandiShopNo: partyFormData.mandiShopNo.trim(),
      city: partyFormData.city.trim(),
      state: partyFormData.state,
      stateCode: partyFormData.stateCode,
      pincode: company.pincode || '458441',
      gstin: partyFormData.gstin.trim().toUpperCase(),
      pan: partyFormData.pan.trim().toUpperCase(),
      billingAddress: partyFormData.billingAddress.trim() || `${partyFormData.city}, ${partyFormData.state}`,
      openingBalance: Number(partyFormData.openingBalance) || 0,
      balanceType: 'to_receive',
      creditLimit: Number(partyFormData.creditLimit) || 500000,
      paymentTermsDays: Number(partyFormData.paymentTermsDays) || 15,
    });

    handlePartySelect(created.id);
    setShowQuickPartyModal(false);
  };

  const handleCreateQuickProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addProduct({
      name: prodFormData.name.trim(),
      hindiName: prodFormData.hindiName.trim(),
      category: prodFormData.category.trim(),
      sku: 'SKU-' + Date.now().toString().slice(-6),
      hsnSac: prodFormData.hsnSac.trim(),
      unit: prodFormData.unit as any,
      sellingPrice: Number(prodFormData.sellingPrice) || 0,
      purchasePrice: Number(prodFormData.purchasePrice) || 0,
      gstRate: Number(prodFormData.gstRate) || 5,
      currentStock: Number(prodFormData.currentStock) || 0,
      bagCount: Number(prodFormData.bagCount) || 0,
      bagWeightKg: Number(prodFormData.mandiBagWeightKg) || 50,
      minStockLevel: 50,
    });

    // Auto add newly created product into the items list
    const isInter = isInterState;
    const gst = created.gstRate || 5;
    const halfGst = gst / 2;
    const qty = 1000;
    const taxable = qty * created.sellingPrice;
    const cgstAmt = isInter ? 0 : (taxable * halfGst) / 100;
    const sgstAmt = isInter ? 0 : (taxable * halfGst) / 100;
    const igstAmt = isInter ? (taxable * gst) / 100 : 0;

    setItems([
      ...items,
      {
        id: 'item-' + Date.now(),
        productId: created.id,
        name: created.name,
        hsnSac: created.hsnSac,
        unit: created.unit,
        bags: 20,
        qty: qty,
        rate: created.sellingPrice,
        taxableValue: taxable,
        cgstPercent: isInter ? 0 : halfGst,
        cgstAmount: cgstAmt,
        sgstPercent: isInter ? 0 : halfGst,
        sgstAmount: sgstAmt,
        igstPercent: isInter ? gst : 0,
        igstAmount: igstAmt,
        total: taxable + cgstAmt + sgstAmt + igstAmt,
      }
    ]);

    setShowQuickProdModal(false);
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
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Aggregates & Mandi Charges
  const totalBags = items.reduce((sum, i) => sum + (Number(i.bags) || 0), 0);
  const totalQty = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  const taxableAmount = items.reduce((sum, i) => sum + (Number(i.taxableValue) || 0), 0);
  const totalCgst = items.reduce((sum, i) => sum + (Number(i.cgstAmount) || 0), 0);
  const totalSgst = items.reduce((sum, i) => sum + (Number(i.sgstAmount) || 0), 0);
  const totalIgst = items.reduce((sum, i) => sum + (Number(i.igstAmount) || 0), 0);
  const totalTax = totalCgst + totalSgst + totalIgst;
  
  const allExtraCharges = Number(transportCharges || 0) + Number(katotiCharges || 0) + Number(hammaliCharges || 0) + Number(tulaiCharges || 0) + Number(otherCharges || 0);
  const totalTaxableAmount = taxableAmount + allExtraCharges;
  const finalAmount = totalTaxableAmount + totalTax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert(language === 'hi' ? 'कृपया बिल बनाने के लिए कम से कम 1 जिंस / आइटम जोड़ें।' : language === 'en' ? 'Please add at least 1 commodity / item row to create bill.' : 'Kripya kam se kam 1 item row jodein.');
      return;
    }
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
      otherCharges: allExtraCharges,
      otherChargesLabel: katotiCharges > 0 ? 'Katoti & Mandi Charges (कट्ट)' : otherChargesLabel,
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

        {/* Customer / Party Select with Quick Add */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
              {getTranslation('heading_party_info', language)}
            </h3>
            <button
              type="button"
              onClick={() => setShowQuickPartyModal(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded-lg transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {getTranslation('quick_add_party_btn', language) || '+ नई पार्टी'}
            </button>
          </div>
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
                  {p.businessName || p.name} ({p.city}) {p.mandiShopNo ? `[${p.mandiShopNo}]` : ''}
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wheat className="w-4 h-4 text-indigo-600" />
            {getTranslation('item_table_heading', language)}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQuickProdModal(true)}
              className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              {getTranslation('quick_add_commodity_btn', language) || '+ नई जिंस'}
            </button>
            <button
              type="button"
              onClick={addItemRow}
              className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold px-3 py-1.5 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              {getTranslation('btn_add_item_line', language)}
            </button>
          </div>
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
              {items.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
                    <p className="text-xs font-semibold text-slate-500 mb-2">
                      {language === 'hi' ? 'कोई जिंस नहीं जोड़ी गई है' : language === 'en' ? 'No commodities added yet' : 'Koi item nahi joda gaya'}
                    </p>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {getTranslation('btn_add_item_line', language)}
                    </button>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
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
                            {p.name} {p.hindiName && language !== 'en' ? `(${p.hindiName})` : ''} - ₹{p.sellingPrice}
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
                        title={language === 'hi' ? 'आइटम हटाएं' : language === 'en' ? 'Delete Row' : 'Row Hatayein'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-700" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandi Surcharges & Final Grand Total Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left 7 Cols: Extra Mandi Charges & Notes */}
        <div className="md:col-span-7 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <h3 className="text-xs font-bold uppercase text-indigo-600 tracking-wider">
              {getTranslation('transport_charges', language)} & {getTranslation('katoti_other_charges', language)}
            </h3>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-semibold px-2 py-0.5 rounded-full">
              Mandi Custom Charges
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Transport */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {getTranslation('label_transport_charges_box', language)} (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={transportCharges}
                onChange={(e) => setTransportCharges(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
              />
            </div>

            {/* Hammali */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {getTranslation('hammali_charge', language) || 'हम्माली (Hammali)'} (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={hammaliCharges}
                onChange={(e) => setHammaliCharges(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
              />
            </div>

            {/* Tulai */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {getTranslation('tulai_charge', language) || 'तुलाई (Tulai)'} (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={tulaiCharges}
                onChange={(e) => setTulaiCharges(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
              />
            </div>

            {/* Katoti / Bardan */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {getTranslation('label_katoti_charges_box', language)} (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={katotiCharges}
                onChange={(e) => setKatotiCharges(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
              />
            </div>

            {/* Other Charges Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                अतिरिक्त शुल्क (Other) (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={otherCharges}
                onChange={(e) => setOtherCharges(Number(e.target.value))}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
              />
            </div>

            {/* Other Charges Custom Label */}
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
              {transportCharges > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>+ Transport Charges:</span>
                  <span className="font-mono">₹{transportCharges.toFixed(2)}</span>
                </div>
              )}
              {hammaliCharges > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>+ Hammali (हम्माली):</span>
                  <span className="font-mono">₹{hammaliCharges.toFixed(2)}</span>
                </div>
              )}
              {tulaiCharges > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>+ Tulai (तुलाई):</span>
                  <span className="font-mono">₹{tulaiCharges.toFixed(2)}</span>
                </div>
              )}
              {katotiCharges > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>+ Bardan Katoti (कट्ट):</span>
                  <span className="font-mono">₹{katotiCharges.toFixed(2)}</span>
                </div>
              )}
              {otherCharges > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>+ {otherChargesLabel}:</span>
                  <span className="font-mono">₹{otherCharges.toFixed(2)}</span>
                </div>
              )}

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

      {/* QUICK ADD PARTY MODAL */}
      {showQuickPartyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'hi' ? 'त्वरित नई पार्टी जोड़ें' : language === 'en' ? 'Quick Add New Party' : 'Quick New Party Jodein'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Mandi Vyapari, Aadhat / Kisaan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickPartyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    व्यापार / फर्म का नाम (Firm Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="M/s Mahaveer Herbals"
                    value={partyFormData.businessName}
                    onChange={(e) => setPartyFormData({ ...partyFormData, businessName: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    संपर्क व्यक्ति (Contact Person)
                  </label>
                  <input
                    type="text"
                    placeholder="Jayesh Patel"
                    value={partyFormData.name}
                    onChange={(e) => setPartyFormData({ ...partyFormData, name: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    पार्टी प्रकार (Type)
                  </label>
                  <select
                    value={partyFormData.type}
                    onChange={(e) => setPartyFormData({ ...partyFormData, type: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  >
                    <option value="customer">खरीदार / व्यापारी (Buyer)</option>
                    <option value="supplier">सप्लायर / किसान (Supplier)</option>
                    <option value="farmer">किसान (Farmer)</option>
                    <option value="both">व्यापारी (Both / Dono)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    मोबाइल नं. (Mobile)
                  </label>
                  <input
                    type="text"
                    placeholder="9879554321"
                    value={partyFormData.phone}
                    onChange={(e) => setPartyFormData({ ...partyFormData, phone: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    मंडी दुकान नं. (Shop No)
                  </label>
                  <input
                    type="text"
                    placeholder="Block-B 14"
                    value={partyFormData.mandiShopNo}
                    onChange={(e) => setPartyFormData({ ...partyFormData, mandiShopNo: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN नंबर
                  </label>
                  <input
                    type="text"
                    placeholder="24AACCM9981P1ZP"
                    value={partyFormData.gstin}
                    onChange={(e) => setPartyFormData({ ...partyFormData, gstin: e.target.value })}
                    className="w-full text-xs font-mono uppercase bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    शहर (City)
                  </label>
                  <input
                    type="text"
                    placeholder="Unjha / Neemuch"
                    value={partyFormData.city}
                    onChange={(e) => setPartyFormData({ ...partyFormData, city: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    राज्य (State)
                  </label>
                  <select
                    value={partyFormData.stateCode}
                    onChange={(e) => {
                      const st = INDIAN_STATES.find((s) => s.code === e.target.value);
                      if (st) {
                        setPartyFormData({
                          ...partyFormData,
                          stateCode: st.code,
                          state: st.name,
                        });
                      }
                    }}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    उधारी सीमा (Credit Limit ₹)
                  </label>
                  <input
                    type="number"
                    value={partyFormData.creditLimit}
                    onChange={(e) => setPartyFormData({ ...partyFormData, creditLimit: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowQuickPartyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={handleCreateQuickParty}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition"
              >
                पार्टी सेव करें व चुने (Save & Select)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD COMMODITY / PRODUCT MODAL */}
      {showQuickProdModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Wheat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'hi' ? 'त्वरित नई जिंस / फसल जोड़ें' : language === 'en' ? 'Quick Add New Commodity' : 'Quick New Jins / Crop Jodein'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Mandi Agri Commodity & GST Catalog</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickProdModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    जिंस का नाम (Commodity English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asgandh Roots / Jeera"
                    value={prodFormData.name}
                    onChange={(e) => setProdFormData({ ...prodFormData, name: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    हिंदी नाम (Hindi Name)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. असगंध / जीरा"
                    value={prodFormData.hindiName}
                    onChange={(e) => setProdFormData({ ...prodFormData, hindiName: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    HSN / SAC कोड
                  </label>
                  <input
                    type="text"
                    placeholder="12119011"
                    value={prodFormData.hsnSac}
                    onChange={(e) => setProdFormData({ ...prodFormData, hsnSac: e.target.value })}
                    className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    यूनिट (Unit)
                  </label>
                  <select
                    value={prodFormData.unit}
                    onChange={(e) => setProdFormData({ ...prodFormData, unit: e.target.value })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  >
                    <option value="Kg">Kg (किलो)</option>
                    <option value="Quintal">Quintal (क्विंटल)</option>
                    <option value="Bori">Bori (बोरी)</option>
                    <option value="Metric Ton">Metric Ton (टन)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GST दर (%)
                  </label>
                  <select
                    value={prodFormData.gstRate}
                    onChange={(e) => setProdFormData({ ...prodFormData, gstRate: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 font-bold"
                  >
                    <option value={0}>0% (Exempted)</option>
                    <option value={5}>5% (Mandi Standard GST)</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    बिक्री भाव (Rate ₹/Unit) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodFormData.sellingPrice}
                    onChange={(e) => setProdFormData({ ...prodFormData, sellingPrice: Number(e.target.value) })}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    खरीद भाव (Purchase Rate ₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodFormData.purchasePrice}
                    onChange={(e) => setProdFormData({ ...prodFormData, purchasePrice: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    बोरी वजन (Bag Wt Kg)
                  </label>
                  <input
                    type="number"
                    value={prodFormData.mandiBagWeightKg}
                    onChange={(e) => setProdFormData({ ...prodFormData, mandiBagWeightKg: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setShowQuickProdModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={handleCreateQuickProduct}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition"
              >
                जिंस जोड़ें व बिल में डालें (Add & Insert Row)
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}