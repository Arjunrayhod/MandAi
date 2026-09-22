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
  DEFAULT_TRANSACTIONS,
  DEFAULT_SAUDA_SLIPS
} from './defaultData';
import { 
  AuthUser, 
  DEMO_USER, 
  getRegisteredUsers, 
  saveRegisteredUser, 
  findUserByUsername, 
  getActiveSessionUserId, 
  setActiveSessionUserId 
} from './auth';

interface AppState {
  // Auth & Multi-user
  currentUser: AuthUser | null;
  login: (username: string, password?: string) => { success: boolean; error?: string };
  loginAsDemo: () => void;
  signup: (
    userData: { username: string; password?: string; name: string; phone?: string },
    companyData: Partial<CompanyProfile>
  ) => { success: boolean; error?: string };
  logout: () => void;

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
  addBankAccount: (acc: Omit<BankAccount, 'id'>) => BankAccount;
  updateBankAccount: (id: string, acc: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;
  setDefaultBankAccount: (id: string) => void;

  // Mandi Sauda Parcha
  addSaudaSlip: (slip: Omit<MandiSaudaSlip, 'id'>) => MandiSaudaSlip;

  // Mobile UI
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;

  // Reset demo
  resetToDefault: () => void;

  // Rehydration & Sync
  isHydrated: boolean;
  rehydrate: () => void;

  // Metrics
  getMetrics: () => DashboardMetrics;
}

const LEGACY_STORAGE_KEY = 'mandai_saas_state_v1';
const getUserStorageKey = (userId: string) => `mandai_user_data_${userId}`;

export const getDefaultState = () => ({
  language: 'hi' as Language,
  company: DEFAULT_COMPANY,
  parties: DEFAULT_PARTIES,
  products: DEFAULT_PRODUCTS,
  invoices: DEFAULT_INVOICES,
  bankAccounts: DEFAULT_BANK_ACCOUNTS,
  transactions: DEFAULT_TRANSACTIONS,
  payments: [] as PaymentRecord[],
  saudaSlips: DEFAULT_SAUDA_SLIPS,
  cashInHand: 42500.00,
});

export const getCleanUserState = (companyData?: Partial<CompanyProfile>) => {
  const companyName = companyData?.name?.trim() || 'मेरी व्यापार फर्म';
  const ownerName = companyData?.ownerName?.trim() || 'व्यापारी';
  const cleanCompany: CompanyProfile = {
    id: 'comp-' + Date.now(),
    name: companyName,
    ownerName: ownerName,
    phone: companyData?.phone || '',
    phoneExtra: '',
    email: companyData?.email || '',
    website: '',
    address: companyData?.address || '',
    city: companyData?.city || 'नीमच',
    state: companyData?.state || 'Madhya Pradesh',
    stateCode: companyData?.stateCode || '23',
    pincode: companyData?.pincode || '',
    gstin: companyData?.gstin || '',
    pan: companyData?.pan || '',
    mandiLicenseNo: companyData?.mandiLicenseNo || '',
    signatoryName: `For ${companyName}`,
    terms: [
      '1. माल मंडी नियमों के अधीन बिका।',
      '2. भुगतान समय पर अनिवार्य है।',
      '3. विवाद की स्थिति में स्थानीय मंडी/न्यायालय मान्य होगा।'
    ],
    jurisdiction: `${companyData?.city || 'नीमच'} (M.P.)`,
    bankDetails: {
      bankName: companyData?.bankDetails?.bankName || '',
      branch: companyData?.bankDetails?.branch || '',
      accountName: companyData?.bankDetails?.accountName || companyName,
      accountNumber: companyData?.bankDetails?.accountNumber || '',
      ifsc: companyData?.bankDetails?.ifsc || '',
      upiId: companyData?.bankDetails?.upiId || '',
    },
    businessType: 'mandi_vyapar',
    invoiceTemplate: 'classic_rathore',
    currencySymbol: '₹',
    invoicePrefix: 'INV-',
    invoiceNextNumber: 1,
  };

  const initialBanks: BankAccount[] = companyData?.bankDetails?.accountNumber ? [{
    id: 'bank-' + Date.now(),
    bankName: companyData.bankDetails.bankName || 'मुख्य खाता',
    accountName: companyData.bankDetails.accountName || companyName,
    accountNumber: companyData.bankDetails.accountNumber,
    ifsc: companyData.bankDetails.ifsc || '',
    branch: companyData.bankDetails.branch || '',
    upiId: companyData.bankDetails.upiId || '',
    openingBalance: 0,
    currentBalance: 0,
    isDefault: true,
  }] : [];

  return {
    language: 'hi' as Language,
    company: cleanCompany,
    parties: [] as Party[],          // 0 fake parties (Clean)
    products: [] as Product[],        // 0 fake products (Clean)
    invoices: [] as Invoice[],        // 0 fake invoices (Clean)
    bankAccounts: initialBanks,
    transactions: [] as CashTransaction[], // 0 fake transactions (Clean)
    payments: [] as PaymentRecord[],  // 0 fake payments (Clean)
    saudaSlips: [] as MandiSaudaSlip[], // 0 fake saudas (Clean)
    cashInHand: 0,                   // Clean
  };
};

const getUserSavedState = (userId: string, isDemo?: boolean) => {
  if (typeof window === 'undefined') return isDemo ? getDefaultState() : getCleanUserState();
  const userKey = getUserStorageKey(userId);
  let saved = localStorage.getItem(userKey);

  // If demo user and userKey empty, check legacy storage
  if (!saved && isDemo) {
    saved = localStorage.getItem(LEGACY_STORAGE_KEY);
  }

  if (!saved) {
    return isDemo ? getDefaultState() : getCleanUserState();
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      language: parsed.language || 'hi',
      company: parsed.company || (isDemo ? DEFAULT_COMPANY : getCleanUserState().company),
      parties: Array.isArray(parsed.parties) ? parsed.parties : (isDemo ? DEFAULT_PARTIES : []),
      products: Array.isArray(parsed.products) ? parsed.products : (isDemo ? DEFAULT_PRODUCTS : []),
      invoices: Array.isArray(parsed.invoices) ? parsed.invoices : (isDemo ? DEFAULT_INVOICES : []),
      bankAccounts: Array.isArray(parsed.bankAccounts) ? parsed.bankAccounts : (isDemo ? DEFAULT_BANK_ACCOUNTS : []),
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : (isDemo ? DEFAULT_TRANSACTIONS : []),
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      saudaSlips: Array.isArray(parsed.saudaSlips) ? parsed.saudaSlips : (isDemo ? DEFAULT_SAUDA_SLIPS : []),
      cashInHand: typeof parsed.cashInHand === 'number' ? parsed.cashInHand : (isDemo ? 42500.00 : 0),
    };
  } catch (e) {
    console.error('Failed to parse user saved state', e);
    return isDemo ? getDefaultState() : getCleanUserState();
  }
};

