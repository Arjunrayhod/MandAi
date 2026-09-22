export type BusinessType = 'mandi_vyapar';

export type InvoiceTemplateType = 
  | 'classic_rathore' 
  | 'modern_mandi' 
  | 'thermal_pos';

export type InvoiceFontType = 
  | 'inter' 
  | 'jakarta' 
  | 'outfit' 
  | 'merriweather' 
  | 'roboto_slab' 
  | 'mono_erp';

export type DocumentType = 
  | 'tax_invoice' 
  | 'quotation_estimate' 
  | 'delivery_challan' 
  | 'credit_note';

export interface BankDetails {
  bankName: string;
  branch: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
}

export interface MandiTradeDefaults {
  defaultBagWeightKg: number; // e.g. 50 kg
  defaultTareWeightKg: number; // e.g. 1 kg per bag
  defaultHammaliRatePerBag: number; // e.g. ₹20 per bag
  defaultTulaiRatePerBag: number; // e.g. ₹5 per bag
  mandiCessPercent: number; // e.g. 0% or 1.5%
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
  mandiDefaults?: MandiTradeDefaults;
  businessType: BusinessType;
  invoiceTemplate: InvoiceTemplateType;
  invoiceFont?: InvoiceFontType;
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
  name: string; // e.g. 'Musakadana', 'Isabgol', 'Ashwagandha'
  hindiName?: string; // e.g. 'मुसकादाना (कस्तूरी दाना)'
  sku: string;
  hsnSac: string; // e.g. '12119011'
  category: string; // e.g. 'Herbal Seeds / Krishi Upaj'
  unit: 'Kg' | 'Quintal' | 'Bags / Bori' | 'Metric Ton';
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  currentStock: number;
  bagCount?: number;
  bagWeightKg?: number; // e.g. 50 kg
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
  docType?: DocumentType;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  partyId: string;
  party: Party;
  billingAddress: string;
  dispatchAddress?: string;
  placeOfSupply: string;
  isInterState: boolean;
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
  otherChargesLabel: string; // 'All other charges (कट्ट)'
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
  bankAccountId?: string;
  bankDetails?: BankDetails;
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

  // Authentic Krishi Upaj Mandi Bhugtan Patrak fields
  sellerFatherName?: string;
  village?: string;
  anubandhNo?: string;
  tulaiNo?: string;
  entryPassNo?: string;
  bhavantar?: string;
  kisanOpt?: string;
  aadharNo?: string;
  bagWeightKg?: number;
  kattaCount?: number;
  kattaWeightKg?: number;
  paymentMode?: string;
  bankIfsc?: string;
  bankAccountNo?: string;
  bankPayAmount?: number;
  cashPayAmount?: number;
  isPaid?: boolean;
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