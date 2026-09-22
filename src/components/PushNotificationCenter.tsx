import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, BellRing, BellOff, ShieldCheck, CheckCircle2, Calendar, 
  Stethoscope, AlertTriangle, Sparkles, Send, X, RefreshCw, Smartphone, 
  Settings, Pill, Radio, HeartPulse, Clock, ChevronRight, Check
} from 'lucide-react';
import { 
  getNotificationPermissionStatus, 
  requestPushNotificationPermission, 
  getPushNotificationPreferences, 
  savePushNotificationPreferences, 
  sendPersonalizedHealthReminder, 
  sendClinicAppointmentPushAlert, 
  getPushNotificationHistory, 
  PushNotificationPreferences, 
  PersonalizedHealthReminder 
} from '../services/firebaseMessaging';
import { soundEngine } from '../utils/soundEngine';
import { Language } from '../types';

interface PushNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  userRole?: 'owner' | 'vet';
  petName?: string;
  wilaya?: string;
  userName?: string;
}

export default function PushNotificationCenter({
  isOpen,
  onClose,
  currentLang,
  userRole = 'owner',
  petName = 'Milo',
  wilaya = '16 - Alger',
  userName = 'Karim M.'
}: PushNotificationCenterProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<PushNotificationPreferences>(getPushNotificationPreferences());
  const [history, setHistory] = useState<PersonalizedHealthReminder[]>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'simulator' | 'preferences' | 'history'>('status');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [lastSentFeedback, setLastSentFeedback] = useState<string | null>(null);

  // Custom Quick Reminder Form
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [customType, setCustomType] = useState<'vaccine' | 'deworming' | 'appointment' | 'emergency'>('vaccine');

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermissionStatus());
      setPreferences(getPushNotificationPreferences());
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    const list = await getPushNotificationHistory();
    setHistory(list);
  };

  const handleRequestPermission = async () => {
    soundEngine.playCyberClick();
    setIsRequesting(true);
    const res = await requestPushNotificationPermission(userRole, {
      userName,
      petName,
      wilaya
    });
    setPermission(res.permission);
    setIsRequesting(false);
    if (res.success) {
      soundEngine.playSuccess();
      setLastSentFeedback('✅ Notifications Push FCM connectées avec succès à cet appareil !');
      setTimeout(() => setLastSentFeedback(null), 5000);
      loadHistory();
    }
  };

  const handleTogglePref = async (key: keyof PushNotificationPreferences) => {
    soundEngine.playCyberClick();
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    await savePushNotificationPreferences(updated);
  };

  const triggerPresetNotification = async (type: 'vaccine' | 'appointment' | 'queue' | 'deworming' | 'emergency') => {
    soundEngine.playCyberClick();
    setIsSendingTest(true);

    if (type === 'vaccine') {
      await sendPersonalizedHealthReminder({
        targetRole: 'owner',
        petName,
        reminderType: 'vaccine',
        title: `💉 Rappel Vaccin : ${petName}`,
        body: `Le rappel annuel du vaccin Rage & CHPPiL de ${petName} arrive à échéance dans 7 jours chez Dr. Amine Benali.`,
        veterinarianName: 'Dr. Amine Benali',
        clinicName: 'Cabinet El Biar',
        wilaya,
        actionUrl: '/'
      });
      setLastSentFeedback(`Rappel vaccinal envoyé pour ${petName} !`);
    } else if (type === 'appointment') {
      await sendClinicAppointmentPushAlert({
        petName,
        ownerName: userName,
        veterinarianName: 'Dr. Amine Benali',
        clinicName: 'Cabinet El Biar',
        wilaya,
        date: 'Demain',
        timeSlot: '10:30',
        status: 'confirmé'
      });
      setLastSentFeedback(`Alerte de rendez-vous clinique envoyée !`);
    } else if (type === 'queue') {
      await sendClinicAppointmentPushAlert({
        petName,
        ownerName: userName,
        veterinarianName: 'Dr. Amine Benali',
        clinicName: 'Cabinet El Biar',
        wilaya,
        date: 'Aujourd\'hui',
        timeSlot: 'Immédiat',
        status: 'tour_actuel'
      });
      setLastSentFeedback(`Notification d'appel en salle transmise !`);
    } else if (type === 'deworming') {
      await sendPersonalizedHealthReminder({
        targetRole: 'owner',
        petName,
        reminderType: 'deworming',
        title: `💊 Soin Préventif : Vermifuge ${petName}`,
        body: `C'est le moment d'administrer le comprimé vermifuge trimestriel (Drontal/Milbemax) prescrit pour ${petName}.`,
        veterinarianName: 'Dr. Amine Benali',
        clinicName: 'Cabinet El Biar',
        wilaya,
        actionUrl: '/'
      });
      setLastSentFeedback(`Rappel antiparasitaire envoyé pour ${petName} !`);
    } else if (type === 'emergency') {
      await sendPersonalizedHealthReminder({
        targetRole: 'all',
        petName,
        reminderType: 'emergency',
        title: `🚨 Alerte Sanitaire Wilaya : ${wilaya}`,
        body: `Pic de chaleur & vigilance chenilles processionnaires signalé dans la wilaya. Protégez les pattes de vos animaux.`,
        wilaya,
        actionUrl: '/'
      });
      setLastSentFeedback(`Alerte sanitaire de wilaya diffusée !`);
    }

    setIsSendingTest(false);
    soundEngine.playSuccess();
    await loadHistory();
    setTimeout(() => setLastSentFeedback(null), 5000);
  };

  const handleSendCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customBody.trim()) return;

    setIsSendingTest(true);
    await sendPersonalizedHealthReminder({
      targetRole: userRole === 'vet' ? 'owner' : 'all',
      petName,
      reminderType: customType,
      title: customTitle,
      body: customBody,
      veterinarianName: userRole === 'vet' ? userName : 'Dr. Amine Benali',
      clinicName: 'Clinique DiaVet',
      wilaya,
      actionUrl: '/'
    });

    setCustomTitle('');
    setCustomBody('');
    setIsSendingTest(false);
    soundEngine.playSuccess();
    setLastSentFeedback('Notification personnalisée transmise instantanément !');
    await loadHistory();
    setTimeout(() => setLastSentFeedback(null), 5000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner">
                <BellRing className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Firebase Cloud Messaging</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Push V2
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Rappels de santé personnalisés & alertes cliniques en direct
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-slate-950/60 px-4 pt-2 gap-1 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3 py-2.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'status'
                  ? 'bg-slate-900 text-cyan-300 border-t-2 border-cyan-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Statut & Connexion</span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-2.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'bg-slate-900 text-cyan-300 border-t-2 border-cyan-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Déclencheur d'Alertes</span>
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-3 py-2.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'preferences'
                  ? 'bg-slate-900 text-cyan-300 border-t-2 border-cyan-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Préférences</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-cyan-300 border-t-2 border-cyan-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Historique ({history.length})</span>
            </button>
          </div>

          {/* Feedback Banner */}
          {lastSentFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{lastSentFeedback}</span>
            </motion.div>
          )}

          {/* Tab 1: Status & Permissions */}
          {activeTab === 'status' && (
            <div className="p-6 space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl border ${
                    permission === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : permission === 'denied'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {permission === 'granted' ? (
                      <BellRing className="w-8 h-8" />
                    ) : permission === 'denied' ? (
                      <BellOff className="w-8 h-8" />
                    ) : (
                      <Bell className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-white">Autorisation Push Navigateur</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        permission === 'granted'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : permission === 'denied'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {permission === 'granted' ? 'Actif & En Ligne' : permission === 'denied' ? 'Bloqué' : 'En Attente'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {permission === 'granted'
                        ? `Votre appareil reçoit les notifications prioritaires pour ${petName} (${wilaya}).`
                        : permission === 'denied'
                        ? 'Les notifications ont été bloquées dans les paramètres de votre navigateur.'
                        : 'Activez les notifications pour ne manquer aucun rappel de vaccin ou rendez-vous.'}
                    </p>
                  </div>
                </div>

                {permission !== 'granted' ? (
                  <button
                    onClick={handleRequestPermission}
                    disabled={isRequesting}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer shrink-0"
                  >
                    {isRequesting ? 'Activation...' : 'Activer les Push FCM →'}
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shrink-0">
                    <Check className="w-4 h-4" />
                    <span>Synchronisé</span>
                  </div>
                )}
              </div>

              {/* Connected Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block text-[11px]">Animal Surveillé :</span>
                  <span className="font-bold text-white mt-0.5 block">{petName}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block text-[11px]">Wilaya de rattachement :</span>
                  <span className="font-bold text-cyan-300 mt-0.5 block">{wilaya}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400 block text-[11px]">Protocole :</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">Firebase Cloud Msg (V2)</span>
                </div>
              </div>

              {/* Quick Preset Dispatch Buttons */}
              <div>
                <h5 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Tester la Réception d'Alertes Immédiates :
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => triggerPresetNotification('vaccine')}
                    disabled={isSendingTest}
                    className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/40 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Pill className="w-4 h-4 text-cyan-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Rappel Vaccin Personnalisé</p>
                        <p className="text-[10px] text-slate-400">Rage & CHPPiL à renouveler</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => triggerPresetNotification('appointment')}
                    disabled={isSendingTest}
                    className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Rappel Rendez-vous 24h</p>
                        <p className="text-[10px] text-slate-400">Dr. Benali (El Biar, 10:30)</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => triggerPresetNotification('queue')}
                    disabled={isSendingTest}
                    className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 hover:border-blue-500/40 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Stethoscope className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Alerte File d'Attente Clinique</p>
                        <p className="text-[10px] text-slate-400">"C'est votre tour de consultation"</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => triggerPresetNotification('emergency')}
                    disabled={isSendingTest}
                    className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 hover:border-rose-500/40 text-left transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Alerte Sanitaire Wilaya</p>
                        <p className="text-[10px] text-slate-400">Chenilles / Chaleur extrême</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Custom Alert Simulator & Dispatcher */}
          {activeTab === 'simulator' && (
            <form onSubmit={handleSendCustom} className="p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300">
                <p className="font-bold text-cyan-300 mb-1">📢 Générateur de Push Notification FCM</p>
                <p>
                  Ce formulaire injecte un message ciblé dans la collection Firestore et envoie une alerte push native sur le terminal utilisateur.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Type de notification :</label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="vaccine">💉 Rappel Vaccin / Rappel Immunologique</option>
                    <option value="deworming">💊 Traitement Anti-Parasitaire / Vermifuge</option>
                    <option value="appointment">📅 Alerte / Confirmation de Rendez-vous</option>
                    <option value="emergency">🚨 Alerte Sanitaire / Urgence Wilaya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Titre de la notification :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rappel Vaccin Rage dans 48h..."
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Corps du message :</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Texte complet de la notification envoyé sur le smartphone ou l'ordinateur du propriétaire..."
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingTest}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSendingTest ? 'Transmission FCM...' : 'Envoyer la Notification Push Réelle →'}</span>
              </button>
            </form>
          )}

          {/* Tab 3: Notification Preferences */}
          {activeTab === 'preferences' && (
            <div className="p-6 space-y-3">
              <p className="text-xs text-slate-400 mb-3">
                Personnalisez les types de notifications que vous acceptez de recevoir sur cet appareil :
              </p>

              <div className="space-y-2">
                {[
                  {
                    key: 'vaccinesAndDeworming' as const,
                    title: 'Vaccinations & Traitements antiparasitaires',
                    desc: 'Rappels 1 mois, 7 jours et la veille des échéances médicales.'
                  },
                  {
                    key: 'appointmentAlerts' as const,
                    title: 'Alertes de Rendez-vous Clinique',
                    desc: 'Confirmations immédiates et rappels 24h avant la consultation.'
                  },
                  {
                    key: 'clinicLiveStatus' as const,
                    title: 'File d\'attente & Appel en salle de consultation',
                    desc: 'Alerte instantanée quand le vétérinaire est prêt à vous recevoir.'
                  },
                  {
                    key: 'emergencyWilayaAlerts' as const,
                    title: 'Alertes Sanitaires d\'Urgence Wilaya',
                    desc: 'Vigilance canicule, chenilles, épidémies locales déclarées.'
                  },
                  {
                    key: 'preventiveAiTips' as const,
                    title: 'Conseils Vétérinaires Préventifs IA',
                    desc: 'Recommandations nutritionnelles et soins selon l\'âge de l\'animal.'
                  }
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => handleTogglePref(item.key)}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 flex items-center justify-between gap-3 cursor-pointer transition-all"
                  >
                    <div>
                      <h6 className="text-xs font-bold text-white">{item.title}</h6>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>

                    <div className={`w-11 h-6 rounded-full p-1 transition-colors ${
                      preferences[item.key] ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                        preferences[item.key] ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: History */}
          {activeTab === 'history' && (
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Journal des alertes de santé récentes :</span>
                <button
                  onClick={loadHistory}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Actualiser</span>
                </button>
              </div>

              {history.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Aucune notification push archivée pour le moment.
                </div>
              ) : (
                history.map((item, idx) => (
                  <div key={item.id || idx} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-white">{item.title}</h6>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{item.body}</p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                          {item.wilaya} &bull; {item.sentAt ? new Date(item.sentAt).toLocaleString('fr-FR') : 'Récent'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono shrink-0">
                      Envoyé
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Footer Close */}
          <div className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">
              Système Sécurisé DiaVet Push Notification Hub
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
