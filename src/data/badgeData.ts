import { Badge, HealthMilestone, UserProfile } from '../types';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'pioneer',
    title: 'Pionnier DiaVet',
    description: 'A complété le diagnostic initial et créé le profil de son compagnon.',
    icon: '🚀',
    category: 'questionnaire',
    tier: 'bronze',
    isUnlocked: false,
    requirement: 'Finaliser le questionnaire propriétaire'
  },
  {
    id: 'ambassador',
    title: 'Ambassadeur DiaVet',
    description: 'A partagé son lien ou code de parrainage avec un ami propriétaire.',
    icon: '🤝',
    category: 'referral',
    tier: 'silver',
    isUnlocked: false,
    requirement: 'Parrainer au moins 1 ami propriétaire en Algérie'
  },
  {
    id: 'vaccine-shield',
    title: 'Protecteur Vaccinal',
    description: 'A validé le jalon de vaccination à jour dans le carnet numérique.',
    icon: '🛡️',
    category: 'milestones',
    tier: 'bronze',
    isUnlocked: false,
    requirement: 'Valider le jalon vaccinal'
  },
  {
    id: 'health-champion',
    title: 'Champion de Santé',
    description: 'A atteint au moins 3 jalons de santé préventive pour son animal.',
    icon: '🏆',
    category: 'milestones',
    tier: 'gold',
    isUnlocked: false,
    progress: 0,
    maxProgress: 3,
    requirement: 'Accomplir au moins 3 jalons de santé'
  },
  {
    id: 'master-carer',
    title: 'Maître Exemplaire',
    description: 'A complété l\'intégralité des jalons de santé préventive.',
    icon: '👑',
    category: 'milestones',
    tier: 'platinum',
    isUnlocked: false,
    progress: 0,
    maxProgress: 5,
    requirement: 'Valider les 5 jalons de santé de son compagnon'
  },
  {
    id: 'knowledge-seeker',
    title: 'Lecteur Éclairé',
    description: 'A sauvegardé des articles vétérinaires dans sa liste de favoris.',
    icon: '📚',
    category: 'community',
    tier: 'silver',
    isUnlocked: false,
    progress: 0,
    maxProgress: 2,
    requirement: 'Mettre en favori au moins 2 articles de conseils'
  }
];

export const INITIAL_MILESTONES: HealthMilestone[] = [
  {
    id: 'm-vaccine',
    title: 'Vaccination Antirabique & Combiné',
    description: 'Carnet vaccinal à jour avec rappel annuel certifié.',
    category: 'vaccine',
    isCompleted: true,
    completedAt: '10 Nov 2025',
    points: 100
  },
  {
    id: 'm-checkup',
    title: 'Bilan Clinique Annuel',
    description: 'Visite médicale complète de prévention chez le vétérinaire.',
    category: 'checkup',
    isCompleted: true,
    completedAt: '10 Nov 2025',
    points: 100
  },
  {
    id: 'm-parasite',
    title: 'Traitement Antiparasitaire Externe & Interne',
    description: 'Administration du vermifuge et protection tiques/puces.',
    category: 'care',
    isCompleted: false,
    points: 80
  },
  {
    id: 'm-weight',
    title: 'Suivi de la Courbe de Poids',
    description: 'Pesée trimestrielle et ajustement de la ration calorique.',
    category: 'nutrition',
    isCompleted: false,
    points: 75
  },
  {
    id: 'm-dental',
    title: 'Hygiène Bucco-Dentaire',
    description: 'Contrôle de l\'état des gencives et détartrage préventif.',
    category: 'care',
    isCompleted: false,
    points: 90
  }
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Karim Mansouri',
  email: 'karim.m@gmail.com',
  phone: '+213 550 12 34 56',
  wilaya: '16 - Alger',
  joinedDate: 'Septembre 2026',
  referralCode: 'DIAVET-KARIM16',
  referralCount: 0,
  healthPoints: 350,
  petName: 'Max',
  petType: 'Chien (Golden Retriever)'
};
