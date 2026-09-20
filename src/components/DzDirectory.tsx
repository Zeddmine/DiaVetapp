import { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { MOCK_CLINICS, ALGERIAN_WILAYAS } from '../data/mockData';
import { 
  Search, MapPin, Phone, Clock, ChevronLeft, 
  ShieldCheck, AlertTriangle, Building, Stethoscope, Filter,
  Instagram, Sparkles, Hammer, CheckCircle2, ArrowRight
} from 'lucide-react';

interface DzDirectoryProps {
  currentLang: Language;
  onGoHome: () => void;
  onOpenVetQuestionnaire?: () => void;
}

export default function DzDirectory({
  currentLang,
  onGoHome,
  onOpenVetQuestionnaire
}: DzDirectoryProps) {
  const t = translations[currentLang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('all');
  const [only24h, setOnly24h] = useState(false);

  const filteredClinics = MOCK_CLINICS.filter(clinic => {
    const matchesSearch = clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clinic.vetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          clinic.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWilaya = selectedWilaya === 'all' || clinic.wilaya === selectedWilaya;
    const matches24h = !only24h || clinic.is24h;
    return matchesSearch && matchesWilaya && matches24h;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white mb-3 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t.btnBack}</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <Hammer className="w-3.5 h-3.5 animate-bounce" />
              <span>Module Annuaire Officiel · En cours de développement & déploiement</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
              Réseau Vétérinaire en Algérie
            </h1>
          </div>
        </div>
      </div>

      {/* PROMINENT "EN COURS DE DÉVELOPPEMENT" NOTICE & INSTAGRAM CONTACT */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 border-2 border-amber-500/40 shadow-2xl mb-8 relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Déploiement Territorial Bêta 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Le conventionnement des cliniques vétérinaires est en cours dans les 58 Wilayas !
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Nos équipes finalisent actuellement les protocoles d'intégration et de vérification avec les praticiens inscrits à l'Ordre Vétérinaire en Algérie. Les fiches ci-dessous constituent un aperçu des premiers centres pilotes conventionnés.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            {/* Instagram Contact Button */}
            <a
              href="https://instagram.com/dia__vet"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 active:scale-95 cursor-pointer"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram : @dia__vet</span>
            </a>

            {/* Practitioner survey trigger */}
            {onOpenVetQuestionnaire && (
              <button
                onClick={onOpenVetQuestionnaire}
                className="px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 cursor-pointer"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Rejoindre en tant que Vétérinaire</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl mb-8 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Keyword search input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par clinique, vétérinaire ou ville..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Wilaya selector */}
          <div className="md:col-span-4">
            <select
              value={selectedWilaya}
              onChange={e => setSelectedWilaya(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all">Toutes les 58 wilayas</option>
              {ALGERIAN_WILAYAS.map(w => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* 24h toggle */}
          <div className="md:col-span-2 flex items-center">
            <button
              onClick={() => setOnly24h(!only24h)}
              className={`w-full py-3 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                only24h
                  ? 'bg-rose-600/30 text-rose-300 border-rose-500/50 shadow-md shadow-rose-600/20'
                  : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/20'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Urgences 24/7</span>
            </button>
          </div>

        </div>

        {/* Results stats */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
          <span>{filteredClinics.length} structures pilotes répertoriées</span>
          <span className="text-amber-400 font-medium">Bêta-test en cours</span>
        </div>
      </div>

      {/* Clinics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClinics.map(clinic => (
          <div
            key={clinic.id}
            className="rounded-3xl p-6 bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-lg backdrop-blur-xl relative overflow-hidden"
          >
            {/* Top dev ribbon */}
            <div className="absolute top-0 right-0">
              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-3 py-1 rounded-bl-xl border-b border-l border-amber-500/30">
                Validation en cours
              </span>
            </div>

            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">
                    {clinic.name}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>{clinic.vetName}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{clinic.address}, <strong>{clinic.city}</strong> ({clinic.wilaya})</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-white font-semibold">{clinic.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Spécialité : {clinic.specialty}</span>
                </div>

                {clinic.is24h && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-black text-[10px] border border-rose-500/30">
                    <Clock className="w-3 h-3" />
                    <span>Service d urgence 24h/24 assuré</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <a
                href={`tel:${clinic.phone}`}
                className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Appeler le cabinet</span>
              </a>

              <a
                href="https://instagram.com/dia__vet"
                target="_blank"
                rel="noopener noreferrer"
                title="Consulter les infos sur Instagram @dia__vet"
                className="p-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>

          </div>
        ))}
      </div>

      {filteredClinics.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-950/60 border border-white/10">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-white font-bold text-base">Aucune clinique trouvée pour cette recherche</p>
          <p className="text-slate-400 text-xs mt-1">
            Les conventions se poursuivent. Contactez <strong>@dia__vet</strong> sur Instagram pour proposer votre clinique !
          </p>
        </div>
      )}

    </div>
  );
}
