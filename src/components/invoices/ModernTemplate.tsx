'use client';

import React from 'react';
import { CompanyProfile, Invoice } from '@/lib/types';
import { formatIndianCurrency, numberToIndianWords, getInvoiceFontFamily, getDocumentMeta } from '@/lib/gstUtils';
import { UpiQrCode } from './UpiQrCode';

export const ModernTemplate: React.FC<{ invoice: Invoice; company: CompanyProfile }> = ({ invoice, company }) => {
  const party = invoice.party;
  const isInterState = invoice.isInterState;
  const activeFontFamily = getInvoiceFontFamily(company.invoiceFont);
  const docMeta = getDocumentMeta(invoice.docType, 'en');

  return (
    <div 
      id="printable-invoice" 
      className="bg-white text-slate-900 font-sans text-xs max-w-[850px] mx-auto p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-full"
      style={{ fontFamily: activeFontFamily }}
    >
      {/* Header Banner */}
      <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-14 h-14 object-contain rounded-xl border border-slate-200 p-1 bg-white shadow-xs shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                🌾
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{company.name}</h1>
              <p className="text-indigo-600 font-medium text-xs">Krishi Upaj Mandi Vyapari & Commission Agent</p>
            </div>
          </div>
          <div className="mt-2 text-slate-600 text-xs space-y-0.5 max-w-md">
            <p>{company.address}, {company.city}, {company.state} - {company.pincode}</p>
            <p><span className="font-semibold text-slate-700">GSTIN:</span> <span className="font-mono text-indigo-700 font-bold">{company.gstin}</span> | <span className="font-semibold text-slate-700">PAN:</span> {company.pan}</p>
            <p>Phone: {company.phone} | Email: {company.email}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2 text-right">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">{docMeta.title}</span>
            <span className="text-xl font-black text-slate-900 font-mono">
              {invoice.invoiceNumber.startsWith('EST-') || invoice.invoiceNumber.startsWith('DC-') || invoice.invoiceNumber.startsWith('CN-')
                ? invoice.invoiceNumber
                : `#${invoice.invoiceNumber}`}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600 space-y-0.5">
            <p><span className="text-slate-500">{docMeta.dateLabel}:</span> <span className="font-semibold text-slate-800">{invoice.invoiceDate}</span></p>
            <p><span className="text-slate-500">{docMeta.dueLabel}:</span> <span className="font-semibold text-rose-600">{invoice.dueDate}</span></p>
            <p><span className="text-slate-500">Place of Supply:</span> <span className="font-semibold">{invoice.placeOfSupply}</span></p>
          </div>
        </div>
      </div>

      {/* Bill To & Dispatch */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="text-[11px] font-bold uppercase text-indigo-700 tracking-wider mb-2">Billed To (ग्राहक विवरण)</h3>
          <p className="font-bold text-slate-900 text-sm">{party.businessName || party.name}</p>
          <p className="text-slate-600 mt-1">{invoice.billingAddress || party.billingAddress}</p>
          <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] grid grid-cols-2 gap-1 text-slate-700">
            <p><span className="font-semibold">GSTIN:</span> {party.gstin || 'Unregistered'}</p>
            <p><span className="font-semibold">Phone:</span> {party.phone || '-'}</p>
            <p><span className="font-semibold">State:</span> {party.state} ({party.stateCode})</p>
            <p><span className="font-semibold">Mandi Shop:</span> {party.mandiShopNo || '-'}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-[11px] font-bold uppercase text-indigo-700 tracking-wider mb-2">Transport & Delivery Info</h3>
            <div className="text-[11px] space-y-1 text-slate-700">
              <p><span className="font-semibold">Vehicle / Gadi No:</span> {invoice.vehicleNo || 'N/A'}</p>
              <p><span className="font-semibold">Bilty / GR No:</span> {invoice.biltyNo || 'N/A'}</p>
              <p><span className="font-semibold">Delivery Destination:</span> {invoice.stationTo || party.city}</p>
            </div>
          </div>
          <div className="mt-2 text-right">
            <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
              invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {invoice.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse mb-6">
        <thead>
          <tr className="bg-indigo-600 text-white text-[11px] uppercase tracking-wider">
            <th className="py-2.5 px-3 rounded-l-lg">#</th>
            <th className="py-2.5 px-3">Item / Commodity</th>
            <th className="py-2.5 px-2 text-center">HSN</th>
            <th className="py-2.5 px-3 text-right">Qty</th>
            <th className="py-2.5 px-3 text-right">Rate</th>
            <th className="py-2.5 px-3 text-right">Taxable</th>
            {!isInterState ? (
              <>
                <th className="py-2.5 px-2 text-right">CGST</th>
                <th className="py-2.5 px-2 text-right">SGST</th>
              </>
            ) : (
              <th className="py-2.5 px-2 text-right">IGST</th>
            )}
            <th className="py-2.5 px-3 text-right rounded-r-lg">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-slate-700">
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50/80">
              <td className="py-3 px-3 font-medium text-slate-500">{idx + 1}</td>
              <td className="py-3 px-3">
                <p className="font-bold text-slate-900">{item.name}</p>
                {item.bags && <p className="text-[10px] text-slate-500">{item.bags} Bori / Bags</p>}
              </td>
              <td className="py-3 px-2 text-center font-mono text-slate-600 text-[11px]">{item.hsnSac}</td>
              <td className="py-3 px-3 text-right font-medium">{item.qty} {item.unit}</td>
              <td className="py-3 px-3 text-right font-medium">₹{item.rate.toFixed(2)}</td>
              <td className="py-3 px-3 text-right font-semibold text-slate-900">₹{item.taxableValue.toFixed(2)}</td>
              {!isInterState ? (
                <>
                  <td className="py-3 px-2 text-right text-xs">₹{item.cgstAmount.toFixed(2)} ({item.cgstPercent}%)</td>
                  <td className="py-3 px-2 text-right text-xs">₹{item.sgstAmount.toFixed(2)} ({item.sgstPercent}%)</td>
                </>
              ) : (
                <td className="py-3 px-2 text-right text-xs">₹{item.igstAmount.toFixed(2)} ({item.igstPercent}%)</td>
              )}
              <td className="py-3 px-3 text-right font-bold text-slate-900">₹{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary & Bank Grid */}
      <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-200">
        <div className="col-span-7 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Amount in Words</span>
            <p className="text-xs font-bold text-slate-900">{numberToIndianWords(invoice.finalAmount)}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
            <div className="space-y-1.5 text-xs text-slate-800 dark:text-slate-200 flex-1">
              <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                Bank & UPI Payment Details
              </p>
              <p><span className="font-bold text-slate-600 dark:text-slate-400 min-w-[80px] inline-block">Bank Name:</span> <span className="font-extrabold text-slate-900 dark:text-white">{company.bankDetails?.bankName || 'HDFC Bank'}</span></p>
              <p><span className="font-bold text-slate-600 dark:text-slate-400 min-w-[80px] inline-block">Branch:</span> <span>{company.bankDetails?.branch || 'Vijay talkies compound neemuch 458441'}</span></p>
              <p><span className="font-bold text-slate-600 dark:text-slate-400 min-w-[80px] inline-block">A/C Name:</span> <span className="font-extrabold uppercase text-slate-900 dark:text-white">{company.bankDetails?.accountName || 'PRO RATHORE TRADING COMPANY'}</span></p>
              <p><span className="font-bold text-slate-600 dark:text-slate-400 min-w-[80px] inline-block">A/C Number:</span> <span className="font-mono font-black text-slate-900 dark:text-white tracking-wider">{company.bankDetails?.accountNumber || '50200098211151'}</span></p>
              <p><span className="font-bold text-slate-600 dark:text-slate-400 min-w-[80px] inline-block">IFSC Code:</span> <span className="font-mono font-black text-slate-900 dark:text-white">{company.bankDetails?.ifsc || 'HDFC0000624'}</span></p>
              <p><span className="font-bold text-slate-600 dark:text-slate-400 min-w-[80px] inline-block">UPI ID:</span> <span className="text-indigo-600 dark:text-indigo-400 font-mono font-black">{company.bankDetails?.upiId || '7024537491@ybl'}</span></p>
            </div>
            <div className="shrink-0">
              <UpiQrCode
                upiId={company.bankDetails?.upiId || '7024537491@ybl'}
                accountName={company.bankDetails?.accountName || 'PRO RATHORE TRADING COMPANY'}
                amount={invoice.finalAmount}
                invoiceNumber={invoice.invoiceNumber}
                size={85}
              />
            </div>
          </div>
        </div>

        <div className="col-span-5 space-y-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Item Taxable Subtotal</span>
              <span className="font-medium">₹{invoice.taxableAmount.toFixed(2)}</span>
            </div>
            {invoice.transportCharges > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Transport / Gadi Bhada</span>
                <span className="font-medium">₹{invoice.transportCharges.toFixed(2)}</span>
              </div>
            )}
            {invoice.otherCharges > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>{invoice.otherChargesLabel || 'Katoti / Other (कट्ट)'}</span>
                <span className="font-medium">₹{invoice.otherCharges.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-700 font-semibold pt-1 border-t border-slate-200">
              <span>Total Taxable Amount</span>
              <span>₹{invoice.totalTaxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total GST Tax ({isInterState ? 'IGST' : 'CGST+SGST'})</span>
              <span className="font-medium">₹{invoice.totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-indigo-700 pt-2 border-t-2 border-indigo-600">
              <span>Grand Total</span>
              <span>{formatIndianCurrency(invoice.finalAmount)}</span>
            </div>
            {invoice.paidAmount > 0 && (
              <div className="flex justify-between text-xs font-bold text-emerald-700 pt-1.5 border-t border-slate-200">
                <span>Less : Paid Amount (जमा राशि)</span>
                <span>-{formatIndianCurrency(invoice.paidAmount)}</span>
              </div>
            )}
            <div className={`flex justify-between text-sm font-black pt-1.5 border-t-2 ${
              invoice.balanceAmount <= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              <span>Balance Due (शेष बाकी लेना)</span>
              <span>{invoice.balanceAmount > 0 ? formatIndianCurrency(invoice.balanceAmount) : '₹0.00 (पूरा चुकता)'}</span>
            </div>
          </div>

          <div className="text-center pt-6">
            <p className="text-[10px] text-slate-500 font-medium">For {company.name}</p>
            <div className="h-10"></div>
            <p className="text-[11px] font-bold text-slate-800 border-t border-slate-300 inline-block px-6 pt-1">
              Authorized Signatory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
