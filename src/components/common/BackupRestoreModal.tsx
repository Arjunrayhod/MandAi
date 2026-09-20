'use client';

import React, { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Download, Upload, CheckCircle2, AlertTriangle, X, Database } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const store = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleExportJson = () => {
    const backupData = {
      company: store.company,
      parties: store.parties,
      products: store.products,
      invoices: store.invoices,
      bankAccounts: store.bankAccounts,
      transactions: store.transactions,
      payments: store.payments,
      saudaSlips: store.saudaSlips,
      cashInHand: store.cashInHand,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MandAi_Mandi_Backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccessMsg('डेटा बैकअप फ़ाइल सफलतापूर्वक डाउनलोड हो गई!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.company && json.invoices) {
          localStorage.setItem('mandai_saas_state_v1', JSON.stringify(json));
          setSuccessMsg('डेटा सफलतापूर्वक रिस्टोर हो गया! पेज रीलोड हो रहा है...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setErrorMsg('अमान्य बैकअप फ़ाइल प्रारूप (Invalid JSON format)');
        }
      } catch (err) {
        setErrorMsg('फ़ाइल पढ़ने में त्रुटि (Parse error)');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            डेटा बैकअप व रिस्टोर (Data Backup & Restore)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            {errorMsg}
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Export Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-600" />
              1. बैकअप डाउनलोड करें (Export Data)
            </h4>
            <p className="text-slate-500">
              सभी बिल, पार्टियां, जिंस स्टॉक, और बैंक लेन-देन एक JSON फाइल में सुरक्षित करें।
            </p>
            <button
              onClick={handleExportJson}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition"
            >
              📥 डाउनलोड JSON बैकअप
            </button>
          </div>

          {/* Import Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-amber-500" />
              2. बैकअप फ़ाइल से रिस्टोर करें (Restore Data)
            </h4>
            <p className="text-slate-500">
              पहले से डाउनलोड की गई JSON फाइल चुनकर पूरा डेटा वापस लोड करें।
            </p>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImportJson}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-xs transition"
            >
              📂 फ़ाइल चुनें व रिस्टोर करें
            </button>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};