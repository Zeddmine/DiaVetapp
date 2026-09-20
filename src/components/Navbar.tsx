import { useState } from 'react';
import { 
  AppScreen, Language, Theme 
} from '../types';
import { translations } from '../data/translations';
import { 
  Menu, X, Sun, Moon, Smartphone, Monitor, Instagram, 
  Award, Heart, ShoppingBag, Lightbulb, 
  FileEdit, Lock, Stethoscope, Cloud
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import DiaVetLogo from './DiaVetLogo';
import AudioCyberHud from './AudioCyberHud';
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
  onLockedFeatureClick?: (featureName: string) => void;
  onResetRegistration?: () => void;
  onOpenContact?: () => void;
  onOpenDriveSync?: () => void;
}

export default function Navbar({
  currentLang,
  currentTheme,
  onSelectLang,
  onToggleTheme,
  isIphoneView,
  onToggleIphoneView,
  onNavigate,
  activeScreen,
  unlockedBadgesCount,
  hasCompletedQuestionnaire = false,
  userRole = 'owner',
  isOwner = false,
  onLockedFeatureClick,
  onResetRegistration,
  onOpenContact,
  onOpenDriveSync
}: NavbarProps) {
  const t = translations[currentLang] || translations.fr;
  const isRtl = currentLang === 'ar';
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
            <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform">
              <DiaVetLogo size="md" />
            </div>
            <div className={`flex flex-col ${isRtl ? 'text-right' : 'text-left'}`}>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white dark:text-white light:text-slate-900 leading-none">
                Dia<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Vet</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-400 light:text-slate-500 hidden sm:block">
                {t.brandSubtitle}
              </span>
            </div>
          </button>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-3.5 text-xs lg:text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-600">
            <button
              id="nav-home-btn"
              onClick={() => {
                soundEngine.playCyberClick();
                onNavigate('home');
              }}
              className={`hover:text-cyan-400 transition-colors py-1 cursor-pointer ${
                activeScreen === 'home' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400' : ''
              }`}
            >
              {t.navHome}
            </button>

            {/* SECTION PROPRIÉTAIRE */}
            <button
              id="nav-owner-section-btn"
              onClick={() => {
                soundEngine.playCyberClick();
                onNavigate('owner-portal');
              }}
              className={`hover:text-rose-300 transition-all py-1 px-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 border ${
                activeScreen === 'owner-portal'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/60 font-black shadow-md shadow-rose-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
              <span>{t.navOwnerSpace}</span>
            </button>

            {/* SECTION VÉTÉRINAIRE */}
            <button
              id="nav-vet-section-btn"
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

            {/* Quick access to questionnaire */}
            {!hasCompletedQuestionnaire && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onNavigate(getQuestionnaireScreen());
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-bold animate-pulse hover:bg-cyan-500/25 cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>{t.navQuestionnaire}</span>
              </button>
            )}

            {/* Adoption DZ */}
            <button
              id="nav-adoption-btn"
              onClick={() => handleProtectedNav('adoption', isRtl ? 'تبني الحيوانات' : 'Adoption Solidaire')}
              className={`hover:text-rose-400 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeScreen === 'adoption' ? 'text-rose-400 font-bold border-b-2 border-rose-400' : ''
              } ${!hasCompletedQuestionnaire ? 'opacity-60 hover:opacity-100' : ''}`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>{t.navAdoption}</span>
              {!hasCompletedQuestionnaire && <Lock className="w-3 h-3 text-amber-400/80" />}
            </button>

            {/* Marketplace */}
            <button
              id="nav-marketplace-btn"
              onClick={() => handleProtectedNav('marketplace', isRtl ? 'متجر الحيوانات' : 'Marketplace & Animalerie')}
              className={`hover:text-emerald-400 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeScreen === 'marketplace' ? 'text-emerald-400 font-bold border-b-2 border-emerald-400' : ''
              } ${!hasCompletedQuestionnaire ? 'opacity-60 hover:opacity-100' : ''}`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.navMarketplace}</span>
              {!hasCompletedQuestionnaire && <Lock className="w-3 h-3 text-amber-400/80" />}
            </button>

            {/* Ideas & Community */}
            <button
              id="nav-ideas-btn"
              onClick={() => handleProtectedNav('ideas', isRtl ? 'صندوق الأفكار' : 'Boîte à Idées')}
              className={`hover:text-amber-400 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeScreen === 'ideas' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : ''
              } ${!hasCompletedQuestionnaire ? 'opacity-60 hover:opacity-100' : ''}`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.navIdeas}</span>
              {!hasCompletedQuestionnaire && <Lock className="w-3 h-3 text-amber-400/80" />}
            </button>

            {/* Profile & Forge */}
            <button
              id="nav-profile-btn"
              onClick={() => {
                soundEngine.playCyberClick();
                onNavigate('profile');
              }}
              className={`hover:text-amber-300 transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeScreen === 'profile' ? 'text-amber-300 font-bold border-b-2 border-amber-400' : ''
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.navProfile}</span>
              {typeof unlockedBadgesCount === 'number' && unlockedBadgesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-black border border-amber-500/40">
                  {unlockedBadgesCount}
                </span>
              )}
            </button>

            {/* Directory / Emergencies */}
            <button
              id="nav-emergencies-btn"
              onClick={() => handleProtectedNav('dz-directory', isRtl ? 'طوارئ الجزائر' : 'Annuaire Vétérinaire 58 Wilayas')}
              className={`hover:text-cyan-400 transition-colors py-1 cursor-pointer ${
                activeScreen === 'dz-directory' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400' : ''
              }`}
            >
              {t.navEmergencies}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* FUTURISTIC CYBER AUDIO HUD */}
            <AudioCyberHud currentLang={currentLang} />

            {/* Official Contact Button */}
            {onOpenContact && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenContact();
                }}
                title="Contact officiel : contact@diavet.com"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 transition-all hover:scale-105 shrink-0 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>contact@diavet.com</span>
              </button>
            )}

            {/* Google Drive Direct Sync Button — Reserved strictly for Owner */}
            {onOpenDriveSync && isOwner && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  onOpenDriveSync();
                }}
                title="Transférer index.html sur Google Drive (Réservé Propriétaire)"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-300 border border-emerald-400/40 transition-all hover:scale-105 shrink-0 cursor-pointer shadow-sm shadow-emerald-500/10"
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Google Drive</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-400/30 text-emerald-200">1-Clic</span>
              </button>
            )}

            {/* Direct Instagram Link */}
            <a
              href="https://instagram.com/dia__vet"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram : @dia__vet"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 transition-all hover:scale-105 shrink-0"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@dia__vet</span>
            </a>

            {/* Language Selector FR / EN / AR */}
            <div className="flex bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-white/10 text-xs font-bold">
              {(['fr', 'en', 'ar'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  id={`lang-btn-${lang}`}
                  onClick={() => {
                    soundEngine.playCyberClick();
                    onSelectLang(lang);
                  }}
                  className={`px-2 py-1 rounded-lg transition-all uppercase cursor-pointer ${
                    currentLang === lang
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'ar' ? 'العربية' : lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => {
                soundEngine.playCyberClick();
                onToggleTheme();
              }}
              aria-label="Changer le thème"
              className="p-2 sm:p-2.5 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 transition-colors text-slate-300 cursor-pointer"
            >
              {currentTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* iPhone Frame Simulator Toggle */}
            <button
              id="device-frame-toggle-btn"
              onClick={() => {
                soundEngine.playCyberClick();
                onToggleIphoneView();
              }}
              title={isIphoneView ? t.switchFull : t.switchDevice}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              {isIphoneView ? (
                <>
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{t.switchFull}</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{t.switchDevice}</span>
                </>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => {
                soundEngine.playCyberClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="p-2 rounded-xl border border-white/10 text-slate-300 xl:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl px-4 py-6 space-y-3 animate-in slide-in-from-top duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-200">
            <button
              onClick={() => { 
                soundEngine.playCyberClick();
                onNavigate('home'); 
                setMobileMenuOpen(false); 
              }}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              {t.navHome}
            </button>

            {/* MOBILE: SECTION PROPRIÉTAIRE */}
            <button
              onClick={() => {
                soundEngine.playCyberClick();
                onNavigate('owner-portal');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 px-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
                <span>🐾 {t.navOwnerSpace}</span>
              </div>
            </button>

            {/* PROMINENT VET SECTION IN MOBILE MENU */}
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

            {!hasCompletedQuestionnaire && (
              <button
                onClick={() => { 
                  soundEngine.playCyberClick();
                  onNavigate(getQuestionnaireScreen()); 
                  setMobileMenuOpen(false); 
                }}
                className="text-left py-2.5 px-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-bold transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>{isRtl ? "متابعة استبيان DiaVet" : "Continuer le Formulaire DiaVet"}</span>
                <FileEdit className="w-4 h-4 text-cyan-400" />
              </button>
            )}

            <button
              onClick={() => handleProtectedNav('adoption', isRtl ? 'تبني الحيوانات' : 'Adoption Solidaire')}
              className={`text-left py-2.5 px-3 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-colors flex items-center justify-between cursor-pointer ${
                !hasCompletedQuestionnaire ? 'opacity-60' : ''
              }`}
            >
              <span>🐾 {t.navAdoption}</span>
              {!hasCompletedQuestionnaire ? <Lock className="w-4 h-4 text-amber-400" /> : <Heart className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={() => handleProtectedNav('marketplace', isRtl ? 'متجر الحيوانات' : 'Marketplace & Animalerie')}
              className={`text-left py-2.5 px-3 rounded-xl hover:bg-emerald-500/10 text-emerald-400 transition-colors flex items-center justify-between cursor-pointer ${
                !hasCompletedQuestionnaire ? 'opacity-60' : ''
              }`}
            >
              <span>🛍️ {t.navMarketplace}</span>
              {!hasCompletedQuestionnaire ? <Lock className="w-4 h-4 text-amber-400" /> : <ShoppingBag className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handleProtectedNav('ideas', isRtl ? 'صندوق الأفكار' : 'Boîte à Idées')}
              className={`text-left py-2.5 px-3 rounded-xl hover:bg-amber-500/10 text-amber-400 transition-colors flex items-center justify-between cursor-pointer ${
                !hasCompletedQuestionnaire ? 'opacity-60' : ''
              }`}
            >
              <span>💡 {t.navIdeas}</span>
              {!hasCompletedQuestionnaire ? <Lock className="w-4 h-4 text-amber-400" /> : <Lightbulb className="w-4 h-4" />}
            </button>

            <button
              onClick={() => { 
                soundEngine.playCyberClick();
                onNavigate('profile'); 
                setMobileMenuOpen(false); 
              }}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between cursor-pointer text-amber-300"
            >
              <span>🏆 {t.navProfile}</span>
              <Award className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={() => handleProtectedNav('dz-directory', isRtl ? 'طوارئ الجزائر' : 'Annuaire Vétérinaire')}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              {t.navEmergencies}
            </button>
            
            {onOpenContact && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  setMobileMenuOpen(false);
                  onOpenContact();
                }}
                className="py-2.5 px-3 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center justify-between cursor-pointer"
              >
                <span>Contact : {DIAVET_OFFICIAL_EMAIL}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </button>
            )}

            <a
              href="https://instagram.com/dia__vet"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-pink-600/20 text-pink-300 border border-pink-500/30 font-bold flex items-center justify-between"
            >
              <span>Instagram : @dia__vet</span>
              <Instagram className="w-4 h-4" />
            </a>

            {onResetRegistration && (
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  setMobileMenuOpen(false);
                  onResetRegistration();
                }}
                className="text-left py-2 px-3 rounded-xl border border-dashed border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{isRtl ? "🔄 إعادة التسجيل / تغيير الحساب" : "🔄 Nouvelle Inscription / Changer de profil"}</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
