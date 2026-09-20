import { useState } from 'react';
import { 
  Sparkles, Calendar, MessageSquare, Heart, ShieldCheck, 
  ShoppingBag, X, ArrowRight, Stethoscope, CheckCircle2, 
  Clock, MapPin, ChevronRight, Mail, Bell, FileText,
  BarChart3, TrendingUp, Activity, PieChart, Users, AlertTriangle
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface MagicEnvelopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang?: Language;
  petName?: string;
  ownerName?: string;
  vipCode?: string;
  userRole?: 'owner' | 'vet';
  onNavigateTo: (screen: any) => void;
}

export default function MagicEnvelopeModal({
  isOpen,
  onClose,
  currentLang = 'fr',
  petName = 'Votre Compagnon',
  ownerName = 'Cher Membre',
  vipCode = 'VIP-DZ-16',
  userRole = 'owner',
  onNavigateTo
}: MagicEnvelopeModalProps) {
  const t = translations[currentLang] || translations.fr;
  const isRtl = currentLang === 'ar';

  // States: 'closed' -> 'opening' -> 'opened'
  const [envelopeState, setEnvelopeState] = useState<'closed' | 'opening' | 'opened'>('closed');
  const [activeTab, setActiveTab] = useState<'rdv' | 'chat' | 'vet-stats' | 'carnet' | 'adoption' | 'boutique'>('rdv');

  if (!isOpen) return null;

  const handleOpenEnvelope = () => {
    setEnvelopeState('opening');
    setTimeout(() => {
      setEnvelopeState('opened');
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-[2.5rem] bg-slate-950 border-2 border-amber-500/40 shadow-2xl shadow-amber-500/20 overflow-hidden text-slate-100">
        
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ENVELOPE CLOSED & OPENING PHASE (Cute Cat delivering letter animation) */}
        {envelopeState !== 'opened' ? (
          <div className="p-8 sm:p-14 flex flex-col items-center justify-center text-center overflow-y-auto">
            
            {/* Cute Cat & Animation Container */}
            <div className="relative mb-6">
              {/* Pulsing Magic Glow */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-400/30 via-orange-500/20 to-cyan-500/30 blur-2xl animate-pulse"></div>

              {/* Animated Cat Avatar */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-200 p-1 shadow-2xl animate-bounce" style={{ animationDuration: '2.5s' }}>
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden border-2 border-white/20">
                  <span className="text-6xl sm:text-7xl select-none">🐱</span>
                  <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest mt-1">
                    DiaVet Cat
                  </span>
                </div>
              </div>

              {/* Envelope Floating in paws */}
              <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-slate-950 px-4 py-2 rounded-2xl shadow-xl border-2 border-amber-400 flex items-center gap-2 transition-transform duration-700 ${
                envelopeState === 'opening' ? 'scale-125 rotate-6 animate-pulse' : 'hover:scale-105 cursor-pointer'
              }`}>
                <Mail className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {envelopeState === 'opening' ? 'Ouverture magique...' : 'Pour ' + petName}
                </span>
              </div>
            </div>

            <div className="max-w-md space-y-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
                Un message spécial vient d'arriver
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Le petit chat DiaVet a une <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200">surprise pour vous</span> !
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Bravo <strong>{ownerName}</strong> ! Votre questionnaire pour <strong>{petName}</strong> a été enregistré. Cliquez pour desceller l'enveloppe magique et découvrir l'écosystème complet de DiaVet.
              </p>
            </div>

            <div className="mt-8 w-full max-w-sm">
              <button
                onClick={handleOpenEnvelope}
                disabled={envelopeState === 'opening'}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-slate-950 animate-spin" style={{ animationDuration: '4s' }} />
                <span>{envelopeState === 'opening' ? 'La magie opère...' : 'Ouvrir l\'enveloppe magique ✨'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mt-4">
              Privilège Exclusif · Code Membre : {vipCode}
            </p>

          </div>
        ) : (
          /* ENVELOPE OPENED: MAGICAL GENERAL PREVIEW OF DIAVET */
          <div className="flex-1 flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
            
            {/* Top Bar inside Envelope */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                  ✨
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Bienvenue dans le futur DiaVet Algérie
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      VIP Débloqué
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Voici l'aperçu complet de votre futur quotidien avec <strong>{petName}</strong>
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-amber-300 bg-black/40 px-3 py-1.5 rounded-xl border border-amber-500/30">
                <span>PASS : {vipCode}</span>
              </div>
            </div>

            {/* Feature Tabs Selector */}
            <div className="flex border-b border-white/10 bg-slate-900/60 overflow-x-auto p-1.5 gap-1 text-xs">
              <button
                onClick={() => setActiveTab('rdv')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'rdv' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>1. Rendez-vous Vétérinaire</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>2. Messagerie Directe</span>
              </button>

              {userRole === 'vet' && (
                <button
                  onClick={() => setActiveTab('vet-stats')}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'vet-stats' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>3. Statistiques & Cabinet Vétérinaire</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('carnet')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'carnet' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>4. Carnet & Vaccins</span>
              </button>

              <button
                onClick={() => setActiveTab('adoption')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'adoption' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>5. Adoption Solidaire</span>
              </button>

              <button
                onClick={() => setActiveTab('boutique')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'boutique' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>6. Animalerie & Services</span>
              </button>
            </div>

            {/* TAB CONTENT WITH RICH PREVIEWS */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-slate-950">
              
              {/* TAB 1: RDV EN LIGNE */}
              {activeTab === 'rdv' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-white">Prise de Rendez-vous en 3 clics</h4>
                      <p className="text-xs text-slate-400">Terminé les attentes interminables et les appels sans réponse.</p>
                    </div>
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                      58 Wilayas
                    </span>
                  </div>

                  {/* Interactive Mockup */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-white">Dr. Amina Benali (Alger - Hydra)</span>
                      </div>
                      <span className="text-emerald-400 font-bold">● Disponible Aujourd'hui</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['09:30', '11:00', '14:30', '16:00'].map((slot, i) => (
                        <div key={slot} className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all ${
                          i === 1 ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black' : 'bg-slate-800 text-slate-300 border-white/5'
                        }`}>
                          {slot} {i === 1 && '✓ Choisi'}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Motif : Vaccin antirabique & bilan pour {petName}</span>
                      <span className="text-cyan-400 font-bold">Rappel SMS automatique inclus</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <Clock className="w-4 h-4 text-cyan-400 mb-1" />
                      <p className="font-bold text-white">Créneaux 24/7</p>
                      <p className="text-slate-400 text-[11px]">Réservation instantanée jour et nuit.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <Bell className="w-4 h-4 text-amber-400 mb-1" />
                      <p className="font-bold text-white">Alertes WhatsApp</p>
                      <p className="text-slate-400 text-[11px]">Rappel la veille pour ne rien oublier.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <MapPin className="w-4 h-4 text-emerald-400 mb-1" />
                      <p className="font-bold text-white">Géolocalisation</p>
                      <p className="text-slate-400 text-[11px]">Trouvez le véto de garde le plus proche.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MESSAGERIE DIRECTE */}
              {activeTab === 'chat' && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <h4 className="text-lg font-black text-white">Messagerie Sécurisée avec votre Clinique</h4>
                    <p className="text-xs text-slate-400">Posez une question à votre vétérinaire traitant, envoyez une photo d'une blessure.</p>
                  </div>

                  {/* Chat Conversation Mockup */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                    <div className="flex items-start gap-2.5 max-w-sm ml-auto">
                      <div className="p-3 rounded-2xl rounded-tr-none bg-blue-600 text-white text-xs leading-relaxed">
                        Bonjour Dr, {petName} s'est légèrement coupé au coussinet pendant notre promenade à la forêt de Bainem. Faut-il venir en urgence ?
                        <span className="block text-[10px] opacity-70 text-right mt-1">11:15 · Lu</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 max-w-sm mr-auto">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        Dr
                      </div>
                      <div className="p-3 rounded-2xl rounded-tl-none bg-slate-800 text-slate-200 text-xs leading-relaxed border border-white/5">
                        <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">Dr. Zerrouki (Vétérinaire)</span>
                        Bonjour ! Nettoyez à la bétadine diluée. Si le saignement s'arrête, passez à la clinique à 14h pour une vérification rapide.
                        <span className="block text-[10px] text-slate-400 text-right mt-1">11:18</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Échanges cryptés et historique conservé dans le dossier médical de {petName}.</span>
                  </div>
                </div>
              )}

              {/* TAB: VETERINARY CLINICAL DASHBOARD & STATISTICS */}
              {activeTab === 'vet-stats' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-white flex items-center gap-2">
                        <span>Tableau de Bord & Statistiques Cliniques</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Espace Praticien PRO
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Indicateurs d'activité médicale, suivi épidémiologique et gestion des dossiers patients en Algérie.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTo('vet-portal');
                      }}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                    >
                      <span>Portail Vétérinaire Complet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 4 Core Clinical KPI Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/30">
                      <div className="flex items-center justify-between text-indigo-400 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-[10px] font-bold text-emerald-400">+18%</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-white">148</p>
                      <p className="text-[11px] text-slate-400">Consultations ce mois</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30">
                      <div className="flex items-center justify-between text-emerald-400 mb-1">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-bold text-emerald-400">Optimal</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-white">89.4%</p>
                      <p className="text-[11px] text-slate-400">Couverture vaccinale</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/30">
                      <div className="flex items-center justify-between text-cyan-400 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-bold text-cyan-400">24/7</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-white">32 min</p>
                      <p className="text-[11px] text-slate-400">Temps moyen auscultation</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30">
                      <div className="flex items-center justify-between text-amber-400 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[10px] font-bold text-amber-400">98%</span>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-white">4.9/5</p>
                      <p className="text-[11px] text-slate-400">Satisfaction maîtres</p>
                    </div>
                  </div>

                  {/* Consultation Breakdown Visuals */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <PieChart className="w-4 h-4 text-cyan-400" />
                        Répartition des Motifs de Consultation (Patientèle DZ)
                      </span>
                      <span className="text-slate-400 text-[11px]">Données agrégées 2026</span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1 font-semibold">
                          <span className="text-cyan-300">Vaccins, Rappels Antirabiques & Bilans de santé</span>
                          <span className="text-white font-bold">42% (62 actes)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded-full" style={{ width: '42%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1 font-semibold">
                          <span className="text-emerald-300">Dermatologie, Tiques, Puces & Antiparasitaires</span>
                          <span className="text-white font-bold">28% (41 actes)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-400 h-full rounded-full" style={{ width: '28%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1 font-semibold">
                          <span className="text-indigo-300">Chirurgies, Stérilisations & Castrations</span>
                          <span className="text-white font-bold">18% (27 actes)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-indigo-400 h-full rounded-full" style={{ width: '18%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1 font-semibold">
                          <span className="text-rose-300">Traumatologie d'urgence & Gastro-entérologie</span>
                          <span className="text-white font-bold">12% (18 actes)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className="bg-rose-400 h-full rounded-full" style={{ width: '12%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Health Alert in Algeria */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-300">
                        Alerte Sanitaire : Campagne Nationale de Prévention Antirabique
                      </p>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Rappel actif envoyé automatiquement aux propriétaires des 58 Wilayas ayant un rappel vaccinal de plus de 11 mois.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CARNET DIGITAL */}
              {activeTab === 'carnet' && (
                <div className="space-y-5 animate-in fade-in">
                  <div>
                    <h4 className="text-lg font-black text-white">Carnet de Santé Numérique Officiel</h4>
                    <p className="text-xs text-slate-400">Le carnet officiel sur smartphone reconnu par les cliniques algériennes.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase">Vaccin Antirabique</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-sm font-bold text-white">Rage (Rabisin) · À jour</p>
                      <p className="text-xs text-slate-400">Prochain rappel : 15 Novembre 2026</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400 uppercase">Antiparasitaire</span>
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-sm font-bold text-white">Vermifuge Milbemax · Valide</p>
                      <p className="text-xs text-slate-400">Prochaine prise conseillée : dans 45 jours</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ADOPTION SOLIDAIRE */}
              {activeTab === 'adoption' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-white">Espace Adoption Solidaire DZ</h4>
                      <p className="text-xs text-slate-400">Adoptez un animal rescapé vacciné et stérilisé à travers les 58 Wilayas.</p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTo('adoption');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-400 transition-colors cursor-pointer"
                    >
                      Voir les annonces
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200">
                    Chaque adoption sur DiaVet est vérifiée avec suivi vétérinaire post-adoption offert.
                  </div>
                </div>
              )}

              {/* TAB 5: BOUTIQUE & SERVICES */}
              {activeTab === 'boutique' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-white">Marketplace Nutrition & Services Vétérinaires</h4>
                      <p className="text-xs text-slate-400">Croquettes vétérinaires, antiparasitaires officiels, et ambulance 24/7.</p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTo('marketplace');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      Ouvrir la Boutique
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10">
                      <span className="text-[10px] font-black uppercase text-amber-400">Livraison Express</span>
                      <p className="font-bold text-white mt-1">Alimentation Médicalisée (Royal Canin, Pro Plan)</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Livraison à domicile sur Alger, Oran, Constantine...</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10">
                      <span className="text-[10px] font-black uppercase text-cyan-400">Prochainement</span>
                      <p className="font-bold text-white mt-1">Ambulance Vétérinaire & Toilettage à Domicile</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Un véhicule médicalisé équipé pour les urgences lourdes.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Modal Actions */}
            <div className="p-4 sm:p-6 bg-slate-900/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                Accès VIP actif pour <strong className="text-white">{petName}</strong> · Numéro Pass : <strong className="text-amber-300">{vipCode}</strong>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {userRole === 'vet' ? (
                  <>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTo('owner-portal');
                      }}
                      className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>Vue Propriétaire</span>
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTo('vet-portal');
                      }}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4 text-slate-950" />
                      <span>Accéder au Logiciel Cabinet Pro (Vétérinaire)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTo('owner-portal');
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Accéder à mon Espace Propriétaire & Carnet</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
