import { useState } from 'react';
import { motion } from 'motion/react';
import { Crown, Sparkles, ShieldCheck, QrCode, Cpu, Award } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface HolographicVipCardProps {
  userName?: string;
  vipCode?: string;
  role?: 'owner' | 'vet';
  wilaya?: string;
}

export default function HolographicVipCard({
  userName = 'Membre DiaVet',
  vipCode = 'VIP-DZ-2026',
  role = 'owner',
  wilaya = 'Alger (16)'
}: HolographicVipCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y * 0.08);
    setRotateY(x * 0.08);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div 
      className="perspective-1000 my-4"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => soundEngine.playCyberShield()}
    >
      <motion.div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d'
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="relative w-full max-w-md mx-auto aspect-[1.65/1] rounded-3xl p-6 sm:p-7 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/60 border-2 border-amber-400/70 shadow-2xl shadow-amber-500/20 overflow-hidden cursor-pointer group"
      >
        {/* Hologram Shimmer Gradient Sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
        
        {/* Cyber micro-circuits overlay */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Top Header Card */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-400/30">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-widest">
                  PASS FONDATEUR VIP
                </span>
                <span className="text-amber-400">✨</span>
              </div>
              <h4 className="text-base font-black text-white leading-tight">
                {role === 'vet' ? 'Docteur Vétérinaire Certifié' : 'Propriétaire Privilège DZ'}
              </h4>
            </div>
          </div>

          <div className="w-9 h-9 rounded-xl bg-slate-900/90 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <QrCode className="w-5 h-5" />
          </div>
        </div>

        {/* Center Name & Hologram Watermark */}
        <div className="relative z-10 my-4 sm:my-5">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Titulaire du Pass</p>
          <h3 className="text-lg sm:text-2xl font-black text-white tracking-wide truncate">
            {userName}
          </h3>
          <p className="text-xs text-amber-300/80 font-mono mt-0.5">
            Wilaya : {wilaya}
          </p>
        </div>

        {/* Bottom Card Footer */}
        <div className="relative z-10 pt-3 border-t border-amber-400/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-[10px] font-mono font-black text-amber-200">
              {vipCode}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Actif à vie</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>DZ-2026-NFC</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
