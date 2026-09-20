import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Shield, Heart, Zap, Cpu, Scan, CheckCircle2, 
  AlertCircle, Sparkles, RefreshCw, Radio, BatteryCharging,
  Layers, Thermometer, Waves
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { Language } from '../types';

interface FuturisticBioScannerProps {
  petName?: string;
  species?: string;
  currentLang?: Language;
}

export default function FuturisticBioScanner({
  petName = 'Milo',
  species = 'Chien (Canidé)',
  currentLang = 'fr'
}: FuturisticBioScannerProps) {
  const isRtl = currentLang === 'ar';
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [activeModule, setActiveModule] = useState<'vitals' | 'chip' | 'vaccines'>('vitals');
  const [heartBpm, setHeartBpm] = useState(82);

  // Pulse waveform simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartBpm(prev => 78 + Math.floor(Math.sin(Date.now() / 1500) * 8));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleStartScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    soundEngine.playHoloScan();

    const startTime = Date.now();
    const duration = 2400;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setScanProgress(progress);

      if (progress % 25 === 0 && progress > 0) {
        soundEngine.playBioTelemetry();
      }

      if (progress < 100) {
        requestAnimationFrame(tick);
      } else {
        setIsScanning(false);
        soundEngine.playQuantumUnlock();
      }
    };

    requestAnimationFrame(tick);
  };

  return (
    <div className="relative rounded-3xl p-5 sm:p-7 bg-slate-950/90 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl overflow-hidden text-slate-100">
      
      {/* Background Matrix & Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0891b212_1px,transparent_1px),linear-gradient(to_bottom,#0891b212_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header HUD Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                DiaVet AI-BioTelemetry v4.2
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 mt-0.5">
              <span>Scanner Biométrique & Télémétrie</span>
              <span className="text-cyan-400 font-mono text-sm">[{petName}]</span>
            </h3>
          </div>
        </div>

        {/* Scan Trigger Button */}
        <button
          onClick={handleStartScan}
          disabled={isScanning}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            isScanning
              ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 cursor-wait animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:scale-102 active:scale-98'
          }`}
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
              <span>Analyse Laser {scanProgress}%</span>
            </>
          ) : (
            <>
              <Scan className="w-4 h-4" />
              <span>Lancer Bio-Scan 3D</span>
            </>
          )}
        </button>
      </div>

      {/* Main Holographic Body Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        
        {/* Left Column: Hologram Radar & Vitals HUD (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Hologram Stage */}
          <div className="relative rounded-2xl bg-slate-950/80 border border-cyan-500/30 p-5 overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
            
            {/* Circular Radar Scan Rings */}
            <div className="relative w-40 h-40 flex items-center justify-center my-2">
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-25" />
              <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/30 animate-spin" style={{ animationDuration: '16s' }} />
              <div className="absolute inset-6 rounded-full border border-cyan-400/40" />
              
              {/* Central Pet Avatar or Cyber Icon */}
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-slate-900 border-2 border-cyan-400 p-1 flex items-center justify-center shadow-xl shadow-cyan-500/30">
                <img
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200"
                  alt={petName}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Laser Scanning Bar */}
              {isScanning && (
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] z-20"
                />
              )}
            </div>

            {/* Live Cardiac Waveform Display */}
            <div className="w-full mt-3 px-3 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 animate-pulse fill-current" />
                <span className="text-xs font-mono font-bold text-white">Rythme Cardiaque :</span>
                <span className="text-sm font-mono font-black text-rose-400">{heartBpm} BPM</span>
              </div>
              <div className="flex items-center gap-1">
                {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 30].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [h * 0.18, (h * 0.35), h * 0.18] }}
                    transition={{ repeat: Infinity, duration: 0.8 + (i % 3) * 0.2 }}
                    className="w-1 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full"
                    style={{ height: `${h * 0.25}px` }}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Température</div>
              <div className="text-base font-mono font-black text-emerald-400 mt-0.5">38.4°C</div>
              <div className="text-[9px] text-emerald-300/80">Normale (Canidé)</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Hydratation</div>
              <div className="text-base font-mono font-black text-cyan-400 mt-0.5">98.2%</div>
              <div className="text-[9px] text-cyan-300/80">Optimal</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Bouclier Bio</div>
              <div className="text-base font-mono font-black text-amber-400 mt-0.5">100%</div>
              <div className="text-[9px] text-amber-300/80">Vacciné & Protégé</div>
            </div>
          </div>

        </div>

        {/* Right Column: Microchip RFID & AI Health Analysis (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          
          {/* Microchip NFC Reader Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black text-white uppercase tracking-wide">Puce RFID DZ-NFC</span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-400/30">
                134.2 kHz ISO
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 font-mono text-xs text-slate-300 flex items-center justify-between">
              <span>ID : DZ-016-9810-4421</span>
              <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Certifiée ONMV</span>
              </span>
            </div>
          </div>

          {/* AI Preventive Diagnostic Insights */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-white">Recommandations IA DiaVet</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2">
                <span className="text-cyan-400 font-bold">●</span>
                <div>
                  <span className="font-bold text-white block">Rappel Vermifuge Automnal</span>
                  <span className="text-slate-400 text-[11px]">Prévu le 15 Novembre 2026. Protégez contre les tiques et puces.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">●</span>
                <div>
                  <span className="font-bold text-white block">Apport Hydrique Optimal</span>
                  <span className="text-slate-400 text-[11px]">Consommation d'eau estimée à 1.4 L/jour, conforme au poids (28.4 kg).</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Safe Switch */}
          <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">Synchronisation Clinique</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-black">EN TEMPS RÉEL</span>
          </div>

        </div>

      </div>

    </div>
  );
}