let neonSyncTimer: any = null;
const queueNeonSync = (userId: string, data: any) => {
  if (typeof window === 'undefined') return;
  if (neonSyncTimer) clearTimeout(neonSyncTimer);
  neonSyncTimer = setTimeout(async () => {
    try {
      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, data }),
      });
    } catch (e) {
      console.warn('Neon cloud backup failed to sync', e);
    }
  }, 1000);
};

const syncUserToStorage = (state: any, userId?: string) => {
  if (typeof window === 'undefined') return;
  const targetId = userId || state.currentUser?.id || DEMO_USER.id;
  const userKey = getUserStorageKey(targetId);
  const data = {
    language: state.language,
    company: state.company,
    parties: state.parties,
    products: state.products,
    invoices: state.invoices,
    bankAccounts: state.bankAccounts,
    transactions: state.transactions,
    payments: state.payments,
    saudaSlips: state.saudaSlips,
    cashInHand: state.cashInHand,
  };
  try {
    localStorage.setItem(userKey, JSON.stringify(data));
    if (targetId === DEMO_USER.id) {
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.error('Failed to sync user storage', e);
  }

  // Neon PostgreSQL Permanent Cloud Backup (Never deletes after 24 hrs)
  if (targetId && targetId !== DEMO_USER.id) {
    queueNeonSync(targetId, data);
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  ...getDefaultState(),
  currentUser: null,
  isHydrated: false,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

  rehydrate: () => {
    if (typeof window === 'undefined') return;
    const activeUserId = getActiveSessionUserId();
    const users = getRegisteredUsers();

    if (!activeUserId) {
      const explicitLogout = localStorage.getItem('mandai_explicit_logout');
      if (explicitLogout === 'true') {
        set({ currentUser: null, isHydrated: true });
        return;
      }
      // First-time visitor default: Auto-login to demo account
      setActiveSessionUserId(DEMO_USER.id);
      const demoData = getUserSavedState(DEMO_USER.id, true);
      set({
        currentUser: DEMO_USER,
        ...demoData,
        isHydrated: true,
      });
      return;
    }

    const user = users.find((u) => u.id === activeUserId);
    if (!user) {
      set({ currentUser: null, isHydrated: true });
      return;
    }

    const userData = getUserSavedState(user.id, user.isDemo);
    set({
      currentUser: user,
      ...userData,
      isHydrated: true,
    });

    // Background sync from Neon PostgreSQL cloud storage
    if (!user.isDemo) {
      fetch(`/api/db/sync?userId=${encodeURIComponent(user.id)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.success && json?.data) {
            set((current) => {
              if (current.currentUser?.id === user.id) {
                const cloud = json.data;
                const nextState = {
                  ...current,
                  company: cloud.company || current.company,
                  parties: Array.isArray(cloud.parties) ? cloud.parties : current.parties,
                  products: Array.isArray(cloud.products) ? cloud.products : current.products,
                  invoices: Array.isArray(cloud.invoices) ? cloud.invoices : current.invoices,
                  bankAccounts: Array.isArray(cloud.bankAccounts) ? cloud.bankAccounts : current.bankAccounts,
                  transactions: Array.isArray(cloud.transactions) ? cloud.transactions : current.transactions,
                  payments: Array.isArray(cloud.payments) ? cloud.payments : current.payments,
                  saudaSlips: Array.isArray(cloud.saudaSlips) ? cloud.saudaSlips : current.saudaSlips,
                  cashInHand: typeof cloud.cashInHand === 'number' ? cloud.cashInHand : current.cashInHand,
                };
                try {
                  localStorage.setItem(getUserStorageKey(user.id), JSON.stringify(cloud));
                } catch {}
                return nextState;
              }
              return current;
            });
          }
        })
        .catch(() => {});
    }
  },

  login: (username, password = '') => {
    const user = findUserByUsername(username);
    if (!user) {
      return { success: false, error: 'यह यूज़रनेम मौजूद नहीं है। कृपया सही यूज़रनेम डालें या नया खाता बनाएं।' };
    }

    if (user.isDemo) {
      // Demo user can log in with demo password or blank
      setActiveSessionUserId(user.id);
      localStorage.removeItem('mandai_explicit_logout');
      const data = getUserSavedState(user.id, true);
      set({
        currentUser: user,
        ...data,
      });
      return { success: true };
    }

    // For registered user, check password
    if (user.password && user.password !== password) {
      return { success: false, error: 'पासवर्ड सही नहीं है। कृपया दोबारा प्रयास करें।' };
    }

    setActiveSessionUserId(user.id);
    localStorage.removeItem('mandai_explicit_logout');
    const data = getUserSavedState(user.id, false);
    set({
      currentUser: user,
      ...data,
    });
    return { success: true };
  },

  loginAsDemo: () => {
    const demo = DEMO_USER;
    setActiveSessionUserId(demo.id);
    localStorage.removeItem('mandai_explicit_logout');
    const data = getUserSavedState(demo.id, true);
    set({
      currentUser: demo,
      ...data,
    });
  },

  signup: (userData, companyData) => {
    const existing = findUserByUsername(userData.username);
    if (existing) {
      return { success: false, error: 'यह यूज़रनेम पहले से इस्तेमाल में है। कृपया कोई दूसरा यूज़रनेम चुनें।' };
    }

    const newUser: AuthUser = {
      id: 'user-' + Date.now(),
      username: userData.username.trim(),
      password: userData.password?.trim() || '',
      name: userData.name.trim() || 'व्यापारी',
      phone: userData.phone?.trim() || companyData.phone || '',
      companyName: companyData.name?.trim() || 'मेरी फर्म',
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    saveRegisteredUser(newUser);
    setActiveSessionUserId(newUser.id);
    localStorage.removeItem('mandai_explicit_logout');

    // Initialize 100% clean slate state for new user!
    const cleanData = getCleanUserState({
      ...companyData,
      ownerName: userData.name || companyData.ownerName,
      phone: userData.phone || companyData.phone,
    });

    syncUserToStorage(cleanData, newUser.id);

    // Register permanently into Neon PostgreSQL
    if (typeof window !== 'undefined') {
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          userId: newUser.id,
          username: newUser.username,
          password: newUser.password,
          name: newUser.name,
          phone: newUser.phone,
          companyName: newUser.companyName,
        }),
      }).catch(() => {});
    }

    set({
      currentUser: newUser,
      ...cleanData,
    });

    return { success: true };
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mandai_explicit_logout', 'true');
    }
    setActiveSessionUserId(null);
    set({
      currentUser: null,
    });
  },

  setLanguage: (lang) => {
    set((state) => {
      const next = { ...state, language: lang };
      syncUserToStorage(next, state.currentUser?.id);
      return { language: lang };
    });
  },

  updateCompany: (profile) => {
    set((state) => {
      const updated = { ...state.company, ...profile };
      const next = { ...state, company: updated };
      syncUserToStorage(next, state.currentUser?.id);
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
      syncUserToStorage(next, state.currentUser?.id);
      return { parties: updated };
    });
    return newParty;
  },

  updateParty: (id, partyData) => {
    set((state) => {
      const updated = state.parties.map((p) => (p.id === id ? { ...p, ...partyData } : p));
      const next = { ...state, parties: updated };
      syncUserToStorage(next, state.currentUser?.id);
      return { parties: updated };
    });
  },

  deleteParty: (id) => {
    set((state) => {
      const updated = state.parties.filter((p) => p.id !== id);
      const next = { ...state, parties: updated };
      syncUserToStorage(next, state.currentUser?.id);
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
      syncUserToStorage(next, state.currentUser?.id);
      return { products: updated };
    });
    return newProduct;
  },

  updateProduct: (id, productData) => {
    set((state) => {
      const updated = state.products.map((p) => (p.id === id ? { ...p, ...productData } : p));
      const next = { ...state, products: updated };
      syncUserToStorage(next, state.currentUser?.id);
      return { products: updated };
    });
  },

  deleteProduct: (id) => {
    set((state) => {
      const updated = state.products.filter((p) => p.id !== id);
      const next = { ...state, products: updated };
      syncUserToStorage(next, state.currentUser?.id);
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
      syncUserToStorage(next, state.currentUser?.id);
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
      const nextInvoiceNo = (state.company.invoiceNextNumber || 1) + 1;
      const updatedCompany = { ...state.company, invoiceNextNumber: nextInvoiceNo };

      const updatedInvoices = [newInvoice, ...state.invoices];
      const next = { 
        ...state, 
        invoices: updatedInvoices, 
        products: updatedProducts, 
        parties: updatedParties,
        company: updatedCompany 
      };
      syncUserToStorage(next, state.currentUser?.id);
      return next;
    });

    return newInvoice;
  },

  updateInvoice: (id, invoiceData) => {
    set((state) => {
      const updated = state.invoices.map((inv) => (inv.id === id ? { ...inv, ...invoiceData } : inv));
      const next = { ...state, invoices: updated };
      syncUserToStorage(next, state.currentUser?.id);
      return { invoices: updated };
    });
  },

  deleteInvoice: (id) => {
    set((state) => {
      const targetInv = state.invoices.find((inv) => inv.id === id);
      let updatedParties = state.parties;
      if (targetInv && targetInv.balanceAmount > 0) {
        updatedParties = state.parties.map((p) => {
          if (p.id === targetInv.partyId) {
            return {
              ...p,
              currentBalance: Math.max(0, p.currentBalance - targetInv.balanceAmount),
            };
          }
          return p;
        });
      }
      const updated = state.invoices.filter((inv) => inv.id !== id);
      const next = { ...state, invoices: updated, parties: updatedParties };
      syncUserToStorage(next, state.currentUser?.id);
      return next;
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
            const newPaid = (inv.paidAmount || 0) + newPayment.amount;
            const newBal = Math.max(0, inv.finalAmount - newPaid);
            return {
              ...inv,
              paidAmount: newPaid,
              balanceAmount: newBal,
              status: (newBal <= 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid') as any,
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
      } else {
        const targetBankId = newPayment.bankAccountId || (state.bankAccounts.length > 0 ? state.bankAccounts[0].id : undefined);
        if (targetBankId) {
          updatedBanks = state.bankAccounts.map((b) => {
            if (b.id === targetBankId) {
              return {
                ...b,
                currentBalance: b.currentBalance + (newPayment.type === 'received' ? newPayment.amount : -newPayment.amount),
              };
            }
            return b;
          });
        }
      }

      const newTx: CashTransaction = {
        id: 'tx-' + Date.now(),
        type: newPayment.type === 'received' ? 'cash_in' : 'cash_out',
        amount: newPayment.amount,
        date: newPayment.date || new Date().toISOString().split('T')[0],
        category: 'Mandi Payment (' + newPayment.paymentMode + ')',
        description: 'Payment ' + (newPayment.type === 'received' ? 'received from' : 'paid to') + ' ' + newPayment.partyName + (newPayment.invoiceNumber ? ' (Bill #' + newPayment.invoiceNumber + ')' : '') + (newPayment.referenceNo ? ' Ref: ' + newPayment.referenceNo : ''),
        partyId: newPayment.partyId,
        partyName: newPayment.partyName,
        bankAccountId: newPayment.bankAccountId || (newPayment.paymentMode !== 'Cash' && state.bankAccounts[0] ? state.bankAccounts[0].id : undefined),
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

      syncUserToStorage(next, state.currentUser?.id);
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

      syncUserToStorage(next, state.currentUser?.id);
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
      let updatedCompany = state.company;
      if (newAcc.isDefault || updated.length === 1) {
        updatedCompany = {
          ...state.company,
          bankDetails: {
            bankName: newAcc.bankName,
            accountName: newAcc.accountName,
            accountNumber: newAcc.accountNumber,
            ifsc: newAcc.ifsc,
            branch: newAcc.branch || '',
            upiId: newAcc.upiId || '',
          },
        };
      }
      const next = { ...state, bankAccounts: updated, company: updatedCompany };
      syncUserToStorage(next, state.currentUser?.id);
      return { bankAccounts: updated, company: updatedCompany };
    });
    return newAcc;
  },

  updateBankAccount: (id, accData) => {
    set((state) => {
      const updated = state.bankAccounts.map((b) => (b.id === id ? { ...b, ...accData } : b));
      const targetAcc = updated.find((b) => b.id === id);
      let updatedCompany = state.company;
      if (targetAcc && (targetAcc.isDefault || updated.length === 1 || state.company.bankDetails.accountNumber === targetAcc.accountNumber)) {
        updatedCompany = {
          ...state.company,
          bankDetails: {
            bankName: targetAcc.bankName,
            accountName: targetAcc.accountName,
            accountNumber: targetAcc.accountNumber,
            ifsc: targetAcc.ifsc,
            branch: targetAcc.branch || '',
            upiId: targetAcc.upiId || '',
          },
        };
      }
      const next = { ...state, bankAccounts: updated, company: updatedCompany };
      syncUserToStorage(next, state.currentUser?.id);
      return { bankAccounts: updated, company: updatedCompany };
    });
  },

  deleteBankAccount: (id) => {
    set((state) => {
      const targetAcc = state.bankAccounts.find((b) => b.id === id);
      let updated = state.bankAccounts.filter((b) => b.id !== id);

      let updatedCompany = state.company;
      if (targetAcc?.isDefault && updated.length > 0) {
        updated = updated.map((acc, idx) => (idx === 0 ? { ...acc, isDefault: true } : acc));
        const newPrimary = updated[0];
        updatedCompany = {
          ...state.company,
          bankDetails: {
            bankName: newPrimary.bankName,
            accountName: newPrimary.accountName,
            accountNumber: newPrimary.accountNumber,
            ifsc: newPrimary.ifsc,
            branch: newPrimary.branch || '',
            upiId: newPrimary.upiId || '',
          },
        };
      } else if (updated.length === 0) {
        updatedCompany = {
          ...state.company,
          bankDetails: {
            bankName: '',
            accountName: '',
            accountNumber: '',
            ifsc: '',
            branch: '',
            upiId: '',
          },
        };
      }

      const next = { ...state, bankAccounts: updated, company: updatedCompany };
      syncUserToStorage(next, state.currentUser?.id);
      return { bankAccounts: updated, company: updatedCompany };
    });
  },

  setDefaultBankAccount: (id) => {
    set((state) => {
      const targetAcc = state.bankAccounts.find((b) => b.id === id);
      if (!targetAcc) return state;

      const updated = state.bankAccounts.map((b) => ({
        ...b,
        isDefault: b.id === id,
      }));

      const updatedCompany = {
        ...state.company,
        bankDetails: {
          bankName: targetAcc.bankName,
          accountName: targetAcc.accountName,
          accountNumber: targetAcc.accountNumber,
          ifsc: targetAcc.ifsc,
          branch: targetAcc.branch || '',
          upiId: targetAcc.upiId || '',
        },
      };

      const next = { ...state, bankAccounts: updated, company: updatedCompany };
      syncUserToStorage(next, state.currentUser?.id);
      return { bankAccounts: updated, company: updatedCompany };
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
      syncUserToStorage(next, state.currentUser?.id);
      return { saudaSlips: updated };
    });
    return newSlip;
  },

  resetToDefault: () => {
    const state = get();
    if (state.currentUser?.isDemo) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(getUserStorageKey(DEMO_USER.id));
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
      set({
        ...getDefaultState(),
        currentUser: DEMO_USER,
        isHydrated: true,
        mobileSidebarOpen: false,
      });
    } else if (state.currentUser) {
      const clean = getCleanUserState(state.company);
      syncUserToStorage(clean, state.currentUser.id);
      set({
        ...clean,
        currentUser: state.currentUser,
        isHydrated: true,
        mobileSidebarOpen: false,
      });
    }
  },

  getMetrics: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];

    const todaySales = state.invoices
      .filter((inv) => inv.invoiceDate === today || (state.currentUser?.isDemo && inv.invoiceDate === '2026-09-16'))
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