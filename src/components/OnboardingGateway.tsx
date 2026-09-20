import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ShieldCheck, Heart, Stethoscope, MapPin, 
  Phone, User, ArrowRight, CheckCircle2, ChevronRight, 
  Lock, Mail, Building, KeyRound, AlertCircle, Award, Check,
  Languages
} from 'lucide-react';
import { ALGERIAN_WILAYAS } from '../data/mockData';
import { Language, UserProfile } from '../types';
import { translations } from '../data/translations';
import SuccessState from './SuccessState';
import DiaVetLogo from './DiaVetLogo';

interface OnboardingGatewayProps {
  currentLang?: Language;
  onSelectLang?: (lang: Language) => void;
  onRegister: (profile: Partial<UserProfile>, role: 'owner' | 'vet') => void;
}

export default function OnboardingGateway({ 
  currentLang = 'fr',
  onSelectLang,
  onRegister 
}: OnboardingGatewayProps) {
  const t = translations[currentLang] || translations.fr;
  const isRtl = currentLang === 'ar';

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<'owner' | 'vet'>('owner');

  // Step 1: Identity & Contact
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('16 - Alger');
  const [commune, setCommune] = useState('');

  // Step 2: Role Details (Owner)
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Chat');
  const [petBreed, setPetBreed] = useState('');
  const [petSex, setPetSex] = useState<'Mâle' | 'Femelle'>('Mâle');

  // Step 2: Role Details (Vet)
  const [clinicName, setClinicName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState('5 à 10 ans');

  // Step 3: Security & Agreement
  const [securityPin, setSecurityPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [agreedToCharter, setAgreedToCharter] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredProfile, setRegisteredProfile] = useState<Partial<UserProfile> | null>(null);

  // Validate Algerian Phone: 05, 06, 07 followed by 8 digits, or +213 format
  const isValidAlgerianPhone = (p: string) => {
    const cleaned = p.replace(/\s+/g, '').replace(/-/g, '');
    return /^(0[567][0-9]{8}|(\+213|00213)[567][0-9]{8})$/.test(cleaned);
  };

  const isValidEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  };

  const handleNextStep1 = () => {
    setError(null);
    if (!fullName.trim() || fullName.trim().length < 3) {
      setError(
        currentLang === 'ar'
          ? "يرجى كتابة الاسم واللقب الكامل (3 أحرف على الأقل)."
          : currentLang === 'en'
          ? "Please enter your full name (at least 3 characters)."
          : "Veuillez renseigner votre nom complet (au moins 3 caractères)."
      );
      return;
    }
    if (!isValidEmail(email)) {
      setError(
        currentLang === 'ar'
          ? "يرجى إدخال عنوان بريد إلكتروني صحيح."
          : currentLang === 'en'
          ? "Please provide a valid email address."
          : "Veuillez indiquer une adresse email valide."
      );
      return;
    }
    if (!isValidAlgerianPhone(phone)) {
      setError(
        currentLang === 'ar'
          ? "رقم هاتف جزائري غير صالح. أمثلة صالحة: 0550123456، 0661234567، 0770987654."
          : currentLang === 'en'
          ? "Invalid Algerian phone number. Valid examples: 0550123456, 0661234567, 0770987654."
          : "Numéro de téléphone algérien invalide. Exemples valides : 0550 12 34 56, 0661 23 45 67, 0770 98 76 54."
      );
      return;
    }
    if (!commune.trim() || commune.trim().length < 2) {
      setError(
        currentLang === 'ar'
          ? "يرجى تحديد البلدية أو المدينة."
          : currentLang === 'en'
          ? "Please specify your city or municipality."
          : "Veuillez indiquer votre commune ou ville de résidence."
      );
      return;
    }
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    setError(null);
    if (role === 'owner') {
      if (!petName.trim() || petName.trim().length < 2) {
        setError(
          currentLang === 'ar'
            ? "يرجى كتابة اسم حيوانك الأليف."
            : currentLang === 'en'
            ? "Please enter your pet's name."
            : "Veuillez indiquer le prénom de votre animal de compagnie."
        );
        return;
      }
      if (!petBreed.trim()) {
        setError(
          currentLang === 'ar'
            ? "يرجى تحديد السلالة أو النوع."
            : currentLang === 'en'
            ? "Please specify the breed or type."
            : "Veuillez préciser la race ou le type (ex: Européen, Berger, Croisé...)."
        );
        return;
      }
    } else {
      if (!clinicName.trim() || clinicName.trim().length < 3) {
        setError(
          currentLang === 'ar'
            ? "يرجى كتابة الاسم الرسمي للعيادة أو المصحة."
            : currentLang === 'en'
            ? "Please enter your official clinic or practice name."
            : "Veuillez renseigner le nom officiel de votre cabinet ou clinique."
        );
        return;
      }
      if (!clinicAddress.trim()) {
        setError(
          currentLang === 'ar'
            ? "يرجى كتابة عنوان مقر العيادة أو المدينة."
            : currentLang === 'en'
            ? "Please specify the clinic address or area."
            : "Veuillez préciser l'adresse ou la zone d'implantation de votre cabinet."
        );
        return;
      }
    }
    setCurrentStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!securityPin || securityPin.length < 4) {
      setError(
        currentLang === 'ar'
          ? "يرجى اختيار رمز PIN سري من 4 أرقام على الأقل."
          : currentLang === 'en'
          ? "Please choose a security PIN of at least 4 digits."
          : "Veuillez choisir un code PIN de sécurité d'au moins 4 chiffres pour protéger votre compte."
      );
      return;
    }
    if (securityPin !== confirmPin) {
      setError(
        currentLang === 'ar'
          ? "رمزا PIN غير متطابقين."
          : currentLang === 'en'
          ? "The security PIN codes do not match."
          : "Les codes PIN de sécurité ne correspondent pas."
      );
      return;
    }
    if (!agreedToCharter) {
      setError(
        currentLang === 'ar'
          ? "يجب الموافقة على صحة البيانات وميثاق DiaVet الجزائر."
          : currentLang === 'en'
          ? "You must certify the information and accept the DiaVet charter."
          : "Vous devez certifier l'exactitude des informations et accepter la charte DiaVet Algérie."
      );
      return;
    }

    setIsSubmitting(true);

    const isOwnerEmail = email.trim().toLowerCase() === 'mine.mine0100@gmail.com' || securityPin === '0100';

    const newProfile: Partial<UserProfile> = {
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      wilaya: wilaya,
      commune: commune.trim(),
      petName: role === 'owner' ? petName.trim() : undefined,
      petType: role === 'owner' ? petType : undefined,
      petBreed: role === 'owner' ? petBreed.trim() : undefined,
      petSex: role === 'owner' ? petSex : undefined,
      clinicName: role === 'vet' ? clinicName.trim() : undefined,
      orderNumber: role === 'vet' ? orderNumber.trim() : undefined,
      userRole: role,
      isVip: true,
      isOwner: isOwnerEmail,
      points: role === 'owner' ? 100 : 250,
      badgeTitle: role === 'owner' ? 'Membre Fondateur DiaVet DZ' : 'Docteur Vétérinaire Certifié DZ'
    };

    if (isOwnerEmail) {
      try {
        localStorage.setItem('diavet_is_owner', 'true');
      } catch (err) {
        console.error(err);
      }
    }

    setRegisteredProfile(newProfile);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 600);
  };

  const handleProceedToApp = () => {
    if (registeredProfile) {
      onRegister(registeredProfile, role);
    }
  };

  if (showSuccessModal && registeredProfile) {
    return (
      <SuccessState
        type="onboarding"
        currentLang={currentLang}
        userName={registeredProfile.name}
        petName={registeredProfile.petName}
        clinicName={registeredProfile.clinicName}
        role={role}
        vipCode={role === 'owner' ? 'DV-VIP-2026-DZ' : 'DV-VET-2026-DZ'}
        pointsEarned={role === 'owner' ? 100 : 250}
        onContinue={handleProceedToApp}
      />
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-3 sm:p-6 md:p-8 ${isRtl ? 'text-right' : 'text-left'}`}>
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-950/90 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20 backdrop-blur-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        
        {/* Glow ambient decorations */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar with Language Selector */}
        <div className="relative z-10 flex items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <DiaVetLogo size="sm" />
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
              {t.onboardingOfficialPortal}
            </span>
          </div>

          {/* Quick Language Switcher */}
          {onSelectLang && (
            <div className="flex items-center gap-1 bg-slate-900/90 border border-white/15 p-1 rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => onSelectLang('fr')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentLang === 'fr'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                FR 🇫🇷
              </button>
              <button
                type="button"
                onClick={() => onSelectLang('ar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentLang === 'ar'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                العربية 🇩🇿
              </button>
              <button
                type="button"
                onClick={() => onSelectLang('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentLang === 'en'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN 🇬🇧
              </button>
            </div>
          )}
        </div>

        {/* Title & Introduction with Mandatory Gating Notification */}
        <div className="relative z-10 text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-3 shadow-lg">
            <Lock className="w-3.5 h-3.5" />
            <span>{t.onboardingMandatoryNotice}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.onboardingTitle}
          </h1>
          <p className="text-sm font-semibold text-cyan-400 mt-1">
            {t.onboardingSubtitle}
          </p>
          <p className="text-xs text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
            {t.onboardingDesc}
          </p>

          {/* Locked Gift Perk Callout */}
          <div className="mt-3 p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 max-w-md mx-auto text-xs text-cyan-200 font-medium">
            <span>{t.onboardingGiftLockedNotice}</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="relative z-10 flex items-center justify-between mb-8 px-2 sm:px-6">
          {[
            { num: 1, label: t.onboardingStep1 },
            { num: 2, label: role === 'owner' ? t.onboardingStep2Owner : t.onboardingStep2Vet },
            { num: 3, label: t.onboardingStep3 }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-300 mx-auto ${
                  currentStep === s.num
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/40 ring-4 ring-cyan-500/20'
                    : currentStep > s.num
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'bg-slate-900 border border-white/10 text-slate-500'
                }`}>
                  {currentStep > s.num ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" /> : s.num}
                </div>
              </div>
              <span className={`text-[10px] sm:text-xs font-bold mt-2 text-center truncate max-w-[90px] sm:max-w-none ${
                currentStep >= s.num ? 'text-cyan-300' : 'text-slate-500'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Error notification banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mb-6 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-start gap-3 text-xs text-rose-200"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </motion.div>
        )}

        {/* STEPS CONTENT */}
        <div className="relative z-10">
          
          {/* STEP 1: Identity & Contact + Role selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
              className="space-y-4"
            >
              {/* Role Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  {t.onboardingRoleLabel}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                      role === 'owner'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-lg shadow-rose-500/20 ring-2 ring-rose-400/30'
                        : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${role === 'owner' ? 'text-rose-400 fill-rose-400' : ''}`} />
                    <span className="text-xs sm:text-sm font-black">{t.onboardingRoleOwner}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('vet')}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                      role === 'vet'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/30'
                        : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Stethoscope className={`w-4 h-4 ${role === 'vet' ? 'text-emerald-400' : ''}`} />
                    <span className="text-xs sm:text-sm font-black">{t.onboardingRoleVet}</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t.onboardingFullName}
                </label>
                <div className="relative">
                  <User className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={role === 'vet' ? t.onboardingFullNameVetPlaceholder : t.onboardingFullNameOwnerPlaceholder}
                    className={`w-full py-3 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm text-white placeholder-slate-500 transition-all ${
                      isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                    }`}
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.onboardingEmail}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@domaine.dz"
                      className={`w-full py-3 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm text-white placeholder-slate-500 transition-all ${
                        isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.onboardingPhone}
                  </label>
                  <div className="relative">
                    <Phone className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0550 12 34 56"
                      className={`w-full py-3 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm text-white placeholder-slate-500 transition-all ${
                        isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Wilaya & Commune */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.onboardingWilaya}
                  </label>
                  <div className="relative">
                    <MapPin className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                    <select
                      value={wilaya}
                      onChange={(e) => setWilaya(e.target.value)}
                      className={`w-full py-3 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-xs sm:text-sm text-white transition-all cursor-pointer ${
                        isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                      }`}
                    >
                      {ALGERIAN_WILAYAS.map((w) => (
                        <option key={w} value={w} className="bg-slate-900 text-white">
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.onboardingCommune}
                  </label>
                  <input
                    type="text"
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder={t.onboardingCommunePlaceholder}
                    className="w-full py-3 px-4 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm text-white placeholder-slate-500 transition-all"
                  />
                </div>
              </div>

              {/* Submit Step 1 Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleNextStep1}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>{t.onboardingBtnStep2}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Role Specific Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
              className="space-y-4"
            >
              {role === 'owner' ? (
                <>
                  {/* Animal Species */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {t.onboardingPetSpecies}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'Chat', icon: '🐱', label: t.cat },
                        { id: 'Chien', icon: '🐶', label: t.dog },
                        { id: 'Oiseau', icon: '🦜', label: t.bird },
                        { id: 'Cheval / Ferme', icon: '🐴', label: t.farm },
                        { id: 'NAC / Autre', icon: '🦎', label: t.reptile },
                      ].map((sp) => (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => setPetType(sp.id)}
                          className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                            petType === sp.id
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/30'
                              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-xl block mb-1">{sp.icon}</span>
                          <span className="text-[11px] font-bold block truncate">{sp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pet Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {t.onboardingPetName}
                    </label>
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder={t.onboardingPetNamePlaceholder}
                      className="w-full py-3 px-4 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm text-white placeholder-slate-500 transition-all"
                    />
                  </div>

                  {/* Pet Breed & Sex */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {t.onboardingPetBreed}
                      </label>
                      <input
                        type="text"
                        value={petBreed}
                        onChange={(e) => setPetBreed(e.target.value)}
                        placeholder={t.onboardingPetBreedPlaceholder}
                        className="w-full py-3 px-4 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm text-white placeholder-slate-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {t.onboardingPetSex}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPetSex('Mâle')}
                          className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                            petSex === 'Mâle'
                              ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t.onboardingMale}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPetSex('Femelle')}
                          className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                            petSex === 'Femelle'
                              ? 'bg-pink-500/20 border-pink-400 text-pink-200'
                              : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t.onboardingFemale}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Clinic Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {t.onboardingClinicName}
                    </label>
                    <div className="relative">
                      <Building className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                      <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder={t.onboardingClinicNamePlaceholder}
                        className={`w-full py-3 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm text-white placeholder-slate-500 transition-all ${
                          isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Experience & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {t.onboardingExperience}
                      </label>
                      <select
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full py-3 px-4 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm text-white transition-all cursor-pointer"
                      >
                        <option value="Moins de 2 ans" className="bg-slate-900 text-white">Moins de 2 ans</option>
                        <option value="2 à 5 ans" className="bg-slate-900 text-white">2 à 5 ans</option>
                        <option value="5 à 10 ans" className="bg-slate-900 text-white">5 à 10 ans</option>
                        <option value="Plus de 10 ans" className="bg-slate-900 text-white">Plus de 10 ans</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {t.onboardingClinicAddress}
                      </label>
                      <input
                        type="text"
                        value={clinicAddress}
                        onChange={(e) => setClinicAddress(e.target.value)}
                        placeholder={t.onboardingClinicAddressPlaceholder}
                        className="w-full py-3 px-4 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm text-white placeholder-slate-500 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Navigation buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="py-3 px-4 rounded-2xl bg-slate-900 border border-white/15 hover:bg-slate-850 text-slate-300 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  {t.onboardingBtnBack}
                </button>
                <button
                  type="button"
                  onClick={handleNextStep2}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>{t.onboardingBtnStep3}</span>
                  <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Security PIN & Charter Validation */}
          {currentStep === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                className="space-y-4"
              >
                {/* Security PIN Intro */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 flex items-start gap-3">
                  <KeyRound className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      {t.onboardingSecurityTitle}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      {t.onboardingSecurityDesc}
                    </p>
                  </div>
                </div>

                {/* PIN and Confirm PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {t.onboardingPinLabel}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                      <input
                        type="password"
                        maxLength={6}
                        value={securityPin}
                        onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className={`w-full py-3 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-center tracking-[0.4em] text-lg font-black text-white transition-all ${
                          isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {t.onboardingConfirmPinLabel}
                    </label>
                    <div className="relative">
                      <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                      <input
                        type="password"
                        maxLength={6}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className={`w-full py-3 rounded-2xl bg-slate-900/90 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-center tracking-[0.4em] text-lg font-black text-white transition-all ${
                          isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Charter Agreement */}
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/40 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToCharter}
                    onChange={(e) => setAgreedToCharter(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400/30 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    {t.onboardingCharterCheck}
                  </span>
                </label>

                {/* Points Benefit Badge */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{t.onboardingBonusReward}</span>
                  </span>
                  <span className="font-black text-white bg-amber-500/30 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                    +{role === 'owner' ? '100' : '250'} {t.onboardingBonusPoints}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="py-3.5 px-4 rounded-2xl bg-slate-900 border border-white/15 hover:bg-slate-850 text-slate-300 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    {t.onboardingBtnBack}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">{t.onboardingSubmitting}</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t.onboardingBtnSubmit}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
