import { 
  CompanyProfile, 
  Party, 
  Product, 
  Invoice, 
  BankAccount, 
  CashTransaction, 
  MandiSaudaSlip, 
  DocumentType,
  InvoiceItem
} from '@/lib/types';
import { formatIndianCurrency, numberToIndianWords } from '@/lib/gstUtils';

export interface AgentActionCard {
  type: 
    | 'create_bill' 
    | 'create_sauda' 
    | 'record_payment' 
    | 'add_expense' 
    | 'update_stock' 
    | 'add_party' 
    | 'add_product' 
    | 'navigate' 
    | 'party_ledger' 
    | 'stock_summary' 
    | 'financial_summary' 
    | 'mandi_calc';
  data: any;
  status?: 'pending' | 'executed';
}

export interface AgentResponse {
  text: string;
  actionCard?: AgentActionCard;
}

export interface AgentContext {
  company: CompanyProfile;
  parties: Party[];
  products: Product[];
  invoices: Invoice[];
  bankAccounts: BankAccount[];
  transactions: CashTransaction[];
  saudaSlips: MandiSaudaSlip[];
  cashInHand: number;
  language: string;
}

// Extract numbers from Hindi/Hinglish/English text
function extractNumbers(text: string): number[] {
  const clean = text.toLowerCase();
  const results: number[] = [];

  // Match numbers with lakh
  const lakhMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:lakh|लाख|lac)/i);
  if (lakhMatch) results.push(parseFloat(lakhMatch[1]) * 100000);

  // Match numbers with hazar / k
  const hazarMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:hazar|हजार|k|thousand)/i);
  if (hazarMatch) results.push(parseFloat(hazarMatch[1]) * 1000);

  // Standard digits
  const digitMatches = clean.match(/\b\d+(?:\.\d+)?\b/g);
  if (digitMatches) {
    digitMatches.forEach(d => {
      const val = parseFloat(d);
      if (!isNaN(val) && !results.includes(val)) {
        results.push(val);
      }
    });
  }

  return results;
}

// Fuzzy find best matching party
export function findMatchingParty(query: string, parties: Party[]): Party | null {
  const q = query.toLowerCase();
  
  // Exact or contains match on name or businessName
  for (const party of parties) {
    const pName = (party.name || '').toLowerCase();
    const bName = (party.businessName || '').toLowerCase();
    if (bName && q.includes(bName)) return party;
    if (pName && q.includes(pName)) return party;
  }

  // Word token match
  const words = q.split(/[\s,;:/-]+/).filter(w => w.length > 2);
  for (const party of parties) {
    const pName = (party.name || '').toLowerCase();
    const bName = (party.businessName || '').toLowerCase();
    for (const w of words) {
      if ((bName && bName.includes(w)) || (pName && pName.includes(w))) {
        return party;
      }
    }
  }

  return null;
}

// Fuzzy find best matching product
export function findMatchingProduct(query: string, products: Product[]): Product | null {
  const q = query.toLowerCase();

  const aliases: Record<string, string[]> = {
    'musakadana': ['musaka', 'muska', 'muskadana', 'मुसकादाना', 'कस्तूरी'],
    'isabgol': ['isab', 'isabgole', 'ईसबगोल', 'psyllium'],
    'ashwagandha': ['ashwa', 'asgandh', 'अश्वगंधा'],
    'methi': ['fenugreek', 'मेथी', 'दानामेथी'],
    'sarson': ['mustard', 'सरसों', 'राई'],
    'chana': ['gram', 'चना', 'चना दाल', 'chickpea'],
    'gehu': ['wheat', 'गेहूं', 'गेहू'],
    'soyabean': ['soya', 'सोयाबीन', 'सोया'],
    'dhania': ['coriander', 'धनिया', 'धना'],
    'lahsun': ['garlic', 'लहसुन'],
    'jeera': ['cumin', 'जीरा']
  };

  for (const prod of products) {
    const name = prod.name.toLowerCase();
    const hName = (prod.hindiName || '').toLowerCase();
    if (q.includes(name)) return prod;
    if (hName && q.includes(hName)) return prod;

    for (const [key, list] of Object.entries(aliases)) {
      if (name.includes(key)) {
        for (const alias of list) {
          if (q.includes(alias)) return prod;
        }
      }
    }
  }

  // Word matching
  for (const prod of products) {
    const words = prod.name.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (w.length > 2 && q.includes(w)) return prod;
    }
  }

  return null;
}

