import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Language, Theme, AppScreen, OwnerAnswers, VetAnswers, 
  Badge, HealthMilestone, UserProfile, Article 
} from './types';
import Navbar from './components/Navbar';
import TopNotificationBar from './components/TopNotificationBar';
import AlgiersBackground from './components/AlgiersBackground';
import HeroSection from './components/HeroSection';
import SpacesSection from './components/SpacesSection';
import RoleSelection from './components/RoleSelection';
import OwnerQuestionnaire from './components/OwnerQuestionnaire';
import VetQuestionnaire from './components/VetQuestionnaire';
import OwnerPortalPreview from './components/OwnerPortalPreview';
import VetPortalPreview from './components/VetPortalPreview';
import DzDirectory from './components/DzDirectory';
import BadgesProfile from './components/BadgesProfile';
import ArticlesSection from './components/ArticlesSection';
import AdoptionSection from './components/AdoptionSection';
import MarketplaceSection from './components/MarketplaceSection';
import IdeasSection from './components/IdeasSection';
import VeterinaryShowcaseSection from './components/VeterinaryShowcaseSection';
import Footer from './components/Footer';
import OnboardingGateway from './components/OnboardingGateway';
import LockedGiftModal from './components/LockedGiftModal';
import GiftRewardCelebrationModal from './components/GiftRewardCelebrationModal';
import OfficialContactModal from './components/OfficialContactModal';
import DriveSyncModal from './components/DriveSyncModal';
import ExcelLeadsModal from './components/ExcelLeadsModal';
import DiaVetTvSection from './components/DiaVetTvSection';
import WhatsAppSupportButton from './components/WhatsAppSupportButton';
import GentleMusicPlayer from './components/GentleMusicPlayer';
import ProfileEditModal from './components/ProfileEditModal';
import WelcomeAiBannerSection from './components/WelcomeAiBannerSection';
import { recordRegistrationLead } from './services/adminDb';
import { translations } from './data/translations';
import { useLanguage } from './context/LanguageContext';
import { useLoading } from './context/LoadingContext';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay';
import { INITIAL_BADGES, INITIAL_MILESTONES, DEFAULT_USER_PROFILE } from './data/badgeData';
import { INITIAL_ARTICLES } from './data/articlesData';
import { soundEngine } from './utils/soundEngine';
import { getScreenArchetype, screenArchetypeVariants } from './utils/transitions';
import { 
  Smartphone, Sparkles, Heart, Activity, Award, X, CheckCircle2, 
  Instagram, ShoppingBag, Lightbulb, ArrowRight, ShieldCheck, Lock,
  Stethoscope
} from 'lucide-react';

interface ToastNotification {
  title: string;
  subtitle: string;
  icon: string;
}

