import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, CheckCircle2, Award, Heart, Stethoscope, 
  ArrowRight, ShieldCheck, QrCode, Star, FileText,
  Compass, Zap
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import DiaVetLogo from './DiaVetLogo';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  drift: number;
  shape: 'circle' | 'star' | 'ring';
}

interface SuccessStateProps {
  type: 'onboarding' | 'owner-questionnaire' | 'vet-questionnaire';
  currentLang?: Language;
  userName?: string;
  petName?: string;
  clinicName?: string;
  role?: 'owner' | 'vet';
  vipCode?: string;
  welcomeBannerUrl?: string;
  pointsEarned?: number;
  onContinue: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export default function SuccessState({
  type,
  currentLang = 'fr',
  userName = 'Membre DiaVet',
  petName = 'Votre Compagnon',
  clinicName = 'Cabinet Vétérinaire',
  role = 'owner',
  vipCode,
  welcomeBannerUrl,
  pointsEarned = 100,
  onContinue,
  onSecondaryAction,
  secondaryActionLabel
}: SuccessStateProps) {
  const t = translations[currentLang] || translations.fr;
  const isRtl = currentLang === 'ar';
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      'rgba(6, 182, 212, 0.85)', // cyan
      'rgba(16, 185, 129, 0.85)', // emerald
      'rgba(245, 158, 11, 0.85)', // amber
      'rgba(244, 63, 94, 0.85)',  // rose
      'rgba(168, 85, 247, 0.85)', // purple
      'rgba(255, 255, 255, 0.9)', // white
    ];

