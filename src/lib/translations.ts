export type Language = 'hi' | 'en' | 'hinglish';

export const TRANSLATIONS = {
  // Navigation
  nav_dashboard: {
    hi: 'डैशबोर्ड',
    en: 'Dashboard',
    hinglish: 'Dashboard',
  },
  nav_invoices: {
    hi: 'बिलिंग / इनवॉइस',
    en: 'Invoices & Billing',
    hinglish: 'Billing / Invoices',
  },
  nav_sauda: {
    hi: 'सौदा पर्चा',
    en: 'Sauda Slips',
    hinglish: 'Sauda Parcha',
  },
  nav_parties: {
    hi: 'पार्टी / खाता',
    en: 'Parties & CRM',
    hinglish: 'Party / Khatabook',
  },
  nav_inventory: {
    hi: 'माल व स्टॉक',
    en: 'Stock & Godown',
    hinglish: 'Maal & Godown Stock',
  },
  nav_money: {
    hi: 'रोकड़ व बैंक',
    en: 'Cashbook & Banks',
    hinglish: 'Rokad & Bank Khata',
  },
  nav_reports: {
    hi: 'रिपोर्ट्स व GST',
    en: 'Reports & GST',
    hinglish: 'Reports & GST Return',
  },
  nav_settings: {
    hi: 'दुकान सेटिंग',
    en: 'Shop Settings',
    hinglish: 'Dukaan Setting',
  },
  new_bill_btn: {
    hi: '+ नया बिल बनाएं',
    en: '+ Create New Bill',
    hinglish: '+ Naya Bill Banayein',
  },
  mandi_edition: {
    hi: '🌾 मंडी व्यापार एडिशन',
    en: '🌾 Mandi Trade Edition',
    hinglish: '🌾 Mandi Vyapar Edition',
  },

  // Dashboard
  today_sales: {
    hi: 'आज की कुल बिक्री',
    en: "Today's Total Sales",
    hinglish: 'Aaj Ki Total Bikri',
  },
  market_receivable: {
    hi: 'मार्केट उधारी (लेना)',
    en: 'Market Receivables',
    hinglish: 'Market Udhaari (Lena Baaki)',
  },
  bank_balance: {
    hi: 'कुल बैंक बैलेंस',
    en: 'Total Bank Balance',
    hinglish: 'Total Bank Balance',
  },
  cash_in_hand: {
    hi: 'दुकान रोकड़',
    en: 'Cash in Hand',
    hinglish: 'Dukaan Rokad',
  },
  stock_alert: {
    hi: 'मंडी गोडाउन स्टॉक',
    en: 'Godown Stock',
    hinglish: 'Godown Maal Stock',
  },
  recent_invoices: {
    hi: 'हाल ही के बिल व इनवॉइस',
    en: 'Recent Invoices',
    hinglish: 'Haal Ke Invoices',
  },
  party_udhaar_ledger: {
    hi: 'पार्टी बाकी खाता (उधारी)',
    en: 'Party Outstanding Ledger',
    hinglish: 'Party Udhaari Khata',
  },

  // Invoices & Billing
  invoice_number: {
    hi: 'बिल नंबर',
    en: 'Invoice No.',
    hinglish: 'Bill Number',
  },
  invoice_date: {
    hi: 'तारीख',
    en: 'Invoice Date',
    hinglish: 'Bill Ki Tareekh',
  },
  due_date: {
    hi: 'नियत तारीख (Due)',
    en: 'Due Date',
    hinglish: 'Due Date (Last Date)',
  },
  select_party: {
    hi: 'पार्टी / खरीदार चुनें',
    en: 'Select Party / Buyer',
    hinglish: 'Party / Customer Chunein',
  },
  item_name: {
    hi: 'जिंस / आइटम का नाम',
    en: 'Commodity / Item Name',
    hinglish: 'Jins / Item Ka Naam',
  },
  bags_count: {
    hi: 'बोरी (Bags)',
    en: 'Bags Count',
    hinglish: 'Bori (Katta)',
  },
  quantity: {
    hi: 'मात्रा (वजन)',
    en: 'Quantity',
    hinglish: 'Quantity (Vajan)',
  },
  rate_price: {
    hi: 'भाव / Rate (₹)',
    en: 'Rate (₹)',
    hinglish: 'Bhaav / Rate (₹)',
  },
  taxable_subtotal: {
    hi: 'कर योग्य मूल्य',
    en: 'Taxable Amount',
    hinglish: 'Taxable Subtotal',
  },
  transport_charges: {
    hi: 'भाड़ा / Transport Charges',
    en: 'Transport Charges',
    hinglish: 'Gadi Bhada / Transport',
  },
  katoti_other_charges: {
    hi: 'कटौती / कट्ट (Other Charges)',
    en: 'All Other Charges (Katoti)',
    hinglish: 'Katoti / Katta Charges',
  },
  grand_total: {
    hi: 'अंतिम कुल राशि',
    en: 'Grand Total Amount',
    hinglish: 'Final Total Amount',
  },
  save_and_print: {
    hi: 'सुरक्षित करें व प्रिंट करें',
    en: 'Save & Print Invoice',
    hinglish: 'Save Karein & Print Nikalein',
  },
  record_payment: {
    hi: 'भुगतान दर्ज करें',
    en: 'Record Payment',
    hinglish: 'Payment Jama Karein',
  },
  whatsapp_reminder: {
    hi: 'WhatsApp तगादा',
    en: 'WhatsApp Reminder',
    hinglish: 'WhatsApp Tagaada',
  },
  print_invoice: {
    hi: 'प्रिंट / PDF डाउनलोड',
    en: 'Print / Save PDF',
    hinglish: 'Print / PDF Download',
  },

  // Sauda Parcha
  sauda_parcha_title: {
    hi: 'मंडी सौदा पर्चा व तौल पर्ची',
    en: 'Mandi Sauda & Weighing Slips',
    hinglish: 'Mandi Sauda & Tol Parchi',
  },
  gross_weight: {
    hi: 'कुल तौल (Gross Kg)',
    en: 'Gross Weight (Kg)',
    hinglish: 'Total Tol (Gross Kg)',
  },
  tare_weight: {
    hi: 'बारदान काट (Tare Kg)',
    en: 'Tare Weight (Kg)',
    hinglish: 'Bardan Katoti (Tare Kg)',
  },
  net_weight_qtl: {
    hi: 'शुद्ध क्विंटल (Net Qtl)',
    en: 'Net Weight (Quintal)',
    hinglish: 'Shuddh Weight (Quintal)',
  },
  hammali_tulai: {
    hi: 'हम्माली व तुलाई खर्च',
    en: 'Hammali & Labour Charges',
    hinglish: 'Hammali & Tulai Kharch',
  },
  convert_to_invoice: {
    hi: 'पक्का बिल बनाएं',
    en: 'Convert to GST Bill',
    hinglish: 'Pakka Bill Banayein',
  },

  // Parties & CRM
  parties_title: {
    hi: 'पार्टी व ग्राहक खाता बही',
    en: 'Parties & Customer Khatabook',
    hinglish: 'Party & Customer Khatabook',
  },
  add_party: {
    hi: '+ नई पार्टी जोड़ें',
    en: '+ Add New Party',
    hinglish: '+ Nayi Party Jodein',
  },
  closing_due: {
    hi: 'वर्तमान बाकी (Due)',
    en: 'Closing Balance Due',
    hinglish: 'Current Baaki (Due)',
  },
  ledger_statement: {
    hi: 'खाता बही (Ledger)',
    en: 'Ledger Statement',
    hinglish: 'Khata Bahi (Ledger)',
  },

  // Stock
  inventory_title: {
    hi: 'मंडी जिंस व गोडाउन स्टॉक',
    en: 'Commodity & Godown Stock',
    hinglish: 'Jins & Godown Stock',
  },
  add_commodity: {
    hi: '+ नई जिंस जोड़ें',
    en: '+ Add Commodity',
    hinglish: '+ Nayi Jins Jodein',
  },
  stock_in_out: {
    hi: 'स्टॉक आवक / जावक',
    en: 'Stock Inward / Outward',
    hinglish: 'Stock Aavak / Jaavak',
  },

  // Money & Cashbook
  money_title: {
    hi: 'रोकड़ बही व बैंक खाते',
    en: 'Cashbook & Bank Accounts',
    hinglish: 'Rokad Bahi & Bank Khate',
  },
  record_tx: {
    hi: '+ रोकड़ खर्च / आमद दर्ज करें',
    en: '+ Record Cash / Expense',
    hinglish: '+ Rokad Kharch / Income Entry',
  },
  bank_accounts: {
    hi: 'बैंक खाते',
    en: 'Bank Accounts',
    hinglish: 'Bank Khate',
  },
  daybook: {
    hi: 'रोकड़ लेन-देन बही (Daybook)',
    en: 'Daily Cash Transaction Register',
    hinglish: 'Rokad Daybook Register',
  },

  // Reports
  reports_title: {
    hi: 'मंडी व्यापार रिपोर्ट्स व GST समरी',
    en: 'Mandi Trade Reports & GST Summary',
    hinglish: 'Mandi Trade Reports & GST Summary',
  },
  sales_report: {
    hi: 'बिक्री रिपोर्ट',
    en: 'Sales Report',
    hinglish: 'Bikri Report',
  },
  gstr1_summary: {
    hi: 'GSTR-1 टैक्स समरी',
    en: 'GSTR-1 Tax Summary',
    hinglish: 'GSTR-1 Tax Summary',
  },
  outstanding_report: {
    hi: 'पार्टी बाकी उधारी',
    en: 'Party Outstanding',
    hinglish: 'Party Baaki Udhaari',
  },

  // Settings
  settings_title: {
    hi: 'दुकान व फर्म सेटिंग',
    en: 'Shop & Firm Settings',
    hinglish: 'Dukaan & Firm Setting',
  },
  backup_restore: {
    hi: 'डेटा बैकअप व रिस्टोर',
    en: 'Data Backup & Restore',
    hinglish: 'Data Backup & Restore',
  },
  shop_mode: {
    hi: 'दुकान / बिजनेस प्रकार (Shop Mode)',
    en: 'Business Industry Mode',
    hinglish: 'Dukaan Ka Type (Shop Mode)',
  },
};

export function getTranslation(key: keyof typeof TRANSLATIONS, lang: Language): string {
  const item = TRANSLATIONS[key];
  if (!item) return key;
  return item[lang] || item.hi || key;
}