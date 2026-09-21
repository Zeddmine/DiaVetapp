import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, Clock, AlertTriangle, Hammer, Lock, ChevronRight
} from 'lucide-react';
import { Language } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface VideoTutorial {
  id: string;
  title: string;
  category: 'emergency' | 'dog' | 'cat' | 'vet' | 'general';
  categoryLabel: string;
  duration: string;
  views: string;
  badge: string;
  thumbnailGradient: string;
  icon: string;
  summary: string;
  vetAuthor: string;
}

const TUTORIAL_VIDEOS: VideoTutorial[] = [
  {
    id: 'vid-urgence-chaleur',
    title: '🚨 Urgences Vitales : Coup de Chaleur & Déshydratation en Algérie',
    category: 'emergency',
    categoryLabel: 'Urgences Vitales',
    duration: '04:15',
    views: '18.4k',
    badge: 'En Tournage',
    thumbnailGradient: 'from-amber-600/30 via-rose-600/20 to-slate-900',
    icon: '🔥',
    summary: 'Comment réagir immédiatement quand la température dépasse 38°C en été. Module vidéo clinique en cours de montage.',
    vetAuthor: 'Dr. Yacine K. — Urgentiste Vétérinaire Alger'
  },
  {
    id: 'vid-vaccin-rage',
    title: '💉 Vaccination & Rage en Algérie : Le Guide Officiel Obligatoire (ONMV)',
    category: 'general',
    categoryLabel: 'Prévention & Loi',
    duration: '05:30',
    views: '24.1k',
    badge: 'En Tournage',
    thumbnailGradient: 'from-emerald-600/30 via-cyan-600/20 to-slate-900',
    icon: '🛡️',
    summary: 'Réglementation algérienne sur le vaccin antirabique annuel et passeport sanitaire officiel. Masterclass en post-production.',
    vetAuthor: 'Dr. Soraya B. — Praticienne Agréée Blida'
  },
  {
    id: 'vid-premiers-secours-fracture',
    title: '🩹 Premiers Secours : Immobiliser un Membre Après Accident de la Route',
    category: 'emergency',
    categoryLabel: 'Urgences Chirurgicales',
    duration: '03:45',
    views: '12.8k',
    badge: 'En Tournage',
    thumbnailGradient: 'from-red-600/30 via-orange-600/20 to-slate-900',
    icon: '🚨',
    summary: 'Gestes de manipulation douce et transport sécurisé vers la clinique sans aggraver la lésion.',
    vetAuthor: 'Dr. Amine M. — Chirurgien Vétérinaire Alger'
  },
  {
    id: 'vid-alimentation-ete',
    title: '🥣 Alimentation & Hydratation en Période de Canicule (Chiens & Chats)',
    category: 'cat',
    categoryLabel: 'Nutrition Clinique',
    duration: '04:50',
    views: '15.2k',
    badge: 'En Tournage',
    thumbnailGradient: 'from-blue-600/30 via-cyan-600/20 to-slate-900',
    icon: '💧',
    summary: 'Bi-nutrition croquettes/pâtée, fontaines à eau et glaçons aromatisés pour prévenir l’insuffisance rénale féline en été.',
    vetAuthor: 'Dr. Lamia H. — Consultante Nutrition Tizi Ouzou'
  },
  {
    id: 'vid-sterilisation-chat',
    title: '🐱 Stérilisation et Castration : Bienfaits, Âge Idéal et Convalescence',
    category: 'cat',
    categoryLabel: 'Chirurgie Préventive',
    duration: '06:10',
    views: '21.0k',
    badge: 'En Tournage',
    thumbnailGradient: 'from-purple-600/30 via-pink-600/20 to-slate-900',
    icon: '🩺',
    summary: 'Pourquoi et quand faire stériliser son chat en Algérie. Précautions post-opératoires.',
    vetAuthor: 'Dr. Mehdi T. — Spécialiste Félin Oran'
  },
  {
    id: 'vid-leishmaniose-chien',
    title: '🐕 Leishmaniose & Tiques en Algérie : Protéger Votre Chien',
    category: 'dog',
    categoryLabel: 'Santé Chiens',
    duration: '05:15',
    views: '19.6k',
    badge: 'En Tournage',
    thumbnailGradient: 'from-orange-600/30 via-amber-600/20 to-slate-900',
    icon: '🦟',
    summary: 'La leishmaniose transmise par les phlébotomes en Algérie : colliers répulsifs et protocoles de dépistage.',
    vetAuthor: 'Dr. Karim L. — Parasitologue Constantine'
  }
];

