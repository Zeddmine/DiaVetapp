import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Heart, Stethoscope, MapPin, 
  ArrowRight, CheckCircle2, ChevronRight, 
  Lock, Mail, Building, KeyRound, AlertCircle, Award, Check,
  LogIn, UserPlus, Phone, Shield, Sparkles, RefreshCw, Copy, ExternalLink,
  Save, RotateCcw, CheckCircle, AlertTriangle
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
import { 
  getRegistrationSchema, 
  validateField, 
  extractZodError,
  getPasswordStrength, 
  isValidAlgerianPhone 
} from '../lib/validation';
import { generateWelcomeBanner } from '../services/aiBannerService';

const DRAFT_STORAGE_KEY = 'diavet_onboarding_form_draft_v1';

interface FormDraftData {
  authMode?: 'register' | 'verification' | 'login';
  role?: 'owner' | 'vet';
  fullName?: string;
  email?: string;
  phone?: string;
  wilaya?: string;
  commune?: string;
  password?: string;
  petName?: string;
  petType?: string;
  petBreed?: string;
  clinicName?: string;
  orderNumber?: string;
  verificationCode?: string;
  dispatchedCode?: string | null;
  savedAt?: string;
}

const getStoredDraft = (): FormDraftData | null => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

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
  const isEn = currentLang === 'en';

  const initialDraft = getStoredDraft();

  // Mode: 'register' (Form) | 'verification' (Code Email) | 'login' (Connexion)
  const [authMode, setAuthMode] = useState<'register' | 'verification' | 'login'>(initialDraft?.authMode || 'register');
  const [role, setRole] = useState<'owner' | 'vet'>(initialDraft?.role || 'owner');

  // Registration Fields with autosave initial values
  const [fullName, setFullName] = useState(initialDraft?.fullName || '');
  const [email, setEmail] = useState(initialDraft?.email || '');
  const [phone, setPhone] = useState(initialDraft?.phone || '');
  const [wilaya, setWilaya] = useState(initialDraft?.wilaya || '16 - Alger');
  const [commune, setCommune] = useState(initialDraft?.commune || '');
  const [password, setPassword] = useState(initialDraft?.password || '');

  // Role specific fields
  const [petName, setPetName] = useState(initialDraft?.petName || '');
  const [petType, setPetType] = useState(initialDraft?.petType || 'Chat');
  const [petBreed, setPetBreed] = useState(initialDraft?.petBreed || '');
  const [clinicName, setClinicName] = useState(initialDraft?.clinicName || '');
  const [orderNumber, setOrderNumber] = useState(initialDraft?.orderNumber || '');

  // Duplicate email detection state
  const [emailDuplicateError, setEmailDuplicateError] = useState<string | null>(null);

  // Email verification state
  const [verificationCode, setVerificationCode] = useState(initialDraft?.verificationCode || '');
  const [dispatchedCode, setDispatchedCode] = useState<string | null>(initialDraft?.dispatchedCode || null);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // AI Welcome Banner Generation state
  const [aiBannerUrl, setAiBannerUrl] = useState<string | null>(null);
  const [isGeneratingBanner, setIsGeneratingBanner] = useState<boolean>(false);

  // Autosave indicators
  const [hasRestoredDraft, setHasRestoredDraft] = useState(Boolean(initialDraft && (initialDraft.fullName || initialDraft.email || initialDraft.phone)));
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(initialDraft?.savedAt ? new Date(initialDraft.savedAt).toLocaleTimeString() : null);

  // Field touched states for real-time validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // Real-time Zod validations
  const nameValidation = validateField('fullName', fullName, currentLang);
  const emailValidation = validateField('email', email, currentLang);
  const phoneValidation = validateField('phone', phone, currentLang);
  const passwordValidation = validateField('password', password, currentLang);
  const passwordStrength = getPasswordStrength(password);

  // Login Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // General States
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [verifiedAccount, setVerifiedAccount] = useState<RegisteredAccount | null>(null);

  // Continuous Autosave effect to localStorage
  useEffect(() => {
    const hasData = Boolean(
      fullName.trim() || 
      email.trim() || 
      phone.trim() || 
      petName.trim() || 
      clinicName.trim() || 
      commune.trim() || 
      password.trim() || 
      verificationCode.trim()
    );

    if (hasData) {
      const now = new Date();
      const draft: FormDraftData = {
        authMode,
        role,
        fullName,
        email,
        phone,
        wilaya,
        commune,
        password,
        petName,
        petType,
        petBreed,
        clinicName,
        orderNumber,
        verificationCode,
        dispatchedCode,
        savedAt: now.toISOString()
      };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setLastSavedTimestamp(now.toLocaleTimeString(isRtl ? 'ar-DZ' : isEn ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.warn('Autosave to localStorage failed:', err);
      }
    }
  }, [
    authMode, role, fullName, email, phone, wilaya, commune, 
    password, petName, petType, petBreed, clinicName, orderNumber, 
    verificationCode, dispatchedCode, isRtl, isEn
  ]);

  // Clear draft helper
  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setFullName('');
    setEmail('');
    setPhone('');
    setWilaya('16 - Alger');
    setCommune('');
    setPassword('');
    setPetName('');
    setPetType('Chat');
    setPetBreed('');
    setClinicName('');
    setOrderNumber('');
    setVerificationCode('');
    setDispatchedCode(null);
    setHasRestoredDraft(false);
    setLastSavedTimestamp(null);
    setError(null);
    setEmailDuplicateError(null);
    soundEngine.playPop();
  };

  // Live check for existing account suggestion
  const checkDuplicateEmail = (emailValue: string) => {
    const trimmed = emailValue.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setEmailDuplicateError(null);
      return false;
    }

    if (isEmailAlreadyRegistered(trimmed)) {
      const msg = isRtl
        ? "⚠️ هذا البريد الإلكتروني مستعمل بالفعل! يرجى تجربة بريد إلكتروني آخر أو تسجيل الدخول إلى حسابك."
        : isEn
        ? "⚠️ This email address is already in use! Please try another email address or log in to your account."
        : "⚠️ Cette adresse e-mail est déjà utilisée ! Veuillez essayer une autre boîte mail ou vous connecter à votre compte.";
      setEmailDuplicateError(msg);
      return true;
    } else {
      setEmailDuplicateError(null);
      return false;
    }
  };

  // Language switch re-evaluator
  useEffect(() => {
    if (email) {
      checkDuplicateEmail(email);
    }
  }, [currentLang]);

  const handleLanguageChange = (newLang: Language) => {
    soundEngine.playCyberClick();
    if (onSelectLang) {
      onSelectLang(newLang);
    }
    setError(null);
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

  // Smart Algerian Phone Normalization & Validation
  const sanitizePhone = (raw: string): string => {
    return raw.replace(/[\s\-\.\(\)\/]/g, '');
  };

  const isValidPhone = (raw: string): boolean => {
    const cleaned = sanitizePhone(raw);
    if (!cleaned) return false;
    // Mobile: 05, 06, 07 (10 digits) or +2135/6/7 (12 digits) or 9 digits (5/6/7)
    // Landlines: 021, 023, 031, 041, etc. (9-10 digits)
    return /^(0[2-9][0-9]{7,8}|(\+213|00213)[2-9][0-9]{7,8}|[567][0-9]{8})$/.test(cleaned);
  };

  // Step 1: Submit Registration & Trigger Email Confirmation Code
  const handleStartRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mark all core fields as touched to show immediate visual feedback
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      wilaya: true
    });

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const cleanedPhone = sanitizePhone(phone.trim());
    const normalizedPhone = cleanedPhone.startsWith('0') 
      ? cleanedPhone 
      : cleanedPhone.startsWith('+213') || cleanedPhone.startsWith('00213')
      ? cleanedPhone
      : cleanedPhone.length === 9 ? `0${cleanedPhone}` : cleanedPhone;
    const trimmedPassword = password.trim() || '123456';

    const schema = getRegistrationSchema(currentLang);
    const parseResult = schema.safeParse({
      fullName: trimmedName,
      email: trimmedEmail,
      phone: normalizedPhone,
      wilaya: wilaya,
      password: trimmedPassword,
      role: role,
      petName: petName.trim(),
      petType: petType,
      clinicName: clinicName.trim(),
      orderNumber: orderNumber.trim()
    });

    if (!parseResult.success) {
      const defaultMsg = isRtl ? "يرجى تصحيح الأخطاء في النموذج." : isEn ? "Please fix the input errors in the form." : "Veuillez corriger les erreurs de saisie.";
      const firstError = extractZodError(parseResult, defaultMsg);
      setError(firstError);
      soundEngine.playError();
      return;
    }

    // Strict Unique Email Enforcement
    if (isEmailAlreadyRegistered(trimmedEmail)) {
      setError(
        isRtl
          ? `⚠️ البريد الإلكتروني (${trimmedEmail}) مستعمل بالفعل! يرجى تجربة علبة بريد أخرى أو تسجيل الدخول.`
          : isEn
          ? `⚠️ The email address (${trimmedEmail}) is already in use! Please try another email box or log in.`
          : `⚠️ L'adresse e-mail (${trimmedEmail}) est déjà utilisée ! Veuillez essayer une autre boîte mail ou vous connecter.`
      );
      soundEngine.playError();
      return;
    }

    setIsSubmitting(true);
    soundEngine.playCyberClick();

    const finalPetName = role === 'owner' ? (petName.trim() || (isRtl ? 'سيمبا' : isEn ? 'Simba' : 'Mon Compagnon')) : undefined;
    const finalClinicName = role === 'vet' ? (clinicName.trim() || (isRtl ? 'عيادة بيطرية معتمدة' : isEn ? 'Certified Veterinary Clinic' : 'Cabinet Vétérinaire Agréé')) : undefined;

    // Prepare Account Data & Generate 6-digit confirmation code
    const accountDraft: Partial<RegisteredAccount> = {
      email: trimmedEmail,
      fullName: trimmedName,
      phone: normalizedPhone || '0550000000',
      wilaya: wilaya,
      commune: commune.trim() || 'Centre',
      role: role,
      passwordHash: trimmedPassword,
      petName: finalPetName,
      petType: role === 'owner' ? petType : undefined,
      petBreed: role === 'owner' ? petBreed.trim() : undefined,
      clinicName: finalClinicName,
      orderNumber: role === 'vet' ? (orderNumber.trim() || 'ONV-DZ-2026') : undefined,
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
    }, 400);
  };

  // Step 2: Confirm 6-Digit Email Code
  const handleVerifyCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = verificationCode.trim().replace(/\s+/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      setError(
        isRtl 
          ? "يرجى إدخال رمز التحقق المكون من 6 أرقام." 
          : isEn 
          ? "Please enter the 6-digit verification code received by email." 
          : "Veuillez saisir le code de vérification à 6 chiffres reçu par email."
      );
      soundEngine.playError();
      return;
    }

    setIsSubmitting(true);
    const result = verifyEmailCode(email, cleanCode, currentLang);

    if (!result.success || !result.account) {
      setIsSubmitting(false);
      setError(result.message);
      soundEngine.playError();
      return;
    }

    // SUCCESS: Account verified!
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    soundEngine.playLevelUp();
    setVerifiedAccount(result.account);
    setIsGeneratingBanner(true);

    // Trigger AI Welcome Banner generation via Imagen / Canvas Service
    const name = result.account.fullName;
    const accountRole = result.account.role;
    const petOrClinic = accountRole === 'vet' ? result.account.clinicName : result.account.petName;

    generateWelcomeBanner(name, accountRole, petOrClinic)
      .then((bannerUrl) => {
        setAiBannerUrl(bannerUrl);
        setIsGeneratingBanner(false);
        setIsSubmitting(false);
        setShowSuccessModal(true);
      })
      .catch((err) => {
        console.warn("AI Banner Generation error:", err);
        setIsGeneratingBanner(false);
        setIsSubmitting(false);
        setShowSuccessModal(true);
      });
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
      setError(
        isRtl 
          ? "يرجى إدخال عنوان بريدك الإلكتروني المسجل." 
          : isEn 
          ? "Please enter your registered email address." 
          : "Veuillez renseigner votre adresse email enregistrée."
      );
      return;
    }

    if (!trimmedPass) {
      setError(
        isRtl 
          ? "يرجى كتابة كلمة المرور الخاصة بك." 
          : isEn 
          ? "Please enter your password or PIN code." 
          : "Veuillez entrer votre mot de passe ou code PIN."
      );
      return;
    }

    setIsSubmitting(true);
    const account = findAccountByEmail(trimmedEmail);

    if (!account) {
      setIsSubmitting(false);
      setError(
        isRtl
          ? "هذا البريد الإلكتروني غير مسجل بعد في منصة DiaVet. يرجى إنشاء حساب جديد."
          : isEn
          ? "No account found with this email address. Please create an account below."
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
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    soundEngine.playLevelUp();
    setVerifiedAccount(account);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 400);
  };

  // Proceed into Main App
  const handleProceedToApp = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    if (verifiedAccount) {
      const isOwnerEmail = verifiedAccount.email.toLowerCase() === 'mine.mine0100@gmail.com' || verifiedAccount.email.toLowerCase().endsWith('@diavet.dz') || verifiedAccount.email.toLowerCase().includes('admin');
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
        badgeTitle: verifiedAccount.role === 'vet' 
          ? (isRtl ? 'طبيب بيطري معتمد في الجزائر' : isEn ? 'Licensed DZ Veterinarian' : 'Docteur Vétérinaire Agréé DZ') 
          : (isRtl ? 'عضو VIP مؤسس بالجزائر' : isEn ? 'DZ Founding VIP Member' : 'Membre VIP Fondateur DZ'),
        vipCode: verifiedAccount.vipCode,
        welcomeBannerUrl: aiBannerUrl || undefined
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
        welcomeBannerUrl={aiBannerUrl || undefined}
        pointsEarned={verifiedAccount.points || (verifiedAccount.role === 'vet' ? 250 : 150)}
        onContinue={handleProceedToApp}
      />
    );
  }

  return (
    <div className={`w-full flex items-center justify-center p-2 sm:p-4 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-slate-950/95 border border-cyan-500/40 sm:border-2 shadow-2xl shadow-cyan-500/20 backdrop-blur-2xl p-4 sm:p-7 text-slate-100">
        
        {/* Glow ambient decorations */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header with Prominent, Simple Language Switcher */}
        <div className="relative z-10 flex items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <DiaVetLogo size="sm" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300">
                DiaVet Algérie 🇩🇿
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {isRtl ? "التسجيل الرسمي وتأكيد الحساب" : isEn ? "Official & Verified Registration" : "Inscription Réelle & Vérifiée"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Simple & Effective Language Selector with flags */}
            {onSelectLang && (
              <div 
                id="onboarding-lang-switcher"
                className="flex items-center gap-1 bg-slate-900/95 border-2 border-cyan-500/40 p-1 rounded-2xl shadow-lg shadow-cyan-500/10"
              >
                <button
                  id="onboarding-lang-fr"
                  type="button"
                  onClick={() => handleLanguageChange('fr')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    currentLang === 'fr' 
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/30 scale-105' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Français"
                >
                  <span>🇫🇷</span>
                  <span>FR</span>
                </button>
                <button
                  id="onboarding-lang-ar"
                  type="button"
                  onClick={() => handleLanguageChange('ar')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    currentLang === 'ar' 
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/30 scale-105' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="العربية"
                >
                  <span>🇩🇿</span>
                  <span>عربي</span>
                </button>
                <button
                  id="onboarding-lang-en"
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                    currentLang === 'en' 
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md shadow-cyan-500/30 scale-105' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="English"
                >
                  <span>🇬🇧</span>
                  <span>EN</span>
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
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0"
                title={isRtl ? "إغلاق واستكشاف المنصة" : isEn ? "Close and explore platform" : "Fermer et visiter"}
              >
                <span className="text-xs">✕</span>
                <span className="hidden sm:inline text-[11px] font-semibold">{isRtl ? "إغلاق" : isEn ? "Explore" : "Visiter"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Restored Draft Banner */}
        <AnimatePresence>
          {hasRestoredDraft && authMode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0, mb: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="relative z-10 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg shadow-emerald-950/40"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Save className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">
                    {isRtl ? "💾 تم استرجاع مسودتك السابقة تلقائياً" : isEn ? "💾 Your previous draft has been restored" : "💾 Vos saisies précédentes ont été restaurées"}
                  </span>
                  <span className="text-[11px] text-emerald-300/80">
                    {lastSavedTimestamp ? (isRtl ? `آخر حفظ: ${lastSavedTimestamp}` : isEn ? `Last saved: ${lastSavedTimestamp}` : `Sauvegardé à ${lastSavedTimestamp}`) : (isRtl ? "بياناتك محفوظة بأمان على جهازك" : isEn ? "Your data is safely kept locally" : "Vos données sont gardées en mémoire locale")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearDraft}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] border border-white/15 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                title={isRtl ? "مسح المسودة والبدء من جديد" : isEn ? "Clear draft and start fresh" : "Effacer le formulaire"}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isRtl ? "مسح المسودة" : isEn ? "Reset" : "Effacer"}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Auto-Save Indicator */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-medium">
              {isRtl ? "حفظ تلقائي للمعلومات مفعّل" : isEn ? "Auto-save active" : "Sauvegarde automatique active"}
            </span>
          </div>
          {lastSavedTimestamp && (
            <span className="text-slate-400 text-[10px] font-mono">
              {isRtl ? `آخر تحديث: ${lastSavedTimestamp}` : isEn ? `Saved ${lastSavedTimestamp}` : `Enregistré ${lastSavedTimestamp}`}
            </span>
          )}
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
              <span>{isRtl ? 'حساب جديد حقيقي' : isEn ? 'Create Account' : 'Créer un compte'}</span>
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
              <span>{isRtl ? 'تسجيل الدخول' : isEn ? 'Log In' : 'Se connecter'}</span>
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
                {isRtl ? "تأكيد الحساب عبر رمز البريد الإلكتروني" : isEn ? "Email Account Verification" : "Confirmation de votre Compte par Email"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {isRtl ? (
                  <>
                    لقد أرسلنا رمز تأكيد سري مكون من 6 أرقام إلى بريدك الإلكتروني :<br />
                    <span className="font-bold text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 inline-block mt-1">{email}</span>
                  </>
                ) : isEn ? (
                  <>
                    We sent a secure 6-digit confirmation code to:<br />
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
                  <span className="font-bold text-white">
                    {isRtl ? "إشعار البريد الإلكتروني المرسل 📬" : isEn ? "Email Dispatch Notification 📬" : "Notification de l'Email Envoyé 📬"}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded">
                  {isRtl ? "المرسل: contact@diavet.com" : isEn ? "Sender: contact@diavet.com" : "Expéditeur: contact@diavet.com"}
                </span>
              </div>
              
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] text-slate-400">
                    {isRtl ? "الموضوع : " : isEn ? "Subject: " : "Objet : "}
                    <strong className="text-white">DiaVet Algérie — {isRtl ? "رمز التأكيد الخاص بك : " : isEn ? "Your confirmation code: " : "Votre code de confirmation : "} {dispatchedCode}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isRtl ? "رمز مؤقت صالح لمدة 15 دقيقة." : isEn ? "Temporary code valid for 15 minutes." : "Code temporaire valable 15 minutes."}
                  </p>
                </div>
                {dispatchedCode && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setVerificationCode(dispatchedCode);
                        const result = verifyEmailCode(email, dispatchedCode, currentLang);
                        if (result.success && result.account) {
                          soundEngine.playLevelUp();
                          setVerifiedAccount(result.account);
                          setShowSuccessModal(true);
                        } else {
                          setError(result.message);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {isRtl ? `⚡ تأكيد فوري بالرمز (${dispatchedCode})` : isEn ? `⚡ Instant Confirm (${dispatchedCode})` : `⚡ Valider en 1-Clic (${dispatchedCode})`}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVerificationCode(dispatchedCode);
                        setCopiedCode(true);
                        soundEngine.playPop();
                        setTimeout(() => setCopiedCode(false), 2500);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>
                        {copiedCode 
                          ? (isRtl ? "تم النسخ!" : isEn ? "Copied!" : "Copié !") 
                          : (isRtl ? `نسخ` : isEn ? `Copy` : `Copier`)}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Form to enter 6-digit code */}
            <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-center">
                  {isRtl ? "أدخل الرمز المكون من 6 أرقام هنا :" : isEn ? "Enter the 6-digit code here:" : "Saisissez les 6 chiffres du code ici :"}
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
                <span>
                  {isSubmitting 
                    ? (isRtl ? "جاري التحقق..." : isEn ? "Verifying..." : "Vérification...") 
                    : (isRtl ? "تأكيد الحساب وتفعيل الـ VIP 🇩🇿" : isEn ? "Confirm Account & Unlock VIP Pass 🇩🇿" : "Confirmer mon Compte & Débloquer le VIP 🇩🇿")}
                </span>
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
                      ? (isRtl ? `إعادة الإرسال بعد (${resendCountdown} ث)` : isEn ? `Resend code (${resendCountdown}s)` : `Renvoyer le code (${resendCountdown}s)`)
                      : (isRtl ? "إعادة إرسال الرمز الآن" : isEn ? "Resend a new code" : "Renvoyer un nouveau code")}
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
                  {isRtl ? "تغيير البريد الإلكتروني" : isEn ? "Change email address" : "Corriger mon email"}
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
                {isRtl ? "نوع العضوية المطلوبة :" : isEn ? "Select your profile type:" : "Votre profil d'inscription :"}
              </label>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCyberClick();
                    setRole('owner');
                  }}
                  className={`p-2.5 sm:p-3 rounded-2xl border-2 transition-all flex items-center gap-2.5 sm:gap-3 cursor-pointer text-left ${
                    role === 'owner'
                      ? 'bg-rose-500/20 border-rose-400 text-white shadow-lg shadow-rose-500/20'
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-rose-400/40'
                  }`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500/30" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">{isRtl ? "مربي حيوان أليف" : isEn ? "Pet Owner" : "Propriétaire"}</div>
                    <div className="text-[10px] text-slate-400">{isRtl ? "كلب، قط، خيل..." : isEn ? "Passport & Care" : "Carnet & Soins"}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCyberClick();
                    setRole('vet');
                  }}
                  className={`p-2.5 sm:p-3 rounded-2xl border-2 transition-all flex items-center gap-2.5 sm:gap-3 cursor-pointer text-left ${
                    role === 'vet'
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-emerald-400/40'
                  }`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1">
                      <span>{isRtl ? "طبيب بيطري" : isEn ? "Veterinarian" : "Vétérinaire"}</span>
                      <span className="text-[9px] px-1 py-0.2 bg-emerald-400 text-slate-950 font-black rounded">PRO</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{isRtl ? "عيادة، صيدلية..." : isEn ? "Clinic & Practice" : "Cabinet & Réseau"}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Identity & Email Section */}
            <div className="space-y-3 pt-1">
              
              {/* Full Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    {isRtl ? "الاسم واللقب الحقيقي *" : isEn ? "Full Legal Name *" : "Nom & Prénom réels *"}
                  </label>
                  {touched.fullName && nameValidation.isValid && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      {isRtl ? "صحيح" : isEn ? "Valid" : "Valide"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      markTouched('fullName');
                    }}
                    onBlur={() => markTouched('fullName')}
                    placeholder={role === 'vet' ? (isRtl ? 'مثال: د. أمينة بن علي' : isEn ? 'E.g., Dr. Amina Benali' : 'Ex: Dr. Amina Benali') : (isRtl ? 'مثال: كريم منصوري' : isEn ? 'E.g., Karim Mansouri' : 'Ex: Karim Mansouri')}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                      touched.fullName && !nameValidation.isValid
                        ? 'border-rose-500/80 focus:border-rose-400 ring-2 ring-rose-500/20'
                        : touched.fullName && nameValidation.isValid
                        ? 'border-emerald-500/60 focus:border-emerald-400'
                        : 'border-white/15 focus:border-cyan-400'
                    }`}
                  />
                </div>
                {touched.fullName && !nameValidation.isValid && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{nameValidation.error}</span>
                  </p>
                )}
              </div>

              {/* REAL EMAIL FIELD WITH ANTI-DUPLICATE WARNING & ZOD VALIDATION */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    {isRtl ? "البريد الإلكتروني الحقيقي (لاستلام رمز التفعيل) *" : isEn ? "Real Email Address (to receive code) *" : "Adresse Email Réelle (pour recevoir le code) *"}
                  </label>
                  {touched.email && emailValidation.isValid && !emailDuplicateError && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      {isRtl ? "بريد صالح" : isEn ? "Valid email" : "Email valide"}
                    </span>
                  )}
                </div>
                
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      markTouched('email');
                      if (emailDuplicateError) {
                        checkDuplicateEmail(e.target.value);
                      }
                    }}
                    onBlur={(e) => {
                      markTouched('email');
                      checkDuplicateEmail(e.target.value);
                    }}
                    placeholder="nom.prenom@gmail.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                      touched.email && !emailValidation.isValid
                        ? 'border-rose-500/80 focus:border-rose-400 ring-2 ring-rose-500/20'
                        : emailDuplicateError
                        ? 'border-cyan-400/60 focus:border-cyan-400 ring-2 ring-cyan-500/20'
                        : touched.email && emailValidation.isValid
                        ? 'border-emerald-500/60 focus:border-emerald-400'
                        : 'border-white/15 focus:border-cyan-400'
                    }`}
                  />
                </div>

                {touched.email && !emailValidation.isValid && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{emailValidation.error}</span>
                  </p>
                )}

                {/* HELPFUL NOTIFICATION ALERT IF EMAIL IS RECOGNIZED */}
                {emailDuplicateError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-3 rounded-xl bg-amber-950/70 border-2 border-amber-500/60 text-amber-200 text-xs space-y-2 shadow-lg shadow-amber-950/50"
                  >
                    <div className="flex items-start gap-2 font-bold text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{emailDuplicateError}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/30">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('');
                          setEmailDuplicateError(null);
                          soundEngine.playPop();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 border border-amber-400/50 font-black text-xs cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isRtl ? "تجربة بريد إلكتروني آخر 📧" : isEn ? "Try another email 📧" : "Essayer un autre e-mail 📧"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail(email);
                          setAuthMode('login');
                          setEmailDuplicateError(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/30 hover:bg-cyan-500/50 text-white font-bold text-xs cursor-pointer flex items-center gap-1 transition-all active:scale-95"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>{isRtl ? "تسجيل الدخول" : isEn ? "Log in" : "Se connecter"}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Phone & Wilaya in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300">
                      {isRtl ? "رقم الهاتف الجزائري *" : isEn ? "Algerian Phone *" : "Téléphone Algérie *"}
                    </label>
                    {touched.phone && phoneValidation.isValid && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <Check className="w-3 h-3" />
                        {isRtl ? "صالح" : isEn ? "Valid" : "Valide"}
                      </span>
                    )}
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      markTouched('phone');
                    }}
                    onBlur={() => markTouched('phone')}
                    placeholder="0550123456"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none font-mono transition-all ${
                      touched.phone && !phoneValidation.isValid
                        ? 'border-rose-500/80 focus:border-rose-400 ring-2 ring-rose-500/20'
                        : touched.phone && phoneValidation.isValid
                        ? 'border-emerald-500/60 focus:border-emerald-400'
                        : 'border-white/15 focus:border-cyan-400'
                    }`}
                  />
                  {touched.phone && !phoneValidation.isValid ? (
                    <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{phoneValidation.error}</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-[10px] text-slate-400">
                      {isRtl ? "يقبل: 05, 06, 07 أو +213" : isEn ? "Accepts: 05, 06, 07 or +213" : "Accepte : 05, 06, 07 ou +213"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isRtl ? "الولاية (58 ولاية) *" : isEn ? "Wilaya (58 Wilayas) *" : "Wilaya (58 Wilayas) *"}
                  </label>
                  <select
                    value={wilaya}
                    onChange={(e) => {
                      setWilaya(e.target.value);
                      markTouched('wilaya');
                    }}
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
                      {isRtl ? "نوع الحيوان" : isEn ? "Species" : "Espèce"}
                    </label>
                    <select
                      value={petType}
                      onChange={(e) => setPetType(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white"
                    >
                      <option value="Chat">{isRtl ? 'قط 🐱' : isEn ? 'Cat 🐱' : 'Chat 🐱'}</option>
                      <option value="Chien">{isRtl ? 'كلب 🐶' : isEn ? 'Dog 🐶' : 'Chien 🐶'}</option>
                      <option value="Cheval">{isRtl ? 'خيل 🐴' : isEn ? 'Horse 🐴' : 'Cheval 🐴'}</option>
                      <option value="Oiseau">{isRtl ? 'طائر 🦜' : isEn ? 'Bird 🦜' : 'Oiseau 🦜'}</option>
                      <option value="Bovin / Ovin">{isRtl ? 'مواشي 🐑' : isEn ? 'Livestock 🐑' : 'Bovin / Ovin 🐑'}</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-rose-300 mb-1">
                      {isRtl ? "اسم الحيوان الأليف" : isEn ? "Pet's Name" : "Nom de votre animal"}
                    </label>
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder={isRtl ? "مثال: سيمبا، ريكس، مايا..." : isEn ? "E.g., Simba, Maya, Rex..." : "Ex: Simba, Maya, Rex..."}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                      {isRtl ? "اسم العيادة أو المكتب البيطري" : isEn ? "Clinic / Practice Name" : "Cabinet / Clinique Vétérinaire"}
                    </label>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder={isRtl ? "مثال: عيادة الشفاء البيطرية، عيادة د. خليفة..." : isEn ? "E.g., Al-Chifa Veterinary Clinic, Dr. Khelifa Practice..." : "Ex: Clinique Vétérinaire El Biar, Cabinet Dr. Khelifa..."}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* Password / PIN with Live Strength Indicator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    {isRtl ? "كلمة المرور أو رمز PIN للحساب *" : isEn ? "Password / Security PIN *" : "Mot de passe / Code PIN de sécurité *"}
                  </label>
                  {password && (
                    <span className="text-[10px] font-semibold text-slate-300">
                      {isRtl ? `قوة الرمز : ` : isEn ? `Strength: ` : `Sécurité : `}
                      <strong className={passwordStrength.score >= 3 ? 'text-emerald-400' : passwordStrength.score >= 2 ? 'text-amber-400' : 'text-rose-400'}>
                        {passwordStrength.label[currentLang] || passwordStrength.label.fr}
                      </strong>
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    markTouched('password');
                  }}
                  onBlur={() => markTouched('password')}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none font-mono transition-all ${
                    touched.password && !passwordValidation.isValid
                      ? 'border-rose-500/80 focus:border-rose-400 ring-2 ring-rose-500/20'
                      : touched.password && passwordValidation.isValid
                      ? 'border-emerald-500/60 focus:border-emerald-400'
                      : 'border-white/15 focus:border-cyan-400'
                  }`}
                />

                {/* Password Strength Meter Bar */}
                {password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden bg-slate-800">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordStrength.score >= level ? passwordStrength.color : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {touched.password && !passwordValidation.isValid && (
                  <p className="mt-1 text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{passwordValidation.error}</span>
                  </p>
                )}
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
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/25 bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 hover:scale-[1.01]"
              >
                <Mail className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? (isRtl ? "جاري الإرسال..." : isEn ? "Generating code..." : "Génération du code...")
                    : (isRtl ? "استلام رمز التفعيل عبر البريد الإلكتروني ←" : isEn ? "Receive confirmation code by email →" : "Recevoir mon code par email ←")}
                </span>
              </button>
            </div>

            <div className="text-center pt-1">
              <p className="text-[10px] text-slate-400">
                🔒 {isRtl 
                  ? "بياناتك محمية ورمز التفعيل يُرسل حصرياً إلى بريدك الإلكتروني" 
                  : isEn 
                  ? "Guaranteed security: a 6-digit code will be sent to your email to verify your registration." 
                  : "Sécurité garantie : un code à 6 chiffres vous sera envoyé par email pour valider l'inscription."}
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
                {isRtl ? "تسجيل الدخول إلى حسابك DiaVet" : isEn ? "Log In to your DiaVet Account" : "Connexion à votre Compte DiaVet"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRtl ? "أدخل بريدك الإلكتروني المسجل وكلمة المرور" : isEn ? "Enter your registered email and password" : "Entrez votre email vérifié et votre mot de passe"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isRtl ? "البريد الإلكتروني *" : isEn ? "Email Address *" : "Adresse Email *"}
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder={isEn ? "E.g., yacine@example.com or admin@diavet.dz" : "Ex: yacine@example.com ou admin@diavet.dz"}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                {isRtl ? "كلمة المرور / الرمز السري *" : isEn ? "Password / PIN Code *" : "Mot de passe / Code PIN *"}
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
              <span>
                {isSubmitting 
                  ? (isRtl ? "جاري الدخول..." : isEn ? "Logging in..." : "Connexion...") 
                  : (isRtl ? "تسجيل الدخول الآن" : isEn ? "Log In Now" : "Se connecter")}
              </span>
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
                {isRtl ? "ليس لديك حساب بعد؟ سجل حساباً جديداً هنا" : isEn ? "No account yet? Create a new account" : "Pas encore de compte ? Créer un nouveau compte"}
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
              {isRtl ? "← تصفح موقع DiaVet كزائر دون تسجيل" : isEn ? "← Explore DiaVet platform as a guest" : "← Continuer la visite du site sans connexion"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
