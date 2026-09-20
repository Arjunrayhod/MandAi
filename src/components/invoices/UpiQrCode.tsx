'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface UpiQrCodeProps {
  upiId: string;
  accountName: string;
  amount: number;
  invoiceNumber: string;
  size?: number;
}

export const UpiQrCode: React.FC<UpiQrCodeProps> = ({
  upiId,
  accountName,
  amount,
  invoiceNumber,
  size = 90,
}) => {
  if (!upiId) return null;

  // Sanitize VPA, Name, and Note according to NPCI UPI URI standards
  const cleanUpi = upiId.trim();
  const cleanName = (accountName || 'Mandi Merchant').replace(/[^a-zA-Z0-9 ]/g, ' ').trim();
  const cleanNote = (invoiceNumber || 'Bill').replace(/[^a-zA-Z0-9_-]/g, '');

  // NPCI standard parameters
  // Note: Avoid '#' in note parameter as it breaks URI parsing in UPI apps
  // For amounts <= 1,00,000 (standard UPI limit), specify exact amount; for higher B2B bills, open payment flow
  const upiParams = new URLSearchParams({
    pa: cleanUpi,
    pn: cleanName,
    tn: `Bill ${cleanNote}`,
    cu: 'INR',
    mode: '02',
    purpose: '00',
  });

  if (amount > 0 && amount <= 100000) {
    upiParams.set('am', amount.toFixed(2));
  }

  const upiUrl = `upi://pay?${upiParams.toString()}`;

  return (
    <div className="flex flex-col items-center justify-center p-1.5 bg-white border border-gray-400 rounded-md shadow-xs">
      <QRCodeSVG
        value={upiUrl}
        size={size}
        level="M"
        includeMargin={false}
      />
      <span className="text-[8.5px] font-bold text-gray-800 mt-1 uppercase tracking-tight text-center">
        Scan & Pay UPI
      </span>
      <span className="text-[7.5px] font-mono text-blue-700 max-w-[85px] truncate text-center font-medium">
        {cleanUpi}
      </span>
    </div>
  );
};