interface DiaVetTvSectionProps {
  currentLang?: Language;
  onOpenQuestionnaire?: (role: 'owner' | 'vet') => void;
  onOpenDirectory?: () => void;
}

export default function DiaVetTvSection({
  currentLang = 'fr',
  onOpenDirectory
}: DiaVetTvSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDevVideo, setSelectedDevVideo] = useState<VideoTutorial | null>(null);
  const isRtl = currentLang === 'ar';
  const isEn = currentLang === 'en';

  const categories = [
    { id: 'all', label: isRtl ? 'جميع المقاطع 🎬' : isEn ? 'All Videos 🎬' : 'Toutes les vidéos 🎬' },
    { id: 'emergency', label: isRtl ? 'الطوارئ 🚨' : isEn ? 'Emergencies 🚨' : 'Urgences 🚨' },
    { id: 'dog', label: isRtl ? 'الكلاب 🐶' : isEn ? 'Dogs 🐶' : 'Chiens 🐶' },
    { id: 'cat', label: isRtl ? 'القطط 🐱' : isEn ? 'Cats 🐱' : 'Chats 🐱' },
    { id: 'general', label: isRtl ? 'الوقاية والرعاية 🛡️' : isEn ? 'Prevention & Care 🛡️' : 'Prévention & Soins 🛡️' }
  ];

  const filteredVideos = selectedCategory === 'all'
    ? TUTORIAL_VIDEOS
    : TUTORIAL_VIDEOS.filter(v => v.category === selectedCategory);

  const handleVideoClick = (video: VideoTutorial) => {
    soundEngine.playCyberClick();
    setSelectedDevVideo(video);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-8" 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header Banner With In-Development Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 border-2 border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30 shadow-2xl mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black mb-3">
              <Hammer className="w-3.5 h-3.5 animate-bounce text-amber-400" />
              <span>{isRtl ? "قسم قيد التطوير البرمجي والإنتاج 🎬" : isEn ? "MODULE IN ACTIVE DEVELOPMENT & PRODUCTION 🎬" : "SECTION EN COURS DE DÉVELOPPEMENT & TOURNAGE 🎬"}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {isRtl ? "قناة DiaVet TV — مقاطع الفيديو الإرشادية" : isEn ? "DiaVet TV — Video Guides & Masterclasses" : "DiaVet TV — Tutoriels Vidéos & Masterclasses"}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              {isRtl
                ? "يتم حالياً تسجيل ومونتاج المقاطع المصورة بالتعاون مع نخبة من الأطباء البيطريين الجزائريين. خدمة تشغيل الفيديو تحت الصيانة والتطوير وغير متاحة حالياً."
                : isEn
                ? "DiaVet TV video guides are currently being recorded with certified Algerian veterinary practitioners. Direct video playback is undergoing development."
                : "La plateforme vidéo DiaVet TV est actuellement en plein tournage et post-production avec des médecins vétérinaires algériens certifiés. La lecture vidéo est en cours de développement."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
              <div className="text-xl sm:text-2xl font-black text-amber-400">EN DEV</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">{isRtl ? "قيد الإنتاج" : isEn ? "Coming soon" : "Bientôt disponible"}</div>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-xl sm:text-2xl font-black text-cyan-400">58</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">{isRtl ? "ولاية جزائرية" : isEn ? "DZ Wilayas" : "Wilayas"}</div>
            </div>
          </div>
        </div>

        {/* Development Notice Warning Box */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center gap-3 text-amber-200 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="font-semibold">
            {isRtl
              ? "تنبيه: قسم الفيديوهات قيد التطوير البرمجي — لا يوجد وصول أو تشغيل للمقاطع في الوقت الحالي حتى اكتمال إطلاق الاستوديو."
              : isEn
              ? "Notice: Video streaming module is in active development. Video clips are temporarily locked pending studio release."
              : "Avis aux utilisateurs : Le module de streaming vidéo est en cours de développement. Les vidéos ne sont pas accessibles pour le moment."}
          </p>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              soundEngine.playPop();
              setSelectedCategory(cat.id);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105 font-black'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Videos Grid with In Development Lock Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((vid) => (
          <div
            key={vid.id}
            onClick={() => handleVideoClick(vid)}
            className="group relative rounded-3xl overflow-hidden border border-amber-500/30 bg-slate-900/80 hover:border-amber-400/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col opacity-95 hover:opacity-100"
          >
            {/* Thumbnail Header */}
            <div className={`relative h-48 bg-gradient-to-br ${vid.thumbnailGradient} p-5 flex flex-col justify-between overflow-hidden`}>
              {/* Overlay with subtle grid pattern */}
              <div className="absolute inset-0 bg-slate-950/60 group-hover:bg-slate-950/40 transition-colors backdrop-blur-[2px]" />

              {/* Badges */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-slate-950/80 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                  {vid.categoryLabel}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Hammer className="w-2.5 h-2.5" />
                  <span>{isRtl ? "قيد التطوير" : isEn ? "In Dev" : "En développement"}</span>
                </span>
              </div>

              {/* Lock Indicator in center of thumbnail */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-950/80 border border-amber-400/50 text-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6" />
                </div>
              </div>

              {/* Status */}
              <div className="relative z-10 flex items-center justify-between text-xs text-white/80 font-mono">
                <span className="flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-lg backdrop-blur-sm text-amber-300 font-bold">
                  <Clock className="w-3 h-3" />
                  <span>{isRtl ? "قريباً" : isEn ? "Soon" : "Bientôt"}</span>
                </span>
                <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded-lg text-slate-300">
                  {vid.duration}
                </span>
              </div>
            </div>

            {/* Video Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug mb-2">
                  {vid.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {vid.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-medium truncate max-w-[180px]">
                  {vid.vetAuthor}
                </span>
                <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>{isRtl ? "قيد التطوير" : isEn ? "In Dev" : "En développement"}</span>
                  <Lock className="w-3 h-3 text-amber-400" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* IN-DEVELOPMENT MODAL WHEN CLICKING ANY VIDEO */}
      <AnimatePresence>
        {selectedDevVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md p-6 sm:p-8 bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl shadow-amber-950/60 text-slate-100 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Icon */}
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 mx-auto mb-4 text-2xl font-black">
                <Hammer className="w-8 h-8 animate-bounce" />
              </div>

              <div className="text-center space-y-2 mb-6">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40 uppercase">
                  {isRtl ? "ميزة قيد التطوير البرمجي" : isEn ? "Module Under Active Development" : "Fonctionnalité en développement"}
                </span>
                <h3 className="text-xl font-black text-white pt-1">
                  {selectedDevVideo.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {isRtl
                    ? "قسم الفيديوهات وقناة DiaVet TV قيد التطوير البرمجي حالياً. لا يوجد وصول أو تشغيل مباشر للمقاطع في الوقت الراهن."
                    : isEn
                    ? "DiaVet TV video player is currently undergoing development. Direct playback will be unlocked upon studio release."
                    : "Le lecteur de vidéos et les tutoriels DiaVet TV sont actuellement en cours de développement. Aucun accès ni lecture n'est disponible pour le moment."}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 text-xs text-slate-300 mb-6 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>{isRtl ? "الطبيب المشرف :" : isEn ? "Practitioner author:" : "Praticien auteur :"}</span>
                  <span className="text-white font-bold">{selectedDevVideo.vetAuthor}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>{isRtl ? "الحالة البرمجية :" : isEn ? "Technical status:" : "Statut technique :"}</span>
                  <span className="text-amber-400 font-bold">{isRtl ? "قيد الإنجاز ⏳" : isEn ? "In progress ⏳" : "En cours de développement ⏳"}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {onOpenDirectory && (
                  <button
                    onClick={() => {
                      soundEngine.playSuccess();
                      onOpenDirectory();
                      setSelectedDevVideo(null);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <span>{isRtl ? "تصفح دليل العيادات والأطباء" : isEn ? "Explore Algerian Vet Directory" : "Consulter l'annuaire des vétérinaires"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setSelectedDevVideo(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
                >
                  {isRtl ? "إغلاق" : isEn ? "Close" : "Fermer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
