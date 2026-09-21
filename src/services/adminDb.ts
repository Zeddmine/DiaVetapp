import { AdminLead, OwnerAnswers, VetAnswers, UserProfile } from '../types';
import { syncSubmissionToFirestore, DIAVET_OFFICIAL_EMAIL, OWNER_TARGET_EMAIL } from './firebase';
import { autoSyncLatestExcelToDrive } from './googleDrive';

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
  // Format pet details nicely for Excel, showing interior/exterior for cats and breed
  const petsSummary = (answers.pets && answers.pets.length > 0)
    ? answers.pets.map(p => {
        let details: string[] = [];
        if (p.breed) details.push(p.breed);
        if (p.catLifestyle) {
          details.push(p.catLifestyle === 'interieur' ? "Chat d'intérieur" : p.catLifestyle === 'exterieur' ? "Chat d'extérieur" : "Semi-liberté");
        }
        if (p.dogSize) details.push(`Gabarit ${p.dogSize}`);
        if (p.birdSpecies) details.push(p.birdSpecies);
        const detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';
        return `${p.name || 'Sans-nom'} [${p.animalType}]${detailsStr}`;
      }).join(' | ')
    : answers.petName || 'Compagnon';

  const newLead: AdminLead = {
    id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    role: 'owner',
    name: answers.ownerName || 'Propriétaire Anonyme',
    phone: answers.ownerPhone || 'Non renseigné',
    wilaya: answers.wilaya,
    commune: answers.commune || 'Centre',
    petNameOrClinic: petsSummary,
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

  // Auto-sync full Excel workbook to Google Drive on every new registration
  autoSyncLatestExcelToDrive(getExcelWorkbookHtml(updated)).catch(err => console.warn('Auto Excel Drive sync caught:', err));

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

  // Auto-sync full Excel workbook to Google Drive on every new registration
  autoSyncLatestExcelToDrive(getExcelWorkbookHtml(updated)).catch(err => console.warn('Auto Excel Drive sync caught:', err));

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
    `Enregistré dans le Registre Cloud DiaVet Santé Animale Algérie\n` +
    `Email officiel: ${DIAVET_OFFICIAL_EMAIL}`
  );

  return `mailto:${DIAVET_OFFICIAL_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * Generates an automated HTML auto-invoicing / billing email template for veterinarians
 * after a consultation lead or registration submission.
 * Uses dynamic form data and official branding without any hardcoded developer credentials.
 */
export function generateVetAutoInvoiceEmailHtml(
  leadData: Partial<AdminLead> | Partial<VetAnswers> | Record<string, any>,
  options?: {
    officialEmail?: string;
    currency?: string;
    platformName?: string;
  }
): string {
  const platform = options?.platformName || 'DiaVet Algérie Santé Animale';
  const officialEmail = options?.officialEmail || DIAVET_OFFICIAL_EMAIL;
  const currency = options?.currency || 'DZD';

  // Extract vet & clinic dynamic details safely from various form submission shapes
  const vetName = leadData.vetFullName || leadData.name || leadData.rawDetails?.vetFullName || 'Dr. Vétérinaire Agréé';
  const clinicName = leadData.clinicName || leadData.petNameOrClinic || leadData.rawDetails?.clinicName || 'Cabinet Vétérinaire';
  const orderNumber = leadData.orderRegistrationNumber || leadData.rawDetails?.orderRegistrationNumber || leadData.rawDetails?.orderNumber || 'ONMV-DZ-VALIDÉ';
  const phone = leadData.phoneContact || leadData.phone || leadData.rawDetails?.phoneContact || 'Non spécifié';
  const email = leadData.email || leadData.rawDetails?.email || 'Inscrit via Plateforme';
  const wilaya = leadData.wilaya || leadData.rawDetails?.wilaya || 'Algérie';
  const commune = leadData.commune || leadData.rawDetails?.commune || '';
  const location = commune ? `${commune}, ${wilaya}` : wilaya;

  const vipCode = leadData.vipCode || leadData.vipPartnerId || leadData.rawDetails?.vipCode || `VET-PRO-DZ-${Math.floor(1000 + Math.random() * 9000)}`;
  const submittedAt = leadData.submittedAt || new Date().toLocaleString('fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const invoiceNumber = `FACT-AUT-${vipCode.replace(/[^A-Z0-9]/gi, '')}-${Date.now().toString().slice(-6)}`;

  const specialtiesList: string[] = Array.isArray(leadData.specialties)
    ? leadData.specialties
    : Array.isArray(leadData.animalTypesOrSpecialties)
      ? leadData.animalTypesOrSpecialties
      : ['Pratique Vétérinaire Générale', 'Consultation & Urgences'];

  const patientsVolume = leadData.dailyPatientsCount || leadData.annualBudgetOrPatients || leadData.rawDetails?.dailyPatientsCount || 'Patientèle Active DZ';

  return `
