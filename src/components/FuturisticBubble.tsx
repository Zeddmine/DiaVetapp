import { motion } from 'motion/react';
import { Check, CheckCircle2, Sparkles } from 'lucide-react';

export interface FuturisticBubbleProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
  icon?: string;
  badge?: string;
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple';
  isRtl?: boolean;
  isMulti?: boolean;
  className?: string;
}

export default function FuturisticBubble({
  label,
  sublabel,
  selected,
  onClick,
  icon,
  badge,
  color = 'cyan',
  isRtl = false,
  isMulti = false,
  className = ''
}: FuturisticBubbleProps) {
  
  // Dynamic color styles
  const colorStyles = {
    cyan: {
      selectedBg: 'bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-teal-500/20',
      border: 'border-cyan-400',
      text: 'text-cyan-200',
      shadow: 'shadow-xl shadow-cyan-500/25 ring-2 ring-cyan-400/30',
      indicator: 'bg-cyan-400 text-slate-950 shadow-cyan-400/60',
      hoverBorder: 'hover:border-cyan-400/50',
      pulse: 'from-cyan-400/10 via-blue-400/10'
    },
    emerald: {
      selectedBg: 'bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-cyan-500/20',
      border: 'border-emerald-400',
      text: 'text-emerald-200',
      shadow: 'shadow-xl shadow-emerald-500/25 ring-2 ring-emerald-400/30',
      indicator: 'bg-emerald-400 text-slate-950 shadow-emerald-400/60',
      hoverBorder: 'hover:border-emerald-400/50',
      pulse: 'from-emerald-400/10 via-teal-400/10'
    },
    amber: {
      selectedBg: 'bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-yellow-500/20',
      border: 'border-amber-400',
      text: 'text-amber-200',
      shadow: 'shadow-xl shadow-amber-500/25 ring-2 ring-amber-400/30',
      indicator: 'bg-amber-400 text-slate-950 shadow-amber-400/60',
      hoverBorder: 'hover:border-amber-400/50',
      pulse: 'from-amber-400/10 via-orange-400/10'
    },
    rose: {
      selectedBg: 'bg-gradient-to-r from-rose-500/25 via-pink-500/20 to-red-500/20',
      border: 'border-rose-400',
      text: 'text-rose-200',
      shadow: 'shadow-xl shadow-rose-500/25 ring-2 ring-rose-400/30',
      indicator: 'bg-rose-400 text-slate-950 shadow-rose-400/60',
      hoverBorder: 'hover:border-rose-400/50',
      pulse: 'from-rose-400/10 via-pink-400/10'
    },
    purple: {
      selectedBg: 'bg-gradient-to-r from-purple-500/25 via-indigo-500/20 to-pink-500/20',
      border: 'border-purple-400',
      text: 'text-purple-200',
      shadow: 'shadow-xl shadow-purple-500/25 ring-2 ring-purple-400/30',
      indicator: 'bg-purple-400 text-slate-950 shadow-purple-400/60',
      hoverBorder: 'hover:border-purple-400/50',
      pulse: 'from-purple-400/10 via-indigo-400/10'
    }
  }[color];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`group relative w-full rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 overflow-hidden text-left ${
        isRtl ? 'text-right flex-row-reverse' : ''
      } ${
        selected
          ? `${colorStyles.selectedBg} border-2 ${colorStyles.border} ${colorStyles.text} ${colorStyles.shadow}`
          : `bg-slate-900/80 hover:bg-slate-850 border border-white/10 ${colorStyles.hoverBorder} text-slate-300 hover:text-white`
      } ${className}`}
    >
      {/* Subtle pulse animated gradient glow */}
      {selected && (
        <span className={`absolute inset-0 bg-gradient-to-r ${colorStyles.pulse} to-transparent opacity-60 animate-pulse pointer-events-none`} />
      )}

      {/* Main Content */}
      <div className={`flex items-center gap-3 relative z-10 flex-1 min-w-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
        {icon && (
          <span className="text-xl sm:text-2xl shrink-0 p-2 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className={`flex items-center gap-2 flex-wrap ${isRtl ? 'justify-end' : 'justify-start'}`}>
            <span className={`font-black text-xs sm:text-sm tracking-tight block ${selected ? colorStyles.text : 'text-white'}`}>
              {label}
            </span>
            {badge && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {badge}
              </span>
            )}
          </div>
          {sublabel && (
            <span className="text-[11px] sm:text-xs text-slate-400 block mt-0.5 leading-snug">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {/* Futuristic Check / Radio bubble badge */}
      <div className="relative z-10 shrink-0">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
          selected
            ? `${colorStyles.indicator} shadow-md scale-110`
            : 'border-2 border-white/20 bg-slate-800/80 group-hover:border-cyan-400/60'
        }`}>
          {selected ? (
            isMulti ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 fill-current" />
            )
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-cyan-400/60" />
          )}
        </div>
      </div>
    </motion.button>
  );
}
