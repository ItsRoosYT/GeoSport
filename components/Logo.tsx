import React from 'react';

export const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`${className} relative flex-shrink-0`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="circleClip">
            <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      
      <g clipPath="url(#circleClip)">
        {/* Sky Background */}
        <rect x="0" y="0" width="100" height="100" fill="#0284c7" />
        
        {/* Clouds */}
        <path d="M10 35 Q 25 25 40 35 T 70 35 T 100 30" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.6" fill="none" />
        
        {/* Green Hills (Darker and Lighter) */}
        <path d="M-10 60 Q 30 50 110 65 V 110 H -10 Z" fill="#84cc16" /> 
        <path d="M-10 75 Q 50 65 110 80 V 110 H -10 Z" fill="#4d7c0f" />
        
        {/* Path/Road */}
        <path d="M40 110 Q 50 80 45 70" stroke="#0ea5e9" strokeWidth="8" fill="none" opacity="0.5" />

        {/* --- Elements from Reference --- */}

        {/* 1. Large Red Pin (Top Center) */}
        <path d="M50 15 C 36 15 36 35 50 52 C 64 35 64 15 50 15 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
        <circle cx="50" cy="28" r="7" fill="white" />

        {/* 2. Orange/Yellow Map Marker (Right Side) */}
        <path d="M80 35 C 74 35 74 45 80 55 C 86 45 86 35 80 35 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
        <circle cx="80" cy="42" r="3" fill="white" />

        {/* 3. Red Flag (Left Side) */}
        <path d="M20 40 L 20 70" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 40 L 38 48 L 20 56 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />

        {/* 4. Soccer Ball (Center Bottom) */}
        <g transform="translate(50, 75) scale(1.2)">
            <circle r="14" fill="white" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M0 -14 V -8 L 5 -5 L 0 4 L -5 -5 L 0 -8" fill="#1e293b" />
            <path d="M-12 -5 L -7 -3 M 12 -5 L 7 -3 M -10 9 L -5 4 M 10 9 L 5 4" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </g>
      
      {/* Circle Border Ring */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeWidth="3" opacity="0.9" />
    </svg>
  </div>
);

export default Logo;