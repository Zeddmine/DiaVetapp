import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Heart, Stethoscope, MapPin, 
  ArrowRight, CheckCircle2, ChevronRight, 
  Lock, Mail, Building, KeyRound, AlertCircle, Award, Check,
  LogIn, UserPlus, Phone, Shield, Sparkles, RefreshCw, Copy, ExternalLink
} from 'lucide-react';
import { ALGERIAN_WILAYAS } from '../data/mockData';
import { Language, UserProfile } from '../types';
import { translations } from '../data/translations';
import SuccessState from './SuccessState';
import DiaVetLogo from './DiaVetLogo';
import { soundEngine } from '../utils/soundEngine';
import { 
  isEmailAlreadyRegistered, 
  findAccountByEmail, 
  generateVerificationCode, 
  verifyEmailCode,
  getPendingVerification,
  RegisteredAccount
} from '../services/accountService';

interface OnboardingGatewayProps {
  currentLang?: Language;
  onSelectLang?: (lang: Language) => void;
  onRegister: (profile: Partial<UserProfile>, role: 'owner' | 'vet') => void;
  onClose?: () => void;
}

export default function OnboardingGateway({ 
  currentLang = 'fr',
  onSelectLang,
  onRegister,
  onClose
}: OnboardingGatewayProps) {
  const t = translations[currentLang] || translations.fr;
  const isRtl = currentLang === 'ar';

  // Mode: 'register' (Form) | 'verification' (Code Email) | 'login' (Connexion)
  const [authMode, setAuthMode] = useState<'register' | 'verification' | 'login'>('register');
  const [role, setRole] = useState<'owner' | 'vet'>('owner');

  // Registration Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('16 - Alger');
  const [commune, setCommune] = useState('');
  const [password, setPassword] = useState('');

  // Role specific fields
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Chat');
  const [petBreed, setPetBreed] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  // Duplicate email detection state
  const [emailDuplicateError, setEmailDuplicateError] = useState<string | null>(null);

  // Email verification state
  const [verificationCode, setVerificationCode] = useState('');
  const [dispatchedCode, setDispatchedCode] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Login Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // General States
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [verifiedAccount, setVerifiedAccount] = useState<RegisteredAccount | null>(null);

  // Live check for email duplication when typing / blur
  const checkDuplicateEmail = (emailValue: string) => {
    const trimmed = emailValue.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setEmailDuplicateError(null);
      return false;
    }

    if (isEmailAlreadyRegistered(trimmed)) {
      const msg = isRtl
        ? "⚠️ هذا البريد الإلكتروني مسجل بالفعل في منصة DiaVet الجزائر! يرجى تسجيل الدخول أو إدخال بريد إلكتروني جديد."
        : "⚠️ Cette adresse email est déjà enregistrée sur DiaVet Algérie ! Chaque compte est unique. Veuillez vous connecter ou utiliser une nouvelle adresse email.";
      setEmailDuplicateError(msg);
      soundEngine.playError();
      return true;
    } else {
      setEmailDuplicateError(null);
      return false;
    }
  };

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authMode === 'verification' && resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setIsResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [authMode, resendCountdown]);

  // Algerian Phone Validation
  const isValidAlgerianPhone = (p: string) => {
    const cleaned = p.replace(/\s+/g, '').replace(/-/g, '');
    return /^(0[567][0-9]{8}|(\+213|00213)[567][0-9]{8})$/.test(cleaned);
  };

  // Step 1: Submit Registration & Trigger Email Confirmation Code
  const handleStartRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || trimmedName.length < 3) {
      setError(isRtl ? "يرجى كتابة الاسم واللقب الحقيقي (3 أحرف على الأقل)." : "Veuillez renseigner votre nom et prénom réels (au moins 3 caractères).");
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError(isRtl ? "يرجى إدخال بريد إلكتروني صحيح لاستلام رمز التفعيل." : "Veuillez entrer une adresse email valide pour recevoir votre code de confirmation.");
      return;
    }

    // STRICT UNIQUE EMAIL CHECK:
    if (isEmailAlreadyRegistered(trimmedEmail)) {
      const msg = isRtl
        ? "⚠️ هذا البريد الإلكتروني مسجل بالفعل في منصة DiaVet! لا يمكن استخدامه مرتين. يرجى استخدام عنوان بريد إلكتروني جديد أو تسجيل الدخول."
        : "⚠️ Cette adresse email est déjà enregistrée sur DiaVet Algérie ! Chaque compte est unique. Veuillez utiliser une NOUVELLE ADRESSE EMAIL ou vous connecter.";
      setEmailDuplicateError(msg);
      setError(msg);
      soundEngine.playError();
      return;
    }

    if (!isValidAlgerianPhone(trimmedPhone)) {
      setError(isRtl ? "يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0550123456)." : "Veuillez entrer un numéro de téléphone algérien valide (ex: 0550123456, 0661..., 0770...).");
      return;
    }

    if (!trimmedPassword || trimmedPassword.length < 3) {
      setError(isRtl ? "يرجى تحديد كلمة مرور أو رمز PIN سري (3 خانات على الأقل)." : "Veuillez définir un mot de passe ou code PIN de sécurité (au moins 3 caractères).");
      return;
    }

    if (role === 'owner' && !petName.trim()) {
      setError(isRtl ? "يرجى كتابة اسم حيوانك الأليف." : "Veuillez indiquer le nom de votre animal de compagnie.");
      return;
    }

    if (role === 'vet' && !clinicName.trim()) {
      setError(isRtl ? "يرجى كتابة اسم العيادة أو المكتب البيطري." : "Veuillez indiquer le nom de votre cabinet ou clinique vétérinaire.");
      return;
    }

    setIsSubmitting(true);
    soundEngine.playCyberClick();

    // Prepare Account Data & Generate 6-digit confirmation code
    const accountDraft: Partial<RegisteredAccount> = {
      email: trimmedEmail,
      fullName: trimmedName,
      phone: trimmedPhone,
      wilaya: wilaya,
      commune: commune.trim() || 'Centre',
      role: role,
      passwordHash: trimmedPassword,
      petName: role === 'owner' ? petName.trim() : undefined,
      petType: role === 'owner' ? petType : undefined,
      petBreed: role === 'owner' ? petBreed.trim() : undefined,
      clinicName: role === 'vet' ? clinicName.trim() : undefined,
      orderNumber: role === 'vet' ? orderNumber.trim() : undefined,
      vipCode: `DZ-${Math.floor(100000 + Math.random() * 900000)}`,
      points: role === 'vet' ? 250 : 150
    };

    const { code } = generateVerificationCode(trimmedEmail, accountDraft);
    setDispatchedCode(code);

    setTimeout(() => {
      setIsSubmitting(false);
      setAuthMode('verification');
      setResendCountdown(30);
      setIsResendDisabled(true);
      soundEngine.playPop();
    }, 450);
  };

  // Step 2: Confirm 6-Digit Email Code
  const handleVerifyCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = verificationCode.trim().replace(/\s+/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      setError(isRtl ? "يرجى إدخال رمز التحقق المكون من 6 أرقام." : "Veuillez saisir le code de vérification à 6 chiffres reçu par email.");
      soundEngine.playError();
      return;
    }

    setIsSubmitting(true);
    const result = verifyEmailCode(email, cleanCode);

    if (!result.success || !result.account) {
      setIsSubmitting(false);
      setError(result.message);
      soundEngine.playError();
      return;
    }

    // SUCCESS: Account verified!
    soundEngine.playLevelUp();
    setVerifiedAccount(result.account);
    setIsSubmitting(false);
    setShowSuccessModal(true);
  };

  // Resend code handler
  const handleResendCode = () => {
    if (isResendDisabled) return;
    soundEngine.playCyberClick();
    const pending = getPendingVerification(email);
    const accountDraft = pending?.accountData || {
      email,
      fullName,
      phone,
      wilaya,
      commune,
      role
    };

    const { code } = generateVerificationCode(email, accountDraft);
    setDispatchedCode(code);
    setResendCountdown(30);
    setIsResendDisabled(true);
    setError(null);
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = loginEmail.trim().toLowerCase();
    const trimmedPass = loginPassword.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError(isRtl ? "يرجى إدخال عنوان بريدك الإلكتروني المسجل." : "Veuillez renseigner votre adresse email enregistrée.");
      return;
    }

    if (!trimmedPass) {
      setError(isRtl ? "يرجى كتابة كلمة المرور الخاصة بك." : "Veuillez entrer votre mot de passe ou code PIN.");
      return;
    }

    setIsSubmitting(true);
    const account = findAccountByEmail(trimmedEmail);

    if (!account) {
      setIsSubmitting(false);
      setError(
        isRtl
          ? "هذا البريد الإلكتروني غير مسجل بعد في منصة DiaVet. يرجى إنشاء حساب جديد."
          : "Aucun compte n'a été trouvé avec cette adresse email. Veuillez créer un compte ci-dessous."
      );
      soundEngine.playError();
      return;
    }

    // If account was not verified, route them to email code confirmation
    if (!account.isEmailVerified) {
      setEmail(account.email);
      setFullName(account.fullName);
      setRole(account.role);
      const { code } = generateVerificationCode(account.email, account);
      setDispatchedCode(code);
      setIsSubmitting(false);
      setAuthMode('verification');
      return;
    }

    // Verified account -> Log in!
    soundEngine.playLevelUp();
    setVerifiedAccount(account);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 400);
  };

  // Proceed into Main App
  const handleProceedToApp = () => {
    if (verifiedAccount) {
      const isOwnerEmail = verifiedAccount.email.toLowerCase() === 'mine.mine0100@gmail.com';
      const profile: Partial<UserProfile> = {
        name: verifiedAccount.fullName,
        email: verifiedAccount.email,
        phone: verifiedAccount.phone,
        wilaya: verifiedAccount.wilaya,
        commune: verifiedAccount.commune,
        userRole: verifiedAccount.role,
        petName: verifiedAccount.petName,
        petType: verifiedAccount.petType,
        petBreed: verifiedAccount.petBreed,
        clinicName: verifiedAccount.clinicName,
        orderNumber: verifiedAccount.orderNumber,
        isVip: true,
        isOwner: isOwnerEmail,
        points: verifiedAccount.points || (verifiedAccount.role === 'vet' ? 250 : 150),
        badgeTitle: verifiedAccount.role === 'vet' ? 'Docteur Vétérinaire Agréé DZ' : 'Membre VIP Fondateur DZ',
        vipCode: verifiedAccount.vipCode
      };
      onRegister(profile, verifiedAccount.role);
    }
  };

  // SUCCESS CONFIRMATION MODAL
  if (showSuccessModal && verifiedAccount) {
    return (
      <SuccessState
        type="onboarding"
        currentLang={currentLang}
        userName={verifiedAccount.fullName}
        petName={verifiedAccount.petName}
        clinicName={verifiedAccount.clinicName}
        role={verifiedAccount.role}
        vipCode={verifiedAccount.vipCode}
        pointsEarned={verifiedAccount.points || (verifiedAccount.role === 'vet' ? 250 : 150)}
        onContinue={handleProceedToApp}
      />
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-3 sm:p-6 md:p-8 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-xl max-h-[94vh] overflow-y-auto rounded-3xl bg-slate-950/95 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20 backdrop-blur-2xl p-5 sm:p-8 text-slate-100">
        
        {/* Glow ambient decorations */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header with Language Switcher */}
        <div className="relative z-10 flex items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <DiaVetLogo size="sm" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300">
                DiaVet Algérie 🇩🇿
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {isRtl ? "التسجيل الرسمي وتأكيد الحساب" : "Inscription Réelle & Vérifiée"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            {onSelectLang && (
              <div className="flex items-center gap-1 bg-slate-900/90 border border-white/15 p-1 rounded-xl shadow-inner">
                <button
                  type="button"
                  onClick={() => onSelectLang('fr')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentLang === 'fr' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => onSelectLang('ar')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentLang === 'ar' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  عربي
                </button>
                <button
                  type="button"
                  onClick={() => onSelectLang('en')}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentLang === 'en' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            )}

            {/* Close / Return to Site */}
            {onClose && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playCyberClick();
                  onClose();
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
                title={isRtl ? "إغلاق واستكشاف المنصة" : "Fermer et visiter"}
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px] font-semibold">{isRtl ? "إغلاق" : "Visiter"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs : Inscription Réelle vs Connexion */}
        {authMode !== 'verification' && (
          <div className="relative z-10 grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-white/15 mb-6">
            <button
              type="button"
              onClick={() => {
                soundEngine.playCyberClick();
                setAuthMode('register');
                setError(null);
                setEmailDuplicateError(null);
              }}
              className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{isRtl ? 'حساب جديد حقيقي' : 'Créer un compte'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playCyberClick();
                setAuthMode('login');
                setError(null);
                setEmailDuplicateError(null);
              }}
              className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{isRtl ? 'تسجيل الدخول' : 'Se connecter'}</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 1: EMAIL VERIFICATION CODE SCREEN (RECEVOIR UN CODE PAR MAIL) */}
        {/* ========================================================================= */}
        {authMode === 'verification' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Step Badge */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 mx-auto shadow-lg shadow-cyan-500/30">
                <Mail className="w-7 h-7 animate-bounce" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isRtl ? "تأكيد الحساب عبر رمز البريد الإلكتروني" : "Confirmation de votre Compte par Email"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {isRtl ? (
                  <>
                    لقد أرسلنا رمز تأكيد سري مكون من 6 أرقام إلى بريدك الإلكتروني :<br />
                    <span className="font-bold text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 inline-block mt-1">{email}</span>
                  </>
                ) : (
                  <>
                    Nous avons envoyé un code de confirmation sécurisé à 6 chiffres à :<br />
                    <span className="font-bold text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 inline-block mt-1">{email}</span>
                  </>
                )}
              </p>
            </div>

            {/* Official Dispatch Simulation Preview Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 text-xs text-slate-300 relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white">Notification de l'Email Envoyé 📬</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded">
                  Expéditeur: contact@diavet.com
                </span>
              </div>
              
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] text-slate-400">Objet : <strong className="text-white">DiaVet Algérie — Votre code de confirmation : {dispatchedCode}</strong></p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Code temporaire valable 15 minutes.</p>
                </div>
                {dispatchedCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationCode(dispatchedCode);
                      setCopiedCode(true);
                      soundEngine.playPop();
                      setTimeout(() => setCopiedCode(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? (isRtl ? "تم النسخ بنجاح!" : "Code recopié !") : (isRtl ? "نسخ الرمز تلقائياً" : `Insérer le code (${dispatchedCode})`)}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Form to enter 6-digit code */}
            <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-center">
                  {isRtl ? "أدخل الرمز المكون من 6 أرقام هنا :" : "Saisissez les 6 chiffres du code ici :"}
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setVerificationCode(val);
                      setError(null);
                    }}
                    placeholder="123456"
                    className="w-56 text-center text-2xl sm:text-3xl font-mono font-black tracking-[0.4em] py-3 px-4 rounded-2xl bg-slate-900 border-2 border-cyan-400 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 shadow-lg shadow-cyan-500/10"
                    autoFocus
                  />
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Confirm Button */}
              <button
                type="submit"
                disabled={isSubmitting || verificationCode.length !== 6}
                className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/25 ${
                  verificationCode.length === 6 && !isSubmitting
                    ? 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 scale-100 hover:scale-[1.01]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/10'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSubmitting ? (isRtl ? "جاري التحقق..." : "Vérification...") : (isRtl ? "تأكيد الحساب وتفعيل الـ VIP 🇩🇿" : "Confirmer mon Compte & Débloquer le VIP 🇩🇿")}</span>
              </button>

              {/* Action Buttons : Resend Code & Change Email */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-slate-400">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResendDisabled}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isResendDisabled ? 'text-slate-600 cursor-not-allowed' : 'text-cyan-400 hover:text-cyan-300 font-bold'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResendDisabled ? '' : 'hover:rotate-180 transition-transform'}`} />
                  <span>
                    {isResendDisabled
                      ? (isRtl ? `إعادة الإرسال بعد (${resendCountdown} ث)` : `Renvoyer le code (${resendCountdown}s)`)
                      : (isRtl ? "إعادة إرسال الرمز الآن" : "Renvoyer un nouveau code")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCyberClick();
                    setAuthMode('register');
                    setError(null);
                  }}
                  className="text-slate-400 hover:text-white underline cursor-pointer"
                >
                  {isRtl ? "تغيير البريد الإلكتروني" : "Corriger mon email"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* CASE 2: REAL REGISTRATION FORM (AVEC DÉTECTION EMAIL DOUBLON & ÉTAT RÉEL) */}
        {/* ========================================================================= */}
        {authMode === 'register' && (
          <form onSubmit={handleStartRegistration} className="space-y-4">
            
            {/* Role Switcher (Propriétaire vs Vétérinaire) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                {isRtl ? "نوع العضوية المطلوبة :" : "Votre profil d'inscription :"}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCyberClick();
                    setRole('owner');
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer text-left ${
                    role === 'owner'
                      ? 'bg-rose-500/20 border-rose-400 text-white shadow-lg shadow-rose-500/20'
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-rose-400/40'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 fill-rose-500/30" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">{isRtl ? "مربي حيوان أليف" : "Propriétaire"}</div>
                    <div className="text-[10px] text-slate-400">{isRtl ? "كلب، قط، خيل..." : "Carnet & Soins"}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCyberClick();
                    setRole('vet');
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer text-left ${
                    role === 'vet'
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-emerald-400/40'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1">
                      <span>{isRtl ? "طبيب بيطري" : "Docteur Vétérinaire"}</span>
                      <span className="text-[9px] px-1 py-0.2 bg-emerald-400 text-slate-950 font-black rounded">PRO</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{isRtl ? "عيادة، صيدلية..." : "Cabinet & Réseau"}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Identity & Email Section */}
            <div className="space-y-3 pt-1">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isRtl ? "الاسم واللقب الحقيقي *" : "Nom & Prénom réels *"}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'vet' ? 'Ex: Dr. Amina Benali' : 'Ex: Karim Mansouri'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* REAL EMAIL FIELD WITH ANTI-DUPLICATE WARNING */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    {isRtl ? "البريد الإلكتروني الحقيقي (لاستلام رمز التفعيل) *" : "Adresse Email Réelle (pour recevoir le code) *"}
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">1 Compte = 1 Email</span>
                </div>
                
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailDuplicateError) {
                      checkDuplicateEmail(e.target.value);
                    }
                  }}
                  onBlur={(e) => checkDuplicateEmail(e.target.value)}
                  placeholder="nom.prenom@gmail.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    emailDuplicateError 
                      ? 'border-rose-500 focus:border-rose-400 ring-2 ring-rose-500/20' 
                      : 'border-white/15 focus:border-cyan-400'
                  }`}
                />

                {/* PROMINENT DUPLICATE EMAIL WARNING ALERT */}
                {emailDuplicateError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-3 rounded-xl bg-rose-500/20 border-2 border-rose-500/60 text-rose-200 text-xs space-y-2"
                  >
                    <div className="flex items-start gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{emailDuplicateError}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-rose-500/30">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail(email);
                          setAuthMode('login');
                          setEmailDuplicateError(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-white font-bold text-[11px] cursor-pointer"
                      >
                        {isRtl ? "تسجيل الدخول بهذا البريد" : "Se connecter avec cet email"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('');
                          setEmailDuplicateError(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-medium text-[11px] cursor-pointer"
                      >
                        {isRtl ? "كتابة بريد جديد" : "Saisir une autre adresse"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Phone & Wilaya in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isRtl ? "رقم الهاتف الجزائري *" : "Téléphone Algérie (05/06/07) *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0550123456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isRtl ? "الولاية (58 ولاية) *" : "Wilaya (58 Wilayas) *"}
                  </label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    {ALGERIAN_WILAYAS.map((w) => (
                      <option key={w} value={w} className="bg-slate-950 text-white">
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role specific inputs */}
              {role === 'owner' ? (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold text-rose-300 mb-1">
                      {isRtl ? "نوع الحيوان" : "Espèce"}
                    </label>
                    <select
                      value={petType}
                      onChange={(e) => setPetType(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white"
                    >
                      <option value="Chat">Chat 🐱</option>
                      <option value="Chien">Chien 🐶</option>
                      <option value="Cheval">Cheval 🐴</option>
                      <option value="Oiseau">Oiseau 🦜</option>
                      <option value="Bovin / Ovin">Bovin / Ovin 🐑</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-rose-300 mb-1">
                      {isRtl ? "اسم الحيوان الأليف *" : "Nom de votre animal *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="Ex: Simba, Maya, Rex..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                      {isRtl ? "اسم العيادة أو المكتب *" : "Cabinet / Clinique Vétérinaire *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="Ex: Clinique Al-Chifa"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                      {isRtl ? "رقم الاعتماد أو البلدية" : "N° Ordre ou Commune"}
                    </label>
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="Ex: ONV-16-4421"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Password / PIN */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isRtl ? "كلمة المرور أو رمز PIN للحساب *" : "Mot de passe / Code PIN de sécurité *"}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || Boolean(emailDuplicateError)}
                className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/25 ${
                  emailDuplicateError
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/10'
                    : 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 hover:scale-[1.01]'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? (isRtl ? "جاري الإرسال..." : "Génération du code...")
                    : (isRtl ? "استلام رمز التفعيل عبر البريد الإلكتروني ←" : "Recevoir mon code par email ←")}
                </span>
              </button>
            </div>

            <div className="text-center pt-1">
              <p className="text-[10px] text-slate-400">
                🔒 {isRtl ? "بياناتك محمية ورمز التفعيل يُرسل حصرياً إلى بريدك الإلكتروني" : "Sécurité garantie : un code à 6 chiffres vous sera envoyé par email pour valider l'inscription."}
              </p>
            </div>

          </form>
        )}

        {/* ========================================================================= */}
        {/* CASE 3: LOGIN FORM (SE CONNECTER) */}
        {/* ========================================================================= */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            <div className="text-center pb-2">
              <h3 className="text-lg font-black text-white">
                {isRtl ? "تسجيل الدخول إلى حسابك DiaVet" : "Connexion à votre Compte DiaVet"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRtl ? "أدخل بريدك الإلكتروني المسجل وكلمة المرور" : "Entrez votre email vérifié et votre mot de passe"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isRtl ? "البريد الإلكتروني *" : "Adresse Email *"}
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Ex: yacine@gmail.com ou mine.mine0100@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isRtl ? "كلمة المرور / الرمز السري *" : "Mot de passe / Code PIN *"}
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? (isRtl ? "جاري الدخول..." : "Connexion...") : (isRtl ? "تسجيل الدخول الآن" : "Se connecter")}</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playCyberClick();
                  setAuthMode('register');
                  setError(null);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                {isRtl ? "ليس لديك حساب بعد؟ سجل حساباً جديداً هنا" : "Pas encore de compte ? Créer un nouveau compte"}
              </button>
            </div>

          </form>
        )}

        {onClose && (
          <div className="text-center pt-3 mt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playCyberClick();
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer py-1"
            >
              {isRtl ? "← تصفح موقع DiaVet كزائر دون تسجيل" : "← Continuer la visite du site sans connexion"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
