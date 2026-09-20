import { useState } from 'react';
import { Language, OwnerAnswers, Badge } from '../types';
import { translations } from '../data/translations';
import { 
  Heart, Calendar, AlertTriangle, ShieldCheck, 
  ChevronLeft, Plus, Phone, Clock, FileText, CheckCircle, Sparkles, MapPin, Award, ArrowRight,
  Activity, Crown, Scan
} from 'lucide-react';
import FuturisticBioScanner from './FuturisticBioScanner';
import HolographicVipCard from './HolographicVipCard';

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
  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<'health' | 'scanner' | 'appointments' | 'sos' | 'badges'>('health');
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-09-25');
  const [selectedTime, setSelectedTime] = useState('10:30');

  const petName = userAnswers?.petName || 'Milo';
  const wilaya = userAnswers?.wilaya || '16 - Alger';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
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
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
              Démo Interactive
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{wilaya}</span>
        </div>
      </div>

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
              ● En parfaite santé
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Canidé · Golden Retriever croisé · Puce : DZ-9810-4421-99
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs font-medium text-slate-300">
            <div className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/5">
              Poids : <span className="font-bold text-cyan-300">28.4 kg</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/5">
              Âge : <span className="font-bold text-cyan-300">3 ans</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/5">
              Stérilisé : <span className="font-bold text-cyan-300">Oui</span>
            </div>
          </div>
        </div>

        {/* SOS Button */}
        <button
          onClick={() => setActiveTab('sos')}
          className="px-5 py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
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

      {/* TAB 0: FUTURISTIC BIO-SCANNER */}
      {activeTab === 'scanner' && (
        <div className="space-y-6 animate-in fade-in duration-200">
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
        <div className="space-y-6 animate-in fade-in duration-200">
          
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

          {/* Clinical history card */}
          <div className="rounded-3xl p-6 border border-white/10 bg-slate-950/70 backdrop-blur-xl">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Dernières consultations enregistrées</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
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

        </div>
      )}

      {/* TAB 2: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
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
                    <select className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
                      <option>Consultation de contrôle / Vaccins</option>
                      <option>Dermatologie / Démangeaisons</option>
                      <option>Certificat de bonne santé voyage</option>
                      <option>Conseils en nutrition & pesée</option>
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
                  onClick={() => setBookedSuccess(true)}
                  className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  Confirmer le rendez-vous →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SOS URGENCE DZ */}
      {activeTab === 'sos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
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
        <div className="space-y-6 animate-in fade-in duration-200">
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

    </div>
  );
}
