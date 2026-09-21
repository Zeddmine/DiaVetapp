import { Language } from '../types';
import { translations } from '../data/translations';
import { ArrowRight, CheckCircle2, Stethoscope } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface SpacesSectionProps {
  currentLang: Language;
  userRole?: 'owner' | 'vet';
  onSelectOwner: () => void;
  onSelectVet: () => void;
}

export default function SpacesSection({
  currentLang,
  userRole = 'owner',
  onSelectOwner,
  onSelectVet
}: SpacesSectionProps) {
  const t = translations[currentLang] || translations.fr;
  const isAr = currentLang === 'ar';
  const isEn = currentLang === 'en';

  const handleSelectOwner = () => {
    soundEngine.playCyberClick();
    onSelectOwner();
  };

  const handleSelectVet = () => {
    soundEngine.playWarpSwitch();
    onSelectVet();
  };

  return (
    <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">
          {t.spacesSubheading || (isAr ? 'القطبان الرئيسيان لمنصة DiaVet الجزائر' : isEn ? 'The 2 Core Pillars of DiaVet Algeria' : 'Les 2 Pôles Majeurs DiaVet Algérie')}
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight">
          {t.spacesHeading || (isAr ? 'فضاء المربي وفضاء الطبيب البيطري Pro' : isEn ? 'Pet Owner Space & Pro Veterinary Space' : 'Espace Propriétaire & Espace Vétérinaire Pro')}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mt-3">
          {t.spacesDesc || (isAr ? 'منصة رقمية تجمع بين مربي الحيوانات والأطباء البيطريين في 58 ولاية جزائرية.' : isEn ? 'A bilateral digital platform connecting pet parents and veterinary doctors across all 58 Wilayas of Algeria.' : "Une plateforme bilatérale connectant propriétaires d'animaux et docteurs vétérinaires à travers les 58 Wilayas d'Algérie.")}
        </p>
      </div>

      {/* Grid of the 2 Spaces - Always Both Accessible */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
        
        {/* CARD 1: ESPACE PROPRIÉTAIRE (Cyan & Blue Neon) */}
        <div 
          id="space-owner-card"
          className="group relative rounded-[2.5rem] p-8 sm:p-10 border border-cyan-500/30 bg-slate-950/80 backdrop-blur-2xl overflow-hidden shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-400/60 transition-all duration-500 flex flex-col justify-between"
        >
          {/* Neon corner glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/25 transition-all"></div>
          
          {/* Subtle background pet watermark image */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-15 pointer-events-none overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=600" 
              alt="Dog companion" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
          </div>

          <div className="relative z-10">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <span>🐾</span>
              <span>{isAr ? 'فضاء المربي (VIP Pass)' : isEn ? 'Pet Owner Space (VIP Pass)' : 'Espace Propriétaire (Pass VIP)'}</span>
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mt-6 leading-tight">
              {t.ownerCardHeading}
            </h3>

            {/* Description */}
            <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed max-w-md">
              {t.ownerCardText}
            </p>

            {/* Feature Highlights */}
            <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{isAr ? 'دفتر صحي وتلقيحات ذكي وتنبيهات SMS' : isEn ? 'Smart digital health passport & vaccine SMS alerts' : 'Carnet de santé intelligent & rappels vaccinaux SMS'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{isAr ? 'حجز مواعيد بيطرية 24/7 في ولايتك' : isEn ? '24/7 online appointment booking in your Wilaya' : 'Prise de rendez-vous en ligne 24/7 dans votre wilaya'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{isAr ? 'طوارئ، نصائح الرعاية وصندوق الأفكار' : isEn ? 'Emergencies, care guides & community ideas box' : 'Urgences, conseils de garde & boîte à idées'}</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
            <button
              id="discover-owner-btn"
              onClick={handleSelectOwner}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 group-hover:scale-102 transition-all flex items-center justify-center sm:justify-start gap-2 cursor-pointer"
            >
              <span>{t.ownerCardAction}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 2: ESPACE VÉTÉRINAIRE (Emerald & Teal Neon) - ALWAYS VISIBLE */}
        <div 
          id="space-vet-card"
          className="group relative rounded-[2.5rem] p-8 sm:p-10 border border-emerald-500/30 bg-slate-950/80 backdrop-blur-2xl overflow-hidden shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-400/60 transition-all duration-500 flex flex-col justify-between"
        >
          {/* Neon corner glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all"></div>
          
          {/* Subtle background vet clinic watermark */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-15 pointer-events-none overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600" 
              alt="Veterinary practice" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
          </div>

          <div className="relative z-10">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'فضاء الطبيب البيطري (Pass Pro Clinique)' : isEn ? 'Veterinary Space (Pro Clinic Pass)' : 'Espace Vétérinaire (Pass Pro Clinique)'}</span>
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mt-6 leading-tight">
              {t.vetCardHeading}
            </h3>

            {/* Description */}
            <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed max-w-md">
              {t.vetCardText}
            </p>

            {/* Feature Highlights */}
            <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isAr ? 'ملفات طبية شاملة وسجل فحوصات زمني' : isEn ? 'Comprehensive patient charts & chronological health history' : 'Dossiers patients complets & fiches médicales chronologiques'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isAr ? 'مولد وصفات طبية رسمية مع رمز QR وختم' : isEn ? 'Official certified digital prescription generator with QR code' : "Générateur d'ordonnances homologuées avec QR code & cachet"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isAr ? 'وحدة تصوير طبي وأشعة وإحصائيات 58 ولاية' : isEn ? 'Medical imaging module, radiographs & 58 Wilayas statistics' : "Module d'imagerie, radiographies & statistiques 58 wilayas"}</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
            <button
              id="discover-vet-btn"
              onClick={handleSelectVet}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:scale-102 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center sm:justify-start gap-2 cursor-pointer font-black"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{t.vetSuiteAction || (isAr ? 'الدخول إلى المنظومة البيطرية Pro ←' : isEn ? 'Access Pro Veterinary Suite →' : 'Accéder à la Suite Vétérinaire Pro →')}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
