'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { CompanyProfile } from '@/lib/types';
import { INDIAN_STATES } from '@/lib/gstUtils';
import { BackupRestoreModal } from '@/components/common/BackupRestoreModal';
import { 
  Settings, 
  Building, 
  CreditCard, 
  FileText, 
  Save, 
  RotateCcw, 
  CheckCircle,
  Database,
  Wheat,
  Scale,
  Percent
} from 'lucide-react';

export default function SettingsPage() {
  const { company, updateCompany, resetToDefault } = useAppStore();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const [formData, setFormData] = useState<CompanyProfile>(company);

  const handleStateChange = (stateName: string) => {
    const found = INDIAN_STATES.find((s) => s.name === stateName);
    setFormData({
      ...formData,
      state: stateName,
      stateCode: found ? found.code : '23',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    if (confirm('क्या आप Rathore Trading Company का डिफ़ॉल्ट सैंपल डेटा दोबारा लोड करना चाहते हैं?')) {
      resetToDefault();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wheat className="w-7 h-7 text-indigo-600" />
            मंडी फर्म व व्यापार सेटिंग (Mandi Profile & Setup)
          </h1>
          <p className="text-xs text-slate-500">
            कृषि उपज मंडी फर्म प्रोफ़ाइल, GSTIN, बैंक खाता, UPI QR कोड और आढ़त डिफ़ॉल्ट्स
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBackupModal(true)}
            className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 transition"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            डेटा बैकअप व रिस्टोर
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset Sample Data
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          मंडी फर्म प्रोफ़ाइल और सेटिंग सफलतापूर्वक सुरक्षित कर ली गई है!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Mandi Trade Defaults */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-500" />
            1. मंडी आढ़त व तौल डिफ़ॉल्ट सेटिंग (Mandi Trade Defaults)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                औसत बोरी वजन (Kg per Bag)
              </label>
              <input
                type="number"
                placeholder="50"
                defaultValue={50}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                बारदान काट (Tare Kg per Bag)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="1.0"
                defaultValue={1.0}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                हम्माली दर (₹ प्रति बोरी)
              </label>
              <input
                type="number"
                placeholder="20"
                defaultValue={20}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                तुलाई दर (₹ प्रति बोरी)
              </label>
              <input
                type="number"
                placeholder="5"
                defaultValue={5}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>
          </div>
        </div>

        {/* 2. Firm Details */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4" />
            2. मंडी फर्म व प्रोपराइटर विवरण (Mandi Firm Details)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                फर्म का नाम (Firm Name) *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                मालिक / प्रोपराइटर का नाम (Owner Name) *
              </label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GSTIN नंबर *
              </label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full text-xs font-mono font-bold uppercase bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PAN नंबर *
              </label>
              <input
                type="text"
                required
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className="w-full text-xs font-mono font-bold uppercase bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                मंडी अनुज्ञप्ति क्र. (License No.)
              </label>
              <input
                type="text"
                value={formData.mandiLicenseNo || ''}
                onChange={(e) => setFormData({ ...formData, mandiLicenseNo: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                फोन नंबर (Phone)
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ईमेल (Email)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                वेबसाइट (Website)
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              दुकान का पूरा पता (Address) *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                शहर (City)
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                राज्य (State)
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-2 py-2.5"
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
                पिनकोड (Pincode)
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>
          </div>
        </div>

        {/* 3. Bank Details & UPI */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            3. बिल पर छपने वाले बैंक खाते का विवरण (Bank & UPI QR)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                बैंक का नाम (Bank Name) *
              </label>
              <input
                type="text"
                required
                value={formData.bankDetails.bankName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                  })
                }
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                खाता धारक का नाम (Acc Name) *
              </label>
              <input
                type="text"
                required
                value={formData.bankDetails.accountName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountName: e.target.value },
                  })
                }
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                खाता नंबर (Account Number) *
              </label>
              <input
                type="text"
                required
                value={formData.bankDetails.accountNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountNumber: e.target.value },
                  })
                }
                className="w-full text-xs font-mono font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                IFSC कोड *
              </label>
              <input
                type="text"
                required
                value={formData.bankDetails.ifsc}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, ifsc: e.target.value.toUpperCase() },
                  })
                }
                className="w-full text-xs font-mono font-bold uppercase bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                UPI ID (QR कोड हेतु) *
              </label>
              <input
                type="text"
                required
                value={formData.bankDetails.upiId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, upiId: e.target.value },
                  })
                }
                className="w-full text-xs font-medium text-indigo-600 bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              बैंक शाखा (Branch Address)
            </label>
            <input
              type="text"
              value={formData.bankDetails.branch}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, branch: e.target.value },
                })
              }
              className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
            />
          </div>
        </div>

        {/* 4. Invoice Template Selector */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4" />
            4. डिफ़ॉल्ट इनवॉइस टेम्पलेट (Mandi Invoice Templates)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setFormData({ ...formData, invoiceTemplate: 'classic_rathore' })}
              className={`cursor-pointer p-4 rounded-xl border-2 transition ${
                formData.invoiceTemplate === 'classic_rathore'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Classic Rathore GST</span>
                {formData.invoiceTemplate === 'classic_rathore' && (
                  <span className="text-[10px] font-bold text-indigo-600">✓ Selected</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                सैंपल PDF जैसा 1:1 क्लासिक लेआउट (Blue Bar, HSN, कट्ट व ट्रांसपोर्ट)
              </p>
            </div>

            <div
              onClick={() => setFormData({ ...formData, invoiceTemplate: 'modern_mandi' })}
              className={`cursor-pointer p-4 rounded-xl border-2 transition ${
                formData.invoiceTemplate === 'modern_mandi'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Modern Mandi Indigo</span>
                {formData.invoiceTemplate === 'modern_mandi' && (
                  <span className="text-[10px] font-bold text-indigo-600">✓ Selected</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                मॉडर्न कॉर्पोरेट लुक, गोल बॉर्डर्स व हाइलाइटेड समरी
              </p>
            </div>

            <div
              onClick={() => setFormData({ ...formData, invoiceTemplate: 'thermal_pos' })}
              className={`cursor-pointer p-4 rounded-xl border-2 transition ${
                formData.invoiceTemplate === 'thermal_pos'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Thermal 80mm POS</span>
                {formData.invoiceTemplate === 'thermal_pos' && (
                  <span className="text-[10px] font-bold text-indigo-600">✓ Selected</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                मंडी काउंटर के लिए 3-इंच फास्ट प्रिंट पर्ची
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition transform active:scale-95"
          >
            <Save className="w-5 h-5" />
            सेटिंग सुरक्षित करें (Save Profile)
          </button>
        </div>
      </form>

      {/* Backup Modal */}
      <BackupRestoreModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
      />
    </div>
  );
}