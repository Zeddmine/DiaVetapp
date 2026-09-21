import React from 'react';

interface DiaVetLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  className?: string;
  isRtl?: boolean;
}

export default function DiaVetLogo({
  size = 'md',
  showText = false,
  className = '',
  isRtl = false
}: DiaVetLogoProps) {
  // Dimension mapping
  let iconSize = 40;
  let textClass = 'text-xl';
  let gapClass = 'gap-2.5';

  if (typeof size === 'number') {
    iconSize = size;
  } else {
    switch (size) {
      case 'xs':
        iconSize = 24;
        textClass = 'text-sm';
        gapClass = 'gap-1.5';
        break;
      case 'sm':
        iconSize = 32;
        textClass = 'text-base';
        gapClass = 'gap-2';
        break;
      case 'md':
        iconSize = 42;
        textClass = 'text-xl';
        gapClass = 'gap-2.5';
        break;
      case 'lg':
        iconSize = 64;
        textClass = 'text-2xl sm:text-3xl';
        gapClass = 'gap-3';
        break;
      case 'xl':
        iconSize = 96;
        textClass = 'text-4xl sm:text-5xl';
        gapClass = 'gap-4';
        break;
    }
  }

  return (
    <div className={`inline-flex items-center select-none ${gapClass} ${className} ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Official DiaVet Vector Emblem */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
      >
        <defs>
          {/* Main Outer D Blue Gradient */}
          <linearGradient id="dvBlueD" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#0066ff" />
            <stop offset="40%" stopColor="#0099ff" />
            <stop offset="75%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Deep Silhouette Navy Gradient */}
          <linearGradient id="dvNavyAnimals" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a2558" />
            <stop offset="45%" stopColor="#0f3b82" />
            <stop offset="85%" stopColor="#1e5cb3" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Glossy Top Highlight */}
          <linearGradient id="dvHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Medical Cross Cyan Gradient */}
          <linearGradient id="dvCyanCross" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#00f0ff" />
          </linearGradient>

          {/* Subtle 3D shadow filter */}
          <filter id="dvDropGlow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0066ff" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Outer stylized glossy 'D' Shape */}
        <path
          d="M 40 20 
             L 115 20 
             C 160 20, 190 55, 190 100 
             C 190 145, 160 180, 115 180 
             L 40 180 
             Z"
          fill="url(#dvBlueD)"
          filter="url(#dvDropGlow)"
        />

        {/* Inner Cutout / Negative Loop of the D */}
        <path
          d="M 75 48 
             L 108 48 
             C 138 48, 158 72, 158 100 
             C 158 128, 138 152, 108 152 
             L 75 152 
             Z"
          fill="#061226"
        />

        {/* DOG & CAT PROFILE SILHOUETTES INSIDE LEFT CURVE */}
        {/* Dog Head Profile (Top Silhouette) */}
        <path
          d="M 40 20 
             L 40 120 
             C 45 105, 60 95, 78 85 
             C 92 78, 98 70, 96 58 
             C 104 60, 115 62, 122 55 
             C 125 52, 126 46, 120 44 
             C 114 42, 105 45, 96 36 
             C 90 28, 75 20, 40 20 Z"
          fill="url(#dvNavyAnimals)"
        />

        {/* Dog Ear Contour Overlay */}
        <path
          d="M 72 38 
             C 65 48, 62 70, 72 82 
             C 80 75, 86 65, 84 52 
             C 82 42, 78 38, 72 38 Z"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Cat Head Profile (Bottom Silhouette) */}
        <path
          d="M 40 120 
             C 40 155, 55 180, 80 180 
             C 88 172, 95 162, 94 150 
             C 94 140, 102 135, 114 134 
             C 120 133, 122 128, 118 125 
             C 112 122, 102 124, 98 116 
             C 95 108, 98 96, 94 92 
             C 90 88, 80 102, 70 108 
             C 55 116, 45 118, 40 120 Z"
          fill="url(#dvNavyAnimals)"
        />

        {/* Cat Pointed Ear Highlight */}
        <path
          d="M 94 92 L 102 116"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Dynamic Curved Swoosh separating Cat & Dog */}
        <path
          d="M 40 115 
             C 65 105, 88 120, 112 138 
             C 135 156, 160 145, 178 120"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* MEDICAL PLUS CROSS (+) (In vibrant Cyan) */}
        <g transform="translate(132, 78)">
          {/* Vertical Bar */}
          <rect
            x="9"
            y="0"
            width="12"
            height="32"
            rx="5"
            fill="url(#dvCyanCross)"
            filter="url(#dvDropGlow)"
          />
          {/* Horizontal Bar */}
          <rect
            x="0"
            y="9"
            width="30"
            height="12"
            rx="5"
            fill="url(#dvCyanCross)"
            filter="url(#dvDropGlow)"
          />
        </g>

        {/* Bottom Curve Glossy Reflection Arc */}
        <path
          d="M 90 174 
             C 130 174, 175 148, 182 108 
             C 184 125, 170 162, 128 174 Z"
          fill="#ffffff"
          opacity="0.45"
        />
      </svg>

      {/* Optional DiaVet Typographic Wordmark */}
      {showText && (
        <div className={`flex items-baseline font-black tracking-tight ${textClass}`}>
          <span className="text-[#1e40af] dark:text-[#38bdf8] font-black">Dia</span>
          <span className="text-cyan-500 dark:text-cyan-300 font-extrabold ml-0.5">Vet</span>
        </div>
      )}
    </div>
  );
}
