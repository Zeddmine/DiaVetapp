import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Sparkles, Disc3 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface CyberAudioBarProps {
  currentLang?: string;
  onAnimalSound?: (sound: string) => void;
}

export default function CyberAudioBar({ currentLang = 'fr' }: CyberAudioBarProps) {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.getIsMuted());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastAnimalPlayed, setLastAnimalPlayed] = useState<string | null>(null);

  // Check state
  useEffect(() => {
    setIsMuted(soundEngine.getIsMuted());
  }, []);

  const handleToggleMusic = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
    setIsPlaying(!nextMuted);
  };

  const handleStartMusic = () => {
    soundEngine.init();
    soundEngine.startWelcomeMusic();
    setIsPlaying(true);
    setIsMuted(false);
  };

  const playAnimal = (animalKey: string, label: string) => {
    soundEngine.playAnimalSound(animalKey);
    setLastAnimalPlayed(label);
    setTimeout(() => setLastAnimalPlayed(null), 1800);
  };

  return (
    <div className="w-full bg-slate-950/90 border-y border-cyan-500/20 backdrop-blur-xl py-2 px-3 sm:px-6 relative z-30 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs">
        
        {/* Left: Music Player & Mute Controller */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
            <Disc3 className={`w-3.5 h-3.5 text-cyan-400 ${!isMuted ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="hidden xs:inline">Musique d'Accueil DiaVet</span>
            <span className="xs:hidden">Ambiance</span>
          </div>

          {/* Equalizer waves */}
          <div className="flex items-end gap-0.5 h-3.5 px-1.5 py-0.5 rounded bg-slate-900 border border-white/5">
            <span className={`w-1 bg-cyan-400 rounded-full transition-all ${!isMuted ? 'animate-pulse h-3' : 'h-1 opacity-30'}`} style={{ animationDuration: '600ms' }}></span>
            <span className={`w-1 bg-emerald-400 rounded-full transition-all ${!isMuted ? 'animate-pulse h-2.5' : 'h-1 opacity-30'}`} style={{ animationDuration: '400ms', animationDelay: '150ms' }}></span>
            <span className={`w-1 bg-blue-400 rounded-full transition-all ${!isMuted ? 'animate-pulse h-3.5' : 'h-1 opacity-30'}`} style={{ animationDuration: '700ms', animationDelay: '300ms' }}></span>
            <span className={`w-1 bg-purple-400 rounded-full transition-all ${!isMuted ? 'animate-pulse h-2' : 'h-1 opacity-30'}`} style={{ animationDuration: '500ms', animationDelay: '100ms' }}></span>
          </div>

          {/* MUTE / UNMUTE BUTTON */}
          <button
            onClick={handleToggleMusic}
            title={isMuted ? "Activer la musique d'ambiance DiaVet" : "Mettre en sourdine"}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer shadow-sm ${
              isMuted
                ? 'bg-slate-800 text-slate-400 hover:text-white border border-white/10 hover:bg-slate-700'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border border-cyan-400/50 shadow-cyan-500/20'
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>Musique : Muet</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-200" />
                <span>Musique : Active 🔊</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Quick Animal Sound Bar (Chat, Chien, Oiseau, Rongeur, Cheval) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5 max-w-full">
          <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] shrink-0">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Sons Réels Enregistrés 🎙️</span>
          </div>

          <span className="text-[11px] text-slate-400 font-semibold hidden md:inline shrink-0">
            {lastAnimalPlayed ? (
              <span className="text-cyan-300 font-bold animate-pulse">🔊 {lastAnimalPlayed} (Son Réel) !</span>
            ) : (
              'Écouter en direct :'
            )}
          </span>

          {/* 1. Chat (Miaou) */}
          <button
            onClick={() => playAnimal('chat', 'Miaou Réel')}
            title="Écouter le vrai miaulement du Chat"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/50 transition-all active:scale-90 cursor-pointer shrink-0"
          >
            <span>🐱</span>
            <span className="font-bold text-[11px]">Chat (Miaou)</span>
          </button>

          {/* 2. Chien (Aboiement) */}
          <button
            onClick={() => playAnimal('chien', 'Aboiement Réel')}
            title="Écouter le véritable aboiement du Chien"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/10 hover:border-emerald-400/50 transition-all active:scale-90 cursor-pointer shrink-0"
          >
            <span>🐶</span>
            <span className="font-bold text-[11px]">Chien (Wouf)</span>
          </button>

          {/* 3. Oiseau (Cui-cui) */}
          <button
            onClick={() => playAnimal('oiseau', 'Chant d\'oiseau Réel')}
            title="Écouter le véritable chant de l'Oiseau"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-white/10 hover:border-amber-400/50 transition-all active:scale-90 cursor-pointer shrink-0"
          >
            <span>🦜</span>
            <span className="font-bold text-[11px]">Oiseau</span>
          </button>

          {/* 4. Cheval (Hennissement) */}
          <button
            onClick={() => playAnimal('cheval', 'Hennissement Réel')}
            title="Écouter le véritable hennissement du Cheval"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-purple-500/20 text-slate-200 hover:text-purple-300 border border-white/10 hover:border-purple-400/50 transition-all active:scale-90 cursor-pointer shrink-0"
          >
            <span>🐴</span>
            <span className="font-bold text-[11px]">Cheval (Hennir)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
