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
  size = 85,
}) => {
  if (!upiId || !upiId.trim()) return null;

  // Clean and encode parameters for 100% universal UPI compatibility across all apps (GPay, PhonePe, Paytm, BHIM, Navi)
  const cleanUpi = upiId.trim();
  const safeName = (accountName || 'Merchant').replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const safeNote = (invoiceNumber || 'Bill').replace(/[^a-zA-Z0-9]/g, '');

  // Universal standard UPI URL (no + characters, proper %20 encoding, no unverified merchant flags)
  let upiUrl = `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(safeName)}&cu=INR`;

  if (safeNote) {
    upiUrl += `&tn=${encodeURIComponent('Bill ' + safeNote)}`;
  }

  // Include amount only if within standard retail UPI transaction limits (<= ₹1,00,000)
  if (amount > 0 && amount <= 100000) {
    upiUrl += `&am=${amount.toFixed(2)}`;
  }

  return (
    <div className="flex flex-col items-center justify-center p-1 bg-white border border-gray-400 rounded shadow-xs">
      <QRCodeSVG
        value={upiUrl}
        size={size}
        level="M"
        includeMargin={true}
      />
      <span className="text-[8.5px] font-bold text-gray-800 mt-0.5 uppercase tracking-tight text-center">
        Scan & Pay UPI
      </span>
      <span className="text-[7.5px] font-mono text-blue-700 max-w-[85px] truncate text-center font-semibold">
        {cleanUpi}
      </span>
    </div>
  );
};


