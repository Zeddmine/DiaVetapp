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
  Video, FileSpreadsheet, User, Sparkles, LogOut, Languages, Bell, BellRing
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
  onOpenAdminDb?: () => void;
  cloudLeadsCount?: number;
  isRegistered?: boolean;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onOpenPushCenter?: () => void;
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
  onOpenAdminDb,
  cloudLeadsCount,
  isRegistered = false,
  onOpenAuth,
  onLogout,
  onOpenPushCenter
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
    <header 
      className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors shadow-sm ${
        currentTheme === 'light'
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
          : 'bg-slate-950/90 border-white/10 text-white shadow-black/40'
      }`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
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
            <DiaVetLogo size="md" variant={isOwner ? 'developer' : 'visitor'} />
            <div className="flex flex-col">
              <span className={`text-xl sm:text-2xl font-black tracking-tight transition-colors flex items-center gap-1.5 ${
                currentTheme === 'light'
                  ? 'text-slate-950 group-hover:text-emerald-700'
                  : 'text-white group-hover:text-emerald-300'
              }`}>
                DiaVet <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                  isOwner
                    ? (currentTheme === 'light' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-blue-500/20 text-blue-300 border-blue-500/30')
                    : (currentTheme === 'light' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30')
                }`}>{isOwner ? 'DEV PRO 🇩🇿' : 'DZ 🇩🇿'}</span>
              </span>
              <span className={`text-[10px] sm:text-xs hidden xs:inline -mt-0.5 font-medium ${
                currentTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {t.brandSubtitle}
              </span>
            </div>
          </button>

          {/* Center Navigation Links - Desktop */}
          <nav className={`hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-bold ${
            currentTheme === 'light' ? 'text-slate-700' : 'text-slate-300'
          }`}>
            <button
              id="nav-home-btn"
              onClick={() => {
                soundEngine.playCyberClick();
                onNavigate('home');
              }}
              className={`transition-colors py-1 cursor-pointer px-2.5 rounded-lg ${
                activeScreen === 'home' 
                  ? (currentTheme === 'light' ? 'text-cyan-700 font-black border-b-2 border-cyan-600 bg-cyan-50' : 'text-cyan-300 font-black border-b-2 border-cyan-400 bg-cyan-950/40')
                  : (currentTheme === 'light' ? 'hover:text-cyan-700 hover:bg-slate-100' : 'hover:text-cyan-300 hover:bg-slate-900')
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
              className={`transition-all py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1.5 border ${
                activeScreen === 'owner-portal'
                  ? (currentTheme === 'light'
                      ? 'bg-rose-100 text-rose-800 border-rose-400 font-black shadow-sm'
                      : 'bg-rose-500/20 text-rose-300 border-rose-400/60 font-black shadow-md shadow-rose-500/20')
                  : (currentTheme === 'light'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20')
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${currentTheme === 'light' ? 'text-rose-600 fill-rose-600/30' : 'text-rose-400 fill-rose-400/30'}`} />
              <span>{t.navOwnerSpace}</span>
            </button>

            {/* SECTION VÉTÉRINAIRE */}
            <button
              id="nav-vet-space-btn"
              onClick={() => {
                soundEngine.playWarpSwitch();
                onNavigate('vet-portal');
              }}
              className={`transition-all py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1.5 border ${
                activeScreen === 'vet-portal'
                  ? (currentTheme === 'light'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-black shadow-sm'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 font-black shadow-md shadow-emerald-500/20')
                  : (currentTheme === 'light'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20')
              }`}
            >
              <Stethoscope className={`w-3.5 h-3.5 ${currentTheme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span>{t.navVetSpace}</span>
              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                currentTheme === 'light' ? 'bg-emerald-600 text-white' : 'bg-emerald-400 text-slate-950'
              }`}>
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
              className={`transition-colors py-1 cursor-pointer px-2 flex items-center gap-1.5 rounded-lg ${
                activeScreen === 'profile'
                  ? (currentTheme === 'light' ? 'text-amber-800 font-black border-b-2 border-amber-600 bg-amber-50' : 'text-amber-300 font-black border-b-2 border-amber-400 bg-amber-950/40')
                  : (currentTheme === 'light' ? 'hover:text-amber-700 hover:bg-slate-100' : 'hover:text-amber-300 hover:bg-slate-900')
              }`}
            >
              <User className={`w-3.5 h-3.5 ${currentTheme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
              <span>{isAr ? "الملف الشخصي" : isEn ? "My Profile" : "Mon Profil"}</span>
              {typeof unlockedBadgesCount === 'number' && unlockedBadgesCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black border ${
                  currentTheme === 'light'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-amber-500/30 text-amber-300 border-amber-500/40'
                }`}>
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
              className={`transition-colors py-1 cursor-pointer px-2 rounded-lg ${
                activeScreen === 'dz-directory'
                  ? (currentTheme === 'light' ? 'text-cyan-700 font-black border-b-2 border-cyan-600 bg-cyan-50' : 'text-cyan-300 font-black border-b-2 border-cyan-400 bg-cyan-950/40')
                  : (currentTheme === 'light' ? 'hover:text-cyan-700 hover:bg-slate-100' : 'hover:text-cyan-300 hover:bg-slate-900')
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

            {/* Logout Button (Prominent & Clear on all screens) */}
            {isRegistered && onLogout && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playCyberClick();
                  onLogout();
                }}
                title={isAr ? "تسجيل الخروج الرسمي من DiaVet" : isEn ? "Log out from DiaVet" : "Se déconnecter de DiaVet"}
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black shadow-sm transition-all hover:scale-105 shrink-0 cursor-pointer active:scale-95 ${
                  currentTheme === 'light'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-700 shadow-rose-600/25 ring-2 ring-rose-300/40'
                    : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border-2 border-rose-500/50 shadow-rose-950/40'
                }`}
              >
                <LogOut className={`w-3.5 h-3.5 ${currentTheme === 'light' ? 'text-white' : 'text-rose-300'}`} />
                <span>{isAr ? "خروج" : isEn ? "Logout" : "Déconnexion"}</span>
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
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 transition-all hover:scale-105 shrink-0 cursor-pointer whitespace-nowrap"
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
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>contact@diavet.com</span>
              </button>
            )}

            {/* Official Admin Cloud Database / Inscriptions Directes — STRICTLY FOR OWNER */}
            {isOwner && onOpenAdminDb && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenAdminDb();
                }}
                title="Base de Données Cloud & Inscriptions en Direct (Firebase)"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">Inscriptions Cloud</span>
                {typeof cloudLeadsCount === 'number' && (
                  <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black">
                    {cloudLeadsCount}
                  </span>
                )}
              </button>
            )}

            {/* Official Admin Excel Leads & Drive Cloud Sync — STRICTLY FOR OWNER (mine.mine0100@gmail.com) */}
            {isOwner && onOpenExcel && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenExcel();
                }}
                title="Tableau de bord Admin - Registre Excel (.xls)"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Excel Admin</span>
              </button>
            )}


            {isOwner && onOpenDriveSync && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenDriveSync();
                }}
                title="Dossier Google Drive Dédié : DiaVet donner et informations"
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-2 border-blue-400/50 transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden lg:inline">Drive DiaVet</span>
              </button>
            )}

            {/* Push Notification Hub Button (Firebase Cloud Messaging) */}
            {onOpenPushCenter && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenPushCenter();
                }}
                title="Notifications Push FCM & Rappels de Santé"
                className={`relative p-2 sm:px-2.5 sm:py-1.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 shrink-0 ${
                  currentTheme === 'light'
                    ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40 shadow-cyan-500/10'
                }`}
              >
                <Bell className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="hidden xl:inline text-xs font-bold">Push FCM</span>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-950"></span>
                </span>
              </button>
            )}

            {/* Language Selector (Always Visible on ALL Devices) */}
            <div className={`flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl shadow-md shrink-0 border-2 ${
              currentTheme === 'light'
                ? 'bg-slate-100 border-slate-300'
                : 'bg-slate-900/95 border-cyan-500/40'
            }`}>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playCyberClick();
                  onSelectLang('fr');
                }}
                className={`px-1.5 sm:px-2 py-0.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-0.5 sm:gap-1 cursor-pointer ${
                  currentLang === 'fr' 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-sm scale-105' 
                    : (currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
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
                    : (currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
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
                    : (currentTheme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                }`}
                title="English"
              >
                <span>🇬🇧</span>
                <span className="hidden xs:inline">EN</span>
              </button>
            </div>

            {/* Theme Switcher Toggle Button (High-Contrast, Visible with Label) */}
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
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 shrink-0 ${
                currentTheme === 'dark'
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 hover:bg-amber-400/30 hover:border-amber-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700 shadow-slate-900/40 ring-2 ring-slate-400/30'
              }`}
              aria-label="Toggle theme mode"
            >
              {currentTheme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
                  <span className="text-[11px] font-black tracking-wide text-amber-300 whitespace-nowrap">
                    {isAr ? "فاتح" : isEn ? "Light" : "Mode Clair"}
                  </span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="text-[11px] font-black tracking-wide text-white whitespace-nowrap">
                    {isAr ? "داكن" : isEn ? "Dark" : "Mode Sombre"}
                  </span>
                </>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                soundEngine.playCyberClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className={`lg:hidden p-2 rounded-xl border-2 transition-colors cursor-pointer ${
                currentTheme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-white/10'
              }`}
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
        className={`border-t py-1.5 px-3 sm:px-6 overflow-x-auto whitespace-nowrap flex items-center gap-2 text-xs scrollbar-none shadow-inner ${
          currentTheme === 'light'
            ? 'bg-slate-100/95 border-slate-200 text-slate-800'
            : 'bg-slate-950/90 border-white/10 text-slate-200'
        }`}
      >
        {/* Accueil */}
        <button
          onClick={() => {
            soundEngine.playCyberClick();
            onNavigate('home');
          }}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            activeScreen === 'home'
              ? (currentTheme === 'light' ? 'bg-cyan-600 text-white border-cyan-700 shadow-sm' : 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-sm')
              : (currentTheme === 'light' ? 'bg-white text-slate-700 hover:text-slate-950 border-slate-300 hover:bg-slate-50' : 'bg-slate-900/80 text-slate-300 hover:text-white border-white/10')
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
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            activeScreen === 'owner-portal'
              ? (currentTheme === 'light' ? 'bg-rose-600 text-white border-rose-700 shadow-sm' : 'bg-rose-500/25 text-rose-300 border-rose-400/50 shadow-sm')
              : (currentTheme === 'light' ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100' : 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20')
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${activeScreen === 'owner-portal' && currentTheme === 'light' ? 'text-white fill-white' : 'text-rose-500 fill-rose-500/30'}`} />
          <span>{t.navOwnerSpace}</span>
        </button>

        {/* Espace Vétérinaire */}
        <button
          onClick={() => {
            soundEngine.playWarpSwitch();
            onNavigate('vet-portal');
          }}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            activeScreen === 'vet-portal'
              ? (currentTheme === 'light' ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-sm')
              : (currentTheme === 'light' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20')
          }`}
        >
          <Stethoscope className={`w-3.5 h-3.5 ${activeScreen === 'vet-portal' && currentTheme === 'light' ? 'text-white' : 'text-emerald-500'}`} />
          <span>{t.navVetSpace}</span>
          <span className={`text-[9px] font-black uppercase px-1 rounded ${
            activeScreen === 'vet-portal' && currentTheme === 'light' ? 'bg-white text-emerald-800' : 'bg-emerald-500 text-white'
          }`}>PRO</span>
        </button>

        {/* Mon Profil 👤 */}
        <button
          onClick={() => {
            soundEngine.playCyberClick();
            if (onOpenProfile) {
              onOpenProfile();
            } else {
              onNavigate('profile');
            }
          }}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            activeScreen === 'profile'
              ? (currentTheme === 'light' ? 'bg-cyan-600 text-white border-cyan-700 shadow-sm' : 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-sm')
              : (currentTheme === 'light' ? 'bg-white text-slate-700 hover:text-slate-950 border-slate-300 hover:bg-slate-50' : 'bg-slate-900/80 text-slate-300 hover:text-white border-white/10')
          }`}
        >
          <User className="w-3.5 h-3.5 text-cyan-500" />
          <span>{isAr ? "الملف الشخصي" : isEn ? "My Profile" : "Mon Profil"}</span>
        </button>

        {/* Formulaire Health */}
        {!hasCompletedQuestionnaire && (
          <button
            onClick={() => {
              soundEngine.playCyberClick();
              onNavigate(getQuestionnaireScreen());
            }}
            className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 border animate-pulse cursor-pointer ${
              currentTheme === 'light'
                ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-sm'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/50'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.navQuestionnaire}</span>
          </button>
        )}

        {/* Adoption Solidaire */}
        <button
          onClick={() => handleProtectedNav('adoption', isAr ? 'تبني الحيوانات' : isEn ? 'Solidarity Adoption' : 'Adoption Solidaire')}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            activeScreen === 'adoption'
              ? (currentTheme === 'light' ? 'bg-rose-600 text-white border-rose-700 shadow-sm' : 'bg-rose-500/25 text-rose-300 border-rose-400/50 shadow-sm')
              : (currentTheme === 'light' ? 'bg-white text-slate-700 hover:text-slate-950 border-slate-300 hover:bg-slate-50' : 'bg-slate-900/80 text-slate-300 hover:text-white border-white/10')
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>{t.navAdoption}</span>
          {!hasCompletedQuestionnaire && <Lock className="w-3 h-3 text-amber-500" />}
        </button>

        {/* Animalerie & Marketplace */}
        <button
          onClick={() => handleProtectedNav('marketplace', isAr ? 'متجر الحيوانات' : isEn ? 'Pet Store' : 'Marketplace')}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            activeScreen === 'marketplace'
              ? (currentTheme === 'light' ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-sm')
              : (currentTheme === 'light' ? 'bg-white text-slate-700 hover:text-slate-950 border-slate-300 hover:bg-slate-50' : 'bg-slate-900/80 text-slate-300 hover:text-white border-white/10')
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.navMarketplace}</span>
          {!hasCompletedQuestionnaire && <Lock className="w-3 h-3 text-amber-500" />}
        </button>

        {/* Boîte à Idées */}
        <button
          onClick={() => handleProtectedNav('ideas', isAr ? 'صندوق الأفكار' : isEn ? 'Idea Box' : 'Boîte à Idées')}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            activeScreen === 'ideas'
              ? (currentTheme === 'light' ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-black' : 'bg-amber-500/25 text-amber-300 border-amber-400/50 shadow-sm')
              : (currentTheme === 'light' ? 'bg-white text-slate-700 hover:text-slate-950 border-slate-300 hover:bg-slate-50' : 'bg-slate-900/80 text-slate-300 hover:text-white border-white/10')
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.navIdeas}</span>
          {!hasCompletedQuestionnaire && <Lock className="w-3 h-3 text-amber-500" />}
        </button>

        {/* Urgences 58 Wilayas */}
        <button
          onClick={() => {
            soundEngine.playCyberClick();
            onNavigate('dz-directory');
          }}
          className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer border ${
            activeScreen === 'dz-directory'
              ? (currentTheme === 'light' ? 'bg-cyan-600 text-white border-cyan-700 shadow-sm' : 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-sm')
              : (currentTheme === 'light' ? 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20')
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
            className={`lg:hidden border-b px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl ${
              currentTheme === 'light'
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-slate-950/95 border-white/10 text-white'
            }`}
          >
            {/* Theme & Language Selection Header */}
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 rounded-2xl border ${
              currentTheme === 'light'
                ? 'bg-slate-100 border-slate-300'
                : 'bg-slate-900 border-white/10'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${currentTheme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                  <Languages className="w-4 h-4 text-cyan-600" />
                  <span>{t.changeLang}</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCyberClick();
                    onToggleTheme();
                  }}
                  className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                    currentTheme === 'dark'
                      ? 'bg-slate-800 text-amber-300 border-amber-500/40 hover:bg-slate-700'
                      : 'bg-slate-900 text-white border-slate-700 shadow-sm'
                  }`}
                >
                  {currentTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-amber-300" />}
                  <span className="text-[11px] font-black">{currentTheme === 'dark' ? (isAr ? 'فاتح' : isEn ? 'Light' : 'Mode Clair') : (isAr ? 'داكن' : isEn ? 'Dark' : 'Mode Sombre')}</span>
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
                        ? 'bg-cyan-600 text-white shadow-sm scale-105' 
                        : (currentTheme === 'light' ? 'text-slate-700 hover:text-slate-950 bg-white border border-slate-300' : 'text-slate-400 hover:text-white bg-slate-800')
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
              <div className={`p-3.5 rounded-2xl border space-y-2 ${
                currentTheme === 'light'
                  ? 'bg-cyan-50 border-cyan-200'
                  : 'bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border-cyan-500/40'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black flex items-center gap-1.5 ${currentTheme === 'light' ? 'text-cyan-900' : 'text-cyan-300'}`}>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    {t.memberSpace}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                    currentTheme === 'light' ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30'
                  }`}>
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
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{isAr ? "تسجيل الدخول / فتح حساب جديد" : isEn ? "Log In / Register" : "Connexion / Créer un compte"}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                currentTheme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-cyan-500/30'
              }`}>
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
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight flex items-center gap-1 ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      <span>{userName}</span>
                      <Sparkles className="w-3 h-3 text-cyan-500" />
                    </p>
                    <p className={`text-[10px] font-medium ${currentTheme === 'light' ? 'text-cyan-800' : 'text-cyan-300'}`}>
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
                    className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm ${
                      currentTheme === 'light'
                        ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                        : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border-rose-500/40'
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.logout}</span>
                  </button>
                )}
              </div>
            )}

            <nav className={`flex flex-col space-y-2 text-sm font-semibold ${currentTheme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
              <button
                onClick={() => { 
                  soundEngine.playCyberClick();
                  onNavigate('home'); 
                  setMobileMenuOpen(false); 
                }}
                className={`text-left py-2.5 px-3 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
                  currentTheme === 'light' ? 'hover:bg-slate-100 text-slate-900' : 'hover:bg-white/5 text-slate-100'
                }`}
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
                className={`text-left py-2.5 px-3 rounded-xl border font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                  currentTheme === 'light' ? 'bg-rose-50 text-rose-900 border-rose-200' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/30" />
                <span>🐾 {t.navOwnerSpace}</span>
              </button>

              <button
                onClick={() => { 
                  soundEngine.playWarpSwitch();
                  onNavigate('vet-portal'); 
                  setMobileMenuOpen(false); 
                }}
                className={`text-left py-2.5 px-3 rounded-xl border font-bold transition-colors flex items-center justify-between cursor-pointer ${
                  currentTheme === 'light' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <span>🩺 {t.navVetSpace}</span>
                </div>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                  currentTheme === 'light' ? 'bg-emerald-600 text-white' : 'bg-emerald-400 text-slate-950'
                }`}>
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
                className={`text-left py-2.5 px-3 rounded-xl border font-bold transition-colors flex items-center justify-between cursor-pointer ${
                  currentTheme === 'light' ? 'bg-cyan-50 text-cyan-900 border-cyan-200' : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-600" />
                  <span>👤 {isAr ? "الملف الشخصي" : isEn ? "My Profile" : "Mon Profil"}</span>
                </div>
                <Award className="w-4 h-4 text-amber-500" />
              </button>

              <button
                onClick={() => { 
                  soundEngine.playCyberClick();
                  onNavigate('dz-directory'); 
                  setMobileMenuOpen(false); 
                }}
                className={`text-left py-2.5 px-3 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
                  currentTheme === 'light' ? 'hover:bg-slate-100 text-slate-900' : 'hover:bg-white/5 text-slate-100'
                }`}
              >
                <span>🇩🇿</span>
                <span>{isAr ? "دليل 58 ولاية" : isEn ? "58 Wilayas Directory" : "Urgences 58 Wilayas"}</span>
              </button>

              {onOpenPushCenter && (
                <button
                  onClick={() => { 
                    soundEngine.playCyberClick();
                    setMobileMenuOpen(false); 
                    onOpenPushCenter(); 
                  }}
                  className={`text-left py-2.5 px-3 rounded-xl border font-bold transition-colors flex items-center justify-between cursor-pointer ${
                    currentTheme === 'light' ? 'bg-cyan-50 text-cyan-900 border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>🔔 {isAr ? "مركز الإشعارات الفورية (FCM)" : isEn ? "Push Notifications Hub" : "Alertes & Rappels Push (FCM)"}</span>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                </button>
              )}

              {onOpenContact && (
                <button
                  onClick={() => { 
                    soundEngine.playCyberClick();
                    setMobileMenuOpen(false); 
                    onOpenContact(); 
                  }}
                  className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-between cursor-pointer text-xs ${
                    currentTheme === 'light' ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-cyan-600/20 text-cyan-300 border-cyan-500/30'
                  }`}
                >
                  <span>Contact : {DIAVET_OFFICIAL_EMAIL}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
