import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, VetAnswers, AppScreen } from '../types';
import { translations, getTranslations } from '../data/translations';
import { tabContentVariants } from '../utils/transitions';
import { 
  Stethoscope, Calendar, Users, FileText, Pill, 
  Boxes, ChevronLeft, Check, Printer, AlertCircle, Plus, QrCode,
  BarChart3, Radio, Bell, Send, Clock, BellRing,
  Heart, Building2, ShoppingBag, BookOpen, Lightbulb, Tv, Award, Sparkles
} from 'lucide-react';
import DiaVetLogo from './DiaVetLogo';
import AnalyticsDashboard from './AnalyticsDashboard';
import VetVisitsChart from './VetVisitsChart';
import { 
  subscribeToVetLiveQueue, 
  subscribeToPortalNotifications, 
  updatePatientStatusInFirestore, 
  sendPortalNotification,
  addLiveHealthEntry,
  LiveAppointment,
  LivePortalNotification
} from '../services/firebase';
import { 
  sendClinicAppointmentPushAlert, 
  sendPersonalizedHealthReminder 
} from '../services/firebaseMessaging';

interface VetPortalPreviewProps {
  currentLang: Language;
  onGoHome: () => void;
  userAnswers?: VetAnswers;
  onNavigateToScreen?: (screen: AppScreen) => void;
  onOpenProfile?: () => void;
}