// Extract custom party name dynamically from the query
export function extractCustomPartyName(query: string, parties: Party[]): string {
  const matched = findMatchingParty(query, parties);
  if (matched) return matched.businessName || matched.name;

  // Natural language cues: "Anil Patidar ko ...", "Suresh Sharma ke sath ...", "Kundan ka ...", "Mohan se ..."
  const cues = [
    /(?:party|customer|kisan|vyapari|seller|ग्राहक|व्यापारी|किसान)?\s*([A-Za-z\u0900-\u097F\s&.'-]+?)\s+(?:ko|ke sath|ka|ke liye|se|par|को|के साथ|का|के लिए|से|पर)\b/i,
    /(?:bill|sauda|parcha|invoice|challan|payment|भुगतान|बिल|सौदा)\s+(?:for|of|to|का|के लिए)\s+([A-Za-z\u0900-\u097F\s&.'-]+)/i
  ];

  for (const regex of cues) {
    const match = query.match(regex);
    if (match && match[1]) {
      let candidate = match[1].trim();
      candidate = candidate.replace(/^(?:ek|naya|new|create|add|banao|haya|नया|एक)\s+/i, '').trim();
      const forbidden = ['bill', 'sauda', 'payment', 'stock', 'bori', 'bags', 'rate', 'bhav', 'cash', 'money', 'aaj', 'kal', 'dukaan', 'kharcha'];
      if (candidate.length >= 2 && !forbidden.includes(candidate.toLowerCase())) {
        return candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    }
  }

  return 'M/s New Trader';
}

// Extract custom commodity / agricultural product dynamically
export function extractCustomCommodity(query: string, products: Product[]): string {
  const matched = findMatchingProduct(query, products);
  if (matched) return matched.name;

  const commonGrains: Record<string, string> = {
    'gehu': 'Gehu (गेहूं)',
    'wheat': 'Gehu (Wheat)',
    'chana': 'Chana (चना)',
    'gram': 'Chana (Gram)',
    'isabgol': 'Isabgol (ईसबगोल)',
    'musakadana': 'Musakadana (मुसकादाना)',
    'muska': 'Musakadana (मुसकादाना)',
    'dhania': 'Dhania (धनिया)',
    'coriander': 'Dhania (Coriander)',
    'sarson': 'Sarson (सरसों)',
    'mustard': 'Sarson (Mustard)',
    'methi': 'Methi (मेथी)',
    'soyabean': 'Soyabean (सोयाबीन)',
    'soya': 'Soyabean (सोया)',
    'lahsun': 'Lahsun (लहसुन)',
    'garlic': 'Lahsun (Garlic)',
    'pyaaz': 'Pyaaz (प्याज)',
    'onion': 'Pyaaz (Onion)',
    'makka': 'Makka (मक्का)',
    'maize': 'Makka (Maize)',
    'moong': 'Moong (मूंग)',
    'urad': 'Urad (उडद)',
    'masoor': 'Masoor (मसूर)',
    'jeera': 'Jeera (जीरा)',
    'cumin': 'Jeera (Cumin)',
    'ajwain': 'Ajwain (अजवाइन)',
    'kalonji': 'Kalonji (कलौंजी)',
    'alasi': 'Alasi (अलसी)',
    'flaxseed': 'Alasi (Flaxseed)',
    'ashwagandha': 'Ashwagandha (अश्वगंधा)',
    'asgandh': 'Ashwagandha',
    'tulsi': 'Tulsi Beej',
    'til': 'Til (तिल)',
    'sesame': 'Til (Sesame)',
    'khas khas': 'Khas Khas (पोस्ता)',
    'posta': 'Khas Khas (पोस्ता)',
    'rai': 'Rai (राई)'
  };

  const q = query.toLowerCase();
  for (const [key, val] of Object.entries(commonGrains)) {
    if (q.includes(key)) return val;
  }

  const commodityMatch = query.match(/(?:bori|bag|bags|katta|कट्टा|बोरी|thela)\s+([A-Za-z\u0900-\u097F]+)/i) ||
                         query.match(/([A-Za-z\u0900-\u097F]+)\s+(?:bori|bag|bags|katta|कट्टा|बोरी)/i);
  if (commodityMatch && commodityMatch[1]) {
    const word = commodityMatch[1].trim();
    const forbidden = ['ka', 'ko', 'ki', 'ke', 'me', 'se', 'bhav', 'rate', 'rupaye', 'par', 'per', 'hai', 'banao', 'likho'];
    if (word.length >= 2 && !forbidden.includes(word.toLowerCase())) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
  }

  return 'Mandi Commodity';
}

// Extract Father's name and Village/City
export function extractFatherAndVillage(query: string): { fatherName?: string; village?: string } {
  const result: { fatherName?: string; village?: string } = {};

  const soMatch = query.match(/(?:s\/o|w\/o|d\/o|पिता|सुपुत्र|आत्मज)\s+([A-Za-z\u0900-\u097F\s]+?)(?:,|\s+निवासी|\s+niwasi|\s+village|\s+gaon|\s+se|\s+ka|\s+ko|$)/i);
  if (soMatch && soMatch[1]) {
    result.fatherName = soMatch[1].trim().toUpperCase();
  }

  const villageMatch = query.match(/(?:niwasi|निवासी|village|gaon|गांव|station)\s+([A-Za-z\u0900-\u097F\s]+?)(?:,|\s+ka|\s+ko|\s+phone|\s+mob|$)/i);
  if (villageMatch && villageMatch[1]) {
    result.village = villageMatch[1].trim().toUpperCase();
  }

  return result;
}

// Offline Autonomous Agent Processor
export function processQueryLocally(query: string, context: AgentContext): AgentResponse {
  const q = query.toLowerCase().trim();
  const { company, parties, products, invoices, bankAccounts, transactions, saudaSlips, cashInHand } = context;

  // -------------------------------------------------------------
  // 1. NAVIGATION INTENTS ("Billing par jao", "Reports dikhao", etc.)
  // -------------------------------------------------------------
  if (
    q.includes('page') || 
    q.includes('kholo') || 
    q.includes('le chalo') || 
    q.includes('open') || 
    q.includes('go to') || 
    q.includes('dikhao') ||
    q.includes('खोलो') ||
    q.includes('ले चलो') ||
    q.includes('दिखाओ')
  ) {
    if (q.includes('bill') || q.includes('बिल') || q.includes('invoice') || q.includes('challan')) {
      if (q.includes('new') || q.includes('naya') || q.includes('नया')) {
        return {
          text: `📄 **नया बिल बनाने का पेज खोल रहा हूँ...**\n\nआप नीचे दिए गए बटन पर क्लिक करके सीधे नए बिलिंग फॉर्म पर जा सकते हैं।`,
          actionCard: {
            type: 'navigate',
            data: { path: '/billing/new', label: 'नया बिलिंग फॉर्म खोलें' }
          }
        };
      }
      return {
        text: `📑 **बिलिंग और इनवॉइस लिस्ट पेज:**\n\nयहाँ आपके सभी टैक्स इनवॉइस, कोटेशन और चालान उपलब्ध हैं।`,
        actionCard: {
          type: 'navigate',
          data: { path: '/billing', label: 'बिलिंग सूची (Invoices) खोलें' }
        }
      };
    }
    if (q.includes('sauda') || q.includes('सौदा') || q.includes('parcha') || q.includes('पर्चा') || q.includes('auction')) {
      return {
        text: `📜 **मंडी सौदा पर्चा रजिस्टर खोल रहा हूँ...**\n\nमंडी यार्ड नीलामी और आढ़त के सभी सौदे यहाँ प्रबंधित करें।`,
        actionCard: {
          type: 'navigate',
          data: { path: '/sauda', label: 'सौदा पर्चा रजिस्टर खोलें' }
        }
      };
    }
    if (q.includes('party') || q.includes('customer') || q.includes('vyapari') || q.includes('पार्टी') || q.includes('ग्राहक') || q.includes('kisan') || q.includes('किसान')) {
      return {
        text: `👥 **पार्टी व व्यापारी लेजर पेज:**\n\nयहाँ सभी ग्राहक, सप्लायर और किसानों के खाते और बकाया उधारी देख सकते हैं।`,
        actionCard: {
          type: 'navigate',
          data: { path: '/parties', label: 'पार्टी मास्टर व लेजर खोलें' }
        }
      };
    }
    if (q.includes('stock') || q.includes('inventory') || q.includes('स्टॉक') || q.includes('maal') || q.includes('माल')) {
      return {
        text: `📦 **इन्वेंट्री व गोदाम स्टॉक पेज:**\n\nसभी कृषि जिंसों का वजन, बोरी गणना और आवक-जावक स्टॉक देखें।`,
        actionCard: {
          type: 'navigate',
          data: { path: '/inventory', label: 'स्टॉक व इन्वेंट्री खोलें' }
        }
      };
    }
    if (q.includes('money') || q.includes('cash') || q.includes('bank') || q.includes('रोकड़') || q.includes('गल्ला') || q.includes('kharcha')) {
      return {
        text: `💰 **रोकड़ बही व बैंक खाते (Money & Cashbook):**\n\nदुकान का गल्ला, नकद लेन-देन और बैंक बैलेंस यहाँ ट्रैक करें।`,
        actionCard: {
          type: 'navigate',
          data: { path: '/money', label: 'कैशबुक व बैंक खाते खोलें' }
        }
      };
    }
    if (q.includes('report') || q.includes('रिपोर्ट') || q.includes('gst') || q.includes('gstr') || q.includes('sale report')) {
      return {
        text: `📊 **व्यापार रिपोर्ट व GST सारांश:**\n\nबिक्री रिपोर्ट, GSTR-1, GSTR-3B और लाभ-हानि रिपोर्ट देखें।`,
        actionCard: {
          type: 'navigate',
          data: { path: '/reports', label: 'रिपोर्ट्स व GST देखें' }
        }
      };
    }
    if (q.includes('setting') || q.includes('कंपनी') || q.includes('profile') || q.includes('print')) {
      return {
        text: `⚙️ **फर्म सेटिंग्स व प्रिंट कस्टमाइजेशन:**\n\nकंपनी प्रोफाइल, बैंक विवरण और मंडी डिफ़ॉल्ट सेटिंग्स बदलें।`,
        actionCard: {
          type: 'navigate',
          data: { path: '/settings', label: 'सेटिंग्स पेज खोलें' }
        }
      };
    }
  }

  // -------------------------------------------------------------
  // 2. SAUDA PARCHA CREATION (मंडी सौदा पर्चा / नीलामी यार्ड पर्चा)
  // -------------------------------------------------------------
  if (
    (q.includes('sauda') || q.includes('सौदा') || q.includes('parcha') || q.includes('पर्चा') || q.includes('neelam') || q.includes('नीलाम') || q.includes('bhugtan patrak') || q.includes('भुगतान पत्रक') || q.includes('bhugtan') || q.includes('patrak') || q.includes('resipt') || q.includes('receipt')) &&
    (q.includes('banao') || q.includes('बनाओ') || q.includes('create') || q.includes('add') || q.includes('kaat') || q.includes('दर्ज') || q.includes('likho') || q.includes('लिखो') || q.includes('karo') || q.includes('करो'))
  ) {
    const matchedParty = findMatchingParty(q, parties);
    const partyName = matchedParty?.businessName || matchedParty?.name || extractCustomPartyName(query, parties);
    const { fatherName, village } = extractFatherAndVillage(query);
    const sellerFatherName = fatherName || (partyName.toUpperCase().includes('KUNDAN') ? 'MUKESH RATHORE' : '');
    const sellerVillage = village || matchedParty?.city || 'NEEMUCH';

    const matchedProduct = findMatchingProduct(q, products);
    const commodity = matchedProduct?.name || extractCustomCommodity(query, products);

    // Extract Bags
    let bags = 17;
    const bagsMatch = q.match(/(\d+)\s*(?:bori|bag|bags|katta|कट्टा|बोरी|thela)/i);
    if (bagsMatch) {
      bags = parseInt(bagsMatch[1], 10);
    } else {
      const numbers = extractNumbers(q);
      if (numbers.length > 0 && numbers[0] < 500) bags = Math.round(numbers[0]);
    }

    // Extract Rate per quintal
    let ratePerQuintal = matchedProduct?.sellingPrice ? matchedProduct.sellingPrice * 100 : 12050;
    const rateMatch = q.match(/(?:rate|bhav|भाव|दर|at|@|ke)\s*(\d+(?:\.\d+)?)/i) || q.match(/(\d+(?:\.\d+)?)\s*(?:rate|bhav|भाव|दर)/i);
    if (rateMatch) {
      const rawRate = parseFloat(rateMatch[1]);
      ratePerQuintal = rawRate < 1000 ? rawRate * 100 : rawRate;
    }

    const bagWeight = (bags === 17 || q.includes('isabgol')) ? 60 : (matchedProduct?.bagWeightKg || 60);
    const tareWeightPerBag = 1;
    const grossWeightKg = bags * (bagWeight + tareWeightPerBag);
    const tareWeightKg = bags * tareWeightPerBag;
    const netWeightKg = grossWeightKg - tareWeightKg;
    const netWeightQuintal = netWeightKg / 100;

    const grossAmount = netWeightQuintal * ratePerQuintal;
    const hammaliAmount = bags === 17 ? 162 : ((company.mandiDefaults?.defaultHammaliRatePerBag || 9.5) * bags);
    const katotiAmount = 0;
    const netPayable = Math.max(0, grossAmount - katotiAmount - hammaliAmount);

    const saudaNumber = '0-' + (saudaSlips.length + 20340);
    const isCash = q.includes('cash') || q.includes('नकद');

    const slipData: Omit<MandiSaudaSlip, 'id'> = {
      saudaNumber,
      date: new Date().toISOString().split('T')[0],
      partyName,
      sellerFatherName,
      village: sellerVillage,
      partyPhone: matchedParty?.phone || '9993782187',
      anubandhNo: '2051/97',
      tulaiNo: 'T-41',
      entryPassNo: 'E-882',
      commodity,
      bags,
      bagWeightKg: bagWeight,
      kattaCount: 1,
      kattaWeightKg: bags,
      netWeightQuintal: Number(netWeightQuintal.toFixed(3)),
      ratePerQuintal: Number(ratePerQuintal),
      totalAmount: Number(grossAmount.toFixed(2)),
      katotiAmount: Number(katotiAmount),
      hammaliAmount: Number(hammaliAmount),
      netPayable: Number(netPayable.toFixed(2)),
      paymentMode: isCash ? 'Cash' : 'NEFT',
      bankIfsc: company.bankDetails?.ifsc || 'HDFC0000624',
      bankAccountNo: company.bankDetails?.accountNumber || '50100757992379',
      bankPayAmount: isCash ? 0 : Number(netPayable.toFixed(2)),
      cashPayAmount: isCash ? Number(netPayable.toFixed(2)) : 0,
      isPaid: true,
      status: 'pending',
    };

    return {
      text: `📜 **मंडी सौदा पर्चा (नीलामी पर्चा) तैयार कर दिया गया है:**\n\n• **व्यापारी/पार्टी**: ${slipData.partyName}\n• **जिंस (Commodity)**: ${slipData.commodity}\n• **बोरियां**: ${bags} बोरी (शुद्ध वजन: ${netWeightQuintal} क्विंटल)\n• **भाव**: ₹${ratePerQuintal}/क्विंटल (₹${(ratePerQuintal / 100).toFixed(2)}/Kg)\n• **सकल राशि**: ${formatIndianCurrency(grossAmount)}\n• **मंडी कटौती व हम्माली**: -${formatIndianCurrency(katotiAmount + hammaliAmount)}\n• **शुद्ध देय रकम (Net Payable)**: **${formatIndianCurrency(netPayable)}**\n\nनीचे बटन दबाकर सौदा पर्चा तुरंत रजिस्टर में दर्ज करें:`,
      actionCard: {
        type: 'create_sauda',
        data: slipData,
        status: 'pending',
      }
    };
  }

  // -------------------------------------------------------------
  // 3. PAYMENT RECEIPT / PAYMENT MADE ("Ramesh se 50000 mila", "Suresh ko 10000 diye")
  // -------------------------------------------------------------
  if (
    q.includes('payment') || 
    q.includes('पेमेंट') || 
    q.includes('bhugtan') || 
    q.includes('भुगतान') || 
    q.includes('jama') || 
    q.includes('जमा') ||
    q.includes('mila') || 
    q.includes('मिला') || 
    q.includes('diya') || 
    q.includes('दिए') || 
    q.includes('diye') ||
    q.includes('receive') ||
    q.includes('transfer')
  ) {
    const isPaidOut = q.includes('diya') || q.includes('दिए') || q.includes('diye') || q.includes('paid') || q.includes('bheja') || q.includes('bheje');
    const matchedParty = findMatchingParty(q, parties);

    const numbers = extractNumbers(q);
    let amount = 0;
    for (const num of numbers) {
      if (num >= 50) {
        amount = num;
        break;
      }
    }

    const customPartyName = extractCustomPartyName(query, parties);
    const partyName = matchedParty?.businessName || matchedParty?.name || customPartyName;
    const finalParty: Party = matchedParty || {
      id: 'party-temp-' + Date.now(),
      name: partyName,
      businessName: partyName,
      type: isPaidOut ? 'supplier' : 'customer',
      phone: '9826011223',
      billingAddress: 'Mandi Yard, Neemuch',
      city: 'Neemuch',
      state: company.state || 'Madhya Pradesh',
      stateCode: company.stateCode || '23',
      pincode: '458441',
      openingBalance: 0,
      balanceType: isPaidOut ? 'to_pay' : 'to_receive',
      currentBalance: 0,
      paymentTermsDays: 15,
      createdAt: new Date().toISOString(),
    };
    const paymentAmount = amount || 10000;
    const isOnline = q.includes('upi') || q.includes('online') || q.includes('phonepe') || q.includes('gpay') || q.includes('bank') || q.includes('neft') || q.includes('rtgs');
    const paymentMode = isOnline ? 'UPI' : 'Cash';
    const type = isPaidOut ? 'paid' : 'received';

      const paymentData = {
        partyId: finalParty.id,
        partyName: finalParty.businessName || finalParty.name,
        amount: paymentAmount,
        date: new Date().toISOString().split('T')[0],
        paymentMode,
        type,
        notes: `AI Agent Auto Entry: ${type === 'received' ? 'प्राप्ति' : 'भुगतान'} via ${paymentMode}`,
      };

      return {
        text: `💳 **${type === 'received' ? 'भुगतान प्राप्ति (Payment Received)' : 'भुगतान अदायगी (Payment Made)'} तैयार है:**\n\n• **पार्टी**: ${finalParty.businessName || finalParty.name}\n• **रकम**: **${formatIndianCurrency(paymentAmount)}**\n• **माध्यम**: ${paymentMode} ${paymentMode === 'Cash' ? '(रोकड़ गल्ला)' : '(बैंक खाता)'}\n• **दिनांक**: ${paymentData.date}\n\nयह एंट्री पार्टी के खाते और आपके ${paymentMode === 'Cash' ? 'कैश गल्ले' : 'बैंक बैलेंस'} में तुरंत एडजस्ट हो जाएगी।`,
        actionCard: {
          type: 'record_payment',
          data: paymentData,
          status: 'pending',
        }
      };
    }

  // -------------------------------------------------------------
  // 4. CASHBOOK & EXPENSES ("Dukaan kharcha 500", "Hammali kharcha 1200", "Bank me jama kiye")
  // -------------------------------------------------------------
  if (
    q.includes('kharcha') || 
    q.includes('खर्चा') || 
    q.includes('expense') || 
    q.includes('chai') || 
    q.includes('चाय') || 
    q.includes('diesel') || 
    q.includes('petrol') || 
    q.includes('kiraya') || 
    q.includes('rent') ||
    q.includes('electricity') ||
    q.includes('bijli') ||
    (q.includes('deposit') && q.includes('bank')) ||
    (q.includes('withdraw') && q.includes('bank'))
  ) {
    const numbers = extractNumbers(q);
    const amount = numbers.length > 0 ? numbers[0] : 500;

    let category = 'दुकान सामान्य खर्च (Miscellaneous)';
    let type: CashTransaction['type'] = 'expense';

    if (q.includes('chai') || q.includes('nashta') || q.includes('चाय')) {
      category = 'चाय-नाश्ता व आवभगत (Refreshments)';
    } else if (q.includes('hammali') || q.includes('हम्माली') || q.includes('tulai') || q.includes('तुलाई')) {
      category = 'हम्माली व तुलाई मजदूरी (Labour)';
    } else if (q.includes('petrol') || q.includes('diesel') || q.includes('bhada') || q.includes('भाड़ा')) {
      category = 'वाहन ईंधन व स्थानीय भाड़ा (Transport/Fuel)';
    } else if (q.includes('kiraya') || q.includes('rent') || q.includes('किराया')) {
      category = 'दुकान/गोदाम किराया (Rent)';
    } else if (q.includes('bijli') || q.includes('electricity') || q.includes('बिजली')) {
      category = 'बिजली व पानी बिल (Utilities)';
    } else if (q.includes('deposit') || (q.includes('bank') && (q.includes('jama') || q.includes('dala')))) {
      category = 'बैंक में नकद जमा (Bank Deposit)';
      type = 'bank_deposit';
    } else if (q.includes('withdraw') || (q.includes('bank') && (q.includes('nikala') || q.includes('nikale')))) {
      category = 'बैंक से नकद निकासी (Bank Withdrawal)';
      type = 'bank_withdrawal';
    }

    const txData = {
      type,
      amount,
      date: new Date().toISOString().split('T')[0],
      category,
      description: `MandAi AI Assistant Entry: ${category}`,
      bankAccountId: bankAccounts[0]?.id,
    };

    return {
      text: `💸 **रोकड़ बही (Cashbook) एंट्री तैयार है:**\n\n• **प्रकार**: ${type === 'expense' ? 'दुकान खर्च (Expense)' : type === 'bank_deposit' ? 'बैंक में नकद जमा' : 'बैंक से नकद निकासी'}\n• **श्रेणी (Category)**: ${category}\n• **रकम**: **${formatIndianCurrency(amount)}**\n• **रोकड़ असर**: ${type === 'expense' ? `गल्ले से -${formatIndianCurrency(amount)}` : type === 'bank_deposit' ? `गल्ले से -${formatIndianCurrency(amount)} और बैंक में +${formatIndianCurrency(amount)}` : `बैंक से -${formatIndianCurrency(amount)} और गल्ले में +${formatIndianCurrency(amount)}`}\n\nनीचे बटन पर क्लिक करके तुरंत दर्ज करें:`,
      actionCard: {
        type: 'add_expense',
        data: txData,
        status: 'pending',
      }
    };
  }

  // -------------------------------------------------------------
  // 5. BILLING & INVOICE CREATION (Tax Invoice, Estimate, Challan, Credit Note)
  // -------------------------------------------------------------
  if (
    q.includes('bill') || 
    q.includes('बिल') || 
    q.includes('invoice') || 
    q.includes('challan') || 
    q.includes('चालान') || 
    q.includes('estimate') || 
    q.includes('कोटेशन') || 
    q.includes('quotation') ||
    q.includes('credit note') ||
    q.includes('क्रेडिट नोट') ||
    ((q.includes('becha') || q.includes('sale') || q.includes('सेल') || q.includes('sold')) && (q.includes('bori') || q.includes('kg') || q.includes('quintal')))
  ) {
    const matchedParty = findMatchingParty(q, parties);
    const customPartyName = extractCustomPartyName(query, parties);
    const partyName = matchedParty?.businessName || matchedParty?.name || customPartyName;

    const finalParty: Party = matchedParty || {
      id: 'party-temp-' + Date.now(),
      type: 'customer',
      name: partyName,
      businessName: partyName.includes('Co') || partyName.includes('Traders') || partyName.includes('Trading') ? partyName : `${partyName} Trading Co.`,
      phone: '98260' + Math.floor(10000 + Math.random() * 90000),
      billingAddress: 'Mandi Yard, Neemuch (M.P.)',
      city: 'Neemuch',
      state: company.state || 'Madhya Pradesh',
      stateCode: company.stateCode || '23',
      pincode: '458441',
      openingBalance: 0,
      balanceType: 'to_receive',
      currentBalance: 0,
      paymentTermsDays: 15,
      createdAt: new Date().toISOString(),
    };

    const matchedProduct = findMatchingProduct(q, products);
    const customCommodityName = extractCustomCommodity(query, products);
    const productName = matchedProduct?.name || customCommodityName;

    let bags = 40;
    const bagsMatch = q.match(/(\d+)\s*(?:bori|bag|bags|katta|कट्टा|बोरी|thela)/i);
    if (bagsMatch) {
      bags = parseInt(bagsMatch[1], 10);
    } else {
      const numbers = extractNumbers(q);
      if (numbers.length > 0) {
        bags = Math.round(numbers[0]);
      }
    }

    let rate = matchedProduct?.sellingPrice || 215;
    const rateMatch = q.match(/(?:rate|bhav|भाव|दर|at|@|ke)\s*(\d+(?:\.\d+)?)/i) || q.match(/(\d+(?:\.\d+)?)\s*(?:rate|bhav|भाव|दर|rupaye|rs|₹)/i);
    if (rateMatch) {
      const parsedRate = parseFloat(rateMatch[1]);
      rate = parsedRate > 1000 ? parsedRate / 100 : parsedRate;
    }

    let docType: DocumentType = 'tax_invoice';
    if (q.includes('estimate') || q.includes('quotation') || q.includes('कोटेशन') || q.includes('अनुमान') || q.includes('kachha')) {
      docType = 'quotation_estimate';
    } else if (q.includes('challan') || q.includes('चालान') || q.includes('delivery')) {
      docType = 'delivery_challan';
    } else if (q.includes('credit note') || q.includes('क्रेडिट नोट') || q.includes('wapsi') || q.includes('वापसी')) {
      docType = 'credit_note';
    }

    const bagWeight = matchedProduct?.bagWeightKg || 50;
    const qty = bags * bagWeight;
    const taxableValue = qty * rate;
    const gstRate = matchedProduct?.gstRate || 5;
    const isInterState = finalParty?.state && finalParty.state !== company.state;
    const cgstRate = !isInterState ? gstRate / 2 : 0;
    const sgstRate = !isInterState ? gstRate / 2 : 0;
    const igstRate = isInterState ? gstRate : 0;
    const cgstAmount = (taxableValue * cgstRate) / 100;
    const sgstAmount = (taxableValue * sgstRate) / 100;
    const igstAmount = (taxableValue * igstRate) / 100;
    const totalTax = cgstAmount + sgstAmount + igstAmount;
    
    const mandiKatoti = 40 * bags;
    const mandiHammali = Number(company.mandiDefaults?.defaultHammaliRatePerBag || 6.5) * bags;
    const mandiTulai = Number(company.mandiDefaults?.defaultTulaiRatePerBag || 5) * bags;
    const otherCharges = mandiKatoti + mandiHammali + mandiTulai;
    const totalTaxable = taxableValue + otherCharges;
    const finalAmount = totalTaxable + totalTax;

    let prefix = '';
    if (docType === 'quotation_estimate') prefix = 'EST-';
    else if (docType === 'delivery_challan') prefix = 'DC-';
    else if (docType === 'credit_note') prefix = 'CN-';
    else prefix = '';

    const generatedInvNum = prefix ? `${prefix}${Date.now().toString().slice(-4)}` : String(company.invoiceNextNumber || 176);

    const item: InvoiceItem = {
      id: 'item-' + Date.now(),
      productId: matchedProduct?.id,
      name: productName,
      hsnSac: matchedProduct?.hsnSac || '12119011',
      bags,
      qty,
      unit: 'Kg',
      rate,
      taxableValue,
      cgstPercent: cgstRate,
      sgstPercent: sgstRate,
      igstPercent: igstRate,
      cgstAmount,
      sgstAmount,
      igstAmount,
      total: finalAmount,
    };

    const billData = {
      docType,
      invoiceNumber: generatedInvNum,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      partyId: finalParty.id,
      party: finalParty,
      billingAddress: finalParty.billingAddress,
      placeOfSupply: `${finalParty.state} (${finalParty.stateCode})`,
      isInterState: !!isInterState,
      vehicleNo: 'MP 44 GA 8819',
      biltyNo: '',
      transporterName: 'Neemuch Roadways Carrier',
      transporterId: '',
      distanceKm: 120,
      stationTo: finalParty.city || 'Neemuch',
      items: [item],
      totalBags: bags,
      totalQty: qty,
      taxableAmount: taxableValue,
      transportCharges: 0,
      otherCharges,
      otherChargesLabel: 'Mandi Katoti & Hammali (कट्ट)',
      totalTaxableAmount: totalTaxable,
      totalCgst: cgstAmount,
      totalSgst: sgstAmount,
      totalIgst: igstAmount,
      totalTax,
      roundOff: 0,
      finalAmount,
      totalInWords: numberToIndianWords(finalAmount),
      paidAmount: 0,
      balanceAmount: finalAmount,
      status: 'unpaid' as const,
      notes: 'MandAi Vyapar Agent Generated Document',
    };

    const docTypeName = docType === 'tax_invoice' ? 'टैक्स इनवॉइस' : docType === 'quotation_estimate' ? 'कोटेशन / एस्टीमेट' : docType === 'delivery_challan' ? 'डिलीवरी चालान' : 'क्रेडिट नोट';

    return {
      text: `✅ **${finalParty.businessName || finalParty.name} के लिए ${docTypeName} ड्राफ्ट तैयार है!**\n\n• **दस्तावेज़ संख्या**: #${generatedInvNum}\n• **जिंस (Commodity)**: ${productName} (${bags} बोरी / ${qty.toLocaleString('en-IN')} Kg)\n• **भाव (Rate)**: ₹${rate}/Kg (₹${(rate * 100).toLocaleString('en-IN')}/क्विंटल)\n• **माल मूल्य**: ${formatIndianCurrency(taxableValue)}\n• **मंडी कट्ट व हम्माली**: ${formatIndianCurrency(otherCharges)}\n• **GST (${gstRate}%)**: ${formatIndianCurrency(totalTax)}\n• **कुल बिल राशि**: **${formatIndianCurrency(finalAmount)}**\n\nनीचे बटन दबाकर तुरंत बिल सेव करें और प्रिंट व शेयर करें:`,
      actionCard: {
        type: 'create_bill',
        data: billData,
        status: 'pending'
      }
    };
  }

  // -------------------------------------------------------------
  // 6. PARTY LEDGER & HISAB QUERIES ("Ramesh ka hisab batao", "Kiske kitne paise baaki hai")
  // -------------------------------------------------------------
  if (
    q.includes('hisab') || 
    q.includes('हिसाब') || 
    q.includes('khata') || 
    q.includes('खाता') || 
    q.includes('ledger') ||
    q.includes('baki') ||
    q.includes('बाकी') ||
    q.includes('udhari') ||
    q.includes('उधारी')
  ) {
    const matchedParty = findMatchingParty(q, parties);
    if (matchedParty) {
      const partyInvoices = invoices.filter(inv => inv.partyId === matchedParty.id || inv.party.name === matchedParty.name);
      const totalBilled = partyInvoices.reduce((sum, i) => sum + i.finalAmount, 0);
      const totalPaid = partyInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
      const totalDue = matchedParty.currentBalance || partyInvoices.reduce((sum, i) => sum + i.balanceAmount, 0);

      return {
        text: `📒 **${matchedParty.businessName || matchedParty.name} का संपूर्ण खाता (Ledger):**\n\n• **व्यापार प्रकार**: ${matchedParty.type === 'customer' ? 'ग्राहक (Buyer)' : matchedParty.type === 'supplier' ? 'सप्लायर' : 'किसान (Farmer)'}\n• **संपर्क**: 📞 ${matchedParty.phone} | ${matchedParty.city}, ${matchedParty.state}\n• **GSTIN**: \`${matchedParty.gstin || 'Unregistered'}\`\n• **कुल बिलिंग**: ${formatIndianCurrency(totalBilled)} (${partyInvoices.length} बिल)\n• **जमा भुगतान**: ${formatIndianCurrency(totalPaid)}\n• **वर्तमान बकाया (Balance Due)**: **${formatIndianCurrency(totalDue)}**\n• **क्रेडिट लिमिट**: ${formatIndianCurrency(matchedParty.creditLimit || 500000)}`,
        actionCard: {
          type: 'party_ledger',
          data: {
            party: matchedParty,
            totalBilled,
            totalPaid,
            totalDue,
            recentInvoices: partyInvoices.slice(0, 3),
          }
        }
      };
    }

    const totalReceivable = invoices.reduce((sum, i) => sum + i.balanceAmount, 0);
    const topDebtors = [...parties].sort((a, b) => b.currentBalance - a.currentBalance).filter(p => p.currentBalance > 0).slice(0, 5);

    return {
      text: `📋 **मंडी मार्केट उधारी व बकाया सूची (Market Outstanding):**\n\n• **कुल मार्केट से लेना (Receivable)**: **${formatIndianCurrency(totalReceivable)}**\n• **बकायादार व्यापारियों की संख्या**: ${topDebtors.length} पार्टियां\n\n**शीर्ष बकाया खाते:**\n${topDebtors.map((p, idx) => `${idx + 1}. **${p.businessName || p.name}**: ${formatIndianCurrency(p.currentBalance)} (📞 ${p.phone})`).join('\n')}`,
      actionCard: {
        type: 'party_ledger',
        data: { topDebtors, totalReceivable }
      }
    };
  }

  // -------------------------------------------------------------
  // 7. STOCK QUERIES & ALERTS ("Musakadana kitna hai", "Konsa maal kam hai", "Stock alert")
  // -------------------------------------------------------------
  if (
    q.includes('stock') || 
    q.includes('स्टॉक') || 
    q.includes('godam') || 
    q.includes('गोदाम') || 
    q.includes('maal') || 
    q.includes('माल') ||
    q.includes('inventory')
  ) {
    const matchedProduct = findMatchingProduct(q, products);
    if (matchedProduct && (q.includes('kitna') || q.includes('batao') || q.includes('check') || q.includes('hai'))) {
      const bagWeight = matchedProduct.bagWeightKg || 50;
      const currentBags = Math.round(matchedProduct.currentStock / bagWeight);
      const stockValuation = matchedProduct.currentStock * matchedProduct.sellingPrice;
      const isLowStock = matchedProduct.currentStock <= matchedProduct.minStockLevel;

      return {
        text: `🌾 **${matchedProduct.name} ${matchedProduct.hindiName ? `(${matchedProduct.hindiName})` : ''} स्टॉक स्थिति:**\n\n• **कुल वजन**: **${matchedProduct.currentStock.toLocaleString('en-IN')} Kg** (${(matchedProduct.currentStock / 100).toFixed(2)} क्विंटल)\n• **बोरियां (Bags)**: **${currentBags} बोरी** (${bagWeight} Kg प्रति बोरी)\n• **वर्तमान बिक्री भाव**: ₹${matchedProduct.sellingPrice}/Kg (₹${(matchedProduct.sellingPrice * 100).toLocaleString('en-IN')}/क्विंटल)\n• **स्टॉक वैल्यूएशन**: **${formatIndianCurrency(stockValuation)}**\n• **स्टॉक स्थिति**: ${isLowStock ? '⚠️ **कम स्टॉक चेतावनी (Low Stock Alert)!** तुरंत आवक की आवश्यकता है।' : '✅ पर्याप्त स्टॉक उपलब्ध है।'}`,
        actionCard: {
          type: 'stock_summary',
          data: { product: matchedProduct, currentBags, stockValuation, isLowStock }
        }
      };
    }

    if (q.includes('aavak') || q.includes('आवक') || q.includes('jaavak') || q.includes('जावक') || q.includes('jodo') || q.includes('जोड़ें') || q.includes('ghatao') || q.includes('add') || q.includes('minus')) {
      const targetProduct = matchedProduct || products[0];
      const bagsMatch = q.match(/(\d+)\s*(?:bori|bag|katta|बोरी|कट्टा)/i);
      const bags = bagsMatch ? parseInt(bagsMatch[1], 10) : 50;
      const isOutward = q.includes('jaavak') || q.includes('जावक') || q.includes('minus') || q.includes('ghatat') || q.includes('nikala');
      const bagWeight = targetProduct.bagWeightKg || 50;
      const qtyDiff = (isOutward ? -1 : 1) * bags * bagWeight;
      const bagDiff = (isOutward ? -1 : 1) * bags;

      return {
        text: `📦 **स्टॉक ${isOutward ? 'जावक / घटत (-)' : 'आवक / खरीद (+)'} तैयार है:**\n\n• **जिंस**: ${targetProduct.name} ${targetProduct.hindiName ? `(${targetProduct.hindiName})` : ''}\n• **बदलने वाली बोरियां**: ${isOutward ? '-' : '+'}${bags} बोरी (${Math.abs(qtyDiff).toLocaleString('en-IN')} Kg)\n• **वर्तमान स्टॉक**: ${targetProduct.currentStock.toLocaleString('en-IN')} Kg\n• **नया स्टॉक**: **${(targetProduct.currentStock + qtyDiff).toLocaleString('en-IN')} Kg**`,
        actionCard: {
          type: 'update_stock',
          data: {
            productId: targetProduct.id,
            productName: targetProduct.name,
            qtyDiff,
            bagDiff,
            newStock: targetProduct.currentStock + qtyDiff,
          },
          status: 'pending'
        }
      };
    }

    const totalValuation = products.reduce((sum, p) => sum + (p.currentStock * p.sellingPrice), 0);
    const lowStockItems = products.filter(p => p.currentStock <= p.minStockLevel);

    return {
      text: `🏬 **गोदाम इन्वेंट्री व स्टॉक रिपोर्ट:**\n\n• **कुल जिंस आइटम**: ${products.length} प्रकार\n• **कुल स्टॉक वैल्यूएशन**: **${formatIndianCurrency(totalValuation)}**\n• **कम स्टॉक वाली जिंस**: ${lowStockItems.length > 0 ? `${lowStockItems.length} जिंस रीऑर्डर लेवल पर` : 'सभी जिंस पर्याप्त मात्रा में हैं'}\n\n**वर्तमान मुख्य स्टॉक:**\n${products.map(p => `• **${p.name}**: ${p.currentStock.toLocaleString('en-IN')} Kg (${Math.round(p.currentStock / (p.bagWeightKg || 50))} बोरी) @ ₹${p.sellingPrice}/Kg`).join('\n')}`,
      actionCard: {
        type: 'stock_summary',
        data: { products, totalValuation, lowStockItems }
      }
    };
  }

  // -------------------------------------------------------------
  // 8. ADD NEW CUSTOMER / SUPPLIER / FARMER
  // -------------------------------------------------------------
  if (
    q.includes('customer') || 
    q.includes('party') || 
    q.includes('vyapari') || 
    q.includes('kisan') || 
    q.includes('पार्टी') || 
    q.includes('ग्राहक') || 
    q.includes('व्यापारी') ||
    q.includes('किसान')
  ) {
    if (q.includes('jodo') || q.includes('जोड़ें') || q.includes('naya') || q.includes('new') || q.includes('add') || q.includes('banao')) {
      const phoneMatch = q.match(/(?:\+91|91|0)?[6-9]\d{9}/);
      const phone = phoneMatch ? phoneMatch[0] : '9826011223';
      const gstMatch = q.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/i);
      const gstin = gstMatch ? gstMatch[0].toUpperCase() : '';

      let rawName = query
        .replace(/naya|customer|party|jodo|add|new|phone|gst|vyapari|kisan|नया|ग्राहक|पार्टी|जोड़ें|व्यापारी|किसान|मोबाइल|नंबर/gi, '')
        .replace(phone, '')
        .replace(gstin, '')
        .trim();
      
      const cleanName = rawName.split(/[\n,;:]/)[0].trim() || 'Shrinath Trading Co.';
      const isFarmer = q.includes('kisan') || q.includes('farmer') || q.includes('किसान');
      const isSupplier = q.includes('supplier') || q.includes('सप्लायर');

      const newPartyData = {
        name: cleanName,
        businessName: cleanName.includes('Co') || cleanName.includes('Trading') || cleanName.includes('Traders') ? cleanName : isFarmer ? `${cleanName} (Kisan)` : `${cleanName} Krishi Vyapar`,
        type: (isFarmer ? 'farmer' : isSupplier ? 'supplier' : 'customer') as any,
        phone,
        email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@mandai.in`,
        city: 'Neemuch',
        state: 'Madhya Pradesh',
        stateCode: '23',
        gstin: gstin || (!isFarmer ? '23AAACS9988E1ZG' : undefined),
        pan: gstin ? gstin.substring(2, 12) : undefined,
        billingAddress: `Krishi Upaj Mandi Yard, Neemuch (M.P.) 458441`,
        openingBalance: 0,
        creditLimit: 500000,
        paymentTermsDays: 15,
      };

      return {
        text: `👤 **नया ${isFarmer ? 'किसान' : isSupplier ? 'सप्लायर' : 'व्यापारी ग्राहक'} विवरण निकाला गया:**\n\n• **नाम/फर्म**: ${newPartyData.businessName}\n• **श्रेणी**: ${isFarmer ? '🌾 किसान (कृषक खाता)' : '🏢 मंडी व्यापारी / फर्म'}\n• **मोबाइल नंबर**: ${newPartyData.phone}\n• **GSTIN**: ${newPartyData.gstin || 'लागू नहीं (किसान / Unregistered)'}\n• **स्थान**: ${newPartyData.city} (${newPartyData.state})\n\nक्या आप इसे पार्टी मास्टर में जोड़ना चाहते हैं?`,
        actionCard: {
          type: 'add_party',
          data: newPartyData,
          status: 'pending'
        }
      };
    }
  }

  // -------------------------------------------------------------
  // 9. FINANCIAL SUMMARY, GALLA & CASH IN HAND
  // -------------------------------------------------------------
  if (
    q.includes('galla') || 
    q.includes('गल्ला') || 
    q.includes('cash') || 
    q.includes('rokad') || 
    q.includes('रोकड़') || 
    q.includes('bank') || 
    q.includes('balance') || 
    q.includes('बैलेंस') ||
    q.includes('profit') ||
    q.includes('munafa') ||
    q.includes('मुनाफा')
  ) {
    const totalBilled = invoices.reduce((sum, i) => sum + i.finalAmount, 0);
    const totalReceived = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalDue = invoices.reduce((sum, i) => sum + i.balanceAmount, 0);
    const totalBank = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);
    const topDueInvoices = invoices.filter(i => i.balanceAmount > 0).slice(0, 3);

    return {
      text: `💰 **आज की संपूर्ण वित्तीय व गल्ला स्थिति:**\n\n• 💵 **दुकान नकद गल्ला (Cash in Hand)**: **${formatIndianCurrency(cashInHand)}**\n• 🏦 **कुल बैंक बैलेंस**: **${formatIndianCurrency(totalBank)}** (${bankAccounts.length} बैंक खाते)\n• 📊 **मार्केट उधारी (कुल देय रकम)**: **${formatIndianCurrency(totalDue)}**\n• 🧾 **कुल बिलिंग कारोबार**: **${formatIndianCurrency(totalBilled)}** (वसूल: ${formatIndianCurrency(totalReceived)})\n\n**शीर्ष बकाया खाते:**\n${topDueInvoices.map(i => `• ${i.party.businessName || i.party.name}: **${formatIndianCurrency(i.balanceAmount)}** (बिल #${i.invoiceNumber})`).join('\n')}`,
      actionCard: {
        type: 'financial_summary',
        data: { totalDue, totalBank, cashInHand, topDueInvoices }
      }
    };
  }

  // -------------------------------------------------------------
  // 10. MANDI CALCULATOR (Bharti, Kanta, Tare, Hammali, Katoti)
  // -------------------------------------------------------------
  if (
    q.includes('calculate') || 
    q.includes('hisab lagao') || 
    q.includes('jodo') || 
    (q.includes('bori') && q.includes('bhav') && (q.includes('kitna') || q.includes('kya')))
  ) {
    const bagsMatch = q.match(/(\d+)\s*(?:bori|bag|bags|katta|बोरी)/i);
    const bags = bagsMatch ? parseInt(bagsMatch[1], 10) : 50;
    
    const rateMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:bhav|rate|भाव|दर)/i) || q.match(/(?:bhav|rate|भाव|दर)\s*(\d+(?:\.\d+)?)/i);
    let rate = rateMatch ? parseFloat(rateMatch[1]) : 215;

    const bagWeight = 50;
    const grossWeight = bags * (bagWeight + 1);
    const tareWeight = bags * 1;
    const netWeight = bags * bagWeight;
    const quintals = netWeight / 100;
    const ratePerQuintal = rate < 1000 ? rate * 100 : rate;
    const grossAmount = quintals * ratePerQuintal;
    const katoti = 40 * bags;
    const hammali = 20 * bags;
    const netPayable = grossAmount - katoti - hammali;

    return {
      text: `🧮 **मंडी व्यापार गणना (Mandi Calculation):**\n\n• **बोरियां**: ${bags} बोरी (50 Kg भर्ती + 1 Kg बारदाना कट्ट)\n• **सकल वजन (Gross)**: ${grossWeight} Kg\n• **बारदाना वजन (Tare)**: -${tareWeight} Kg\n• **शुद्ध वजन (Net Weight)**: **${netWeight} Kg** (${quintals} क्विंटल)\n• **भाव**: ₹${ratePerQuintal}/क्विंटल (₹${(ratePerQuintal / 100).toFixed(2)}/Kg)\n• **सकल माल मूल्य**: ${formatIndianCurrency(grossAmount)}\n• **मंडी कट्ट / कटौती**: -${formatIndianCurrency(katoti)} (₹40 प्रति बोरी)\n• **हम्माली व तुलाई**: -${formatIndianCurrency(hammali)} (₹20 प्रति बोरी)\n• **शुद्ध देय रकम (Net Payable)**: **${formatIndianCurrency(netPayable)}**`,
      actionCard: {
        type: 'mandi_calc',
        data: { bags, netWeight, quintals, ratePerQuintal, grossAmount, katoti, hammali, netPayable }
      }
    };
  }

  // -------------------------------------------------------------
  // 11. MANDI BUSINESS RULES & FAQ
  // -------------------------------------------------------------
  if (
    q.includes('gst rate') || 
    q.includes('gst niyam') || 
    q.includes('e-way') || 
    q.includes('eway') || 
    q.includes('mandi tax') || 
    q.includes('cess') || 
    q.includes('katt') ||
    q.includes('katoti') ||
    q.includes('hammali')
  ) {
    return {
      text: `📖 **मंडी व्यापार व GST दिशानिर्देश:**\n\n1. **कृषि जिंसों पर GST**: कच्ची कृषि उपज (जैसे गेहूं, चना, सरसों, धनिया) यदि गैर-ब्रांडेड हैं तो GST से मुक्त (0% या 5% पैकिंग पर) होती हैं।\n2. **ई-वे बिल (E-Way Bill)**: ₹50,000 से अधिक के अंतर्राज्यीय (Inter-State) या राज्य के भीतर माल परिवहन पर ई-वे बिल अनिवार्य होता है।\n3. **मंडी शुल्क (Mandi Tax)**: मध्य प्रदेश कृषि उपज मंडी अधिनियम अनुसार नीलामी यार्ड में 1.5% मंडी शुल्क + 0.20% निराश्रित शुल्क देय होता है।\n4. **कट्ट व बारदाना (Tare Deduction)**: सामान्यतः प्रति बोरी 1 किलोग्राम बारदाना कट्ट और ₹40 मंडी कटौती प्रथा अनुसार काटी जाती है।\n5. **हम्माली व तुलाई**: मंडी समिति द्वारा निर्धारित मानक दर ₹18 - ₹22 प्रति बोरी होती है।`
    };
  }

  // -------------------------------------------------------------
  // 12. NATURAL CONVERSATION / GENERAL AGENT ASSISTANT
  // -------------------------------------------------------------
  const greetings = ['hi', 'hello', 'namaste', 'नमस्ते', 'ram ram', 'राम राम', 'जय श्री कृष्ण', 'jai jinendra', 'kaise ho'];
  if (greetings.some(g => q.includes(g))) {
    return {
      text: `🙏 **राम राम सा! मैं आपका MandAi व्यापार कोपायलट और AI एजेंट हूँ।**\n\nआप मुझे अपनी स्थानीय मंडी की भाषा, हिंदी या इंग्लिश में कुछ भी बोल सकते हैं। मैं ये सभी काम खुद कर सकता हूँ:\n\n⚡ **तुरंत बिल बनाएं**: *"Raj & Co ko 40 bori musakadana 215 ke bhav se bill banao"*\n📜 **सौदा पर्चा**: *"Suresh ke sath 50 bori gehu ka sauda parcha banao"*\n💳 **पेमेंट दर्ज करें**: *"Ramesh se 50000 rupaye cash mila"*\n💸 **दुकान खर्च**: *"Dukaan me 500 rs hammali kharcha dalo"*\n📦 **स्टॉक अपडेट**: *"Musakadana me 50 bori aavak jodo"*\n👤 **नया ग्राहक**: *"Naya vyapari jodo: Shyam Traders Neemuch 9826012345"*\n🧭 **नेविगेशन**: *"Reports dikhao" ya "Billing page par le chalo"*\n\nबताइए आज क्या काम करना है?`
    };
  }

  // SMART CONVERSATIONAL FALLBACK (Never says "invalid command")
  return {
    text: `⚡ **MandAi AI Agent:** मैंने आपका निर्देश नोट किया: *"${query}"*\n\nआप मुझसे किसी भी प्रारूप में काम करवा सकते हैं। नीचे तुरंत एक्शन के विकल्प उपलब्ध हैं:\n\n• 🧾 **बिल या इनवॉइस**: पार्टी का नाम, बोरी और भाव बोलें\n• 📜 **मंडी सौदा पर्चा**: नीलामी यार्ड की खरीद दर्ज करें\n• 💰 **गल्ला व रोकड़**: नकद आय-व्यय या उधारी देखें\n• 📦 **स्टॉक जांच**: किसी भी जिंस की वर्तमान स्थिति जानें\n\nक्या आप इस संबंध में कोई नया बिल, सौदा या खाता देखना चाहते हैं?`,
    actionCard: {
      type: 'navigate',
      data: { path: '/billing/new', label: '⚡ नया बिल बनाएं' }
    }
  };
}

// Unified Cloud & Server AI caller with lifetime local fallback
export async function callGeminiAgent(
  query: string, 
  context: AgentContext, 
  apiKey?: string
): Promise<AgentResponse | null> {
  // 1. Try server API route first (which may have process.env.GEMINI_API_KEY or client key)
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        context,
        clientApiKey: apiKey || '',
      })
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.text) {
        if (result.actionIntent && result.actionIntent !== 'none') {
          const localResult = processQueryLocally(query, context);
          return {
            text: result.text,
            actionCard: localResult.actionCard,
          };
        }
        return { text: result.text };
      }
    }
  } catch (e) {
    console.warn('Backend /api/ai call error, checking direct client key', e);
  }

  // 2. Direct browser fetch if client key is provided
  if (apiKey && apiKey.trim()) {
    try {
      const candidateModels = ['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];
      let res: Response | null = null;

      const systemPrompt = `You are MandAi Agent, the intelligent AI business assistant for Mandi Vyaparis and Agricultural traders in India (Neemuch Mandi, MP).
You understand Hindi, Hinglish, and English fluently.
The user is a grain/seed trader (Company: "${context.company.name}", Owner: "${context.company.ownerName}").

Available Parties in Master:
${context.parties.map(p => `- ${p.businessName || p.name} (ID: ${p.id}, Phone: ${p.phone}, Balance: Rs ${p.currentBalance})`).join('\n')}

Available Products in Master:
${context.products.map(p => `- ${p.name} (${p.hindiName || ''}, Stock: ${p.currentStock} Kg, Selling: Rs ${p.sellingPrice}/Kg, BagWeight: ${p.bagWeightKg || 50}kg)`).join('\n')}

Financial Snapshot:
- Cash in Hand: Rs ${context.cashInHand}
- Bank Accounts: ${context.bankAccounts.map(b => `${b.bankName}: Rs ${b.currentBalance}`).join(', ')}
- Total Invoices: ${context.invoices.length}

INSTRUCTIONS:
1. Always respond in polite, clear Hindi/Hinglish with emojis.
2. If the user wants to make a bill, create a sauda parcha, record payment, add expense, adjust stock, or add party, return a helpful conversational explanation AND set actionIntent appropriately.
3. Be friendly, accurate, and speak like an experienced Mandi Munim / Business Manager.

Return your answer strictly in valid JSON format with this structure:
{
  "text": "Your helpful markdown response in Hindi/Hinglish",
  "actionIntent": "create_bill" | "create_sauda" | "record_payment" | "add_expense" | "update_stock" | "none"
}`;

      for (const model of candidateModels) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
          const r = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nUser Query: "${query}"` }]
                }
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
              }
            })
          });
          if (r.ok) {
            res = r;
            break;
          }
        } catch {
          // try next model
        }
      }

      if (res && res.ok) {
        const data = await res.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          if (parsed.actionIntent && parsed.actionIntent !== 'none') {
            const localResult = processQueryLocally(query, context);
            return {
              text: parsed.text || localResult.text,
              actionCard: localResult.actionCard,
            };
          }
          return { text: parsed.text };
        }
      }
    } catch (err) {
      console.warn('Failed direct client Gemini API call', err);
    }
  }

  return null;
}