    const generated: Particle[] = Array.from({ length: 42 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 80 + Math.random() * 30,
      size: Math.random() * 14 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 4 + 3.5,
      delay: Math.random() * 2,
      drift: (Math.random() - 0.5) * 60,
      shape: (['circle', 'star', 'ring'] as const)[Math.floor(Math.random() * 3)]
    }));

    setParticles(generated);
  }, []);

  const isVet = role === 'vet' || type === 'vet-questionnaire';
  const defaultVip = vipCode || (isVet ? 'DV-VET-2026-DZ' : 'DV-VIP-2026-DZ');

  const getStatusBadge = () => {
    if (type === 'onboarding') {
      return currentLang === 'ar' ? 'تم تأكيد التسجيل بنجاح' : currentLang === 'en' ? 'Registration Successfully Confirmed' : 'Inscription Validée avec Succès';
    }
    if (isVet) {
      return currentLang === 'ar' ? 'اعتماد طبي بيطري موثق' : currentLang === 'en' ? 'Certified Veterinary Partner' : 'Conventionnement Vétérinaire Agréé';
    }
    return currentLang === 'ar' ? 'تم تسجيل الدفتر الصحي' : currentLang === 'en' ? 'Health Passport Registered' : 'Dossier Santé Enregistré';
  };

  const getHeading = () => {
    if (type === 'onboarding') {
      return currentLang === 'ar' ? `تهانينا، ${userName} !` : currentLang === 'en' ? `Congratulations, ${userName}!` : `Félicitations, ${userName} !`;
    }
    if (isVet) {
      return currentLang === 'ar' ? `مرحباً دكتور ${userName}` : currentLang === 'en' ? `Welcome Dr. ${userName}` : `Bienvenue Docteur ${userName}`;
    }
    return currentLang === 'ar' ? `دفتر ${petName} أصبح جاهزاً !` : currentLang === 'en' ? `${petName}'s Passport is Active!` : `Le carnet de ${petName} est actif !`;
  };

  const getSubtitle = () => {
    if (type === 'onboarding') {
      return currentLang === 'ar'
        ? 'تم تسجيل حسابك في DiaVet الجزائر بنجاح. يمكنك الآن الانتقال مباشرة للبدء في الاستفادة من جميع الميزات.'
        : currentLang === 'en'
        ? 'Your DiaVet Algeria profile is saved. You can now enrich your medical record or enter your personal portal.'
        : 'Votre profil DiaVet Algérie est enregistré. Vous pouvez maintenant enrichir votre dossier ou accéder à votre espace personnalisé.';
    }
    if (isVet) {
      return currentLang === 'ar'
        ? `تم اعتماد عيادتكم "${clinicName}" في الشبكة مع صلاحية الوصول للبرنامج الطبي السريري.`
        : currentLang === 'en'
        ? `Your clinic "${clinicName}" is certified with exclusive access to digital diagnostic and prescription tools.`
        : `Votre cabinet "${clinicName}" est désormais référencé avec accès exclusif au logiciel de diagnostic et ordonnances sécurisées.`;
    }
    return currentLang === 'ar'
      ? `تمت معالجة إجاباتك وتفعيل بطاقة VIP الرقمية لحيوانك بنجاح.`
      : currentLang === 'en'
      ? `Your responses have been processed. Your VIP health passport and exclusive features are now unlocked.`
      : `Vos réponses ont été traitées. Votre pass sanitaire VIP et l'accès à l'adoption et aux conseils sont maintenant débloqués.`;
  };

  const getPrimaryButtonLabel = () => {
    if (isVet) {
      return t.successBtnVet || 'Accéder au Diagnostic Praticien 🩺';
    }
    return t.successBtnOwner || 'Accéder au Formulaire & Espace 🐾';
  };

  return (
    <div className={`relative min-h-[580px] w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden ${isRtl ? 'text-right' : 'text-left'}`}>
      
      {/* Dynamic Floating Particles Canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              x: `${p.x}vw`, 
              y: '105vh', 
              opacity: 0, 
              scale: 0.2,
              rotate: 0 
            }}
            animate={{ 
              x: `${p.x + p.drift / 10}vw`, 
              y: '-10vh', 
              opacity: [0, 0.9, 0.9, 0], 
              scale: [0.2, 1.2, 1, 0.4],
              rotate: p.drift * 6 
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute"
          >
            {p.shape === 'star' ? (
              <div 
                style={{ width: p.size, height: p.size, color: p.color }}
                className="drop-shadow-[0_0_8px_currentColor]"
              >
                ★
              </div>
            ) : p.shape === 'ring' ? (
              <div
                style={{ 
                  width: p.size * 1.3, 
                  height: p.size * 1.3, 
                  borderColor: p.color 
                }}
                className="rounded-full border-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
              />
            ) : (
              <div
                style={{ 
                  width: p.size, 
                  height: p.size, 
                  backgroundColor: p.color 
                }}
                className="rounded-full blur-[0.5px] drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Radiant Aura Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-amber-500/15 blur-3xl pointer-events-none z-0" />

      {/* Main Success Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl rounded-[2.5rem] bg-slate-950/95 border-2 border-emerald-500/40 p-6 sm:p-10 shadow-2xl shadow-emerald-500/20 backdrop-blur-2xl text-center text-slate-100"
      >
        {/* Glowing Status Icon Badge with Mascot Illustration */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
          className="relative mx-auto mb-5 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center bg-gradient-to-tr from-emerald-500 via-cyan-400 to-blue-500 p-1 shadow-2xl shadow-cyan-500/40"
        >
          <div className="w-full h-full rounded-[1.4rem] bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-emerald-500/10 pointer-events-none" />
            <span className="text-4xl sm:text-5xl select-none animate-bounce">
              🐱🐶
            </span>
            <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest mt-0.5">
              DiaVet DZ
            </span>
          </div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-slate-950 shadow-lg border-2 border-slate-950"
          >
            <Sparkles className="w-4 h-4 fill-current" />
          </motion.div>
        </motion.div>

        {/* Title & Headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2 mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{getStatusBadge()}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {getHeading()}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {getSubtitle()}
          </p>
        </motion.div>

        {/* AI Imagen Generated Welcome Banner Showcase */}
        {welcomeBannerUrl && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 rounded-3xl overflow-hidden border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/20 relative group"
          >
            <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-400/60 text-cyan-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{isRtl ? 'بانيير ترحيبي ذكي (Imagen AI 🎨)' : 'Bannière AI Imagen Générée ✨'}</span>
            </div>
            <img 
              src={welcomeBannerUrl} 
              alt="DiaVet AI Welcome Banner" 
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-[220px] sm:max-h-[260px] transform group-hover:scale-105 transition-transform duration-500"
            />
          </motion.div>
        )}

        {/* VIP Digital Card Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-white/15 shadow-inner mb-6 text-left relative overflow-hidden"
        >
          {/* Subtle light bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400" />

          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <DiaVetLogo size="xs" />
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                {isVet 
                  ? (currentLang === 'ar' ? 'بطاقة طبيب بيطري معتمد 🇩🇿' : currentLang === 'en' ? 'Certified Vet Pro Card 🇩🇿' : 'Pass Praticien Vétérinaire Agréé 🇩🇿')
                  : (currentLang === 'ar' ? 'بطاقة عضو مؤسس VIP 🇩🇿' : currentLang === 'en' ? 'VIP Founder Pass 🇩🇿' : 'Pass VIP Fondateur DiaVet 🇩🇿')}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 font-bold">
              OFFICIEL DZ
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-black/40 border border-white/10">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                {t.successVipLabel || 'Code de Validation :'}
              </span>
              <span className="font-mono text-base sm:text-lg font-black text-cyan-300 tracking-wider">
                {defaultVip}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                {t.successPointsEarned || 'Points Débloqués'}
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-400 flex items-center justify-end gap-1">
                <span>+{pointsEarned}</span>
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </motion.div>

        {/* Action Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="space-y-3"
        >
          <button
            onClick={onContinue}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 hover:from-emerald-300 hover:to-blue-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{getPrimaryButtonLabel()}</span>
            <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          {onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer border border-white/10"
            >
              {secondaryActionLabel || (currentLang === 'ar' ? 'العودة إلى الصفحة الرئيسية' : currentLang === 'en' ? 'Back to Home' : 'Retour à l’accueil')}
            </button>
          )}
        </motion.div>

      </motion.div>
    </div>
  );
}
