
import React from 'react';
import { AvatarConfig } from '../types';

interface AvatarProps {
  id: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  alt?: string;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  config?: AvatarConfig;
}

const Avatar: React.FC<AvatarProps> = ({ id, size = 'md', alt, className = '', onClick, selected, config }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
    '3xl': 'w-48 h-48'
  };

  // Safe ID fallback
  const safeId = Math.max(1, Math.min(24, id || 1));

  // Background colors
  const bgColors = [
    'bg-blue-100', 'bg-orange-100', 'bg-green-100', 'bg-purple-100', 
    'bg-yellow-100', 'bg-red-100', 'bg-teal-100', 'bg-indigo-100'
  ];
  const bgColor = bgColors[(safeId - 1) % bgColors.length];

  let url = '';
  
  // Base params for NEUTRAL EXPRESSION
  const neutralParams = {
      mouth: 'default',
      eyes: 'default',
      eyebrow: 'default',
      accessoriesProbability: '0' // Default to 0, override if glasses are true
  };
  
  if (config) {
      // Dynamic generation based on config
      const params = new URLSearchParams({
          seed: `geo-${id}-${config.hairStyle}`, // Unique seed to ensure consistency
          backgroundColor: 'transparent',
          skinColor: config.skinColor || 'f8d25c',
          hairColor: config.hairColor || '4a3b32',
          top: config.hairStyle || 'shortHair',
          clothing: config.clothing || 'shirtCrewNeck',
          accessories: config.glasses ? 'prescription02' : 'none',
          accessoriesProbability: config.glasses ? '100' : '0',
          ...neutralParams // Force neutral expression
      });
      // Use DiceBear v9 for better stability
      url = `https://api.dicebear.com/9.x/avataaars/svg?${params.toString()}`;
  } else {
      // Fallback generation (still neutral)
      const params = new URLSearchParams({
          seed: `geo-${safeId}`,
          backgroundColor: 'transparent',
          ...neutralParams
      });
      url = `https://api.dicebear.com/9.x/avataaars/svg?${params.toString()}`;
  }

  return (
    <div 
      onClick={onClick}
      className={`
        ${sizeClasses[size]} 
        ${bgColor} 
        rounded-full 
        flex-shrink-0
        flex items-center justify-center 
        overflow-hidden 
        border-2 
        ${selected ? 'border-primary ring-4 ring-primary/20' : 'border-white'} 
        shadow-sm 
        transition-all
        ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        ${className}
      `}
      aria-label={alt || `Avatar ${safeId}`}
    >
      <img 
        src={url}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover transform scale-125 translate-y-2" 
        onError={(e) => {
            // Hide if fail, keeping background color
            (e.target as HTMLImageElement).style.opacity = '0';
        }}
      />
    </div>
  );
};

export default Avatar;
