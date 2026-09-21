import { Language } from '../types';

export type FAQCategory = 'all' | 'general' | 'owner' | 'vet' | 'vip' | 'security';

export interface FAQItem {
  id: string;
  category: 'general' | 'owner' | 'vet' | 'vip' | 'security';
  question: {
    fr: string;
    ar: string;
    en: string;
  };
  answer: {
    fr: string;
    ar: string;
    en: string;
  };
  badge?: {
    fr: string;
    ar: string;
    en: string;
  };
}

export const FAQ_CATEGORIES: { id: FAQCategory; label: Record<Language, string>; icon: string }[] = [
  {
    id: 'all',
    label: {
      fr: 'Toutes les questions',
      ar: 'جميع الأسئلة',
      en: 'All Questions'
    },
    icon: '✨'
  },
  {
    id: 'general',
    label: {
      fr: 'Général & Algérie',
      ar: 'عام والجزائر',
      en: 'General & Algeria'
    },
    icon: '🇩🇿'
  },
  {
    id: 'owner',
    label: {
      fr: 'Propriétaires & Carnet',
      ar: 'المربون ودفتر الصحة',
      en: 'Pet Owners & Records'
    },
    icon: '🐾'
  },
  {
    id: 'vet',
    label: {
      fr: 'Vétérinaires & Cabinets',
      ar: 'الأطباء والعيادات',
      en: 'Vets & Clinics'
    },
    icon: '🩺'
  },
  {
    id: 'vip',
    label: {
      fr: 'Pass VIP & Badges',
      ar: 'بطاقة VIP والنقاط',
      en: 'VIP Pass & Badges'
    },
    icon: '⭐'
  },
  {
    id: 'security',
    label: {
      fr: 'Sécurité & Données',
      ar: 'الأمان والخصوصية',
      en: 'Security & Privacy'
    },
    icon: '🔒'
  }
];

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: {
      fr: "Qu'est-ce que DiaVet et comment fonctionne la plateforme en Algérie ?",
      ar: "ما هي منصة DiaVet وكيف تعمل في الجزائر؟",
      en: "What is DiaVet and how does the platform work in Algeria?"
    },
    answer: {
      fr: "DiaVet est le premier écosystème numérique unifié pour la santé animale en Algérie. La plateforme connecte les propriétaires d'animaux (chiens, chats, NAC, cheptel) aux docteurs vétérinaires certifiés dans les 58 Wilayas. Elle regroupe un carnet de santé digital, un annuaire géolocalisé des cliniques, une bourse d'adoption responsable et une boutique vétérinaire.",
      ar: "تعد DiaVet أول منظومة رقمية موحدة لصحة ورعاية الحيوان في الجزائر. تربط المنصة بين أصحاب ومربي الحيوانات (كلاب، قطط، طيور ومواشي) ونخبة الأطباء البيطريين المعتمدين عبر الـ 58 ولاية، وتوفر دفتراً صحياً رقمياً، دليلاً للعيادات والمناوبات، قسماً للتبني ومتجراً للمستلزمات البيطرية.",
      en: "DiaVet is the first unified digital animal health ecosystem in Algeria. It connects pet and livestock owners with certified veterinarians across all 58 Wilayas, featuring digital health records, a geolocated clinic directory, responsible pet adoption, and a veterinary marketplace."
    },
    badge: {
      fr: "Officiel DZ 🇩🇿",
      ar: "رسمي بالجزائر 🇩🇿",
      en: "Official DZ 🇩🇿"
    }
  },
  {
    id: 'faq-2',
    category: 'general',
    question: {
      fr: "DiaVet est-il disponible dans l'ensemble des 58 Wilayas d'Algérie ?",
      ar: "هل تغطي خدمات DiaVet جميع الولايات الـ 58 في الجزائر؟",
      en: "Is DiaVet available in all 58 Wilayas of Algeria?"
    },
    answer: {
      fr: "Oui, DiaVet est pensé pour l'ensemble du territoire national, d'Alger à Tamanrasset en passant par Oran, Constantine, Annaba, Sétif et Ouargla. L'annuaire interactif et les fonctionnalités du carnet sont accessibles partout, 24h/24 et 7j/7.",
      ar: "نعم، تم تصميم DiaVet ليغطي كامل التراب الوطني، من العاصمة إلى تمنراست، مروراً بوهران، قسنطينة، عنابة، سطيف وورقلة. يمكنك الوصول إلى دليل العيادات ودفتر التلقيحات في أي وقت على مدار 24/7.",
      en: "Yes, DiaVet is built for the entire national territory, from Algiers to Tamanrasset, Oran, Constantine, Annaba, Setif, and Ouargla. The interactive clinic directory and health records are accessible 24/7."
    }
  },
  {
    id: 'faq-3',
    category: 'owner',
    question: {
      fr: "Comment fonctionne le Carnet de Santé Numérique pour mon animal ?",
      ar: "كيف يعمل دفتر الصحة الرقمي لحيواني الأليف؟",
      en: "How does the Digital Health Record work for my pet?"
    },
    answer: {
      fr: "Dès que vous renseignez les informations de votre animal (espèce, race, âge, poids), son profil génère un carnet digitalisé avec rappels automatiques des vaccins (ex: Rage, CHPL, Typhus), suivi des traitements antiparasitaires et historique des consultations téléchargeable pour votre vétérinaire.",
      ar: "بمجرد إدخال بيانات حيوانك (النوع، السلالة، العمر، الوزن)، يتم إنشاء سجل رقمي شامل مع تذكيرات تلقائية بمواعيد التلقيحات الدورية (داء الكلب، CHPL، التيفوس)، ومتابعة مضادات الطفيليات وتاريخ الزيارات الطبية.",
      en: "Once you enter your pet's details (species, breed, age, weight), a digital medical record is generated with automatic vaccination reminders (e.g., Rabies, CHPL, Typhus), antiparasitic tracking, and consultation history shareable with your vet."
    },
    badge: {
      fr: "Gratuit",
      ar: "مجاني",
      en: "Free"
    }
  },
  {
    id: 'faq-4',
    category: 'owner',
    question: {
      fr: "Puis-je enregistrer plusieurs animaux sur un même compte ?",
      ar: "هل يمكنني تسجيل عدة حيوانات على حساب واحد؟",
      en: "Can I manage multiple pets on a single account?"
    },
    answer: {
      fr: "Absolument. Vous pouvez ajouter autant de compagnons que vous le souhaitez (chats, chiens, lapins, etc.) et basculer facilement entre leurs profils médicaux respectifs dans votre Espace Propriétaire.",
      ar: "بالتأكيد. يمكنك إضافة ومتابعة عدة حيوانات (قطط، كلاب، طيور، إلخ) والتبديل بسهولة بين ملفاتهم الصحية ضمن فضاء المربي الخاص بك.",
      en: "Absolutely. You can add as many pets as you like (cats, dogs, rabbits, etc.) and seamlessly switch between their medical profiles in your Owner Portal."
    }
  },
  {
    id: 'faq-5',
    category: 'vet',
    question: {
      fr: "Comment les docteurs vétérinaires peuvent-ils s'inscrire et certifier leur clinique ?",
      ar: "كيف يمكن للأطباء البيطريين التسجيل واعتماد عياداتهم؟",
      en: "How can licensed veterinarians register and verify their clinics?"
    },
    answer: {
      fr: "Les praticiens titulaires d'un diplôme d'État en médecine vétérinaire peuvent remplir le questionnaire dédié. Après vérification, leur cabinet apparaît dans l'Annuaire Officiel des 58 Wilayas avec le badge 'Vétérinaire Agréé DiaVet' et un accès aux outils cliniques de gestion.",
      ar: "يمكن للأطباء الحائزين على شهادة الدكتوراه في الطب البيطري التسجيل عبر استبيان الشريك المهني. بعد التحقق، تظهر عيادتهم في الدليل الرسمي مع شارة 'طبيب معتمد DiaVet' وإمكانية الوصول لأدوات التسيير السريري.",
      en: "Licensed veterinarians holding a state diploma can register through the dedicated professional portal. Once verified, their clinic appears in the Official 58 Wilayas Directory with the 'DiaVet Certified Partner' badge and full clinic software tools."
    },
    badge: {
      fr: "Partenaires Pro 🩺",
      ar: "للعيادات الشريكة 🩺",
      en: "Pro Partner 🩺"
    }
  },
  {
    id: 'faq-6',
    category: 'vet',
    question: {
      fr: "Quels outils sont mis à disposition des cliniques vétérinaires ?",
      ar: "ما هي الأدوات المتاحة للعيادات والمراكز البيطرية؟",
      en: "What software tools are available for veterinary practices?"
    },
    answer: {
      fr: "DiaVet propose un module de gestion des dossiers patients, l'édition d'ordonnances sécurisées, le planning des consultations, la gestion des stocks de médicaments vétérinaires et une synchronisation instantanée avec le carnet du propriétaire.",
      ar: "توفر منصة DiaVet وحدة متكاملة لإدارة ملفات المرضى، تحرير الوصفات الطبية الإلكترونية، جدول المواعيد، تسيير مخزون الأدوية والمستلزمات، والتزامن الفوري مع دفاتر المربين.",
      en: "DiaVet offers patient record management, secure digital prescription generation, appointment scheduling, veterinary medicine inventory tracking, and real-time synchronization with owners' digital records."
    }
  },
  {
    id: 'faq-7',
    category: 'vip',
    question: {
      fr: "Qu'est-ce que le Pass VIP DiaVet et comment débloquer des points d'honneur ?",
      ar: "ما هي بطاقة DiaVet VIP وكيف أحصل على نقاط الشرف والخصومات؟",
      en: "What is the DiaVet VIP Pass and how do I earn honor points?"
    },
    answer: {
      fr: "Le Pass VIP récompense les membres fondateurs et les propriétaires engagés. En remplissant le questionnaire initial ou en recommandant DiaVet, vous recevez votre Code VIP unique, débloquez des points d'honneur et bénéficiez de réductions exclusives chez nos cliniques et partenaires en Algérie.",
      ar: "تمنح بطاقة VIP للأعضاء المؤسسين والمربين الملتزمين. بمجرد إكمال الاستبيان التأسيسي أو دعوة أصدقائك، تحصل على رمز VIP رسمي، نقاط شرف، وأولويات وخصومات لدى العيادات والشركاء في الجزائر.",
      en: "The VIP Pass rewards founding members and responsible pet owners. By completing the initial survey or inviting friends, you receive a unique VIP Code, unlock honor points, and gain exclusive advantages with partner clinics and suppliers across Algeria."
    },
    badge: {
      fr: "Avantage Exclusif ⭐",
      ar: "ميزة حصرية ⭐",
      en: "Exclusive ⭐"
    }
  },
  {
    id: 'faq-8',
    category: 'security',
    question: {
      fr: "Mes données personnelles et celles de mes animaux sont-elles protégées ?",
      ar: "هل بياناتي الشخصية وبيانات حيواناتي محمية ومؤمنة؟",
      en: "Are my personal and animal health data secure and confidential?"
    },
    answer: {
      fr: "Oui, la sécurité est au cœur de DiaVet. Vos données sont sauvegardées sur une base cloud chiffrée avec règles de sécurité strictes. Aucune donnée médicale n'est revendue à des tiers, et vous gardez le contrôle total sur les accès accordés à vos vétérinaires.",
      ar: "نعم، الأمان والخصوصية هما ركيزتنا الأساسية. بياناتك مشفرة ومحفوظة وفق معايير سحابية آمنة. لا يتم بيع أي بيانات طبية لأي طرف ثالث، وتملك كامل التحكم في مشاركتها مع طبيبك المعالج.",
      en: "Yes, security and privacy are paramount. Your data is encrypted and securely stored in cloud databases with strict access rules. Medical data is never sold, and you retain total control over permissions granted to your vets."
    }
  }
];
