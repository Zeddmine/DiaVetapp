import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  compactOnMobile?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  compactOnMobile = true 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap shrink-0 ${className}`}
          title="Installer l'application DiaVet"
        >
          <Download className="w-3.5 h-3.5 animate-bounce shrink-0" />
          <span className={compactOnMobile ? "hidden sm:inline whitespace-nowrap" : "whitespace-nowrap"}>
            Installer l'App
          </span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-800/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-slate-800 hover:border-cyan-400 transition-all duration-200 whitespace-nowrap shrink-0 ${className}`}
          title="Installer sur iPhone (PWA)"
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className={compactOnMobile ? "hidden sm:inline whitespace-nowrap" : "whitespace-nowrap"}>
            Installer sur iPhone
          </span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                DV
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Installer DiaVet DZ</h3>
                <p className="text-xs text-slate-400">Application PWA pour iOS / iPhone</p>
              </div>
            </div>

            <div className="space-y-3 my-5 text-sm text-slate-300">
              <div className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">1. Touchez Partager</p>
                  <p className="text-xs text-slate-400">Dans la barre de navigation Safari en bas de votre écran.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">2. "Sur l'écran d'accueil"</p>
                  <p className="text-xs text-slate-400">Défilez vers le bas et touchez "Sur l'écran d'accueil".</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
