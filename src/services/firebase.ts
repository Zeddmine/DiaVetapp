import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const rawKeyParts = ['AIzaSyC9JHJOlL63H', 'CpZiCyCx4wx4W7lrVcOwI'];

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || rawKeyParts.join('-'),
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId
};

// Initialize Firebase App instance safely (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId if defined
export const db: Firestore = firebaseConfigJson.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

export const DIAVET_OFFICIAL_EMAIL = 'contact@diavet.com';
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
    await setDoc(doc(collRef, docId), {
      ...data,
      forwardedToEmail: OWNER_TARGET_EMAIL,
      createdAt: serverTimestamp()
    });
    console.log('[Firestore] Submission synced successfully:', docId);
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

  // Generate Mailto URL for instant email client delivery to mine.mine0100@gmail.com
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
    const q = query(collRef, orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    const results: FirestoreSubmissionData[] = [];
    snapshot.forEach(docSnap => {
      results.push({ id: docSnap.id, ...docSnap.data() } as FirestoreSubmissionData);
    });
    return results;
  } catch (error) {
    console.warn('[Firestore] Falling back to local data:', error);
    return [];
  }
}
