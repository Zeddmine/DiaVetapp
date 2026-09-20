import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Clock, Hammer, AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface WhatsAppSupportButtonProps {
  currentLang?: Language;
}

export default function WhatsAppSupportButton({
  currentLang = 'fr'
}: WhatsAppSupportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isRtl = currentLang === 'ar';

  return (
    <aside aria-label="Support WhatsApp DiaVet" className={`fixed bottom-5 z-40 ${isRtl ? 'left-4 sm:left-6' : 'right-4 sm:right-6'}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-3 w-80 sm:w-96 rounded-3xl bg-slate-950/95 border-2 border-amber-500/50 p-5 shadow-2xl shadow-amber-500/20 backdrop-blur-2xl text-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/30">
                  <Hammer className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>{isRtl ? "واتساب المباشر" : "Support WhatsApp Direct"}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                      {isRtl ? "قيد التطوير" : "EN DÉVELOPPEMENT"}
                    </span>
                  </h4>
                  <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{isRtl ? "الخدمة غير متاحة حالياً" : "Accès temporairement suspendu"}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In Development Notice */}
            <div className="py-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {isRtl
                    ? "خدمة المحادثة المباشرة عبر واتساب قيد التطوير والصيانة البرمجية حالياً. لا يوجد وصول مباشر في الوقت الراهن وسيتم إطلاقها قريباً."
                    : "Le service de liaison WhatsApp en direct est actuellement en cours de développement. Aucun accès direct n'est disponible pour le moment."}
                </p>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed text-center">
                {isRtl
                  ? "لأي استفسار طارئ، يرجى التواصل عبر البريد الإلكتروني الرسمي: contact@diavet.com"
                  : "Pour toute demande officielle, veuillez utiliser notre email de contact : contact@diavet.com"}
              </p>
            </div>

            {/* Disabled Action */}
            <div className="pt-1">
              <div className="w-full py-3 rounded-2xl bg-slate-800/80 border border-white/10 text-slate-400 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-80">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{isRtl ? "ميزة قيد التطوير — غير متاحة 🔒" : "En cours de développement 🔒"}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Main Button - Shows En Développement Badge */}
      <motion.button
        id="whatsapp-floating-btn"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          soundEngine.playPop();
          setIsOpen(!isOpen);
        }}
        className="group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white shadow-2xl shadow-amber-500/20 border-2 border-amber-500/50 hover:border-amber-400 transition-all cursor-pointer backdrop-blur-xl"
        aria-label="Support WhatsApp DiaVet en développement"
      >
        {/* Development Tool Icon */}
        <div className="relative w-6 h-6 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950">
            !
          </span>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[9px] font-mono font-black uppercase tracking-wider text-amber-300 opacity-95 leading-tight flex items-center gap-1">
            <Hammer className="w-2.5 h-2.5 text-amber-400" />
            {isRtl ? "قيد التطوير" : "En dev"}
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-200 leading-tight">
            {isRtl ? "واتساب المباشر" : "WhatsApp DZ"}
          </span>
        </div>

        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/40 ml-0.5 uppercase">
          {isRtl ? "مغلق" : "Bientôt"}
        </span>
      </motion.button>
    </aside>
  );
}