<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auto-Facture & Validation Vétérinaire - ${platform}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 20px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="650" border="0" cellspacing="0" cellpadding="0" style="max-width: 650px; background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%); padding: 30px 25px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #ffffff; padding: 10px 18px; border-radius: 12px; margin-bottom: 12px; font-weight: 800; color: #047857; font-size: 20px; letter-spacing: -0.5px;">
                      🩺 ${platform}
                    </div>
                    <h1 style="margin: 8px 0 4px 0; color: #ffffff; font-size: 22px; font-weight: 700; line-height: 1.3;">
                      Attestation d'Auto-Facturation & Validation Pro
                    </h1>
                    <p style="margin: 0; color: #a7f3d0; font-size: 13px; font-weight: 500;">
                      Reçu officiel automatique suite au dépôt de lead consultation vétérinaire
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notice Badge -->
          <tr>
            <td style="padding: 20px 25px 10px 25px;">
              <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 10px; padding: 14px 18px; text-align: center;">
                <span style="color: #34d399; font-weight: 700; font-size: 14px;">✓ Dépôt de Lead / Consultation Confirmé</span>
                <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">
                  Ce document certifie la prise en compte de vos informations professionnelles dans le registre officiel des praticiens.
                </p>
              </div>
            </td>
          </tr>

          <!-- Invoice Details Grid -->
          <tr>
            <td style="padding: 15px 25px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 12px; border: 1px solid #334155; padding: 16px;">
                <tr>
                  <td width="50%" valign="top" style="padding: 6px 10px; border-right: 1px solid #334155;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Référence Facture</div>
                    <div style="font-size: 14px; color: #10b981; font-weight: 800; margin-top: 2px;">${invoiceNumber}</div>
                    
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-top: 12px;">Date & Heure</div>
                    <div style="font-size: 13px; color: #f1f5f9; font-weight: 600; margin-top: 2px;">${submittedAt}</div>
                  </td>
                  <td width="50%" valign="top" style="padding: 6px 10px 6px 20px;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Pass Partenaire VIP</div>
                    <div style="font-size: 14px; color: #fbbf24; font-weight: 800; margin-top: 2px;">${vipCode}</div>
                    
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-top: 12px;">Statut Paiement</div>
                    <div style="font-size: 13px; color: #34d399; font-weight: 700; margin-top: 2px;">Acquitté / Offert (Partenaire Fondateur)</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Vet & Practice Info -->
          <tr>
            <td style="padding: 10px 25px;">
              <h2 style="font-size: 15px; color: #38bdf8; margin: 0 0 12px 0; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 8px;">
                👨‍⚕️ Informations du Praticien & Cabinet
              </h2>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; line-height: 1.6;">
                <tr>
                  <td width="40%" style="color: #94a3b8; padding: 4px 0;">Nom du Docteur:</td>
                  <td width="60%" style="color: #ffffff; font-weight: 700; padding: 4px 0;">${vetName}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; padding: 4px 0;">Clinique / Cabinet:</td>
                  <td style="color: #ffffff; font-weight: 600; padding: 4px 0;">${clinicName}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; padding: 4px 0;">N° Ordre Vétérinaire (ONMV):</td>
                  <td style="color: #38bdf8; font-weight: 700; padding: 4px 0;">${orderNumber}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; padding: 4px 0;">Téléphone DZ:</td>
                  <td style="color: #ffffff; font-weight: 600; padding: 4px 0;">${phone}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; padding: 4px 0;">Email de Contact:</td>
                  <td style="color: #ffffff; font-weight: 600; padding: 4px 0;">${email}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; padding: 4px 0;">Wilaya / Commune:</td>
                  <td style="color: #ffffff; font-weight: 600; padding: 4px 0;">${location}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Services / Package Table -->
          <tr>
            <td style="padding: 15px 25px;">
              <h2 style="font-size: 15px; color: #38bdf8; margin: 0 0 12px 0; font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 8px;">
                📋 Récapitulatif du Service & Avantages Débloqués
              </h2>
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background-color: #0f172a; text-align: left;">
                    <th style="padding: 10px; color: #94a3b8; font-weight: 700; border: 1px solid #334155;">Prestation</th>
                    <th style="padding: 10px; color: #94a3b8; font-weight: 700; border: 1px solid #334155;">Détails</th>
                    <th style="padding: 10px; color: #94a3b8; font-weight: 700; border: 1px solid #334155; text-align: right;">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 10px; color: #f1f5f9; font-weight: 600; border: 1px solid #334155;">
                      Abonnement Vétérinaire PRO (Fondateur)
                    </td>
                    <td style="padding: 10px; color: #cbd5e1; border: 1px solid #334155;">
                      Accès privilégié aux leads consultations, téléconsultations & annuaire national DZ
                    </td>
                    <td style="padding: 10px; color: #10b981; font-weight: 700; border: 1px solid #334155; text-align: right;">
                      0,00 ${currency}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; color: #f1f5f9; font-weight: 600; border: 1px solid #334155;">
                      Volume Patients & Spécialités
                    </td>
                    <td style="padding: 10px; color: #cbd5e1; border: 1px solid #334155;">
                      ${patientsVolume} | ${specialtiesList.join(', ')}
                    </td>
                    <td style="padding: 10px; color: #10b981; font-weight: 700; border: 1px solid #334155; text-align: right;">
                      Inclus
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style="background-color: #0f172a;">
                    <td colspan="2" style="padding: 12px 10px; text-align: right; font-weight: 700; color: #ffffff; border: 1px solid #334155;">
                      TOTAL NET (HT / TTC) :
                    </td>
                    <td style="padding: 12px 10px; text-align: right; font-weight: 800; color: #10b981; font-size: 14px; border: 1px solid #334155;">
                      0,00 ${currency}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          <!-- Footer / Support -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 25px; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">
                Ce reçu d'auto-facture est généré automatiquement par la plateforme <strong>${platform}</strong>.
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                Pour toute assistance technique ou mise à jour de vos informations : <a href="mailto:${officialEmail}" style="color: #38bdf8; text-decoration: none;">${officialEmail}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function recordRegistrationLead(profile: Partial<UserProfile>, role: 'owner' | 'vet'): AdminLead {
  const vipCode = profile.vipCode || generateVipCode(role, profile.wilaya || '16 - Alger');
  const newLead: AdminLead = {
    id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    role: role,
    name: profile.name || (role === 'vet' ? 'Dr. Vétérinaire Inscrit' : 'Propriétaire DiaVet'),
    phone: profile.phone || 'Non renseigné',
    wilaya: profile.wilaya || '16 - Alger',
    commune: profile.commune || 'Centre',
    petNameOrClinic: role === 'vet' ? (profile.clinicName || 'Cabinet Vétérinaire') : (profile.petName || profile.petType || 'Compagnon'),
    animalTypesOrSpecialties: role === 'vet' ? ['Praticien Vétérinaire Algérie'] : [profile.petType || 'Animal de compagnie'],
    vipCode: vipCode,
    annualBudgetOrPatients: role === 'vet' ? 'Cabinet Actif DZ' : 'Budget Standard',
    challenges: ['Enregistré via inscription directe DiaVet DZ'],
    expectedFeatures: ['Pass VIP débloqué', 'Accès Carnet & Urgences'],
    submittedAt: new Date().toLocaleString('fr-DZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    rawDetails: profile
  };

  const existing = getAdminLeads();
  // Don't duplicate if same name and phone
  const filtered = existing.filter(l => !(l.name === newLead.name && l.phone === newLead.phone && l.name !== 'Propriétaire Anonyme'));
  const updated = [newLead, ...filtered];
  saveAdminLeads(updated);

  syncSubmissionToFirestore({
    id: newLead.id,
    role: newLead.role,
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
    rawDetails: profile
  }).catch(err => console.warn('Background Firestore sync caught:', err));

  // Auto-sync full Excel workbook to Google Drive on every new registration
  autoSyncLatestExcelToDrive(getExcelWorkbookHtml(updated)).catch(err => console.warn('Auto Excel Drive sync caught:', err));

  return newLead;
}

export function getExcelWorkbookHtml(leads: AdminLead[]): string {
  const tableRows = leads.map((l, idx) => `
    <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px;">${l.id}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px; font-weight: bold; color: ${l.role === 'vet' ? '#059669' : '#0284c7'};">${l.role === 'vet' ? '🩺 Vétérinaire PRO' : '🐾 Propriétaire'}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px; font-weight: bold;">${l.name}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px; mso-number-format:'\\@';">${l.phone}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px;">${l.wilaya}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px;">${l.commune || '-'}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px; font-weight: bold;">${l.petNameOrClinic}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px;">${(l.animalTypesOrSpecialties || []).join(', ')}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px; font-weight: bold; color: #d97706;">${l.vipCode}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px;">${l.annualBudgetOrPatients || '-'}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px;">${(l.challenges || []).join(' | ')}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px;">${(l.expectedFeatures || []).join(' | ')}</td>
      <td style="border: 1px solid #cbd5e1; padding: 8px; font-family: sans-serif; font-size: 11px; color: #64748b;">${l.submittedAt}</td>
    </tr>
  `).join('');

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>DiaVet Inscrits DZ</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        th { background-color: #047857; color: #ffffff; font-family: sans-serif; font-size: 12px; font-weight: bold; border: 1px solid #065f46; padding: 10px; }
      </style>
    </head>
    <body>
      <h2 style="font-family: sans-serif; color: #0f172a;">DiaVet Algérie — Registre Officiel des Utilisateurs & Inscriptions (${new Date().toLocaleDateString('fr-DZ')})</h2>
      <p style="font-family: sans-serif; font-size: 12px; color: #475569;">Total inscrits: ${leads.length} membres | Exporté depuis DiaVet Santé Animale DZ</p>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type de Membre</th>
            <th>Nom & Prénom</th>
            <th>Téléphone DZ</th>
            <th>Wilaya</th>
            <th>Commune</th>
            <th>Animal / Clinique</th>
            <th>Espèces / Spécialités</th>
            <th>Code Pass VIP</th>
            <th>Budget / Patients</th>
            <th>Défis Algérie</th>
            <th>Besoins Prioritaires</th>
            <th>Date d'Inscription</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `.trim();
}

export function exportLeadsToExcel(leads: AdminLead[]): void {
  const excelHtml = getExcelWorkbookHtml(leads);
  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `diavet_registre_inscrits_${new Date().toISOString().split('T')[0]}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatLeadsAsCsv(leads: AdminLead[]): string {
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

  return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportLeadsToCsv(leads: AdminLead[]): void {
  const csvContent = formatLeadsAsCsv(leads);
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
