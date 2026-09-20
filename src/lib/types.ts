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
  | 'thermal_pos';

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
  name: string; // e.g. 'Musakadana', 'Isabgol', 'Ashwagandha'
  hindiName?: string; // e.g. 'मुसकादाना'
  sku: string;
  hsnSac: string; // e.g. '12119011'
  category: string; // e.g. 'Herbs / Krishi Upaj', 'Grains', 'Oilseeds', 'Spices'
  unit: 'Kg' | 'Quintal' | 'Bags / Bori' | 'Metric Ton' | 'Pcs';
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number; // e.g. 5 for 5% (2.5% CGST + 2.5% SGST)
  currentStock: number; // in unit
  bagCount?: number; // total bags in godown
  bagWeightKg?: number; // avg kg per bag e.g. 50kg
  minStockLevel: number;
  qualityGrade?: string; // e.g. 'FAQ (Fair Average Quality)', 'Special Bold', 'Standard'
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  name: string;
  hsnSac: string;
  qty: number; // Quantity in primary unit (e.g. 2,200.00)
  unit: string; // e.g. 'Kg', 'Quintal', 'Bori'
  bags?: number; // e.g. 44 bags of 50kg = 2200 kg
  rate: number; // Rate per unit (e.g. 215.00)
  ratePer?: string; // 'Per Kg', 'Per Quintal', 'Per Bag'
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
  invoiceNumber: string; // e.g. '169'
  invoiceDate: string; // e.g. '2026-09-16'
  dueDate: string; // e.g. '2026-10-01'
  partyId: string;
  party: Party;
  billingAddress: string;
  dispatchAddress?: string;
  placeOfSupply: string; // e.g. 'Madhya Pradesh ( 23 )'
  isInterState: boolean;
  vehicleNo?: string; // e.g. 'MP 44 GA 8819'
  biltyNo?: string; // e.g. 'BL-9821'
  stationTo?: string; // e.g. 'Indore / Mumbai'
  items: InvoiceItem[];
  totalBags?: number;
  totalQty: number;
  taxableAmount: number;
  transportCharges: number; // e.g. 500.00
  otherCharges: number; // e.g. 1760.00
  otherChargesLabel: string; // 'All other charges (कट्ट)'
  mandiTaxCharges?: number;
  hammaliCharges?: number;
  totalTaxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  roundOff: number;
  finalAmount: number; // e.g. 4,98,910.00
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
  category: string; // 'Mandi Hammali', 'Freight/Transport', 'Bardan (Bags)', 'Tea/Snacks', 'Office', 'Labour'
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