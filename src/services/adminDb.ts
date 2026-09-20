import { AdminLead, OwnerAnswers, VetAnswers } from '../types';
import { syncSubmissionToFirestore, DIAVET_OFFICIAL_EMAIL, OWNER_TARGET_EMAIL } from './firebase';

const ADMIN_DB_KEY = 'diavet_secure_admin_db';

export function generateVipCode(role: 'owner' | 'vet', wilaya: string): string {
  const wilayaCode = wilaya.split(' - ')[0] || 'DZ';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const prefix = role === 'owner' ? 'VIP-DZ' : 'VET-PRO-DZ';
  return `${prefix}-${wilayaCode}-${randomNum}`;
}

export function getAdminLeads(): AdminLead[] {
  try {
    const raw = localStorage.getItem(ADMIN_DB_KEY);
    if (!raw) {
      const initialLeads = getInitialSeedLeads();
      saveAdminLeads(initialLeads);
      return initialLeads;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load admin leads from storage:', e);
    return getInitialSeedLeads();
  }
}

export function saveAdminLeads(leads: AdminLead[]): void {
  try {
    localStorage.setItem(ADMIN_DB_KEY, JSON.stringify(leads));
  } catch (e) {
    console.error('Failed to save admin leads to storage:', e);
  }
}

export function recordOwnerSubmission(answers: OwnerAnswers, vipCode: string): AdminLead {
  const newLead: AdminLead = {
    id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    role: 'owner',
    name: answers.ownerName || 'Propriétaire Anonyme',
    phone: answers.ownerPhone || 'Non renseigné',
    wilaya: answers.wilaya,
    commune: answers.commune || 'Centre',
    petNameOrClinic: answers.petName || 'Compagnon',
    animalTypesOrSpecialties: answers.animalTypes,
    vipCode,
    annualBudgetOrPatients: answers.annualBudgetDzd || 'Non spécifié',
    challenges: answers.mainChallenges || [],
    expectedFeatures: answers.expectedFeatures || [],
    submittedAt: new Date().toLocaleString('fr-DZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    rawDetails: answers
  };

  const existing = getAdminLeads();
  const updated = [newLead, ...existing];
  saveAdminLeads(updated);

  // Sync to Cloud Firestore in background
  syncSubmissionToFirestore({
    id: newLead.id,
    role: 'owner',
    name: newLead.name,
    phone: newLead.phone,
    wilaya: newLead.wilaya,
    commune: newLead.commune,
    petNameOrClinic: newLead.petNameOrClinic,
    animalTypesOrSpecialties: newLead.animalTypesOrSpecialties,
    vipCode: newLead.vipCode,
    annualBudgetOrPatients: newLead.annualBudgetOrPatients,
    challenges: newLead.challenges,
    expectedFeatures: newLead.expectedFeatures,
    submittedAt: newLead.submittedAt,
    rawDetails: answers
  }).catch(err => console.warn('Background Firestore sync caught:', err));

  return newLead;
}

export function recordVetSubmission(answers: VetAnswers, vipCode: string): AdminLead {
  const newLead: AdminLead = {
    id: 'vet-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    role: 'vet',
    name: answers.vetFullName || 'Dr. Vétérinaire',
    phone: answers.phoneContact || 'Non renseigné',
    wilaya: answers.wilaya,
    commune: answers.commune || 'Centre',
    petNameOrClinic: answers.clinicName || answers.practiceType,
    animalTypesOrSpecialties: answers.specialties,
    vipCode,
    annualBudgetOrPatients: answers.dailyPatientsCount,
    challenges: answers.majorChallengesDz || [],
    expectedFeatures: answers.desiredFeatures || [],
    submittedAt: new Date().toLocaleString('fr-DZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    rawDetails: answers
  };

  const existing = getAdminLeads();
  const updated = [newLead, ...existing];
  saveAdminLeads(updated);

  // Sync to Cloud Firestore in background
  syncSubmissionToFirestore({
    id: newLead.id,
    role: 'vet',
    name: newLead.name,
    phone: newLead.phone,
    wilaya: newLead.wilaya,
    commune: newLead.commune,
    petNameOrClinic: newLead.petNameOrClinic,
    animalTypesOrSpecialties: newLead.animalTypesOrSpecialties,
    vipCode: newLead.vipCode,
    annualBudgetOrPatients: newLead.annualBudgetOrPatients,
    challenges: newLead.challenges,
    expectedFeatures: newLead.expectedFeatures,
    submittedAt: newLead.submittedAt,
    rawDetails: answers
  }).catch(err => console.warn('Background Firestore sync caught:', err));

  return newLead;
}

export function generateMailtoForLead(lead: AdminLead): string {
  const subject = encodeURIComponent(`[DiaVet Inscription] Nouveau Membre ${lead.role === 'vet' ? 'Vétérinaire Pro' : 'Propriétaire'} - ${lead.name} (${lead.wilaya})`);
  const body = encodeURIComponent(
    `🔔 NOUVELLE INSCRIPTION DIAVET REÇUE SUR LA BASE CLOUD\n` +
    `====================================================\n\n` +
    `Type: ${lead.role === 'vet' ? '🩺 Docteur Vétérinaire' : '🐾 Propriétaire d\'animaux'}\n` +
    `Nom / Prénom: ${lead.name}\n` +
    `Téléphone DZ: ${lead.phone}\n` +
    `Wilaya: ${lead.wilaya}\n` +
    `Commune: ${lead.commune}\n` +
    `Animal ou Clinique: ${lead.petNameOrClinic}\n` +
    `Espèces / Spécialités: ${(lead.animalTypesOrSpecialties || []).join(', ')}\n` +
    `Code Pass VIP: ${lead.vipCode}\n` +
    `Budget / Patients: ${lead.annualBudgetOrPatients}\n` +
    `Date de soumission: ${lead.submittedAt}\n\n` +
    `Défis en Algérie:\n- ${(lead.challenges || []).join('\n- ')}\n\n` +
    `Besoins prioritaires:\n- ${(lead.expectedFeatures || []).join('\n- ')}\n\n` +
    `====================================================\n` +
    `Enregistré dans Firebase Firestore (ID: gen-lang-client-0335742396)\n` +
    `Email officiel: ${DIAVET_OFFICIAL_EMAIL} -> Boite mail propriétaire: ${OWNER_TARGET_EMAIL}`
  );

  return `mailto:${OWNER_TARGET_EMAIL}?cc=${DIAVET_OFFICIAL_EMAIL}&subject=${subject}&body=${body}`;
}

export function exportLeadsToCsv(leads: AdminLead[]): void {
  const headers = [
    'ID',
    'Rôle',
    'Nom / Prénom',
    'Téléphone DZ',
    'Wilaya',
    'Commune',
    'Animal ou Clinique',
    'Espèces / Spécialités',
    'Code Pass VIP',
    'Budget DZD / Nb Patients',
    'Défis Algérie',
    'Besoins Prioritaires',
    'Date de Soumission'
  ];

  const rows = leads.map(l => [
    `"${l.id}"`,
    `"${l.role === 'owner' ? 'Propriétaire' : 'Vétérinaire'}"`,
    `"${(l.name || '').replace(/"/g, '""')}"`,
    `"${(l.phone || '').replace(/"/g, '""')}"`,
    `"${(l.wilaya || '').replace(/"/g, '""')}"`,
    `"${(l.commune || '').replace(/"/g, '""')}"`,
    `"${(l.petNameOrClinic || '').replace(/"/g, '""')}"`,
    `"${(l.animalTypesOrSpecialties || []).join(', ')}"`,
    `"${l.vipCode}"`,
    `"${(l.annualBudgetOrPatients || '').replace(/"/g, '""')}"`,
    `"${(l.challenges || []).join('; ').replace(/"/g, '""')}"`,
    `"${(l.expectedFeatures || []).join('; ').replace(/"/g, '""')}"`,
    `"${l.submittedAt}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `diavet_leads_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLeadsToJson(leads: AdminLead[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(leads, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `diavet_leads_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function getInitialSeedLeads(): AdminLead[] {
  return [
    {
      id: 'lead-seed-1',
      role: 'owner',
      name: 'Yasmine Boudiaf',
      phone: '0552 14 78 96',
      wilaya: '16 - Alger',
      commune: 'Hydra',
      petNameOrClinic: 'Rocky (Golden Retriever)',
      animalTypesOrSpecialties: ['dog'],
      vipCode: 'VIP-DZ-16-7734',
      annualBudgetOrPatients: '30 000 à 60 000 DZD',
      challenges: [
        'Difficulté à trouver un vétérinaire de garde ou urgence la nuit/weekend',
        'Pénurie ou indisponibilité de certains vaccins spécifiques en Algérie'
      ],
      expectedFeatures: [
        'Carnet de santé numérique officiel sur smartphone',
        'Rappels automatiques de vaccins & vermifuges par WhatsApp / SMS',
        'Accès prioritaire aux urgences vétérinaires 24h/24'
      ],
      submittedAt: '18/09/2026 14:22',
      rawDetails: {}
    },
    {
      id: 'lead-seed-2',
      role: 'vet',
      name: 'Dr. Amine Zerrouki',
      phone: '0661 25 89 30',
      wilaya: '31 - Oran',
      commune: 'Akid Lotfi',
      petNameOrClinic: 'Clinique Vétérinaire El Bahia',
      animalTypesOrSpecialties: ['Canine & Féline', 'Chirurgie des tissus mous'],
      vipCode: 'VET-PRO-DZ-31-4198',
      annualBudgetOrPatients: '15 à 30 patients/jour',
      challenges: [
        'Gestion difficile des urgences nocturnes et gardes non régulées',
        'Ruptures fréquentes de certains médicaments et anesthésiques en Algérie'
      ],
      expectedFeatures: [
        'Dossier médical patient complet (historique, vaccins, radios)',
        'Ordonnances informatisées aux normes algériennes'
      ],
      submittedAt: '18/09/2026 16:45',
      rawDetails: {}
    }
  ];
}
