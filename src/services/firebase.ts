import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  setLogLevel,
  Firestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp, 
  doc, 
  setDoc,
  onSnapshot,
  Unsubscribe,
  updateDoc
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Keep Firestore logs clean during offline or flaky connection states
try {
  setLogLevel('error');
} catch {
  // Ignore in environments where setLogLevel is restricted
}

const rawKeyParts = ['AIzaSyC9JHJOlL63H', 'CpZiCyCx4wx4W7lrVcOwI'];

export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || rawKeyParts.join('-'),
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId
};

// Initialize Firebase App instance safely (singleton pattern)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with forced long polling & persistent local cache to bypass WebChannel restrictions
const customDbId = (firebaseConfigJson as Record<string, any>).firestoreDatabaseId;

export const db: Firestore = (() => {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      },
      customDbId
    );
  } catch {
    try {
      return initializeFirestore(
        app,
        {
          experimentalForceLongPolling: true,
          localCache: memoryLocalCache()
        },
        customDbId
      );
    } catch {
      return customDbId ? getFirestore(app, customDbId) : getFirestore(app);
    }
  }
})();

export const DIAVET_OFFICIAL_EMAIL = 'contact@diavet.dz';
export const OWNER_TARGET_EMAIL = 'mine.mine0100@gmail.com';

export interface FirestoreSubmissionData {
  id?: string;
  role: 'owner' | 'vet';
  name: string;
  phone: string;
  wilaya: string;
  commune?: string;
  petNameOrClinic?: string;
  animalTypesOrSpecialties?: string[];
  vipCode: string;
  annualBudgetOrPatients?: string;
  challenges?: string[];
  expectedFeatures?: string[];
  submittedAt: string;
  rawDetails?: any;
  createdAt?: any;
  forwardedToEmail?: string;
}

export interface ContactMessageData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  forwardedTo: string;
  createdAt: string;
  timestamp?: any;
}

// 1. Record Submission to Cloud Firestore
export async function syncSubmissionToFirestore(data: FirestoreSubmissionData): Promise<boolean> {
  try {
    const collRef = collection(db, 'submissions');
    const docId = data.id || `lead_${Date.now()}`;
    
    // Save to submissions
    await setDoc(doc(collRef, docId), {
      ...data,
      forwardedToEmail: OWNER_TARGET_EMAIL,
      createdAt: serverTimestamp(),
      savedAtIso: new Date().toISOString()
    });

    // Also broadcast into notifications collection
    try {
      const notifColl = collection(db, 'notifications');
      await addDoc(notifColl, {
        title: data.role === 'vet' ? "🩺 Nouveau Vétérinaire Inscrit" : "🐾 Nouveau Propriétaire Inscrit",
        message: `${data.name} (${data.wilaya || 'Algérie'}) - ${data.petNameOrClinic || 'Dossier DiaVet'}`,
        role: data.role,
        leadId: docId,
        vipCode: data.vipCode,
        isRead: false,
        createdAt: serverTimestamp(),
        timestampIso: new Date().toISOString()
      });
    } catch (notifErr) {
      console.warn('[Firestore] Notification broadcast note:', notifErr);
    }

    console.log('[Firestore] Submission synced successfully to cloud:', docId);
    return true;
  } catch (error) {
    console.warn('[Firestore] Sync warning (will keep in local DB cache):', error);
    return false;
  }
}

