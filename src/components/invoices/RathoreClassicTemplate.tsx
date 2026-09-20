'use client';

import React from 'react';
import { CompanyProfile, Invoice } from '@/lib/types';
import { formatIndianCurrency, numberToIndianWords, getInvoiceFontFamily } from '@/lib/gstUtils';
import { UpiQrCode } from './UpiQrCode';

interface InvoiceTemplateProps {
  invoice: Invoice;
  company: CompanyProfile;
}

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
}

export const RathoreClassicTemplate: React.FC<InvoiceTemplateProps> = ({ invoice, company }) => {
  const party = invoice.party;
  const isInterState = invoice.isInterState;
  const totalInWordsText = invoice.totalInWords || numberToIndianWords(invoice.finalAmount);
  const activeFontFamily = getInvoiceFontFamily(company.invoiceFont);

  return (
    <div 
      id="printable-invoice" 
      className="bg-white text-black font-sans text-[11px] leading-tight max-w-[820px] mx-auto p-4 sm:p-6 border border-gray-400 shadow-md print:shadow-none print:border-none print:p-2 print:max-w-full"
      style={{ fontFamily: activeFontFamily }}
    >
      {/* 1. Header Section */}
      <div className="flex justify-between items-start pb-4 pt-1 border-b-2 border-black">
        {/* Left: Logo & Company Address */}
        <div className="flex items-start gap-4">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-16 h-16 object-contain rounded-xl border border-gray-300 p-1 shrink-0 bg-white"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-black text-lg border-2 border-gray-400 shrink-0 shadow-xs">
              {company.name
                ? company.name
                    .split(' ')
                    .filter(Boolean)
                    .map((w) => w[0])
                    .slice(0, 3)
                    .join('')
                    .toUpperCase()
                : 'RTC'}
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-black tracking-tight leading-tight">
              {company.name || 'Rathore Trading Company'}
            </h1>
            <p className="text-gray-900 text-[11px] leading-snug">
              {company.address || 'House No 246, Ward No 11, Bisalwaskalan'}
            </p>
            <p className="text-gray-900 text-[11px] leading-snug">
              {company.city}, {company.state} - {company.pincode}
            </p>
            {company.phoneExtra && (
              <p className="text-gray-900 text-[11px] font-medium leading-snug">
                <span className="font-semibold text-black">Tel / Phone :</span> {company.phoneExtra}
              </p>
            )}
            {company.mandiLicenseNo && (
              <p className="text-gray-900 text-[10.5px] font-medium leading-snug">
                <span className="font-semibold text-black">Mandi License No. :</span> {company.mandiLicenseNo}
              </p>
            )}
          </div>
        </div>

        {/* Right: Contact Details */}
        <div className="text-right text-[11px] text-gray-800 space-y-1 shrink-0 pl-4">
          <p><span className="font-bold text-black">Name :</span> {company.ownerName || 'Kundan Rathore'}</p>
          <p><span className="font-bold text-black">Phone :</span> {company.phone || company.email}</p>
          <p><span className="font-bold text-black">Email :</span> {company.email}</p>
          <p><span className="font-bold text-black">Website :</span> {company.website || 'www.rathoretradingcompany.co.in'}</p>
        </div>
      </div>

      {/* 2. Sub-Header Bar (GSTIN | TAX INVOICE | ORIGINAL FOR RECIPIENT) */}
      <div className="grid grid-cols-3 items-center py-2 px-3 bg-gray-50 border-x border-b border-black font-semibold text-[11px]">
        <div>
          <span className="font-bold text-black">GSTIN :</span> <span className="font-mono font-bold">{company.gstin}</span>
        </div>
        <div className="text-center text-[#0284c7] text-base font-black tracking-wider">
          TAX INVOICE
        </div>
        <div className="text-right text-[10.5px] uppercase font-bold tracking-wide text-gray-900">
          ORIGINAL FOR RECIPIENT
        </div>
      </div>

      {/* 3. Customer & Invoice Info Table */}
      <div className="grid grid-cols-2 border-x border-b border-black text-[11px]">
        {/* Left Column: Customer Details */}
        <div className="border-r border-black">
          <div className="bg-[#f0f9ff] text-center font-bold py-1.5 border-b border-black text-[11px] text-gray-900">
            Customer Detail
          </div>
          <div className="p-3 space-y-1.5">
            <div className="flex">
              <span className="font-bold text-black w-24 shrink-0">M/S :</span>
              <span className="font-bold text-black">{party.businessName || party.name}</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-gray-900 w-24 shrink-0">Address :</span>
              <span className="text-gray-900">{invoice.billingAddress || party.billingAddress}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-900 w-24 shrink-0">Phone :</span>
              <span className="text-gray-900">{party.phone || '-'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-900 w-24 shrink-0">GSTIN :</span>
              <span className="font-bold font-mono text-gray-900">{party.gstin || '-'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-900 w-24 shrink-0">PAN :</span>
              <span className="text-gray-900 font-mono">{party.pan || (party.gstin ? party.gstin.substring(2, 12) : '-')}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-900 w-24 shrink-0">Place of Supply :</span>
              <span className="font-medium text-gray-900">{invoice.placeOfSupply || `${party.state} ( ${party.stateCode} )`}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Invoice Details */}
        <div>
          <div className="p-3 space-y-1.5">
            <div className="flex justify-between items-center py-1 border-b border-gray-200">
              <span className="font-bold text-gray-900">Invoice No. :</span>
              <span className="font-black text-black text-sm font-mono">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-200">
              <span className="font-bold text-gray-900">Invoice Date :</span>
              <span className="font-semibold text-gray-900">{formatDateDisplay(invoice.invoiceDate)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-200">
              <span className="font-bold text-gray-900">Due Date :</span>
              <span className="font-semibold text-gray-900">{formatDateDisplay(invoice.dueDate)}</span>
            </div>
            {invoice.vehicleNo && (
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="font-semibold text-gray-900">Vehicle / Gadi No. :</span>
                <span className="font-bold text-black uppercase">{invoice.vehicleNo}</span>
              </div>
            )}
            {invoice.biltyNo && (
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-gray-900">Bilty / GR No. :</span>
                <span className="font-medium text-black">{invoice.biltyNo}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Products Table */}
      <table className="w-full border-x border-b border-black text-[10.5px] border-collapse">
        <thead>
          <tr className="bg-[#e0f2fe] text-black font-bold border-b border-black text-center">
            <th className="py-1 px-1 border-r border-black w-8">Sr.<br/>No.</th>
            <th className="py-1 px-2 border-r border-black text-left">Name of Product / Service</th>
            <th className="py-1 px-1 border-r border-black w-18">HSN / SAC</th>
            <th className="py-1 px-1 border-r border-black w-16">Qty</th>
            <th className="py-1 px-1 border-r border-black w-16">Rate</th>
            <th className="py-1 px-2 border-r border-black w-22 text-right">Taxable Value</th>
            {!isInterState ? (
              <>
                <th className="py-1 px-0.5 border-r border-black" colSpan={2}>
                  <div>CGST</div>
                  <div className="grid grid-cols-2 text-[9px] border-t border-black font-semibold">
                    <span className="border-r border-black py-0.5">%</span>
                    <span className="py-0.5">Amount</span>
                  </div>
                </th>
                <th className="py-1 px-0.5 border-r border-black" colSpan={2}>
                  <div>SGST</div>
                  <div className="grid grid-cols-2 text-[9px] border-t border-black font-semibold">
                    <span className="border-r border-black py-0.5">%</span>
                    <span className="py-0.5">Amount</span>
                  </div>
                </th>
              </>
            ) : (
              <th className="py-1 px-0.5 border-r border-black" colSpan={2}>
                <div>IGST</div>
                <div className="grid grid-cols-2 text-[9px] border-t border-black font-semibold">
                  <span className="border-r border-black py-0.5">%</span>
                  <span className="py-0.5">Amount</span>
                </div>
              </th>
            )}
            <th className="py-1 px-2 w-24 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={item.id || idx} className="border-b border-gray-300 align-top min-h-[30px]">
              <td className="py-1.5 px-1 border-r border-black text-center">{idx + 1}</td>
              <td className="py-1.5 px-2 border-r border-black font-semibold text-black">
                {item.name}
                {item.bags ? (
                  <span className="block text-[9.5px] text-gray-600 font-normal">
                    ({item.bags} Bags / बोरी)
                  </span>
                ) : null}
              </td>
              <td className="py-1.5 px-1 border-r border-black text-center font-mono">{item.hsnSac}</td>
              <td className="py-1.5 px-1 border-r border-black text-right font-medium">
                {item.qty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-1.5 px-1 border-r border-black text-right font-medium">
                {item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-1.5 px-2 border-r border-black text-right font-semibold">
                {item.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              {!isInterState ? (
                <>
                  <td className="py-1.5 px-1 border-r border-black text-center text-[10px]">
                    {item.cgstPercent.toFixed(2)}
                  </td>
                  <td className="py-1.5 px-1 border-r border-black text-right text-[10px]">
                    {item.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1.5 px-1 border-r border-black text-center text-[10px]">
                    {item.sgstPercent.toFixed(2)}
                  </td>
                  <td className="py-1.5 px-1 border-r border-black text-right text-[10px]">
                    {item.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </>
              ) : (
                <>
                  <td className="py-1.5 px-1 border-r border-black text-center text-[10px]">
                    {item.igstPercent.toFixed(2)}
                  </td>
                  <td className="py-1.5 px-1 border-r border-black text-right text-[10px]">
                    {item.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </>
              )}
              <td className="py-1.5 px-2 text-right font-bold text-black">
                {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}

          {/* Fill blank rows for height balance like reference bill */}
          {invoice.items.length < 3 && (
            <tr className="h-16 border-b border-gray-200">
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              {!isInterState && (
                <>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                </>
              )}
              <td></td>
            </tr>
          )}

          {/* Total Row */}
          <tr className="bg-[#f0f9ff] font-bold border-t-2 border-b border-black text-black">
            <td colSpan={3} className="py-1.5 px-2 border-r border-black text-right uppercase">
              Total
            </td>
            <td className="py-1.5 px-1 border-r border-black text-right">
              {invoice.totalQty.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
            <td className="border-r border-black"></td>
            <td className="py-1.5 px-2 border-r border-black text-right">
              {invoice.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
            {!isInterState ? (
              <>
                <td className="border-r border-black"></td>
                <td className="py-1.5 px-1 border-r border-black text-right">
                  {invoice.totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="border-r border-black"></td>
                <td className="py-1.5 px-1 border-r border-black text-right">
                  {invoice.totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </>
            ) : (
              <>
                <td className="border-r border-black"></td>
                <td className="py-1.5 px-1 border-r border-black text-right">
                  {invoice.totalIgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </>
            )}
            <td className="py-1.5 px-2 text-right text-black font-extrabold">
              {(invoice.taxableAmount + invoice.totalTax).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 5. Bottom Section: Total in Words, Bank Details, Charges & Signatory */}
      <div className="grid grid-cols-12 border-x border-b border-black text-[10.5px]">
        {/* Left 7 Columns: Total in Words, Bank Details, UPI QR, Terms */}
        <div className="col-span-7 border-r border-black flex flex-col justify-between">
          {/* Total in Words */}
          <div className="border-b border-black">
            <div className="bg-[#f0f9ff] text-center font-bold py-1 border-b border-black text-[11px]">
              Total in words
            </div>
            <div className="p-2.5 font-bold text-gray-900 leading-snug">
              {totalInWordsText}
            </div>
          </div>

          {/* Bank Details & QR */}
          <div className="border-b border-black">
            <div className="bg-[#f0f9ff] text-center font-bold py-1 border-b border-black text-[11px]">
              Bank Details
            </div>
            <div className="p-3 grid grid-cols-3 gap-3 items-center">
              <div className="col-span-2 space-y-1 text-[10.5px]">
                <p><span className="font-semibold text-black">Name :</span> {company.bankDetails?.bankName || 'HDFC Bank'}</p>
                <p><span className="font-semibold text-black">Branch :</span> {company.bankDetails?.branch || 'Vijay talkies compound neemuch'}</p>
                <p><span className="font-semibold text-black">Acc. Name :</span> <span className="font-bold">{company.bankDetails?.accountName || company.name}</span></p>
                <p><span className="font-semibold text-black">Acc. Number :</span> <span className="font-bold font-mono text-black">{company.bankDetails?.accountNumber || '50200098211151'}</span></p>
                <p><span className="font-semibold text-black">IFSC :</span> <span className="font-mono font-bold text-black">{company.bankDetails?.ifsc || 'HDFC0000624'}</span></p>
                <p><span className="font-semibold text-black">UPI ID :</span> <span className="text-blue-700 font-bold font-mono">{company.bankDetails?.upiId || '9340829951@hdfcbank'}</span></p>
              </div>
              <div className="col-span-1 flex justify-center">
                <UpiQrCode
                  upiId={company.bankDetails?.upiId || '9340829951@hdfcbank'}
                  accountName={company.bankDetails?.accountName || company.name}
                  amount={invoice.finalAmount}
                  invoiceNumber={invoice.invoiceNumber}
                  size={80}
                />
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="p-3 text-[9.5px] text-gray-800 space-y-1 leading-normal">
            <p>• Subject to our home Jurisdiction {company.jurisdiction || 'Neemuch'}.</p>
            <p>• Our Responsibility Ceases as soon as goods leaves our Premises.</p>
            <p>• Goods once sold will not taken back.</p>
            <p>• Delivery Ex-Premises.</p>
          </div>
        </div>

        {/* Right 5 Columns: Tax Calculation & Signatory */}
        <div className="col-span-5 flex flex-col justify-between">
          <div className="text-[10.5px]">
            <div className="flex justify-between py-1.5 px-3 border-b border-gray-300">
              <span className="font-semibold text-gray-900">Taxable Amount</span>
              <span className="font-bold">{invoice.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between py-1.5 px-3 border-b border-gray-300">
              <span className="text-gray-900 font-medium">Transport charges</span>
              <span className="font-semibold">{(invoice.transportCharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between py-1.5 px-3 border-b border-gray-300">
              <span className="text-gray-900 font-medium">{invoice.otherChargesLabel || 'All other charges (कट्ट)'}</span>
              <span className="font-semibold">{(invoice.otherCharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between py-1.5 px-3 border-b border-black bg-gray-50 font-bold">
              <span>Total Taxable Amount</span>
              <span>{invoice.totalTaxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {!isInterState ? (
              <>
                <div className="flex justify-between py-1.5 px-3 border-b border-gray-200">
                  <span className="text-gray-900 font-medium">Add : CGST</span>
                  <span className="font-semibold">{invoice.totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1.5 px-3 border-b border-gray-200">
                  <span className="text-gray-900 font-medium">Add : SGST</span>
                  <span className="font-semibold">{invoice.totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between py-1.5 px-3 border-b border-gray-200">
                <span className="text-gray-900 font-medium">Add : IGST</span>
                <span className="font-semibold">{invoice.totalIgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex justify-between py-1.5 px-3 border-b border-black font-bold">
              <span>Total Tax</span>
              <span>{invoice.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between py-2 px-3 border-b-2 border-black bg-[#e0f2fe] text-black font-black text-[13px]">
              <span>Total Amount After Tax</span>
              <span>{formatIndianCurrency(invoice.finalAmount)}</span>
            </div>
            <div className="text-right px-3 py-1 text-[9.5px] text-gray-600 italic">
              (E & O.E.)
            </div>
          </div>

          {/* Signatory Block */}
          <div className="border-t border-black text-center pt-2 pb-3 px-3">
            <p className="text-[9px] text-gray-700">Certified that the particulars given above are true and correct.</p>
            <p className="font-bold text-black text-[11px] mt-1">For {company.name}</p>
            <div className="h-12"></div>
            <p className="text-[10px] font-semibold border-t border-gray-400 inline-block px-5 pt-1 text-gray-900">
              Authorised Signatory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
