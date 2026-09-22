'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { MandAiLogo } from '@/components/common/MandAiLogo';
import { 
  Lock, 
  User, 
  Building2, 
  Phone, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Receipt, 
  ShieldCheck, 
  Zap,
  CreditCard
} from 'lucide-react';

import { saveRegisteredUser, setActiveSessionUserId } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, login, loginAsDemo, signup, isHydrated, rehydrate } = useAppStore();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Login Form State
  const [loginUsername, setLoginUsername] = useState<string>('demo');
  const [loginPassword, setLoginPassword] = useState<string>('demo');

  // Sign Up Form State
  const [fullName, setFullName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  
  // Company Form State
  const [companyName, setCompanyName] = useState<string>('');
  const [mandiLicense, setMandiLicense] = useState<string>('');
  const [city, setCity] = useState<string>('Neemuch');
  const [state, setState] = useState<string>('Madhya Pradesh');
  const [gstin, setGstin] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifsc, setIfsc] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');

  // If already logged in, redirect to home
  useEffect(() => {
    if (isHydrated && currentUser) {
      router.push('/');
    }
  }, [isHydrated, currentUser, router]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginUsername.trim()) {
      setErrorMsg('कृपया यूज़रनेम दर्ज करें।');
      return;
    }

    const res = login(loginUsername.trim(), loginPassword.trim());
    if (res.success) {
      setSuccessMsg('लॉगिन सफल! डैशबोर्ड खुल रहा है...');
      setTimeout(() => {
        router.push('/');
      }, 300);
    } else {
      // Check Neon Cloud Database (for login on a new device or cleared cache)
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username: loginUsername.trim(), password: loginPassword.trim() }),
      })
      .then((r) => r.json())
      .then((cloudRes) => {
        if (cloudRes.success && cloudRes.user) {
          saveRegisteredUser(cloudRes.user);
          setActiveSessionUserId(cloudRes.user.id);
          localStorage.removeItem('mandai_explicit_logout');
          rehydrate();
          setSuccessMsg('क्लाउड लॉगिन सफल! डैशबोर्ड खुल रहा है...');
          setTimeout(() => {
            router.push('/');
          }, 300);
        } else {
          setErrorMsg(cloudRes.error || res.error || 'लॉगिन विफल रहा। कृपया सही क्रेडेंशियल दर्ज करें।');
        }
      })
      .catch(() => {
        setErrorMsg(res.error || 'लॉगिन विफल रहा। कृपया सही क्रेडेंशियल दर्ज करें।');
      });
    }
  };

  const handleDemoClick = () => {
    setErrorMsg('');
    setSuccessMsg('डेमो अकाउंट एक्टिवेट हो रहा है...');
    loginAsDemo();
    setTimeout(() => {
      router.push('/');
    }, 300);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regUsername.trim()) {
      setErrorMsg('कृपया लॉगिन यूज़रनेम भरें।');
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg('कृपया अपनी फर्म / कंपनी का नाम भरें।');
      return;
    }

    const res = signup(
      {
        username: regUsername.trim(),
        password: regPassword.trim(),
        name: fullName.trim() || 'व्यापारी',
        phone: regPhone.trim(),
      },
      {
        name: companyName.trim(),
        ownerName: fullName.trim() || 'व्यापारी',
        phone: regPhone.trim(),
        mandiLicenseNo: mandiLicense.trim(),
        city: city.trim() || 'नीमच',
        state: state.trim() || 'Madhya Pradesh',
        gstin: gstin.trim(),
        bankDetails: {
          bankName: bankName.trim(),
          accountName: companyName.trim(),
          accountNumber: accountNumber.trim(),
          ifsc: ifsc.trim().toUpperCase(),
          branch: city.trim(),
          upiId: upiId.trim(),
        },
      }
    );

    if (res.success) {
      setSuccessMsg('खाता सफलतापूर्वक बन गया! आपका क्लीन डैशबोर्ड खुल रहा है...');
      setTimeout(() => {
        router.push('/');
      }, 400);
    } else {
      setErrorMsg(res.error || 'रजिस्ट्रेशन विफल रहा।');
    }
  };

  return (
    <div className="min-h-full w-full bg-slate-950 text-slate-100 flex flex-col justify-start sm:justify-center items-center p-4 sm:p-6 py-10 sm:py-16 select-none relative">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header / Brand */}
      <div className="flex flex-col items-center mb-6 text-center z-10">
        <div className="flex items-center gap-3 mb-2">
          <MandAiLogo size={42} animated />
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mand<span className="text-indigo-400">Ai</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md">
          कृषि उपज मंडी, व्यापारी भुगतान पत्रक, GST इनवॉइस व रोकड़ बही सिस्टम
        </p>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl z-10">
        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            लॉगिन (Log In)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'signup'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            नया खाता बनाएं (Sign Up)
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-950/70 border border-emerald-800 text-emerald-200 rounded-xl text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {activeTab === 'login' && (
          <div className="space-y-5">
            {/* Quick Demo Button Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-amber-900/30 to-amber-950/50 border border-amber-800/60 text-amber-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    डेमो अकाउंट (बिना पासवर्ड तुरंत देखें)
                  </div>
                  <p className="text-[11px] text-amber-200/80 mt-1">
                    सॉफ्टवेयर समझने के लिए प्री-लोडेड सैंपल डेटा (बिल्स, पार्टियां, सौदा पर्चा) के साथ चलाएं।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDemoClick}
                  className="shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow-lg flex items-center gap-1.5 transform active:scale-95"
                >
                  डेमो चलाएं <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-slate-500 text-[11px] font-semibold uppercase">या अपने अकाउंट से लॉगिन करें</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  यूज़रनेम / लॉगिन आईडी (Username)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="उदा. demo या आपका यूज़रनेम"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  पासवर्ड (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="पासवर्ड दर्ज करें (डेमो: demo)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                लॉगिन करें (Log In)
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: SIGN UP WITH COMPANY ONBOARDING */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-5">
            <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl text-[11px] text-indigo-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>100% साफ़ नया खाता:</strong> आपके नए अकाउंट में कोई भी फ़ेक/डमी एंट्री नहीं होगी। सिर्फ़ आपकी असली कंपनी का डेटा रहेगा।
              </span>
            </div>

            {/* Section 1: User Credentials */}
            <div>
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> 1. आपकी लॉगिन जानकारी
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    आपका नाम (Owner Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="उदा. अर्जुन राठौड़"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    यूज़रनेम (Login Username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="उदा. arjun_mandi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    पासवर्ड (Password) *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="गुप्त पासवर्ड बनाएं"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    मोबाइल नंबर (Phone)
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="उदा. 98260XXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Company / Mandi Business Details */}
            <div className="pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> 2. फर्म / मंडी व्यापार विवरण (Company Info)
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    फर्म / दुकान / कंपनी का नाम *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="उदा. श्री राम कृषि ट्रेडिंग कंपनी"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      मंडी / शहर (City/Mandi)
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="उदा. नीमच (Neemuch)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      मंडी लाइसेंस नं. (License No.)
                    </label>
                    <input
                      type="text"
                      value={mandiLicense}
                      onChange={(e) => setMandiLicense(e.target.value)}
                      placeholder="उदा. A-124 / 2024"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    GSTIN नंबर (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="उदा. 23XXXXX0000X1Z5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 uppercase font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Optional Bank Details */}
            <div className="pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> 3. बैंक खाता विवरण (बिल पर छपने के लिए - वैकल्पिक)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    बैंक का नाम
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="उदा. HDFC Bank, SBI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    खाता संख्या (A/C No.)
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="उदा. 502000XXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    IFSC कोड
                  </label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="उदा. HDFC0000624"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    UPI ID (QR कोड के लिए)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="उदा. 98260XXXXX@ybl"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              खाता बनाएं और व्यापार शुरू करें (Register & Start)
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-slate-500">
        MandAi Multi-Tenant Cloud & Offline Storage • Mandi Vyapar OS
      </div>
    </div>
  );
}
