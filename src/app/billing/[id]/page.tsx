'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { RathoreClassicTemplate } from '@/components/invoices/RathoreClassicTemplate';
import { ModernTemplate } from '@/components/invoices/ModernTemplate';
import { ThermalTemplate } from '@/components/invoices/ThermalTemplate';
import { InvoicePrintActions } from '@/components/invoices/InvoicePrintActions';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const { invoices, company } = useAppStore();

  const [template, setTemplate] = useState<string>(company.invoiceTemplate || 'classic_rathore');

  const invoice = invoices.find((inv) => inv.id === invoiceId);

  if (!invoice) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">बिल नहीं मिला (Invoice Not Found)</h2>
        <p className="text-xs text-slate-500">माफ़ कीजिए, यह बिल मौजूद नहीं है या हटा दिया गया है।</p>
        <Link
          href="/billing"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          बिल सूची पर लौटें
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Action Bar */}
      <InvoicePrintActions
        invoice={invoice}
        company={company}
        currentTemplate={template}
        onTemplateChange={setTemplate}
      />

      {/* Invoice Render Area */}
      <div className="bg-slate-200/60 dark:bg-slate-950 p-1 sm:p-6 md:p-8 rounded-2xl print:p-0 print:bg-transparent w-full overflow-x-auto">
        <div className="min-w-fit mx-auto flex justify-center">
          {template === 'classic_rathore' && (
            <RathoreClassicTemplate invoice={invoice} company={company} />
          )}
          {template === 'modern_mandi' && (
            <ModernTemplate invoice={invoice} company={company} />
          )}
          {template === 'thermal_pos' && (
            <ThermalTemplate invoice={invoice} company={company} />
          )}
        </div>
      </div>
    </div>
  );
}
