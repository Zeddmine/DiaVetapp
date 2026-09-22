import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, OwnerAnswers, Badge } from '../types';
import { translations, getTranslations } from '../data/translations';
import { tabContentVariants } from '../utils/transitions';
import { 
  Heart, Calendar, AlertTriangle, ShieldCheck, 
  ChevronLeft, Plus, Phone, Clock, FileText, CheckCircle, Sparkles, MapPin, Award, ArrowRight,
  Activity, Crown, Scan, Scale, Bell, Radio, Check, Stethoscope, BellRing
} from 'lucide-react';
import FuturisticBioScanner from './FuturisticBioScanner';
import HolographicVipCard from './HolographicVipCard';
import PetWeightTracker from './PetWeightTracker';
import { 
  subscribeToHealthUpdates, 
  subscribeToPortalNotifications, 
  addLiveHealthEntry, 
  addLiveAppointment,
  LiveHealthUpdate,
  LivePortalNotification
} from '../services/firebase';
import { 
  subscribeToClinicalDossiers, 
  subscribeToUserProfile, 
  ClinicalDossier 
} from '../services/realtimeSync';
import { 
  requestPushNotificationPermission, 
  sendClinicAppointmentPushAlert,
  sendPersonalizedHealthReminder 
} from '../services/firebaseMessaging';

interface OwnerPortalPreviewProps {
  currentLang: Language;
  onGoHome: () => void;
  userAnswers?: OwnerAnswers;
  badges?: Badge[];
  onOpenProfile?: () => void;
}

