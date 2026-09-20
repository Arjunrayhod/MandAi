export type BusinessType = 
  | 'mandi_vyapar' 
  | 'trading' 
  | 'kirana' 
  | 'clothing' 
  | 'hardware' 
  | 'medical' 
  | 'restaurant' 
  | 'services';

export type InvoiceTemplateType = 
  | 'classic_rathore' 
  | 'modern_mandi' 
  | 'minimal_black' 
  | 'thermal_pos'
  | 'gogst_corporate';

export type DocumentType = 
  | 'tax_invoice' 
  | 'quotation_estimate' 
  | 'delivery_challan' 
  | 'credit_note' 
  | 'debit_note' 
  | 'sauda_slip';

export interface BankDetails {
  bankName: string;
  branch: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  phoneExtra?: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  pan: string;
  mandiLicenseNo?: string;
  logoUrl?: string;
  signatoryName: string;
  terms: string[];
  jurisdiction: string;
  bankDetails: BankDetails;
  businessType: BusinessType;
  invoiceTemplate: InvoiceTemplateType;
  currencySymbol: string;
  invoicePrefix: string;
  invoiceNextNumber: number;
}

export interface Party {
  id: string;
  type: 'customer' | 'supplier' | 'both' | 'farmer';
  name: string;
  businessName: string;
  phone: string;
  email?: string;
  billingAddress: string;
  dispatchAddress?: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin?: string;
  pan?: string;
  mandiShopNo?: string;
  openingBalance: number;
  balanceType: 'to_receive' | 'to_pay';
  currentBalance: number;
  creditLimit?: number;
  paymentTermsDays: number;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  hindiName?: string;
  sku: string;
  barcode?: string;
  hsnSac: string;
  category: string;
  unit: 'Kg' | 'Quintal' | 'Bags / Bori' | 'Metric Ton' | 'Pcs';
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  currentStock: number;
  bagCount?: number;
  bagWeightKg?: number;
  minStockLevel: number;
  qualityGrade?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  name: string;
  hsnSac: string;
  qty: number;
  unit: string;
  bags?: number;
  rate: number;
  ratePer?: string;
  discountPercent?: number;
  discountAmount?: number;
  taxableValue: number;
  cgstPercent: number;
  cgstAmount: number;
  sgstPercent: number;
  sgstAmount: number;
  igstPercent: number;
  igstAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  docType?: DocumentType; // 'tax_invoice' | 'quotation_estimate' | 'delivery_challan' | 'credit_note'
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  partyId: string;
  party: Party;
  billingAddress: string;
  dispatchAddress?: string;
  placeOfSupply: string;
  isInterState: boolean;
  // GoGST E-Way & Transport fields
  vehicleNo?: string;
  biltyNo?: string;
  transporterName?: string;
  transporterId?: string;
  distanceKm?: number;
  stationTo?: string;
  items: InvoiceItem[];
  totalBags?: number;
  totalQty: number;
  taxableAmount: number;
  transportCharges: number;
  otherCharges: number;
  otherChargesLabel: string;
  mandiTaxCharges?: number;
  hammaliCharges?: number;
  totalTaxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  roundOff: number;
  finalAmount: number;
  totalInWords: string;
  paidAmount: number;
  balanceAmount: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  paymentMode?: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId?: string;
  invoiceNumber?: string;
  partyId: string;
  partyName: string;
  amount: number;
  date: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Card';
  referenceNo?: string;
  bankAccountId?: string;
  notes?: string;
  type: 'received' | 'paid';
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  upiId: string;
  openingBalance: number;
  currentBalance: number;
  isDefault: boolean;
}

export interface CashTransaction {
  id: string;
  type: 'cash_in' | 'cash_out' | 'expense' | 'income' | 'bank_deposit' | 'bank_withdrawal';
  amount: number;
  date: string;
  category: string;
  description: string;
  partyId?: string;
  partyName?: string;
  bankAccountId?: string;
  createdAt: string;
}

export interface MandiSaudaSlip {
  id: string;
  saudaNumber: string;
  date: string;
  partyName: string;
  partyPhone: string;
  commodity: string;
  bags: number;
  netWeightQuintal: number;
  ratePerQuintal: number;
  totalAmount: number;
  katotiAmount: number;
  hammaliAmount: number;
  netPayable: number;
  status: 'pending' | 'billed' | 'settled';
}

export interface DashboardMetrics {
  todaySales: number;
  todayPurchase: number;
  totalReceivable: number;
  totalPayable: number;
  cashBalance: number;
  bankBalance: number;
  lowStockCount: number;
  pendingPaymentsCount: number;
  overduePaymentsAmount: number;
}