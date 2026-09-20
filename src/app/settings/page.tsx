'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { CompanyProfile } from '@/lib/types';
import { getTranslation, t } from '@/lib/translations';
import { INDIAN_STATES, INVOICE_FONTS } from '@/lib/gstUtils';
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
  Percent,
  Upload,
  Image as ImageIcon,
  Trash2,
  Type
} from 'lucide-react';

export default function SettingsPage() {
  const { company, updateCompany, resetToDefault, language } = useAppStore();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const [formData, setFormData] = useState<CompanyProfile>(company);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'hi' ? 'कृपया 5MB से छोटी इमेज फ़ाइल चुनें' : 'Please select an image file under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png', 0.9);
          setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
        } else {
          setFormData((prev) => ({ ...prev, logoUrl: event.target?.result as string }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: undefined }));
  };

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
    if (confirm(language === 'hi' ? 'क्या आप Rathore Trading Company का डिफ़ॉल्ट सैंपल डेटा दोबारा लोड करना चाहते हैं?' : language === 'en' ? 'Reset to default sample data?' : 'Sample data reset karna chahte hain?')) {
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
            {t('settings_title', language)}
          </h1>
          <p className="text-xs text-slate-500">
            {t('settings_subtitle', language)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBackupModal(true)}
            className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 transition"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            {t('backup_restore', language)}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            {language === 'hi' ? 'सैंपल डेटा रीसेट' : language === 'en' ? 'Reset Sample Data' : 'Reset Sample Data'}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {t('success_saved', language)}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Mandi Trade Defaults */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-500" />
            1. {t('tab_mandi_defaults', language)}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'औसत बोरी वजन (Kg)' : language === 'en' ? 'Standard Bag Wt (Kg)' : 'Bag Weight (Kg)'}
              </label>
              <input
                type="number"
                value={formData.mandiDefaults?.defaultBagWeightKg ?? 50}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mandiDefaults: {
                      ...(formData.mandiDefaults || {
                        defaultBagWeightKg: 50,
                        defaultTareWeightKg: 1.0,
                        defaultHammaliRatePerBag: 20,
                        defaultTulaiRatePerBag: 5,
                        mandiCessPercent: 0,
                      }),
                      defaultBagWeightKg: Number(e.target.value),
                    },
                  })
                }
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'बारदान काट (Tare Kg)' : language === 'en' ? 'Tare Weight (Kg)' : 'Bardan Katoti (Kg)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.mandiDefaults?.defaultTareWeightKg ?? 1.0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mandiDefaults: {
                      ...(formData.mandiDefaults || {
                        defaultBagWeightKg: 50,
                        defaultTareWeightKg: 1.0,
                        defaultHammaliRatePerBag: 20,
                        defaultTulaiRatePerBag: 5,
                        mandiCessPercent: 0,
                      }),
                      defaultTareWeightKg: Number(e.target.value),
                    },
                  })
                }
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'हम्माली दर (₹/बोरी)' : language === 'en' ? 'Hammali Rate (₹/Bag)' : 'Hammali Rate (₹/Bori)'}
              </label>
              <input
                type="number"
                value={formData.mandiDefaults?.defaultHammaliRatePerBag ?? 20}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mandiDefaults: {
                      ...(formData.mandiDefaults || {
                        defaultBagWeightKg: 50,
                        defaultTareWeightKg: 1.0,
                        defaultHammaliRatePerBag: 20,
                        defaultTulaiRatePerBag: 5,
                        mandiCessPercent: 0,
                      }),
                      defaultHammaliRatePerBag: Number(e.target.value),
                    },
                  })
                }
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'तुलाई दर (₹/बोरी)' : language === 'en' ? 'Weighing Rate (₹/Bag)' : 'Tulai Rate (₹/Bori)'}
              </label>
              <input
                type="number"
                value={formData.mandiDefaults?.defaultTulaiRatePerBag ?? 5}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mandiDefaults: {
                      ...(formData.mandiDefaults || {
                        defaultBagWeightKg: 50,
                        defaultTareWeightKg: 1.0,
                        defaultHammaliRatePerBag: 20,
                        defaultTulaiRatePerBag: 5,
                        mandiCessPercent: 0,
                      }),
                      defaultTulaiRatePerBag: Number(e.target.value),
                    },
                  })
                }
                className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>
          </div>
        </div>

        {/* 2. Firm Details */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4" />
            2. {t('tab_firm_profile', language)}
          </h3>

          {/* Logo Upload Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 flex flex-col sm:flex-row items-center gap-4">
            <div className="shrink-0">
              {formData.logoUrl ? (
                <div className="relative group">
                  <img
                    src={formData.logoUrl}
                    alt="Company Logo"
                    className="w-20 h-20 object-contain rounded-xl bg-white p-1 border border-slate-300 dark:border-slate-600 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    title={t('remove_logo', language)}
                    className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center font-bold text-xs gap-1">
                  <ImageIcon className="w-7 h-7" />
                  <span className="text-[10px] font-semibold">{language === 'hi' ? 'लोगो नहीं है' : 'No Logo'}</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                {t('company_logo', language)}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('logo_help_text', language)}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <label className="cursor-pointer inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition transform active:scale-95">
                  <Upload className="w-3.5 h-3.5" />
                  {formData.logoUrl ? (language === 'hi' ? 'लोगो बदलें' : language === 'en' ? 'Change Logo' : 'Logo Badlein') : t('upload_logo', language)}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('remove_logo', language)}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('field_firm_name', language)} *
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
                {t('proprietor', language)} / {language === 'hi' ? 'मालिक का नाम' : language === 'en' ? 'Owner Name' : 'Owner Ka Naam'} *
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
                GSTIN *
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
                PAN *
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
                {t('mandi_license', language)}
              </label>
              <input
                type="text"
                value={formData.mandiLicenseNo || ''}
                onChange={(e) => setFormData({ ...formData, mandiLicenseNo: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('phone', language)}
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
                {language === 'hi' ? 'दुकान फोन / लैंडलाइन' : language === 'en' ? 'Alt / Landline Phone' : 'Alt / Dukaan Phone'}
              </label>
              <input
                type="text"
                placeholder="2055438"
                value={formData.phoneExtra || ''}
                onChange={(e) => setFormData({ ...formData, phoneExtra: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
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
                Website
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
              {t('address', language)} *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'शहर' : language === 'en' ? 'City' : 'City'}
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
                {language === 'hi' ? 'राज्य' : language === 'en' ? 'State' : 'State'}
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
                {language === 'hi' ? 'पिनकोड' : language === 'en' ? 'Pincode' : 'Pincode'}
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'न्यायालय क्षेत्र (Jurisdiction)' : language === 'en' ? 'Jurisdiction' : 'Jurisdiction'}
              </label>
              <input
                type="text"
                placeholder="Neemuch (M.P.)"
                value={formData.jurisdiction || ''}
                onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
            </div>
          </div>
        </div>

        {/* 3. Bank Details & UPI */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            3. {t('tab_bank_qr', language)}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'बैंक का नाम' : language === 'en' ? 'Bank Name' : 'Bank Ka Naam'} *
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
                {language === 'hi' ? 'खाता धारक का नाम' : language === 'en' ? 'Account Holder Name' : 'Account Name'} *
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
                {language === 'hi' ? 'खाता नंबर' : language === 'en' ? 'Account Number' : 'Account Number'} *
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
                IFSC *
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
                UPI ID (QR Code) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. yourname@okaxis or 98260XXXXX@ybl"
                value={formData.bankDetails.upiId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, upiId: e.target.value.trim() },
                  })
                }
                className="w-full text-xs font-medium text-indigo-600 bg-slate-50 dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5"
              />
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                💡 <strong>जरूरी:</strong> यहाँ अपनी असली सक्रिय UPI ID डालें (जैसे PhonePe/GPay/Paytm)। डेमो ID डालने पर UPI ऐप 'Not Verified' दिखाता है।
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'बैंक शाखा का पता' : language === 'en' ? 'Bank Branch Address' : 'Bank Branch Address'}
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
            4. {t('design_template_label', language)}
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
                <span className="font-bold text-xs text-slate-900 dark:text-white">Classic Rathore Mandi GST</span>
                {formData.invoiceTemplate === 'classic_rathore' && (
                  <span className="text-[10px] font-bold text-indigo-600">✓ Selected</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                1:1 क्लासिक लेआउट (Blue Bar, HSN, कट्ट व ट्रांसपोर्ट)
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
                मॉडर्न लुक, गोल बॉर्डर्स व हाइलाइटेड समरी
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

        {/* 5. Invoice Typography & Font Style */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-2">
            <Type className="w-4 h-4" />
            5. {language === 'hi' ? 'बिल व इनवॉइस फॉन्ट स्टाइल' : language === 'en' ? 'Invoice Font & Typography Style' : 'Invoice Font Style'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.values(INVOICE_FONTS).map((f) => {
              const isSelected = (formData.invoiceFont || 'inter') === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setFormData({ ...formData, invoiceFont: f.id as any })}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white" style={{ fontFamily: f.fontFamily }}>
                      {language === 'hi' ? f.hindiName : f.name}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-indigo-600">✓ Selected</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {f.description}
                  </p>
                  <div 
                    className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    style={{ fontFamily: f.fontFamily }}
                  >
                    M/s Rathore Trading • ₹4,96,650
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition transform active:scale-95"
          >
            <Save className="w-5 h-5" />
            {t('btn_save_settings', language)}
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