import React, { useState, useEffect } from 'react';
import { Language, OwnerAnswers, UserProfile } from '../types';
import { translations } from '../data/translations';
import { PET_TYPE_OPTIONS, ALGERIAN_WILAYAS, ANIMAL_SHOWCASE_PHOTOS, NUTRITION_PHOTOS } from '../data/mockData';
import { recordOwnerSubmission, generateVipCode } from '../services/adminDb';
import { soundEngine } from '../utils/soundEngine';
import FuturisticBubble from './FuturisticBubble';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ArrowRight, Check, Clock, Sparkles, 
  Heart, ShieldCheck, QrCode, Award, Mail,
  CheckCircle2, AlertCircle, MessageSquare, Lightbulb, Star,
  Camera, Image as ImageIcon, Flame, Zap
} from 'lucide-react';
import MagicEnvelopeModal from './MagicEnvelopeModal';
import DiaVetLogo from './DiaVetLogo';
import { isValidAlgerianPhone } from '../lib/validation';

interface OwnerQuestionnaireProps {
  currentLang: Language;
  userProfile?: Partial<UserProfile>;
  onFinish: (answers: OwnerAnswers) => void;
  onGoHome: () => void;
  onPreviewPortal: () => void;
  onOpenProfile?: () => void;
  onNavigateToScreen?: (screen: any) => void;
}

const OWNER_DRAFT_STORAGE_KEY = 'diavet_owner_questionnaire_draft_v1';

