import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  query, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';

export interface ClinicalDossier {
  id: string;
  petName: string;
  petType: string;
  breed?: string;
  ownerName: string;
  ownerPhone?: string;
  wilaya: string;
  veterinarianName?: string;
  clinicName?: string;
  lastConsultationDate: string;
  vaccines: Array<{
    name: string;
    dateAdministered: string;
    nextDueDate: string;
    veterinarian: string;
  }>;
  prescriptions: Array<{
    id: string;
    drugName: string;
    dosage: string;
    prescribedAt: string;
  }>;
  observations: string[];
  updatedAt?: string;
}

/**
 * 1. Real-time User Profile Synchronization via onSnapshot
 */
export function subscribeToUserProfile(
  emailOrPhone: string,
  onUpdate: (profile: Partial<UserProfile>) => void
): () => void {
  if (!emailOrPhone) return () => {};
  const cleanId = String(emailOrPhone).toLowerCase().replace(/[^a-z0-9]/g, '_');
  const userDocRef = doc(db, 'user_profiles', cleanId);

  return onSnapshot(userDocRef, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data() as Partial<UserProfile>);
    }
  }, (err) => {
    console.warn('[RealtimeSync] Profile listener note:', err);
  });
}

/**
 * 2. Save / Update User Profile in Firestore with real-time broadcast
 */
export async function syncUserProfileToFirestore(profile: Partial<UserProfile>): Promise<boolean> {
  try {
    const key = profile.email || profile.phone || 'profile_' + Date.now();
    const cleanId = String(key).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const userDocRef = doc(db, 'user_profiles', cleanId);
    await setDoc(userDocRef, {
      ...profile,
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[RealtimeSync] Failed to save profile:', err);
    return false;
  }
}

/**
 * 3. Real-time Clinical Dossiers Synchronization via onSnapshot
 */
export function subscribeToClinicalDossiers(
  wilaya: string,
  onUpdate: (dossiers: ClinicalDossier[]) => void
): () => void {
  try {
    const collRef = collection(db, 'clinical_dossiers');
    const q = query(collRef, limit(100));

    return onSnapshot(q, (snapshot) => {
      const list: ClinicalDossier[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          petName: d.petName || 'Compagnon',
          petType: d.petType || 'Chat',
          breed: d.breed || '',
          ownerName: d.ownerName || 'Propriétaire DiaVet',
          ownerPhone: d.ownerPhone || '',
          wilaya: d.wilaya || wilaya,
          veterinarianName: d.veterinarianName || 'Dr. Vétérinaire Agréé',
          clinicName: d.clinicName || 'Clinique Vétérinaire',
          lastConsultationDate: d.lastConsultationDate || new Date().toISOString().slice(0, 10),
          vaccines: d.vaccines || [],
          prescriptions: d.prescriptions || [],
          observations: d.observations || [],
          updatedAt: d.updatedAtIso || new Date().toISOString()
        });
      });
      onUpdate(list);
    }, (err) => {
      console.warn('[RealtimeSync] Clinical dossiers listener note:', err);
    });
  } catch (err) {
    console.error('[RealtimeSync] Clinical dossiers error:', err);
    return () => {};
  }
}

/**
 * 4. Create or Update a Clinical Dossier in Firestore (instantly updates all connected devices via onSnapshot)
 */
export async function syncClinicalDossierToFirestore(dossier: Partial<ClinicalDossier>): Promise<boolean> {
  try {
    const docId = dossier.id || `dossier_${String(dossier.petName || 'pet').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const docRef = doc(db, 'clinical_dossiers', docId);
    await setDoc(docRef, {
      ...dossier,
      updatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[RealtimeSync] Save clinical dossier error:', err);
    return false;
  }
}
