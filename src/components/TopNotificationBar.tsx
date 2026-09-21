import { useState, useEffect } from 'react';
import { Language } from '../types';
import { Sparkles, X, Instagram, ArrowRight } from 'lucide-react';

interface TopNotificationBarProps {
  currentLang: Language;
  onOpenQuestionnaire: () => void;
}

export default function TopNotificationBar({
  currentLang,
  onOpenQuestionnaire
}: TopNotificationBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('diavet_top_banner_dismissed');
    if (isDismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('diavet_top_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  const content = {
    fr: {
      badge: "🇩🇿 NOUVEAU EN ALGÉRIE",
      message: "Rejoignez le Programme Fondateur DiaVet : Pass VIP & Carnet Numérique offerts aux 500 premiers inscrits !",
      igBtn: "Instagram @dia__vet",
      actionBtn: "Participer au questionnaire"
    },
    en: {
      badge: "🇩🇿 NEW IN ALGERIA",
      message: "Join DiaVet Founder Program: Free VIP Pass & Digital Passport for the first 500 sign-ups!",
      igBtn: "Instagram @dia__vet",
      actionBtn: "Take the survey"
    },
    ar: {
      badge: "🇩🇿 جديد في الجزائر",
      message: "انضم لبرنامج مؤسسي DiaVet: جواز سفر رقمي وبطاقة VIP مجاناً لأول 500 مسجل !",
      igBtn: "إنستغرام @dia__vet",
      actionBtn: "شارك في الاستبيان"
    }
  }[currentLang];

  return (
    <aside 
      aria-label="Notification de session DiaVet"
      className="relative z-50 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-700 text-white shadow-md text-xs py-2 px-3 sm:px-6 transition-all animate-in slide-in-from-top duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Left message with badge */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0 font-black text-[10px] uppercase bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 tracking-wider">
            {content.badge}
          </span>
          <p className="font-semibold text-white/95 text-[11px] sm:text-[13px] truncate sm:whitespace-normal">
            {content.message}
          </p>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Instagram direct link */}
          <a
            href="https://instagram.com/dia__vet"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold transition-all border border-white/20 hover:scale-105 active:scale-95"
          >
            <Instagram className="w-3.5 h-3.5 text-pink-300" />
            <span>{content.igBtn}</span>
          </a>

          {/* Quick survey trigger */}
          <button
            onClick={onOpenQuestionnaire}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-white text-slate-950 hover:bg-white/90 font-black text-[11px] sm:text-xs transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
          >
            <span className="whitespace-nowrap">{content.actionBtn}</span>
            <ArrowRight className="w-3 h-3 shrink-0" />
          </button>

          {/* Close Banner button */}
          <button
            onClick={handleDismiss}
            aria-label="Fermer la bannière"
            className="p-1 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
}
