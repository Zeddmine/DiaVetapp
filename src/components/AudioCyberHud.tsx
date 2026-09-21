import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Music, Sparkles, Radio, Disc3, ChevronDown, Check } from 'lucide-react';
import { soundEngine, BgmMode } from '../utils/soundEngine';
import { Language } from '../types';

interface AudioCyberHudProps {
  currentLang?: Language;
}

export default function AudioCyberHud({ currentLang = 'fr' }: AudioCyberHudProps) {
  const isRtl = currentLang === 'ar';
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMode, setCurrentMode] = useState<BgmMode>('cyber_algiers');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMuted(soundEngine.getIsMuted());
    setIsPlaying(soundEngine.getIsBgmPlaying());
    setCurrentMode(soundEngine.getBgmMode());
  }, []);

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    setIsPlaying(soundEngine.getIsBgmPlaying());
    if (!muted) {
      soundEngine.playPop();
    }
  };

  const handleSelectMode = (mode: BgmMode) => {
    soundEngine.setBgmMode(mode);
    setCurrentMode(mode);
    soundEngine.playPop();
    setIsMenuOpen(false);
    if (isMuted) {
      soundEngine.toggleMute();
      setIsMuted(false);
      setIsPlaying(true);
    }
  };

  const modeLabels: Record<BgmMode, { title: string; subtitle: string; icon: string }> = {
    cyber_algiers: {
      title: isRtl ? 'أجواء الجزائر السيبرانية 🌌' : 'Cyber Alger Ambiance 🌌',
      subtitle: isRtl ? 'ألحان فضائية هادئة' : 'Nappes spatiales & accords doux',
      icon: '🌌'
    },
    cyber_algeria: {
      title: isRtl ? 'واحة جزائرية DZ 🇩🇿' : 'Oasis Algérienne DZ 🇩🇿',
      subtitle: isRtl ? 'ألحان متوسطية دافئة' : 'Nappes chaudes méditerranéennes',
      icon: '🇩🇿'
    },
    neo_zen: {
      title: isRtl ? 'زن بيطري مهدئ 🐾' : 'Zen Bio-Vétérinaire 🐾',
      subtitle: isRtl ? 'نغمات استرخاء طبيعية' : 'Accords pentatoniques & carillons',
      icon: '🐾'
    },
    berceuse: {
      title: isRtl ? 'تهويدة وخرخرة القطط 🐱' : 'Berceuse Féline & Ronron 🐱',
      subtitle: isRtl ? 'تردد مهدئ للأعصاب' : 'Basse 35Hz & mélodie nocturne',
      icon: '🐱'
    },
    alpha_432: {
      title: isRtl ? 'موجات ألفا 432 هرتز 🌊' : 'Ondes Alpha 432 Hz 🌊',
      subtitle: isRtl ? 'تردد التوازن والراحة' : 'Fréquence de relaxation animale',
      icon: '🌊'
    },
    future_pulse: {
      title: isRtl ? 'حيوية وتعافي ⚡' : 'Vitalité & Convalescence ⚡',
      subtitle: isRtl ? 'إيقاع إلكتروني مستقبلي' : 'Harmoniques de récupération',
      icon: '⚡'
    }
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Audio Capsule Button */}
      <div className="flex items-center rounded-2xl bg-slate-900/90 border border-white/10 p-1 shadow-lg backdrop-blur-md">
        
        {/* Play/Mute Toggle */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? "Activer la bande-son futuriste" : "Couper la musique"}
          className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            !isMuted
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {!isMuted ? (
            <>
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline text-[11px] font-mono">BGM ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px] font-mono">BGM OFF</span>
            </>
          )}
        </button>

        {/* Soundtrack Mode Selector Trigger */}
        <button
          onClick={() => {
            soundEngine.playPop();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="px-2.5 py-2 rounded-xl text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Disc3 className={`w-3.5 h-3.5 text-cyan-400 ${!isMuted ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
          <span className="hidden md:inline font-mono text-[10px] text-cyan-300">
            {modeLabels[currentMode].icon} {currentMode === 'cyber_algiers' ? 'Cyber 🌌' : currentMode === 'neo_zen' ? 'Zen 🐾' : 'Pulse ⚡'}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} w-64 p-2 rounded-2xl bg-slate-950 border border-cyan-500/30 shadow-2xl backdrop-blur-xl z-50`}
          >
            <div className="px-3 py-1.5 text-[10px] font-mono font-black text-cyan-400 uppercase tracking-wider border-b border-white/10 mb-1">
              {isRtl ? "اختيار الأجواء الموسيقية" : "Bandes-Son Futuristes DiaVet"}
            </div>

            {(['cyber_algiers', 'neo_zen', 'future_pulse'] as BgmMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => handleSelectMode(mode)}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer my-0.5 ${
                  currentMode === mode
                    ? 'bg-cyan-500/20 text-white border border-cyan-400/40'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{modeLabels[mode].icon}</span>
                  <div>
                    <span className="text-xs font-bold block">{modeLabels[mode].title}</span>
                    <span className="text-[10px] text-slate-400 block">{modeLabels[mode].subtitle}</span>
                  </div>
                </div>
                {currentMode === mode && (
                  <Check className="w-4 h-4 text-cyan-400" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
