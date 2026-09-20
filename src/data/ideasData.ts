import { UserFeedback } from '../types';

export const INITIAL_COMMUNITY_IDEAS: UserFeedback[] = [
  {
    id: 'idea-1',
    type: 'idea',
    authorName: 'Dr. Mehdi K.',
    userRole: 'vet',
    wilaya: '16 - Alger',
    rating: 5,
    title: 'Pharmacies de garde vétérinaire avec géolocalisation',
    message: 'Il serait formidable d’intégrer les pharmacies ouvertes de nuit qui délivrent des produits vétérinaires d’urgence en Algérie, directement sur la carte.',
    upvotes: 42,
    submittedAt: 'Hier à 18:30',
    status: 'in_progress'
  },
  {
    id: 'idea-2',
    type: 'suggestion',
    authorName: 'Amel B.',
    userRole: 'owner',
    wilaya: '31 - Oran',
    rating: 5,
    title: 'Rappels WhatsApp automatiques en Darija et Français',
    message: 'Pour les personnes âgées ou nos parents qui ont des chiens/chats, recevoir un message audio ou un texte simple sur WhatsApp quand le vaccin rage arrive à expiration !',
    upvotes: 38,
    submittedAt: 'Il y a 2 jours',
    status: 'planned'
  },
  {
    id: 'idea-3',
    type: 'review',
    authorName: 'Karim T.',
    userRole: 'owner',
    wilaya: '09 - Blida',
    rating: 5,
    title: 'Le Pass VIP Fondateur est une superbe idée !',
    message: 'Enfin une vraie initiative moderne pour nos animaux en Algérie. Le carnet de santé numérique va nous éviter de perdre les anciens carnets en carton.',
    upvotes: 29,
    submittedAt: 'Il y a 3 jours',
    status: 'reviewed'
  },
  {
    id: 'idea-4',
    type: 'feature_request',
    authorName: 'Dr. Sarah L.',
    userRole: 'vet',
    wilaya: '25 - Constantine',
    rating: 5,
    title: 'Ordonnancier numérique avec posologies calculées selon le poids',
    message: 'Pour notre exercice quotidien, si DiaVet pouvait calculer automatiquement la dose de doxycycline ou de méloxicam en fonction du poids saisi de l’animal, ce serait un gain de temps inestimable.',
    upvotes: 35,
    submittedAt: 'Cette semaine',
    status: 'planned'
  }
];
