import { create } from 'zustand';
import { 
  CompanyProfile, 
  Party, 
  Product, 
  Invoice, 
  BankAccount, 
  CashTransaction, 
  PaymentRecord,
  DashboardMetrics,
  MandiSaudaSlip
} from './types';
import { Language } from './translations';
import { 
  DEFAULT_COMPANY, 
  DEFAULT_PARTIES, 
  DEFAULT_PRODUCTS, 
  DEFAULT_INVOICES, 
  DEFAULT_BANK_ACCOUNTS, 
  DEFAULT_TRANSACTIONS 
} from './defaultData';

interface AppState {
  language: Language;
  company: CompanyProfile;
  parties: Party[];
  products: Product[];
  invoices: Invoice[];
  bankAccounts: BankAccount[];
  transactions: CashTransaction[];
  payments: PaymentRecord[];
  saudaSlips: MandiSaudaSlip[];
  cashInHand: number;

  // Actions
  setLanguage: (lang: Language) => void;
  updateCompany: (profile: Partial<CompanyProfile>) => void;
  
  // Parties
  addParty: (party: Omit<Party, 'id' | 'createdAt' | 'currentBalance'>) => Party;
  updateParty: (id: string, party: Partial<Party>) => void;
  deleteParty: (id: string) => void;

  // Products & Stock
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, qtyDiff: number, bagDiff?: number) => void;

  // Invoices
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Invoice;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  // Payments & Cashbook
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  addTransaction: (tx: Omit<CashTransaction, 'id' | 'createdAt'>) => void;
  addBankAccount: (acc: Omit<BankAccount, 'id'>) => void;
  updateBankAccount: (id: string, acc: Partial<BankAccount>) => void;

  // Mandi Sauda Parcha
  addSaudaSlip: (slip: Omit<MandiSaudaSlip, 'id'>) => MandiSaudaSlip;

  // Reset demo
  resetToDefault: () => void;

  // Metrics
  getMetrics: () => DashboardMetrics;
}

const STORAGE_KEY = 'mandai_saas_state_v1';

const getInitialState = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
  }
  return {
    language: 'hi' as Language,
    company: DEFAULT_COMPANY,
    parties: DEFAULT_PARTIES,
    products: DEFAULT_PRODUCTS,
    invoices: DEFAULT_INVOICES,
    bankAccounts: DEFAULT_BANK_ACCOUNTS,
    transactions: DEFAULT_TRANSACTIONS,
    payments: [],
    saudaSlips: [],
    cashInHand: 42500.00,
  };
};

