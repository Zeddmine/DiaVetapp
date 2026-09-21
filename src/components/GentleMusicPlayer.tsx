import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Disc3, SkipBack, SkipForward, Music, ChevronUp, ChevronDown, Check, Sparkles, X } from 'lucide-react';
import { soundEngine, MUSIC_TRACKS, MusicTrack, BgmMode } from '../utils/soundEngine';

interface GentleMusicPlayerProps {
  currentLang?: string;
}

export default function GentleMusicPlayer({ currentLang = 'fr' }: GentleMusicPlayerProps) {
  const isRtl = currentLang === 'ar';
  const [isPlaying, setIsPlaying] = useState<boolean>(() => soundEngine.getIsBgmPlaying());
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getIsMuted());
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(() => soundEngine.getCurrentTrack());
  const [showTrackPicker, setShowTrackPicker] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkState = () => {
      setIsPlaying(soundEngine.getIsBgmPlaying());
      setIsMuted(soundEngine.getIsMuted());
      setCurrentTrack(soundEngine.getCurrentTrack());
    };
    const interval = setInterval(checkState, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowTrackPicker(false);
      }
    };
    if (showTrackPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTrackPicker]);

  const handleToggle = () => {
    soundEngine.init();
    const active = soundEngine.toggleDouceMusique();
    setIsPlaying(active);
    setIsMuted(!active);
    setCurrentTrack(soundEngine.getCurrentTrack());
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.init();
    const nextT = soundEngine.nextTrack();
    setCurrentTrack(nextT);
    setIsPlaying(true);
    setIsMuted(false);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.init();
    const prevT = soundEngine.prevTrack();
    setCurrentTrack(prevT);
    setIsPlaying(true);
    setIsMuted(false);
  };

  const handleSelectTrack = (trackId: BgmMode) => {
    soundEngine.init();
    soundEngine.setTrack(trackId);
    if (soundEngine.getIsMuted() || !soundEngine.getIsBgmPlaying()) {
      soundEngine.startDouceMusique();
    }
    setCurrentTrack(soundEngine.getCurrentTrack());
    setIsPlaying(true);
    setIsMuted(false);
    setShowTrackPicker(false);
  };

  return (
    <div 
      className={`fixed bottom-20 z-40 transition-all duration-300 ${
        isRtl ? 'right-3 sm:right-6 left-auto' : 'left-3 sm:left-6'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="relative" ref={pickerRef}>
        {/* Track Picker Popover Menu */}
        {showTrackPicker && (
          <div className="absolute bottom-full mb-3 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/30 shadow-2xl backdrop-blur-xl p-3 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
            <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {isRtl ? 'اختر الموسيقى الهادئة 🎵' : 'Changer d\'ambiance musicale 🎵'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTrackPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 px-2">
              {isRtl 
                ? 'موسيقى علاجية ومريحة مخصصة لتهدئة الحيوانات والعيادات' 
                : 'Compositions sonores bio-vétérinaires relaxantes pour apaiser les animaux.'}
            </p>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {MUSIC_TRACKS.map(track => {
                const isActive = track.id === currentTrack.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectTrack(track.id)}
                    className={`w-full p-2.5 rounded-xl text-left flex items-start gap-2.5 transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-400 dark:border-cyan-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{track.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`text-xs font-extrabold truncate ${
                          isActive 
                            ? 'text-cyan-700 dark:text-cyan-300' 
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {track.title}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 shrink-0">
                          {track.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {track.subtitle}
                      </p>
                    </div>
                    {isActive && (
                      <div className="shrink-0 mt-1">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Outer subtle glow when playing */}
        {isPlaying && !isMuted && (
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/25 via-cyan-500/25 to-blue-500/25 rounded-2xl blur-sm animate-pulse pointer-events-none" />
        )}

        {/* Main Bar Card */}
        <div className="relative flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/30 shadow-xl dark:shadow-cyan-500/10 backdrop-blur-xl transition-all">
          
          {/* Main Play/Pause Button */}
          <button
            type="button"
            onClick={handleToggle}
            title={isPlaying && !isMuted ? (isRtl ? "إيقاف الموسيقى الهادئة" : "Mettre en pause") : (isRtl ? "تشغيل الموسيقى الهادئة" : "Lancer la musique")}
            className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm ${
              isPlaying && !isMuted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10'
            }`}
          >
            <Disc3 className={`w-4 h-4 shrink-0 ${isPlaying && !isMuted ? 'animate-spin text-white' : 'text-cyan-600 dark:text-cyan-400'}`} style={{ animationDuration: '3.5s' }} />
            
            <div className="flex flex-col text-left max-w-[110px] sm:max-w-[140px]">
              <span className={`text-[11px] leading-tight font-extrabold truncate ${
                isPlaying && !isMuted ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}>
                {isPlaying && !isMuted 
                  ? `${currentTrack.icon} ${currentTrack.title}` 
                  : (isRtl ? 'تشغيل الموسيقى 🎧' : 'Musique Zen 🎧')}
              </span>
              <span className={`text-[9px] leading-none truncate mt-0.5 ${
                isPlaying && !isMuted ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {isPlaying && !isMuted 
                  ? (isRtl ? 'انقر لتغيير اللحن ▾' : 'Changer de musique ▾')
                  : (isRtl ? 'ألحان مهدئة للحيوانات' : 'Détente clinique')}
              </span>
            </div>
          </button>

          {/* Equalizer animation when playing */}
          {isPlaying && !isMuted && (
            <div className="hidden xs:flex items-end gap-0.5 h-4 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
              <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-3.5" style={{ animationDuration: '650ms' }}></span>
              <span className="w-1 bg-cyan-500 rounded-full animate-pulse h-2" style={{ animationDuration: '450ms', animationDelay: '120ms' }}></span>
              <span className="w-1 bg-blue-500 rounded-full animate-pulse h-4" style={{ animationDuration: '550ms', animationDelay: '200ms' }}></span>
            </div>
          )}

          {/* Track Switcher Controls: Prev / Track Picker / Next */}
          <div className="flex items-center gap-0.5 border-l border-r border-slate-200 dark:border-white/10 px-1">
            {/* Previous Track */}
            <button
              type="button"
              onClick={handlePrev}
              title={isRtl ? "الموسيقى السابقة" : "Piste précédente"}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Track Picker Trigger Button */}
            <button
              type="button"
              onClick={() => setShowTrackPicker(!showTrackPicker)}
              title={isRtl ? "قائمة الألحان والموسيقى" : "Choisir une musique"}
              className={`px-1.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                showTrackPicker
                  ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <span>{currentTrack.icon}</span>
              <ChevronUp className={`w-3 h-3 transition-transform ${showTrackPicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Next Track */}
            <button
              type="button"
              onClick={handleNext}
              title={isRtl ? "الموسيقى التالية" : "Piste suivante"}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Mute button */}
          <button
            type="button"
            onClick={() => {
              const muted = soundEngine.toggleMute();
              setIsMuted(muted);
              setIsPlaying(!muted);
            }}
            title={isMuted ? (isRtl ? "تشغيل الصوت" : "Activer le son") : (isRtl ? "كتم الصوت" : "Couper le son")}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isMuted || !isPlaying ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
