import { MarketplaceItem } from '../types';

export const INITIAL_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'prod-1',
    name: 'Croquettes Royal Canin Sterilised 37 (4kg)',
    category: 'nutrition',
    brand: 'Royal Canin',
    priceDzd: 6800,
    oldPriceDzd: 7400,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=800',
    description: 'Alimentation complète pour chats adultes stérilisés (de 1 à 7 ans). Contrôle du poids et santé urinaire renforcée.',
    inStock: true,
    targetSpecies: ['cat'],
    badge: 'Best-Seller DZ'
  },
  {
    id: 'prod-2',
    name: 'Collier Antiparasitaire Seresto Grand Chien (>8kg)',
    category: 'antiparasitaire',
    brand: 'Elanco',
    priceDzd: 8500,
    oldPriceDzd: 9200,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800',
    description: 'Protection continue 7 à 8 mois contre puces, tiques et phlébotomes (vecteur de la leishmaniose en Algérie). Résistant à l’eau.',
    inStock: true,
    targetSpecies: ['dog'],
    badge: 'Essentiel Prévention'
  },
  {
    id: 'prod-3',
    name: 'Pipettes Frontline Combo Spot-on Chat (Boîte de 3)',
    category: 'antiparasitaire',
    brand: 'Boehringer Ingelheim',
    priceDzd: 4200,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800',
    description: 'Élimine les puces, les tiques et les poux broyeurs. Empêche la contamination de l’habitat par les œufs et larves.',
    inStock: true,
    targetSpecies: ['cat']
  },
  {
    id: 'prod-4',
    name: 'Pro Plan Medium Puppy OptiStart Poulet (12kg)',
    category: 'nutrition',
    brand: 'Purina Pro Plan',
    priceDzd: 15500,
    oldPriceDzd: 16800,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&q=80&w=800',
    description: 'Riche en colostrum pour renforcer les défenses immunitaires des chiots de taille moyenne en pleine croissance.',
    inStock: true,
    targetSpecies: ['dog'],
    badge: 'Recommandé Vétérinaires'
  },
  {
    id: 'prod-5',
    name: 'Caisse de Transport Homologuée IATA Voyage Skudo 3',
    category: 'accessoire',
    brand: 'MPS Italia',
    priceDzd: 9500,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
    description: 'Conforme aux normes des compagnies aériennes Air Algérie et maritimes Algérie Ferries. Fermeture sécurisée métal.',
    inStock: true,
    targetSpecies: ['dog', 'cat'],
    badge: 'Homologué Voyage'
  },
  {
    id: 'prod-6',
    name: 'Litière Végétale Ultra Absorbante Biodégradable 10L',
    category: 'hygiene',
    brand: 'EcoVet DZ',
    priceDzd: 1800,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800',
    description: 'Fibres naturelles non poussiéreuses, neutralise instantanément les odeurs. Idéal pour les appartements sans balcon.',
    inStock: true,
    targetSpecies: ['cat']
  },
  {
    id: 'prod-7',
    name: 'Arbre à Chat Multi-Plateformes avec Griffoirs Sisal',
    category: 'accessoire',
    brand: 'CatLovers DZ',
    priceDzd: 12500,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800',
    description: 'Hauteur 140cm, plateformes douces et cachette intégrée pour stimuler le comportement de jeu et grattage.',
    inStock: true,
    targetSpecies: ['cat']
  },
  {
    id: 'prod-8',
    name: 'Shampoing Hypoallergénique Doux Chien & Chat (250ml)',
    category: 'hygiene',
    brand: 'DermatoVet',
    priceDzd: 2400,
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
    description: 'À l’aloe vera et extrait d’avoine, apaise les démangeaisons et respecte le pH neutre de l’épiderme animal.',
    inStock: true,
    targetSpecies: ['dog', 'cat']
  }
];

export interface UpcomingService {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  icon: string;
  availableDate: string;
}

export const UPCOMING_SERVICES: UpcomingService[] = [
  {
    id: 'srv-1',
    title: 'Toilettage Médicalisé & Bien-Être à Domicile',
    subtitle: 'Alger, Oran, Blida & Constantine',
    badge: 'Prochainement T2 2026',
    description: 'Des toiletteurs certifiés équipés de matériel de stérilisation vétérinaire se déplacent chez vous pour tondre, laver et soigner votre compagnon sans stress.',
    icon: '✂️',
    availableDate: 'Juin 2026'
  },
  {
    id: 'srv-2',
    title: 'Pension Canine & Féline Partenaire Agréée',
    subtitle: 'Grands espaces sécurisés & suivi vétérinaire',
    badge: 'En validation sanitaire',
    description: 'Pour vos voyages ou vacances : confiez votre animal à des structures vérifiées par DiaVet avec surveillance caméra 24h/24 et visites vétérinaires.',
    icon: '🏡',
    availableDate: 'Été 2026'
  },
  {
    id: 'srv-3',
    title: 'Ambulance Vétérinaire & Transport Médicalisé',
    subtitle: 'Premiers secours & transport vers cliniques 24/7',
    badge: 'Programme Pilote',
    description: 'Véhicules adaptés pour le transport d’urgence des animaux blessés ou malades avec kit d’oxygénation et brancards spécialisés.',
    icon: '🚑',
    availableDate: 'Automne 2026'
  },
  {
    id: 'srv-4',
    title: 'Télé-Conseil Vétérinaire d’Urgence',
    subtitle: 'Tri médical rapide avant déplacement',
    badge: 'Bêta fermée',
    description: 'En cas de doute la nuit, échangez en direct par messagerie sécurisée avec un praticien pour évaluer la gravité avant de vous rendre en clinique.',
    icon: '💬',
    availableDate: 'Mai 2026'
  }
];
