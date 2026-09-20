'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { formatIndianCurrency, numberToIndianWords } from '@/lib/gstUtils';
import { InvoiceItem, DocumentType, Party, Product } from '@/lib/types';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  X, 
  Bot, 
  User, 
  Receipt, 
  UserPlus, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Printer, 
  Plus, 
  HelpCircle,
  RefreshCw,
  Wallet,
  Building2,
  Share2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  actionCard?: {
    type: 'create_bill' | 'add_party' | 'update_stock' | 'add_expense' | 'financial_summary';
    data: any;
    status?: 'pending' | 'executed';
  };
}

export const SmartAiAssistant: React.FC = () => {
  const router = useRouter();
  const { 
    company, 
    parties, 
    products, 
    invoices, 
    bankAccounts, 
    cashInHand, 
    addInvoice, 
    addParty, 
    adjustStock, 
    addTransaction, 
    language 
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: `🙏 **नमस्ते! मैं MandAi स्मार्ट असिस्टेंट हूँ।**\n\nआप मुझसे बोलकर या लिखकर तुरंत काम करा सकते हैं:\n• **बिल बनाएं**: "Raj & Co ko 44 bori musakadana ka 215 ke bhav se bill banao"\n• **नया ग्राहक**: "नया ग्राहक जोड़ें: Ramesh Trader Neemuch phone 9826012345 GST 23AAAAA1234A1Z5"\n• **स्टॉक अपडेट**: "मुसकादाना में 50 बोरी आवक जोड़ो"\n• **हिसाब किताब**: "आज का गल्ला और बकाया उधारी बताओ"`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Web Speech API Voice Recognition
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('आपके ब्राउज़र में Voice Speech Recognition समर्थित नहीं है। कृपया लिखकर निर्देश दें।');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // NLP Parser Engine for Mandi Terms
  const processQuery = (query: string) => {
    const q = query.toLowerCase().trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. BILL / INVOICE CREATION
    if (
      q.includes('bill') || 
      q.includes('बिल') || 
      q.includes('invoice') || 
      q.includes('banao') || 
      q.includes('बनाओ') || 
      q.includes('create') ||
      q.includes('challan') ||
      q.includes('चालान') ||
      q.includes('estimate') ||
      q.includes('कोटेशन')
    ) {
      // Find matching party
      let matchedParty = parties.find(p => 
        q.includes(p.name.toLowerCase()) || 
        (p.businessName && q.includes(p.businessName.toLowerCase()))
      ) || parties[0];

      // Find matching product
      let matchedProduct = products.find(p => 
        q.includes(p.name.toLowerCase()) || 
        (p.hindiName && q.includes(p.hindiName.toLowerCase()))
      ) || products[0];

      // Extract bags count (e.g. 50 bori, 44 bags, 100 कट्टा, 20 बोरी)
      let bags = 40;
      const bagsMatch = q.match(/(\d+)\s*(?:bori|bag|bags|katta|कट्टा|बोरी)/i) || q.match(/(\d+)\s*(?:b|bg)/i);
      if (bagsMatch) {
        bags = parseInt(bagsMatch[1], 10);
      } else {
        const numbers = q.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          bags = parseInt(numbers[0], 10);
        }
      }

      // Extract Rate (e.g. 215 rate, rate 215, 215 ke bhav, bhav 215, @215)
      let rate = matchedProduct?.sellingPrice || 215;
      const rateMatch = q.match(/(?:rate|bhav|भाव|दर|at|@|ke)\s*(\d+(?:\.\d+)?)/i) || q.match(/(\d+(?:\.\d+)?)\s*(?:rate|bhav|भाव|दर|rupaye|rs|₹)/i);
      if (rateMatch) {
        rate = parseFloat(rateMatch[1]);
      }

      // Determine doc type
      let docType: DocumentType = 'tax_invoice';
      if (q.includes('estimate') || q.includes('quotation') || q.includes('कोटेशन') || q.includes('अनुमान')) {
        docType = 'quotation_estimate';
      } else if (q.includes('challan') || q.includes('चालान') || q.includes('delivery')) {
        docType = 'delivery_challan';
      } else if (q.includes('credit note') || q.includes('क्रेडिट नोट') || q.includes('return') || q.includes('वापसी')) {
        docType = 'credit_note';
      }

      // Calculations
      const bagWeight = matchedProduct?.bagWeightKg || 50;
      const qty = bags * bagWeight; // in Kg
      const taxableValue = qty * rate;
      const gstRate = matchedProduct?.gstRate || 5;
      const isInterState = matchedParty?.state && matchedParty.state !== company.state;
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
        productId: matchedProduct.id,
        name: matchedProduct.name,
        hsnSac: matchedProduct.hsnSac || '12119011',
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
        partyId: matchedParty.id,
        party: matchedParty,
        billingAddress: matchedParty.billingAddress,
        placeOfSupply: `${matchedParty.state} (${matchedParty.stateCode})`,
        isInterState: !!isInterState,
        vehicleNo: 'MP 44 GA 8819',
        biltyNo: '',
        transporterName: 'Neemuch Roadways Carrier',
        transporterId: '',
        distanceKm: 120,
        stationTo: matchedParty.city,
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
        notes: 'MandAi AI Assistant Generated Bill',
      };

      setMessages(prev => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'assistant',
          text: `✅ **मैंने ${matchedParty.businessName || matchedParty.name} के लिए ${docType === 'tax_invoice' ? 'टैक्स बिल' : docType === 'quotation_estimate' ? 'कोटेशन' : 'चालान'} तैयार कर दिया है!**\n\n• **जिंस (Item)**: ${matchedProduct.name} (${bags} बोरी / ${qty} Kg)\n• **भाव (Rate)**: ₹${rate}/Kg\n• **कुल देय राशि**: ₹${finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\nनीचे दिए गए बटन पर क्लिक करके तुरंत बिल सेव करें और प्रिंट देखें:`,
          time: timeNow,
          actionCard: {
            type: 'create_bill',
            data: billData,
            status: 'pending'
          }
        }
      ]);
      return;
    }

    // 2. ADD NEW CUSTOMER / PARTY
    if (
      q.includes('customer') || 
      q.includes('party') || 
      q.includes('vyapari') || 
      q.includes('पार्टी') || 
      q.includes('ग्राहक') || 
      q.includes('व्यापारी') ||
      q.includes('jodo') ||
      q.includes('जोड़ें')
    ) {
      // Extract phone
      const phoneMatch = q.match(/(?:\+91|91|0)?[6-9]\d{9}/);
      const phone = phoneMatch ? phoneMatch[0] : '9826011223';

      // Extract GSTIN
      const gstMatch = q.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/i);
      const gstin = gstMatch ? gstMatch[0].toUpperCase() : '';

      // Extract Name
      let rawName = query
        .replace(/naya|customer|party|jodo|add|new|phone|gst|vyapari|नया|ग्राहक|पार्टी|जोड़ें|व्यापारी|मोबाइल|नंबर/gi, '')
        .replace(phone, '')
        .replace(gstin, '')
        .trim();
      
      const cleanName = rawName.split(/[\n,;:]/)[0].trim() || 'Shrinath Trading Co.';

      const newPartyData = {
        name: cleanName,
        businessName: cleanName.includes('Co') || cleanName.includes('Trading') || cleanName.includes('Traders') ? cleanName : `${cleanName} Krishi Vyapar`,
        type: (q.includes('kisan') || q.includes('farmer') ? 'farmer' : q.includes('supplier') ? 'supplier' : 'customer') as any,
        phone,
        email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@mandai.in`,
        city: 'Neemuch',
        state: 'Madhya Pradesh',
        stateCode: '23',
        gstin: gstin || '23AAACS9988E1ZG',
        pan: gstin ? gstin.substring(2, 12) : 'AAACS9988E',
        billingAddress: `Krishi Upaj Mandi Yard, Neemuch (M.P.) 458441`,
        openingBalance: 0,
        creditLimit: 500000,
        paymentTermsDays: 15,
      };

      setMessages(prev => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'assistant',
          text: `👤 **नया व्यापारी / ग्राहक विवरण निकाला गया:**\n\n• **फर्म का नाम**: ${newPartyData.businessName}\n• **संपर्क नंबर**: ${newPartyData.phone}\n• **GSTIN**: ${newPartyData.gstin}\n• **शहर**: ${newPartyData.city} (${newPartyData.state})\n\nक्या आप इसे पार्टी मास्टर में जोड़ना चाहते हैं?`,
          time: timeNow,
          actionCard: {
            type: 'add_party',
            data: newPartyData,
            status: 'pending'
          }
        }
      ]);
      return;
    }

    // 3. STOCK INWARD / OUTWARD / INVENTORY
    if (
      q.includes('stock') || 
      q.includes('स्टॉक') || 
      q.includes('aavak') || 
      q.includes('आवक') || 
      q.includes('jaavak') || 
      q.includes('जावक')
    ) {
      let matchedProduct = products.find(p => 
        q.includes(p.name.toLowerCase()) || 
        (p.hindiName && q.includes(p.hindiName.toLowerCase()))
      ) || products[0];

      const bagsMatch = q.match(/(\d+)\s*(?:bori|bag|katta|बोरी|कट्टा)/i);
      const bags = bagsMatch ? parseInt(bagsMatch[1], 10) : 50;
      const isOutward = q.includes('jaavak') || q.includes('जावक') || q.includes('minus') || q.includes('bika') || q.includes('ghatat');
      const qtyDiff = (isOutward ? -1 : 1) * bags * (matchedProduct.bagWeightKg || 50);
      const bagDiff = (isOutward ? -1 : 1) * bags;

      if (q.includes('kitna') || q.includes('batao') || q.includes('how much') || (!q.includes('jodo') && !q.includes('update') && !bagsMatch)) {
        const currentBags = Math.round(matchedProduct.currentStock / (matchedProduct.bagWeightKg || 50));
        setMessages(prev => [
          ...prev,
          {
            id: 'ai-' + Date.now(),
            sender: 'assistant',
            text: `🌾 **${matchedProduct.name} ${matchedProduct.hindiName ? `(${matchedProduct.hindiName})` : ''} का वर्तमान स्टॉक:**\n\n• **कुल वजन**: **${matchedProduct.currentStock.toLocaleString('en-IN')} Kg**\n• **कुल बोरियां**: **${currentBags} बोरी**\n• **वर्तमान मंडी भाव**: ₹${matchedProduct.sellingPrice}/Kg\n• **कुल स्टॉक संपत्ति मूल्य**: ${formatIndianCurrency(matchedProduct.currentStock * matchedProduct.sellingPrice)}`,
            time: timeNow,
          }
        ]);
        return;
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'assistant',
          text: `📦 **स्टॉक ${isOutward ? 'जावक / घटत (-)' : 'आवक (+)'} तैयार है:**\n\n• **जिंस**: ${matchedProduct.name}\n• **बोरियां**: ${isOutward ? '-' : '+'}${bags} बोरी (${Math.abs(qtyDiff)} Kg)\n• **नया संभावित स्टॉक**: ${(matchedProduct.currentStock + qtyDiff).toLocaleString('en-IN')} Kg`,
          time: timeNow,
          actionCard: {
            type: 'update_stock',
            data: {
              productId: matchedProduct.id,
              productName: matchedProduct.name,
              qtyDiff,
              bagDiff,
              newStock: matchedProduct.currentStock + qtyDiff,
            },
            status: 'pending'
          }
        }
      ]);
      return;
    }

    // 4. FINANCIAL SUMMARY / UDHAAR / GULLA / BANK BALANCE
    if (
      q.includes('udhaar') || 
      q.includes('उधारी') || 
      q.includes('balance') || 
      q.includes('बकाया') || 
      q.includes('hisab') || 
      q.includes('हिसाब') || 
      q.includes('galla') || 
      q.includes('गल्ला') || 
      q.includes('bank') || 
      q.includes('cash') ||
      q.includes('रोकड़')
    ) {
      const totalBilled = invoices.reduce((sum, i) => sum + i.finalAmount, 0);
      const totalReceived = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
      const totalDue = invoices.reduce((sum, i) => sum + i.balanceAmount, 0);
      const totalBank = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);
      const topDueInvoices = invoices.filter(i => i.balanceAmount > 0).slice(0, 3);

      setMessages(prev => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'assistant',
          text: `💰 **आज की संपूर्ण वित्तीय व गल्ला स्थिति:**\n\n• 🏦 **कुल बैंक बैलेंस**: **${formatIndianCurrency(totalBank)}** (${bankAccounts.length} खाते)\n• 💵 **रोकड़ / नकद गल्ला**: **${formatIndianCurrency(cashInHand)}**\n• 📊 **कुल मार्केट उधारी (Receivable)**: **${formatIndianCurrency(totalDue)}**\n• 🧾 **कुल बिलिंग राशि**: **${formatIndianCurrency(totalBilled)}** (जमा: ${formatIndianCurrency(totalReceived)})\n\n**शीर्ष बकाया पार्टियां:**\n${topDueInvoices.map(i => `• ${i.party.businessName || i.party.name}: **${formatIndianCurrency(i.balanceAmount)}** (बिल #${i.invoiceNumber})`).join('\n')}`,
          time: timeNow,
          actionCard: {
            type: 'financial_summary',
            data: { totalDue, totalBank, cashInHand, topDueInvoices }
          }
        }
      ]);
      return;
    }

    // Default Fallback Help
    setMessages(prev => [
      ...prev,
      {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: `🤔 **मैं आपकी बात समझ रहा हूँ!** आप नीचे दिए गए किसी भी स्मार्ट विकल्प को दबा सकते हैं या इस तरह बोल/लिख सकते हैं:\n\n1. *"Raj & Company ko 50 bori Musakadana ka 215 ke rate se bill bana do"*\n2. *"Naya customer jodo: Ramesh Trading Neemuch phone 9826012345"*\n3. *"Musakadana ka stock kitna hai?"*\n4. *"Dukaan ka kharcha 500 rupaye hammali add karo"*`,
        time: timeNow,
      }
    ]);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');

    setTimeout(() => {
      processQuery(currentInput);
    }, 400);
  };

  const executeActionCard = (msgId: string, card: NonNullable<ChatMessage['actionCard']>) => {
    if (card.type === 'create_bill') {
      const created = addInvoice(card.data);
      setMessages(prev => prev.map(m => m.id === msgId && m.actionCard ? {
        ...m,
        actionCard: { ...m.actionCard, status: 'executed' }
      } : m));

      // Redirect to invoice page
      router.push(`/billing/${created.id}`);
      setIsOpen(false);
    } else if (card.type === 'add_party') {
      addParty(card.data);
      setMessages(prev => prev.map(m => m.id === msgId && m.actionCard ? {
        ...m,
        actionCard: { ...m.actionCard, status: 'executed' }
      } : m));
      alert(`✓ पार्टी "${card.data.businessName}" को सफलतापूर्वक मास्टर में जोड़ दिया गया है!`);
    } else if (card.type === 'update_stock') {
      adjustStock(card.data.productId, card.data.qtyDiff, card.data.bagDiff);
      setMessages(prev => prev.map(m => m.id === msgId && m.actionCard ? {
        ...m,
        actionCard: { ...m.actionCard, status: 'executed' }
      } : m));
      alert(`✓ स्टॉक सफलतापूर्वक अपडेट कर दिया गया!`);
    }
  };

  return (
    <>
      {/* Floating AI Launcher Trigger Button */}
      <div className="fixed bottom-5 right-5 z-50 print:hidden flex flex-col items-end gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-black text-xs sm:text-sm px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all transform active:scale-95 cursor-pointer border border-white/20"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white animate-pulse"></span>
          </div>
          <span className="tracking-tight">✨ MandAi Smart AI</span>
          <span className="hidden sm:inline-block bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            बोलकर / लिखकर
          </span>
        </button>
      </div>

      {/* AI Drawer Modal Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full h-[88vh] max-h-[750px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black flex items-center gap-2 text-white">
                    MandAi Vyapar Copilot ⚡
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    हिंदी, हिंग्लिश या इंग्लिश में बोलकर बिल बनाएं और व्यापार संभालें
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompt Suggestions Chips */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px] shrink-0">
              <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                सुझाव:
              </span>
              {[
                'Raj & Co को 44 बोरी मुसकादाना का 215 के भाव से बिल बनाओ',
                'नया ग्राहक जोड़ें: Shrinath Traders Neemuch 9826011223',
                'मुसकादाना का स्टॉक कितना है?',
                'आज की उधारी व बकाया बैलेंस बताओ',
                '50 बोरी मुसकादाना आवक जोड़ें'
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(prompt);
                  }}
                  className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition cursor-pointer shadow-xs"
                >
                  ⚡ {prompt}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white font-bold text-xs'
                        : 'bg-slate-900 dark:bg-indigo-600 text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Action Cards */}
                    {msg.actionCard && (
                      <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-700">
                        {/* 1. Create Bill Action Card */}
                        {msg.actionCard.type === 'create_bill' && (
                          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                <Receipt className="w-4 h-4" />
                                {msg.actionCard.data.docType === 'tax_invoice' ? 'टैक्स बिल ड्राफ्ट' : 'दस्तावेज़ ड्राफ्ट'}
                              </span>
                              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                                #{msg.actionCard.data.invoiceNumber}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                              <div>
                                <span className="text-slate-400 block">पार्टी (Buyer):</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {msg.actionCard.data.party.businessName || msg.actionCard.data.party.name}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-400 block">कुल रकम (Grand Total):</span>
                                <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                                  {formatIndianCurrency(msg.actionCard.data.finalAmount)}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                              {msg.actionCard.status === 'executed' ? (
                                <span className="w-full text-center py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  बिल सफलतापूर्वक बना दिया गया!
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => executeActionCard(msg.id, msg.actionCard!)}
                                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
                                >
                                  <Printer className="w-4 h-4" />
                                  ⚡ अभी बिल बनाएं और प्रिंट खोलें
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 2. Add Party Action Card */}
                        {msg.actionCard.type === 'add_party' && (
                          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                              <span>{msg.actionCard.data.businessName}</span>
                              <span className="font-mono text-indigo-600">{msg.actionCard.data.phone}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">
                              GST: {msg.actionCard.data.gstin || 'N/A'} • {msg.actionCard.data.city}
                            </p>

                            <div className="pt-1">
                              {msg.actionCard.status === 'executed' ? (
                                <span className="w-full text-center py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  पार्टी जोड़ी जा चुकी है!
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => executeActionCard(msg.id, msg.actionCard!)}
                                  className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl shadow-md transition transform active:scale-95"
                                >
                                  <UserPlus className="w-4 h-4" />
                                  ✅ पार्टी मास्टर में जोड़ें
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 3. Update Stock Action Card */}
                        {msg.actionCard.type === 'update_stock' && (
                          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                              <span>{msg.actionCard.data.productName}</span>
                              <span className="text-emerald-600 font-mono font-bold">
                                {msg.actionCard.data.qtyDiff > 0 ? '+' : ''}{msg.actionCard.data.qtyDiff} Kg
                              </span>
                            </div>
                            <div className="pt-1">
                              {msg.actionCard.status === 'executed' ? (
                                <span className="w-full text-center py-2 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  स्टॉक अपडेट हो गया!
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => executeActionCard(msg.id, msg.actionCard!)}
                                  className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl shadow-md transition transform active:scale-95"
                                >
                                  <Package className="w-4 h-4" />
                                  📦 स्टॉक अपडेट कन्फर्म करें
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <span className="block text-[9.5px] opacity-60 text-right mt-1 font-mono">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
            >
              {/* Mic Voice Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-2xl transition shadow-md flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
                title={isListening ? 'सुन रहा हूँ... बोलिए' : 'बोलकर निर्देश दें (Mic)'}
              >
                {isListening ? <Mic className="w-5 h-5 animate-bounce" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                placeholder={isListening ? 'सुन रहा हूँ, बोलिए...' : 'लिखें जैसे: "Raj & Co ko 44 bori musakadana 215 bhav se bill banao"...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 focus:outline-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-3 rounded-2xl shadow-lg transition transform active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