// 2. Record Contact Message to Cloud Firestore
export async function sendContactMessageToFirestore(msg: Omit<ContactMessageData, 'forwardedTo' | 'createdAt'>): Promise<{ success: boolean; mailtoUrl: string }> {
  const fullMessage: ContactMessageData = {
    ...msg,
    forwardedTo: `${DIAVET_OFFICIAL_EMAIL} → ${OWNER_TARGET_EMAIL}`,
    createdAt: new Date().toISOString()
  };

  let firestoreSuccess = false;
  try {
    const collRef = collection(db, 'contact_messages');
    await addDoc(collRef, {
      ...fullMessage,
      timestamp: serverTimestamp()
    });
    firestoreSuccess = true;
  } catch (err) {
    console.warn('[Firestore] Contact message local fallback:', err);
  }

  // Generate Mailto URL for instant email client delivery
  const subjectEncoded = encodeURIComponent(`[DiaVet Official Contact] ${msg.subject || 'Nouveau message DiaVet'}`);
  const bodyEncoded = encodeURIComponent(
    `Nouveau message reçu pour DiaVet Algérie\n` +
    `-----------------------------------------\n` +
    `Expéditeur: ${msg.name}\n` +
    `Email: ${msg.email}\n` +
    `Téléphone: ${msg.phone || 'Non renseigné'}\n` +
    `Destinataire officiel: ${DIAVET_OFFICIAL_EMAIL}\n` +
    `Transféré à: ${OWNER_TARGET_EMAIL}\n\n` +
    `Message:\n${msg.message}\n\n` +
    `-----------------------------------------\n` +
    `Envoyé via la plateforme DiaVet Algérie Cloud`
  );

  const mailtoUrl = `mailto:${OWNER_TARGET_EMAIL}?cc=${DIAVET_OFFICIAL_EMAIL}&subject=${subjectEncoded}&body=${bodyEncoded}`;

  return { success: true, mailtoUrl };
}

// 3. Fetch submissions from Cloud Firestore
export async function fetchSubmissionsFromFirestore(): Promise<FirestoreSubmissionData[]> {
  try {
    const collRef = collection(db, 'submissions');
    let snapshot;
    try {
      const q = query(collRef, orderBy('createdAt', 'desc'), limit(150));
      snapshot = await getDocs(q);
    } catch {
      snapshot = await getDocs(collRef);
    }

    const results: FirestoreSubmissionData[] = [];
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      results.push({ 
        id: docSnap.id, 
        ...d,
        submittedAt: d.submittedAt || (d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString('fr-DZ') : new Date().toLocaleString('fr-DZ'))
      } as FirestoreSubmissionData);
    });

    // In-memory sorting fallback to ensure newest first
    results.sort((a, b) => {
      const timeA = (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0) || (a.rawDetails?.submittedAt ? new Date(a.rawDetails.submittedAt).getTime() : 0);
      const timeB = (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) || (b.rawDetails?.submittedAt ? new Date(b.rawDetails.submittedAt).getTime() : 0);
      return timeB - timeA;
    });

    return results;
  } catch (error) {
    console.warn('[Firestore] Falling back to local data:', error);
    return [];
  }
}

// 3b. Realtime live subscription to all submissions (Owners & Vets)
export function subscribeToSubmissionsFromFirestore(
  onUpdate: (submissions: FirestoreSubmissionData[]) => void
): () => void {
  try {
    const collRef = collection(db, 'submissions');
    
    const unsubscribe = onSnapshot(collRef, (snapshot) => {
      const results: FirestoreSubmissionData[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        results.push({
          id: docSnap.id,
          ...d,
          submittedAt: d.submittedAt || (d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString('fr-DZ') : new Date().toLocaleString('fr-DZ'))
        } as FirestoreSubmissionData);
      });

      // Sort newest first in memory
      results.sort((a, b) => {
        const timeA = (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0) || (a.rawDetails?.submittedAt ? new Date(a.rawDetails.submittedAt).getTime() : 0);
        const timeB = (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) || (b.rawDetails?.submittedAt ? new Date(b.rawDetails.submittedAt).getTime() : 0);
        return timeB - timeA;
      });

      onUpdate(results);
    }, (error) => {
      console.warn('[Firestore] Submissions realtime listener warning:', error);
    });
    return unsubscribe;
  } catch (err) {
    console.error('[Firestore] Failed to subscribe to submissions:', err);
    return () => {};
  }
}