export const useAppStore = create<AppState>((set, get) => ({
  ...getInitialState(),

  setLanguage: (lang) => {
    set((state) => {
      const next = { ...state, language: lang };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { language: lang };
    });
  },

  updateCompany: (profile) => {
    set((state) => {
      const updated = { ...state.company, ...profile };
      const next = { ...state, company: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { company: updated };
    });
  },

  addParty: (partyData) => {
    const newParty: Party = {
      ...partyData,
      id: 'party-' + Date.now(),
      currentBalance: partyData.openingBalance || 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [newParty, ...state.parties];
      const next = { ...state, parties: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { parties: updated };
    });
    return newParty;
  },

  updateParty: (id, partyData) => {
    set((state) => {
      const updated = state.parties.map((p) => (p.id === id ? { ...p, ...partyData } : p));
      const next = { ...state, parties: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { parties: updated };
    });
  },

  deleteParty: (id) => {
    set((state) => {
      const updated = state.parties.filter((p) => p.id !== id);
      const next = { ...state, parties: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { parties: updated };
    });
  },

  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const updated = [newProduct, ...state.products];
      const next = { ...state, products: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { products: updated };
    });
    return newProduct;
  },

  updateProduct: (id, productData) => {
    set((state) => {
      const updated = state.products.map((p) => (p.id === id ? { ...p, ...productData } : p));
      const next = { ...state, products: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { products: updated };
    });
  },

  deleteProduct: (id) => {
    set((state) => {
      const updated = state.products.filter((p) => p.id !== id);
      const next = { ...state, products: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { products: updated };
    });
  },

  adjustStock: (id, qtyDiff, bagDiff = 0) => {
    set((state) => {
      const updated = state.products.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            currentStock: Math.max(0, p.currentStock + qtyDiff),
            bagCount: p.bagCount !== undefined ? Math.max(0, (p.bagCount || 0) + bagDiff) : undefined,
          };
        }
        return p;
      });
      const next = { ...state, products: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { products: updated };
    });
  },

  addInvoice: (invoiceData) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: 'inv-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      // 1. Auto-deduct stock for items
      const updatedProducts = state.products.map((prod) => {
        const item = newInvoice.items.find((i) => i.productId === prod.id || i.name.toLowerCase() === prod.name.toLowerCase());
        if (item) {
          return {
            ...prod,
            currentStock: Math.max(0, prod.currentStock - item.qty),
            bagCount: prod.bagCount && item.bags ? Math.max(0, prod.bagCount - item.bags) : prod.bagCount,
          };
        }
        return prod;
      });

      // 2. Update party balance (receivable)
      const updatedParties = state.parties.map((party) => {
        if (party.id === newInvoice.partyId) {
          return {
            ...party,
            currentBalance: party.currentBalance + newInvoice.balanceAmount,
          };
        }
        return party;
      });

      // 3. Increment company next invoice number
      const nextInvoiceNo = state.company.invoiceNextNumber + 1;
      const updatedCompany = { ...state.company, invoiceNextNumber: nextInvoiceNo };

      const updatedInvoices = [newInvoice, ...state.invoices];
      const next = { 
        ...state, 
        invoices: updatedInvoices, 
        products: updatedProducts, 
        parties: updatedParties,
        company: updatedCompany 
      };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    return newInvoice;
  },

  updateInvoice: (id, invoiceData) => {
    set((state) => {
      const updated = state.invoices.map((inv) => (inv.id === id ? { ...inv, ...invoiceData } : inv));
      const next = { ...state, invoices: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { invoices: updated };
    });
  },

  deleteInvoice: (id) => {
    set((state) => {
      const updated = state.invoices.filter((inv) => inv.id !== id);
      const next = { ...state, invoices: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { invoices: updated };
    });
  },

  recordPayment: (paymentData) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: 'pay-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      let updatedInvoices = [...state.invoices];
      if (newPayment.invoiceId) {
        updatedInvoices = state.invoices.map((inv) => {
          if (inv.id === newPayment.invoiceId) {
            const newPaid = inv.paidAmount + newPayment.amount;
            const newBal = Math.max(0, inv.finalAmount - newPaid);
            return {
              ...inv,
              paidAmount: newPaid,
              balanceAmount: newBal,
              status: newBal === 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid',
            };
          }
          return inv;
        });
      }

      const updatedParties = state.parties.map((p) => {
        if (p.id === newPayment.partyId) {
          return {
            ...p,
            currentBalance: Math.max(0, p.currentBalance - newPayment.amount),
          };
        }
        return p;
      });

      let updatedCash = state.cashInHand;
      let updatedBanks = [...state.bankAccounts];

      if (newPayment.paymentMode === 'Cash') {
        updatedCash += newPayment.type === 'received' ? newPayment.amount : -newPayment.amount;
      } else if (newPayment.bankAccountId) {
        updatedBanks = state.bankAccounts.map((b) => {
          if (b.id === newPayment.bankAccountId) {
            return {
              ...b,
              currentBalance: b.currentBalance + (newPayment.type === 'received' ? newPayment.amount : -newPayment.amount),
            };
          }
          return b;
        });
      }

      const newTx: CashTransaction = {
        id: 'tx-' + Date.now(),
        type: newPayment.type === 'received' ? 'cash_in' : 'cash_out',
        amount: newPayment.amount,
        date: newPayment.date,
        category: 'Mandi Payment (' + newPayment.paymentMode + ')',
        description: 'Payment ' + newPayment.type + ' for ' + newPayment.partyName + (newPayment.invoiceNumber ? ' (Bill #' + newPayment.invoiceNumber + ')' : ''),
        partyId: newPayment.partyId,
        partyName: newPayment.partyName,
        bankAccountId: newPayment.bankAccountId,
        createdAt: new Date().toISOString(),
      };

      const next = {
        ...state,
        payments: [newPayment, ...state.payments],
        invoices: updatedInvoices,
        parties: updatedParties,
        cashInHand: updatedCash,
        bankAccounts: updatedBanks,
        transactions: [newTx, ...state.transactions],
      };

      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  addTransaction: (txData) => {
    const newTx: CashTransaction = {
      ...txData,
      id: 'tx-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      let updatedCash = state.cashInHand;
      let updatedBanks = [...state.bankAccounts];

      if (newTx.type === 'cash_in' || newTx.type === 'income') {
        updatedCash += newTx.amount;
      } else if (newTx.type === 'cash_out' || newTx.type === 'expense') {
        updatedCash -= newTx.amount;
      } else if (newTx.type === 'bank_deposit') {
        updatedCash -= newTx.amount;
        if (newTx.bankAccountId) {
          updatedBanks = state.bankAccounts.map((b) => b.id === newTx.bankAccountId ? { ...b, currentBalance: b.currentBalance + newTx.amount } : b);
        }
      } else if (newTx.type === 'bank_withdrawal') {
        updatedCash += newTx.amount;
        if (newTx.bankAccountId) {
          updatedBanks = state.bankAccounts.map((b) => b.id === newTx.bankAccountId ? { ...b, currentBalance: b.currentBalance - newTx.amount } : b);
        }
      }

      const next = {
        ...state,
        transactions: [newTx, ...state.transactions],
        cashInHand: updatedCash,
        bankAccounts: updatedBanks,
      };

      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  },

  addBankAccount: (accData) => {
    const newAcc: BankAccount = {
      ...accData,
      id: 'bank-' + Date.now(),
    };
    set((state) => {
      const updated = [...state.bankAccounts, newAcc];
      const next = { ...state, bankAccounts: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { bankAccounts: updated };
    });
  },

  updateBankAccount: (id, accData) => {
    set((state) => {
      const updated = state.bankAccounts.map((b) => (b.id === id ? { ...b, ...accData } : b));
      const next = { ...state, bankAccounts: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { bankAccounts: updated };
    });
  },

  addSaudaSlip: (slipData) => {
    const newSlip: MandiSaudaSlip = {
      ...slipData,
      id: 'sauda-' + Date.now(),
    };
    set((state) => {
      const updated = [newSlip, ...state.saudaSlips];
      const next = { ...state, saudaSlips: updated };
      if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { saudaSlips: updated };
    });
    return newSlip;
  },

  resetToDefault: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    set({
      language: 'hi',
      company: DEFAULT_COMPANY,
      parties: DEFAULT_PARTIES,
      products: DEFAULT_PRODUCTS,
      invoices: DEFAULT_INVOICES,
      bankAccounts: DEFAULT_BANK_ACCOUNTS,
      transactions: DEFAULT_TRANSACTIONS,
      payments: [],
      saudaSlips: [],
      cashInHand: 42500.00,
    });
  },

  getMetrics: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];

    const todaySales = state.invoices
      .filter((inv) => inv.invoiceDate === today || inv.invoiceDate === '2026-09-16')
      .reduce((sum, inv) => sum + inv.finalAmount, 0);

    const totalReceivable = state.parties
      .filter((p) => p.balanceType === 'to_receive')
      .reduce((sum, p) => sum + p.currentBalance, 0);

    const totalPayable = state.parties
      .filter((p) => p.balanceType === 'to_pay')
      .reduce((sum, p) => sum + p.currentBalance, 0);

    const bankBalance = state.bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);

    const lowStockCount = state.products.filter((p) => p.currentStock <= p.minStockLevel).length;

    const pendingPaymentsCount = state.invoices.filter((i) => i.balanceAmount > 0).length;

    const overduePaymentsAmount = state.invoices
      .filter((i) => i.balanceAmount > 0 && new Date(i.dueDate) < new Date(today))
      .reduce((sum, i) => sum + i.balanceAmount, 0);

    return {
      todaySales,
      todayPurchase: 0,
      totalReceivable,
      totalPayable,
      cashBalance: state.cashInHand,
      bankBalance,
      lowStockCount,
      pendingPaymentsCount,
      overduePaymentsAmount,
    };
  },
}));