export default function VetPortalPreview({
  currentLang,
  onGoHome,
  userAnswers,
  onNavigateToScreen,
  onOpenProfile
}: VetPortalPreviewProps) {
  const t = getTranslations(currentLang);
  const isRtl = currentLang === 'ar';
  const isEn = currentLang === 'en';
  const [activeTab, setActiveTab] = useState<'analytics' | 'schedule' | 'rx' | 'stock'>('analytics');

  // Ordonnance generator state
  const [rxPatient, setRxPatient] = useState('Max (Chien Golden - M. Karim)');
  const [rxDrug, setRxDrug] = useState('Amoxicilline + Acide Clavulanique (Synulox 250mg)');
  const [rxDose, setRxDose] = useState('1 comprimé matin et soir pendant 7 jours');
  const [rxGenerated, setRxGenerated] = useState(false);
  const [isSyncingRx, setIsSyncingRx] = useState(false);

  // Quick broadcast notification state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Patient queue default + Firestore real-time onSnapshot queue
  const [patients, setPatients] = useState<LiveAppointment[]>([
    { id: 'mock-1', petName: 'Max (Golden Retriever)', ownerName: 'Karim M.', timeSlot: '09:30', reason: 'Vaccin annuel Rage & CHPPiL', status: 'Terminé', wilaya: '16 - Alger' },
    { id: 'mock-2', petName: 'Minou (Siamois)', ownerName: 'Amira B.', timeSlot: '10:15', reason: 'Dermatite atopique & prurit', status: 'En cours', wilaya: '16 - Alger' },
    { id: 'mock-3', petName: 'Rocky (Berger Allemand)', ownerName: 'Sofiane K.', timeSlot: '11:00', reason: 'Boiterie patte avant droite', status: 'En attente', wilaya: '16 - Alger' },
    { id: 'mock-4', petName: 'Luna (Chat de gouttière)', ownerName: 'Yasmine D.', timeSlot: '11:45', reason: 'Contrôle post-stérilisation', status: 'En attente', wilaya: '16 - Alger' }
  ]);

  const [liveNotifications, setLiveNotifications] = useState<LivePortalNotification[]>([]);

  const wilaya = userAnswers?.wilaya || '16 - Alger';
  const clinicName = userAnswers?.clinicName || (isRtl ? 'عيادة الأبيار البيطرية' : isEn ? 'El Biar Veterinary Clinic' : 'Cabinet El Biar');

  // Firebase Realtime onSnapshot Listeners
  useEffect(() => {
    // 1. Subscribe to Live Appointments Queue
    const unsubQueue = subscribeToVetLiveQueue(wilaya, (liveAppts) => {
      if (liveAppts.length > 0) {
        // Merge or replace with live appointments
        setPatients(prev => {
          // Keep mock items that don't collide with live ones
          const nonMockLive = liveAppts;
          return [...nonMockLive, ...prev.filter(p => !p.id.startsWith('appt-') && !nonMockLive.some(nl => nl.id === p.id))];
        });
      }
    });

    // 2. Subscribe to Vet Portal Notifications
    const unsubNotifs = subscribeToPortalNotifications('vet', wilaya, (notifs) => {
      setLiveNotifications(notifs);
    });

    return () => {
      unsubQueue();
      unsubNotifs();
    };
  }, [wilaya]);

  const togglePatientStatus = async (patient: LiveAppointment) => {
    const nextStatus = patient.status === 'En attente' 
      ? 'En cours' 
      : patient.status === 'En cours' 
      ? 'Terminé' 
      : 'En attente';

    // Optimistic local update
    setPatients(prev => prev.map(p => p.id === patient.id ? { ...p, status: nextStatus } : p));

    // Update in Firestore
    await updatePatientStatusInFirestore(patient.id, nextStatus);

    // If calling patient to consultation room, trigger direct push alert
    if (nextStatus === 'En cours') {
      try {
        await sendClinicAppointmentPushAlert({
          petName: patient.petName,
          ownerName: patient.ownerName,
          veterinarianName: `Dr. Amine Benali`,
          clinicName,
          date: (patient as any).date || new Date().toISOString().slice(0, 10),
          timeSlot: patient.timeSlot,
          wilaya,
          status: 'tour_actuel'
        });
      } catch (e) {
        console.warn('Push alert error:', e);
      }
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    setIsSendingBroadcast(true);
    await sendPortalNotification({
      targetRole: 'owner',
      wilaya,
      title: broadcastTitle,
      message: broadcastMessage,
      sender: clinicName
    });

    // Also dispatch push reminder stream
    try {
      await sendPersonalizedHealthReminder({
        petName: 'Tous les patients DiaVet',
        ownerName: 'Propriétaires de la Wilaya',
        reminderType: 'emergency',
        title: `🩺 Alerte Clinique (${clinicName}) : ${broadcastTitle}`,
        message: broadcastMessage,
        wilaya,
        scheduledDate: new Date().toISOString().slice(0, 10),
        targetRole: 'owner'
      });
    } catch (e) {
      console.warn('Push broadcast error:', e);
    }

    setBroadcastTitle('');
    setBroadcastMessage('');
    setIsSendingBroadcast(false);
    setShowBroadcastModal(false);
  };

  const handleGenerateAndSyncRx = async () => {
    setRxGenerated(true);
    setIsSyncingRx(true);

    const targetPet = rxPatient.split('(')[0].trim();

    // Also sync prescription to health record in Firestore
    await addLiveHealthEntry({
      petName: targetPet,
      type: 'treatment',
      title: `Ordonnance : ${rxDrug}`,
      details: rxDose,
      veterinarianName: `Dr. Amine Benali (${clinicName})`,
      wilaya,
      date: new Date().toISOString().slice(0, 10),
      status: 'normal'
    });

    // Dispatch push reminder for the medication follow-up
    try {
      await sendPersonalizedHealthReminder({
        petName: targetPet,
        ownerName: 'Propriétaire',
        reminderType: 'medication',
        title: `💊 Ordonnance émise pour ${targetPet}`,
        message: `${rxDrug} : ${rxDose}. Suivez la posologie délivrée par ${clinicName}.`,
        wilaya,
        scheduledDate: new Date().toISOString().slice(0, 10),
        targetRole: 'owner'
      });
    } catch (e) {
      console.warn('Push Rx error:', e);
    }

    setIsSyncingRx(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white mb-2 cursor-pointer"
          >
            <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            <span>{t.btnBack}</span>
          </button>
          <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
            <span>{isRtl ? 'بوابة الطبيب البيطري' : isEn ? 'Veterinary Portal' : 'Espace Vétérinaire'}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              {isRtl ? 'اتصال مباشر بالسحابة' : isEn ? 'Cloud Live Sync' : 'onSnapshot Actif'}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowBroadcastModal(true)}
            className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Alerter Propriétaires</span>
          </button>

          <div className={`${isRtl ? 'text-left' : 'text-right'} hidden sm:block`}>
            <p className="text-sm font-bold text-white">Dr. Amine Benali</p>
            <p className="text-xs text-emerald-400 font-medium">{clinicName} · {wilaya}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
            🩺
          </div>
        </div>
      </div>

      {/* QUICK CROSS-MODULES NAVIGATION FOR VETS */}
      {onNavigateToScreen && (
        <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isRtl ? "أقسام المنصة الأخرى :" : "Accès aux autres sections DiaVet :"}</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => onNavigateToScreen('adoption')}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all hover:scale-105"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{isRtl ? "التبني" : "Adoption"}</span>
            </button>

            <button
              onClick={() => onNavigateToScreen('dz-directory')}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all hover:scale-105"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{isRtl ? "الدليل" : "Annuaire DZ"}</span>
            </button>

            <button
              onClick={() => onNavigateToScreen('marketplace')}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all hover:scale-105"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isRtl ? "المتجر" : "Pharmacie"}</span>
            </button>

            <button
              onClick={() => onNavigateToScreen('articles')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all hover:scale-105"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isRtl ? "المقالات" : "Articles"}</span>
            </button>

            <button
              onClick={() => onNavigateToScreen('ideas')}
              className="px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all hover:scale-105"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{isRtl ? "الأفكار" : "Idées"}</span>
            </button>

            <button
              onClick={() => onNavigateToScreen('videos')}
              className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all hover:scale-105"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>DiaVet TV</span>
            </button>

            <button
              onClick={() => {
                if (onOpenProfile) onOpenProfile();
                else onNavigateToScreen('profile');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all hover:scale-105"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isRtl ? "الملف" : "Profil Pro"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Flash Modal */}
      {showBroadcastModal && (
        <form onSubmit={handleSendBroadcast} className="mb-6 p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-3 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              Envoyer une Notification Directe (onSnapshot Firestore)
            </h4>
            <button
              type="button"
              onClick={() => setShowBroadcastModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Titre de l'annonce :</label>
              <input
                type="text"
                required
                placeholder="Ex: Campagne de rappel vaccin Rage, Créneau libre..."
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Cible & Wilaya :</label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300">
                Tous les propriétaires inscrits à {wilaya}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Message d'alerte :</label>
            <textarea
              rows={2}
              required
              placeholder="Texte complet de la notification qui s'affichera instantanément chez les propriétaires..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
            />
          </div>

          <button
            type="submit"
            disabled={isSendingBroadcast}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isSendingBroadcast ? 'Diffusion Cloud...' : 'Diffuser en Temps Réel à la Wilaya →'}
          </button>
        </form>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
          <p className="text-xs font-semibold text-slate-400">
            {isRtl ? 'استشارات اليوم' : isEn ? "Today's Consultations" : 'Consultations du jour'}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">{patients.length}</p>
          <span className="text-[10px] text-emerald-400 font-bold">
            {isRtl ? '● تحديث مباشر' : isEn ? '● Live Queue' : `● ${patients.filter(p => p.status === 'Terminé').length} terminées`}
          </span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
          <p className="text-xs font-semibold text-slate-400">
            {isRtl ? 'تذكيرات SMS مرسلة' : isEn ? 'SMS Reminders Sent' : 'Rappels SMS envoyés'}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">32</p>
          <span className="text-[10px] text-cyan-300 font-bold">
            {isRtl ? 'تلقيحات ومواعيد DZ' : isEn ? 'Vaccines & Appointments' : 'Vaccins & rdv DZ'}
          </span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
          <p className="text-xs font-semibold text-slate-400">
            {isRtl ? 'الإيرادات اليومية' : isEn ? 'Estimated Daily Revenue' : 'Recettes estimées (DZD)'}
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">48,500 DZD</p>
          <span className="text-[10px] text-slate-400">
            {isRtl ? 'متوسط الفحص 3,500 دج' : isEn ? 'Avg consult 3,500 DZD' : 'Moyenne consultation 3,500'}
          </span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
          <p className="text-xs font-semibold text-slate-400">
            {isRtl ? 'تنبيه مخزون اللقاح' : isEn ? 'Vaccine Stock Alert' : 'Alerte Stock Vaccin'}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">2</p>
          <span className="text-[10px] text-amber-300 font-bold">
            {isRtl ? 'مخزون حرج' : isEn ? 'Critical Stock' : 'Rupture imminente'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 mb-8 max-w-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{isRtl ? 'إحصائيات الزيارات' : isEn ? 'Visits & Analytics' : 'Statistiques Visites'}</span>
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'schedule'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isRtl ? 'جدول المواعيد' : isEn ? 'Daily Schedule' : 'Planning du Jour'}</span>
        </button>
        <button
          onClick={() => setActiveTab('rx')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'rx'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isRtl ? 'محرر الوصفات' : isEn ? 'Rx Generator' : 'Ordonnances'}</span>
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'stock'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>{isRtl ? 'المخزون والأدوية' : isEn ? 'Stock & Pharmacy' : 'Stocks & Pharmacie'}</span>
        </button>
      </div>

      {/* Animated Tabs Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          {/* TAB 0: D3 ANALYTICS DASHBOARD */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              currentLang={currentLang}
              wilaya={wilaya}
              clinicName={clinicName}
            />
          )}

          {/* TAB 1: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="rounded-3xl p-6 border border-white/10 bg-slate-950/70 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <span>File d'attente des consultations (Sync Live)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono flex items-center gap-1 border border-emerald-500/30">
                      <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" /> onSnapshot
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Cliquez sur un statut pour le changer en temps réel dans Firestore</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">Date : Aujourd'hui</span>
              </div>

              <div className="space-y-3">
                {patients.map(patient => (
                  <div
                    key={patient.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/30 transition-colors animate-fade-in"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-14 h-10 rounded-xl bg-slate-900 border border-white/10 font-mono font-bold text-xs text-cyan-400 flex items-center justify-center">
                        {patient.timeSlot || '09:30'}
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-white flex items-center gap-2">
                          <span>{patient.petName}</span>
                          {patient.id.startsWith('appt-') && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                              Nouveau RDV Web
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">
                          Propriétaire : {patient.ownerName} {patient.phone ? `(${patient.phone})` : ''} · Motif : {patient.reason}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePatientStatus(patient)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        patient.status === 'Terminé'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : patient.status === 'En cours'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                      }`}
                    >
                      {patient.status}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ORDONNANCE GENERATOR */}
          {activeTab === 'rx' && (
            <div className="grid lg:grid-cols-12 gap-8">
              
              {/* Form */}
              <div className="lg:col-span-6 rounded-3xl p-6 border border-white/10 bg-slate-950/70 backdrop-blur-xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Générer une ordonnance homologuée</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Patient & Propriétaire :</label>
                  <input
                    type="text"
                    value={rxPatient}
                    onChange={e => setRxPatient(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Médicament vétérinaire prescrit :</label>
                  <input
                    type="text"
                    value={rxDrug}
                    onChange={e => setRxDrug(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Posologie & Mode d'emploi :</label>
                  <textarea
                    value={rxDose}
                    onChange={e => setRxDose(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                  />
                </div>

                <button
                  type="button"
                  disabled={isSyncingRx}
                  onClick={handleGenerateAndSyncRx}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSyncingRx ? 'Synchronisation Cloud...' : "Générer et Transmettre au Carnet Numérique →"}</span>
                </button>
              </div>

              {/* Printable Preview */}
              <div className="lg:col-span-6">
                <div className="rounded-3xl p-6 border-2 border-emerald-500/40 bg-white text-slate-900 shadow-2xl relative overflow-hidden font-sans">
                  {/* Header */}
                  <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-wider text-emerald-700">
                        Dr. Amine Benali
                      </h4>
                      <p className="text-[11px] font-bold text-slate-700">Docteur en Médecine Vétérinaire</p>
                      <p className="text-[10px] text-slate-600">N° Ordre National des Vétérinaires DZ : 16/4892</p>
                      <p className="text-[10px] text-slate-500">Cabinet El Biar, Alger · Tél : +213 21 92 14 00</p>
                    </div>
                    <div className="text-right">
                      <div className="flex justify-end">
                        <DiaVetLogo size="xs" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 mt-1 block">Ord. Numérique DiaVet</span>
                    </div>
                  </div>

                  {/* Patient info */}
                  <div className="bg-slate-100 p-2.5 rounded-lg mb-4 text-xs font-semibold">
                    <span className="text-slate-500">Patient : </span>
                    <span className="text-slate-900 font-bold">{rxPatient}</span>
                  </div>

                  {/* Prescription Body */}
                  <div className="min-h-[140px] space-y-3 text-xs">
                    <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">Prescription :</p>
                    <div className="pl-3 border-l-2 border-emerald-500">
                      <p className="font-extrabold text-sm text-slate-900">{rxDrug}</p>
                      <p className="text-slate-700 mt-1">{rxDose}</p>
                    </div>
                  </div>

                  {/* Footer with Signature and QR */}
                  <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-end">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <QrCode className="w-9 h-9 text-slate-800" />
                      <span>Vérification ordonnance DZ<br/>Anti-falsification</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Date : 19 Septembre 2026</p>
                      <p className="text-xs font-serif italic font-bold text-emerald-800 mt-1">Signature & Cachet Dr. Benali</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PHARMACY STOCK */}
          {activeTab === 'stock' && (
            <div className="rounded-3xl p-6 border border-white/10 bg-slate-950/70 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-emerald-400" />
                  <span>Stock Médicaments & Vaccins</span>
                </h3>
                <span className="text-xs font-bold text-emerald-400">Inventaire en temps réel</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Rabisin (Vaccin Antirabique Monodose)</p>
                    <p className="text-xs text-slate-400">Laboratoire Boehringer / Merial · Lot: 884-DZ</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                      4 flacons (Stock critique)
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Canigen CHPPiL (Vaccin Combiné Chien)</p>
                    <p className="text-xs text-slate-400">Virbac · Lot: V-2026-09</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                      28 doses disponibles
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Bravecto Comprimés Chien (20-40kg)</p>
                    <p className="text-xs text-slate-400">MSD Santé Animale</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                      15 boîtes en stock
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
