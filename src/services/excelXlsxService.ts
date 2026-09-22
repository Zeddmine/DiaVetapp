import * as XLSX from 'xlsx';
import { AdminLead } from '../types';
import { fetchSubmissionsFromFirestore, FirestoreSubmissionData } from './firebase';
import { getAdminLeads } from './adminDb';

/**
 * Service to transform Firebase / DiaVet database records into downloadable .xlsx Excel workbooks
 * using the xlsx (SheetJS) library.
 */

export interface ExcelExportOptions {
  filename?: string;
  includeStatsSheet?: boolean;
  roleFilter?: 'all' | 'owner' | 'vet';
  source?: 'firebase' | 'local' | 'merged';
}

/**
 * Normalizes Firestore submissions or AdminLeads into uniform row objects for XLSX
 */
export function normalizeLeadsForExcel(leads: (AdminLead | FirestoreSubmissionData)[]) {
  return leads.map((item, index) => {
    const isVet = item.role === 'vet';
    const raw = item.rawDetails || {};

    return {
      'N°': index + 1,
      'ID Unique': item.id || `lead-${index + 1}`,
      'Type de Membre': isVet ? '🩺 Vétérinaire PRO' : '🐾 Propriétaire d\'animaux',
      'Rôle': item.role,
      'Nom & Prénom': item.name || 'Non renseigné',
      'Numéro Téléphone DZ': item.phone || 'Non renseigné',
      'Wilaya': item.wilaya || '16 - Alger',
      'Commune': item.commune || raw.commune || '-',
      'Animal ou Cabinet / Clinique': item.petNameOrClinic || raw.clinicName || raw.petName || '-',
      'Spécialités ou Espèces': Array.isArray(item.animalTypesOrSpecialties) 
        ? item.animalTypesOrSpecialties.join(', ') 
        : (item.animalTypesOrSpecialties || '-'),
      'Code Pass VIP': item.vipCode || '-',
      'Budget Annuel / Volume Patients': item.annualBudgetOrPatients || '-',
      'Défis Rencontrés en Algérie': Array.isArray(item.challenges) 
        ? item.challenges.join(' | ') 
        : (item.challenges || '-'),
      'Besoins & Fonctionnalités Prioritaires': Array.isArray(item.expectedFeatures) 
        ? item.expectedFeatures.join(' | ') 
        : (item.expectedFeatures || '-'),
      'Date & Heure d\'Inscription': item.submittedAt || new Date().toLocaleString('fr-DZ'),
      'Origine des Données': 'Base Firebase Cloud Firestore'
    };
  });
}

/**
 * Calculates auto-fit column widths for SheetJS worksheets
 */