// 3c. Sync Registered User Account to Cloud Firestore
export async function syncRegisteredAccountToFirestore(account: any): Promise<boolean> {
  try {
    if (!account || !account.email) return false;
    const cleanId = String(account.email).toLowerCase().replace(/[^a-z0-9]/g, '_');
    const docRef = doc(db, 'registered_accounts', cleanId);
    await setDoc(docRef, {
      ...account,
      updatedAt: serverTimestamp(),
      lastSeenAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firestore] Failed to sync registered account to cloud:', err);
    return false;
  }
}

// 3d. Realtime subscription to registered accounts
export function subscribeToRegisteredAccountsFromFirestore(
  onUpdate: (accounts: any[]) => void
): () => void {
  try {
    const collRef = collection(db, 'registered_accounts');
    const q = query(collRef, limit(150));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results: any[] = [];
      snapshot.forEach(docSnap => {
        results.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(results);
    }, (err) => {
      console.warn('[Firestore] Registered accounts realtime listener warning:', err);
    });
    return unsubscribe;
  } catch (err) {
    console.error('[Firestore] Failed to subscribe to registered accounts:', err);
    return () => {};
  }
}


export interface LiveHealthUpdate {
  id: string;
  petName: string;
  type: 'vaccine' | 'weight' | 'triage' | 'observation' | 'treatment';
  title: string;
  details: string;
  value?: string | number;
  veterinarianName?: string;
  wilaya?: string;
  date: string;
  status: 'normal' | 'alert' | 'success';
}

export interface LivePortalNotification {
  id: string;
  targetRole: 'owner' | 'vet' | 'all';
  title: string;
  message: string;
  category: 'clinical' | 'vaccine' | 'alert' | 'system';
  timestamp: string;
  isRead?: boolean;
  actionUrl?: string;
  wilaya?: string;
}

export interface LiveVetPatient {
  id: string;
  name?: string;
  petName: string;
  owner?: string;
  ownerName: string;
  phone?: string;
  time?: string;
  timeSlot: string;
  reason: string;
  status: 'En attente' | 'En cours' | 'Terminé';
  wilaya: string;
  createdAt?: string;
}

// 4. Live Subscription: Health Updates for Owner Portal
export function subscribeToHealthUpdates(
  wilaya: string,
  onUpdate: (updates: LiveHealthUpdate[]) => void
): () => void {
  try {
    const collRef = collection(db, 'health_records');
    const q = query(collRef, orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: LiveHealthUpdate[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        records.push({
          id: docSnap.id,
          petName: d.petName || 'Milo',
          type: d.type || 'observation',
          title: d.title || 'Mise à jour clinique',
          details: d.details || '',
          value: d.value,
          veterinarianName: d.veterinarianName || 'Dr. Vétérinaire',
          wilaya: d.wilaya || wilaya,
          date: d.date || (d.createdAt?.toDate ? d.createdAt.toDate().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
          status: d.status || 'normal'
        });
      });
      onUpdate(records);
    }, (error) => {
      console.warn('[Firestore] Health updates realtime notice:', error);
    });
    return unsubscribe;
  } catch (err) {
    console.error('[Firestore] Failed to subscribe to health records:', err);
    return () => {};
  }
}

// 5. Live Subscription: Notifications for Portals (Owner & Vet)
export function subscribeToPortalNotifications(
  role: 'owner' | 'vet',
  wilaya: string,
  onUpdate: (notifications: LivePortalNotification[]) => void
): () => void {
  try {
    const collRef = collection(db, 'notifications');
    const q = query(collRef, orderBy('createdAt', 'desc'), limit(30));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: LivePortalNotification[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        if (!d.targetRole || d.targetRole === role || d.targetRole === 'all') {
          notifs.push({
            id: docSnap.id,
            targetRole: d.targetRole || 'all',
            title: d.title || 'Notification DiaVet',
            message: d.message || '',
            category: d.category || 'system',
            timestamp: d.timestamp || (d.createdAt?.toDate ? d.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'À l\'instant'),
            isRead: d.isRead || false,
            actionUrl: d.actionUrl,
            wilaya: d.wilaya || wilaya
          });
        }
      });
      onUpdate(notifs);
    }, (error) => {
      console.warn('[Firestore] Notifications realtime notice:', error);
    });
    return unsubscribe;
  } catch (err) {
    console.error('[Firestore] Failed to subscribe to notifications:', err);
    return () => {};
  }
}

