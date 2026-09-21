import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Stethoscope, Star } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface DiaVetCatMascotProps {
  speechText?: string;
  isHappy?: boolean;
  onCatClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  isRtl?: boolean;
}

export default function DiaVetCatMascot({
  speechText,
  isHappy = true,
  onCatClick,
  size = 'md',
  isRtl = false
}: DiaVetCatMascotProps) {
  const [isPurring, setIsPurring] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  const handleMeow = () => {
    setIsPurring(true);
    soundEngine.playCatMeow();
    if (onCatClick) onCatClick();
    setTimeout(() => setIsPurring(false), 1200);
  };

  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.2 : 1;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* Speech Bubble from Cat */}
      {speechText && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative max-w-sm sm:max-w-md p-3.5 sm:p-4 mb-4 rounded-3xl bg-gradient-to-r from-cyan-950/90 via-slate-900/90 to-blue-950/90 border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/20 backdrop-blur-md"
        >
          <div className="flex items-start gap-2.5">
            <span className="text-xl shrink-0">🐾</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                  {isRtl ? "مياو ! دكتور قط DiaVet 🐱🩺" : "Dr. Chaton DiaVet 🐱🩺"}
                </span>
                <span className="text-[10px] bg-cyan-400/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded-full border border-cyan-400/30">
                  {isRtl ? "المساعد الطبي" : "Mascotte Officielle"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                {speechText}
              </p>
            </div>
          </div>

          {/* Speech Bubble Arrow Triangle */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-b-2 border-r-2 border-cyan-400/50 rotate-45" />
        </motion.div>
      )}

      {/* Interactive Mascot Cat Visual */}
      <motion.div
        onClick={handleMeow}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative cursor-pointer group"
        style={{ transform: `scale(${scale})` }}
        title="Clique-moi pour miauler ! 🐾"
      >
        {/* Ambient Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 via-cyan-400/20 to-blue-500/20 rounded-full blur-xl group-hover:opacity-100 opacity-60 transition-opacity pointer-events-none" />

        {/* Floating Heart when Purring */}
        {isPurring && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -45, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-rose-400 font-black flex items-center gap-1 z-30"
          >
            <Heart className="w-5 h-5 fill-rose-500 text-rose-400 animate-ping" />
            <span className="text-xs font-bold text-rose-300">Miaou ! ❤️</span>
          </motion.div>
        )}

        {/* SVG Cat Character Illustration */}
        <svg width="150" height="150" viewBox="0 0 160 160" className="relative z-10 drop-shadow-2xl">
          <defs>
            <linearGradient id="catFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="catEarInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <linearGradient id="catCoat" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="catEye" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Cat Tail Wagging */}
          <motion.path
            d="M 115 130 Q 145 110 135 85 Q 128 75 132 65"
            fill="none"
            stroke="url(#catFur)"
            strokeWidth="10"
            strokeLinecap="round"
            animate={{ rotate: [0, 8, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            style={{ transformOrigin: "115px 130px" }}
          />

          {/* Cat Body & Doctor Coat */}
          <ellipse cx="80" cy="120" rx="38" ry="32" fill="url(#catCoat)" stroke="#cbd5e1" strokeWidth="2" />
          
          {/* Coat Collar V-neck */}
          <path d="M 68 98 L 80 116 L 92 98 Z" fill="#0284c7" />

          {/* Mini Algerian Flag Pin on Coat 🇩🇿 */}
          <rect x="62" y="112" width="10" height="7" rx="1.5" fill="#16a34a" />
          <rect x="67" y="112" width="5" height="7" rx="1" fill="#ffffff" />
          <circle cx="67" cy="115.5" r="1.5" fill="#dc2626" />

          {/* Mini Stethoscope */}
          <path d="M 70 102 C 70 124, 90 124, 90 102" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="122" r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />

          {/* Left Cat Ear with cute twitch */}
          <motion.path
            d="M 46 62 L 34 26 L 68 44 Z"
            fill="url(#catFur)"
            stroke="#92400e"
            strokeWidth="1.5"
            animate={{ rotate: [0, -4, 2, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            style={{ transformOrigin: "50px 50px" }}
          />
          <path d="M 44 54 L 38 32 L 62 44 Z" fill="url(#catEarInner)" />

          {/* Right Cat Ear with cute twitch */}
          <motion.path
            d="M 114 62 L 126 26 L 92 44 Z"
            fill="url(#catFur)"
            stroke="#92400e"
            strokeWidth="1.5"
            animate={{ rotate: [0, 4, -2, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 0.2 }}
            style={{ transformOrigin: "110px 50px" }}
          />
          <path d="M 116 54 L 122 32 L 98 44 Z" fill="url(#catEarInner)" />

          {/* Cat Head */}
          <ellipse cx="80" cy="70" rx="38" ry="34" fill="url(#catFur)" stroke="#92400e" strokeWidth="1.5" />

          {/* White muzzle cheeks */}
          <ellipse cx="73" cy="80" rx="10" ry="8" fill="#ffffff" opacity="0.95" />
          <ellipse cx="87" cy="80" rx="10" ry="8" fill="#ffffff" opacity="0.95" />

          {/* Cute Pink Cat Nose */}
          <polygon points="77,74 83,74 80,78" fill="#f43f5e" />

          {/* Happy Cat Mouth */}
          <path d="M 75 80 Q 80 84 80 78 Q 80 84 85 80" fill="none" stroke="#713f12" strokeWidth="2" strokeLinecap="round" />

          {/* Rosy Blush Cheeks */}
          <ellipse cx="54" cy="76" rx="6" ry="3.5" fill="#fb7185" opacity="0.6" />
          <ellipse cx="106" cy="76" rx="6" ry="3.5" fill="#fb7185" opacity="0.6" />

          {/* Left Eye (Big Kawaii Eye) */}
          <g>
            <ellipse cx="64" cy="62" rx="7.5" ry="9.5" fill="url(#catEye)" />
            <ellipse cx="64" cy="62" rx="4.5" ry="6.5" fill="#0f172a" />
            <circle cx="62" cy="59" r="2.8" fill="#ffffff" />
            <circle cx="66" cy="65" r="1.2" fill="#ffffff" />
          </g>

          {/* Right Eye (Big Kawaii Eye) */}
          <g>
            <ellipse cx="96" cy="62" rx="7.5" ry="9.5" fill="url(#catEye)" />
            <ellipse cx="96" cy="62" rx="4.5" ry="6.5" fill="#0f172a" />
            <circle cx="94" cy="59" r="2.8" fill="#ffffff" />
            <circle cx="98" cy="65" r="1.2" fill="#ffffff" />
          </g>

          {/* Whiskers Left */}
          <line x1="66" y1="78" x2="42" y2="74" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="66" y1="81" x2="40" y2="82" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="66" y1="84" x2="44" y2="90" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />

          {/* Whiskers Right */}
          <line x1="94" y1="78" x2="118" y2="74" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="94" y1="81" x2="120" y2="82" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="94" y1="84" x2="116" y2="90" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />

          {/* Little Front Paws resting on bottom */}
          <motion.ellipse
            cx="64"
            cy="138"
            rx="8"
            ry="6"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            animate={{ y: isPurring ? [-2, 2, -2] : [0, 0] }}
            transition={{ repeat: Infinity, duration: 0.4 }}
          />
          <motion.ellipse
            cx="96"
            cy="138"
            rx="8"
            ry="6"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            animate={{ y: isPurring ? [2, -2, 2] : [0, 0] }}
            transition={{ repeat: Infinity, duration: 0.4 }}
          />
        </svg>

        {/* Floating sparkles */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 text-amber-300"
        >
          <Sparkles className="w-5 h-5 drop-shadow-md" />
        </motion.div>
      </motion.div>

      <span className="text-[10px] text-cyan-300/80 font-bold mt-1 tracking-wide">
        {isRtl ? "🐾 انقر على القط للمواء والتفاعل" : "🐾 Clique sur le chat pour interagir !"}
      </span>
    </div>
  );
}