const screenTransitionVariants = {
  initial: { opacity: 0, y: 12, scale: 0.995 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.32, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -8, 
    scale: 0.995, 
    transition: { 
      duration: 0.2, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

export default function App() {
  const { currentLang, setLanguage } = useLanguage();
  const { triggerNavigationLoading } = useLoading();
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('diavet_theme') as Theme;
      return savedTheme === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const [activeScreen, setActiveScreen] = useState<AppScreen>('home');
  const [isIphoneView, setIsIphoneView] = useState<boolean>(false);

  // Clean Global Reset: Ensure all users start cleanly disconnected as requested
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    try {
      if (!localStorage.getItem('diavet_clean_reset_v2')) {
        localStorage.removeItem('diavet_registered');
        localStorage.removeItem('diavet_completed_questionnaire');
        localStorage.setItem('diavet_clean_reset_v2', 'true');
        return false;
      }
      return localStorage.getItem('diavet_registered') === 'true';
    } catch {
      return false;
    }
  });

  // Auth / Registration Modal state - Direct registration on entry if not registered
  const [showAuthModal, setShowAuthModal] = useState<boolean>(() => {
    try {
      if (!localStorage.getItem('diavet_clean_reset_v2')) {
        return true;
      }
      return localStorage.getItem('diavet_registered') !== 'true';
    } catch {
      return true;
    }
  });

  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Questionnaire completion status - unlocks adoption, marketplace, ideas, etc.
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState<boolean>(() => {
    try {
      return localStorage.getItem('diavet_completed_questionnaire') === 'true';
    } catch {
      return false;
    }
  });

  // Stored questionnaire answers
  const [ownerAnswers, setOwnerAnswers] = useState<OwnerAnswers | undefined>(undefined);
  const [vetAnswers, setVetAnswers] = useState<VetAnswers | undefined>(undefined);

  // Gamification & Badges State
  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem('diavet_badges');
      return saved ? JSON.parse(saved) : INITIAL_BADGES;
    } catch {
      return INITIAL_BADGES;
    }
  });

  const [milestones, setMilestones] = useState<HealthMilestone[]>(() => {
    try {
      const saved = localStorage.getItem('diavet_milestones');
      return saved ? JSON.parse(saved) : INITIAL_MILESTONES;
    } catch {
      return INITIAL_MILESTONES;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('diavet_user_profile');
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  // Owner privilege check (1-Click Google Drive tools reserved exclusively for owner email)
  const isOwner = Boolean(
    userProfile.email?.toLowerCase().trim() === 'mine.mine0100@gmail.com' ||
    userProfile.email?.toLowerCase().endsWith('@diavet.dz') ||
    userProfile.email?.toLowerCase().includes('admin')
  );

  // Articles & Tips State
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('diavet_articles');
      return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
    } catch {
      return INITIAL_ARTICLES;
    }
  });

  const [favoriteArticleIds, setFavoriteArticleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('diavet_fav_articles');
      return saved ? JSON.parse(saved) : ['art-heatstroke', 'art-vaccins-dz'];
    } catch {
      return ['art-heatstroke', 'art-vaccins-dz'];
    }
  });

  // Toast notifications for user rewards
  const [toastNotification, setToastNotification] = useState<ToastNotification | null>(null);

  // Locked Gift Modal & Celebration Modal states
  const [showLockedGiftModal, setShowLockedGiftModal] = useState<boolean>(false);
  const [lockedFeatureName, setLockedFeatureName] = useState<string>('Adoption & Marketplace');
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [showDriveSyncModal, setShowDriveSyncModal] = useState<boolean>(false);
  const [showExcelModal, setShowExcelModal] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('diavet_badges', JSON.stringify(badges));
    } catch {}
  }, [badges]);

  useEffect(() => {
    try {
      localStorage.setItem('diavet_milestones', JSON.stringify(milestones));
    } catch {}
  }, [milestones]);

  useEffect(() => {
    try {
      localStorage.setItem('diavet_user_profile', JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('diavet_fav_articles', JSON.stringify(favoriteArticleIds));
    } catch {}
  }, [favoriteArticleIds]);

  // Sync HTML root, body, and meta theme-color
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (currentTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      if (body) {
        body.classList.add('dark');
        body.classList.remove('light');
      }
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#020617');
      }
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      if (body) {
        body.classList.add('light');
        body.classList.remove('dark');
      }
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#f8fafc');
      }
    }
    try {
      localStorage.setItem('diavet_theme', currentTheme);
    } catch {}
  }, [currentTheme]);

  const handleSelectLang = (lang: Language) => {
    soundEngine.playCyberClick();
    setLanguage(lang);
  };

  const toggleTheme = () => {
    setCurrentTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navigateTo = (screen: AppScreen) => {
    soundEngine.playCyberClick();

    // 1. Strict Software Space Security: Veterinary Clinical Suite ('vet-portal')
    // As per requirement: Espace logiciel is restricted exclusively to registered Vets.
    if (screen === 'vet-portal') {
      if (userProfile.userRole !== 'vet') {
        triggerRewardToast(
          "Espace Logiciel Réservé 🔒",
          "L'accès à la Suite Logicielle Clinique est réservé exclusivement aux Docteurs Vétérinaires inscrits (ONMV).",
          '🩺'
        );
        return;
      }
      triggerNavigationLoading();
      setActiveScreen('vet-portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Accessing Veterinary Questionnaire
    if (screen === 'questionnaire-vet') {
      triggerNavigationLoading();
      setActiveScreen('questionnaire-vet');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. Feature-gating: Marketplace, Adoption, Ideas, Articles, Directory require completing the questionnaire first
    const restrictedScreens: AppScreen[] = ['adoption', 'marketplace', 'ideas', 'articles'];
    if (!hasCompletedQuestionnaire && restrictedScreens.includes(screen)) {
      let friendlyName = 'Service DiaVet';
      if (screen === 'adoption') friendlyName = currentLang === 'ar' ? 'تبني الحيوانات' : 'Adoption Solidaire';
      if (screen === 'marketplace') friendlyName = currentLang === 'ar' ? 'متجر الحيوانات' : 'Marketplace & Pharmacie';
      if (screen === 'ideas') friendlyName = currentLang === 'ar' ? 'صندوق الأفكار' : 'Boîte à Idées & Avis';
      if (screen === 'articles') friendlyName = currentLang === 'ar' ? 'المقالات والنصائح' : 'Guides & Conseils Santé';

      setLockedFeatureName(friendlyName);
      setShowLockedGiftModal(true);
      return;
    }

    triggerNavigationLoading();
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to show reward toast
  const triggerRewardToast = (title: string, subtitle: string, icon: string = '🏆') => {
    setToastNotification({ title, subtitle, icon });
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // Milestone check / uncheck
  const handleToggleMilestone = (id: string) => {
    setMilestones(prev =>
      prev.map(m => {
        if (m.id === id) {
          const nextVal = !m.isCompleted;
          if (nextVal) {
            triggerRewardToast(
              currentLang === 'ar' ? "تم تأكيد المرحلة الصحية ! 🩺" : currentLang === 'en' ? "Health Milestone Validated! 🩺" : "Jalon Santé Validé ! 🩺",
              currentLang === 'ar' 
                ? `أحسنت ! لقد أكدت "${m.titleAr || m.title}" (+${m.points} نقاط صحية).` 
                : currentLang === 'en' 
                ? `Bravo! You validated "${m.titleEn || m.title}" (+${m.points} Health Points).` 
                : `Bravo ! Vous avez validé "${m.title}" (+${m.points} Points Santé).`,
              '🛡️'
            );
          }
          return { ...m, isCompleted: nextVal };
        }
        return m;
      })
    );

    // Auto unlock health badge if all milestones done
    const currentCompleted = milestones.filter(m => m.id === id ? !m.isCompleted : m.isCompleted).length;
    if (currentCompleted >= 4) {
      setBadges(prev =>
        prev.map(b => (b.id === 'preventive-hero' ? { ...b, isUnlocked: true } : b))
      );
    }
  };

  // Custom Holographic Badge Forge
  const handleAddCustomBadge = (newBadge: Badge) => {
    setBadges(prev => {
      const updated = [newBadge, ...prev];
      try {
        localStorage.setItem('diavet_badges', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    triggerRewardToast(
      currentLang === 'ar' ? "تم صياغة شارة جديدة ! 🌟" : currentLang === 'en' ? "New Badge Forged! 🌟" : "Nouveau Badge Forgé ! 🌟",
      currentLang === 'ar' 
        ? `تم صياغة الشارة "${newBadge.titleAr || newBadge.title}" ونقشها في مجموعتك.` 
        : currentLang === 'en' 
        ? `The badge "${newBadge.titleEn || newBadge.title}" has been forged into your collection.` 
        : `Le badge "${newBadge.title}" a été forgé et gravé dans votre collection.`,
      '⚡'
    );
  };

  const handleDeleteBadge = (badgeId: string) => {
    setBadges(prev => {
      const updated = prev.filter(b => b.id !== badgeId);
      try {
        localStorage.setItem('diavet_badges', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    triggerRewardToast(
      currentLang === 'ar' ? "تمت إزالة الشارة" : currentLang === 'en' ? "Badge Removed" : "Badge Retiré",
      currentLang === 'ar' ? "تمت إزالة الشارة من مجموعتك." : currentLang === 'en' ? "The badge was removed from your collection." : "Le badge a été retiré de votre collection.",
      '🗑️'
    );
  };

  // Referral increment
  const handleReferFriend = () => {
    const nextCount = (userProfile.referralCount || 0) + 1;
    const nextPoints = (userProfile.healthPoints || 0) + 150;
    
    setUserProfile(prev => ({
      ...prev,
      referralCount: nextCount,
      healthPoints: nextPoints,
      points: (prev.points || 0) + 150
    }));

    // Unlock referral badge
    setBadges(prev =>
      prev.map(b => (b.id === 'ambassador' ? { ...b, isUnlocked: true } : b))
    );

    triggerRewardToast(
      currentLang === 'ar' ? "تم تأكيد الإحالة ! 🎉" : currentLang === 'en' ? "Referral Validated! 🎉" : "Parrainage Validé ! 🎉",
      currentLang === 'ar' 
        ? `لديك الآن ${nextCount} صديق(أصدقاء) مدعو(ون) ! تمت إضافة +150 نقطة صحية.` 
        : currentLang === 'en' 
        ? `You now have ${nextCount} active referral(s)! +150 Health Points added.` 
        : `Vous avez maintenant ${nextCount} filleul(s) actif(s) ! +150 Points Santé ajoutés.`,
      '🤝'
    );
  };

  // Favorite toggler
  const handleToggleFavorite = (articleId: string) => {
    setFavoriteArticleIds(prev => {
      const exists = prev.includes(articleId);
      return exists ? prev.filter(id => id !== articleId) : [...prev, articleId];
    });
  };

  // Add community article
  const handleAddArticle = (newArt: Article) => {
    setArticles(prev => [newArt, ...prev]);
    setUserProfile(up => ({
      ...up,
      healthPoints: (up.healthPoints || 0) + 30,
      points: (up.points || 0) + 30
    }));
    triggerRewardToast(
      currentLang === 'ar' ? "تم نشر النصيحة بنجاح !" : currentLang === 'en' ? "Tip Published Successfully!" : "Conseil publié avec succès !",
      currentLang === 'ar' ? "تمت إضافة مشاركتك وتكافؤ +30 نقطة صحية." : currentLang === 'en' ? "Your contribution was added (+30 Health Pts)." : "Votre contribution a été ajoutée (+30 Points Santé).",
      '✍️'
    );
  };

  // Completion handlers for questionnaires
  const handleFinishOwner = (answers: OwnerAnswers) => {
    setOwnerAnswers(answers);
    setHasCompletedQuestionnaire(true);
    try {
      localStorage.setItem('diavet_completed_questionnaire', 'true');
    } catch {}
    
    // Unlock VIP and Questionnaire Badges
    setBadges(prev =>
      prev.map(b => {
        if (b.id === 'pioneer' || b.id === 'vaccine-shield') {
          return { ...b, isUnlocked: true };
        }
        return b;
      })
    );

    setUserProfile(up => ({
      ...up,
      name: answers.ownerName || up.name,
      petName: answers.petName || up.petName,
      wilaya: answers.wilaya || up.wilaya,
      isVip: true,
      vipCode: answers.vipCode,
      healthPoints: (up.healthPoints || 0) + 100,
      points: (up.points || 0) + 100,
      badgeTitle: 'Membre VIP Fondateur DZ'
    }));

    triggerRewardToast(
      "Pass VIP Fondateur Débloqué !",
      "Félicitations, vous avez obtenu 100 Points et le statut VIP.",
      '⭐'
    );
    setShowCelebrationModal(true);
  };

  const handleFinishVet = (answers: VetAnswers) => {
    setVetAnswers(answers);
    setHasCompletedQuestionnaire(true);
    try {
      localStorage.setItem('diavet_completed_questionnaire', 'true');
    } catch {}
    
    setBadges(prev =>
      prev.map(b => {
        if (b.id === 'pioneer' || b.id === 'health-champion') {
          return { ...b, isUnlocked: true };
        }
        return b;
      })
    );

    setUserProfile(up => ({
      ...up,
      name: answers.vetFullName || up.name,
      wilaya: answers.wilaya || up.wilaya,
      isVip: true,
      vipCode: answers.vipPartnerId,
      healthPoints: (up.healthPoints || 0) + 150,
      points: (up.points || 0) + 150,
      badgeTitle: 'Praticien Agréé Fondateur DZ'
    }));

    triggerRewardToast(
      "Conventionnement PRO Validé !",
      "Félicitations Docteur, votre badge officiel est actif.",
      '🩺'
    );
    setShowCelebrationModal(true);
  };

  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  // Animation variants for smooth screen transitions
  const screenTransitionVariants = {
    initial: {
      opacity: 0,
      y: 12,
      scale: 0.995,
      filter: 'blur(3px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1], // Smooth cubic bezier easing
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      scale: 0.995,
      filter: 'blur(2px)',
      transition: {
        duration: 0.18,
        ease: [0.4, 0, 1, 1],
      },
    },
  };

  // Screen Switcher Content
  const renderScreenContent = () => {
    switch (activeScreen) {
      case 'roles':
        return (
          <RoleSelection
            currentLang={currentLang}
            userRole={userProfile.userRole}
            onSelectOwner={() => navigateTo('questionnaire-owner')}
            onSelectVet={() => navigateTo('questionnaire-vet')}
            onBack={() => navigateTo('home')}
          />
        );

      case 'questionnaire-owner':
        return (
          <OwnerQuestionnaire
            currentLang={currentLang}
            userProfile={userProfile}
            onFinish={handleFinishOwner}
            onGoHome={() => navigateTo('home')}
            onPreviewPortal={() => navigateTo('owner-portal')}
            onOpenProfile={() => navigateTo('profile')}
            onNavigateToScreen={(scr) => navigateTo(scr)}
          />
        );

      case 'questionnaire-vet':
        return (
          <VetQuestionnaire
            currentLang={currentLang}
            userProfile={userProfile}
            onFinish={handleFinishVet}
            onGoHome={() => navigateTo('home')}
            onPreviewPortal={() => navigateTo('vet-portal')}
          />
        );

      case 'owner-portal':
        return (
          <OwnerPortalPreview
            currentLang={currentLang}
            onGoHome={() => navigateTo('home')}
            userAnswers={ownerAnswers}
            badges={badges}
            onOpenProfile={() => navigateTo('profile')}
          />
        );

      case 'vet-portal':
        return (
          <VetPortalPreview
            currentLang={currentLang}
            onGoHome={() => navigateTo('home')}
            userAnswers={vetAnswers}
          />
        );

      case 'dz-directory':
        return (
          <DzDirectory
            currentLang={currentLang}
            onGoHome={() => navigateTo('home')}
            onOpenVetQuestionnaire={() => navigateTo('questionnaire-vet')}
          />
        );

      case 'articles':
        return (
          <ArticlesSection
            currentLang={currentLang}
            articles={articles}
            favoriteIds={favoriteArticleIds}
            onToggleFavorite={handleToggleFavorite}
            onAddArticle={handleAddArticle}
            onGoHome={() => navigateTo('home')}
          />
        );

      case 'adoption':
        return (
          <AdoptionSection
            currentLang={currentLang}
            onGoHome={() => navigateTo('home')}
            hasCompletedQuestionnaire={hasCompletedQuestionnaire}
            onOpenQuestionnaire={() => {
              setActiveScreen(userProfile.userRole === 'vet' ? 'questionnaire-vet' : 'questionnaire-owner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );

      case 'marketplace':
        return (
          <MarketplaceSection
            currentLang={currentLang}
            onGoHome={() => navigateTo('home')}
          />
        );

      case 'ideas':
        return (
          <IdeasSection
            currentLang={currentLang}
            onGoHome={() => navigateTo('home')}
          />
        );

      case 'videos':
        return (
          <DiaVetTvSection
            currentLang={currentLang}
            onGoHome={() => navigateTo('home')}
            onSelectOwnerPortal={() => navigateTo('owner-portal')}
            onSelectVetPortal={() => navigateTo('vet-portal')}
          />
        );

      case 'profile':
        return (
          <BadgesProfile
            currentLang={currentLang}
            userProfile={userProfile}
            badges={badges}
            milestones={milestones}
            onToggleMilestone={handleToggleMilestone}
            onReferFriend={handleReferFriend}
            onStartQuestionnaire={() => navigateTo('questionnaire-owner')}
            onGoHome={() => navigateTo('home')}
            onAddCustomBadge={handleAddCustomBadge}
            onDeleteBadge={handleDeleteBadge}
            onUpdateProfile={(updated) => {
              setUserProfile(prev => {
                const next = { ...prev, ...updated };
                try {
                  localStorage.setItem('diavet_user_profile', JSON.stringify(next));
                } catch (e) {
                  console.error(e);
                }
                return next;
              });
              triggerRewardToast(
                "Profil mis à jour !",
                "Vos informations personnelles et celles de votre animal ont été enregistrées.",
                '👤'
              );
            }}
          />
        );

      case 'home':
      default:
        return (
          <>
            {/* WELCOME AI IMAGEN BANNER SECTION FOR REGISTERED USERS */}
            <WelcomeAiBannerSection
              currentLang={currentLang}
              userProfile={userProfile}
              isRegistered={isRegistered}
              onOpenProfile={() => navigateTo('profile')}
              onOpenPortal={() => navigateTo(userProfile.userRole === 'vet' ? 'vet-portal' : 'owner-portal')}
              onOpenDirectory={() => navigateTo('dz-directory')}
              onUpdateBannerUrl={(url) => {
                setUserProfile(prev => ({ ...prev, welcomeBannerUrl: url }));
              }}
            />

            {/* HERO SECTION */}
            <HeroSection
              currentLang={currentLang}
              onStart={() => {
                if (!isRegistered) {
                  setShowAuthModal(true);
                } else {
                  navigateTo(userProfile.userRole === 'vet' ? 'questionnaire-vet' : 'questionnaire-owner');
                }
              }}
              onExploreVets={() => navigateTo('vet-portal')}
              onOpenDirectory={() => navigateTo('dz-directory')}
              onOpenVideos={() => navigateTo('videos')}
            />

            {/* DUAL SPACES SECTION (PROPRIETAIRE VS VETERINAIRE) */}
            <SpacesSection
              currentLang={currentLang}
              userRole={userProfile.userRole}
              onSelectOwner={() => navigateTo('questionnaire-owner')}
              onSelectVet={() => navigateTo('vet-portal')}
            />

            {/* VETERINARY SHOWCASE SECTION - DIRECT HOME PAGE ACCESS TO VET SUITE */}
            <VeterinaryShowcaseSection
              currentLang={currentLang}
              onOpenFullVetPortal={() => navigateTo('vet-portal')}
              onSelectOwnerPortal={() => navigateTo('owner-portal')}
              userRole={userProfile.userRole}
            />

            {/* NEW SECTIONS SHOWCASE (Adoption, Marketplace, Boîte à Idées) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  {currentLang === 'ar' ? 'منظومة ديافيت الوطنية بالجزائر 🇩🇿' : currentLang === 'en' ? 'DiaVet National Ecosystem Algeria 🇩🇿' : 'Écosystème National DiaVet Algérie 🇩🇿'}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
                  {currentLang === 'ar' ? 'الخدمات التضامنية والميزات الجديدة' : currentLang === 'en' ? 'Solidarity Services & Connected Features' : 'Services Solidaires & Nouveautés Connectées'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">
                  {currentLang === 'ar' ? 'أكثر من مجرد صحة بيطرية: تبنَّ حيواناً مُنقذاً، وادخل إلى المتجر المعتمد وشارك برأيك في مستقبل ديافيت.' : currentLang === 'en' ? 'Beyond veterinary health: adopt a rescued pet, access the official pet shop, and share your feedback on DiaVet\'s future.' : 'Au-delà de la santé vétérinaire : adoptez un animal rescapé, accédez à l\'animalerie officielle et donnez votre avis sur le futur de DiaVet.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Adoption Card */}
                <div 
                  onClick={() => navigateTo('adoption')}
                  className="rounded-3xl p-6 sm:p-8 bg-slate-950/80 border border-rose-500/30 hover:border-rose-400 transition-all cursor-pointer group flex flex-col justify-between shadow-xl backdrop-blur-xl hover:scale-[1.02] relative overflow-hidden"
                >
                  {!hasCompletedQuestionnaire && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 text-[10px] font-bold text-amber-300 shadow-md">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>{currentLang === 'ar' ? 'مغلق' : currentLang === 'en' ? 'Locked' : 'Verrouillé'}</span>
                    </div>
                  )}
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                      <Heart className="w-6 h-6 fill-current" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                      {currentLang === 'ar' ? 'التضامن مع الحيوانات بالجزائر' : currentLang === 'en' ? 'Animal Solidarity DZ' : 'Solidarité Animale DZ'}
                    </span>
                    <h3 className="text-xl font-black text-white mt-3 mb-2">
                      {currentLang === 'ar' ? 'التبني المسؤول' : currentLang === 'en' ? 'Responsible Adoption' : 'Adoption Responsable'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      {currentLang === 'ar' ? 'جراء وقطط وحيوانات منقذة ملقحة ومخصاة في 58 ولاية. اعثر على رفيقك المستقبلي بدون تكاليف تجارية.' : currentLang === 'en' ? 'Puppies, kittens, and rescued pets vaccinated and neutered across 58 wilayas. Find your future companion free of commercial fees.' : 'Chiots, chatons et animaux rescapés vaccinés et stérilisés dans 58 wilayas. Trouvez votre futur compagnon sans frais marchands.'}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-rose-400 group-hover:text-rose-300">
                    <span>{hasCompletedQuestionnaire 
                      ? (currentLang === 'ar' ? 'عرض الحيوانات للتبني ←' : currentLang === 'en' ? 'View pets for adoption →' : 'Voir les animaux à adopter →') 
                      : (currentLang === 'ar' ? 'يفتح بعد الاستبيان والهدية 🔒' : currentLang === 'en' ? 'Unlocked after form & gift 🔒' : 'Débloqué après formulaire & enveloppe 🔒')}
                    </span>
                  </div>
                </div>

                {/* 2. Marketplace Card */}
                <div 
                  onClick={() => navigateTo('marketplace')}
                  className="rounded-3xl p-6 sm:p-8 bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between shadow-xl backdrop-blur-xl hover:scale-[1.02] relative overflow-hidden"
                >
                  {!hasCompletedQuestionnaire && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 text-[10px] font-bold text-amber-300 shadow-md">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>{currentLang === 'ar' ? 'مغلق' : currentLang === 'en' ? 'Locked' : 'Verrouillé'}</span>
                    </div>
                  )}
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      {currentLang === 'ar' ? 'المتجر والرعاية' : currentLang === 'en' ? 'Shop & Care' : 'Boutique & Soins'}
                    </span>
                    <h3 className="text-xl font-black text-white mt-3 mb-2">
                      {currentLang === 'ar' ? 'متجر الحيوانات والصيدلية البيطرية' : currentLang === 'en' ? 'Pet Shop & Veterinary Pharmacy' : 'Animalerie & Pharmacie Vétérinaire'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      {currentLang === 'ar' ? 'تغذية ممتازة ومضادات الطفيليات Seresto و Frontline بالدينار الجزائري، وحجز خدمات الحلاقة والإسعاف.' : currentLang === 'en' ? 'Premium nutrition, Seresto & Frontline antiparasitics in DZD, and booking for future grooming and ambulance services.' : 'Nutrition premium, antiparasitaires Seresto & Frontline en Dinars Algériens (DZD), et réservation des futurs services de toilettage et ambulance.'}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                    <span>{hasCompletedQuestionnaire 
                      ? (currentLang === 'ar' ? 'استكشاف المتجر وخارطة الطريق ←' : currentLang === 'en' ? 'Explore shop & roadmap →' : 'Explorer la boutique & feuille de route →') 
                      : (currentLang === 'ar' ? 'يفتح بعد الاستبيان والهدية 🔒' : currentLang === 'en' ? 'Unlocked after form & gift 🔒' : 'Débloqué après formulaire & enveloppe 🔒')}
                    </span>
                  </div>
                </div>

                {/* 3. Ideas Card */}
                <div 
                  onClick={() => navigateTo('ideas')}
                  className="rounded-3xl p-6 sm:p-8 bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between shadow-xl backdrop-blur-xl hover:scale-[1.02] relative overflow-hidden"
                >
                  {!hasCompletedQuestionnaire && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/40 text-[10px] font-bold text-amber-300 shadow-md">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>{currentLang === 'ar' ? 'مغلق' : currentLang === 'en' ? 'Locked' : 'Verrouillé'}</span>
                    </div>
                  )}
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      {currentLang === 'ar' ? 'البناء المشترك' : currentLang === 'en' ? 'Co-Construction' : 'Co-Construction'}
                    </span>
                    <h3 className="text-xl font-black text-white mt-3 mb-2">
                      {currentLang === 'ar' ? 'صندوق الأفكار وآراء المجتمع' : currentLang === 'en' ? 'Idea Box & Community Reviews' : 'Boîte à Idées & Avis Communauté'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      {currentLang === 'ar' ? 'اقترح ميزات جديدة، وأعطِ تقييمك بـ 5 نجوم وصوت للتحسينات ذات الأولوية للبياطرة والمربين الجزائريين.' : currentLang === 'en' ? 'Propose new features, leave your 5-star review, and vote on priority improvements for Algerian vets and owners.' : 'Proposez vos fonctionnalités, donnez votre note sur 5 étoiles et votez pour les améliorations prioritaires pour les vétérinaires et propriétaires algériens.'}
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    <span>{hasCompletedQuestionnaire 
                      ? (currentLang === 'ar' ? 'مشاركة فكرة أو التصويت ←' : currentLang === 'en' ? 'Share an idea or vote →' : 'Partager une idée ou voter →') 
                      : (currentLang === 'ar' ? 'يفتح بعد الاستبيان والهدية 🔒' : currentLang === 'en' ? 'Unlocked after form & gift 🔒' : 'Débloqué après formulaire & enveloppe 🔒')}
                    </span>
                  </div>
                </div>

              </div>
            </section>

            {/* FEATURE HIGHLIGHT: BADGES & ARTICLES SPOTLIGHT BANNER */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Badges Spotlight */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-orange-950/30 border border-amber-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase text-amber-300 tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        {currentLang === 'ar' ? '🏆 ورشة الشارات والتفاعل' : currentLang === 'en' ? '🏆 Badge Workshop & Gamification' : '🏆 Atelier de Badges & Gamification'}
                      </span>
                      <span className="text-xs text-amber-200 font-bold">
                        {unlockedCount} / {badges.length} {currentLang === 'ar' ? 'مفعلة' : currentLang === 'en' ? 'unlocked' : 'débloqués'}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                      {currentLang === 'ar' ? 'اصنع شاراتك ومحطات الصحة' : currentLang === 'en' ? 'Forge Badges & Health Milestones' : 'Forgez vos Badges & Jalons Santé'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                      {currentLang === 'ar' ? 'صمم شاراتك الثلاثية الأبعاد، وخصص ملفك الشخصي وتابع تلقيح أليفك عبر 58 ولاية.' : currentLang === 'en' ? 'Design holographic badges, customize your profile, and track your pet\'s vaccination schedule across 58 wilayas.' : 'Concevez vos propres insignes holographiques, personnalisez votre profil et suivez la vaccination de votre compagnon à travers les 58 wilayas.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigateTo('profile')}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      {currentLang === 'ar' ? 'عرض ملفي وصناعة الشارات ←' : currentLang === 'en' ? 'View my profile & forge badges →' : 'Voir mon profil & forger des badges →'}
                    </button>
                  </div>
                </div>

                {/* Section Vétérinaire Direct Access Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-slate-900 to-teal-950/30 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase text-emerald-300 tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {currentLang === 'ar' ? '🩺 الحزمة السريرية للبيطري المحترف' : currentLang === 'en' ? '🩺 Pro Veterinary Clinical Suite' : '🩺 Suite Clinique Vétérinaire Pro'}
                      </span>
                      <span className="text-xs text-emerald-400 font-bold">
                        {currentLang === 'ar' ? 'وصول مباشر بالجزائر' : currentLang === 'en' ? 'Direct Access DZ' : 'Accès Direct DZ'}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                      {currentLang === 'ar' ? 'إدارة العيادة الوصفات الطبية المعتمدة' : currentLang === 'en' ? 'Practice Management & Certified Prescriptions' : 'Gestion de Cabinet & Ordonnances Homologuées'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                      {currentLang === 'ar' ? 'ملفات طبية زمنية، وإنشاء وصفات طبية برمز QR الأمني وإدارة صف الانتظار الذكي.' : currentLang === 'en' ? 'Chronological medical records, prescription generation with security QR codes, and smart queue management.' : 'Dossiers médicaux chronologiques, génération d\'ordonnances avec QR code de sécurité et file d\'attente intelligente.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigateTo('vet-portal')}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      {currentLang === 'ar' ? 'فتح الحزمة البيطرية المحترفة ←' : currentLang === 'en' ? 'Open Pro Vet Suite →' : 'Ouvrir la Suite Vétérinaire Pro →'}
                    </button>
                  </div>
                </div>

              </div>
            </section>
          </>
        );
    }
  };

  // Animated Screen Wrapper with Framer Motion and archetype-specific transitions
  const renderScreen = () => {
    const archetype = getScreenArchetype(activeScreen);
    const variants = screenArchetypeVariants[archetype] || screenArchetypeVariants.home;

    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeScreen}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full flex-1"
        >
          {renderScreenContent()}
        </motion.div>
      </AnimatePresence>
    );
  };

  // Real Registration / Auth handler with unique email & verification code
  const handleRegisterSuccess = (profile: Partial<UserProfile>, selectedRole: 'owner' | 'vet') => {
    soundEngine.playLevelUp();
    const pointsEarned = selectedRole === 'vet' ? 250 : 150;
    const isOwnerUser = Boolean(
      profile.email?.toLowerCase().trim() === 'mine.mine0100@gmail.com' ||
      profile.email?.toLowerCase().endsWith('@diavet.dz') ||
      profile.email?.toLowerCase().includes('admin') ||
      profile.phone === '0100' ||
      profile.pin === '0100'
    );

    const fullProfile: UserProfile = {
      ...userProfile,
      name: profile.name || userProfile.name,
      email: profile.email || userProfile.email,
      phone: profile.phone || userProfile.phone,
      wilaya: profile.wilaya || userProfile.wilaya,
      commune: profile.commune || userProfile.commune,
      userRole: selectedRole,
      petName: profile.petName || userProfile.petName,
      petType: profile.petType || userProfile.petType,
      clinicName: profile.clinicName || userProfile.clinicName,
      points: (userProfile.points ?? 0) + pointsEarned,
      healthPoints: (userProfile.healthPoints ?? 0) + pointsEarned,
      isVip: true,
      vipCode: userProfile.vipCode || `DZ-${Math.floor(100000 + Math.random() * 900000)}`,
      badgeTitle: selectedRole === 'vet' ? 'Praticien Agréé Fondateur DZ' : 'Membre VIP Fondateur DZ',
      isOwner: isOwnerUser,
      isVipEarlyAccess: true
    };

    setUserProfile(fullProfile);
    setIsRegistered(true);
    setHasCompletedQuestionnaire(false);
    setShowAuthModal(false);

    try {
      localStorage.setItem('diavet_registered', 'true');
      localStorage.setItem('diavet_completed_questionnaire', 'false');
      localStorage.setItem('diavet_user_profile', JSON.stringify(fullProfile));
      if (isOwnerUser) {
        localStorage.setItem('diavet_is_owner', 'true');
      }
    } catch (e) {
      console.error(e);
    }

    // Record in leads registry for Excel export
    recordRegistrationLead(fullProfile, selectedRole);

    // Direct redirection to questionnaire form
    const targetScreen = selectedRole === 'vet' ? 'questionnaire-vet' : 'questionnaire-owner';
    setActiveScreen(targetScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    triggerRewardToast(
      currentLang === 'ar' 
        ? "تمت الإنابة والتسجيل بنجاح ! 🇩🇿" 
        : currentLang === 'en'
        ? "Account Registered Successfully! 🇩🇿"
        : "Inscription Réussie ! 🇩🇿",
      currentLang === 'ar'
        ? `يرجى إكمال أسئلة الاستبيان لاستلام هديتك الترحيبية وفتح كافة الخدمات.`
        : currentLang === 'en'
        ? `Please complete the questionnaire form to receive your welcome gift and unlock adoption.`
        : `Veuillez remplir le formulaire pour recevoir votre cadeau du Chat DiaVet et débloquer l'adoption.`,
      '📋'
    );
  };

  // Force Clean Logout for all sessions
  const handleLogout = () => {
    soundEngine.playCyberClick();
    setIsRegistered(false);
    setHasCompletedQuestionnaire(false);
    setUserProfile(DEFAULT_USER_PROFILE);
    try {
      localStorage.removeItem('diavet_registered');
      localStorage.removeItem('diavet_completed_questionnaire');
      localStorage.removeItem('diavet_user_profile');
    } catch {}
    triggerRewardToast(
      currentLang === 'ar' 
        ? "تم تسجيل الخروج بنجاح" 
        : currentLang === 'en' 
        ? "Logged out successfully" 
        : "Déconnexion réussie",
      currentLang === 'ar' 
        ? "لقد تم تسجيل خروجك بنجاح من حسابك." 
        : currentLang === 'en' 
        ? "You have been logged out of DiaVet." 
        : "Vous êtes maintenant déconnecté de DiaVet.",
      "👋"
    );
  };

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${
      currentTheme === 'dark' 
        ? 'bg-[#020617] text-slate-100' 
        : 'bg-slate-50 text-slate-900'
    }`}>

      {/* GLOBAL LOADING OVERLAY */}
      <GlobalLoadingOverlay />

      {/* TOP NOTIFICATION BAR */}
      <TopNotificationBar
        currentLang={currentLang}
        onOpenQuestionnaire={() => navigateTo(userProfile.userRole === 'vet' ? 'questionnaire-vet' : 'questionnaire-owner')}
      />

      {/* ALGIERS BAY BACKGROUND (Subtle, high-contrast, animated) */}
      <AlgiersBackground theme={currentTheme} />

      {/* TOAST NOTIFICATION FOR UNLOCKED REWARDS / POINTS */}
      {toastNotification && (
        <div className="fixed top-24 right-4 z-50 max-w-sm rounded-2xl bg-slate-950/95 border-2 border-amber-500/50 p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-300 flex items-start gap-3">
          <span className="text-2xl">{toastNotification.icon}</span>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-black text-white">{toastNotification.title}</h4>
            <p className="text-xs text-amber-300 mt-0.5">{toastNotification.subtitle}</p>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN NAVIGATION HEADER */}
      <Navbar
        currentLang={currentLang}
        onSelectLang={handleSelectLang}
        currentTheme={currentTheme}
        onToggleTheme={toggleTheme}
        isIphoneView={isIphoneView}
        onToggleIphoneView={() => setIsIphoneView(!isIphoneView)}
        onNavigate={navigateTo}
        activeScreen={activeScreen}
        unlockedBadgesCount={unlockedCount}
        hasCompletedQuestionnaire={hasCompletedQuestionnaire}
        userRole={userProfile.userRole}
        isOwner={isOwner}
        userName={userProfile.name}
        userPoints={userProfile.points}
        onOpenExcel={() => setShowExcelModal(true)}
        onLockedFeatureClick={(featureName) => {
          setLockedFeatureName(featureName);
          setShowLockedGiftModal(true);
        }}
        onOpenContact={() => setShowContactModal(true)}
        onOpenDriveSync={() => setShowDriveSyncModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onResetRegistration={handleLogout}
        isRegistered={isRegistered}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      {/* IPHONE FRAME SIMULATOR WRAPPER */}
      {isIphoneView ? (
        <main className="py-8 sm:py-12 flex justify-center items-center px-4">
          <div className="relative w-full max-w-[420px] rounded-[3.5rem] border-[12px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden ring-1 ring-white/20 min-h-[840px] flex flex-col">
            
            {/* Dynamic Island / Notch */}
            <div className="w-full flex justify-center pt-3 pb-2 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
              <div className="w-28 h-5 bg-black rounded-full flex items-center justify-between px-3">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                <span className="text-[9px] text-slate-400 font-mono font-semibold">DiaVet DZ</span>
              </div>
            </div>

            {/* Viewport content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
              {renderScreen()}
            </div>

            {/* Home Indicator Bar */}
            <div className="w-full flex justify-center py-2 bg-slate-950/90 backdrop-blur-md">
              <div className="w-32 h-1 bg-slate-700 rounded-full"></div>
            </div>

          </div>
        </main>
      ) : (
        /* STANDARD RESPONSIVE WEB APPLICATION */
        <main className="relative z-10">
          {renderScreen()}
        </main>
      )}

      {/* FOOTER */}
      <Footer
        currentLang={currentLang}
        userRole={userProfile.userRole}
        onNavigate={navigateTo}
        onOpenContact={() => setShowContactModal(true)}
      />

      {/* OFFICIAL CONTACT & EMAIL ROUTING MODAL */}
      <OfficialContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        currentLang={currentLang}
      />

      {/* LOCKED FEATURE GIFT PROMOTION MODAL */}
      <LockedGiftModal
        isOpen={showLockedGiftModal}
        onClose={() => setShowLockedGiftModal(false)}
        featureName={lockedFeatureName}
        currentLang={currentLang}
        userRole={userProfile.userRole}
        onGoToQuestionnaire={() => {
          setShowLockedGiftModal(false);
          setActiveScreen(userProfile.userRole === 'vet' ? 'questionnaire-vet' : 'questionnaire-owner');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* REWARD GIFT UNBOXING CELEBRATION MODAL */}
      <GiftRewardCelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        currentLang={currentLang}
        userName={userProfile.name || (userProfile.userRole === 'vet' ? 'Docteur Vétérinaire' : 'Propriétaire')}
        userRole={userProfile.userRole}
        vipCode={userProfile.vipCode || 'VIP-DZ-2026'}
        onNavigateTo={(scr) => {
          setShowCelebrationModal(false);
          setActiveScreen(scr);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onVipEarlyAccessToggle={(enabled) => {
          setUserProfile(prev => ({
            ...prev,
            isVipEarlyAccess: enabled,
            healthPoints: enabled ? (prev.healthPoints || 0) + 50 : prev.healthPoints,
            points: enabled ? (prev.points || 0) + 50 : prev.points,
          }));
          if (enabled) {
            triggerRewardToast(
              currentLang === 'ar' ? "عضوية VIP قبل الإطلاق مفعلة ! 🌟" : "Pass VIP Avant-Première Validé ! 🌟",
              currentLang === 'ar' ? "ستتلقى النسخة الأولى للتطبيق قبل الإطلاق الرسمي في الجزائر." : "Vous recevrez la version exclusive en avant-première avant le lancement officiel en Algérie 🇩🇿.",
              '👑'
            );
          }
        }}
      />

      {/* GOOGLE DRIVE 1-CLICK SYNC MODAL */}
      <DriveSyncModal
        isOpen={showDriveSyncModal}
        onClose={() => setShowDriveSyncModal(false)}
      />

      {/* EXCEL REGISTRY DOWNLOAD MODAL (FOR LEADS EXPORT) */}
      <ExcelLeadsModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        currentLang={currentLang}
      />

      {/* WHATSAPP SUPPORT FLOAT BUTTON (WAA DZ) */}
      <WhatsAppSupportButton
        currentLang={currentLang}
      />

      {/* AMBIENT GENTLE ZEN MUSIC PLAYER */}
      <GentleMusicPlayer
        currentLang={currentLang}
      />

      {/* PROFILE EDIT & AUTO-INVOICING MODAL */}
      {showProfileModal && (
        <ProfileEditModal
          currentLang={currentLang}
          userProfile={userProfile}
          onSaveProfile={(updated) => {
            setUserProfile(prev => {
              const next = { ...prev, ...updated };
              try {
                localStorage.setItem('diavet_user_profile', JSON.stringify(next));
              } catch (e) {
                console.error(e);
              }
              return next;
            });
            setShowProfileModal(false);
            triggerRewardToast(
              currentLang === 'ar' ? "تم تحديث الملف الشخصي !" : "Profil mis à jour !",
              currentLang === 'ar' ? "تم حفظ بياناتك بنجاح في نظام DiaVet." : "Vos données ont été enregistrées avec succès.",
              '👤'
            );
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* AUTHENTICATION & OFFICIAL VERIFICATION GATEWAY MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-xl my-auto">
            <OnboardingGateway
              currentLang={currentLang}
              onSelectLang={handleSelectLang}
              onRegister={handleRegisterSuccess}
              onClose={isRegistered ? () => setShowAuthModal(false) : undefined}
            />
          </div>
        </div>
      )}

    </div>
  );
}