// 6. Live Subscription: Vet Patient Queue & Consultations
export function subscribeToVetLiveQueue(
  wilaya: string,
  onUpdate: (patients: LiveVetPatient[]) => void
): () => void {
  try {
    // Listen to appointments and new submissions
    const collRef = collection(db, 'appointments');
    const q = query(collRef, orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: LiveVetPatient[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const pet = d.petName || d.name || 'Patient';
        const own = d.ownerName || d.owner || 'Propriétaire';
        const tm = d.time || d.timeSlot || '10:00';
        list.push({
          id: docSnap.id,
          name: pet,
          petName: pet,
          owner: own,
          ownerName: own,
          phone: d.phone,
          time: tm,
          timeSlot: tm,
          reason: d.reason || 'Consultation générale',
          status: d.status || 'En attente',
          wilaya: d.wilaya || wilaya,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : new Date().toISOString()
        });
      });
      onUpdate(list);
    }, (error) => {
      console.warn('[Firestore] Vet queue realtime notice:', error);
    });
    return unsubscribe;
  } catch (err) {
    console.error('[Firestore] Failed to subscribe to vet queue:', err);
    return () => {};
  }
}

// 7. Write Live Health Record to Cloud Firestore
export async function addLiveHealthEntry(entry: Omit<LiveHealthUpdate, 'id'>): Promise<boolean> {
  try {
    const collRef = collection(db, 'health_records');
    await addDoc(collRef, {
      ...entry,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.warn('[Firestore] Failed to add health record:', err);
    return false;
  }
}

// 8. Write Live Appointment Request to Cloud Firestore
export async function addLiveAppointment(appt: {
  petName: string;
  ownerName: string;
  phone?: string;
  date: string;
  timeSlot: string;
  reason: string;
  wilaya: string;
}): Promise<boolean> {
  try {
    const collRef = collection(db, 'appointments');
    await addDoc(collRef, {
      ...appt,
      status: 'En attente',
      createdAt: serverTimestamp()
    });
    
    // Also generate a live notification for the vet
    const notifRef = collection(db, 'notifications');
    await addDoc(notifRef, {
      targetRole: 'vet',
      title: `Nouveau Rendez-vous : ${appt.petName}`,
      message: `${appt.ownerName} a réservé pour le ${appt.date} à ${appt.timeSlot} (${appt.reason})`,
      category: 'clinical',
      wilaya: appt.wilaya,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp()
    });

    return true;
  } catch (err) {
    console.warn('[Firestore] Failed to book appointment:', err);
    return false;
  }
}

// 9. Update Patient Status in Firestore
export async function updatePatientStatusInFirestore(
  appointmentId: string, 
  status: 'En attente' | 'En cours' | 'Terminé'
): Promise<boolean> {
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.warn('[Firestore] Failed to update appointment status:', err);
    return false;
  }
}

// 10. Send Portal Notification
export async function sendPortalNotification(notif: {
  targetRole: 'owner' | 'vet' | 'all';
  title: string;
  message: string;
  wilaya?: string;
  sender?: string;
  actionUrl?: string;
}): Promise<boolean> {
  try {
    const notifRef = collection(db, 'notifications');
    await addDoc(notifRef, {
      ...notif,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.warn('[Firestore] Failed to send portal notification:', err);
    return false;
  }
}

export type LiveAppointment = LiveVetPatient;

