import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Gift, Sparkles, CheckCircle2, ArrowRight, X, 
  HelpCircle, Star, Crown
} from 'lucide-react';
import { Language } from '../types';
import { soundEngine } from '../utils/soundEngine';
import DiaVetCatMascot from './DiaVetCatMascot';

interface LockedGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToQuestionnaire: () => void;
  featureName: string;
  currentLang: Language;
  userRole?: 'owner' | 'vet';
}

export default function LockedGiftModal({
  isOpen,
  onClose,
  onGoToQuestionnaire,
  featureName,
  currentLang,
  userRole = 'owner'
}: LockedGiftModalProps) {
  const isRtl = currentLang === 'ar';

  if (!isOpen) return null;

  const catSpeech = isRtl
    ? `مياو ! هذه الخدمة محجوزة ضمن باقة الهدايا المفاجأة 🎁. أكمل استبيانك القصير وسأفتحها لك مجاناً مع فرصة الحصول على نسخة VIP قبل الإطلاق الرسمي !`
    : `Miaou ! Cet espace fait partie de mon Pack Surprise 🎁. Finalise ton court questionnaire et je t'offrirai tous les accès ainsi qu'une version VIP avant le lancement !`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className={`relative w-full max-w-lg rounded-3xl bg-slate-950 border-2 border-amber-500/50 p-5 sm:p-7 shadow-2xl overflow-hidden my-auto ${
            isRtl ? 'text-right' : 'text-left'
          }`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Animated Glows */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              soundEngine.playPop();
              onClose();
            }}
            className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer z-20`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* DiaVet Mascot Cat with Speech */}
          <div className="mb-3">
            <DiaVetCatMascot
              speechText={catSpeech}
              isRtl={isRtl}
              size="sm"
            />
          </div>

          {/* Mystery Locked Card */}
          <div className="flex flex-col items-center text-center mb-5">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 mb-2">
              {isRtl ? "🔒 ميزة مغلقة · هدية مفاجأة في النهاية" : "🔒 Accès Verrouillé · Cadeau Surprise à la Fin"}
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-white mt-1 leading-tight">
              {isRtl 
                ? `افتح "${featureName}" كهدية مفاجأة !`
                : `Débloquez "${featureName}" en Cadeau Surprise !`}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-sm">
              {isRtl
                ? "هذه الخدمة هي جزء من باقة الهدايا الترحيبية المفاجأة التي سيقدمها لك قط DiaVet فور إتمام الاستبيان مع امتيازات VIP قبل الإطلاق."
                : "Cette fonctionnalité est gardée secrète et vous sera remise en cadeau surprise par le Chat de DiaVet dès que vous aurez finalisé votre formulaire."}
            </p>
          </div>

          {/* Surprise Mystery Teaser Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 mb-6 space-y-2 text-xs text-slate-200">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>{isRtl ? "هدية ترحيبية مفاجأة + دعوة VIP :" : "Pack Cadeau Surprise + Invitation VIP :"}</span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              {isRtl
                ? "✨ عند الانتهاء، ستفتح كافة الخدمات المغلقة وستتمكن من الانضمام لعضوية VIP للحصول على نسخة التطبيق الحصرية قبل الإطلاق الرسمي في الجزائر 🇩🇿."
                : "✨ À la fin du formulaire, le Chat de DiaVet dévoilera vos cadeaux et vous invitera à devenir Membre VIP pour tester l'application avant son lancement officiel en Algérie 🇩🇿."}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playSuccess();
                onGoToQuestionnaire();
                onClose();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
            >
              <Gift className="w-4 h-4" />
              <span>{isRtl ? "إتمام الاستبيان وفتح المفاجأة 🚀" : "Finaliser le formulaire & Découvrir la Surprise 🎁"}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => {
                soundEngine.playPop();
                onClose();
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {isRtl ? "لاحقاً" : "Plus tard"}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