export default function OwnerPortalPreview({
  currentLang,
  onGoHome,
  userAnswers,
  badges = [],
  onOpenProfile
}: OwnerPortalPreviewProps) {
  const t = getTranslations(currentLang);
  const [activeTab, setActiveTab] = useState<'health' | 'weight' | 'scanner' | 'appointments' | 'sos' | 'badges'>('health');
  const [currentPetWeight, setCurrentPetWeight] = useState(28.4);
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-09-25');
  const [selectedTime, setSelectedTime] = useState('10:30');
  const [appointmentReason, setAppointmentReason] = useState('Consultation de contrôle / Vaccins');
  const [isSubmittingAppt, setIsSubmittingAppt] = useState(false);

  // Real-time Firestore State via onSnapshot
  const [liveHealthUpdates, setLiveHealthUpdates] = useState<LiveHealthUpdate[]>([]);
  const [liveNotifications, setLiveNotifications] = useState<LivePortalNotification[]>([]);
  const [liveDossiers, setLiveDossiers] = useState<ClinicalDossier[]>([]);
  const [liveProfileData, setLiveProfileData] = useState<any>(null);
  const [showAddHealthModal, setShowAddHealthModal] = useState(false);
  const [newHealthTitle, setNewHealthTitle] = useState('');
  const [newHealthDetails, setNewHealthDetails] = useState('');
  const [newHealthType, setNewHealthType] = useState<'observation' | 'weight' | 'vaccine' | 'treatment'>('observation');
  const [isSavingHealth, setIsSavingHealth] = useState(false);

  const petName = liveProfileData?.petName || userAnswers?.petName || 'Milo';
  const wilaya = liveProfileData?.wilaya || userAnswers?.wilaya || '16 - Alger';
  const ownerName = liveProfileData?.ownerName || userAnswers?.ownerName || 'Propriétaire DiaVet';
  const ownerEmail = liveProfileData?.email || (userAnswers as any)?.email || '';

  // Firebase Realtime onSnapshot Listener
  useEffect(() => {
    // 1. Subscribe to Live Health Updates
    const unsubHealth = subscribeToHealthUpdates(wilaya, (records) => {
      setLiveHealthUpdates(records);
    });

    // 2. Subscribe to Live Portal Notifications
    const unsubNotifs = subscribeToPortalNotifications('owner', wilaya, (notifs) => {
      setLiveNotifications(notifs);
    });

    // 3. Subscribe to Clinical Dossiers in Real-Time
    const unsubDossiers = subscribeToClinicalDossiers(wilaya, (dossiers) => {
      setLiveDossiers(dossiers);
    });

    // 4. Subscribe to User Profile in Real-Time
    const unsubProfile = subscribeToUserProfile(ownerEmail, (profile) => {
      if (profile) setLiveProfileData(profile);
    });

    return () => {
      unsubHealth();
      unsubNotifs();
      unsubDossiers();
      unsubProfile();
    };
  }, [wilaya, ownerEmail]);

  const handleCreateHealthEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHealthTitle.trim()) return;
    setIsSavingHealth(true);

    await addLiveHealthEntry({
      petName,
      type: newHealthType,
      title: newHealthTitle,
      details: newHealthDetails,
      veterinarianName: 'Dr. Amine Benali (El Biar)',
      wilaya,
      date: new Date().toISOString().slice(0, 10),
      status: 'normal'
    });

    setNewHealthTitle('');
    setNewHealthDetails('');
    setIsSavingHealth(false);
    setShowAddHealthModal(false);
  };

  const handleBookAppointment = async () => {
    setIsSubmittingAppt(true);
    await addLiveAppointment({
      petName,
      ownerName,
      phone: '+213 550 12 34 56',
      date: selectedDate,
      timeSlot: selectedTime,
      reason: appointmentReason,
      wilaya
    });

    // Send instant FCM push alert to device
    try {
      await sendClinicAppointmentPushAlert({
        petName,
        ownerName,
        clinicName: 'Clinique Vétérinaire El Biar (Dr. Amine Benali)',
        date: selectedDate,
        timeSlot: selectedTime,
        wilaya,
        status: 'confirmé'
      });
    } catch (e) {
      console.warn('Push alert error:', e);
    }

    setIsSubmittingAppt(false);
    setBookedSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white mb-2 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.btnBack}</span>
          </button>
          <h1 className="text-2xl sm:text-4xl font-black text-white dark:text-white light:text-slate-900 flex items-center gap-3">
            <span>Espace Propriétaire</span>
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Cloud Active
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{wilaya}</span>
        </div>
      </div>

      {/* Live Realtime Notifications Bar */}
      {liveNotifications.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 shadow-lg flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0 mt-0.5">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                  Notification Vétérinaire Directe
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  {liveNotifications[0].timestamp}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{liveNotifications[0].title}</h4>
              <p className="text-xs text-slate-300">{liveNotifications[0].message}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-950 text-slate-400 shrink-0">
            {liveNotifications.length} alerte(s)
          </span>
        </div>
      )}

      {/* Pet Header Card */}
      <div className="rounded-3xl p-6 border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/30 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center gap-6 mb-8 relative overflow-hidden">
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-cyan-400/50 shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=350"
            alt={petName}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 right-1 bg-cyan-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded">
            DZ
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white">{petName}</h2>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              ● En parfaite santé (Sync Cloud Live)
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Canidé · Golden Retriever croisé · Puce : DZ-9810-4421-99
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs font-medium text-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab('weight')}
              className="px-3 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition-all cursor-pointer"
              title="Cliquer pour voir le suivi de poids"
            >
              Poids : <span className="font-bold text-cyan-300">{currentPetWeight} kg</span>
            </button>
            <div className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/5">
              Âge : <span className="font-bold text-white">3 ans 4 mois</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/5">
              Sexe : <span className="font-bold text-white">Mâle (Stérilisé)</span>
            </div>
          </div>
        </div>

        {/* SOS Button */}
        <button
          onClick={() => setActiveTab('sos')}
          className="px-5 py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Urgence Véto</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 mb-8 max-w-2xl mx-auto sm:mx-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('health')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'health'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Carnet de Santé
        </button>
        <button
          onClick={() => setActiveTab('weight')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5 ${
            activeTab === 'weight'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-md'
              : 'text-cyan-300/80 hover:text-cyan-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Suivi Poids</span>
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5 ${
            activeTab === 'scanner'
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
              : 'text-cyan-300/80 hover:text-cyan-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Bio-Scanner 3D</span>
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'appointments'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Rendez-vous
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5 ${
            activeTab === 'badges'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md'
              : 'text-amber-300/80 hover:text-amber-300'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Mes Badges</span>
          {badges.filter(b => b.isUnlocked).length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-white text-[10px] font-black">
              {badges.filter(b => b.isUnlocked).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sos')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'sos'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Urgences 24/7
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
          {/* TAB 0: FUTURISTIC BIO-SCANNER */}
          {activeTab === 'scanner' && (
            <div className="space-y-6">
              <FuturisticBioScanner 
                petName={petName}
                species="Canidé (Golden Retriever)"
                currentLang={currentLang}
              />

              <div className="mt-8">
                <h4 className="text-center text-xs font-black uppercase tracking-widest text-amber-300 mb-2">
                  Carte de Membre Numérique Holographique
                </h4>
                <HolographicVipCard
                  userName={userAnswers?.ownerName || 'Propriétaire DiaVet'}
                  vipCode="VIP-DZ-ALGER-2026"
                  role="owner"
                  wilaya={wilaya}
                />
              </div>
            </div>
          )}

          {/* TAB 1: HEALTH RECORD */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              
              {/* Vaccine tracker card */}
              <div className="rounded-3xl p-6 border border-white/10 bg-slate-950/70 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <span>Statut Vaccinal & Rappels</span>
                  </h3>
                  <span className="text-xs font-bold text-cyan-400">À jour (2026)</span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-white">Vaccin Antirabique (Rage)</p>
                      <p className="text-xs text-slate-400">Effectué le 10 Nov 2025 · Dr. Amine Benali (El Biar)</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                        Rappel : Nov 2026
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-white">CHPPiL (Maladie de Carré & Parvovirose)</p>
                      <p className="text-xs text-slate-400">Effectué le 10 Nov 2025</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                        Rappel : Nov 2026
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-white">Vermifuge & Antiparasitaire Externe</p>
                      <p className="text-xs text-slate-400">Dernier comprimé pris le 15 Août</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md">
                        À renouveler : 15 Nov
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical history card & Real-Time Firebase Stream */}
              <div className="rounded-3xl p-6 border border-white/10 bg-slate-950/70 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <span>Consultations & Données de Santé en Direct</span>
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                      <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" /> onSnapshot Live
                    </span>
                  </h3>

                  <button
                    type="button"
                    onClick={() => setShowAddHealthModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter Note / Soin</span>
                  </button>
                </div>

                {/* Add Health Observation Modal */}
                {showAddHealthModal && (
                  <form onSubmit={handleCreateHealthEntry} className="mb-6 p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                        Nouvelle Entrée Clinique Instantanée
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddHealthModal(false)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Annuler
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Type d'acte :</label>
                        <select
                          value={newHealthType}
                          onChange={(e) => setNewHealthType(e.target.value as any)}
                          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                        >
                          <option value="observation">Observation Générale</option>
                          <option value="vaccine">Vaccination / Rappel</option>
                          <option value="weight">Contrôle de Poids</option>
                          <option value="treatment">Traitement / Soin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Titre de l'acte :</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Examen oreilles & otite, Poids 28.6kg..."
                          value={newHealthTitle}
                          onChange={(e) => setNewHealthTitle(e.target.value)}
                          className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Détails & Recommandations Vétérinaires :</label>
                      <textarea
                        rows={2}
                        placeholder="Précisions de l'examen, posologie ou observations..."
                        value={newHealthDetails}
                        onChange={(e) => setNewHealthDetails(e.target.value)}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingHealth}
                      className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSavingHealth ? 'Enregistrement Cloud...' : 'Enregistrer Instantanément (Live Firebase)'}
                    </button>
                  </form>
                )}

                <div className="space-y-3 text-xs sm:text-sm">
                  {/* Live entries from Firestore */}
                  {liveHealthUpdates.map(rec => (
                    <div key={rec.id} className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 animate-fade-in">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                          {rec.title}
                        </span>
                        <span className="text-slate-400 text-xs font-mono">{rec.date}</span>
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed">
                        {rec.details}
                      </p>
                      <div className="mt-2 text-cyan-400 text-xs font-semibold flex items-center justify-between">
                        <span>{rec.veterinarianName} &bull; {rec.wilaya}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          ✓ Sync Cloud
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Standard initial base record */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-white">Bilan Annuel & Dentisterie</span>
                      <span className="text-slate-400 text-xs">10 Nov 2025</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      Examen clinique complet normal. Dents propres, auscultation cardiaque normale. Poids stable à 28.4 kg.
                    </p>
                    <div className="mt-2 text-cyan-400 text-xs font-semibold">
                      Dr. Amine Benali · Clinique Vétérinaire El Biar
                    </div>
                  </div>
                </div>
              </div>

              {/* Pet Weight Tracking & Recharts Graph */}
              <PetWeightTracker 
                petName={petName}
                initialWeight={currentPetWeight}
                onWeightChange={setCurrentPetWeight}
              />

            </div>
          )}

          {/* TAB: DEDICATED WEIGHT TRACKER */}
          {activeTab === 'weight' && (
            <div className="space-y-6">
              <PetWeightTracker 
                petName={petName}
                initialWeight={currentPetWeight}
                onWeightChange={setCurrentPetWeight}
              />
            </div>
          )}

          {/* TAB 2: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="rounded-3xl p-6 border border-white/10 bg-slate-950/70 backdrop-blur-xl">
                <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span>Réserver une consultation en Algérie</span>
                </h3>
                <p className="text-slate-400 text-xs mb-6">
                  Choisissez une date et un créneau horaire chez votre vétérinaire habituel ou un spécialiste.
                </p>

                {bookedSuccess ? (
                  <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center">
                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <h4 className="text-lg font-bold text-white">Rendez-vous confirmé !</h4>
                    <p className="text-slate-300 text-xs mt-1">
                      Confirmation envoyée par SMS au +213 550 ** ** ** pour {petName} le {selectedDate} à {selectedTime}.
                    </p>
                    <button
                      onClick={() => setBookedSuccess(false)}
                      className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20"
                    >
                      Prendre un autre rendez-vous
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Clinique ou cabinet :
                        </label>
                        <div className="p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
                          Clinique Vétérinaire El Biar (Dr. Amine Benali)
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Motif de la visite :
                        </label>
                        <select 
                          value={appointmentReason}
                          onChange={(e) => setAppointmentReason(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                        >
                          <option value="Consultation de contrôle / Vaccins">Consultation de contrôle / Vaccins</option>
                          <option value="Dermatologie / Démangeaisons">Dermatologie / Démangeaisons</option>
                          <option value="Certificat de bonne santé voyage">Certificat de bonne santé voyage</option>
                          <option value="Conseils en nutrition & pesée">Conseils en nutrition & pesée</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Date :</label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Heure :</label>
                        <select
                          value={selectedTime}
                          onChange={e => setSelectedTime(e.target.value)}
                          className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                        >
                          <option value="09:00">09:00</option>
                          <option value="10:30">10:30</option>
                          <option value="14:00">14:00</option>
                          <option value="16:30">16:30</option>
                          <option value="18:00">18:00</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmittingAppt}
                      onClick={handleBookAppointment}
                      className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmittingAppt ? 'Transmission Cloud en cours...' : 'Confirmer et Synchroniser le rendez-vous →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SOS URGENCE DZ */}
          {activeTab === 'sos' && (
            <div className="space-y-6">
              <div className="rounded-3xl p-6 border border-rose-500/40 bg-gradient-to-br from-slate-950 to-rose-950/30 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Urgences Vétérinaires 24h/24</h3>
                    <p className="text-xs text-slate-400">Réseau d'intervention rapide en Algérie ({wilaya})</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm text-rose-200 mb-6">
                  ⚠️ En cas d'ingestion toxique, hémorragie, fracture ou difficulté respiratoire, contactez immédiatement la clinique de garde avant déplacement.
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Clinique El Biar (Garde 24/7)</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">Ouvert</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        El Biar, Alger
                      </p>
                    </div>
                    <a
                      href="tel:+21321921400"
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Appeler : +213 21 92 14 00</span>
                    </a>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Centre Hospitalier Cirta (Constantine)</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">Garde 24/7</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        Sidi Mabrouk, Constantine
                      </p>
                    </div>
                    <a
                      href="tel:+21331883321"
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Appeler : +213 31 88 33 21</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BADGES & REWARDS */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div className="rounded-3xl p-6 sm:p-8 border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <span>Badges & Récompenses de Milo</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Les badges attestent de l'attention portée à la santé et au bien-être de votre animal.
                    </p>
                  </div>

                  {onOpenProfile && (
                    <button
                      onClick={onOpenProfile}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <span>Voir page Profil complète</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map(b => (
                    <div
                      key={b.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        b.isUnlocked
                          ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5'
                          : 'bg-slate-900/40 border-white/5 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-xl">
                          {b.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{b.title}</p>
                          <span className="text-[10px] uppercase font-bold text-amber-300">{b.tier}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">{b.description}</p>
                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                        <span className={b.isUnlocked ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                          {b.isUnlocked ? '✓ Débloqué' : 'Verrouillé'}
                        </span>
                        <span className="text-slate-400 text-[10px]">{b.category}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
