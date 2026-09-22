import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLoading } from '../context/LoadingContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Sparkles } from 'lucide-react';
import DiaVetLogo from './DiaVetLogo';

export const GlobalLoadingOverlay: React.FC = () => {
  const { isLoading, isInitialLoading, loadingMessage, stopLoading } = useLoading();
  const { currentLang } = useLanguage();

  const active = isInitialLoading || isLoading;

  const defaultTitle = isInitialLoading
    ? (currentLang === 'ar' ? 'المنصة الوطنية ديافيت الجزائر 🇩🇿' : currentLang === 'en' ? 'DiaVet National Platform Algeria 🇩🇿' : 'Plateforme Nationale DiaVet Algérie 🇩🇿')
    : (currentLang === 'ar' ? 'جاري تحميل الخدمة...' : currentLang === 'en' ? 'Loading service...' : 'Chargement du service...');

  const defaultSubtitle = isInitialLoading
    ? (currentLang === 'ar' ? 'جاري مزامنة البيانات وحالة الملف...' : currentLang === 'en' ? 'Syncing data & profile status...' : 'Mise en place des données & profil...')
    : (currentLang === 'ar' ? 'يرجى الانتظار لحظة' : currentLang === 'en' ? 'Please wait a moment' : 'Veuillez patienter un instant');

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="global-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl select-none px-4 cursor-pointer"
          onClick={() => stopLoading()}
        >
          {/* Ambient background blur circles */}
          <div className="absolute w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute w-60 h-60 rounded-full bg-emerald-500/15 blur-3xl animate-pulse delay-500 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
            {/* Animated Logo Ring */}
            <div className="relative mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                className="w-20 h-20 rounded-full border-2 border-dashed border-cyan-400/60 p-1"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                className="absolute inset-1 rounded-full border-2 border-dashed border-emerald-400/40"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <DiaVetLogo className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
              </div>
            </div>

            {/* Title & Status Message */}
            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
              {defaultTitle}
            </h3>

            <p className="text-xs sm:text-sm text-cyan-200/80 mt-1.5 font-medium min-h-[20px]">
              {loadingMessage || defaultSubtitle}
            </p>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mt-6 border border-white/5 relative">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400 to-emerald-400 rounded-full shadow-[0_0_10px_#22d3ee]"
              />
            </div>

            {/* Footer Badge */}
            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>DiaVet DZ · Sécurisé</span>
              <Sparkles className="w-3 h-3 text-emerald-400" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoadingOverlay;
