import { useState, useEffect } from 'react';
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
import { translations } from './data/translations';
import { INITIAL_BADGES, INITIAL_MILESTONES, DEFAULT_USER_PROFILE } from './data/badgeData';
import { INITIAL_ARTICLES } from './data/articlesData';
import { soundEngine } from './utils/soundEngine';
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

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('diavet_lang') as Language;
      return savedLang && ['fr', 'en', 'ar'].includes(savedLang) ? savedLang : 'fr';
    } catch {
      return 'fr';
    }
  });
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');
  const [activeScreen, setActiveScreen] = useState<AppScreen>('home');
  const [isIphoneView, setIsIphoneView] = useState<boolean>(false);

  // Gated Registration State - Visitors must register at the start to gain access
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('diavet_registered');
      return saved === 'true';
    } catch {
      return false;
    }
  });

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

  // Owner privilege check (1-Click Google Drive tools reserved exclusively for owner)
  const isOwner = Boolean(
    userProfile.email?.toLowerCase().trim() === 'mine.mine0100@gmail.com' ||
    userProfile.isOwner === true ||
    (typeof window !== 'undefined' && localStorage.getItem('diavet_is_owner') === 'true')
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

  // Sync HTML root and language preference
  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    if (currentLang === 'ar') {
      root.setAttribute('dir', 'rtl');
      root.setAttribute('lang', 'ar');
    } else {
      root.setAttribute('dir', 'ltr');
      root.setAttribute('lang', currentLang);
    }

    try {
      localStorage.setItem('diavet_lang', currentLang);
    } catch {}
  }, [currentTheme, currentLang]);

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
      setActiveScreen('vet-portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Accessing Veterinary Questionnaire
    if (screen === 'questionnaire-vet') {
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
              "Jalon Santé Validé ! 🩺",
              `Bravo ! Vous avez validé "${m.title}" (+${m.points} Points Santé).`,
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
      "Nouveau Badge Forgé ! 🌟",
      `Le badge "${newBadge.title}" a été forgé et gravé dans votre collection.`,
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
      "Badge Retiré",
      "Le badge a été retiré de votre collection.",
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
      "Parrainage Validé ! 🎉",
      `Vous avez maintenant ${nextCount} filleul(s) actif(s) ! +150 Points Santé ajoutés.`,
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
      "Conseil publié avec succès !",
      "+30 Points de contribution communautaire ajoutés.",
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

  // Screen Switcher
  const renderScreen = () => {
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
              setUserProfile(prev => ({
                ...prev,
                ...updated
              }));
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
            {/* HERO SECTION */}
            <HeroSection
              currentLang={currentLang}
              onStart={() => navigateTo(userProfile.userRole === 'vet' ? 'questionnaire-vet' : 'questionnaire-owner')}
              onExploreVets={() => navigateTo('vet-portal')}
              onOpenDirectory={() => navigateTo('dz-directory')}
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
                  Écosystème National DiaVet Algérie 🇩🇿
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
                  Services Solidaires & Nouveautés Connectées
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2">
                  Au-delà de la santé vétérinaire : adoptez un animal rescapé, accédez à l'animalerie officielle et donnez votre avis sur le futur de DiaVet.
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
                      <span>Verrouillé</span>
                    </div>
                  )}
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                      <Heart className="w-6 h-6 fill-current" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                      Solidarité Animale DZ
                    </span>
                    <h3 className="text-xl font-black text-white mt-3 mb-2">
                      Adoption Responsable
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      Chiots, chatons et animaux rescapés vaccinés et stérilisés dans 58 wilayas. Trouvez votre futur compagnon sans frais marchands.
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-rose-400 group-hover:text-rose-300">
                    <span>{hasCompletedQuestionnaire ? 'Voir les animaux à adopter →' : 'Débloqué après formulaire & enveloppe 🔒'}</span>
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
                      <span>Verrouillé</span>
                    </div>
                  )}
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Boutique & Soins
                    </span>
                    <h3 className="text-xl font-black text-white mt-3 mb-2">
                      Animalerie & Pharmacie Vétérinaire
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      Nutrition premium, antiparasitaires Seresto & Frontline en Dinars Algériens (DZD), et réservation des futurs services de toilettage et ambulance.
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                    <span>{hasCompletedQuestionnaire ? 'Explorer la boutique & feuille de route →' : 'Débloqué après formulaire & enveloppe 🔒'}</span>
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
                      <span>Verrouillé</span>
                    </div>
                  )}
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      Co-Construction
                    </span>
                    <h3 className="text-xl font-black text-white mt-3 mb-2">
                      Boîte à Idées & Avis Communauté
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      Proposez vos fonctionnalités, donnez votre note sur 5 étoiles et votez pour les améliorations prioritaires pour les vétérinaires et propriétaires algériens.
                    </p>
                  </div>
                  <div className="flex items-center text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    <span>{hasCompletedQuestionnaire ? 'Partager une idée ou voter →' : 'Débloqué après formulaire & enveloppe 🔒'}</span>
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
                        🏆 Atelier de Badges & Gamification
                      </span>
                      <span className="text-xs text-amber-200 font-bold">
                        {unlockedCount} / {badges.length} débloqués
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                      Forgez vos Badges & Jalons Santé
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                      Concevez vos propres insignes holographiques, personnalisez votre profil et suivez la vaccination de votre compagnon à travers les 58 wilayas.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigateTo('profile')}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      Voir mon profil & forger des badges →
                    </button>
                  </div>
                </div>

                {/* Section Vétérinaire Direct Access Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-slate-900 to-teal-950/30 border border-emerald-500/30 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase text-emerald-300 tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        🩺 Suite Clinique Vétérinaire Pro
                      </span>
                      <span className="text-xs text-emerald-400 font-bold">
                        Accès Direct DZ
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                      Gestion de Cabinet & Ordonnances Homologuées
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                      Dossiers médicaux chronologiques, génération d'ordonnances avec QR code de sécurité et file d'attente intelligente.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigateTo('vet-portal')}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      Ouvrir la Suite Vétérinaire Pro →
                    </button>
                  </div>
                </div>

              </div>
            </section>
          </>
        );
    }
  };

  // If user hasn't registered a real profile yet, show the futuristic Onboarding Gateway
  if (!isRegistered) {
    return (
      <div className={`min-h-screen relative overflow-hidden ${
        currentTheme === 'dark' ? 'bg-[#020617] text-slate-100' : 'bg-slate-900 text-slate-100'
      }`}>
        <AlgiersBackground theme="dark" />
        <div className="relative z-10">
          <OnboardingGateway
            currentLang={currentLang}
            onSelectLang={setCurrentLang}
            onRegister={(profile, selectedRole) => {
              soundEngine.playLevelUp();
              setUserProfile(prev => ({
                ...prev,
                name: profile.name || prev.name,
                phone: profile.phone || prev.phone,
                wilaya: profile.wilaya || prev.wilaya,
                userRole: selectedRole,
                petName: profile.petName || prev.petName,
                clinicName: profile.clinicName || prev.clinicName,
                points: (prev.points ?? 0) + (selectedRole === 'owner' ? 100 : 250),
                isVip: true,
              }));
              setIsRegistered(true);
              try {
                localStorage.setItem('diavet_registered', 'true');
              } catch (e) {
                console.error(e);
              }
              if (selectedRole === 'vet') {
                setActiveScreen('questionnaire-vet');
              } else {
                setActiveScreen('questionnaire-owner');
              }
              triggerRewardToast(
                "Profil Activé avec Succès ! 🇩🇿",
                `Bienvenue ${profile.name || 'sur DiaVet'} ! Formulaire & carnet VIP débloqués.`,
                '🎉'
              );
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${
      currentTheme === 'dark' 
        ? 'bg-[#020617] text-slate-100' 
        : 'bg-slate-50 text-slate-900'
    }`}>

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
        onSelectLang={setCurrentLang}
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
        onLockedFeatureClick={(featureName) => {
          setLockedFeatureName(featureName);
          setShowLockedGiftModal(true);
        }}
        onOpenContact={() => setShowContactModal(true)}
        onOpenDriveSync={() => setShowDriveSyncModal(true)}
        onResetRegistration={() => {
          setIsRegistered(false);
          setHasCompletedQuestionnaire(false);
          try {
            localStorage.removeItem('diavet_registered');
            localStorage.removeItem('diavet_completed_questionnaire');
          } catch {}
          soundEngine.playCyberClick();
        }}
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

    </div>
  );
}
