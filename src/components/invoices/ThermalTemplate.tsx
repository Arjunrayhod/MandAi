'use client';

import React from 'react';
import { CompanyProfile, Invoice } from '@/lib/types';
import { formatIndianCurrency } from '@/lib/gstUtils';
import { UpiQrCode } from './UpiQrCode';

export const ThermalTemplate: React.FC<{ invoice: Invoice; company: CompanyProfile }> = ({ invoice, company }) => {
  return (
    <div 
      id="printable-invoice" 
      className="bg-white text-black font-mono text-[11px] max-w-[320px] mx-auto p-4 border border-dashed border-gray-400 shadow-sm print:shadow-none print:border-none print:p-0 print:max-w-full"
    >
      <div className="text-center pb-2 border-b border-dashed border-black">
        {company.logoUrl && (
          <img
            src={company.logoUrl}
            alt={company.name}
            className="w-12 h-12 object-contain mx-auto mb-1"
          />
        )}
        <h2 className="font-bold text-sm uppercase">{company.name}</h2>
        <p className="text-[10px]">{company.city}, {company.state}</p>
        <p className="text-[10px]">GSTIN: {company.gstin}</p>
        <p className="text-[10px]">Mo: {company.phone}</p>
      </div>

      <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>Bill No: #{invoice.invoiceNumber}</span>
          <span>Date: {invoice.invoiceDate}</span>
        </div>
        <div>
          <span>Party: </span>
          <span className="font-bold">{invoice.party.businessName || invoice.party.name}</span>
        </div>
        {invoice.vehicleNo && <div>Gadi No: {invoice.vehicleNo}</div>}
      </div>

      <table className="w-full my-2 text-[10px]">
        <thead>
          <tr className="border-b border-black text-left">
            <th>Item</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Rate</th>
            <th className="text-right">Amt</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td>
                <div className="font-bold">{item.name}</div>
                {item.bags && <div className="text-[9px]">({item.bags} Bori)</div>}
              </td>
              <td className="text-right">{item.qty}</td>
              <td className="text-right">{item.rate}</td>
              <td className="text-right font-bold">{item.total.toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed border-black pt-2 text-[10px] space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{invoice.taxableAmount.toFixed(2)}</span>
        </div>
        {invoice.transportCharges > 0 && (
          <div className="flex justify-between">
            <span>Bhada/Transport:</span>
            <span>₹{invoice.transportCharges.toFixed(2)}</span>
          </div>
        )}
        {invoice.otherCharges > 0 && (
          <div className="flex justify-between">
            <span>Katoti (कट्ट):</span>
            <span>₹{invoice.otherCharges.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>GST Tax:</span>
          <span>₹{invoice.totalTax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
          <span>NET AMOUNT:</span>
          <span>{formatIndianCurrency(invoice.finalAmount)}</span>
        </div>
      </div>

      {/* Bank & UPI Details */}
      <div className="my-2 border border-black p-2 text-[10px] space-y-1">
        <p className="font-bold text-center border-b border-black pb-0.5 uppercase tracking-wide">Bank Details</p>
        <p><span className="font-bold">Bank:</span> {company.bankDetails?.bankName || 'HDFC Bank'}</p>
        <p><span className="font-bold">Branch:</span> {company.bankDetails?.branch || 'Vijay talkies compound neemuch 458441'}</p>
        <p><span className="font-bold">A/C:</span> <span className="font-bold font-mono">{company.bankDetails?.accountNumber || '50200098211151'}</span></p>
        <p><span className="font-bold">IFSC:</span> <span className="font-bold font-mono">{company.bankDetails?.ifsc || 'HDFC0000624'}</span></p>
        <p><span className="font-bold">UPI ID:</span> <span className="font-bold font-mono">{company.bankDetails?.upiId || '7024537491@ybl'}</span></p>
      </div>

      <div className="my-2 flex flex-col items-center justify-center">
        <UpiQrCode
          upiId={company.bankDetails?.upiId || '7024537491@ybl'}
          accountName={company.bankDetails?.accountName || 'PRO RATHORE TRADING COMPANY'}
          amount={invoice.finalAmount}
          invoiceNumber={invoice.invoiceNumber}
          size={75}
        />
      </div>

      <div className="text-center text-[9px] border-t border-dashed border-black pt-2">
        <p>माल मंडी नियमों के अनुसार बिका।</p>
        <p>धन्यवाद! फिर पधारें।</p>
      </div>
    </div>
  );
};
