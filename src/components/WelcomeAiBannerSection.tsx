import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Heart, Stethoscope, ArrowRight, User, Award, MapPin } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { generateWelcomeBanner } from '../services/aiBannerService';
import { soundEngine } from '../utils/soundEngine';

interface WelcomeAiBannerSectionProps {
  currentLang: Language;
  userProfile: UserProfile;
  isRegistered: boolean;
  onOpenProfile: () => void;
  onOpenPortal: () => void;
  onOpenDirectory: () => void;
  onUpdateBannerUrl?: (url: string) => void;
}

export default function WelcomeAiBannerSection({
  currentLang,
  userProfile,
  isRegistered,
  onOpenProfile,
  onOpenPortal,
  onOpenDirectory,
  onUpdateBannerUrl
}: WelcomeAiBannerSectionProps) {
  const isRtl = currentLang === 'ar';
  const isEn = currentLang === 'en';
  const [bannerUrl, setBannerUrl] = useState<string | null>(userProfile.welcomeBannerUrl || null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (isRegistered && !bannerUrl && userProfile.name) {
      setIsGenerating(true);
      const petOrClinic = userProfile.userRole === 'vet' ? userProfile.clinicName : userProfile.petName;
      generateWelcomeBanner(userProfile.name, userProfile.userRole || 'owner', petOrClinic)
        .then((url) => {
          setBannerUrl(url);
          setIsGenerating(false);
          if (onUpdateBannerUrl) {
            onUpdateBannerUrl(url);
          }
        })
        .catch(() => {
          setIsGenerating(false);
        });
    }
  }, [isRegistered, bannerUrl, userProfile.name, userProfile.userRole]);

  if (!isRegistered) return null;

  const isVet = userProfile.userRole === 'vet';
  const userName = userProfile.name || userProfile.fullName || 'Membre DiaVet';
  const vipCode = userProfile.vipCode || (isVet ? 'DZ-VET-2026' : 'DZ-VIP-2026');
  const points = userProfile.healthPoints || userProfile.points || (isVet ? 250 : 150);

  return (
    <motion.section 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-4 sm:p-6 shadow-2xl shadow-cyan-500/15 backdrop-blur-xl">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-6 items-center relative z-10">
          
          {/* Left Text & Info */}
          <div className={`lg:col-span-7 space-y-3.5 ${isRtl ? 'text-right' : 'text-left'}`}>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>
                {isRtl ? "مرحباً بك في DiaVet الجزائر 🇩🇿" : isEn ? "Welcome to DiaVet Algeria 🇩🇿" : "Message de Bienvenue DiaVet Algérie 🇩🇿"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-black text-white leading-tight">
              {isRtl ? (
                <>أهلاً وسهلاً بك، <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-400 to-amber-300">{userName}</span> !</>
              ) : isEn ? (
                <>Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-400 to-amber-300">{userName}</span>!</>
              ) : (
                <>Ravi de vous revoir, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-400 to-amber-300">{userName}</span> !</>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {isVet ? (
                isRtl
                  ? `حسابكم الطبي البيطري المعتمد نشط بـ ${userProfile.clinicName || 'عيادتكم المعاينة'}. يمكنك الوصول الفوري للبرنامج السريري والوصفات الرقمية.`
                  : isEn
                  ? `Your certified veterinary account is active for ${userProfile.clinicName || 'your practice'}. Access clinical diagnostics and digital prescriptions instantly.`
                  : `Votre compte vétérinaire agréé est actif pour ${userProfile.clinicName || 'votre cabinet'}. Accédez immédiatement aux diagnostics et ordonnances sécurisées.`
              ) : (
                isRtl
                  ? `دفتر الصحة الرقمي لـ ${userProfile.petName || 'حيوانكم الأليف'} مفعّل بنجاح مع بطاقة VIP الخاصة بكم.`
                  : isEn
                  ? `The digital health passport for ${userProfile.petName || 'your pet'} is activated with your VIP Founder Card.`
                  : `Le dossier médical numérique de ${userProfile.petName || 'votre compagnon'} est actif avec votre Pass VIP Fondateur.`
              )}
            </p>

            {/* Badges & Serial summary */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-white/15 text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                {isVet ? <Stethoscope className="w-3.5 h-3.5 text-emerald-400" /> : <Heart className="w-3.5 h-3.5 text-rose-400" />}
                <span>{userProfile.badgeTitle || (isVet ? 'Docteur Vétérinaire Agréé' : 'Membre VIP Fondateur')}</span>
              </span>

              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-amber-400/40 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{vipCode}</span>
              </span>

              <span className="px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-400/40 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>{points} pts</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenPortal();
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer active:scale-95"
              >
                <span>{isVet ? (isRtl ? 'البرنامج السريري 🩺' : 'Espace Praticien 🩺') : (isRtl ? 'مساحتي الرقمية 🐾' : 'Mon Espace & Carnet 🐾')}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenProfile();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isRtl ? "تعديل الملف الشخصي" : isEn ? "Edit Profile" : "Modifier Mon Profil"}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenDirectory();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRtl ? "دليل 58 ولاية" : isEn ? "58 Wilayas Vets" : "Urgences 58 Wilayas"}</span>
              </button>
            </div>

          </div>

          {/* Right Column: AI Generated Imagen Banner Display */}
          <div className="lg:col-span-5 relative mt-2 lg:mt-0">
            <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/20 group">
              
              {/* Badge Overlay */}
              <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-400/60 text-cyan-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>{isRtl ? 'بانيير ترحيبي بالذكاء الاصطناعي 🎨' : 'Bannière AI Imagen 🎨'}</span>
              </div>

              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="DiaVet AI Welcome Banner"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover max-h-[200px] sm:max-h-[230px] transform group-hover:scale-105 transition-transform duration-500"
                />
              ) : isGenerating ? (
                <div className="w-full h-[180px] sm:h-[210px] bg-slate-900 flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-cyan-300">
                    {isRtl ? "جاري إنشاء البانيير الترحيبي الذكي..." : "Génération de votre bannière IA..."}
                  </span>
                </div>
              ) : (
                <div className="w-full h-[180px] sm:h-[210px] bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-3xl">🐾 🇩🇿</span>
                  <span className="text-xs font-bold text-white mt-1">DiaVet Algérie VIP Pass</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </motion.section>
  );
}
