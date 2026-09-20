import { Language } from '../types';
import { translations } from '../data/translations';
import { ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';

interface RoleSelectionProps {
  currentLang: Language;
  userRole?: 'owner' | 'vet';
  onSelectOwner: () => void;
  onSelectVet: () => void;
  onBack: () => void;
}

export default function RoleSelection({
  currentLang,
  userRole,
  onSelectOwner,
  onSelectVet,
  onBack
}: RoleSelectionProps) {
  const t = translations[currentLang];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white mb-8 transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{t.btnBack}</span>
      </button>

      {/* Heading */}
      <div className="text-center sm:text-left mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Profil & Orientation</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
          {t.roleTitle}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
          {t.roleSubtitle}
        </p>
      </div>

      {/* Role Cards List */}
      <div className="space-y-6">
        
        {/* Card 1: Propriétaire */}
        <div
          id="select-role-owner-btn"
          onClick={onSelectOwner}
          className="group relative rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-slate-950/80 hover:bg-slate-900/90 dark:bg-slate-950/80 light:bg-white light:border-cyan-200 backdrop-blur-xl transition-all duration-300 shadow-xl hover:shadow-cyan-500/20 hover:border-cyan-400 cursor-pointer active:scale-98 flex flex-col sm:flex-row items-center gap-6"
        >
          {/* Avatar / Photo Thumbnail */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300"
              alt="Propriétaire d'animaux"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-cyan-900/20 group-hover:bg-transparent transition-colors"></div>
          </div>

          {/* Text Info */}
          <div className="flex-1 text-center sm:text-left">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              {t.roleOwnerTag}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white dark:text-white light:text-slate-900 mt-2">
              {t.roleOwnerTitle}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
              {t.roleOwnerDesc}
            </p>
          </div>

          {/* Arrow */}
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all shrink-0">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Vétérinaire (Uniquement visible si praticien ou avant choix initial) */}
        {userRole !== 'owner' && (
          <div
            id="select-role-vet-btn"
            onClick={onSelectVet}
            className="group relative rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-slate-950/80 hover:bg-slate-900/90 dark:bg-slate-950/80 light:bg-white light:border-emerald-200 backdrop-blur-xl transition-all duration-300 shadow-xl hover:shadow-emerald-500/20 hover:border-emerald-400 cursor-pointer active:scale-98 flex flex-col sm:flex-row items-center gap-6"
          >
            {/* Avatar / Photo Thumbnail */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=300"
                alt="Praticien Vétérinaire"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-emerald-900/20 group-hover:bg-transparent transition-colors"></div>
            </div>

            {/* Text Info */}
            <div className="flex-1 text-center sm:text-left">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {t.roleVetTag}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white dark:text-white light:text-slate-900 mt-2">
                {t.roleVetTitle}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                {t.roleVetDesc}
              </p>
            </div>

            {/* Arrow */}
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
