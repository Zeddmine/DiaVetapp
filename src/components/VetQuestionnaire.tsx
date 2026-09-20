import { useState, useEffect } from 'react';
import { Language, VetAnswers } from '../types';
import { translations } from '../data/translations';
import { ALGERIAN_WILAYAS, CLINIC_PHOTOS } from '../data/mockData';
import { recordVetSubmission, generateVipCode } from '../services/adminDb';
import { soundEngine } from '../utils/soundEngine';
import FuturisticBubble from './FuturisticBubble';
import { motion } from 'motion/react';
import { 
  ChevronLeft, ArrowRight, Clock, Sparkles, 
  ShieldCheck, QrCode, Stethoscope, CheckCircle2, 
  AlertCircle, Lightbulb, Check, Camera
} from 'lucide-react';
import DiaVetLogo from './DiaVetLogo';

interface VetQuestionnaireProps {
  currentLang: Language;
  onFinish: (answers: VetAnswers) => void;
  onGoHome: () => void;
  onPreviewPortal: () => void;
}

export default function VetQuestionnaire({
  currentLang,
  onFinish,
  onGoHome,
  onPreviewPortal
}: VetQuestionnaireProps) {
  const t = translations[currentLang] || translations.fr;
  const isRtl = currentLang === 'ar';

  const [step, setStep] = useState<number>(0);
  const totalSteps = 7;

  // ANSWERS STATE: Started clean without pre-selected defaults!
  const [answers, setAnswers] = useState<VetAnswers>({
    practiceType: '',
    clinicName: '',
    vetFullName: '',
    specialties: [],
    availableEquipment: [],
    dailyPatientsCount: '',
    emergencyService: '',
    currentTool: '',
    majorChallengesDz: [],
    desiredFeatures: [],
    wilaya: '16 - Alger',
    commune: '',
    phoneContact: '',
    userSuggestions: ''
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [suspensePhase, setSuspensePhase] = useState<number>(0);
  const [suspenseProgress, setSuspenseProgress] = useState<number>(0);
  const [generatedVip, setGeneratedVip] = useState<string>('');

  const quickVetIdeas = isRtl ? [
    "توليد وصفات طبية QR إلكترونية 📄",
    "تنبيه فوري بنقص اللقاحات في الجزائر ⚠️",
    "ربط مباشر مع المخابر ومراكز الأشعة 🔬",
    "شبكة تبادل واستشارة بين الأطباء 🤝",
    "أرشفة سحابية لصور الإيكو والراديو 💾"
  ] : [
    "Ordonnances électroniques avec QR Code 📄",
    "Alerte pénuries de médicaments DZ ⚠️",
    "Liaison avec laboratoires d'analyses 🔬",
    "Réseau de confraternité & télé-expertise 🤝",
    "Archivage cloud échographies & radios 💾"
  ];

  // Suspense progress timer
  useEffect(() => {
    if (step === 8) {
      soundEngine.playSuccess();
      const interval = setInterval(() => {
        setSuspenseProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setStep(9);
            }, 600);
            return 100;
          }
          const nextVal = prev + 5;
          if (nextVal > 25 && nextVal <= 50) setSuspensePhase(1);
          if (nextVal > 50 && nextVal <= 75) setSuspensePhase(2);
          if (nextVal > 75) setSuspensePhase(3);
          return nextVal;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  const toggleSpecialty = (spec: string) => {
    soundEngine.playPop();
    setValidationError(null);
    setAnswers(prev => {
      const exists = prev.specialties.includes(spec);
      const next = exists
        ? prev.specialties.filter(s => s !== spec)
        : [...prev.specialties, spec];
      return { ...prev, specialties: next };
    });
  };

  const toggleEquipment = (eq: string) => {
    soundEngine.playPop();
    setValidationError(null);
    setAnswers(prev => {
      const exists = prev.availableEquipment?.includes(eq);
      const next = exists
        ? (prev.availableEquipment || []).filter(e => e !== eq)
        : [...(prev.availableEquipment || []), eq];
      return { ...prev, availableEquipment: next };
    });
  };

  const toggleChallenge = (ch: string) => {
    soundEngine.playPop();
    setValidationError(null);
    setAnswers(prev => {
      const exists = prev.majorChallengesDz?.includes(ch);
      const next = exists
        ? (prev.majorChallengesDz || []).filter(c => c !== ch)
        : [...(prev.majorChallengesDz || []), ch];
      return { ...prev, majorChallengesDz: next };
    });
  };

  const toggleFeature = (feat: string) => {
    soundEngine.playPop();
    setValidationError(null);
    setAnswers(prev => {
      const exists = prev.desiredFeatures?.includes(feat);
      const next = exists
        ? (prev.desiredFeatures || []).filter(f => f !== feat)
        : [...(prev.desiredFeatures || []), feat];
      return { ...prev, desiredFeatures: next };
    });
  };

  // Validation
  const validateCurrentStep = (): boolean => {
    switch (step) {
      case 1:
        if (!answers.practiceType) {
          triggerShake(
            isRtl ? 'يرجى تحديد نمط الممارسة أو نوع العيادة.' : 'Veuillez sélectionner votre type d’exercice.'
          );
          return false;
        }
        if (!answers.clinicName?.trim()) {
          triggerShake(
            isRtl ? 'يرجى كتابة اسم العيادة أو المصحة البيطرية.' : 'Veuillez renseigner le nom de votre établissement.'
          );
          return false;
        }
        if (!answers.vetFullName?.trim()) {
          triggerShake(
            isRtl ? 'يرجى كتابة اسم الطبيب البيطري المسؤول.' : 'Veuillez renseigner votre prénom et nom de Docteur Vétérinaire.'
          );
          return false;
        }
        break;
      case 2:
        if (!answers.specialties || answers.specialties.length === 0) {
          triggerShake(
            isRtl ? 'يرجى اختيار تخصص واحد على الأقل.' : 'Veuillez sélectionner au moins un domaine de compétence.'
          );
          return false;
        }
        break;
      case 3:
        if (!answers.availableEquipment || answers.availableEquipment.length === 0) {
          triggerShake(
            isRtl ? 'يرجى تحديد تجهيز تقني واحد على الأقل متوفر لديك.' : 'Veuillez cocher au moins un équipement présent ou disponible.'
          );
          return false;
        }
        break;
      case 4:
        if (!answers.dailyPatientsCount) {
          triggerShake(
            isRtl ? 'يرجى تحديد متوسط عدد الفحوصات اليومية.' : 'Veuillez préciser le flux moyen de patients par jour.'
          );
          return false;
        }
        if (!answers.emergencyService) {
          triggerShake(
            isRtl ? 'يرجى تحديد نظام المناوبة وخدمة الطوارئ.' : 'Veuillez préciser votre organisation pour les urgences.'
          );
          return false;
        }
        break;
      case 5:
        if (!answers.majorChallengesDz || answers.majorChallengesDz.length === 0) {
          triggerShake(
            isRtl ? 'يرجى اختيار تحدٍ مهني واحد على الأقل في الجزائر.' : 'Veuillez sélectionner au moins un défi rencontré en Algérie.'
          );
          return false;
        }
        break;
      case 6:
        if (!answers.desiredFeatures || answers.desiredFeatures.length === 0) {
          triggerShake(
            isRtl ? 'يرجى اختيار وحدة برمجية واحدة على الأقل تهمك.' : 'Veuillez sélectionner au moins un module DiaVet PRO prioritaire.'
          );
          return false;
        }
        break;
      case 7:
        if (!answers.wilaya) {
          triggerShake(
            isRtl ? 'يرجى اختيار ولاية الممارسة.' : 'Veuillez sélectionner la wilaya d’implantation.'
          );
          return false;
        }
        if (!answers.commune?.trim()) {
          triggerShake(
            isRtl ? 'يرجى كتابة البلدية أو المدينة.' : 'Veuillez préciser la commune d’exercice.'
          );
          return false;
        }
        if (!answers.phoneContact?.trim() || answers.phoneContact.trim().length < 8) {
          triggerShake(
            isRtl ? 'يرجى إدخال رقم هاتف مهني صحيح.' : 'Veuillez indiquer un numéro de téléphone professionnel valide.'
          );
          return false;
        }
        break;
    }
    setValidationError(null);
    return true;
  };

  const triggerShake = (msg: string) => {
    soundEngine.playError();
    setValidationError(msg);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 600);
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    soundEngine.playSuccess();

    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === totalSteps) {
      const vipCode = generateVipCode('vet', answers.wilaya);
      setGeneratedVip(vipCode);
      const finalAnswers: VetAnswers = { 
        ...answers, 
        vipPartnerId: vipCode, 
        submittedAt: new Date().toISOString() 
      };
      
      // Save internally
      recordVetSubmission(finalAnswers, vipCode);
      
      onFinish(finalAnswers);
      setStep(8); // Suspense animation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    soundEngine.playPop();
    setValidationError(null);
    if (step > 0 && step <= totalSteps) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onGoHome();
    }
  };

  // STEP 0: INTRO SCREEN
  if (step === 0) {
    return (
      <div className={`max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-300 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white mb-6 cursor-pointer"
        >
          <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          <span>{t.btnBack}</span>
        </button>

        <div className="relative rounded-[2.5rem] overflow-hidden border border-emerald-500/30 bg-slate-950/85 backdrop-blur-xl shadow-2xl p-6 sm:p-10">
          <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden mb-8 border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=800"
              alt="Veterinary Clinic Algeria"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            <div className={`absolute bottom-4 ${isRtl ? 'right-4 left-4 text-right' : 'left-4 right-4 text-left'}`}>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-slate-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                {isRtl ? "برنامج DiaVet PRO للأطباء البيطريين في الجزائر" : "DiaVet Professionnel · Réseau Clinique Algérie"}
              </span>
              <p className="text-lg sm:text-xl font-bold text-white mt-1">
                {isRtl ? "البرنامج الطبي السحابي الأول المصمم لواقع الممارسة البيطرية في الجزائر" : "La suite logicielle conçue par et pour les praticiens algériens"}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {t.roleVetTag}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4 leading-tight">
            {isRtl ? "شارك في تطوير واختبار برنامج DiaVet PRO" : "Participez au Déploiement Clinique DiaVet PRO"}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            {isRtl 
              ? "حضرات الزملاء والزميلات: شاركونا تحديات الميدان (إدارة المواعيد، سجل التلقيحات، الوصفات، والطوارئ) لبناء معيار بيطري رقمي قوي في الجزائر."
              : "Confrères et consœurs vétérinaires : partagez votre réalité de terrain (ruptures de stock, gardes nocturnes, ordonnances) pour co-construire le standard vétérinaire connecté en Algérie."}
          </p>

          <div className="mt-8 space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <span>{isRtl ? "المدة: 7 أسئلة مهنية سريعة · حرية كاملة في الاختيارات" : "Durée : 7 questions cliniques · Saisie interactive à votre rythme"}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>{isRtl ? "اعتماد شريك مؤسس + أولوية في دليل الطوارئ 24/7" : "Statut « Praticien Fondateur Agréé » + Référencement Urgences 24/7 offert"}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/10">
            <span className="text-xs text-slate-400">
              {isRtl ? "مفتوح للأطباء البيطريين عبر الـ 58 ولاية" : "Déploiement national · Praticiens 58 Wilayas"}
            </span>
            <button
              onClick={() => {
                soundEngine.playSuccess();
                setStep(1);
              }}
              className="px-8 py-4 rounded-2xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:opacity-95 transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>{isRtl ? "بدء استبيان الأطباء البيطريين" : "Commencer le questionnaire PRO"}</span>
              <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 8: SUSPENSE ANIMATION
  if (step === 8) {
    const phases = isRtl ? [
      "فحص ومطابقة بيانات العيادة المهنية...",
      "تجهيز وحدة الوصفات الرقمية وسجل المرضى المشترك...",
      "تفعيل أولوية الدليل الوطني للطوارئ والمناوبة 24/7...",
      "إنشاء شارة الطبيب الشريك المؤسس DiaVet PRO..."
    ] : [
      "Vérification de la conformité du dossier clinique...",
      "Attribution des modules ordonnances & carnet numérique partagé...",
      "Calcul des quotas d'astreinte & référencement d'urgence...",
      "Génération du Badge Partenaire Officiel DiaVet PRO..."
    ];

    return (
      <div className={`max-w-xl mx-auto px-4 py-16 text-center animate-in fade-in duration-300`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="p-8 sm:p-12 rounded-[2.5rem] bg-slate-950/90 border-2 border-emerald-500/40 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 mb-8 relative">
            <Sparkles className="w-12 h-12 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="absolute inset-0 rounded-3xl border border-white/30 animate-ping opacity-30"></div>
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {isRtl ? "تدقيق واعتماد الحساب الطبي" : "Audit Professionnel"}
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-white mt-4">
            {isRtl ? "جارٍ معالجة اتفاقية الشراكة..." : "Traitement de votre conventionnement..."}
          </h2>
          
          <p className="text-slate-300 text-sm mt-2 min-h-[2.5rem]">
            {phases[suspensePhase]}
          </p>

          <div className="w-full bg-slate-900 rounded-full h-4 p-1 border border-white/10 mt-8 relative overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-200"
              style={{ width: `${suspenseProgress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-3">
            <span>Réseau Médical DZ</span>
            <span className="text-emerald-400 font-bold">{suspenseProgress}%</span>
          </div>
        </div>
      </div>
    );
  }

  // STEP 9: VIP PRO ACCREDITATION
  if (step === 9) {
    return (
      <div className={`max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-in zoom-in-95 duration-500 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-emerald-500/50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                {isRtl ? "اعتماد رسمي مسبق · DiaVet PRO" : "Conventionnement Pré-Validé · DiaVet PRO"}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">Réseau DZ 2026</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {isRtl ? (
              <>مرحباً بكم في شبكة <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200">الأطباء المؤسسين</span></>
            ) : (
              <>Bienvenue dans le Réseau <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200">Praticien Fondateur</span></>
            )}
          </h1>
          
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            {isRtl ? (
              <>شكراً <strong>{answers.vetFullName || 'دكتور'}</strong>. عيادتكم <strong>{answers.clinicName}</strong> مدرجة الآن في قائمة الأولوية لدليل الطوارئ والعيادات البيطرية في الجزائر.</>
            ) : (
              <>Merci <strong>{answers.vetFullName || 'Docteur'}</strong>. Votre structure <strong>{answers.clinicName}</strong> est désormais référencée en priorité sur la carte des cliniques et urgences vétérinaires en Algérie.</>
            )}
          </p>

          {/* THE PRO PARTNER CARD */}
          <div className="my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-slate-900 via-emerald-950/40 to-slate-900 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl"></div>

            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <DiaVetLogo size="sm" />
                  <span className="text-lg font-black text-white tracking-wider">
                    DIA<span className="text-emerald-400">VET</span> PRO
                  </span>
                </div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/80 mt-1">
                  {isRtl ? "شهادة اعتماد عيادة شريكة مؤسسة" : "Accréditation Clinique Partenaire Fondatrice"}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">ID CONVENTION</span>
                <span className="text-xs sm:text-sm font-black font-mono text-emerald-300 bg-black/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                  {generatedVip}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 text-xs mb-6">
              <div>
                <span className="text-slate-400 text-[10px] block">{isRtl ? "المؤسسة / العيادة" : "ÉTABLISSEMENT"}</span>
                <span className="text-white font-bold">{answers.clinicName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">{isRtl ? "ولاية الممارسة" : "WILAYA D’EXERCICE"}</span>
                <span className="text-emerald-300 font-bold">{answers.wilaya}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">{isRtl ? "خدمة الطوارئ" : "ASTREINTE URGENCE"}</span>
                <span className="text-cyan-400 font-bold">{isRtl ? "متاح في الدليل 24/7" : "Référencé 24/7"}</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isRtl ? "ترخيص مجاني كامل لبرنامج DiaVet PRO خلال مرحلة الإطلاق" : "Licence logicielle DiaVet PRO offerte durant les 12 premiers mois."}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isRtl ? "شارة التوثيق والأولوية لدى آلاف المربين في ولايتك" : "Référencement prioritaire avec badge vérifié auprès des propriétaires."}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isRtl ? "نظام تتبع وإشعار بنقص الأدوية والتبادل المهني" : "Alerte automatique des ruptures de stock et entraide confraternelle."}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <QrCode className="w-8 h-8 text-emerald-300 shrink-0" />
                <div>
                  <p className="text-white font-bold">{isRtl ? "رمز التحقق الطبي DiaVet" : "Badge Médical DiaVet Algérie"}</p>
                  <p>{isRtl ? "رمز معتمد للوصفات والواجهة" : "Insigne officiel pour votre vitrine"}</p>
                </div>
              </div>
              <span className="text-emerald-400 font-bold">{isRtl ? "معتمد ✓" : "CONVENTIONNÉ ✓"}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <button
              onClick={onPreviewPortal}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{isRtl ? "معاينة فضاء وبرنامج الطبيب البيطري" : "Aperçu du Portail Clinique PRO"}</span>
            </button>

            <button
              onClick={onGoHome}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-white/10 cursor-pointer"
            >
              {t.navHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // QUESTIONS WORKFLOW: STEPS 1 TO 7
  return (
    <div className={`max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-300 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between text-xs">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 font-semibold text-slate-400 hover:text-white cursor-pointer"
        >
          <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          <span>{t.btnBack}</span>
        </button>

        <span className="font-bold text-slate-400">
          {isRtl ? (
            <>المرحلة <strong className="text-emerald-400">{step}</strong> من {totalSteps}</>
          ) : (
            <>Étape <strong className="text-emerald-400">{step}</strong> sur {totalSteps}</>
          )}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2.5 mb-8 border border-white/10 overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* SHAKE ERROR ALERT BANNER */}
      {validationError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-rose-500/20 border-2 border-rose-500/60 text-rose-200 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-lg"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
          <span>{validationError}</span>
        </motion.div>
      )}

      {/* MAIN QUESTION CARD */}
      <div className={`rounded-[2.5rem] border border-white/10 bg-slate-950/85 backdrop-blur-xl shadow-2xl p-6 sm:p-10 relative transition-transform ${
        isShaking ? 'animate-shake border-rose-500 ring-2 ring-rose-500/40' : ''
      }`}>

        {/* STEP 1: PRACTICE & IDENTITY */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                {isRtl ? `المرحلة 1 من ${totalSteps} · بيانات العيادة والممارس` : `Étape 1 sur ${totalSteps} · Structure Clinique`}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {isRtl ? "التعريف بالممارسة والعيادة البيطرية" : "Présentation de votre exercice vétérinaire"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isRtl ? "معلومات رسمية لضبط الدليل الطبي واعتماد حسابك." : "Informations pour le conventionnement et l'annuaire médical officiel."}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isRtl ? "نوع ونمط الممارسة البيطرية *" : "Type d'exercice ou structure *"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { 
                      label: isRtl ? "عيادة بيطرية حرة في المدينة" : "Cabinet vétérinaire de ville", 
                      sub: isRtl ? "استشارات، تلقيحات وطب عام" : "Consultations, soins & médecine générale",
                      image: CLINIC_PHOTOS.stethoscope,
                      icon: "🏥" 
                    },
                    { 
                      label: isRtl ? "مصحة بيطرية مع إيواء وجراحة" : "Clinique avec hospitalisation & chirurgie", 
                      sub: isRtl ? "غرفة عمليات، إيكوغرافي وأقفاص رعاية" : "Plateau technique, bloc & chenil 24h",
                      image: CLINIC_PHOTOS.surgery,
                      icon: "🏨" 
                    },
                    { 
                      label: isRtl ? "ممارسة ريفية متجولة (مواشي / تربية)" : "Exercice rural itinérant (Élevage / Grands animaux)", 
                      sub: isRtl ? "زيارات مزارع وضيعات" : "Visites d'exploitations & santé cheptel",
                      image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=500',
                      icon: "🚜" 
                    },
                    { 
                      label: isRtl ? "طبيب بيطري مختص في الخيول" : "Praticien équin spécialisé (Chevaux / Haras)", 
                      sub: isRtl ? "طب الخيول والسباقات" : "Équidés, haras & élevages équins",
                      image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=500',
                      icon: "🐎" 
                    }
                  ].map(type => {
                    const isSelected = answers.practiceType === type.label;
                    return (
                      <div
                        key={type.label}
                        onClick={() => {
                          soundEngine.playPop();
                          setAnswers({ ...answers, practiceType: type.label });
                        }}
                        className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer p-3.5 flex items-center gap-3.5 ${
                          isSelected 
                            ? 'border-emerald-400 bg-emerald-950/40 shadow-xl shadow-emerald-500/20 scale-[1.02]' 
                            : 'border-white/10 bg-slate-900/80 hover:border-emerald-500/40'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative border border-white/10">
                          <img 
                            src={type.image} 
                            alt={type.label} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{type.icon}</span>
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">{type.label}</h4>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{type.sub}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-emerald-400 border-emerald-300 text-slate-950' : 'border-white/20'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isRtl ? "اسم العيادة أو المصحة البيطرية *" : "Nom du cabinet ou de la clinique *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? "مثال: عيادة البهجة البيطرية، عيادة د. منصوري..." : "Ex: Clinique Vétérinaire El Bahia, Cabinet Dr. Mansouri..."}
                  value={answers.clinicName}
                  onChange={e => setAnswers({ ...answers, clinicName: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isRtl ? "اسم ولقب الدكتور البيطري المسؤول *" : "Nom complet du Docteur Vétérinaire titulaire *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? "مثال: د. محمد أمين زروقي..." : "Ex: Dr. Mohamed Amine Zerrouki..."}
                  value={answers.vetFullName}
                  onChange={e => setAnswers({ ...answers, vetFullName: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SPECIALTIES */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                {isRtl ? `المرحلة 2 من ${totalSteps} · التخصصات والحيوانات` : `Étape 2 sur ${totalSteps} · Disciplines & Patients`}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {isRtl ? "ما هي تخصصات ومجالات عملك البيطرية ؟" : "Quelles sont vos spécialités médicales ?"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isRtl ? "اختر جميع المجالات والحيوانات التي تستقبلها في عيادتك." : "Sélectionnez l'ensemble des domaines pris en charge dans votre cabinet."}
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { label: isRtl ? "كلاب وقطط (طب وجراحة الحيوانات الأليفة)" : "Canine & Féline (Chiens, Chats)", icon: "🐾" },
                { label: isRtl ? "جراحة الأنسجة الرخوة وجراحة العظام" : "Chirurgie des tissus mous & orthopédie", icon: "✂️" },
                { label: isRtl ? "الطب الوقائي والتلقيحات الدورية" : "Médecine préventive & vaccinations", icon: "💉" },
                { label: isRtl ? "خيول وفروسية (سباقات، خيول أصيلة)" : "Équidés (Chevaux de course, Fantasia, Élevage)", icon: "🐎" },
                { label: isRtl ? "أبقار وأغنام وماعز (صحة القطعان والمواشي)" : "Bovins, Ovins & Caprins (Santé du cheptel)", icon: "🐄" },
                { label: isRtl ? "طيور وزواحف وحيوانات خاصة (NAC)" : "Oiseaux, Reptiles & NAC (Nouveaux Animaux)", icon: "🦜" },
                { label: isRtl ? "الأمراض الجلدية والحساسية لدى الحيوان" : "Dermatologie & Allergologie animale", icon: "🔬" }
              ].map(spec => (
                <FuturisticBubble
                  key={spec.label}
                  label={spec.label}
                  icon={spec.icon}
                  color="emerald"
                  isRtl={isRtl}
                  isMulti={true}
                  selected={answers.specialties.includes(spec.label)}
                  onClick={() => toggleSpecialty(spec.label)}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: TECHNICAL EQUIPMENT */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                {isRtl ? `المرحلة 3 من ${totalSteps} · التجهيزات التقنية` : `Étape 3 sur ${totalSteps} · Plateau Technique`}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {isRtl ? "ما هي الأجهزة والتجهيزات المتوفرة في عيادتك ؟" : "Quels équipements techniques possédez-vous ?"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isRtl ? "يساعد في توجيه الحالات المستعجلة والمحولة من الزملاء حسب إمكانيات التشخيص." : "Permet d'orienter les cas référés par des confrères selon vos capacités."}
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { label: isRtl ? "جهاز إيكوغرافيا بيطري (Échographe Doppler)" : "Échographe vétérinaire (Doppler)", icon: "📟" },
                { label: isRtl ? "جهاز أشعة رقمية (Radiologie Numérique)" : "Appareil de radiologie numérique", icon: "🩻" },
                { label: isRtl ? "غرفة عمليات وتخدير بالغاز (Anesthésie gazeuse)" : "Bloc chirurgical et anesthésie gazeuse", icon: "🫁" },
                { label: isRtl ? "مخبر تحاليل دم فوري (Biochimie / Hématologie)" : "Analyseurs sanguins sur place", icon: "🩸" },
                { label: isRtl ? "مجهر بصري للتشخيص الخلوي والطفيلي" : "Microscope optique & cytologie", icon: "🔬" },
                { label: isRtl ? "جهاز تنظيف وتقليح الأسنان بالأمواج فوق الصوتية" : "Détartreur dentaire ultrasons vétérinaire", icon: "🦷" },
                { label: isRtl ? "أقفاص إيواء وعلاج بالأكسجين 24 ساعة" : "Cage d'oxygénothérapie & hospitalisation 24h", icon: "🏥" }
              ].map(eq => (
                <FuturisticBubble
                  key={eq.label}
                  label={eq.label}
                  icon={eq.icon}
                  color="emerald"
                  isRtl={isRtl}
                  isMulti={true}
                  selected={Boolean(answers.availableEquipment?.includes(eq.label))}
                  onClick={() => toggleEquipment(eq.label)}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: PATIENT VOLUME & EMERGENCIES */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                {isRtl ? `المرحلة 4 من ${totalSteps} · النشاط والمناوبة` : `Étape 4 sur ${totalSteps} · Volume & Gardes`}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {isRtl ? "حجم الاستشارات وتنظيم الطوارئ" : "Activité et organisation des urgences"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isRtl ? "لتنظيم توزيع الحالات الاستعجالية في ولايتك بدون إرهاق العيادات." : "Pour équilibrer la régulation des urgences vétérinaires sur votre Wilaya."}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isRtl ? "متوسط عدد الكشوفات اليومية *" : "Nombre moyen de consultations par jour *"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: isRtl ? "أقل من 10 مرضى / يوم" : "Moins de 10 patients / jour", icon: "🩺" },
                    { label: isRtl ? "10 إلى 25 فحصاً / يوم" : "10 à 25 consultations / jour", icon: "📊" },
                    { label: isRtl ? "أكثر من 25 مريضاً / يوم" : "Plus de 25 consultations / jour", icon: "🚀" }
                  ].map(v => (
                    <FuturisticBubble
                      key={v.label}
                      label={v.label}
                      icon={v.icon}
                      color="emerald"
                      isRtl={isRtl}
                      selected={answers.dailyPatientsCount === v.label}
                      onClick={() => {
                        soundEngine.playPop();
                        setAnswers({ ...answers, dailyPatientsCount: v.label });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isRtl ? "هل تؤمن خدمة مناوبة أو طوارئ ليلاً / عطلات ؟ *" : "Assurez-vous un service de garde ou urgences la nuit/weekend ? *"}
                </label>
                <div className="space-y-2.5">
                  {[
                    { label: isRtl ? "مناوبة هاتفية للحالات الطارئة الخاصة بمرضاي" : "Astreinte téléphonique pour urgences habituelles", icon: "📞" },
                    { label: isRtl ? "خدمة طوارئ واستقبال 24/24 مفتوحة للجميع" : "Service d'urgences 24h/24 ouvert au public", icon: "🚨" },
                    { label: isRtl ? "لا توجد مناوبة ليلية (إغلاق في المساء)" : "Pas de garde nocturne (fermeture en soirée)", icon: "🔒" },
                    { label: isRtl ? "مناوبة دورية بالتناوب مع الزملاء في الولاية" : "Gardes tournantes avec d'autres confrères", icon: "🔄" }
                  ].map(urg => (
                    <FuturisticBubble
                      key={urg.label}
                      label={urg.label}
                      icon={urg.icon}
                      color="emerald"
                      isRtl={isRtl}
                      selected={answers.emergencyService === urg.label}
                      onClick={() => {
                        soundEngine.playPop();
                        setAnswers({ ...answers, emergencyService: urg.label });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: ALGERIAN PRACTICE CHALLENGES */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                {isRtl ? `المرحلة 5 من ${totalSteps} · واقع الممارسة في الجزائر` : `Étape 5 sur ${totalSteps} · Réalités Professionnelles DZ`}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {isRtl ? "ما هي أكبر العوائق اليومية في ممارستك البيطرية ؟" : "Quels sont vos plus gros freins quotidiens ?"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isRtl ? "إجاباتكم ستساعدنا في تكييف البرنامج الرقمي وفق الصعوبات الحقيقية في الجزائر." : "Vos retours permettront d'adapter les outils aux contraintes algériennes."}
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { label: isRtl ? "الانقطاع المتكرر في تموين الأدوية واللقاحات والمضادات الحيوية" : "Ruptures d’approvisionnement régulières de vaccins et molécules", icon: "💊" },
                { label: isRtl ? "فقدان المربين لدفاتر التلقيح الورقية ونسيان مواعيد المتابعة" : "Perte fréquente des carnets et fiches de vaccination", icon: "📋" },
                { label: isRtl ? "رسائل واتساب ومكالمات عشوائية خارج أوقات العمل الرسمية" : "Appels et messages WhatsApp intempestifs hors horaires", icon: "📱" },
                { label: isRtl ? "غياب شبكة رقمية آمنة للاستشارة وتبادل الخبرات بين الأطباء في الجزائر" : "Absence d’un réseau de télé-expertise entre confrères DZ", icon: "🤝" },
                { label: isRtl ? "صعوبة إقناع بعض الزبائن بتكاليف التخدير والجراحة والتحاليل" : "Difficulté à faire comprendre le coût des actes et de l’anesthésie", icon: "💵" }
              ].map(ch => (
                <FuturisticBubble
                  key={ch.label}
                  label={ch.label}
                  icon={ch.icon}
                  color="emerald"
                  isRtl={isRtl}
                  isMulti={true}
                  selected={Boolean(answers.majorChallengesDz?.includes(ch.label))}
                  onClick={() => toggleChallenge(ch.label)}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: DESIRED DIAVET PRO MODULES */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                {isRtl ? `المرحلة 6 من ${totalSteps} · الوحدات البرمجية المطلوبة` : `Étape 6 sur ${totalSteps} · Vos Attentes Logicielles`}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {isRtl ? "ما هي الوحدات التي ترغب باستعمالها في DiaVet PRO ؟" : "Quels modules souhaitez-vous utiliser dans DiaVet PRO ?"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isRtl ? "حدد الأدوات التي ستسهل إدارة عيادتك وتوفر وقتك اليومي." : "Cochez les outils indispensables pour fluidifier votre cabinet."}
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                { label: isRtl ? "ملف مريض رقمي متكامل (تاريخ الكشوفات، لقاحات، صور الأشعة)" : "Dossier médical patient complet (historique, vaccins, imagerie)", icon: "📂" },
                { label: isRtl ? "وصفات طبية إلكترونية بـ QR Code مطابقة للمعايير الجزائرية" : "Ordonnances informatisées aux normes algériennes", icon: "📄" },
                { label: isRtl ? "أولوية التوثيق في دليل الطوارئ والعيادات المعتمدة 24/7" : "Référencement prioritaire dans l’annuaire d’urgences 24/7", icon: "🚨" },
                { label: isRtl ? "إدارة ذكية لمخزون الصيدلية والتنبيه بانتهاء الصلاحية" : "Gestion informatisée des stocks de pharmacie & alertes péremption", icon: "📦" },
                { label: isRtl ? "منصة استشارة طبية مغلقة ومحمية بين الزملاء في الجزائر" : "Plateforme de télé-expertise et avis confraternel sécurisé DZ", icon: "🔬" },
                { label: isRtl ? "تذكير تلقائي عبر واتساب / SMS للمربين بمواعيد التلقيح" : "Rappels automatiques par SMS/WhatsApp aux clients", icon: "🔔" }
              ].map(feat => (
                <FuturisticBubble
                  key={feat.label}
                  label={feat.label}
                  icon={feat.icon}
                  color="emerald"
                  isRtl={isRtl}
                  isMulti={true}
                  selected={Boolean(answers.desiredFeatures?.includes(feat.label))}
                  onClick={() => toggleFeature(feat.label)}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: CLINIC LOCATION & CONTACT & IDEAS */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                {isRtl ? `المرحلة 7 من ${totalSteps} · العنوان والأفكار` : `Étape 7 sur ${totalSteps} · Localisation & Contact Clinique`}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {isRtl ? "أين تقع عيادتك البيطرية ؟" : "Où est située votre structure ?"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isRtl ? "ستستعمل هذه المعلومات في الإدراج الرسمي للدليل البيطري الوطني." : "Ces coordonnées serviront au référencement officiel dans l'annuaire."}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isRtl ? "الولاية *" : "Wilaya d'implantation *"}
                </label>
                <select
                  value={answers.wilaya}
                  onChange={e => setAnswers({ ...answers, wilaya: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  {ALGERIAN_WILAYAS.map(w => (
                    <option key={w} value={w} className="bg-slate-900 text-white">{w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isRtl ? "البلدية أو المدينة *" : "Commune / Ville d'exercice *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? "مثال: حيدرة، عقيد لطفي، المنصورة، عين البنيان..." : "Ex: Hydra, Akid Lotfi, Mansourah, Ain Benian..."}
                  value={answers.commune}
                  onChange={e => setAnswers({ ...answers, commune: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isRtl ? "رقم الهاتف المهني للعيادة *" : "Numéro de téléphone professionnel du cabinet *"}
                </label>
                <input
                  type="tel"
                  required
                  placeholder={isRtl ? "مثال: 021 60 12 34 أو 0550 12 34 56" : "Ex: 021 60 12 34 ou 0550 12 34 56"}
                  value={answers.phoneContact}
                  onChange={e => setAnswers({ ...answers, phoneContact: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* VET IDEAS & FEATURE REQUEST BOX */}
              <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    <span>{isRtl ? "مقترحاتك وأفكارك الخاصة للبرنامج الطبي (اختياري) :" : "Vos suggestions & souhaits pour le logiciel DiaVet PRO (Optionnel) :"}</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    +100 XP PRO 🩺
                  </span>
                </div>

                <textarea
                  rows={3}
                  value={answers.userSuggestions || ''}
                  onChange={e => setAnswers({ ...answers, userSuggestions: e.target.value })}
                  placeholder={isRtl ? "أخبرنا باحتياجاتك الخاصة كطبيب بيطري (إضافات، تقارير، أدوات تحتاجها...)" : "Partagez vos idées cliniques (formats d'ordonnances, alertes, modules sur mesure...)"}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 transition-all resize-none"
                />

                {/* Quick Ideas Pills */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {isRtl ? "أفكار مقترحة بنقرة واحدة :" : "Idées rapides en 1 clic :"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickVetIdeas.map(idea => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => {
                          soundEngine.playPop();
                          setAnswers(prev => ({
                            ...prev,
                            userSuggestions: prev.userSuggestions 
                              ? `${prev.userSuggestions} · ${idea}`
                              : idea
                          }));
                        }}
                        className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-200 border border-white/10 hover:border-emerald-400/40 text-[11px] font-medium transition-all cursor-pointer"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                <p className="font-bold mb-1">{isRtl ? "✓ التسجيل في برنامج الشريك المؤسس" : "✓ Inscription au Programme Partenaire Fondateur"}</p>
                <p className="text-slate-400">
                  {isRtl ? "بتأكيد هذا النموذج، تستفيد من ترخيص DiaVet PRO مجاني وأولوية الإدراج في شبكة الطوارئ الوطنية." : "En validant ce formulaire, vous bénéficiez de la licence DiaVet PRO offerte et de l'accès prioritaire au réseau national de garde."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION CONTROLS */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
          >
            {isRtl ? "السابق" : "Précédent"}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:opacity-95 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{step === totalSteps ? (isRtl ? "تأكيد التسجيل الطبي والاعتماد 🚀" : "Confirmer mon Inscription PRO & Valider 🚀") : (isRtl ? "التالي ←" : "Suivant →")}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
