'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { formatIndianCurrency } from '@/lib/gstUtils';
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
  Share2,
  ScrollText,
  CreditCard,
  Calculator,
  Volume2,
  VolumeX,
  Compass,
  Key,
  Trash2,
  ChevronRight,
  TrendingUp,
  Scale,
  Pencil,
  Check
} from 'lucide-react';
import { 
  processQueryLocally, 
  callGeminiAgent, 
  AgentActionCard, 
  AgentResponse,
  AgentContext 
} from './agentEngine';
import { MandAiLogo } from '@/components/common/MandAiLogo';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  actionCard?: AgentActionCard;
}

export const SmartAiAssistant: React.FC = () => {
  const router = useRouter();
  const { 
    company, 
    parties, 
    products, 
    invoices, 
    bankAccounts, 
    transactions,
    saudaSlips,
    cashInHand, 
    addInvoice, 
    addParty, 
    adjustStock, 
    addTransaction, 
    recordPayment,
    addSaudaSlip,
    language 
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load saved Gemini API key
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const defaultEnvKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      const savedKey = localStorage.getItem('mandai_gemini_api_key') || defaultEnvKey;
      setGeminiApiKey(savedKey);
      setTempApiKey(savedKey);
    }
  }, []);

  // Save API Key
  const handleSaveApiKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mandai_gemini_api_key', tempApiKey.trim());
      setGeminiApiKey(tempApiKey.trim());
      setShowKeyModal(false);
    }
  };

  // Welcome message initialization with clear instructions about ANY custom name
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: `🙏 **नमस्ते! मैं आपका MandAi AI एजेंट हूँ।**\n\nआप **अपनी पसंद के किसी भी ग्राहक, किसान, जिंस या भाव** का नाम बोलकर या लिखकर बिल, सौदा पर्चा या हिसाब बना सकते हैं:\n\n• 🧾 **बिल बनाएं**: "[ग्राहक का नाम] को [बोरी] बोरी [जिंस] का [भाव] से बिल बनाओ"\n• 📜 **सौदा पर्चा**: "[किसान का नाम] के साथ [बोरी] बोरी [जिंस] का सौदा पर्चा बनाओ"\n• 💳 **पेमेंट दर्ज करें**: "[पार्टी] से [रकम] नकद मिले" या "[पार्टी] को [रकम] दिए"\n• 💸 **खर्चा दर्ज करें**: "दुकान में [रकम] रुपये चाय-नाश्ता / हम्माली खर्चा जोड़ो"\n• 📦 **स्टॉक अपडेट**: "[जिंस का नाम] में [बोरी] बोरी आवक जोड़ो"\n• 📒 **खाता / उधारी**: "[पार्टी का नाम] का हिसाब बताओ"\n• 💰 **गल्ला व रोकड़**: "आज का गल्ला और बैंक बैलेंस बताओ"\n\n✏️ **बदलाव की पूरी छूट**: हर कार्ड में **'✏️ नाम व भाव बदलें'** का विकल्प है, जहाँ से आप पार्टी का नाम, जिंस, बोरी या भाव कभी भी टाइप करके तुरंत बदल सकते हैं!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isProcessing]);

  // Voice speech synthesis (TTS)
  const speakText = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('आपके ब्राउज़र में वॉइस स्पीकर उपलब्ध नहीं है।');
      return;
    }

    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/₹/g, 'रुपये ')
      .replace(/•/g, ', ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'hi-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Voice Speech Recognition
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

  // Helper to update card data in real-time
  const updateCardData = (msgId: string, updatedData: any) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.actionCard) {
        return {
          ...m,
          actionCard: {
            ...m.actionCard,
            data: { ...m.actionCard.data, ...updatedData }
          }
        };
      }
      return m;
    }));
  };

  // Field change handler for Create Bill Card
  const handleBillFieldChange = (msgId: string, currentData: any, field: string, value: any) => {
    const newData = { ...currentData };
    if (field === 'partyName') {
      newData.party = { ...newData.party, name: value, businessName: value };
    } else if (field === 'commodity') {
      const updatedItems = [...newData.items];
      updatedItems[0] = { ...updatedItems[0], name: value };
      newData.items = updatedItems;
    } else if (field === 'bags') {
      const bags = Number(value) || 1;
      const bagWeight = newData.items[0]?.bagWeightKg || 50;
      const qty = bags * bagWeight;
      const rate = newData.items[0]?.rate || 215;
      const taxableValue = qty * rate;
      const gstRate = 5;
      const totalTax = (taxableValue * gstRate) / 100;
      const otherCharges = 40 * bags + 6.5 * bags + 5 * bags;
      const finalAmount = taxableValue + otherCharges + totalTax;

      newData.totalBags = bags;
      newData.totalQty = qty;
      newData.taxableAmount = taxableValue;
      newData.otherCharges = otherCharges;
      newData.totalTax = totalTax;
      newData.finalAmount = finalAmount;
      newData.balanceAmount = finalAmount;
      newData.items = [{
        ...newData.items[0],
        bags,
        qty,
        taxableValue,
        total: finalAmount
      }];
    } else if (field === 'rate') {
      const rate = Number(value) || 1;
      const qty = newData.totalQty || 2000;
      const bags = newData.totalBags || 40;
      const taxableValue = qty * rate;
      const gstRate = 5;
      const totalTax = (taxableValue * gstRate) / 100;
      const otherCharges = newData.otherCharges || (40 * bags);
      const finalAmount = taxableValue + otherCharges + totalTax;

      newData.taxableAmount = taxableValue;
      newData.totalTax = totalTax;
      newData.finalAmount = finalAmount;
      newData.balanceAmount = finalAmount;
      newData.items = [{
        ...newData.items[0],
        rate,
        taxableValue,
        total: finalAmount
      }];
    }
    updateCardData(msgId, newData);
  };

  // Field change handler for Sauda Slip Card
  const handleSaudaFieldChange = (msgId: string, currentData: any, field: string, value: any) => {
    const newData = { ...currentData, [field]: value };
    if (field === 'bags' || field === 'ratePerQuintal') {
      const bags = field === 'bags' ? Number(value) || 1 : (currentData.bags || 17);
      const ratePerQtl = field === 'ratePerQuintal' ? Number(value) || 1 : (currentData.ratePerQuintal || 12050);
      const bagWeight = currentData.bagWeightKg || 60;
      const netWeightQtl = (bags * bagWeight) / 100;
      const grossAmount = netWeightQtl * ratePerQtl;
      const hammali = currentData.hammaliAmount || (bags * 9.5);
      const katoti = currentData.katotiAmount || 0;
      const netPayable = Math.max(0, grossAmount - katoti - hammali);

      newData.bags = bags;
      newData.netWeightQuintal = Number(netWeightQtl.toFixed(3));
      newData.ratePerQuintal = ratePerQtl;
      newData.totalAmount = Number(grossAmount.toFixed(2));
      newData.netPayable = Number(netPayable.toFixed(2));
      if (newData.paymentMode !== 'Cash') {
        newData.bankPayAmount = Number(netPayable.toFixed(2));
      } else {
        newData.cashPayAmount = Number(netPayable.toFixed(2));
      }
    }
    updateCardData(msgId, newData);
  };

  // Field change handler for Record Payment Card
  const handlePaymentFieldChange = (msgId: string, currentData: any, field: string, value: any) => {
    const newData = { ...currentData, [field]: field === 'amount' ? Number(value) || 0 : value };
    updateCardData(msgId, newData);
  };

  // Core Processing Handler
  const handleProcessQuery = async (queryText: string) => {
    setIsProcessing(true);
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const context: AgentContext = {
      company,
      parties,
      products,
      invoices,
      bankAccounts,
      transactions,
      saudaSlips,
      cashInHand,
      language,
    };

    let response: AgentResponse | null = null;

    if (geminiApiKey) {
      response = await callGeminiAgent(queryText, context, geminiApiKey);
    }

    if (!response) {
      response = processQueryLocally(queryText, context);
    }

    setMessages(prev => [
      ...prev,
      {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: response.text,
        time: timeNow,
        actionCard: response.actionCard,
      }
    ]);

    setIsProcessing(false);
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

    const currentInput = inputText.trim();
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      handleProcessQuery(currentInput);
    }, 300);
  };

  // Action Card Executor
  const executeActionCard = (msgId: string, card: NonNullable<ChatMessage['actionCard']>) => {
    if (card.type === 'create_bill') {
      const created = addInvoice(card.data);
      setMessages(prev => prev.map(m => m.id === msgId && m.actionCard ? {
        ...m,
        actionCard: { ...m.actionCard, status: 'executed' }
      } : m));

      router.push(`/billing/${created.id}`);
      setIsOpen(false);
    } else if (card.type === 'create_sauda') {
      addSaudaSlip(card.data);
      setMessages(prev => prev.map(m => m.id === msgId && m.actionCard ? {
        ...m,
        actionCard: { ...m.actionCard, status: 'executed' }
      } : m));

      router.push('/sauda');
      setIsOpen(false);
    } else if (card.type === 'record_payment') {
      recordPayment(card.data);
      setMessages(prev => prev.map(m => m.id === msgId && m.actionCard ? {
        ...m,
        actionCard: { ...m.actionCard, status: 'executed' }
      } : m));
      alert(`✓ ${card.data.partyName} का ${formatIndianCurrency(card.data.amount)} पेमेंट सफलतापूर्वक दर्ज हो गया!`);
    } else if (card.type === 'add_expense') {
      addTransaction(card.data);
      setMessages(prev => prev.map(m => m.id === msgId && m.actionCard ? {
        ...m,
        actionCard: { ...m.actionCard, status: 'executed' }
      } : m));
      alert(`✓ रोकड़ बही में ${formatIndianCurrency(card.data.amount)} का खर्चा दर्ज हो गया!`);
    } else if (card.type === 'update_stock') {
      adjustStock(card.data.productId, card.data.qtyDiff, card.data.bagDiff);
      setMessages(prev => prev.map(m => m.id === msgId && m.actionCard ? {
        ...m,
        actionCard: { ...m.actionCard, status: 'executed' }
      } : m));
      alert(`✓ स्टॉक सफलतापूर्वक अपडेट कर दिया गया!`);
    } else if (card.type === 'add_party') {
      addParty(card.data);
      setMessages(prev => prev.map(m => m.id === msgId && m.actionCard ? {
        ...m,
        actionCard: { ...m.actionCard, status: 'executed' }
      } : m));
      alert(`✓ पार्टी "${card.data.businessName}" को सफलतापूर्वक मास्टर में जोड़ दिया गया!`);
    } else if (card.type === 'navigate') {
      router.push(card.data.path);
      setIsOpen(false);
    }
  };

  // Dynamic party & product samples from actual database
  const p1 = parties[0]?.businessName || 'Shyam Traders';
  const p2 = parties[1]?.businessName || 'Kailash Sharma';
  const p3 = parties[2]?.businessName || 'Rameshwar Ji';
  const prod1 = products[0]?.name || 'Isabgol';
  const prod2 = products[1]?.name || 'Gehu';
  const prod3 = products[2]?.name || 'Chana';

  // Dynamic suggestions reflecting real user data & open templates
  const categoryChips: { id: string; label: string; prompts: string[] }[] = [
    {
      id: 'all',
      label: '⚡ सभी कमांड',
      prompts: [
        `${p1} ko 30 bori ${prod1} 220 ke bhav se bill banao`,
        `${p2} ke sath 50 bori ${prod2} 2450 bhav sauda parcha banao`,
        `${p3} se 35000 cash mila payment likho`,
        `Dukaan me 500 rs chai nashta kharcha dalo`,
        `${prod1} ka stock kitna hai?`,
        `Kiske kitne paise baaki hai?`
      ]
    },
    {
      id: 'billing',
      label: '🧾 बिलिंग',
      prompts: [
        `${p1} ko 40 bori ${prod1} 215 ke bhav se bill banao`,
        `Anil Traders ko 50 bori ${prod2} ka estimate quotation banao`,
        `Kishan Lal ko 25 bori ${prod3} ka tax invoice bana do`,
        `Delivery challan banao 100 bori gehu`
      ]
    },
    {
      id: 'sauda',
      label: '📜 सौदा पर्चा',
      prompts: [
        `Kundan S/O Mukesh Rathore ka 17 bori isabgol 12050 bhav sauda parcha banao`,
        `${p2} ke sath 40 bori ${prod2} 2600 bhav sauda parcha likho`,
        `Sauda parcha register kholo`
      ]
    },
    {
      id: 'money',
      label: '💰 रोकड़ व पेमेंट',
      prompts: [
        `${p1} se 50000 rupaye cash mila payment likho`,
        `${p2} ko 25000 bank transfer kiye entry dalo`,
        `Dukaan ka 450 rs chai nashta kharcha likho`,
        `Bank me 20000 cash deposit kiye`,
        `Aaj ka galla aur bank balance batao`
      ]
    },
    {
      id: 'stock',
      label: '📦 स्टॉक व गोदाम',
      prompts: [
        `${prod1} me 50 bori aavak jodo`,
        `${prod2} ka stock kitna bacha hai?`,
        `Godam me konsa maal kam hai?`,
        `Total warehouse stock valuation kitni hai?`
      ]
    },
    {
      id: 'khata',
      label: '📒 खाता व लेजर',
      prompts: [
        `${p1} ka hisab batao`,
        `Sabse zyada udhari kiski hai?`,
        `Naya kisan jodo: Ramvilas Patel Neemuch 9826011223`,
        `Naya vyapari jodo: Mahadev Spices GST 23AAAAA1234A1Z5`
      ]
    }
  ];

  const currentPrompts = categoryChips.find(c => c.id === activeCategory)?.prompts || categoryChips[0].prompts;

  return (
    <>
      {/* Floating Apple-Style Liquid Water Drop AI Logo */}
      <div className="fixed bottom-5 right-5 z-50 print:hidden flex items-center gap-3 group">
        {/* Crystal Glass Hover Pill */}
        <div className="hidden sm:flex items-center gap-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl text-slate-800 dark:text-white pl-4 pr-3.5 py-2 rounded-full border border-sky-300/70 dark:border-sky-500/40 shadow-[0_8px_25px_rgba(2,132,199,0.2)] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-3 group-hover:translate-x-0 pointer-events-none">
          <span className="font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="text-sky-500 font-bold">💧</span> MandAi AI
          </span>
          <span className="text-[10px] text-sky-700 dark:text-sky-300 font-bold bg-sky-100 dark:bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-300 dark:border-sky-700 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            बोलें या लिखें
          </span>
        </div>

        {/* The Liquid Water Drop Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center p-1 rounded-full cursor-pointer transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-none"
          aria-label="Open MandAi AI Assistant"
          title="MandAi AI Agent (Liquid Water Drop)"
        >
          {/* Animated Water Ripple Caustic Aura */}
          <span
            className="absolute -inset-2 rounded-full bg-gradient-to-tr from-cyan-400/60 via-sky-500/50 to-indigo-500/50 blur-lg opacity-80 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"
          />

          {/* 3D Crystal Water Drop Dome */}
          <div className="relative p-1.5 rounded-full bg-white/85 dark:bg-slate-900/80 backdrop-blur-2xl border-2 border-white dark:border-white/60 shadow-[0_14px_36px_rgba(2,132,199,0.38),0_4px_12px_rgba(0,0,0,0.1),inset_0_3px_6px_rgba(255,255,255,0.95),inset_0_-3px_8px_rgba(2,132,199,0.25)] flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_18px_45px_rgba(2,132,199,0.5)]">
            {/* Water Droplet Specular Reflection Arc on top-left */}
            <span className="absolute top-1.5 left-2.5 w-5 h-2.5 bg-gradient-to-b from-white to-transparent rounded-full opacity-90 pointer-events-none transform -rotate-12" />

            {/* Liquid Water Drop Logo */}
            <MandAiLogo size={52} shape="droplet" animated={true} />

            {/* Emerald Live Pulse Dot */}
            <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-md" />
            </span>
          </div>
        </button>
      </div>

      {/* AI Drawer Modal Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full h-[90vh] max-h-[780px] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <MandAiLogo size={44} animated />
                <div>
                  <h3 className="text-sm sm:text-base font-black flex items-center gap-2 text-white">
                    MandAi Autonomous Agent ⚡
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      All Names & Commands
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    किसी भी ग्राहक, किसान, जिंस या भाव का नाम लिखें — कार्ड में बदलाव की पूरी सुविधा
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Optional Gemini Key button */}
                <button
                  onClick={() => setShowKeyModal(true)}
                  title="Google Gemini AI Key Setup"
                  className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    geminiApiKey 
                      ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span className="hidden md:inline text-[10px]">{geminiApiKey ? 'AI Key ✓' : 'AI Key'}</span>
                </button>

                {/* Clear Chat */}
                <button
                  onClick={() => {
                    setMessages([
                      {
                        id: 'welcome-' + Date.now(),
                        sender: 'assistant',
                        text: `🙏 **बातचीत रीसेट कर दी गई है।**\n\nआप किसी भी नई पार्टी, किसान, जिंस या रकम का नाम लिखकर तुरंत बिल, सौदा या पेमेंट दर्ज करवा सकते हैं।`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      }
                    ]);
                  }}
                  title="बातचीत साफ़ करें"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="bg-slate-100 dark:bg-slate-800/80 px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] shrink-0">
              {categoryChips.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Prompt Suggestions Chips */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px] shrink-0">
              <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                सुझाव:
              </span>
              {currentPrompts.map((prompt, idx) => (
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
                        : 'bg-transparent text-white'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <MandAiLogo size={32} showSparkle={false} />
                    )}
                  </div>

                  <div
                    className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Rich Action Cards with INLINE EDITING */}
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
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingCardId(editingCardId === msg.id ? null : msg.id)}
                                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md"
                                >
                                  <Pencil className="w-3 h-3" />
                                  {editingCardId === msg.id ? 'एडिट बंद करें' : 'विवरण बदलें'}
                                </button>
                                <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                                  #{msg.actionCard.data.invoiceNumber}
                                </span>
                              </div>
                            </div>

                            {/* Editable Inputs or Preview Grid */}
                            {editingCardId === msg.id && msg.actionCard.status !== 'executed' ? (
                              <div className="p-2.5 bg-indigo-50/50 dark:bg-slate-800 rounded-xl space-y-2 border border-indigo-200 dark:border-indigo-800 text-[11px]">
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">पार्टी / फर्म का नाम:</label>
                                  <input
                                    type="text"
                                    value={msg.actionCard.data.party?.businessName || msg.actionCard.data.party?.name || ''}
                                    onChange={(e) => handleBillFieldChange(msg.id, msg.actionCard!.data, 'partyName', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1 font-bold text-xs"
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">जिंस (Item):</label>
                                    <input
                                      type="text"
                                      value={msg.actionCard.data.items[0]?.name || ''}
                                      onChange={(e) => handleBillFieldChange(msg.id, msg.actionCard!.data, 'commodity', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">बोरी (Bags):</label>
                                    <input
                                      type="number"
                                      value={msg.actionCard.data.totalBags || 40}
                                      onChange={(e) => handleBillFieldChange(msg.id, msg.actionCard!.data, 'bags', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">भाव (₹/Kg):</label>
                                    <input
                                      type="number"
                                      value={msg.actionCard.data.items[0]?.rate || 215}
                                      onChange={(e) => handleBillFieldChange(msg.id, msg.actionCard!.data, 'rate', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">पार्टी (Buyer):</span>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {msg.actionCard.data.party?.businessName || msg.actionCard.data.party?.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">
                                    {msg.actionCard.data.items[0]?.name} • {msg.actionCard.data.totalBags} बोरी @ ₹{msg.actionCard.data.items[0]?.rate}/Kg
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 block text-[10px]">कुल रकम (Grand Total):</span>
                                  <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                                    {formatIndianCurrency(msg.actionCard.data.finalAmount)}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 pt-1">
                              {msg.actionCard.status === 'executed' ? (
                                <span className="w-full text-center py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center gap-1">
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

                        {/* 2. Create Sauda Slip Action Card */}
                        {msg.actionCard.type === 'create_sauda' && (
                          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                <ScrollText className="w-4 h-4" />
                                मंडी सौदा पर्चा (नीलामी यार्ड)
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingCardId(editingCardId === msg.id ? null : msg.id)}
                                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md"
                                >
                                  <Pencil className="w-3 h-3" />
                                  {editingCardId === msg.id ? 'एडिट बंद करें' : 'विवरण बदलें'}
                                </button>
                                <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                                  #{msg.actionCard.data.saudaNumber}
                                </span>
                              </div>
                            </div>

                            {/* Editable Inputs for Sauda Slip */}
                            {editingCardId === msg.id && msg.actionCard.status !== 'executed' ? (
                              <div className="p-2.5 bg-amber-50/50 dark:bg-slate-800 rounded-xl space-y-2 border border-amber-200 dark:border-amber-800 text-[11px]">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">किसान/विक्रेता नाम:</label>
                                    <input
                                      type="text"
                                      value={msg.actionCard.data.partyName || ''}
                                      onChange={(e) => handleSaudaFieldChange(msg.id, msg.actionCard!.data, 'partyName', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 font-bold text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">पिता का नाम (S/O):</label>
                                    <input
                                      type="text"
                                      value={msg.actionCard.data.sellerFatherName || ''}
                                      onChange={(e) => handleSaudaFieldChange(msg.id, msg.actionCard!.data, 'sellerFatherName', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">जिंस (Commodity):</label>
                                    <input
                                      type="text"
                                      value={msg.actionCard.data.commodity || ''}
                                      onChange={(e) => handleSaudaFieldChange(msg.id, msg.actionCard!.data, 'commodity', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">बोरी (Bags):</label>
                                    <input
                                      type="number"
                                      value={msg.actionCard.data.bags || 17}
                                      onChange={(e) => handleSaudaFieldChange(msg.id, msg.actionCard!.data, 'bags', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">भाव (₹/Qtl):</label>
                                    <input
                                      type="number"
                                      value={msg.actionCard.data.ratePerQuintal || 12050}
                                      onChange={(e) => handleSaudaFieldChange(msg.id, msg.actionCard!.data, 'ratePerQuintal', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">गांव / स्थान (Village):</label>
                                    <input
                                      type="text"
                                      value={msg.actionCard.data.village || ''}
                                      onChange={(e) => handleSaudaFieldChange(msg.id, msg.actionCard!.data, 'village', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">भुगतान माध्यम:</label>
                                    <select
                                      value={msg.actionCard.data.paymentMode || 'NEFT'}
                                      onChange={(e) => handleSaudaFieldChange(msg.id, msg.actionCard!.data, 'paymentMode', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold"
                                    >
                                      <option value="NEFT">NEFT (बैंक)</option>
                                      <option value="Cash">Cash (नकद)</option>
                                      <option value="RTGS">RTGS</option>
                                      <option value="UPI">UPI / PhonePe</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2 text-[11px] bg-amber-50/50 dark:bg-slate-800 p-2 rounded-lg">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">विक्रेता / किसान:</span>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {msg.actionCard.data.partyName} {msg.actionCard.data.sellerFatherName ? `S/O ${msg.actionCard.data.sellerFatherName}` : ''}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">
                                    {msg.actionCard.data.commodity} • {msg.actionCard.data.bags} बोरी @ ₹{msg.actionCard.data.ratePerQuintal}/Qtl
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 block text-[10px]">शुद्ध देय रकम:</span>
                                  <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                                    {formatIndianCurrency(msg.actionCard.data.netPayable)}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 pt-1">
                              {msg.actionCard.status === 'executed' ? (
                                <span className="w-full text-center py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  सौदा पर्चा दर्ज हो गया!
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => executeActionCard(msg.id, msg.actionCard!)}
                                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
                                >
                                  <ScrollText className="w-4 h-4" />
                                  📜 सौदा पर्चा रजिस्टर में दर्ज करें
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 3. Record Payment Action Card */}
                        {msg.actionCard.type === 'record_payment' && (
                          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4" />
                                {msg.actionCard.data.type === 'received' ? 'पेमेंट प्राप्ति (Payment Received)' : 'पेमेंट अदायगी (Payment Out)'}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingCardId(editingCardId === msg.id ? null : msg.id)}
                                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md"
                                >
                                  <Pencil className="w-3 h-3" />
                                  {editingCardId === msg.id ? 'एडिट बंद करें' : 'विवरण बदलें'}
                                </button>
                                <span className="font-mono font-bold text-xs bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300">
                                  {msg.actionCard.data.paymentMode}
                                </span>
                              </div>
                            </div>

                            {/* Editable Inputs for Payment */}
                            {editingCardId === msg.id && msg.actionCard.status !== 'executed' ? (
                              <div className="p-2.5 bg-emerald-50/50 dark:bg-slate-800 rounded-xl space-y-2 border border-emerald-200 dark:border-emerald-800 text-[11px]">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">पार्टी का नाम:</label>
                                    <input
                                      type="text"
                                      value={msg.actionCard.data.partyName || ''}
                                      onChange={(e) => handlePaymentFieldChange(msg.id, msg.actionCard!.data, 'partyName', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 font-bold text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">रकम (₹):</label>
                                    <input
                                      type="number"
                                      value={msg.actionCard.data.amount || 10000}
                                      onChange={(e) => handlePaymentFieldChange(msg.id, msg.actionCard!.data, 'amount', e.target.value)}
                                      className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">पार्टी:</span>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {msg.actionCard.data.partyName}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-400 block text-[10px]">रकम:</span>
                                  <span className="font-mono font-black text-emerald-600 text-sm">
                                    {formatIndianCurrency(msg.actionCard.data.amount)}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="pt-1">
                              {msg.actionCard.status === 'executed' ? (
                                <span className="w-full text-center py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  भुगतान दर्ज हो चुका है!
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => executeActionCard(msg.id, msg.actionCard!)}
                                  className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  ✅ पेमेंट व लेजर में दर्ज करें
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 4. Add Expense Action Card */}
                        {msg.actionCard.type === 'add_expense' && (
                          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                <Wallet className="w-4 h-4" />
                                {msg.actionCard.data.type === 'expense' ? 'दुकान खर्चा' : 'कैशबुक ट्रांसफर'}
                              </span>
                              <span className="font-mono font-bold text-xs text-rose-600">
                                {formatIndianCurrency(msg.actionCard.data.amount)}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              श्रेणी: <strong>{msg.actionCard.data.category}</strong>
                            </p>

                            <div className="pt-1">
                              {msg.actionCard.status === 'executed' ? (
                                <span className="w-full text-center py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  रोकड़ बही में खर्चा दर्ज हो गया!
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => executeActionCard(msg.id, msg.actionCard!)}
                                  className="w-full flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
                                >
                                  <Wallet className="w-4 h-4" />
                                  💸 रोकड़ बही में खर्चा जोड़ें
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 5. Add Party Action Card */}
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
                                  className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
                                >
                                  <UserPlus className="w-4 h-4" />
                                  ✅ पार्टी मास्टर में जोड़ें
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 6. Update Stock Action Card */}
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
                                  className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
                                >
                                  <Package className="w-4 h-4" />
                                  📦 स्टॉक अपडेट कन्फर्म करें
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 7. Navigation Action Card */}
                        {msg.actionCard.type === 'navigate' && (
                          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => executeActionCard(msg.id, msg.actionCard!)}
                              className="w-full flex items-center justify-between px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-lg transition"
                            >
                              <span className="flex items-center gap-1.5">
                                <Compass className="w-4 h-4" />
                                {msg.actionCard.data.label}
                              </span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* 8. Party Ledger Card */}
                        {msg.actionCard.type === 'party_ledger' && msg.actionCard.data.party && (
                          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">
                                {msg.actionCard.data.party.businessName}
                              </span>
                              <span className="font-mono font-black text-rose-600 text-xs">
                                बकाया: {formatIndianCurrency(msg.actionCard.data.totalDue)}
                              </span>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setInputText(`${msg.actionCard!.data.party.businessName} ko 40 bori musakadana ka bill banao`);
                                }}
                                className="flex-1 py-1.5 text-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] hover:bg-indigo-100"
                              >
                                🧾 नया बिल
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setInputText(`${msg.actionCard!.data.party.businessName} se ${msg.actionCard!.data.totalDue} cash mila payment`);
                                }}
                                className="flex-1 py-1.5 text-center rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-100"
                              >
                                💳 पेमेंट लें
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[9.5px] opacity-60">
                      {/* Voice Speaker button */}
                      <button
                        type="button"
                        onClick={() => speakText(msg.id, msg.text)}
                        className="hover:opacity-100 flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition cursor-pointer"
                        title="बोलकर सुनें (Voice Read)"
                      >
                        {speakingMsgId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                            <span>रोकें</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>सुनें</span>
                          </>
                        )}
                      </button>

                      <span className="font-mono">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Processing indicator */}
              {isProcessing && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                    <span>व्यापार डेटा प्रोसेस कर रहा हूँ...</span>
                  </div>
                </div>
              )}

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
                className={`p-3 rounded-2xl transition shadow-md flex items-center justify-center cursor-pointer ${
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
                placeholder={isListening ? 'सुन रहा हूँ, बोलिए...' : 'लिखें जैसे: "Kailash Sharma ko 30 bori gehu 2400 bhav bill", "Ramesh se 50000 mila"...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 focus:outline-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-3 rounded-2xl shadow-lg transition transform active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Optional Gemini API Key Setup Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                Google Gemini AI Key (वैकल्पिक)
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              MandAi का बिल्ट-इन ऑटोनॉमस एजेंट बिना किसी Key के 100% ऑफलाइन काम करता है। यदि आप Google Gemini 2.0 Flash का अतिरिक्त क्लाउड LLM पावर जोड़ना चाहते हैं, तो अपनी मुफ़्त API Key यहाँ दर्ज करें:
            </p>

            <div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 focus:outline-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                यह Key आपके डिवाइस के ब्राउज़र (localStorage) में सुरक्षित रहेगी।
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTempApiKey('');
                  localStorage.removeItem('mandai_gemini_api_key');
                  setGeminiApiKey('');
                  setShowKeyModal(false);
                }}
                className="px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
              >
                Key हटाएं
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                सेव करें
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