function autoFitColumnWidths(data: any[]): { wch: number }[] {
  if (!data || data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map(key => {
    let maxLen = key.length;
    for (const row of data) {
      const val = row[key];
      if (val !== undefined && val !== null) {
        const strVal = String(val);
        if (strVal.length > maxLen) {
          maxLen = Math.min(strVal.length, 60); // Cap at 60 chars
        }
      }
    }
    return { wch: Math.max(maxLen + 3, 12) };
  });
}

/**
 * Generates and downloads a complete .xlsx multi-sheet workbook using the xlsx library
 */
export function generateAndDownloadXlsx(
  leads: (AdminLead | FirestoreSubmissionData)[],
  options: ExcelExportOptions = {}
): { totalRecords: number; filename: string } {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = options.filename || `DiaVet_Firebase_Database_${dateStr}.xlsx`;

  // 1. Create a new workbook
  const wb = XLSX.utils.book_new();

  // 2. Filter if needed
  let targetLeads = [...leads];
  if (options.roleFilter && options.roleFilter !== 'all') {
    targetLeads = targetLeads.filter(l => l.role === options.roleFilter);
  }

  // 3. Sheet 1: Main Inscriptions (All / Filtered)
  const normalizedAll = normalizeLeadsForExcel(targetLeads);
  const wsAll = XLSX.utils.json_to_sheet(normalizedAll);
  wsAll['!cols'] = autoFitColumnWidths(normalizedAll);
  XLSX.utils.book_append_sheet(wb, wsAll, 'Inscriptions Firebase');

  // 4. Sheet 2: Vétérinaires PRO (if not strictly filtered out)
  const vetLeads = leads.filter(l => l.role === 'vet');
  if (vetLeads.length > 0) {
    const normalizedVets = normalizeLeadsForExcel(vetLeads);
    const wsVets = XLSX.utils.json_to_sheet(normalizedVets);
    wsVets['!cols'] = autoFitColumnWidths(normalizedVets);
    XLSX.utils.book_append_sheet(wb, wsVets, 'Vétérinaires PRO (ONMV)');
  }

  // 5. Sheet 3: Propriétaires d'Animaux
  const ownerLeads = leads.filter(l => l.role === 'owner');
  if (ownerLeads.length > 0) {
    const normalizedOwners = normalizeLeadsForExcel(ownerLeads);
    const wsOwners = XLSX.utils.json_to_sheet(normalizedOwners);
    wsOwners['!cols'] = autoFitColumnWidths(normalizedOwners);
    XLSX.utils.book_append_sheet(wb, wsOwners, 'Propriétaires Animaux');
  }

  // 6. Sheet 4: Statistical Synthesis & Wilaya Summary (Optional / Default True)
  if (options.includeStatsSheet !== false) {
    const wilayaMap: Record<string, { total: number; vets: number; owners: number }> = {};
    leads.forEach(l => {
      const w = l.wilaya || 'Non spécifiée';
      if (!wilayaMap[w]) wilayaMap[w] = { total: 0, vets: 0, owners: 0 };
      wilayaMap[w].total += 1;
      if (l.role === 'vet') wilayaMap[w].vets += 1;
      else wilayaMap[w].owners += 1;
    });

    const wilayaRows = Object.entries(wilayaMap).map(([wilaya, counts]) => ({
      'Wilaya / Région': wilaya,
      'Total Inscrits': counts.total,
      'Vétérinaires Agréés': counts.vets,
      'Propriétaires Particuliers': counts.owners,
      'Taux d\'Adoption': `${Math.round((counts.total / (leads.length || 1)) * 100)}%`
    }));

    const statsRows = [
      { 'Métrique Système': 'Total Membres Enregistrés', 'Valeur': leads.length, 'Note': 'Base Firebase Cloud Firestore' },
      { 'Métrique Système': 'Total Vétérinaires PRO', 'Valeur': vetLeads.length, 'Note': 'Praticiens & Cliniques' },
      { 'Métrique Système': 'Total Propriétaires d\'animaux', 'Valeur': ownerLeads.length, 'Note': 'Chiens, Chats, NAC' },
      { 'Métrique Système': 'Date de l\'Extraction', 'Valeur': new Date().toLocaleString('fr-DZ'), 'Note': 'Export automatique' },
      { 'Métrique Système': 'Bibliothèque de Génération', 'Valeur': 'SheetJS / xlsx', 'Note': 'Format natif Microsoft Excel OpenXML (.xlsx)' }
    ];

    const wsStats = XLSX.utils.json_to_sheet(statsRows);
    wsStats['!cols'] = [{ wch: 35 }, { wch: 25 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(wb, wsStats, 'Synthèse & Métriques');

    if (wilayaRows.length > 0) {
      const wsWilayas = XLSX.utils.json_to_sheet(wilayaRows);
      wsWilayas['!cols'] = autoFitColumnWidths(wilayaRows);
      XLSX.utils.book_append_sheet(wb, wsWilayas, 'Répartition par Wilaya');
    }
  }

  // 7. Trigger the native browser download of .xlsx file
  XLSX.writeFile(wb, filename, { bookType: 'xlsx', type: 'binary' });

  return { totalRecords: targetLeads.length, filename };
}

/**
 * Fetches fresh records directly from Cloud Firestore and exports them to an .xlsx file
 */
export async function fetchFromFirebaseAndExportXlsx(
  options: ExcelExportOptions = {}
): Promise<{ success: boolean; count: number; filename: string; source: string; error?: string }> {
  try {
    // 1. Fetch from Firestore
    const firestoreDocs = await fetchSubmissionsFromFirestore();
    const localLeads = getAdminLeads();

    let combinedData: (AdminLead | FirestoreSubmissionData)[] = [];
    let sourceLabel = 'Firebase Cloud Firestore';

    if (firestoreDocs && firestoreDocs.length > 0) {
      // Merge unique by ID or phone
      const seenIds = new Set<string>();
      firestoreDocs.forEach(d => {
        if (d.id) seenIds.add(d.id);
        combinedData.push(d);
      });

      localLeads.forEach(l => {
        if (!seenIds.has(l.id)) {
          combinedData.push(l);
        }
      });
      sourceLabel = `Firebase Cloud (${firestoreDocs.length}) + Cache Local (${localLeads.length})`;
    } else {
      combinedData = localLeads;
      sourceLabel = 'Cache Local (Synchronisé)';
    }

    const { totalRecords, filename } = generateAndDownloadXlsx(combinedData, options);

    return {
      success: true,
      count: totalRecords,
      filename,
      source: sourceLabel
    };
  } catch (err: any) {
    console.error('Error in fetchFromFirebaseAndExportXlsx:', err);
    // Fallback to local leads if firestore fails
    const localLeads = getAdminLeads();
    const { totalRecords, filename } = generateAndDownloadXlsx(localLeads, options);
    return {
      success: true,
      count: totalRecords,
      filename,
      source: 'Cache Local (Fallback suite à erreur)',
      error: err.message
    };
  }
}
