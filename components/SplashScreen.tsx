import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [animState, setAnimState] = useState<'HIDDEN' | 'POP' | 'CORNER'>('HIDDEN');

  useEffect(() => {
    const t1 = setTimeout(() => setAnimState('POP'), 100);
    const t2 = setTimeout(() => setAnimState('CORNER'), 1800);
    const t3 = setTimeout(() => onComplete(), 2500);
    return () => { 
      clearTimeout(t1); 
      clearTimeout(t2); 
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center pointer-events-none">
      {/* Animated Logo */}
      <div 
        className={`transition-all duration-[1000ms] cubic-bezier(0.68, -0.55, 0.27, 1.55)
          ${animState === 'HIDDEN' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 opacity-0' : ''}
          ${animState === 'POP' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[3.0] opacity-100' : ''}
          ${animState === 'CORNER' ? 'top-6 left-6 translate-x-0 translate-y-0 scale-100 opacity-100' : ''}
          fixed
        `}
      >
        <Logo className="w-12 h-12 md:w-14 md:h-14 shadow-xl rounded-full bg-white" />
      </div>

      {/* Title appears after corner animation */}
      {animState === 'CORNER' && (
        <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight animate-fade-in">
            GeoSporty
          </h1>
          <p className="text-gray-500 font-medium mt-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
            Din aktivitet, din gemenskap.
          </p>
        </div>
      )}
    </div>
  );
};
