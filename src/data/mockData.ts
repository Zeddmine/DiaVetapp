import { PetTypeOption, VetClinic } from '../types';

export const ALGERIAN_WILAYAS = [
  "01 - Adrar",
  "02 - Chlef",
  "03 - Laghouat",
  "04 - Oum El Bouaghi",
  "05 - Batna",
  "06 - Béjaïa",
  "07 - Biskra",
  "08 - Béchar",
  "09 - Blida",
  "10 - Bouira",
  "11 - Tamanrasset",
  "12 - Tébessa",
  "13 - Tlemcen",
  "14 - Tiaret",
  "15 - Tizi Ouzou",
  "16 - Alger",
  "17 - Djelfa",
  "18 - Jijel",
  "19 - Sétif",
  "20 - Saïda",
  "21 - Skikda",
  "22 - Sidi Bel Abbès",
  "23 - Annaba",
  "24 - Guelma",
  "25 - Constantine",
  "26 - Médéa",
  "27 - Mostaganem",
  "28 - M'Sila",
  "29 - Mascara",
  "30 - Ouargla",
  "31 - Oran",
  "32 - El Bayadh",
  "33 - Illizi",
  "34 - Bordj Bou Arreridj",
  "35 - Boumerdès",
  "36 - El Tarf",
  "37 - Tindouf",
  "38 - Tissemsilt",
  "39 - El Oued",
  "40 - Khenchela",
  "41 - Souk Ahras",
  "42 - Tipaza",
  "43 - Mila",
  "44 - Aïn Defla",
  "45 - Naâma",
  "46 - Aïn Témouchent",
  "47 - Ghardaïa",
  "48 - Relizane",
  "49 - Timimoun",
  "50 - Bordj Badji Mokhtar",
  "51 - Ouled Djellal",
  "52 - Béni Abbès",
  "53 - In Salah",
  "54 - In Guezzam",
  "55 - Touggourt",
  "56 - Djanet",
  "57 - El M'Ghair",
  "58 - El Meniaa"
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
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&q=80&w=600'
  ],
  dog: [
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=600'
  ],
  bird: [
    'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=600'
  ],
  rabbit: [
    'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600'
  ],
  farm: [
    'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=600'
  ],
  reptile: [
    'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&q=80&w=600'
  ]
};

export const NUTRITION_PHOTOS = {
  kibble: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=600',
  homemade: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
  mixed: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=600',
  vetdiet: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?auto=format&fit=crop&q=80&w=600',
  
  // Specific diets tailored per animal species
  cat: {
    kibble: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600',
    wet: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=600',
    homemade: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    vetdiet: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=600'
  },
  dog: {
    kibble: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=600',
    wet: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=600',
    homemade: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&q=80&w=600',
    vetdiet: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?auto=format&fit=crop&q=80&w=600'
  },
  bird: {
    seeds: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600',
    fresh: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=600',
    patee: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=600',
    minerals: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=600'
  },
  rabbit: {
    hay: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&q=80&w=600',
    pellets: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600',
    greens: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
    mix: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600'
  },
  farm: {
    hay: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=600',
    grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    pellets: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=600',
    salt: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=600'
  },
  reptile: {
    insects: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&q=80&w=600',
    greens: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
    pellets: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=600',
    calcium: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=600'
  }
};

export const CLINIC_PHOTOS = Object.assign(
  [
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600'
  ],
  {
    stethoscope: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
    surgery: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    care: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600'
  }
);

export const INITIAL_CLINICS: VetClinic[] = [
  {
    id: '1',
    name: 'Clinique Vétérinaire El Biar',
    vetName: 'Dr. Mehdi Bouzid',
    wilaya: '16 - Alger',
    city: 'El Biar, Alger',
    phone: '+213 23 38 12 45',
    is24h: true,
    specialty: 'Chirurgie générale, Imagerie & Urgences 24/7',
    address: '12 Boulevard Bougara, El Biar'
  },
  {
    id: '2',
    name: 'Cabinet Vétérinaire Bahia',
    vetName: 'Dr. Yasmine Larbi',
    wilaya: '31 - Oran',
    city: 'Akid Lotfi, Oran',
    phone: '+213 41 53 77 90',
    is24h: false,
    specialty: 'Dermatologie, Nutrition canine & Féline',
    address: 'Résidence El Bahia, Akid Lotfi'
  },
  {
    id: '3',
    name: 'Centre Vétérinaire Cirta',
    vetName: 'Dr. Sofiane Benabdallah',
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
  },
  {
    id: '6',
    name: 'Centre Vétérinaire des Hauts Plateaux',
    vetName: 'Dr. Nabil Brahimi',
    wilaya: '19 - Sétif',
    city: 'Sétif Centre',
    phone: '+213 36 84 11 02',
    is24h: true,
    specialty: 'Urgences, Reproduction & Petits Animaux',
    address: 'Boulevard du 8 Mai 1945, Sétif'
  },
  {
    id: '7',
    name: 'Clinique Vétérinaire Gouraya',
    vetName: 'Dr. Farida Ouali',
    wilaya: '06 - Béjaïa',
    city: 'Béjaïa Ville',
    phone: '+213 34 21 55 80',
    is24h: false,
    specialty: 'Médecine interne féline, Échographie & Soins',
    address: 'Boulevard Krim Belkacem, Béjaïa'
  },
  {
    id: '8',
    name: 'Cabinet Vétérinaire Oasis',
    vetName: 'Dr. Mourad Saadi',
    wilaya: '30 - Ouargla',
    city: 'Ouargla Centre',
    phone: '+213 29 76 43 12',
    is24h: true,
    specialty: 'Faune saharienne, Chameaux & Chiens de garde',
    address: 'Avenue de la République, Ouargla'
  }
];

export const MOCK_CLINICS = INITIAL_CLINICS;
