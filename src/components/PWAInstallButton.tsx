import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share, PlusSquare, CheckCircle2, Globe } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  compactOnMobile?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  compactOnMobile = true 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>PWA Installé</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (!res) setShowGuideModal(true);
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer ${className}`}
        title="Installer l'application DiaVet PWA"
      >
        <Download className="w-3.5 h-3.5 animate-bounce shrink-0 text-slate-950" />
        <span className={compactOnMobile ? "hidden sm:inline whitespace-nowrap" : "whitespace-nowrap"}>
          Installer l'App PWA
        </span>
      </button>

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-cyan-500/40 p-6 sm:p-7 shadow-2xl relative text-left">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
                🐾
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Installer DiaVet Algérie 🇩🇿</h3>
                <p className="text-xs text-cyan-300 font-medium">Application Web Progressive (PWA)</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Installez l'application DiaVet directement sur votre smartphone (Android / iPhone) ou ordinateur sans passer par le Play Store. Accès rapide en 1 clic et mode hors-ligne disponible !
            </p>

            <div className="space-y-3 my-4">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-cyan-500/20">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5">
                      <Share className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">1. Touchez le bouton "Partager"</p>
                      <p className="text-xs text-slate-400">Dans le menu Safari en bas de votre écran iPhone.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-cyan-500/20">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">2. Appuyez sur "Sur l'écran d'accueil"</p>
                      <p className="text-xs text-slate-400">Puis validez "Ajouter" en haut à droite.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-cyan-500/20">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">Sur Chrome / Android</p>
                      <p className="text-xs text-slate-400">Cliquez sur les 3 points vertical en haut à droite ➔ "Installer l'application" ou "Ajouter à l'écran d'accueil".</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-cyan-500/20">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mt-0.5">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">Sur PC / Mac (Chrome / Edge)</p>
                      <p className="text-xs text-slate-400">Cliquez sur l'icône d'ordinateur ou d'installation dans la barre d'adresse URL.</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-sm shadow-xl hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
};

