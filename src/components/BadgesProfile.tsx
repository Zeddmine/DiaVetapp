import { useState } from 'react';
import { Language, Badge, HealthMilestone, UserProfile } from '../types';
import { translations } from '../data/translations';
import { 
  Award, Shield, Sparkles, Check, Lock, Share2, Copy, 
  Users, Heart, ChevronLeft, ArrowRight, CheckCircle2, 
  Flame, Star, Calendar, MapPin, User, Gift, Edit3, X, Save,
  PlusCircle, Trash2, Volume2, Wand2
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface BadgesProfileProps {
  currentLang: Language;
  userProfile: UserProfile;
  badges: Badge[];
  milestones: HealthMilestone[];
  onToggleMilestone: (id: string) => void;
  onReferFriend: () => void;
  onStartQuestionnaire: () => void;
  onGoHome: () => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  onAddCustomBadge?: (badge: Badge) => void;
  onDeleteBadge?: (id: string) => void;
}

const WILAYAS_LIST = [
  '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna', 
  '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
  '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou',
  '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
  '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine',
  '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
  '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arreridj', '35 - Boumerdès',
  '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
  '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Aïn Témouchent',
  '46 - Ghardaïa', '47 - Relizane', '48 - Timimoun', '49 - Bordj Badji Mokhtar', 
  '50 - Ouled Djellal', '51 - Béni Abbès', '52 - In Salah', '53 - In Guezzam', 
  '54 - Touggourt', '55 - Djanet', '56 - El M\'Ghair', '57 - El Meniaa'
];

const ANIMAL_CHOICES = [
  { id: 'chat', label: 'Chat', icon: '🐱', sound: 'chat' },
  { id: 'chien', label: 'Chien', icon: '🐶', sound: 'chien' },
  { id: 'oiseau', label: 'Oiseau', icon: '🦜', sound: 'oiseau' },
  { id: 'cochon', label: 'Cochon d\'Inde', icon: '🐹', sound: 'cochon' },
  { id: 'cheval', label: 'Cheval', icon: '🐴', sound: 'cheval' }
];

export default function BadgesProfile({
  currentLang,
  userProfile,
  badges,
  milestones,
  onToggleMilestone,
  onReferFriend,
  onStartQuestionnaire,
  onGoHome,
  onUpdateProfile,
  onAddCustomBadge,
  onDeleteBadge
}: BadgesProfileProps) {
  const t = translations[currentLang];
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'badges' | 'forge' | 'milestones' | 'referral'>('badges');
  
  // Real active profile editor state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userProfile.name || '',
    wilaya: userProfile.wilaya || '16 - Alger',
    petName: userProfile.petName || '',
    petType: userProfile.petType || 'Chat (Européen)',
    userRole: userProfile.userRole || 'owner',
    phone: userProfile.phone || '',
    email: userProfile.email || ''
  });

  // Badge Forge State
  const [forgeTitle, setForgeTitle] = useState('');
  const [forgeDescription, setForgeDescription] = useState('');
  const [forgeIcon, setForgeIcon] = useState('🐾');
  const [forgeTier, setForgeTier] = useState<Badge['tier']>('gold');
  const [forgeGlow, setForgeGlow] = useState('cyan');
  const [forgeRequirement, setForgeRequirement] = useState('');
  const [forgeSuccessMsg, setForgeSuccessMsg] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playCyberClick();
    if (onUpdateProfile) {
      onUpdateProfile(editForm);
    }
    setIsEditingProfile(false);
  };

  const handleAnimalSelect = (animal: typeof ANIMAL_CHOICES[0]) => {
    soundEngine.playAnimalSound(animal.sound);
    setEditForm(prev => ({
      ...prev,
      petType: `${animal.label} ${prev.petType.includes('(') ? prev.petType.substring(prev.petType.indexOf('(')) : ''}`
    }));
  };

  const handleForgeBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgeTitle.trim()) return;

    soundEngine.playBadgeForged();

    const newBadge: Badge = {
      id: `custom-badge-${Date.now()}`,
      title: forgeTitle.trim(),
      description: forgeDescription.trim() || 'Badge personnalisé forgé par l\'utilisateur sur DiaVet.',
      icon: forgeIcon,
      tier: forgeTier,
      isUnlocked: true,
      category: 'community',
      requirement: forgeRequirement.trim() || 'Badge créé et validé avec succès par le propriétaire.'
    };

    if (onAddCustomBadge) {
      onAddCustomBadge(newBadge);
    }

    setForgeSuccessMsg(`Badge "${newBadge.title}" forgé avec succès ! 🌟`);
    setForgeTitle('');
    setForgeDescription('');
    setForgeRequirement('');

    setTimeout(() => {
      setForgeSuccessMsg(null);
      setActiveTab('badges');
    }, 1500);
  };

  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const completedMilestones = milestones.filter(m => m.isCompleted).length;
  const totalScore = milestones.filter(m => m.isCompleted).reduce((acc, curr) => acc + curr.points, 0) + (unlockedCount * 150);

  const filteredBadges = badges.filter(b => {
    if (filter === 'unlocked') return b.isUnlocked;
    if (filter === 'locked') return !b.isUnlocked;
    return true;
  });

  const handleCopy = () => {
    soundEngine.playCyberClick();
    navigator.clipboard?.writeText(`https://diavet.dz/join?ref=${userProfile.referralCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getTierColor = (tier: Badge['tier']) => {
    switch (tier) {
      case 'platinum':
        return 'from-indigo-400 via-purple-300 to-pink-400 text-purple-200 border-purple-400/40 bg-purple-950/30';
      case 'gold':
        return 'from-amber-300 via-yellow-400 to-amber-500 text-amber-200 border-amber-400/40 bg-amber-950/30';
      case 'silver':
        return 'from-slate-200 via-cyan-200 to-slate-400 text-cyan-200 border-cyan-400/40 bg-cyan-950/30';
      case 'bronze':
      default:
        return 'from-amber-600 via-orange-500 to-amber-700 text-orange-200 border-orange-400/40 bg-orange-950/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-300 relative">
      
      {/* Top Header & Back */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white mb-2 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.btnBack}</span>
          </button>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Profil & Forge de Badges</span>
            <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
              DiaVet Cyber Studio
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-sm font-black shadow-lg shadow-amber-500/10">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>{totalScore} Points Santé DZ</span>
        </div>
      </div>

      {/* User Profile Card - Full Customization */}
      <div className="rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-slate-950/85 backdrop-blur-xl shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          
          {/* Avatar with Glow */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 p-1 shadow-xl shadow-cyan-500/30">
              <div className="w-full h-full rounded-[22px] bg-slate-950 overflow-hidden flex items-center justify-center text-4xl">
                {userProfile.userRole === 'vet' ? '🩺' : userProfile.petType?.toLowerCase().includes('chien') ? '🐶' : '🐱'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shadow-md">
              {userProfile.userRole === 'vet' ? 'VÉTÉRINAIRE' : 'PROPRIÉTAIRE'}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{userProfile.name}</h2>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                userProfile.userRole === 'vet'
                  ? 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40'
                  : 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30'
              }`}>
                {userProfile.userRole === 'vet' ? 'Docteur Vétérinaire DZ' : 'Propriétaire Vérifié'}
              </span>

              {userProfile.isVipEarlyAccess && (
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>VIP Avant-Première</span>
                </span>
              )}

              {/* Edit button */}
              <button
                onClick={() => {
                  soundEngine.playCyberClick();
                  setEditForm({
                    name: userProfile.name || '',
                    wilaya: userProfile.wilaya || '16 - Alger',
                    petName: userProfile.petName || '',
                    petType: userProfile.petType || 'Chat',
                    userRole: userProfile.userRole || 'owner',
                    phone: userProfile.phone || '',
                    email: userProfile.email || ''
                  });
                  setIsEditingProfile(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-xs font-bold text-cyan-200 transition-colors border border-cyan-400/30 cursor-pointer ml-auto shadow-md"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Personnaliser mon profil</span>
              </button>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                {userProfile.wilaya}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                🐾 Compagnon : <strong className="text-cyan-300 ml-1">{userProfile.petName}</strong> ({userProfile.petType})
              </span>
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-3 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto md:mx-0">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-lg sm:text-2xl font-black text-cyan-400">{unlockedCount} / {badges.length}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Badges Obtenus</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-lg sm:text-2xl font-black text-emerald-400">{completedMilestones} / {milestones.length}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Jalons Santé</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-lg sm:text-2xl font-black text-amber-400">{userProfile.referralCount}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Amis Parrainés</p>
              </div>
            </div>
          </div>

          {/* Referral Box & Quick Reset */}
          <div className="w-full md:w-auto p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/20 text-center md:text-right shrink-0">
            <p className="text-[10px] uppercase font-bold text-slate-400">Code de parrainage</p>
            <p className="text-base font-mono font-black text-cyan-400 mt-0.5">{userProfile.referralCode}</p>
            <button
              onClick={handleCopy}
              className="mt-2.5 w-full px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Lien copié !' : 'Copier le lien'}</span>
            </button>

            {/* Forge Badge Shortcut CTA */}
            <button
              onClick={() => {
                soundEngine.playCyberClick();
                setActiveTab('forge');
              }}
              className="mt-2.5 w-full px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Forger un badge</span>
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 mb-8 max-w-2xl flex-wrap gap-1">
        <button
          onClick={() => {
            soundEngine.playCyberClick();
            setActiveTab('badges');
          }}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'badges'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Mes Badges ({unlockedCount})</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playCyberClick();
            setActiveTab('forge');
          }}
          className={`flex-1 min-w-[140px] py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'forge'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-950 font-black shadow-md'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Atelier de Forge ✨</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playCyberClick();
            setActiveTab('milestones');
          }}
          className={`flex-1 min-w-[120px] py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'milestones'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Jalons Santé ({completedMilestones}/{milestones.length})</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playCyberClick();
            setActiveTab('referral');
          }}
          className={`flex-1 min-w-[100px] py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'referral'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Parrainage</span>
        </button>
      </div>

      {/* TAB 1: BADGES SHOWCASE */}
      {activeTab === 'badges' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2">
              {(['all', 'unlocked', 'locked'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => {
                    soundEngine.playCyberClick();
                    setFilter(f);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                    filter === f
                      ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md shadow-cyan-500/20'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {f === 'all' ? 'Tous les badges' : f === 'unlocked' ? 'Débloqués' : 'À débloquer'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('forge')}
              className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1.5 cursor-pointer bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Créer mon propre badge sur mesure →</span>
            </button>
          </div>

          {/* Badges Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map(badge => {
              const tierClass = getTierColor(badge.tier);
              const isCustom = badge.id.startsWith('custom-badge');
              return (
                <div
                  key={badge.id}
                  className={`rounded-3xl p-6 border transition-all duration-300 relative flex flex-col justify-between overflow-hidden shadow-xl ${
                    badge.isUnlocked
                      ? 'bg-slate-950/80 border-cyan-500/40 hover:border-cyan-400/80 hover:shadow-cyan-500/20'
                      : 'bg-slate-950/40 border-white/5 opacity-70 hover:opacity-90'
                  }`}
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                          {badge.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${tierClass}`}>
                              {badge.tier}
                            </span>
                            {isCustom && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                FORGÉ PAR VOUS
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                            Catégorie: {badge.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCustom && onDeleteBadge && (
                          <button
                            onClick={() => {
                              soundEngine.playCyberClick();
                              onDeleteBadge(badge.id);
                            }}
                            title="Supprimer ce badge personnalisé"
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {badge.isUnlocked ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold shadow-md">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-500 border border-white/10 flex items-center justify-center text-xs">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-white">{badge.title}</h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{badge.description}</p>
                  </div>

                  {/* Footer requirement & action */}
                  <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                    <p className="text-[11px] text-slate-400">
                      <strong>Condition :</strong> {badge.requirement}
                    </p>

                    {badge.isUnlocked ? (
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Badge Actif
                        </span>
                        <span className="text-slate-400 text-[10px]">Visible sur profil</span>
                      </div>
                    ) : (
                      <div>
                        {badge.category === 'questionnaire' && (
                          <button
                            onClick={onStartQuestionnaire}
                            className="w-full mt-1 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Faire le formulaire</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {badge.category === 'referral' && (
                          <button
                            onClick={onReferFriend}
                            className="w-full mt-1 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Parrainer un ami</span>
                            <Share2 className="w-3 h-3" />
                          </button>
                        )}
                        {badge.category === 'milestones' && (
                          <button
                            onClick={() => setActiveTab('milestones')}
                            className="w-full mt-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>Voir les jalons ({completedMilestones}/5)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: ATELIER DE FORGE DE BADGES HOLOGRAPHIQUES */}
      {activeTab === 'forge' && (
        <div className="rounded-3xl p-6 sm:p-10 border border-amber-500/40 bg-slate-950/90 backdrop-blur-xl shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Atelier Créatif & Gamification DiaVet</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-white">Forger votre propre Badge</h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-2">
                Concevez votre insigne exclusif, choisissez ses pouvoirs, son rang et sa condition d'obtention. Il sera immédiatement intégré à votre collection !
              </p>
            </div>

            {forgeSuccessMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-sm font-bold text-center animate-bounce">
                {forgeSuccessMsg}
              </div>
            )}

            <form onSubmit={handleForgeBadge} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Titre du Badge *
                </label>
                <input
                  type="text"
                  required
                  value={forgeTitle}
                  onChange={(e) => setForgeTitle(e.target.value)}
                  placeholder="Ex: Gardien Félin d'Alger, Sauveur de Chiots, Veto Émérite..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Description / Histoire du Badge
                </label>
                <textarea
                  rows={2}
                  value={forgeDescription}
                  onChange={(e) => setForgeDescription(e.target.value)}
                  placeholder="Ex: Récompense décernée pour l'amour et l'attention sans faille portée à son animal..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Icon selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Choisir l'Icône Symbolique
                </label>
                <div className="flex flex-wrap gap-2">
                  {['🐾', '🐱', '🐶', '🦜', '🐹', '🐴', '🩺', '🛡️', '⚡', '🌟', '👑', '💎', '🚀', '❤️', '🔥'].map((ico) => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => {
                        soundEngine.playCyberClick();
                        setForgeIcon(ico);
                      }}
                      className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                        forgeIcon === ico
                          ? 'bg-amber-500 text-slate-950 scale-110 shadow-lg shadow-amber-500/40 ring-2 ring-amber-400'
                          : 'bg-slate-900 text-slate-200 border border-white/10 hover:border-amber-400/50 hover:bg-slate-800'
                      }`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier / Rarity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['bronze', 'silver', 'gold', 'platinum'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      soundEngine.playCyberClick();
                      setForgeTier(t);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                      forgeTier === t
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Condition / Objectif pour le valider
                </label>
                <input
                  type="text"
                  value={forgeRequirement}
                  onChange={(e) => setForgeRequirement(e.target.value)}
                  placeholder="Ex: Avoir complété 3 soins de prévention ou vaccins..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-amber-400/50 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
                  {forgeIcon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-white text-sm">{forgeTitle || 'Titre de votre badge'}</h5>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {forgeTier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{forgeDescription || 'Description en direct...'}</p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <Sparkles className="w-5 h-5" />
                <span>⚡ Forger mon Badge Holographique</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: HEALTH MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl p-6 sm:p-8 border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span>Jalons de Santé Préventive de {userProfile.petName}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cochez les jalons réalisés lors de vos visites vétérinaires pour débloquer les badges santé.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                  {completedMilestones} / {milestones.length} validés
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-900 border border-white/10 mb-8 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${(completedMilestones / milestones.length) * 100}%` }}
              ></div>
            </div>

            {/* Milestones list */}
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  onClick={() => {
                    soundEngine.playCyberClick();
                    onToggleMilestone(milestone.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    milestone.isCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                      milestone.isCompleted
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-white/20 bg-slate-800'
                    }`}>
                      {milestone.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{milestone.title}</p>
                      <p className="text-xs text-slate-400">{milestone.description}</p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-emerald-400 shrink-0">
                    +{milestone.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REFERRAL */}
      {activeTab === 'referral' && (
        <div className="rounded-3xl p-6 sm:p-10 border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl animate-in fade-in duration-200">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-xl shadow-amber-500/20">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Parrainez vos amis en Algérie</h3>
              <p className="text-slate-300 text-sm mt-2">
                Partagez votre lien exclusif. Chaque ami qui crée son carnet de santé virtuel vous fait gagner <strong>+150 Points Santé</strong> et débloque le badge <strong>Ambassadeur DiaVet</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between gap-3">
              <span className="font-mono text-sm text-cyan-300 font-bold truncate">
                https://diavet.dz/join?ref={userProfile.referralCode}
              </span>
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black shrink-0 hover:bg-cyan-400 transition-all cursor-pointer"
              >
                {copiedLink ? 'Copié !' : 'Copier'}
              </button>
            </div>

            <button
              onClick={() => {
                soundEngine.playCyberClick();
                onReferFriend();
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Simuler l'adhésion d'un ami (+150 pts)
            </button>
          </div>
        </div>
      )}

      {/* PROFILE CUSTOMIZATION MODAL (User creates / customizes their profile) */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">Créer / Personnaliser mon Profil</h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Mon Rôle sur DiaVet</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playCyberClick();
                      setEditForm(prev => ({ ...prev, userRole: 'owner' }));
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                      editForm.userRole === 'owner'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 border-white/10 text-slate-400'
                    }`}
                  >
                    🐾 Propriétaire d'animal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playCyberClick();
                      setEditForm(prev => ({ ...prev, userRole: 'vet' }));
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                      editForm.userRole === 'vet'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-slate-900 border-white/10 text-slate-400'
                    }`}
                  >
                    🩺 Docteur Vétérinaire
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Votre Nom & Prénom *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Ex: Ryad Bouzidi ou Dr. Meriem"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Animal Type with instant vocal sound test */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Espèce de votre animal (cliquez pour écouter son cri !)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ANIMAL_CHOICES.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleAnimalSelect(a)}
                      title={`Écouter le cri du ${a.label}`}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400 text-center transition-all cursor-pointer active:scale-95 group"
                    >
                      <span className="text-xl block">{a.icon}</span>
                      <span className="text-[10px] text-slate-300 font-bold truncate block mt-0.5">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nom de l'animal</label>
                  <input
                    type="text"
                    required
                    value={editForm.petName}
                    onChange={e => setEditForm({ ...editForm, petName: e.target.value })}
                    placeholder="Ex: Max, Bella, Milo, Rio..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Détails Race / Espèce</label>
                  <input
                    type="text"
                    value={editForm.petType}
                    onChange={e => setEditForm({ ...editForm, petType: e.target.value })}
                    placeholder="Ex: Chat Siamois, Berger..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Wilaya (58 Wilayas)</label>
                  <select
                    value={editForm.wilaya}
                    onChange={e => setEditForm({ ...editForm, wilaya: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                  >
                    {WILAYAS_LIST.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Ex: 0550 12 34 56"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer mon Profil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
