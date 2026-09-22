'use client';

import React from 'react';
import { CompanyProfile, Invoice } from '@/lib/types';
import { MandiBhugtanSlip } from './MandiBhugtanSlip';
import { UpiQrCode } from './UpiQrCode';

export const ThermalTemplate: React.FC<{ invoice: Invoice; company: CompanyProfile }> = ({ invoice, company }) => {
  const activeBank = invoice.bankDetails || company.bankDetails;
  const upiId = activeBank?.upiId?.trim();

  return (
    <div id="printable-invoice" className="flex flex-col items-center">
      {/* Authentic Krishi Upaj Mandi Bhugtan Patrak Receipt */}
      <MandiBhugtanSlip invoice={invoice} company={company} />

      {/* UPI QR Code on thermal receipt - Only shown if UPI ID is explicitly entered */}
      {upiId ? (
        <div className="bg-white p-3 border border-t-0 border-gray-300 max-w-[320px] w-full mx-auto flex flex-col items-center justify-center text-center print:border-none print:max-w-[80mm]">
          <UpiQrCode
            upiId={upiId}
            accountName={activeBank?.accountName || company.name || 'PRO RATHORE TRADING COMPANY'}
            amount={invoice.finalAmount}
            invoiceNumber={invoice.invoiceNumber}
            size={80}
          />
          <p className="text-[9px] font-mono text-gray-700 mt-1">
            Scan to Pay UPI: {upiId}
          </p>
        </div>
      ) : null}
    </div>
  );
};
