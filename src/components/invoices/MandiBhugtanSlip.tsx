'use client';

import React from 'react';
import { CompanyProfile, MandiSaudaSlip, Invoice } from '@/lib/types';

interface MandiBhugtanSlipProps {
  // Can accept either a MandiSaudaSlip or an Invoice
  slip?: MandiSaudaSlip;
  invoice?: Invoice;
  company: CompanyProfile;
  showPaidStamp?: boolean;
}

export const MandiBhugtanSlip: React.FC<MandiBhugtanSlipProps> = ({
  slip,
  invoice,
  company,
  showPaidStamp = false,
}) => {
  // Normalize fields whether passed an invoice or a sauda slip
  const isInvoice = !!invoice;

  const vchNo = slip?.saudaNumber 
    ? (slip.saudaNumber.startsWith('0-') ? slip.saudaNumber : `0-${slip.saudaNumber.replace(/[^0-9]/g, '') || '20340'}`)
    : (invoice ? (invoice.invoiceNumber.startsWith('0-') ? invoice.invoiceNumber : `0-${invoice.invoiceNumber.replace(/[^0-9]/g, '') || '20340'}`) : '0-20340');

  const rawDate = slip?.date || invoice?.invoiceDate || new Date().toISOString().split('T')[0];
  const dateFormatted = rawDate.includes('-')
    ? rawDate.split('-').reverse().join('/')
    : rawDate;

  // Seller / Party info
  const rawPartyName = slip?.partyName || invoice?.party?.businessName || invoice?.party?.name || 'KUNDAN';
  const fatherName = slip?.sellerFatherName || 'MUKESH RATHORE';
  const village = slip?.village || invoice?.party?.city || 'BISALWASKALA';
  const sellerDisplayName = slip?.sellerFatherName 
    ? `${rawPartyName} S/O ${fatherName}- , ${village}`
    : (rawPartyName.includes('S/O') ? rawPartyName : `${rawPartyName} S/O ${fatherName}- , ${village}`);

  const phone = slip?.partyPhone || invoice?.party?.phone || '9993782187';
  const anubandhNo = slip?.anubandhNo || '2051/97';
  const tulaiNo = slip?.tulaiNo || '';
  const entryPno = slip?.entryPassNo || '';
  const aadharNo = slip?.aadharNo || '';
  const bhavantar = slip?.bhavantar || '';
  const kisanOpt = slip?.kisanOpt || '';

  // Item details
  const commodity = slip?.commodity || invoice?.items?.[0]?.name || 'ISABGOL';
  const bags = slip?.bags || invoice?.totalBags || invoice?.items?.[0]?.bags || 17;
  const bagWeightKg = slip?.bagWeightKg || company.mandiDefaults?.defaultBagWeightKg || 60;
  const kattaCount = slip?.kattaCount || 1;
  const kattaWeightKg = slip?.kattaWeightKg || bags; // e.g. 17 kg total tare for 17 bags

  // Weight (in Quintals)
  const weightQtl = slip?.netWeightQuintal 
    ? slip.netWeightQuintal.toFixed(3)
    : (invoice ? (invoice.totalQty / 100).toFixed(3) : (bags * bagWeightKg / 100).toFixed(3));

  // Rate per Quintal
  const ratePerQtl = slip?.ratePerQuintal 
    ? slip.ratePerQuintal 
    : (invoice?.items?.[0]?.rate ? (invoice.items[0].rate < 1000 ? invoice.items[0].rate * 100 : invoice.items[0].rate) : 12050);

  // Amounts
  const grossAmount = slip?.totalAmount 
    ? slip.totalAmount 
    : (invoice ? invoice.taxableAmount : (parseFloat(weightQtl) * ratePerQtl));

  const hammaliDeduction = slip?.hammaliAmount !== undefined 
    ? slip.hammaliAmount 
    : (slip?.katotiAmount || 162.00);

  const netPayable = slip?.netPayable 
    ? slip.netPayable 
    : (invoice ? invoice.finalAmount : Math.max(0, grossAmount - hammaliDeduction));

  // Payment method
  const paymentMode = slip?.paymentMode || invoice?.paymentMode || 'NEFT';
  const activeBank = invoice?.bankDetails || company.bankDetails;
  const ifsc = slip?.bankIfsc || activeBank?.ifsc || 'HDFC0000624';
  const accountNo = slip?.bankAccountNo || activeBank?.accountNumber || '50100757992379';
  const isCash = paymentMode.toLowerCase() === 'cash';

  const bankPay = isCash ? 0 : netPayable;
  const cashPay = isCash ? netPayable : 0;
  const isPaid = slip?.isPaid !== false;

  return (
    <div className="bg-white text-black font-mono text-[11px] leading-[1.3] p-4 max-w-[320px] mx-auto border border-gray-300 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-[80mm] print:w-full select-none">
      {/* Top Header */}
      <div className="text-center pb-1.5 border-b border-black">
        <p className="text-[11px] font-medium tracking-wide">|| Krishi Upaj Mandi Samiti ||</p>
        <p className="text-[11px] font-bold">|| Bhugtan Patrak ||</p>
        <p className="text-[9px] text-gray-700">Propharma IV 17(4)</p>
        
        <h1 className="font-extrabold text-[13px] tracking-tight uppercase mt-0.5">
          {company.name || 'AMAN AGRO INDUSTRIES'}
        </h1>
        
        <p className="text-[10px]">
          {company.city || 'NEEMUCH'}({company.state === 'Madhya Pradesh' ? 'M.P.' : (company.state || 'M.P.')}) Mob:{company.phone || '7089076822'}
        </p>
        
        <p className="text-[10px] font-bold">
          LICENSE No. {company.mandiLicenseNo || 'A-124'}
        </p>
      </div>

      {/* Metadata Section */}
      <div className="py-2 border-b border-black text-[10px] space-y-1">
        <div className="flex justify-between items-center">
          <div><span className="font-semibold">Vch No</span> : {vchNo}</div>
          <div><span className="font-semibold">Date</span> : {dateFormatted}</div>
        </div>

        <div className="text-[9.5px] leading-tight">
          <span className="font-semibold">Seller</span> : <span className="font-bold uppercase">{sellerDisplayName}</span>
        </div>

        <div className="flex justify-between items-center text-[10px]">
          <div><span className="font-semibold">Anubandh No</span> : {anubandhNo}</div>
          <div><span className="font-semibold">Mob</span> : {phone}</div>
        </div>

        <div className="flex justify-between items-center text-[10px]">
          <div><span className="font-semibold">Bhavantar</span> : {bhavantar}</div>
          <div><span className="font-semibold">T.No.</span> : {tulaiNo}</div>
        </div>

        <div className="flex justify-between items-center text-[10px]">
          <div><span className="font-semibold">Kisan Opt</span> : {kisanOpt}</div>
          <div><span className="font-semibold">Entry Pno</span>: {entryPno}</div>
        </div>

        <div className="text-[10px]">
          <span className="font-semibold">Aadhar No.</span> : {aadharNo}
        </div>
      </div>

      {/* Item Table */}
      <div className="my-1.5 border-t border-b border-black border-dashed py-1">
        <div className="grid grid-cols-12 text-[10px] font-bold border-b border-black pb-0.5 mb-1 text-center">
          <div className="col-span-4 text-left">Item</div>
          <div className="col-span-3 text-right">Weight</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-3 text-right">Amount</div>
        </div>

        <div className="grid grid-cols-12 text-[10px] items-start">
          <div className="col-span-4">
            <div className="font-bold uppercase">{commodity}</div>
            <div className="text-[9px] text-gray-800">Bag {bags} x {bagWeightKg}</div>
            <div className="text-[9px] text-gray-800">Katta {kattaCount} x {kattaWeightKg}</div>
          </div>
          <div className="col-span-3 text-right font-mono font-medium pt-0.5">
            {weightQtl}
          </div>
          <div className="col-span-2 text-right font-mono font-medium pt-0.5">
            {ratePerQtl}
          </div>
          <div className="col-span-3 text-right font-mono font-bold pt-0.5">
            {grossAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Totals & Deductions */}
      <div className="border-b border-black pb-1.5 space-y-0.5 text-[10.5px]">
        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-mono">{grossAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span>Less: Hammali</span>
          <span className="font-mono">{hammaliDeduction.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center font-extrabold text-[12px] pt-1 border-t border-black">
          <span>Net Amount</span>
          <span className="font-mono">{netPayable.toFixed(2)}</span>
        </div>
      </div>

      {/* Paid Stamp & Bank Details Section */}
      <div className="relative py-2 border-b border-black text-[9.5px] space-y-0.5">
        {/* Authentic PAID Stamp badge (hidden by default on thermal receipts) */}
        {showPaidStamp && isPaid && (
          <div className="absolute right-4 top-1 -rotate-6 pointer-events-none opacity-85">
            <div className="border-2 border-purple-800 text-purple-900 font-black tracking-widest text-xs px-2 py-0.5 rounded-xs uppercase shadow-2xs">
              PAID
            </div>
          </div>
        )}

        <div>
          <span className="font-semibold">Bank Pay.:</span> {bankPay.toFixed(2)} <span className="font-semibold ml-1">IFSC :</span>{ifsc}
        </div>

        <div className="pl-6">
          <span className="font-semibold">A/C No. :</span>{accountNo}
        </div>

        <div>
          <span className="font-semibold">Cash Pay.:</span> {cashPay.toFixed(2)}/-
        </div>
      </div>

      {/* Bottom Signature Area */}
      <div className="pt-8 text-right text-[10px]">
        <span className="border-t border-dashed border-black pt-1 inline-block min-w-[90px] text-center font-medium">
          Seller Sign.
        </span>
      </div>
    </div>
  );
};
