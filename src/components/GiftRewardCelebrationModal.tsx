import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, CheckCircle2, Gift, Heart, ShoppingBag, 
  Lightbulb, ShieldCheck, ArrowRight, X, Award, Star, 
  Crown, Check, BellRing, Sparkle
} from 'lucide-react';
import { Language } from '../types';
import { soundEngine } from '../utils/soundEngine';
import DiaVetCatMascot from './DiaVetCatMascot';

interface GiftRewardCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  userName?: string;
  userRole?: 'owner' | 'vet';
  vipCode?: string;
  onNavigateTo: (screen: 'adoption' | 'marketplace' | 'ideas' | 'owner-portal' | 'vet-portal' | 'profile') => void;
  onVipEarlyAccessToggle?: (enabled: boolean) => void;
}

export default function GiftRewardCelebrationModal({
  isOpen,
  onClose,
  currentLang,
  userName = 'Membre DiaVet',
  userRole = 'owner',
  vipCode = 'VIP-DZ-2026',
  onNavigateTo,
  onVipEarlyAccessToggle
}: GiftRewardCelebrationModalProps) {
  const isRtl = currentLang === 'ar';
  
  // Mystery Box State: user unboxes the surprise gift!
  const [isBoxOpened, setIsBoxOpened] = useState(false);
  
  // VIP Early-Access State (version avant le lancement)
  const [isVipEarlyAccessJoined, setIsVipEarlyAccessJoined] = useState(false);

  useEffect(() => {
    if (isOpen) {
      soundEngine.playCatMeow();
      // Check existing preference
      try {
        const savedVip = localStorage.getItem('diavet_vip_early_access');
        if (savedVip === 'true') {
          setIsVipEarlyAccessJoined(true);
        }
      } catch {}
    }
  }, [isOpen]);

  const triggerConfettiExplosion = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.7 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.7 }
        });
      }, 250);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenMysteryGift = () => {
    setIsBoxOpened(true);
    soundEngine.playCelebration();
    triggerConfettiExplosion();
  };

  const handleToggleVipEarlyAccess = () => {
    const nextVal = !isVipEarlyAccessJoined;
    setIsVipEarlyAccessJoined(nextVal);
    soundEngine.playSuccess();
    
    if (nextVal) {
      triggerConfettiExplosion();
    }

    try {
      localStorage.setItem('diavet_vip_early_access', String(nextVal));
    } catch {}

    if (onVipEarlyAccessToggle) {
      onVipEarlyAccessToggle(nextVal);
    }
  };

  if (!isOpen) return null;

  // Mascot Speech texts
  const catIntroSpeech = isRtl
    ? `مياو ! أنا قط DiaVet 🐾 ! تهانينا يا ${userName} على إتمام الاستبيان ! لقد حضرت لك هدية مفاجأة خاصة جداً... انقر على الصندوق لفتحها !`
    : `Miaou ! Je suis le Chat Mascotte de DiaVet 🐾 ! Bravo ${userName} d'avoir complété le formulaire ! Je t'ai préparé une magnifique surprise... Ouvre la boîte cadeau !`;

  const catOpenedSpeech = isRtl
    ? `مياو ! لقد فتحت هديتك المفاجأة بنجاح 🎉 ! جميع الخدمات الآن مجانية ومفتوحة لك. هل ترغب أيضاً في الانضمام كعضو VIP للحصول على نسخة التطبيق قبل الإطلاق الرسمي ؟ 🌟`
    : `Miaou ! Surprise dévoilée avec succès 🎉 ! Tous tes accès sont maintenant ouverts. Veux-tu aussi être Membre VIP pour recevoir la version avant le lancement officiel en Algérie ? 🌟`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.82, y: 25 }}
          transition={{ type: "spring", duration: 0.55, bounce: 0.3 }}
          className={`relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-950 border-2 border-amber-400/60 p-5 sm:p-7 shadow-2xl my-auto ${
            isRtl ? 'text-right' : 'text-left'
          }`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Animated Gold & Emerald Glowing Backgrounds */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              soundEngine.playPop();
              onClose();
            }}
            className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 rounded-full bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer z-20`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* 1. DIAVET MASCOT CAT SECTION */}
          <div className="mb-4">
            <DiaVetCatMascot
              speechText={isBoxOpened ? catOpenedSpeech : catIntroSpeech}
              isRtl={isRtl}
              size="md"
            />
          </div>

          {/* 2. MYSTERY BOX STAGE (BEFORE UNBOXING) */}
          {!isBoxOpened ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 border-2 border-dashed border-amber-400/50 my-2"
            >
              {/* Mystery Gift Box with Wiggling Animation */}
              <motion.div
                animate={{ 
                  scale: [1, 1.08, 1],
                  rotate: [-3, 3, -3],
                  y: [0, -6, 0]
                }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                onClick={handleOpenMysteryGift}
                className="relative cursor-pointer p-4 my-2 group"
                title="Clique pour ouvrir ta surprise !"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 p-1 shadow-2xl shadow-amber-400/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden">
                    <Gift className="w-12 h-12 text-amber-400 animate-bounce" />
                    <span className="text-[10px] font-black text-amber-300 font-mono tracking-widest mt-1">
                      ??? SURPRISE ???
                    </span>
                  </div>
                </div>

                {/* Floating Question Marks */}
                <motion.span 
                  animate={{ y: [-4, 4, -4], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-1 -right-1 text-lg font-black text-amber-300"
                >
                  ✨
                </motion.span>
                <motion.span 
                  animate={{ y: [4, -4, 4], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="absolute -bottom-1 -left-1 text-lg font-black text-yellow-300"
                >
                  🎁
                </motion.span>
              </motion.div>

              <h3 className="text-xl sm:text-2xl font-black text-white mt-3">
                {isRtl ? "🎁 صندوق الهدية المفاجأة بانتظارك !" : "🎁 Votre Boîte Cadeau Surprise est prête !"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mt-1 mb-4">
                {isRtl 
                  ? "يقدم لك قط DiaVet هديتك الترحيبية الاستثنائية. انقر لفتح الصندوق واكتشاف ما يحتويه !"
                  : "Le Chat de DiaVet vous offre votre cadeau de bienvenue. Cliquez pour déballer votre surprise !"}
              </p>

              {/* Unbox Trigger Button */}
              <button
                onClick={handleOpenMysteryGift}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-sm transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 cursor-pointer hover:scale-102 active:scale-98"
              >
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>{isRtl ? "فتح الهدية المفاجأة الآن 🎁✨" : "Ouvrir mon Cadeau Surprise Maintenant 🎁✨"}</span>
              </button>
            </motion.div>
          ) : (
            /* 3. REVEALED SURPRISE GIFTS & VIP EARLY ACCESS */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Header Title */}
              <div className="text-center">
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-3.5 py-1 rounded-full border border-amber-400/40 inline-flex items-center gap-1.5 shadow-md mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isRtl ? "🎉 هداياك المفاجأة مفتوحة بالكامل !" : "🎉 Cadeaux Dévoilés & Débloqués !"}</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {isRtl ? (
                    <>مرحباً بك يا <span className="text-amber-400">{userName}</span> !</>
                  ) : (
                    <>Félicitations <span className="text-amber-400">{userName}</span> !</>
                  )}
                </h2>
              </div>

              {/* VIP EARLY ACCESS PROPOSITION (VERSION AVANT LE LANCEMENT) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-yellow-500/20 border-2 border-amber-400/60 shadow-lg relative overflow-hidden">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                        {isRtl ? "⭐ عرض حصري للأعضاء الأوائل" : "⭐ Offre Exclusive Membres Fondateurs"}
                      </span>
                      <h4 className="text-sm font-black text-white leading-tight">
                        {isRtl ? "هل ترغب في نسخة VIP قبل الإطلاق الرسمي ؟" : "Version VIP exclusive avant le lancement officiel 🇩🇿"}
                      </h4>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-200 mb-3 leading-relaxed">
                  {isRtl
                    ? "انضم إلى قائمة الأعضاء الـ VIP لتجربة النسخة التجريبية الأولى من DiaVet وتلقي التحديثات والميزات الجديدة قبل الجميع في الجزائر !"
                    : "Rejoignez le cercle VIP pour tester l'application DiaVet en avant-première avant son lancement public en Algérie et bénéficier des privilèges à vie !"}
                </p>

                {/* Interactive Opt-In Toggle */}
                <button
                  onClick={handleToggleVipEarlyAccess}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isVipEarlyAccessJoined
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25'
                      : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/25'
                  }`}
                >
                  {isVipEarlyAccessJoined ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{isRtl ? "✓ تم تفعيل عضويتك VIP قبل الإطلاق !" : "✓ Vous êtes inscrit en VIP Avant-Première !"}</span>
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 fill-current" />
                      <span>{isRtl ? "نعم، أريد أن أكون VIP وأحصل على النسخة قبل الإطلاق 🌟" : "Oui ! Je veux être VIP avant le lancement officiel 🌟"}</span>
                    </>
                  )}
                </button>

                {/* VIP Pass Credentials Ribbon */}
                {isVipEarlyAccessJoined && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-amber-400/30 flex items-center justify-between text-xs"
                  >
                    <span className="text-amber-200 font-mono text-[11px] flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>Pass : {vipCode}</span>
                    </span>
                    <span className="text-emerald-400 font-bold text-[11px]">
                      {isRtl ? "مؤهل للأسبقية ✓" : "Accès Garanti ✓"}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* UNLOCKED GIFTS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Adoption */}
                <div 
                  onClick={() => {
                    soundEngine.playCyberClick();
                    onNavigateTo('adoption');
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-rose-500/40 hover:border-rose-400 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-white block">Adoption Solidaire</span>
                      <span className="text-[10px] text-slate-400">58 Wilayas sans frais</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* 2. Marketplace */}
                <div 
                  onClick={() => {
                    soundEngine.playCyberClick();
                    onNavigateTo('marketplace');
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-white block">Animalerie & Soins</span>
                      <span className="text-[10px] text-slate-400">Tarifs direct DZD</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* 3. Ideas Box */}
                <div 
                  onClick={() => {
                    soundEngine.playCyberClick();
                    onNavigateTo('ideas');
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-white block">Boîte à Idées & Avis</span>
                      <span className="text-[10px] text-slate-400">Vote & suggestions</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* 4. Carnet / Clinique */}
                <div 
                  onClick={() => {
                    soundEngine.playCyberClick();
                    onNavigateTo(userRole === 'vet' ? 'vet-portal' : 'owner-portal');
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-white block">
                        {userRole === 'vet' ? 'Suite Clinique Pro' : 'Carnet Numérique'}
                      </span>
                      <span className="text-[10px] text-slate-400">Actif à vie</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    soundEngine.playSuccess();
                    onNavigateTo(userRole === 'vet' ? 'vet-portal' : 'owner-portal');
                    onClose();
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isRtl ? "الدخول إلى فضائي المخصص 🚀" : "Accéder à mon Espace 🚀"}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => {
                    soundEngine.playPop();
                    onClose();
                  }}
                  className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {isRtl ? "إغلاق" : "Fermer"}
                </button>
              </div>
            </motion.div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