export default function OwnerQuestionnaire({
  currentLang,
  userProfile,
  onFinish,
  onGoHome,
  onPreviewPortal,
  onOpenProfile,
  onNavigateToScreen
}: OwnerQuestionnaireProps) {
  const t = translations[currentLang] || translations.fr;
  const isRtl = currentLang === 'ar';

  // Load saved draft if available
  const getSavedOwnerDraft = () => {
    try {
      const raw = localStorage.getItem(OWNER_DRAFT_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const savedDraft = getSavedOwnerDraft();

  // STEP STATE: 0=Intro, 1..14=Questions, 15=Suspense calculation, 16=VIP Pass
  const [step, setStep] = useState<number>(() => {
    if (savedDraft?.step && savedDraft.step > 0 && savedDraft.step <= 14) {
      return savedDraft.step;
    }
    return 0;
  });
  const totalSteps = 14;

  // Selected preview photo index for showcase
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<{ [key: string]: number }>({});

  // ANSWERS STATE
  const [answers, setAnswers] = useState<OwnerAnswers>(() => ({
    animalTypes: savedDraft?.answers?.animalTypes || [],
    petName: savedDraft?.answers?.petName || userProfile?.petName || '',
    petBreed: savedDraft?.answers?.petBreed || userProfile?.petBreed || '',
    petAge: savedDraft?.answers?.petAge || '',
    petWeight: savedDraft?.answers?.petWeight || '',
    petSex: savedDraft?.answers?.petSex || (userProfile?.petSex === 'male' ? (isRtl ? 'ذكر' : 'Mâle') : userProfile?.petSex === 'female' ? (isRtl ? 'أنثى' : 'Femelle') : ''),
    isVaccinated: savedDraft?.answers?.isVaccinated || '',
    rabiesVaccinated: savedDraft?.answers?.rabiesVaccinated || '',
    dewormingFrequency: savedDraft?.answers?.dewormingFrequency || '',
    isNeutered: savedDraft?.answers?.isNeutered || '',
    dietType: savedDraft?.answers?.dietType || '',
    feedingSource: savedDraft?.answers?.feedingSource || '',
    previousSurgeries: savedDraft?.answers?.previousSurgeries || '',
    antiParasiteTreatment: savedDraft?.answers?.antiParasiteTreatment || '',
    behaviorTraits: savedDraft?.answers?.behaviorTraits || [],
    playTimeDaily: savedDraft?.answers?.playTimeDaily || '',
    emergencyExperience: savedDraft?.answers?.emergencyExperience || '',
    hasFirstAidKit: savedDraft?.answers?.hasFirstAidKit || '',
    visitFrequency: savedDraft?.answers?.visitFrequency || '',
    mainChallenges: savedDraft?.answers?.mainChallenges || [],
    annualBudgetDzd: savedDraft?.answers?.annualBudgetDzd || '',
    wilaya: savedDraft?.answers?.wilaya || userProfile?.wilaya || '16 - Alger',
    commune: savedDraft?.answers?.commune || userProfile?.commune || '',
    expectedFeatures: savedDraft?.answers?.expectedFeatures || [],
    ownerName: savedDraft?.answers?.ownerName || userProfile?.name || userProfile?.fullName || '',
    ownerPhone: savedDraft?.answers?.ownerPhone || userProfile?.phone || '',
    userSuggestions: savedDraft?.answers?.userSuggestions || '',
    catLifestyle: savedDraft?.answers?.catLifestyle || '',
    catFivFelvTested: savedDraft?.answers?.catFivFelvTested || '',
    dogSize: savedDraft?.answers?.dogSize || '',
    dogLeishmaniaProtection: savedDraft?.answers?.dogLeishmaniaProtection || ''
  }));

  // Autosave answers & step to localStorage
  useEffect(() => {
    if (step >= 1 && step <= 14) {
      try {
        localStorage.setItem(OWNER_DRAFT_STORAGE_KEY, JSON.stringify({
          step,
          answers,
          updatedAt: new Date().toISOString()
        }));
      } catch (e) {
        console.warn('Failed to autosave owner questionnaire', e);
      }
    }
  }, [step, answers]);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [suspensePhase, setSuspensePhase] = useState<number>(0);
  const [suspenseProgress, setSuspenseProgress] = useState<number>(0);
  const [generatedVip, setGeneratedVip] = useState<string>('');
  const [showMagicEnvelope, setShowMagicEnvelope] = useState<boolean>(false);

  // Quick suggestion ideas
  const quickIdeas = isRtl ? [
    "تذكير تلقائي بالجرعات عبر واتساب 🔔",
    "توصيل أدوية وأكل للبيت 📦",
    "خريطة العيادات المفتوحة ليلاً 🌙",
    "استشارة بيطرية بالفيديو 💻",
    "سوق تبني معتمد ومجاني 🐾"
  ] : [
    "Rappels WhatsApp automatiques 🔔",
    "Livraison de croquettes & soins 📦",
    "Carte des urgences de nuit 24/7 🌙",
    "Téléconsultation vidéo sécurisée 💻",
    "Espace Adoption certifié DZ 🐾"
  ];

  // Primary animal helper
  const primaryAnimal = answers.animalTypes.includes('cat') 
    ? 'cat' 
    : answers.animalTypes.includes('dog') 
    ? 'dog' 
    : answers.animalTypes.includes('bird')
    ? 'bird'
    : answers.animalTypes.includes('rabbit')
    ? 'rabbit'
    : answers.animalTypes.includes('farm') 
    ? 'farm' 
    : answers.animalTypes[0] || 'cat';

  // Toggle multi-select animal types
  const toggleAnimalType = (typeId: string) => {
    soundEngine.playPop();
    setValidationError(null);
    setAnswers(prev => {
      const exists = prev.animalTypes.includes(typeId);
      const next = exists 
        ? prev.animalTypes.filter(id => id !== typeId)
        : [...prev.animalTypes, typeId];
      return { ...prev, animalTypes: next };
    });
  };

  // Toggle multi-select behavioral traits
  const toggleBehaviorTrait = (trait: string) => {
    soundEngine.playPop();
    setValidationError(null);
    setAnswers(prev => {
      const exists = prev.behaviorTraits?.includes(trait);
      const next = exists
        ? (prev.behaviorTraits || []).filter(t => t !== trait)
        : [...(prev.behaviorTraits || []), trait];
      return { ...prev, behaviorTraits: next };
    });
  };

  // Toggle multi-select challenges
  const toggleChallenge = (item: string) => {
    soundEngine.playPop();
    setValidationError(null);
    setAnswers(prev => {
      const exists = prev.mainChallenges?.includes(item);
      const next = exists
        ? (prev.mainChallenges || []).filter(c => c !== item)
        : [...(prev.mainChallenges || []), item];
      return { ...prev, mainChallenges: next };
    });
  };

  // Toggle multi-select features
  const toggleFeature = (item: string) => {
    soundEngine.playPop();
    setValidationError(null);
    setAnswers(prev => {
      const exists = prev.expectedFeatures?.includes(item);
      const next = exists
        ? (prev.expectedFeatures || []).filter(f => f !== item)
        : [...(prev.expectedFeatures || []), item];
      return { ...prev, expectedFeatures: next };
    });
  };

  // Suspense progress timer
  useEffect(() => {
    if (step === 15) {
      soundEngine.playSuccess();
      const interval = setInterval(() => {
        setSuspenseProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setStep(16);
              setShowMagicEnvelope(true);
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

  // Validation
  const validateCurrentStep = (): boolean => {
    switch (step) {
      case 1:
        if (!answers.animalTypes || answers.animalTypes.length === 0) {
          triggerShake(
            isRtl 
              ? 'يرجى اختيار نوع حيوان واحد على الأقل للمتابعة.'
              : 'Veuillez sélectionner au moins un type d’animal pour continuer.'
          );
          return false;
        }
        break;
      case 2:
        if (!answers.petName?.trim()) {
          triggerShake(
            isRtl 
              ? 'يرجى كتابة اسم حيوانك الأليف.'
              : 'Veuillez renseigner le nom de votre animal.'
          );
          return false;
        }
        if (!answers.petAge) {
          triggerShake(
            isRtl 
              ? 'يرجى تحديد الفئة العمرية للحيوان.'
              : 'Veuillez sélectionner la tranche d’âge de votre animal.'
          );
          return false;
        }
        break;
      case 3:
        if (!answers.dietType) {
          triggerShake(
            isRtl 
              ? 'يرجى تحديد نوع التغذية اليومية لحيوانك.'
              : 'Veuillez préciser le régime alimentaire de votre animal.'
          );
          return false;
        }
        break;
      case 4:
        if (!answers.isVaccinated) {
          triggerShake(
            isRtl 
              ? 'يرجى تحديد حالة التلقيحات العامة لحيوانك.'
              : 'Veuillez préciser le statut de vaccination générale.'
          );
          return false;
        }
        if (!answers.rabiesVaccinated) {
          triggerShake(
            isRtl 
              ? 'يرجى تحديد حالة التلقيح ضد داء الكلب (اللقاح السنوي).'
              : 'Veuillez préciser la vaccination antirabique (Rage).'
          );
          return false;
        }
        break;
      case 5:
        // Behavior & wellbeing
        break;
      case 6:
        // Emergencies
        break;
      case 7:
        if (!answers.visitFrequency) {
          triggerShake(
            isRtl 
              ? 'يرجى تحديد وتيرة زيارتك للطبيب البيطري.'
              : 'Veuillez sélectionner votre fréquence de consultation vétérinaire.'
          );
          return false;
        }
        break;
      case 8:
        if (!answers.mainChallenges || answers.mainChallenges.length === 0) {
          triggerShake(
            isRtl 
              ? 'يرجى اختيار صعوبة أو تحدٍ واحد على الأقل في الجزائر.'
              : 'Veuillez cocher au moins une difficulté rencontrée en Algérie.'
          );
          return false;
        }
        if (!answers.annualBudgetDzd) {
          triggerShake(
            isRtl 
              ? 'يرجى تحديد الميزانية السنوية التقديرية بالدينار (DZD).'
              : 'Veuillez sélectionner votre budget annuel estimé en Dinars (DZD).'
          );
          return false;
        }
        break;
      case 9:
        if (!answers.expectedFeatures || answers.expectedFeatures.length === 0) {
          triggerShake(
            isRtl 
              ? 'يرجى اختيار ميزة واحدة على الأقل تهمك في DiaVet.'
              : 'Veuillez sélectionner au moins une fonctionnalité souhaitée.'
          );
          return false;
        }
        break;
      case 10:
        if (!answers.ownerName?.trim() || answers.ownerName.trim().length < 2) {
          triggerShake(
            isRtl 
              ? 'يرجى كتابة اسمك ولقبك الكامل (حرفين على الأقل) لتفعيل بطاقة VIP.'
              : 'Veuillez indiquer votre prénom et nom (au moins 2 caractères) pour générer votre pass.'
          );
          return false;
        }
        if (!answers.ownerPhone?.trim() || !isValidAlgerianPhone(answers.ownerPhone)) {
          triggerShake(
            isRtl 
              ? 'يرجى إدخال رقم هاتف محمول جزائري صحيح (05 أو 06 أو 07 أو +213).'
              : 'Veuillez indiquer un numéro de portable algérien valide (ex: 05, 06, 07 ou +213).'
          );
          return false;
        }
        if (!answers.commune?.trim()) {
          triggerShake(
            isRtl 
              ? 'يرجى تحديد البلدية أو الحي السكني.'
              : 'Veuillez indiquer votre commune ou quartier de résidence.'
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
      setStep(prev => prev + 1);
    } else {
      // Final submission -> launch encryption suspense
      const vip = generateVipCode('owner', answers.wilaya || '16 - Alger');
      setGeneratedVip(vip);
      
      const completeAnswers = {
        ...answers,
        vipCode: vip,
        submittedAt: new Date().toISOString()
      };

      recordOwnerSubmission(completeAnswers, vip);
      soundEngine.playLevelUp();
      setStep(11);
    }
  };

  const handleBack = () => {
    soundEngine.playPop();
    setValidationError(null);
    if (step > 0) {
      setStep(prev => prev - 1);
    } else {
      onGoHome();
    }
  };

  // Animal categories with photo cards
  const animalChoices = [
    {
      id: 'cat',
      title: isRtl ? 'قط' : 'Chat',
      sub: isRtl ? 'أليف أو بلدي' : 'Européen, Siamois, Persan...',
      icon: '🐈',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
      color: 'cyan' as const
    },
    {
      id: 'dog',
      title: isRtl ? 'كلب' : 'Chien',
      sub: isRtl ? 'حراسة أو عائلة' : 'Berger, Golden, Malinois, Chiot...',
      icon: '🐕',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
      color: 'emerald' as const
    },
    {
      id: 'bird',
      title: isRtl ? 'طيور' : 'Oiseaux',
      sub: isRtl ? 'مقنين، كناري، درة' : 'Chardonneret (Maknin), Canari...',
      icon: '🦜',
      image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=600',
      color: 'amber' as const
    },
    {
      id: 'rabbit',
      title: isRtl ? 'أرانب وقوارض' : 'Lapins & Rongeurs',
      sub: isRtl ? 'أرنب قزم، كاباي' : 'Lapin nain, Cochon d\'Inde...',
      icon: '🐇',
      image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600',
      color: 'purple' as const
    },
    {
      id: 'farm',
      title: isRtl ? 'خيول ومواشي' : 'Chevaux & Élevage',
      sub: isRtl ? 'أحصنة، أبقار، أغنام' : 'Barbe arabe, Équins, Bovins...',
      icon: '🐎',
      image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=600',
      color: 'amber' as const
    },
    {
      id: 'reptile',
      title: isRtl ? 'زواحف وNAC' : 'Reptiles & NAC',
      sub: isRtl ? 'سلاحف، سحالي' : 'Tortues, Caméléons...',
      icon: '🦎',
      image: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&q=80&w=600',
      color: 'emerald' as const
    }
  ];

  return (
    <div className={`min-h-screen py-8 sm:py-12 px-3 sm:px-6 relative ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Magic Envelope Mascot Modal */}
      <MagicEnvelopeModal
        isOpen={showMagicEnvelope}
        onClose={() => setShowMagicEnvelope(false)}
        currentLang={currentLang}
        petName={answers.petName || (isRtl ? 'رفيقك' : 'Votre Compagnon')}
        ownerName={answers.ownerName || (isRtl ? 'عضو مميز' : 'Cher Membre')}
        vipCode={generatedVip}
        userRole="owner"
        onNavigateTo={(screen) => {
          setShowMagicEnvelope(false);
          if (onNavigateToScreen) {
            onNavigateToScreen(screen);
          } else {
            onPreviewPortal();
          }
        }}
      />

      {/* INTRO SCREEN (STEP 0) */}
      {step === 0 && (
        <div className="max-w-3xl mx-auto rounded-[2.5rem] p-6 sm:p-12 bg-slate-950/90 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden text-center space-y-8">
          
          <div className="flex justify-center">
            <DiaVetLogo className="h-14 sm:h-16 w-auto" />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20">
              {isRtl ? '🇩🇿 استبيان الملاك والمربين في الجزائر' : '🇩🇿 Consultation Nationale Propriétaires & Éleveurs'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              {isRtl ? 'شارك في بناء المنصة البيطرية الأولى' : 'Construisons l\'avenir de la santé animale en Algérie'}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              {isRtl
                ? 'إجاباتك ستساعدنا في تطوير الدفتر الصحي الرقمي، تنبيهات التلقيح، وربطك بأطباء الطوارئ في ولايتك.'
                : 'Participez à la co-création de DiaVet. Répondez à quelques questions illustrées et recevez votre Pass VIP Fondateur.'}
            </p>
          </div>

          {/* Value cards with photos & badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl shrink-0">
                🐾
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{isRtl ? 'دفتر رقمي 100%' : 'Carnet Numérique'}</h4>
                <p className="text-[11px] text-slate-400">{isRtl ? 'تاريخ التلقيحات والأدوية' : 'Suivi vaccinal & alertes'}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl shrink-0">
                🌙
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{isRtl ? 'طوارئ 24/7' : 'Urgences 24/7'}</h4>
                <p className="text-[11px] text-slate-400">{isRtl ? 'عيادات الحراسة المفتوحة' : 'Cliniques de garde 58 Wilayas'}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 text-xl shrink-0">
                🎁
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{isRtl ? 'مفاجأة VIP' : 'Cadeau VIP'}</h4>
                <p className="text-[11px] text-slate-400">{isRtl ? 'رسالة حصرية من قط DiaVet' : 'Pass exclusif & avant-première'}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                soundEngine.playLevelUp();
                setStep(1);
              }}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 hover:opacity-95 transition-all shadow-xl shadow-cyan-500/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isRtl ? 'بدء الاستبيان المصور 🚀' : 'Commencer le questionnaire 🚀'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGoHome}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl text-xs font-bold text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
            >
              {isRtl ? 'العودة للرئيسية' : 'Retour à l\'accueil'}
            </button>
          </div>

        </div>
      )}

      {/* SUSPENSE COMPUTATION SCREEN (STEP 11) */}
      {step === 11 && (
        <div className="max-w-xl mx-auto rounded-[2.5rem] p-8 sm:p-12 bg-slate-950/90 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <span className="text-3xl">🐾</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">
              {isRtl ? 'جاري تحليل إجاباتك وتشفير بطاقة VIP...' : 'Génération de votre Pass VIP DiaVet...'}
            </h3>
            <p className="text-xs text-cyan-300 font-mono">
              {suspensePhase === 0 && (isRtl ? 'ربط الملف بالشبكة البيطرية للولاية...' : 'Synchronisation avec le réseau de la wilaya...')}
              {suspensePhase === 1 && (isRtl ? 'حساب مؤشرات التغذية والرعاية الصحية...' : 'Calcul des alertes vaccinales & profil nutritionnel...')}
              {suspensePhase === 2 && (isRtl ? 'إصدار رمز الأمان الرقمي والهولوجرام...' : 'Génération du QR Code et du Pass Fondateur VIP...')}
              {suspensePhase === 3 && (isRtl ? 'تحضير رسالة المفاجأة مع قط DiaVet...' : 'Finalisation de l\'enveloppe surprise...')}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-white/10 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300 shadow-md shadow-cyan-500/50"
              style={{ width: `${suspenseProgress}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">{suspenseProgress}%</span>
        </div>
      )}

      {/* FINAL VIP PASS SCREEN (STEP 12) */}
      {step === 12 && (
        <div className="max-w-3xl mx-auto rounded-[2.5rem] p-6 sm:p-10 bg-slate-950/95 border-2 border-amber-500/50 backdrop-blur-2xl shadow-2xl relative overflow-hidden space-y-6 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{isRtl ? '🇩🇿 بطاقة العضوية الشرفية VIP - DiaVet' : '🇩🇿 Pass Fondateur VIP DiaVet Algérie'}</span>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-cyan-500/20 border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{isRtl ? 'حامل البطاقة' : 'Titulaire'}</span>
                <h3 className="text-lg font-black text-white">{answers.ownerName || 'Membre VIP'}</h3>
                <span className="text-xs text-cyan-300 font-bold">🐾 {answers.petName} ({answers.wilaya})</span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg">
                <QrCode className="w-full h-full text-slate-950" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 font-mono text-xs text-amber-300 font-bold">
              <span>CODE VIP : {generatedVip}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ACTIF ✓</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isRtl ? '🎉 مبروك ! تم تسجيلك وفتح جميع ميزات المربي' : '🎉 Félicitations ! Vos accès Propriétaire sont débloqués'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              {isRtl
                ? 'لقد تم فتح خدمات التبني والمتجر وبنك الأفكار وسجل الصحة الرقمي مجاناً بالكامل. اختر الوجهة التي ترغب في استكشافها الآن !'
                : 'Votre profil est validé. Vous pouvez dès maintenant explorer l\'Adoption Solidaire, l\'Animalerie & Pharmacie, la Boîte à Idées ou votre Carnet de Santé 3D !'}
            </p>
          </div>

          {/* Direct Module Access Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            {/* 1. Carnet & Bio-Scanner */}
            <div
              onClick={() => {
                soundEngine.playCyberClick();
                onFinish(answers);
                onPreviewPortal();
              }}
              className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                    {isRtl ? 'سجل الصحة والمسح الحيوي 3D' : 'Carnet de Santé & Bio-Scan'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isRtl ? 'متابعة اللقاحات والرعاية' : 'Vaccins, rappels & télémétrie'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold">🔓 Ouvert</span>
            </div>

            {/* 2. Adoption Solidaire */}
            <div
              onClick={() => {
                soundEngine.playCyberClick();
                onFinish(answers);
                if (onNavigateToScreen) {
                  onNavigateToScreen('adoption');
                } else {
                  onPreviewPortal();
                }
              }}
              className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-rose-500/40 hover:border-rose-400 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-rose-300 transition-colors">
                    {isRtl ? 'التبني التضامني (58 ولاية)' : 'Adoption Solidaire (58 Wilayas)'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isRtl ? 'إنقاذ وتبني حيوانات أليفة' : 'Refuges & sauvetages vérifiés'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold">🔓 Ouvert</span>
            </div>

            {/* 3. Marketplace Animalerie */}
            <div
              onClick={() => {
                soundEngine.playCyberClick();
                onFinish(answers);
                if (onNavigateToScreen) {
                  onNavigateToScreen('marketplace');
                } else {
                  onPreviewPortal();
                }
              }}
              className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                    {isRtl ? 'متجر الأغذية والأدوية DZD' : 'Animalerie & Pharmacie'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isRtl ? 'كروكات وأدوية بأسعار مباشرة' : 'Nutrition, litières & soins'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold">🔓 Ouvert</span>
            </div>

            {/* 4. Boite a idees */}
            <div
              onClick={() => {
                soundEngine.playCyberClick();
                onFinish(answers);
                if (onNavigateToScreen) {
                  onNavigateToScreen('ideas');
                } else {
                  onPreviewPortal();
                }
              }}
              className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                    {isRtl ? 'صندوق الأفكار والتصويت' : 'Boîte à Idées & Avis'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {isRtl ? 'اقتراح ميزات والتصويت' : 'Vos suggestions prioritaires'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold">🔓 Ouvert</span>
            </div>
          </div>

          {/* Strict Role-Based Disclaimer Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Suite Médicale Clinique réservée exclusivement aux Docteurs Vétérinaires (ONMV).</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
              Espace Propriétaire DZ
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                soundEngine.playLevelUp();
                setShowMagicEnvelope(true);
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
            >
              <Mail className="w-4 h-4" />
              <span>{isRtl ? 'فتح الرسالة المفاجأة مع قط DiaVet 🐱' : 'Ouvrir l\'Enveloppe Surprise du Chat 🐱'}</span>
            </button>

            <button
              onClick={() => {
                onFinish(answers);
                onPreviewPortal();
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 border border-white/15 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isRtl ? 'الدخول إلى فضائي المخصص ←' : 'Accéder à mon Espace Propriétaire →'}</span>
            </button>
          </div>

        </div>
      )}

      {/* QUESTIONNAIRE CORE (STEPS 1 TO 10) */}
      {step >= 1 && step <= totalSteps && (
        <div className={`max-w-4xl mx-auto rounded-[2.5rem] p-5 sm:p-10 bg-slate-950/90 border border-cyan-500/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden ${
          isShaking ? 'animate-shake' : ''
        }`}>
          
          {/* Header Progress & Logo */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isRtl ? 'رجوع' : 'Retour'}</span>
            </button>

            <div className="flex items-center gap-2">
              <DiaVetLogo className="h-7 w-auto" />
              <span className="text-xs font-black text-white hidden sm:inline">DiaVet</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400">
                {step}/{totalSteps}
              </span>
              <div className="w-20 sm:w-32 bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-teal-300 transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span className="font-semibold">{validationError}</span>
            </div>
          )}

          {/* STEP 1: ANIMAL SELECTION WITH HD PHOTO CARDS */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {isRtl ? `المرحلة 1 من ${totalSteps} · اختيار الرفقاء` : `Étape 1 sur ${totalSteps} · Choix des Animaux`}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {isRtl ? 'أي نوع من الحيوانات يشاركك حياتك اليومية ؟' : 'Quels compagnons partagent votre quotidien ?'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {isRtl ? 'يمكنك اختيار أكثر من حيوان بالضغط على البطاقات المصورة أدناه.' : 'Sélectionnez un ou plusieurs animaux en cliquant sur leurs photos illustrées.'}
                </p>
              </div>

              {/* Photo Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-5">
                {animalChoices.map(opt => {
                  const isSelected = answers.animalTypes.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => toggleAnimalType(opt.id)}
                      className={`group relative rounded-3xl overflow-hidden border-2 transition-all cursor-pointer flex flex-col justify-end p-4 aspect-[4/5] sm:aspect-square ${
                        isSelected 
                          ? 'border-cyan-400 shadow-xl shadow-cyan-500/25 scale-[1.02]' 
                          : 'border-white/10 hover:border-cyan-500/40 hover:scale-[1.01]'
                      }`}
                    >
                      {/* Background Image */}
                      <img
                        src={opt.image}
                        alt={opt.title}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Gradient Vignette for perfect text readability */}
                      <div className={`absolute inset-0 transition-opacity duration-300 ${
                        isSelected 
                          ? 'bg-gradient-to-t from-slate-950 via-slate-950/60 to-cyan-950/40 opacity-95' 
                          : 'bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-90 group-hover:opacity-85'
                      }`} />

                      {/* Check Badge Top Right */}
                      <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/50 scale-100' 
                          : 'bg-slate-900/80 border border-white/20 text-white/50 scale-90 opacity-70 group-hover:opacity-100'
                      }`}>
                        {isSelected ? <Check className="w-5 h-5 stroke-[3]" /> : <span className="text-xs font-mono">+</span>}
                      </div>

                      {/* Card Content Bottom */}
                      <div className="relative z-10 space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{opt.icon}</span>
                          <h3 className="text-base sm:text-lg font-black text-white">{opt.title}</h3>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-1">{opt.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Photo Showcase for Selected Animal */}
              {answers.animalTypes.length > 0 && (
                <div className="p-4 rounded-3xl bg-slate-900/80 border border-cyan-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span>{isRtl ? `معرض السلالات المتاحة (${answers.animalTypes.length} مختار)` : `Galerie des profils sélectionnés (${answers.animalTypes.length} choisis)`}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">HD Photography DZ</span>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {answers.animalTypes.map(animId => {
                      const photos = (ANIMAL_SHOWCASE_PHOTOS as any)[animId] || [];
                      return photos.map((photo: any, idx: number) => (
                        <div 
                          key={`${animId}-${idx}`}
                          className="shrink-0 w-36 sm:w-44 rounded-2xl overflow-hidden border border-white/10 bg-slate-950 relative group"
                        >
                          <img 
                            src={photo.url} 
                            alt={photo.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-24 sm:h-28 object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="p-2 text-[10px] text-slate-300 font-medium truncate bg-slate-950/90">
                            {photo.label}
                          </div>
                        </div>
                      ));
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PET IDENTITY & DETAILS */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {isRtl ? `المرحلة 2 من ${totalSteps} · بيانات الرفيق` : `Étape 2 sur ${totalSteps} · Fiche Compagnon`}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {isRtl ? 'أخبرنا عن رفيقك الرئيسي' : 'Présentez-nous votre animal principal'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {isRtl ? 'ستسجل هذه المعلومات في الدفتر الصحي الرقمي الرسمي.' : 'Ces informations figureront sur votre futur carnet de santé numérique DiaVet.'}
                </p>
              </div>

              <div className="space-y-4">
                {userProfile?.petName && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{isRtl ? "تم نقل اسم وسلالة الحيوان تلقائياً من تسجيلك دون الحاجة لإعادة الكتابة" : "Nom et profil de l'animal synchronisés depuis votre inscription"}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isRtl ? 'اسم الحيوان الأليف *' : 'Prénom ou nom de l\'animal *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRtl ? 'مثال: لونا، ميلو، سيمبا، مكس، سلطان...' : 'Ex: Max, Milo, Luna, Sultan, Rocky...'}
                    value={answers.petName}
                    onChange={e => setAnswers({ ...answers, petName: e.target.value })}
                    className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {isRtl ? 'السلالة أو النوع (اختياري)' : 'Race ou croisement (Optionnel)'}
                    </label>
                    <input
                      type="text"
                      placeholder={isRtl ? 'مثال: قط شيرازي، راعي ألماني، بلدي...' : 'Ex: Berger Allemand, Européen, Angora, Barbe...'}
                      value={answers.petBreed || ''}
                      onChange={e => setAnswers({ ...answers, petBreed: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {isRtl ? 'جنس الحيوان' : 'Sexe de l\'animal'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: isRtl ? 'ذكر' : 'Mâle', icon: '♂️' },
                        { label: isRtl ? 'أنثى' : 'Femelle', icon: '♀️' }
                      ].map(s => (
                        <FuturisticBubble
                          key={s.label}
                          label={s.label}
                          icon={s.icon}
                          isRtl={isRtl}
                          selected={answers.petSex === s.label}
                          onClick={() => {
                            soundEngine.playPop();
                            setAnswers({ ...answers, petSex: s.label });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {isRtl ? 'الفئة العمرية *' : 'Tranche d\'âge *'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { label: isRtl ? 'أقل من سنة' : '< 1 an', sub: isRtl ? 'صغير' : 'Chiot/Chaton', icon: '🍼' },
                        { label: isRtl ? '1 إلى 7 سنوات' : '1 à 7 ans', sub: isRtl ? 'بالغ' : 'Adulte', icon: '🐾' },
                        { label: isRtl ? '+7 سنوات' : '> 7 ans', sub: isRtl ? 'كبير' : 'Senior', icon: '👑' }
                      ].map(age => (
                        <FuturisticBubble
                          key={age.label}
                          label={age.label}
                          sublabel={age.sub}
                          icon={age.icon}
                          isRtl={isRtl}
                          selected={Boolean(answers.petAge?.includes(age.label))}
                          onClick={() => {
                            soundEngine.playPop();
                            setAnswers({ ...answers, petAge: `${age.label} (${age.sub})` });
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {isRtl ? 'الوزن التقريبي (كغ)' : 'Poids approximatif (kg)'}
                    </label>
                    <input
                      type="text"
                      placeholder={isRtl ? 'مثال: 4 كغ، 15 كغ، 30 كغ...' : 'Ex: 4.5 kg, 12 kg, 28 kg...'}
                      value={answers.petWeight || ''}
                      onChange={e => setAnswers({ ...answers, petWeight: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: NUTRITION & FEEDING IN ALGERIA (WITH PHOTOS) */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {isRtl ? `المرحلة 3 من ${totalSteps} · التغذية والأكل` : `Étape 3 sur ${totalSteps} · Nutrition & Alimentation`}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {isRtl ? 'كيف تغذي رفيقك يومياً في الجزائر ؟' : 'Quel est le mode d\'alimentation quotidien ?'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {isRtl ? 'تساعدنا معرفة نوعية الأكل في تقديم نصائح غذائية وتوفير الأغذية المناسبة.' : 'Permet d\'adapter les recommandations de diététique vétérinaire et les alertes de santé.'}
                </p>
              </div>

              {/* Nutrition Photo Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    id: 'Croquettes industrielles (Marques importées & locales)',
                    title: isRtl ? 'أغذية جافة (كروكيت Croquettes)' : 'Croquettes industrielles',
                    sub: isRtl ? 'ماركات مستوردة أو إنتاج محلي' : 'Marques importées (Royal Canin, Pro Plan...) & locales DZ',
                    image: NUTRITION_PHOTOS.kibble,
                    icon: '🥣'
                  },
                  {
                    id: 'Ration ménagère cuisinée maison',
                    title: isRtl ? 'طبخ منزلي (Ration Ménagère)' : 'Ration ménagère maison',
                    sub: isRtl ? 'لحم، دجاج، أرز وخضار مطبوخة' : 'Viande, poulet, riz & légumes préparés à la maison',
                    image: NUTRITION_PHOTOS.homemade,
                    icon: '🍗'
                  },
                  {
                    id: 'Alimentation mixte (Croquettes + Pâtée / Restes)',
                    title: isRtl ? 'تغذية مختلطة (كروكيت + طعام منزلي)' : 'Alimentation mixte',
                    sub: isRtl ? 'تنويع بين الأكل الجاف والمعلبات' : 'Alternance croquettes, pâtée humide et compléments',
                    image: NUTRITION_PHOTOS.mixed,
                    icon: '🥘'
                  },
                  {
                    id: 'Régime vétérinaire médicalisé spécifique',
                    title: isRtl ? 'حمية طبية بيطرية خاصة' : 'Aliment diététique vétérinaire',
                    sub: isRtl ? 'أمراض كلى، هضم، حساسية أو مفاصل' : 'Prescription médicale (rénal, gastro-intestinal, hypoallergénique)',
                    image: NUTRITION_PHOTOS.vetdiet,
                    icon: '🩺'
                  }
                ].map(food => {
                  const isSelected = answers.dietType === food.id;
                  return (
                    <div
                      key={food.id}
                      onClick={() => {
                        soundEngine.playPop();
                        setAnswers({ ...answers, dietType: food.id });
                      }}
                      className={`group relative rounded-3xl overflow-hidden border-2 transition-all cursor-pointer p-4 flex items-center gap-4 ${
                        isSelected 
                          ? 'border-cyan-400 bg-cyan-950/40 shadow-xl shadow-cyan-500/20 scale-[1.02]' 
                          : 'border-white/10 bg-slate-900/80 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 relative border border-white/10">
                        <img 
                          src={food.image} 
                          alt={food.title} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{food.icon}</span>
                          <h4 className="text-sm font-bold text-white truncate">{food.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{food.sub}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                        isSelected ? 'bg-cyan-400 border-cyan-300 text-slate-950' : 'border-white/20'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Feeding Supply in Algeria */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isRtl ? 'كيف تجد وفرة الأكل والأدوية في ولايتك ؟' : 'Disponibilité des aliments & compléments dans votre wilaya'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: isRtl ? 'متوفر بسهولة في المحلات' : 'Facilement disponible', icon: '✅' },
                    { label: isRtl ? 'صعوبة أحياناً في الماركات' : 'Ruptures occasionnelles', icon: '⚠️' },
                    { label: isRtl ? 'صعوبة مستمرة في التموين' : 'Difficile à trouver', icon: '⏳' }
                  ].map(sup => (
                    <FuturisticBubble
                      key={sup.label}
                      label={sup.label}
                      icon={sup.icon}
                      isRtl={isRtl}
                      selected={answers.feedingSource === sup.label}
                      onClick={() => {
                        soundEngine.playPop();
                        setAnswers({ ...answers, feedingSource: sup.label });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: VACCINATIONS & PREVENTATIVE CARE */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {isRtl ? `المرحلة 4 من ${totalSteps} · التلقيحات والصحة` : `Étape 4 sur ${totalSteps} · Santé & Vaccinations`}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {isRtl ? 'المتابعة الطبية والوقاية' : 'Statut vaccinal et soins préventifs'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {isRtl ? 'حدد وضعية التلقيحات لبرمجة التنبيهات الذكية قبل انتهاء الصلاحية.' : 'Indiquez l\'état des vaccins pour configurer vos alertes de rappel automatiques.'}
                </p>
              </div>

              <div className="space-y-4">
                {/* General Vaccines */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isRtl ? '1. التلقيحات الدورية العامة (TCL / CHPLR) *' : '1. Vaccination générale (Maladies courantes / Rappels annuels) *'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { label: isRtl ? 'ملقح بانتظام (محدث)' : 'Vacciné (À jour)', sub: isRtl ? 'دفتر التلقيح كامل ومحدث' : 'Rappels annuels effectués', icon: '💉', color: 'emerald' as const },
                      { label: isRtl ? 'ملقح جزئياً' : 'Partiellement vacciné', sub: isRtl ? 'تأخر في بعض الجرعات' : 'Retard sur certains rappels', icon: '⏳', color: 'amber' as const },
                      { label: isRtl ? 'غير ملقح' : 'Non vacciné', sub: isRtl ? 'لم يتلقَ لقاحات بعد' : 'Aucun vaccin administré', icon: '⚠️', color: 'rose' as const },
                      { label: isRtl ? 'أحتاج فحصاً بيطرياً' : 'Bilan vaccinal nécessaire', sub: isRtl ? 'لمعرفة اللقاحات المطلوبة' : 'À vérifier avec le vétérinaire', icon: '🔍', color: 'cyan' as const }
                    ].map(v => (
                      <FuturisticBubble
                        key={v.label}
                        label={v.label}
                        sublabel={v.sub}
                        icon={v.icon}
                        color={v.color}
                        isRtl={isRtl}
                        selected={answers.isVaccinated === v.label}
                        onClick={() => {
                          soundEngine.playPop();
                          setAnswers({ ...answers, isVaccinated: v.label });
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Rabies */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isRtl ? '2. التلقيح ضد داء الكلب (اللقاح السنوي الرسمي في الجزائر) *' : '2. Vaccination antirabique (Contre la rage - Recommandée DZ) *'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { label: isRtl ? 'نعم، ملقح ومحدث' : 'Oui, à jour', sub: isRtl ? 'محمي بالجرعة السنوية' : 'Vacciné avec rappel actif', icon: '🛡️', color: 'emerald' as const },
                      { label: isRtl ? 'غير ملقح ضد الكلب' : 'Non vacciné', sub: isRtl ? 'لا يوجد تلقيح للكلب' : 'Aucun vaccin antirabique', icon: '⚠️', color: 'rose' as const },
                      { label: isRtl ? 'سأبرمج الموعد قريباً' : 'À programmer', sub: isRtl ? 'في الزيارة القادمة' : 'Prochaine consultation', icon: '📅', color: 'amber' as const }
                    ].map(rab => (
                      <FuturisticBubble
                        key={rab.label}
                        label={rab.label}
                        sublabel={rab.sub}
                        icon={rab.icon}
                        color={rab.color}
                        isRtl={isRtl}
                        selected={answers.rabiesVaccinated === rab.label}
                        onClick={() => {
                          soundEngine.playPop();
                          setAnswers({ ...answers, rabiesVaccinated: rab.label });
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Antiparasite & Deworming */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {isRtl ? '3. علاج القراد والبراغيث (Pipette/Collier)' : '3. Traitement antiparasitaire externe (Tiques/Puces)'}
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { label: isRtl ? 'بانتظام كل شهر إلى 3 أشهر' : 'Régulier (Tous les 1 à 3 mois)', icon: '🛡️' },
                        { label: isRtl ? 'أحياناً في فصل الصيف فقط' : 'Occasionnel en saison chaude', icon: '☀️' },
                        { label: isRtl ? 'نادراً / لا أستعمل' : 'Rarement ou jamais', icon: '⚠️' }
                      ].map(p => (
                        <FuturisticBubble
                          key={p.label}
                          label={p.label}
                          icon={p.icon}
                          isRtl={isRtl}
                          selected={answers.antiParasiteTreatment === p.label}
                          onClick={() => {
                            soundEngine.playPop();
                            setAnswers({ ...answers, antiParasiteTreatment: p.label });
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {isRtl ? '4. طرد الديدان الباطنية (Vermifuge)' : '4. Traitement vermifuge interne'}
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { label: isRtl ? '2 إلى 4 مرات في السنة' : '2 à 4 fois par an (Recommandé)', icon: '💊' },
                        { label: isRtl ? 'مرة واحدة في السنة' : '1 fois par an', icon: '⏳' },
                        { label: isRtl ? 'لم أقم به من قبل' : 'Jamais vermifugé', icon: '⚠️' }
                      ].map(ver => (
                        <FuturisticBubble
                          key={ver.label}
                          label={ver.label}
                          icon={ver.icon}
                          isRtl={isRtl}
                          selected={answers.dewormingFrequency === ver.label}
                          onClick={() => {
                            soundEngine.playPop();
                            setAnswers({ ...answers, dewormingFrequency: ver.label });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: BEHAVIOR, PSYCHOLOGY & DAILY WELLBEING */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {isRtl ? `المرحلة 5 من ${totalSteps} · السلوك والرفاهية` : `Étape 5 sur ${totalSteps} · Comportement & Bien-être`}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {isRtl ? 'كيف تصف سلوك وحالة رفيقك النفسية ؟' : 'Comment décririez-vous son tempérament ?'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {isRtl ? 'اختر كل الصفات التي تنطبق على حيوانك (اختيار متعدد).' : 'Cochez les traits qui correspondent à votre animal (sélection multiple).'}
                </p>
              </div>

              {/* Behavior Traits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'calm', label: isRtl ? 'هادئ ومطيع جداً' : 'Calme, doux et très sociable', icon: '😇', color: 'emerald' as const },
                  { id: 'energetic', label: isRtl ? 'حيوي ويحب اللعب والحركة' : 'Très joueur et plein d\'énergie', icon: '⚡', color: 'cyan' as const },
                  { id: 'anxiety', label: isRtl ? 'قلق الانفصال عند غياب المربي' : 'Anxiété de séparation lors des absences', icon: '🥺', color: 'amber' as const },
                  { id: 'vet_fear', label: isRtl ? 'خوف شديد وتوتر عند زيارة البيطري' : 'Stress / Peur lors des visites vétérinaires', icon: '🩺', color: 'rose' as const },
                  { id: 'barking_scratching', label: isRtl ? 'نباح / مواء متكرر أو خربشة الأثاث' : 'Aboiements fréquents ou griffades sur meubles', icon: '🐾', color: 'purple' as const },
                  { id: 'protective', label: isRtl ? 'غيور أو يحمي منطقته وأصحابه' : 'Protecteur / Gardien de son territoire', icon: '🛡️', color: 'amber' as const }
                ].map(trait => (
                  <FuturisticBubble
                    key={trait.id}
                    label={trait.label}
                    icon={trait.icon}
                    color={trait.color}
                    isRtl={isRtl}
                    isMulti={true}
                    selected={Boolean(answers.behaviorTraits?.includes(trait.label))}
                    onClick={() => toggleBehaviorTrait(trait.label)}
                  />
                ))}
              </div>

              {/* Daily playtime */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isRtl ? 'الوقت اليومي المخصص للعب والمشي معه :' : 'Temps consacré au jeu & aux promenades quotidiennes :'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: isRtl ? 'أقل من 30 دقيقة' : '< 30 minutes / jour', icon: '⏳' },
                    { label: isRtl ? '30 دقيقة إلى ساعة' : '30 min à 1 heure', icon: '🎾' },
                    { label: isRtl ? 'أكثر من ساعة يومياً' : '> 1 heure / jour', icon: '🏃‍♂️' }
                  ].map(time => (
                    <FuturisticBubble
                      key={time.label}
                      label={time.label}
                      icon={time.icon}
                      isRtl={isRtl}
                      selected={answers.playTimeDaily === time.label}
                      onClick={() => {
                        soundEngine.playPop();
                        setAnswers({ ...answers, playTimeDaily: time.label });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: EMERGENCY READINESS & NIGHT CLINICS IN ALGERIA */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {isRtl ? `المرحلة 6 من ${totalSteps} · الطوارئ والليل` : `Étape 6 sur ${totalSteps} · Urgences & Gardes de Nuit`}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {isRtl ? 'جاهزيتك للطوارئ والعيادات الليلية في الجزائر' : 'Gestion des urgences vétérinaires en Algérie'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {isRtl ? 'لأن الطوارئ قد تحدث في أي وقت، نهدف لربطك فورياً بالأطباء المداومين 24/7.' : 'DiaVet développe un réseau d\'urgences 24h/24 interconnecté dans les 58 Wilayas.'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isRtl ? 'هل واجهت من قبل حالة طوارئ ليلية لحيوانك في الجزائر ؟' : 'Avez-vous déjà fait face à une urgence nocturne pour votre animal ?'}
                  </label>
                  <div className="space-y-2">
                    {[
                      { 
                        label: isRtl ? 'نعم، وواجهت صعوبة بالغة في إيجاد عيادة مفتوحة ليلاً' : 'Oui, avec de grandes difficultés pour trouver une clinique ouverte la nuit', 
                        sub: isRtl ? 'بحث في الفيسبوك أو اتصالات متكررة دون رد' : 'Recherche urgente sur réseaux sociaux ou appels sans réponse',
                        icon: '🚨', 
                        color: 'rose' as const 
                      },
                      { 
                        label: isRtl ? 'نعم، وتواصلت بنجاح مع طبيبي البيطري المعتاد' : 'Oui, mon vétérinaire habituel a pu intervenir à temps', 
                        sub: isRtl ? 'طبيب متجاوب خارج أوقات العمل' : 'Prise en charge réussie',
                        icon: '✅', 
                        color: 'emerald' as const 
                      },
                      { 
                        label: isRtl ? 'لا، لم أواجه حالة طوارئ ليلية حادة والحمد لله' : 'Non, jamais d\'urgence nocturne critique à ce jour', 
                        sub: isRtl ? 'أرغب بوجود خطة واضحة للطوارئ' : 'Souhaite être préparé',
                        icon: '🛡️', 
                        color: 'cyan' as const 
                      }
                    ].map(exp => (
                      <FuturisticBubble
                        key={exp.label}
                        label={exp.label}
                        sublabel={exp.sub}
                        icon={exp.icon}
                        color={exp.color}
                        isRtl={isRtl}
                        selected={answers.emergencyExperience === exp.label}
                        onClick={() => {
                          soundEngine.playPop();
                          setAnswers({ ...answers, emergencyExperience: exp.label });
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {isRtl ? 'هل تملك حقيبة إسعافات أولية لحيوانك في المنزل ؟' : 'Disposez-vous d\'une trousse de premiers secours pour votre animal ?'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { label: isRtl ? 'نعم، مجهزة بالمعقمات والضمادات' : 'Oui, trousse prête', icon: '🧰', color: 'emerald' as const },
                      { label: isRtl ? 'جزئياً (بعض المستلزمات)' : 'Partiellement équipée', icon: '🩹', color: 'amber' as const },
                      { label: isRtl ? 'لا، أحتاج دليلاً لما يجب شراؤه' : 'Non, besoin de conseils', icon: '📋', color: 'cyan' as const }
                    ].map(kit => (
                      <FuturisticBubble
                        key={kit.label}
                        label={kit.label}
                        icon={kit.icon}
                        color={kit.color}
                        isRtl={isRtl}
                        selected={answers.hasFirstAidKit === kit.label}
                        onClick={() => {
                          soundEngine.playPop();
                          setAnswers({ ...answers, hasFirstAidKit: kit.label });
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: VETERINARY CONSULTATIONS & FREQUENCY */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {isRtl ? `المرحلة 7 من ${totalSteps} · عادات الزيارات` : `Étape 7 sur ${totalSteps} · Consultations Médicales`}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {isRtl ? 'كم مرة تزور الطبيب البيطري ؟' : 'À quelle fréquence consultez-vous un vétérinaire ?'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {isRtl ? 'لمساعدتنا في ضبط التنبيهات الذكية وتسهيل حجز المواعيد مع العيادات.' : 'Pour dimensionner les rappels automatiques et fluidifier les prises de rendez-vous.'}
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: isRtl ? 'عدة مرات في السنة' : 'Plusieurs fois par an', sub: isRtl ? 'متابعة دورية، لقاحات وفحص عام' : 'Suivi régulier, vaccins & bilans', icon: '🩺' },
                  { label: isRtl ? 'مرة واحدة سنوياً' : 'Une fois par an', sub: isRtl ? 'فحص سنوي ولقاح داء الكلب' : 'Visite annuelle de routine', icon: '📅' },
                  { label: isRtl ? 'فقط في حالات الطوارئ أو المرض' : 'Uniquement en urgence / maladie', sub: isRtl ? 'استشارة فورية عند ظهور أعراض حادة' : 'Consultation ponctuelle en cas de symptôme', icon: '🚑' },
                  { label: isRtl ? 'نادراً جداً / لم أزر بعد' : 'Rarement / Jamais', sub: isRtl ? 'صعوبة الوصول للعيادات أو بعد المسافة' : 'Difficulté d\'accès ou éloignement', icon: '⏳' }
                ].map(item => (
                  <FuturisticBubble
                    key={item.label}
                    label={item.label}
                    sublabel={item.sub}
                    icon={item.icon}
                    isRtl={isRtl}
                    selected={answers.visitFrequency === item.label}
                    onClick={() => {
                      soundEngine.playPop();
                      setAnswers({ ...answers, visitFrequency: item.label });
                    }}
                  />
                ))}
              </div>

              {/* Sterilization */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isRtl ? 'هل تم تعقيم / إخصاء الحيوان ؟' : 'L\'animal est-il stérilisé / castré ?'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: isRtl ? 'نعم، معقم' : 'Oui, stérilisé(e)', sub: isRtl ? 'عملية جراحية سابقة' : 'Chirurgie effectuée', icon: '✂️' },
                    { label: isRtl ? 'لا، غير معقم' : 'Non, entier', sub: isRtl ? 'حيوان بكامل خصوبته' : 'Non stérilisé(e)', icon: '🌿' },
                    { label: isRtl ? 'مشروع مستقبلي' : 'En projet', sub: isRtl ? 'أرغب باستشارة بيطرية' : 'Conseil souhaité', icon: '📅' }
                  ].map(opt => (
                    <FuturisticBubble
                      key={opt.label}
                      label={opt.label}
                      sublabel={opt.sub}
                      icon={opt.icon}
                      isRtl={isRtl}
                      selected={answers.isNeutered === opt.label}
                      onClick={() => {
                        soundEngine.playPop();
                        setAnswers({ ...answers, isNeutered: opt.label });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: CHALLENGES & DZD BUDGET */}
          {step === 8 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {isRtl ? `المرحلة 8 من ${totalSteps} · التحديات والميزانية` : `Étape 8 sur ${totalSteps} · Réalités & Budget DZD`}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {isRtl ? 'ما هي أكبر الصعوبات التي تواجهها مع حيوانك في الجزائر ؟' : 'Quels obstacles rencontrez-vous le plus souvent ?'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {isRtl ? 'حدد جميع الصعوبات التي عشتها (يمكن اختيار أكثر من تحدٍ).' : 'Cochez les difficultés vécues en Algérie (sélection multiple).'}
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: isRtl ? 'صعوبة إيجاد عيادة مناوبة ليلاً أو في عطلة نهاية الأسبوع' : 'Trouver un vétérinaire de garde la nuit / weekend', sub: isRtl ? 'طوارئ 24/7 غير واضحة' : 'Urgences 24/7 difficiles d\'accès', icon: '🌙' },
                  { label: isRtl ? 'فقدان الدفتر الورقي ونسيان مواعيد اللقاحات' : 'Perte du carnet cartonné & oubli des rappels', sub: isRtl ? 'غياب تنبيهات هاتفية ذكية' : 'Aucune alerte SMS ou calendrier digital', icon: '📋' },
                  { label: isRtl ? 'انقطاع ونقص بعض الأدوية واللقاحات الخاصة' : 'Pénurie de vaccins et molécules spécifiques', sub: isRtl ? 'نقص دوري في الأدوية المستوردة' : 'Ruptures de stock périodiques en pharmacie', icon: '💊' },
                  { label: isRtl ? 'عدم وضوح أسعار الفحوصات والعمليات بالدينار' : 'Manque de visibilité sur les tarifs en Dinars (DZD)', sub: isRtl ? 'اختلاف التسعيرات بين العيادات' : 'Absence de grille claire d\'actes vétérinaires', icon: '💵' },
                  { label: isRtl ? 'طوابير طويلة وانتظار في قاعات الكشف بدون موعد محدد' : 'Attente longue sans prise de RDV précise', sub: isRtl ? 'ازدحام العيادات' : 'Salles d\'attente surchargées', icon: '⏱️' }
                ].map(ch => (
                  <FuturisticBubble
                    key={ch.label}
                    label={ch.label}
                    sublabel={ch.sub}
                    icon={ch.icon}
                    isRtl={isRtl}
                    isMulti={true}
                    selected={Boolean(answers.mainChallenges?.includes(ch.label))}
                    onClick={() => toggleChallenge(ch.label)}
                  />
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  {isRtl ? 'الميزانية السنوية التقريبية لرعاية الحيوان (بالدينار الجزائري) *' : 'Budget santé & alimentation annuel estimé (en Dinars DZD) *'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { label: isRtl ? 'أقل من 10,000 دج' : '< 10 000 DZD', sub: isRtl ? 'ميزانية معتدلة' : 'Budget modéré', icon: '🪙' },
                    { label: isRtl ? 'من 10,000 إلى 30,000 دج' : '10 000 à 30 000 DZD', sub: isRtl ? 'ميزانية متوسطة' : 'Budget standard', icon: '💳' },
                    { label: isRtl ? 'أكثر من 30,000 دج' : '> 30 000 DZD', sub: isRtl ? 'رعاية ممتازة وتغذية خاصة' : 'Soins & alimentation premium', icon: '💎' }
                  ].map(b => (
                    <FuturisticBubble
                      key={b.label}
                      label={b.label}
                      sublabel={b.sub}
                      icon={b.icon}
                      isRtl={isRtl}
                      selected={answers.annualBudgetDzd === b.label}
                      onClick={() => {
                        soundEngine.playPop();
                        setAnswers({ ...answers, annualBudgetDzd: b.label });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: EXPECTED DIAVET FEATURES */}
          {step === 9 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {isRtl ? `المرحلة 9 من ${totalSteps} · أولوياتك ومقترحاتك` : `Étape 9 sur ${totalSteps} · Vos Priorités DiaVet`}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {isRtl ? 'ما هي الميزات التي ترغب برؤيتها أولاً في DiaVet ؟' : 'Quelles fonctionnalités attendez-vous le plus ?'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {isRtl ? 'خياراتك تحدد مباشرة ترتيب إطلاق الميزات الجديدة.' : 'Vos choix déterminent directement l\'ordre de déploiement des futurs modules.'}
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: isRtl ? 'دفتر صحي وتلقيحات رقمي رسمي على الهاتف' : 'Carnet de santé numérique officiel sur smartphone', sub: isRtl ? 'تاريخ اللقاحات والأدوية دائماً معك' : 'Vaccins & antécédents toujours disponibles', icon: '📱' },
                  { label: isRtl ? 'تنبيهات تلقائية ذكية عبر واتساب بمواعيد اللقاحات' : 'Rappels automatiques de vaccins & vermifuges', sub: isRtl ? 'إشعار قبل انتهاء مفعول اللقاح' : 'Alertes WhatsApp ou SMS avant échéance', icon: '🔔' },
                  { label: isRtl ? 'حجز المواعيد عبر الإنترنت مع العيادات البيطرية' : 'Prise de rendez-vous en ligne avec les cliniques DZ', sub: isRtl ? 'تأكيد فوري بدون انتظار' : 'Créneaux confirmés sans attente en salle', icon: '📅' },
                  { label: isRtl ? 'دليل فوري لعيادات الطوارئ 24/7 مع نظام الملاحة' : 'Accès prioritaire aux urgences vétérinaires 24h/24', sub: isRtl ? 'العثور المباشر على الطبيب المداوم' : 'Trouver immédiatement la clinique de garde', icon: '🚨' },
                  { label: isRtl ? 'قسم مخصص لتبني الحيوانات مجاناً وبأمان' : 'Espace Adoption & Dons d\'animaux vérifiés DZ', sub: isRtl ? 'إعلانات تبني حقيقية ومفحوصة' : 'Annonces fiables et protégées', icon: '🐾' },
                  { label: isRtl ? 'متجر إلكتروني لتوصيل الأغذية والأدوية إلى البيت' : 'Boutique nutrition & soins livrés à domicile', sub: isRtl ? 'أكل طبي وعلاجات معتمدة' : 'Croquettes médicalisées et traitements agréés', icon: '📦' }
                ].map(f => (
                  <FuturisticBubble
                    key={f.label}
                    label={f.label}
                    sublabel={f.sub}
                    icon={f.icon}
                    isRtl={isRtl}
                    isMulti={true}
                    selected={Boolean(answers.expectedFeatures?.includes(f.label))}
                    onClick={() => toggleFeature(f.label)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STEP 10: WILAYA, COMMUNE, CONTACT & IDEAS BOX */}
          {step === 10 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  {isRtl ? `المرحلة 10 من ${totalSteps} · التفعيل وتأكيد VIP` : `Étape 10 sur ${totalSteps} · Activation VIP & Localisation`}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {isRtl ? 'أين نرسل بطاقة الـ VIP وجواز السفر ؟' : 'Où activer votre Pass VIP Fondateur ?'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {isRtl ? 'أدخل ولايتك، اسمك ورقم هاتفك، ويمكنك أيضاً مشاركتنا أي فكرة لتطوير DiaVet.' : 'Renseignez vos coordonnées et partagez librement vos idées pour l\'écosystème DiaVet DZ.'}
                </p>
              </div>

              {userProfile?.name && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isRtl ? "تمت مزامنة اسمك ورقم هاتفك وولايتك تلقائياً من تسجيلك دون الحاجة لإعادة كتابتها" : "Nom, téléphone et Wilaya déjà synchronisés depuis votre inscription DiaVet"}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {isRtl ? 'الولاية في الجزائر (1 إلى 58) *' : 'Wilaya de résidence (1 à 58) *'}
                    </label>
                    <select
                      value={answers.wilaya}
                      onChange={e => setAnswers({ ...answers, wilaya: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {ALGERIAN_WILAYAS.map(w => (
                        <option key={w} value={w} className="bg-slate-900 text-white">{w}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      {isRtl ? 'البلدية أو الحي السكني *' : 'Commune ou quartier *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? 'مثال: حيدرة، القبة، الشراقة، بئر الجير، باب الواد...' : 'Ex: Hydra, Kouba, Chéraga, Bir El Djir, Bab El Oued...'}
                      value={answers.commune || ''}
                      onChange={e => setAnswers({ ...answers, commune: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        {isRtl ? 'الاسم واللقب الرسمي *' : 'Votre Prénom et Nom *'}
                      </label>
                      {answers.ownerName && answers.ownerName.trim().length >= 2 && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {isRtl ? 'صحيح' : 'Valide'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={isRtl ? 'مثال: سارة بن علي، كريم منصوري...' : 'Ex: Sarah Benali, Karim Mansouri...'}
                      value={answers.ownerName || ''}
                      onChange={e => setAnswers({ ...answers, ownerName: e.target.value })}
                      className={`w-full p-3.5 rounded-2xl bg-slate-900 border text-white placeholder-slate-500 text-sm focus:outline-none transition-all ${
                        answers.ownerName && answers.ownerName.trim().length >= 2
                          ? 'border-emerald-500/50 focus:border-emerald-400'
                          : 'border-white/10 focus:border-cyan-400'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        {isRtl ? 'رقم الهاتف المحمول الجزائري *' : 'Numéro de portable algérien *'}
                      </label>
                      {answers.ownerPhone && (
                        isValidAlgerianPhone(answers.ownerPhone) ? (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {isRtl ? 'رقم صحيح' : 'Valide'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {isRtl ? 'غير مطابق (05/06/07)' : 'Invalide (05/06/07)'}
                          </span>
                        )
                      )}
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder={isRtl ? 'مثال: 0550 12 34 56 أو 0661 23 45 67' : 'Ex: 0550 12 34 56 ou 0661 23 45 67'}
                      value={answers.ownerPhone || ''}
                      onChange={e => setAnswers({ ...answers, ownerPhone: e.target.value })}
                      className={`w-full p-3.5 rounded-2xl bg-slate-900 border text-white placeholder-slate-500 text-sm font-mono focus:outline-none transition-all ${
                        answers.ownerPhone
                          ? isValidAlgerianPhone(answers.ownerPhone)
                            ? 'border-emerald-500/50 focus:border-emerald-400'
                            : 'border-rose-500/60 focus:border-rose-400'
                          : 'border-white/10 focus:border-cyan-400'
                      }`}
                    />
                  </div>
                </div>

                {/* USER IDEAS & WISHES BOX */}
                <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span>{isRtl ? 'أفكارك، مقترحاتك أو أي ميزة تحلم بها في DiaVet (اختياري) :' : 'Vos idées, souhaits ou suggestions pour DiaVet DZ (Optionnel) :'}</span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      +50 XP VIP ✨
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    value={answers.userSuggestions || ''}
                    onChange={e => setAnswers({ ...answers, userSuggestions: e.target.value })}
                    placeholder={isRtl ? 'أخبرنا بكل ما تتمناه في التطبيق (أفكار، ميزات جديدة، حلول لمشاكل واجهتك...)' : 'Partagez librement vos souhaits (fonctionnalités de rêve, besoins spécifiques, avis...)'}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-all resize-none"
                  />

                  {/* Quick Idea Bubbles */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {isRtl ? 'أفكار سريعة بنقرة واحدة :' : 'Suggestions rapides en 1 clic :'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickIdeas.map(idea => (
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
                          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 border border-white/10 hover:border-amber-400/40 text-[11px] font-medium transition-all cursor-pointer"
                        >
                          {idea}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>{isRtl ? 'سيتم إنشاء بطاقة VIP الحصرية ورسالة المفاجأة فور النقر على تأكيد' : 'Votre Pass VIP et l\'Enveloppe Surprise seront générés instantanément'}</span>
                  </p>
                  <p className="text-slate-400">
                    {isRtl ? 'بياناتك محمية تماماً وستستعمل فقط في تفعيل الدفتر الرقمي والتنبيهات في ولايتك.' : 'Vos données restent confidentielles et serviront à vous notifier lors de l’ouverture du carnet numérique.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM CONTROLS */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
            >
              {isRtl ? 'السابق' : 'Précédent'}
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 hover:opacity-95 transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{step === totalSteps ? (isRtl ? 'تأكيد الإجابات وتفعيل بطاقة VIP 🚀' : 'Valider mes réponses & Débloquer mon VIP 🚀') : (isRtl ? 'التالي ←' : 'Suivant →')}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
