import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AppScreen, Language, Theme 
} from '../types';
import { getTranslations } from '../data/translations';
import { navDrawerVariants } from '../utils/transitions';
import { 
  Menu, X, Sun, Moon, 
  Award, Heart, ShoppingBag, Lightbulb, 
  FileEdit, Lock, Stethoscope, Cloud,
  Video, FileSpreadsheet, User, Sparkles, LogOut, Languages
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import DiaVetLogo from './DiaVetLogo';
import AudioCyberHud from './AudioCyberHud';
import { PWAInstallButton } from './PWAInstallButton';
import { DIAVET_OFFICIAL_EMAIL } from '../services/firebase';

interface NavbarProps {
  currentLang: Language;
  currentTheme: Theme;
  onSelectLang: (lang: Language) => void;
  onToggleTheme: () => void;
  isIphoneView: boolean;
  onToggleIphoneView: () => void;
  onNavigate: (screen: AppScreen) => void;
  activeScreen: AppScreen;
  unlockedBadgesCount?: number;
  hasCompletedQuestionnaire?: boolean;
  userRole?: 'owner' | 'vet';
  isOwner?: boolean;
  userName?: string;
  userPoints?: number;
  onOpenExcel?: () => void;
  onLockedFeatureClick?: (featureName: string) => void;
  onResetRegistration?: () => void;
  onOpenProfile?: () => void;
  onOpenContact?: () => void;
  onOpenDriveSync?: () => void;
  isRegistered?: boolean;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export default function Navbar({
  currentLang,
  currentTheme,
  onSelectLang,
  onToggleTheme,
  onNavigate,
  activeScreen,
  unlockedBadgesCount,
  hasCompletedQuestionnaire = false,
  userRole = 'owner',
  isOwner = false,
  userName,
  userPoints,
  onOpenExcel,
  onLockedFeatureClick,
  onOpenProfile,
  onOpenContact,
  onOpenDriveSync,
  isRegistered = false,
  onOpenAuth,
  onLogout
}: NavbarProps) {
  const t = getTranslations(currentLang);
  const isAr = currentLang === 'ar';
  const isEn = currentLang === 'en';
  const isRtl = isAr;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProtectedNav = (screen: AppScreen, featureName: string) => {
    soundEngine.playCyberClick();
    if (!hasCompletedQuestionnaire) {
      if (onLockedFeatureClick) {
        onLockedFeatureClick(featureName);
      }
      return;
    }
    onNavigate(screen);
    setMobileMenuOpen(false);
  };

  const getQuestionnaireScreen = (): AppScreen => {
    return userRole === 'vet' ? 'questionnaire-vet' : 'questionnaire-owner';
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 border-b border-white/10 dark:border-white/10 light:border-slate-200 transition-colors" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Brand Logo */}
          <button 
            id="brand-logo-btn"
            onClick={() => {
              soundEngine.playCyberClick();
              onNavigate('home');
            }} 
            className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer transition-transform active:scale-95 shrink-0"
          >
            <DiaVetLogo size="md" />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white dark:text-white light:text-slate-900 group-hover:text-cyan-400 dark:group-hover:text-cyan-300 light:group-hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                DiaVet <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">DZ 🇩🇿</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 hidden xs:inline -mt-0.5">
                {t.brandSubtitle}
              </span>
            </div>
          </button>

          {/* Center Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-slate-300">
            <button
              id="nav-home-btn"
              onClick={() => {
                soundEngine.playCyberClick();
                onNavigate('home');
              }}
              className={`hover:text-cyan-400 transition-colors py-1 cursor-pointer px-2 ${
                activeScreen === 'home' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400' : ''
              }`}
            >
              {t.navHome}
            </button>

            {/* SECTION PROPRIÉTAIRE */}
            <button
              id="nav-owner-space-btn"
              onClick={() => {
                soundEngine.playCyberClick();
                onNavigate('owner-portal');
              }}
              className={`hover:text-rose-300 transition-all py-1 px-2.5 rounded-xl cursor-pointer flex items-center gap-1 border ${
                activeScreen === 'owner-portal'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/60 font-black shadow-md shadow-rose-500/20'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
              <span>{t.navOwnerSpace}</span>
            </button>

            {/* SECTION VÉTÉRINAIRE */}
            <button
              id="nav-vet-space-btn"
              onClick={() => {
                soundEngine.playWarpSwitch();
                onNavigate('vet-portal');
              }}
              className={`hover:text-emerald-300 transition-all py-1 px-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 border ${
                activeScreen === 'vet-portal'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 font-black shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.navVetSpace}</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-400 text-slate-950 ml-0.5">
                PRO
              </span>
            </button>

            {/* Profil / VIP Card */}
            <button
              id="nav-profile-btn"
              onClick={() => {
                soundEngine.playCyberClick();
                if (onOpenProfile) {
                  onOpenProfile();
                } else {
                  onNavigate('profile');
                }
              }}
              className={`hover:text-amber-300 transition-colors py-1 cursor-pointer px-2 flex items-center gap-1.5 ${
                activeScreen === 'profile' ? 'text-amber-300 font-bold border-b-2 border-amber-400' : ''
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? "الملف الشخصي" : isEn ? "My Profile" : "Mon Profil"}</span>
              {typeof unlockedBadgesCount === 'number' && unlockedBadgesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-black border border-amber-500/40">
                  {unlockedBadgesCount}
                </span>
              )}
            </button>

            {/* Directory / Emergencies */}
            <button
              id="nav-emergencies-btn"
              onClick={() => {
                soundEngine.playCyberClick();
                onNavigate('dz-directory');
              }}
              className={`hover:text-cyan-400 transition-colors py-1 cursor-pointer px-2 ${
                activeScreen === 'dz-directory' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400' : ''
              }`}
            >
              {isAr ? "دليل 58 ولاية" : isEn ? "Directory" : "Urgences DZ"}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Real Connected User Chip */}
            {isRegistered && userName && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  if (onOpenProfile) {
                    onOpenProfile();
                  } else {
                    onNavigate('profile');
                  }
                }}
                title={isAr ? "انقر لرؤية وتعديل ملفك الشخصي" : isEn ? "Click to view and edit your profile" : "Cliquer pour voir et modifier votre profil"}
                className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-xl bg-slate-800/90 border border-cyan-400/30 hover:border-cyan-400 text-xs text-white transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              >
                <div className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-[10px]">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold truncate max-w-[90px] sm:max-w-[120px] text-cyan-300">{userName}</span>
                {typeof userPoints === 'number' && (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black">
                    {userPoints} pts
                  </span>
                )}
              </button>
            )}

            {/* Logout Button in Desktop Navbar */}
            {isRegistered && onLogout && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onLogout();
                }}
                title={isAr ? "تسجيل الخروج الرسمي من DiaVet" : isEn ? "Log out from DiaVet" : "Se déconnecter"}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">{t.logout}</span>
              </button>
            )}

            {/* Inscription / Connexion Button (Visible when disconnected) */}
            {!isRegistered && onOpenAuth && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenAuth();
                }}
                title={isAr ? "تسجيل الدخول أو فتح حساب حقيقي" : isEn ? "Log in or register" : "Se connecter ou créer un compte vérifié"}
                className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 transition-all hover:scale-105 shrink-0 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse shrink-0" />
                <span>{t.login}</span>
              </button>
            )}

            {/* PWA INSTALL BUTTON */}
            <PWAInstallButton className="hidden sm:inline-flex" />

            {/* CYBER AUDIO HUD */}
            <div className="hidden lg:inline-flex">
              <AudioCyberHud currentLang={currentLang} />
            </div>

            {/* Official Contact Button */}
            {onOpenContact && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenContact();
                }}
                title="contact@diavet.com"
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>contact@diavet.com</span>
              </button>
            )}

            {/* Official Excel Leads Export Button — Reserved strictly for Owner */}
            {onOpenExcel && isOwner && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenExcel();
                }}
                title="Télécharger Registre Excel (.xls)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            )}

            {/* Cloud Drive Sync Button */}
            {onOpenDriveSync && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenDriveSync();
                }}
                title="Cloud Backup"
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-400/30 transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden lg:inline">Cloud</span>
              </button>
            )}

            {/* Language Selector (Always Visible on ALL Devices) */}
            <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/95 border-2 border-cyan-500/40 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl shadow-md shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playCyberClick();
                  onSelectLang('fr');
                }}
                className={`px-1.5 sm:px-2 py-0.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-0.5 sm:gap-1 cursor-pointer ${
                  currentLang === 'fr' 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-sm scale-105' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Français"
              >
                <span>🇫🇷</span>
                <span className="hidden xs:inline">FR</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playCyberClick();
                  onSelectLang('ar');
                }}
                className={`px-1.5 sm:px-2 py-0.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-0.5 sm:gap-1 cursor-pointer ${
                  currentLang === 'ar' 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-sm scale-105' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="العربية"
              >
                <span>🇩🇿</span>
                <span className="hidden xs:inline">عربي</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playCyberClick();
                  onSelectLang('en');
                }}
                className={`px-1.5 sm:px-2 py-0.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-0.5 sm:gap-1 cursor-pointer ${
                  currentLang === 'en' 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-sm scale-105' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="English"
              >
                <span>🇬🇧</span>
                <span className="hidden xs:inline">EN</span>
              </button>
            </div>

            {/* Theme Switcher Toggle Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playCyberClick();
                onToggleTheme();
              }}
              title={
                currentTheme === 'dark'
                  ? (isAr ? "التبديل إلى الوضع الفاتح" : isEn ? "Switch to Light Mode" : "Passer au Mode Clair")
                  : (isAr ? "التبديل إلى الوضع الداكن" : isEn ? "Switch to Dark Mode" : "Passer au Mode Sombre")
              }
              className={`p-2 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95 ${
                currentTheme === 'dark'
                  ? 'bg-slate-900/90 border-cyan-500/40 text-amber-300 hover:text-amber-200 hover:border-amber-400/60'
                  : 'bg-amber-100 border-amber-400 text-amber-800 hover:text-amber-950 hover:bg-amber-200'
              }`}
              aria-label="Toggle theme mode"
            >
              {currentTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-amber-800" />
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                soundEngine.playCyberClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="lg:hidden p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* HORIZONTAL QUICK NAV STRIP (ALWAYS VISIBLE & ACCESSIBLE ON ALL DEVICES) */}
      <nav 
        aria-label="Sub navigation strip"
        className="border-t border-white/10 bg-slate-950/90 py-1.5 px-3 sm:px-6 overflow-x-auto whitespace-nowrap flex items-center gap-2 text-xs scrollbar-none shadow-inner"
      >
        {/* Accueil */}
        <button
          onClick={() => {
            soundEngine.playCyberClick();
            onNavigate('home');
          }}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeScreen === 'home'
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-sm'
              : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10'
          }`}
        >
          <span>🏠</span>
          <span>{t.navHome}</span>
        </button>

        {/* Espace Propriétaire */}
        <button
          onClick={() => {
            soundEngine.playCyberClick();
            onNavigate('owner-portal');
          }}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeScreen === 'owner-portal'
              ? 'bg-rose-500/25 text-rose-300 border border-rose-400/50 shadow-sm'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
          <span>{t.navOwnerSpace}</span>
        </button>

        {/* Espace Vétérinaire */}
        <button
          onClick={() => {
            soundEngine.playWarpSwitch();
            onNavigate('vet-portal');
          }}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeScreen === 'vet-portal'
              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-sm'
              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.navVetSpace}</span>
          <span className="text-[9px] font-black uppercase px-1 rounded bg-emerald-400 text-slate-950">PRO</span>
        </button>

        {/* Mon Profil 👤 / Modifier Informations */}
        <button
          onClick={() => {
            soundEngine.playCyberClick();
            if (onOpenProfile) {
              onOpenProfile();
            } else {
              onNavigate('profile');
            }
          }}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeScreen === 'profile'
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-sm'
              : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10'
          }`}
        >
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isAr ? "الملف الشخصي" : isEn ? "My Profile" : "Mon Profil"}</span>
        </button>

        {/* Formulaire Health */}
        {!hasCompletedQuestionnaire && (
          <button
            onClick={() => {
              soundEngine.playCyberClick();
              onNavigate(getQuestionnaireScreen());
            }}
            className="px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 bg-amber-500/20 text-amber-300 border border-amber-400/50 animate-pulse cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.navQuestionnaire}</span>
          </button>
        )}

        {/* Adoption Solidaire */}
        <button
          onClick={() => handleProtectedNav('adoption', isAr ? 'تبني الحيوانات' : isEn ? 'Solidarity Adoption' : 'Adoption Solidaire')}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeScreen === 'adoption'
              ? 'bg-rose-500/25 text-rose-300 border border-rose-400/50 shadow-sm'
              : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          <span>{t.navAdoption}</span>
          {!hasCompletedQuestionnaire && <Lock className="w-3 h-3 text-amber-400" />}
        </button>

        {/* Animalerie & Marketplace */}
        <button
          onClick={() => handleProtectedNav('marketplace', isAr ? 'متجر الحيوانات' : isEn ? 'Pet Store' : 'Marketplace')}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeScreen === 'marketplace'
              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-sm'
              : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.navMarketplace}</span>
          {!hasCompletedQuestionnaire && <Lock className="w-3 h-3 text-amber-400" />}
        </button>

        {/* Boîte à Idées */}
        <button
          onClick={() => handleProtectedNav('ideas', isAr ? 'صندوق الأفكار' : isEn ? 'Idea Box' : 'Boîte à Idées')}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeScreen === 'ideas'
              ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-sm'
              : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/10'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.navIdeas}</span>
          {!hasCompletedQuestionnaire && <Lock className="w-3 h-3 text-amber-400" />}
        </button>

        {/* Urgences 58 Wilayas */}
        <button
          onClick={() => {
            soundEngine.playCyberClick();
            onNavigate('dz-directory');
          }}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
            activeScreen === 'dz-directory'
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-sm'
              : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20'
          }`}
        >
          <span>🇩🇿</span>
          <span>{isAr ? "دليل 58 ولاية" : isEn ? "58 Wilayas Directory" : "Urgences 58 Wilayas"}</span>
        </button>
      </nav>

      {/* Mobile Drawer Menu with AnimatePresence exit animations */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={navDrawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="lg:hidden bg-slate-950/95 border-b border-white/10 px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto"
          >
            {/* Theme & Language Selection Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 rounded-2xl bg-slate-900 border border-white/10">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-cyan-400" />
                  <span>{t.changeLang}</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCyberClick();
                    onToggleTheme();
                  }}
                  className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    currentTheme === 'dark'
                      ? 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700'
                      : 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200'
                  }`}
                >
                  {currentTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-amber-700" />}
                  <span className="text-[11px] font-black">{currentTheme === 'dark' ? (isAr ? 'فاتح' : isEn ? 'Light' : 'Clair') : (isAr ? 'داكن' : isEn ? 'Dark' : 'Sombre')}</span>
                </button>
              </div>

              <div className="flex items-center gap-1 justify-end">
                {[
                  { code: 'fr' as Language, label: 'Français', flag: '🇫🇷' },
                  { code: 'ar' as Language, label: 'العربية', flag: '🇩🇿' },
                  { code: 'en' as Language, label: 'English', flag: '🇬🇧' }
                ].map(({ code, label, flag }) => (
                  <button
                    key={code}
                    onClick={() => {
                      soundEngine.playCyberClick();
                      onSelectLang(code);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                      currentLang === code 
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-105' 
                        : 'text-slate-400 hover:text-white bg-slate-800'
                    }`}
                  >
                    <span className="text-base">{flag}</span>
                    <span className="text-[11px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile & Auth Section */}
            {!isRegistered ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    {t.memberSpace}
                  </span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                    {t.notConnected}
                  </span>
                </div>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      soundEngine.playCyberClick();
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{isAr ? "تسجيل الدخول / فتح حساب جديد" : isEn ? "Log In / Register" : "Connexion / Créer un compte"}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/30 flex items-center justify-between">
                <button
                  onClick={() => {
                    soundEngine.playCyberClick();
                    setMobileMenuOpen(false);
                    if (onOpenProfile) {
                      onOpenProfile();
                    } else {
                      onNavigate('profile');
                    }
                  }}
                  className="flex items-center gap-2.5 text-left cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                      <span>{userName}</span>
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                    </p>
                    <p className="text-[10px] text-cyan-300 font-medium">
                      {userRole === 'vet' ? '🩺 Vétérinaire PRO' : '🐾 Propriétaire'}
                      {typeof userPoints === 'number' && ` • ${userPoints} pts`}
                    </p>
                  </div>
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      soundEngine.playCyberClick();
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.logout}</span>
                  </button>
                )}
              </div>
            )}

            <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-200">
              <button
                onClick={() => { 
                  soundEngine.playCyberClick();
                  onNavigate('home'); 
                  setMobileMenuOpen(false); 
                }}
                className="text-left py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>🏠</span>
                <span>{t.navHome}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onNavigate('owner-portal');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2.5 px-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
                <span>🐾 {t.navOwnerSpace}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playWarpSwitch();
                  onNavigate('vet-portal');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-400" />
                  <span>🩺 {t.navVetSpace}</span>
                </div>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  setMobileMenuOpen(false);
                  if (onOpenProfile) {
                    onOpenProfile();
                  } else {
                    onNavigate('profile');
                  }
                }}
                className="text-left py-2.5 px-3 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>👤 {isAr ? "الملف الشخصي" : isEn ? "My Profile" : "Mon Profil"}</span>
                </div>
                <Award className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onNavigate('dz-directory');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>🇩🇿</span>
                <span>{isAr ? "دليل 58 ولاية" : isEn ? "58 Wilayas Directory" : "Urgences 58 Wilayas"}</span>
              </button>

              {onOpenContact && (
                <button
                  onClick={() => {
                    soundEngine.playCyberClick();
                    setMobileMenuOpen(false);
                    onOpenContact();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center justify-between cursor-pointer text-xs"
                >
                  <span>Contact : {DIAVET_OFFICIAL_EMAIL}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
