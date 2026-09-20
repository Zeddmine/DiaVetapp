export type Language = 'fr' | 'en' | 'ar';
export type Theme = 'dark' | 'light';

export type AppScreen =
  | 'home'
  | 'roles'
  | 'questionnaire-owner'
  | 'questionnaire-vet'
  | 'owner-portal'
  | 'vet-portal'
  | 'dz-directory'
  | 'articles'
  | 'profile'
  | 'adoption'
  | 'marketplace'
  | 'ideas';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'questionnaire' | 'referral' | 'milestones' | 'community';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  requirement: string;
}

export interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  category: 'vaccine' | 'checkup' | 'nutrition' | 'care';
  isCompleted: boolean;
  completedAt?: string;
  points: number;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'health' | 'nutrition' | 'care' | 'emergency';
  author: string;
  authorRole: string;
  readTime: string;
  imageUrl: string;
  date: string;
  isFeatured?: boolean;
  tags: string[];
  isVetVerified: boolean;
}

export interface UserProfile {
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  wilaya: string;
  commune?: string;
  joinedDate: string;
  referralCode: string;
  referralCount: number;
  healthPoints: number;
  petName: string;
  petType: string;
  petBreed?: string;
  petSex?: string;
  userRole?: 'owner' | 'vet';
  clinicName?: string;
  orderNumber?: string;
  isVip?: boolean;
  isOwner?: boolean;
  isVipEarlyAccess?: boolean;
  vipCode?: string;
  badgeTitle?: string;
  points?: number;
  referralsCount?: number;
  milestonesCompletedCount?: number;
}

export interface PetTypeOption {
  id: string;
  nameKey: string;
  icon: string;
  image: string;
}

export interface OwnerAnswers {
  animalTypes: string[];
  petName: string;
  petBreed?: string;
  petSex?: string;
  petAge: string;
  petWeight?: string;
  hasMicrochip?: string;
  isNeutered?: string; // Stérilisé ou non
  dietType?: string; // Type d'alimentation (Croquettes, Ration ménagère, Mixte)
  feedingSource?: string; // Origine des croquettes / aliments (Importé, Local DZ, Cuisiné maison)
  previousSurgeries?: string; // Antécédents chirurgicaux ou maladies chroniques
  isVaccinated: string;
  rabiesVaccinated?: string;
  antiParasiteTreatment?: string;
  dewormingFrequency?: string; // Fréquence de vermifugation
  
  // Specific questions depending on chosen animal type
  catLifestyle?: string;
  catFivFelvTested?: string;
  dogSize?: string;
  dogLeishmaniaProtection?: string;
  dogPurpose?: string;
  equineUsage?: string;
  exoticHabitat?: string;

  // Behavior & Wellbeing
  behaviorTraits?: string[];
  playTimeDaily?: string;

  // Emergency & Night care in Algeria
  emergencyExperience?: string;
  hasFirstAidKit?: string;

  annualBudgetDzd?: string;
  visitFrequency: string;
  consultationType?: string;
  mainChallenges?: string[];
  wilaya: string;
  commune?: string;
  ownerName?: string;
  ownerPhone?: string;
  expectedFeatures: string[];
  userSuggestions?: string;
  vipCode?: string;
  submittedAt?: string;
}

export interface VetAnswers {
  practiceType: string;
  clinicName?: string;
  vetFullName?: string;
  orderRegistrationNumber?: string;
  specialties: string[];
  availableEquipment?: string[];
  wilaya: string;
  commune?: string;
  clinicAddress?: string;
  dailyPatientsCount: string;
  emergencyService?: string;
  nightEmergencyHandling?: string;
  supplyShortageImpact?: string;
  pharmacyStockAvailability?: string;
  surgeryCapacity?: string;
  teleconsultationInterest?: string;
  aiDiagnosisInterest?: string;
  currentTool: string;
  majorChallengesDz?: string[];
  desiredFeatures: string[];
  userSuggestions?: string;
  phoneContact?: string;
  wantsDirectoryListing?: boolean;
  vipPartnerId?: string;
  submittedAt?: string;
}

export interface VetClinic {
  id: string;
  name: string;
  vetName: string;
  wilaya: string;
  city: string;
  phone: string;
  is24h: boolean;
  specialty: string;
  address: string;
  status?: 'active' | 'in_development' | 'partner_pending';
}

export interface AdminLead {
  id: string;
  role: 'owner' | 'vet';
  name: string;
  phone: string;
  email?: string;
  wilaya: string;
  commune?: string;
  petNameOrClinic: string;
  animalTypesOrSpecialties: string[];
  vipCode: string;
  annualBudgetOrPatients?: string;
  challenges: string[];
  expectedFeatures: string[];
  submittedAt: string;
  rawDetails: Record<string, any>;
}

export interface AdoptionPet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'horse' | 'other';
  breed: string;
  age: string;
  gender: 'Mâle' | 'Femelle';
  wilaya: string;
  city: string;
  imageUrl: string;
  description: string;
  isVaccinated: boolean;
  isSterilized: boolean;
  isUrgent?: boolean;
  associationOrOwner: string;
  contactPhone: string;
  publishedDate: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  category: 'nutrition' | 'antiparasitaire' | 'accessoire' | 'hygiene' | 'pharmacie';
  brand: string;
  priceDzd: number;
  oldPriceDzd?: number;
  rating: number;
  imageUrl: string;
  description: string;
  inStock: boolean;
  targetSpecies: string[];
  badge?: string;
}

export interface UserFeedback {
  id: string;
  type: 'suggestion' | 'review' | 'idea' | 'feature_request';
  authorName: string;
  userRole: 'owner' | 'vet' | 'lover';
  wilaya: string;
  rating: number;
  title: string;
  message: string;
  upvotes: number;
  submittedAt: string;
  status?: 'reviewed' | 'planned' | 'in_progress';
}
