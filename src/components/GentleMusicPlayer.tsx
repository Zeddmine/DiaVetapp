import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Disc3, Sparkles, Heart } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface GentleMusicPlayerProps {
  currentLang?: string;
}

export default function GentleMusicPlayer({ currentLang = 'fr' }: GentleMusicPlayerProps) {
  const isRtl = currentLang === 'ar';
  const [isPlaying, setIsPlaying] = useState<boolean>(() => soundEngine.getIsBgmPlaying());
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getIsMuted());
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    const checkState = () => {
      setIsPlaying(soundEngine.getIsBgmPlaying());
      setIsMuted(soundEngine.getIsMuted());
    };
    const interval = setInterval(checkState, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    soundEngine.init();
    const active = soundEngine.toggleDouceMusique();
    setIsPlaying(active);
    setIsMuted(!active);
  };

  return (
    <div 
      className={`fixed bottom-20 left-4 z-40 transition-all duration-300 ${
        isRtl ? 'right-4 left-auto' : 'left-4'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="relative group">
        {/* Glow backdrop when playing */}
        {isPlaying && !isMuted && (
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-blue-500/30 rounded-2xl blur-sm animate-pulse pointer-events-none" />
        )}

        <div className="relative flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-slate-950/90 hover:bg-slate-900/95 border border-cyan-500/30 hover:border-cyan-400 backdrop-blur-xl shadow-2xl transition-all">
          
          {/* Main Play / Pause Button */}
          <button
            onClick={handleToggle}
            title={isPlaying && !isMuted ? (isRtl ? "إيقاف الموسيقى الهادئة" : "Mettre en pause la musique douce") : (isRtl ? "تشغيل الموسيقى الهادئة المهدئة" : "Lancer la musique douce apaisante")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-md ${
              isPlaying && !isMuted
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 shadow-emerald-500/20 scale-105'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/40'
            }`}
          >
            <Disc3 className={`w-4 h-4 ${isPlaying && !isMuted ? 'animate-spin text-slate-950' : 'text-cyan-400'}`} style={{ animationDuration: '3s' }} />
            
            <div className="flex flex-col text-left">
              <span className="text-[11px] leading-tight font-extrabold flex items-center gap-1">
                {isPlaying && !isMuted 
                  ? (isRtl ? 'موسيقى هادئة مشغلة 🎵' : 'Musique Douce Active 🎵')
                  : (isRtl ? 'تشغيل موسيقى هادئة 🎧' : 'Musique Douce (Clic)')}
              </span>
              <span className="text-[9px] opacity-80 leading-none font-normal">
                {isRtl ? 'تهدئة الحيوانات والعيادة' : 'Apaisement clinique & zen'}
              </span>
            </div>
          </button>

          {/* Equalizer animation bars when active */}
          {isPlaying && !isMuted && (
            <div className="hidden sm:flex items-end gap-0.5 h-4 px-1.5 py-0.5 rounded bg-slate-900/80 border border-white/10">
              <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-3.5" style={{ animationDuration: '700ms' }}></span>
              <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-2" style={{ animationDuration: '450ms', animationDelay: '100ms' }}></span>
              <span className="w-1 bg-blue-400 rounded-full animate-pulse h-4" style={{ animationDuration: '600ms', animationDelay: '200ms' }}></span>
              <span className="w-1 bg-teal-300 rounded-full animate-pulse h-2.5" style={{ animationDuration: '500ms', animationDelay: '150ms' }}></span>
            </div>
          )}

          {/* Mute quick button */}
          <button
            onClick={() => {
              const muted = soundEngine.toggleMute();
              setIsMuted(muted);
              setIsPlaying(!muted);
            }}
            title={isMuted ? "Activer le son" : "Couper le son"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isMuted || !isPlaying ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
