import { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { ArrowRight, ShieldCheck, Heart, Sparkles, Activity, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_SCENES = [
  {
    id: 1,
    tag: "Nature & Émerveillement",
    badge: "1. Deux compagnons contemplant la nature",
    title: "Deux animaux observant la nature",
    description: "La beauté et la sérénité des animaux en harmonie avec les paysages algériens.",
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=85&w=1200",
    fallback: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&q=85&w=1200",
    icon: "🐾"
  },
  {
    id: 2,
    tag: "Complicité & Joie",
    badge: "2. Une personne jouant avec son animal",
    title: "Complicité et tendresse partagée",
    description: "Des moments de jeux inoubliables entre le maître et son fidèle compagnon.",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=85&w=1200",
    fallback: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=85&w=1200",
    icon: "❤️"
  },
  {
    id: 3,
    tag: "Soin Vétérinaire Expert",
    badge: "3. Vétérinaire examinant un chien ou chat",
    title: "Auscultation médicale bienveillante",
    description: "Le docteur vétérinaire ausculte avec soin et douceur pour un diagnostic précis.",
    image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=85&w=1200",
    fallback: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=85&w=1200",
    icon: "🩺"
  },
  {
    id: 4,
    tag: "Santé Connectée & Carnet",
    badge: "4. Vétérinaire consultant son profil numérique",
    title: "Dossier médical & profil digitalisé",
    description: "Consultation en temps réel des antécédents, vaccins et rappels sur tablette.",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=85&w=1200",
    fallback: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=85&w=1200",
    icon: "📱"
  }
];

interface HeroSectionProps {
  currentLang: Language;
  onStart: () => void;
  onExploreVets: () => void;
  onOpenDirectory: () => void;
  onOpenVideos?: () => void;
}

export default function HeroSection({
  currentLang,
  onStart,
  onExploreVets,
  onOpenDirectory,
  onOpenVideos
}: HeroSectionProps) {
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScene(prev => (prev + 1) % HERO_SCENES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = HERO_SCENES[activeScene];

  return (
    <section className="relative overflow-hidden pt-6 sm:pt-12 pb-16 sm:pb-24">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-64 sm:w-80 h-64 sm:h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Call to actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-emerald-500/10 border border-cyan-500/20 text-cyan-400 dark:text-cyan-300 light:text-cyan-700 text-xs sm:text-sm font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{t.heroTagline}</span>
              <span className="text-emerald-400 font-bold">🇩🇿</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] text-white dark:text-white light:text-slate-900">
              {t.heroMainTitle1}{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">
                {t.heroMainTitle2}
              </span>
            </h1>

            {/* Subtitle text */}
            <p className="text-base sm:text-lg xl:text-xl text-slate-300 dark:text-slate-300 light:text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t.heroSubtitle}
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="hero-start-btn"
                onClick={onStart}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/35 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
              >
                <span>{t.btnStart}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-directory-btn"
                onClick={onOpenDirectory}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-base text-slate-200 dark:text-slate-200 light:text-slate-700 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 hover:bg-slate-800/80 border border-white/10 dark:border-white/10 light:border-slate-300 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{t.navEmergencies}</span>
              </button>

              {onOpenVideos && (
                <button
                  id="hero-videos-btn"
                  onClick={onOpenVideos}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-base text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>DiaVet TV 🎬</span>
                </button>
              )}
            </div>

            {/* Social Proof / Security indicators */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>{t.statSec}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{t.statAvail}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>{t.statLocal}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Mockup with companion image & glass cards */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-md xl:max-w-none">
              
              {/* Decorative Border & Glow backdrop */}
              <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-cyan-500/40 via-blue-600/30 to-emerald-500/40 blur-xl opacity-60 group-hover:opacity-100 transition duration-1000"></div>

              {/* Main Photo Card with 4-Scene Slideshow */}
              <div className="relative rounded-[2.2rem] overflow-hidden border border-white/15 dark:border-white/15 light:border-slate-300 bg-slate-950/80 shadow-2xl">
                
                {/* Images Container */}
                <div className="relative w-full h-84 sm:h-96 xl:h-[430px]">
                  {HERO_SCENES.map((scene, idx) => (
                    <img
                      key={scene.id}
                      src={scene.image}
                      alt={scene.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if ((e.currentTarget as HTMLImageElement).src !== scene.fallback) {
                          (e.currentTarget as HTMLImageElement).src = scene.fallback;
                        }
                      }}
                      className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 transform ${
                        idx === activeScene 
                          ? 'opacity-100 scale-100' 
                          : 'opacity-0 scale-105 pointer-events-none'
                      }`}
                    />
                  ))}
                </div>

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none"></div>

                {/* Top Floating Badge Bar */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                  <div className="px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                    <span>{current.icon}</span>
                    <span className="text-cyan-300 font-mono text-[11px]">{current.tag}</span>
                  </div>
                  
                  {/* Carousel Controls (Previous / Next) */}
                  <div className="flex items-center gap-1 bg-slate-950/70 backdrop-blur-md p-1 rounded-full border border-white/10">
                    <button
                      onClick={() => setActiveScene(prev => (prev - 1 + HERO_SCENES.length) % HERO_SCENES.length)}
                      className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Scène précédente"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-300 px-1">
                      {activeScene + 1}/4
                    </span>
                    <button
                      onClick={() => setActiveScene(prev => (prev + 1) % HERO_SCENES.length)}
                      className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Scène suivante"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Floating Glass Card with Scene Description */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl backdrop-blur-xl bg-slate-950/85 border border-white/15 shadow-xl z-10 animate-in fade-in duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block mb-0.5">
                        {current.badge}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {current.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                        {current.description}
                      </p>
                    </div>
                  </div>

                  {/* 4 dots indicators */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {HERO_SCENES.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveScene(i)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            i === activeScene 
                              ? 'w-6 bg-cyan-400' 
                              : 'w-2 bg-white/30 hover:bg-white/60'
                          }`}
                          title={`Voir scène ${i + 1}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      DiaVet 58 Wilayas 🇩🇿
                    </span>
                  </div>
                </div>

              </div>

              {/* Floating Pill Accent 1 */}
              <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 shadow-lg shadow-cyan-500/10 text-xs font-bold text-white">
                <span className="text-base">🐾</span>
                <span>DiaVet Écosystème</span>
              </div>

              {/* Floating Pill Accent 2 */}
              <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 shadow-lg shadow-emerald-500/10 text-xs font-bold text-white">
                <span className="text-base">🩺</span>
                <span>Cliniques Agréées DZ</span>
              </div>

            </div>
          </div>

        </div>

        {/* Stats Grid Banner below */}
        <div className="mt-16 sm:mt-24 pt-8 border-t border-white/10 dark:border-white/10 light:border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.02] dark:bg-white/[0.02] light:bg-slate-100/70 border border-white/5 dark:border-white/5 light:border-slate-200 text-center">
              <p className="text-xl sm:text-2xl xl:text-3xl font-black text-white dark:text-white light:text-slate-900">{t.statCloud}</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.statCloudDesc}</p>
            </div>
            <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.02] dark:bg-white/[0.02] light:bg-slate-100/70 border border-white/5 dark:border-white/5 light:border-slate-200 text-center">
              <p className="text-xl sm:text-2xl xl:text-3xl font-black text-cyan-400">{t.statSec}</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.statSecDesc}</p>
            </div>
            <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.02] dark:bg-white/[0.02] light:bg-slate-100/70 border border-white/5 dark:border-white/5 light:border-slate-200 text-center">
              <p className="text-xl sm:text-2xl xl:text-3xl font-black text-emerald-400">{t.statAvail}</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.statAvailDesc}</p>
            </div>
            <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.02] dark:bg-white/[0.02] light:bg-slate-100/70 border border-white/5 dark:border-white/5 light:border-slate-200 text-center">
              <p className="text-xl sm:text-2xl xl:text-3xl font-black text-white dark:text-white light:text-slate-900">{t.statLocal}</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.statLocalDesc}</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
