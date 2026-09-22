import React from 'react';

interface DiaVetLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  className?: string;
  isRtl?: boolean;
  variant?: 'visitor' | 'developer';
}

export default function DiaVetLogo({
  size = 'md',
  showText = false,
  className = '',
  isRtl = false,
  variant = 'visitor'
}: DiaVetLogoProps) {
  // Dimension mapping
  let iconSize = 42;
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
      {variant === 'developer' ? (
        /* ================= DEVELOPER EMBLEM (Cyber Stethoscope + Code < / > + Glow) ================= */
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-lg hover:scale-105 transition-transform duration-300"
        >
          <defs>
            <linearGradient id="devBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>

            <linearGradient id="devCyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <filter id="devGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Hexagonal Tech Shield Background */}
          <path
            d="M 100 15 L 175 55 L 175 145 L 100 185 L 25 145 L 25 55 Z"
            fill="url(#devBgGrad)"
            stroke="#38bdf8"
            strokeWidth="4"
            filter="url(#devGlowFilter)"
          />

          {/* Inner Hexagon Outline */}
          <path
            d="M 100 28 L 163 63 L 163 137 L 100 172 L 37 137 L 37 63 Z"
            fill="#030712"
            opacity="0.85"
          />

          {/* Stethoscope Loops */}
          <path
            d="M 65 65 C 65 110, 135 110, 135 65"
            fill="none"
            stroke="url(#devCyanGlow)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          <path
            d="M 100 100 L 100 130"
            stroke="url(#devCyanGlow)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Sensor Disc */}
          <circle cx="100" cy="142" r="14" fill="#38bdf8" filter="url(#devGlowFilter)" />
          <circle cx="100" cy="142" r="7" fill="#030712" />

          {/* Code Symbol < / > inside Stethoscope */}
          <path
            d="M 78 82 L 68 90 L 78 98"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 96 102 L 104 78"
            stroke="#f43f5e"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 122 82 L 132 90 L 122 98"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        /* ================= VISITOR EMBLEM (Official DiaVet Classic Emblem) ================= */
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-md hover:scale-105 transition-transform duration-300"
        >
          <defs>
            <linearGradient id="dvBlueD" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#0066ff" />
              <stop offset="40%" stopColor="#0099ff" />
              <stop offset="75%" stopColor="#00d2ff" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <linearGradient id="dvNavyAnimals" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0a2558" />
              <stop offset="45%" stopColor="#0f3b82" />
              <stop offset="85%" stopColor="#1e5cb3" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="dvCyanCross" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d2ff" />
              <stop offset="100%" stopColor="#00f0ff" />
            </linearGradient>

            <filter id="dvDropGlow" x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0066ff" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Outer stylized glossy 'D' Shape */}
          <path
            d="M 40 20 L 115 20 C 160 20, 190 55, 190 100 C 190 145, 160 180, 115 180 L 40 180 Z"
            fill="url(#dvBlueD)"
            filter="url(#dvDropGlow)"
          />

          {/* Inner Cutout */}
          <path
            d="M 75 48 L 108 48 C 138 48, 158 72, 158 100 C 158 128, 138 152, 108 152 L 75 152 Z"
            fill="#061226"
          />

          {/* Dog & Cat Silhouettes */}
          <path
            d="M 40 20 L 40 120 C 45 105, 60 95, 78 85 C 92 78, 98 70, 96 58 C 104 60, 115 62, 122 55 C 125 52, 126 46, 120 44 C 114 42, 105 45, 96 36 C 90 28, 75 20, 40 20 Z"
            fill="url(#dvNavyAnimals)"
          />

          <path
            d="M 72 38 C 65 48, 62 70, 72 82 C 80 75, 86 65, 84 52 C 82 42, 78 38, 72 38 Z"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          <path
            d="M 40 120 C 40 155, 55 180, 80 180 C 88 172, 95 162, 94 150 C 94 140, 102 135, 114 134 C 120 133, 122 128, 118 125 C 112 122, 102 124, 98 116 C 95 108, 98 96, 94 92 C 90 88, 80 102, 70 108 C 55 116, 45 118, 40 120 Z"
            fill="url(#dvNavyAnimals)"
          />

          <path
            d="M 94 92 L 102 116"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d="M 40 115 C 65 105, 88 120, 112 138 C 135 156, 160 145, 178 120"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Medical Cyan Cross */}
          <g transform="translate(132, 78)">
            <rect x="9" y="0" width="12" height="32" rx="5" fill="url(#dvCyanCross)" filter="url(#dvDropGlow)" />
            <rect x="0" y="9" width="30" height="12" rx="5" fill="url(#dvCyanCross)" filter="url(#dvDropGlow)" />
          </g>

          <path
            d="M 90 174 C 130 174, 175 148, 182 108 C 184 125, 170 162, 128 174 Z"
            fill="#ffffff"
            opacity="0.45"
          />
        </svg>
      )}

      {/* Typographic Wordmark */}
      {showText && (
        <div className={`flex items-baseline font-black tracking-tight ${textClass}`}>
          <span className="text-[#0066ff] dark:text-[#38bdf8] font-black">
            Dia
          </span>
          <span className="text-cyan-500 dark:text-cyan-300 font-extrabold ml-0.5">
            Vet
          </span>
          <span className={`text-[10px] ml-1.5 px-1.5 py-0.5 rounded-full font-bold uppercase border ${
            variant === 'developer'
              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20'
          }`}>
            {variant === 'developer' ? 'DEV PRO' : 'DZ'}
          </span>
        </div>
      )}
    </div>
  );
}
