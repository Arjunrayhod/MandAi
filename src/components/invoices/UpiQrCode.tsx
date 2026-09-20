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

  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    accountName || 'Merchant'
  )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Inv #${invoiceNumber}`)}`;

  return (
    <div className="flex flex-col items-center justify-center p-1 bg-white border border-gray-300 rounded shadow-xs">
      <QRCodeSVG
        value={upiUrl}
        size={size}
        level="M"
        includeMargin={false}
      />
      <span className="text-[9px] font-semibold text-gray-700 mt-1 uppercase tracking-tight">
        Pay using UPI
      </span>
    </div>
  );
};
