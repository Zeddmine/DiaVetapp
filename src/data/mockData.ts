import { PetTypeOption, VetClinic } from '../types';

export const ALGERIAN_WILAYAS = [
  "16 - Alger",
  "31 - Oran",
  "25 - Constantine",
  "23 - Annaba",
  "19 - Sétif",
  "09 - Blida",
  "06 - Béjaïa",
  "15 - Tizi Ouzou",
  "13 - Tlemcen",
  "05 - Batna",
  "35 - Boumerdès",
  "42 - Tipaza",
  "22 - Sidi Bel Abbès",
  "27 - Mostaganem",
  "30 - Ouargla",
  "07 - Biskra",
  "17 - Djelfa",
  "14 - Tiaret",
  "21 - Skikda",
  "24 - Guelma",
  "34 - Bordj Bou Arreridj",
  "47 - Ghardaïa",
  "08 - Béchar",
  "01 - Adrar"
];

export const PET_TYPE_OPTIONS: PetTypeOption[] = [
  {
    id: 'cat',
    nameKey: 'cat',
    icon: '🐈',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'dog',
    nameKey: 'dog',
    icon: '🐕',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'bird',
    nameKey: 'bird',
    icon: '🦜',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'rabbit',
    nameKey: 'rabbit',
    icon: '🐇',
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'farm',
    nameKey: 'farm',
    icon: '🐎',
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'reptile',
    nameKey: 'reptile',
    icon: '🦎',
    image: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&q=80&w=600'
  }
];

export const ANIMAL_SHOWCASE_PHOTOS = {
  cat: [
    { url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=500', label: 'Chat d\'intérieur / Européen' },
    { url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=500', label: 'Chaton joueur' },
    { url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=500', label: 'Siamois / Persan' }
  ],
  dog: [
    { url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=500', label: 'Berger Allemand / Chien de garde' },
    { url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=500', label: 'Golden / Chien de famille' },
    { url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=500', label: 'Chiot / Petit gabarit' }
  ],
  bird: [
    { url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=500', label: 'Canari / Chardonneret (Maknin DZ)' },
    { url: 'https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&q=80&w=500', label: 'Perruche ondulée / Calopsitte' }
  ],
  rabbit: [
    { url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=500', label: 'Lapin nain / Bélier' },
    { url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=500', label: 'Cochon d\'inde / Rongeur' }
  ],
  farm: [
    { url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=500', label: 'Cheval barbe / Pur-sang arabe' },
    { url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=500', label: 'Bovin / Ovin d\'élevage' }
  ],
  reptile: [
    { url: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&q=80&w=500', label: 'Tortue terrestre / Dragon barbu' }
  ]
};

export const NUTRITION_PHOTOS = {
  kibble: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=500',
  homemade: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500',
  vetdiet: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=500',
  mixed: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=500'
};

export const CLINIC_PHOTOS = {
  stethoscope: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=600',
  surgery: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600',
  radiology: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
  hospitalization: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600',
  pharmacy: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=600'
};

export const MOCK_CLINICS: VetClinic[] = [
  {
    id: '1',
    name: 'Clinique Vétérinaire El Biar',
    vetName: 'Dr. Amine Benali',
    wilaya: '16 - Alger',
    city: 'El Biar, Alger',
    phone: '+213 21 92 14 00',
    is24h: true,
    specialty: 'Urgences, Chirurgie & Imagerie',
    address: '14 Rue Ali Bouhadja, El Biar'
  },
  {
    id: '2',
    name: 'Cabinet Vétérinaire Bahia Pets',
    vetName: 'Dr. Sarah Khelifi',
    wilaya: '31 - Oran',
    city: 'Maraval, Oran',
    phone: '+213 41 42 77 10',
    is24h: false,
    specialty: 'Médecine interne féline & canine',
    address: 'Boulevard Millenium, Résidence Les Palmiers'
  },
  {
    id: '3',
    name: 'Centre Hospitalier Vétérinaire Cirta',
    vetName: 'Dr. Yacine Touati',
    wilaya: '25 - Constantine',
    city: 'Belhadj, Constantine',
    phone: '+213 31 88 33 21',
    is24h: true,
    specialty: 'Traumatologie & Soins Intensifs 24/7',
    address: 'Cité Sidi Mabrouk Supérieur'
  },
  {
    id: '4',
    name: 'Cabinet Vétérinaire Seybouse',
    vetName: 'Dr. Lynda Mansouri',
    wilaya: '23 - Annaba',
    city: 'Annaba Centre',
    phone: '+213 38 45 62 19',
    is24h: false,
    specialty: 'Vaccination, Dentisterie & NAC',
    address: 'Cours de la Révolution, Annaba'
  },
  {
    id: '5',
    name: 'Clinique Vétérinaire Mitidja',
    vetName: 'Dr. Karim Meziane',
    wilaya: '09 - Blida',
    city: 'Ouled Yaich, Blida',
    phone: '+213 25 32 89 44',
    is24h: true,
    specialty: 'Urgences & Élevage équin',
    address: 'Route Nationale 1, Blida'
  }
];
