
import React, { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import { Shield, Lock, Smartphone, Mail, ArrowRight, CheckCircle, AlertCircle, UserPlus, LogIn, ChevronLeft, UserX, Globe, User, ChevronDown } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthViewProps {
  onLoginSuccess: (userProfile: Partial<UserProfile>) => void;
}

const COUNTRY_CODES = [
    { code: 'SE', name: 'Sverige', dial: '+46', flag: '🇸🇪', len: 9 },
    { code: 'NO', name: 'Norge', dial: '+47', flag: '🇳🇴', len: 8 },
    { code: 'DK', name: 'Danmark', dial: '+45', flag: '🇩🇰', len: 8 },
    { code: 'FI', name: 'Finland', dial: '+358', flag: '🇫🇮', len: 9 },
    { code: 'GB', name: 'UK', dial: '+44', flag: '🇬🇧', len: 10 },
    { code: 'US', name: 'USA', dial: '+1', flag: '🇺🇸', len: 10 },
];

// Extend window for Google API
declare global {
    interface Window {
        google: any;
    }
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  // Animation State
  const [animState, setAnimState] = useState<'HIDDEN' | 'POP' | 'CORNER'>('HIDDEN');
  
  // View State
  const [viewStep, setViewStep] = useState<'LANDING' | 'FORM' | 'PHONE' | 'OTP'>('LANDING');
  const [isRegistering, setIsRegistering] = useState(false); 
  
  // Real Google Button Ref
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Temp user storage during flow
  const [tempUser, setTempUser] = useState<Partial<UserProfile> | null>(null);

  // Phone Data
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');

  // Trigger Animation on Mount
  useEffect(() => {
    const t1 = setTimeout(() => setAnimState('POP'), 100);
    const t2 = setTimeout(() => setAnimState('CORNER'), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Initialize Real Google Sign-In
  useEffect(() => {
    // Check if script is loaded
    if (window.google && viewStep === 'FORM') {
        try {
            window.google.accounts.id.initialize({
                // REPLACE THIS WITH YOUR REAL CLIENT ID FROM GOOGLE CLOUD CONSOLE
                client_id: "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com", 
                callback: handleGoogleCredentialResponse
            });
            
            if (googleBtnRef.current) {
                window.google.accounts.id.renderButton(
                    googleBtnRef.current,
                    { theme: "outline", size: "large", width: "100%", text: isRegistering ? "signup_with" : "signin_with" } 
                );
            }
        } catch (e) {
            console.error("Google Auth Error:", e);
        }
    }
  }, [viewStep, isRegistering]);

  // Decode JWT from Google
  const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
  };

  const handleGoogleCredentialResponse = (response: any) => {
      const data = parseJwt(response.credential);
      if (data) {
          // Extract Real Data
          const gProfile: Partial<UserProfile> = {
              name: `${data.given_name} ${data.family_name}`,
              email: data.email,
              isVerified: true, // Google accounts are verified
              avatarConfig: { 
                  // Use a hash of email to determine mock avatar traits if we can't use the URL directly yet
                  // Or we could pass the google picture URL if we supported external images
                  skinColor: 'f8d25c', hairColor: '4a3b32', hairStyle: 'shortHair', clothing: 'shirtCrewNeck', glasses: false
              }
          };

          setTempUser(gProfile);
          setViewStep('PHONE'); // Still require phone for safety in this app logic
      }
  };

  const handleStartLogin = () => {
    setIsRegistering(false);
    setViewStep('FORM');
    setError('');
  };

  const handleStartJoin = () => {
    setIsRegistering(true);
    setViewStep('FORM');
    setError('');
  };

  const handleSkipLogin = () => {
      onLoginSuccess({
          name: "Dev User",
          email: "dev@geosporty.se",
          isVerified: true
      });
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  // --- EMAIL FLOW ---
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vänligen fyll i e-post och lösenord');
      return;
    }

    if (isRegistering && (!firstName || !lastName)) {
        setError('Vänligen fyll i ditt för- och efternamn');
        return;
    }

    if (!validateEmail(email)) {
        setError('Vänligen ange en giltig e-postadress');
        return;
    }

    setLoading(true);
    
    // Simulate API call check
    setTimeout(() => {
        // If logging in, check if user exists in localstorage
        if (!isRegistering) {
            const savedUsers = JSON.parse(localStorage.getItem('geosporty_users') || '{}');
            const found = Object.values(savedUsers).find((u: any) => u.email === email && u.password === password);
            
            if (found) {
                setTempUser(found as UserProfile);
                setLoading(false);
                setViewStep('PHONE');
                return;
            } else {
                setLoading(false);
                setError('Felaktig e-post eller lösenord.');
                return;
            }
        }

        // Registration
        const newUser: Partial<UserProfile> = {
            name: `${firstName} ${lastName}`,
            email: email,
            isVerified: false
        };
        setTempUser(newUser);

        setLoading(false);
        setViewStep('PHONE');
    }, 1000);
  };

  // --- PHONE FLOW ---
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Remove non-digits
    let clean = phoneNumber.replace(/\D/g, '');
    
    // 2. Remove leading zero
    if (clean.startsWith('0')) clean = clean.substring(1);

    // 3. Length Check
    if (clean.length !== selectedCountry.len) {
        if (selectedCountry.code === 'SE') {
            setError(`Svenska mobilnummer ska ha ${selectedCountry.len} siffror efter riktnumret (t.ex. 70 123 45 67).`);
        } else {
             setError(`Fel längd för ${selectedCountry.name}.`);
        }
        return;
    }

    setPhoneNumber(clean);
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setError('');
      setViewStep('OTP');
    }, 1500);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') {
      setError('Felaktig kod. (Tips: 123456)');
      return;
    }
    setLoading(true);
    
    setTimeout(() => {
      // Save user to "DB" (Local Storage)
      if (tempUser && tempUser.email) {
          const dbKey = isRegistering ? tempUser.email : (tempUser.email || 'unknown');
          const savedUsers = JSON.parse(localStorage.getItem('geosporty_users') || '{}');
          
          // If registering, save password (unsafe in real app, ok for demo)
          if (isRegistering) {
              savedUsers[dbKey] = { ...tempUser, password, phone: phoneNumber };
          } else {
              // Update existing
              savedUsers[dbKey] = { ...savedUsers[dbKey], phone: phoneNumber };
          }
          
          localStorage.setItem('geosporty_users', JSON.stringify(savedUsers));
      }

      setLoading(false);
      if (tempUser) {
          onLoginSuccess(tempUser);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* --- DEV SKIP BUTTON --- */}
      <button
        onClick={handleSkipLogin}
        className="fixed top-4 right-4 z-[100] bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow-xl backdrop-blur-sm transition-all transform hover:scale-105 active:scale-95 text-xs flex items-center gap-2"
        title="Bypass login flow for testing"
      >
         <UserX size={14} /> SKIP LOGIN (DEV)
      </button>

      {/* --- Animated Logo --- */}
      <div 
        className={`fixed z-50 transition-all duration-[1000ms] cubic-bezier(0.68, -0.55, 0.27, 1.55)
          ${animState === 'HIDDEN' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 opacity-0' : ''}
          ${animState === 'POP' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[3.0] opacity-100' : ''}
          ${animState === 'CORNER' ? 'top-6 left-6 translate-x-0 translate-y-0 scale-100 opacity-100' : ''}
        `}
      >
        <Logo className="w-12 h-12 md:w-14 md:h-14 shadow-xl rounded-full bg-white" />
      </div>

      {/* --- MAIN CARD --- */}
      <div 
        className={`max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-1000 delay-500
          ${animState === 'CORNER' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/20 to-blue-50 -z-0" />

        <div className="p-8 relative z-10">
          
          <div className="h-8 mb-4 flex items-center">
             {viewStep !== 'LANDING' && (
                 <button 
                    onClick={() => {
                        if(viewStep === 'OTP') setViewStep('PHONE');
                        else if(viewStep === 'PHONE') setViewStep('FORM');
                        else setViewStep('LANDING');
                        setError('');
                    }} 
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-bold transition-colors"
                >
                     <ChevronLeft size={18} /> Tillbaka
                 </button>
             )}
          </div>

          <div className="flex flex-col items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">GeoSporty</h1>
            <p className="text-gray-500 font-medium">Din aktivitet, din gemenskap.</p>
          </div>

          {viewStep === 'LANDING' && (
             <div className="space-y-4 animate-fade-in pt-4">
                <button 
                    onClick={handleStartJoin}
                    className="w-full bg-primary hover:bg-sky-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <UserPlus size={24} />
                    Gå med nu
                </button>
                
                <button 
                    onClick={handleStartLogin}
                    className="w-full bg-white border-2 border-gray-100 hover:border-gray-300 text-gray-700 py-4 rounded-2xl font-bold text-lg transition-all hover:bg-gray-50 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <LogIn size={24} />
                    Logga in
                </button>

                <div className="pt-4 flex justify-center">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                        <Shield size={12} />
                        <span>Trygg & Verifierad Community</span>
                    </div>
                </div>
             </div>
          )}

          {viewStep === 'FORM' && (
            <div className="space-y-6 animate-slide-left">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-gray-800">{isRegistering ? 'Skapa konto' : 'Välkommen tillbaka'}</h2>
              </div>

              {/* REAL GOOGLE BUTTON CONTAINER */}
              <div ref={googleBtnRef} className="h-[44px] w-full flex justify-center"></div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500 font-medium">Eller med e-post</span>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                
                {/* FIRST NAME & LAST NAME (Registration Only) */}
                {isRegistering && (
                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">Förnamn</label>
                            <input 
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Anna"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block">Efternamn</label>
                            <input 
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Andersson"
                                className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                    </div>
                )}

                <div>
                   <label className="text-xs font-bold text-gray-600 mb-1 block">E-post</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="namn@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-600 mb-1 block">Lösenord</label>
                   <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                   </div>
                </div>
                
                {error && <p className="text-red-500 text-sm font-medium flex items-center gap-1 animate-pulse"><AlertCircle size={14}/> {error}</p>}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-md active:scale-[0.98]"
                >
                  {loading ? 'Bearbetar...' : (isRegistering ? 'Gå vidare' : 'Logga in')}
                </button>
              </form>
            </div>
          )}

          {viewStep === 'PHONE' && (
             <div className="space-y-6 animate-slide-left">
                <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Smartphone size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Säkerhetskontroll</h2>
                    <p className="text-sm text-gray-500">Vi använder 2-faktor verifiering för att stoppa bottar.</p>
                    {/* Show extracted user info */}
                    {tempUser && (
                        <p className="text-xs font-bold text-primary mt-2">Hej, {tempUser.name}!</p>
                    )}
                </div>

                <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Land</label>
                        <div className="relative group">
                            <select 
                                value={selectedCountry.code}
                                onChange={(e) => {
                                    const c = COUNTRY_CODES.find(c => c.code === e.target.value);
                                    if(c) setSelectedCountry(c);
                                }}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-white cursor-pointer"
                            >
                                {COUNTRY_CODES.map(c => (
                                    <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.dial})</option>
                                ))}
                            </select>
                            <Globe size={18} className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
                            <ChevronDown size={16} className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">Mobilnummer</label>
                        <div className="flex gap-2">
                             <div className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-3 font-bold text-gray-600 flex items-center min-w-[60px] justify-center">
                                 {selectedCountry.dial}
                             </div>
                             <input 
                                type="tel" 
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder={selectedCountry.code === 'SE' ? "70 123 45 67" : "123 456 789"}
                                className="flex-grow px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg tracking-wide font-medium"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg flex gap-2"><AlertCircle size={16} className="flex-shrink-0 mt-0.5"/> {error}</p>}

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-sky-600 transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                        {loading ? 'Skickar...' : <>Skicka SMS-kod <ArrowRight size={18}/></>}
                    </button>
                </form>
             </div>
          )}

          {viewStep === 'OTP' && (
              <div className="space-y-6 animate-slide-left">
                 <div className="text-center">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Ange Kod</h2>
                    <p className="text-sm text-gray-500">Vi har skickat en kod till <b>{selectedCountry.dial} {phoneNumber}</b>.</p>
                 </div>

                 <form onSubmit={handleVerifyCode} className="space-y-6">
                    <div>
                        <input 
                            type="text" 
                            value={otp}
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="000 000"
                            className="w-full px-4 py-4 text-center text-3xl tracking-[0.5em] font-bold rounded-xl border border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                        {loading ? 'Verifierar...' : <>Verifiera <CheckCircle size={18}/></>}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => setViewStep('PHONE')}
                        className="w-full text-gray-500 text-sm font-medium hover:text-gray-800"
                    >
                        Ändra nummer
                    </button>
                 </form>
              </div>
          )}

        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-[10px] text-gray-400">© 2024 GeoSporty AB. Genom att fortsätta godkänner du våra villkor.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
