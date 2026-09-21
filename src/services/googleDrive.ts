import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google sign in');
    }

    cachedAccessToken = credential.accessToken;
    try {
      localStorage.setItem('diavet_gdrive_token', credential.accessToken);
    } catch {}
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken || localStorage.getItem('diavet_gdrive_token');
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  try {
    localStorage.removeItem('diavet_gdrive_token');
  } catch {}
};

export const OFFICIAL_DRIVE_ACCOUNT = 'mine.mine0100@gmail.com';
export const DIAVET_DRIVE_FOLDER_NAME = 'DiaVet donner et informations';

let cachedFolderId: string | null = null;

/**
 * Searches for or creates the dedicated Google Drive folder: "DiaVet donner et informations"
 */
export async function getOrCreateDiaVetFolder(
  token: string, 
  folderName: string = DIAVET_DRIVE_FOLDER_NAME
): Promise<string> {
  if (cachedFolderId) return cachedFolderId;

  try {
    // 1. Search for existing active folder
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name%3D'${encodeURIComponent(folderName)}'+and+mimeType%3D'application%2Fvnd.google-apps.folder'+and+trashed%3Dfalse&fields=files(id,name)`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        cachedFolderId = data.files[0].id;
        return data.files[0].id;
      }
    }

    // 2. Create the folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: `Dossier officiel des inscriptions et données DiaVet Algérie pour ${OFFICIAL_DRIVE_ACCOUNT}`
      })
    });

    if (createRes.ok) {
      const created = await createRes.json();
      cachedFolderId = created.id;
      return created.id;
    } else {
      console.warn('Could not create folder, fallback to root');
      return '';
    }
  } catch (err) {
    console.error('Error in getOrCreateDiaVetFolder:', err);
    return '';
  }
}

/**
 * Upload any content directly inside the "DiaVet donner et informations" folder
 */
export async function uploadFileToDiaVetFolder(
  token: string, 
  content: string, 
  fileName: string,
  mimeType: string = 'text/plain',
  folderName: string = DIAVET_DRIVE_FOLDER_NAME
): Promise<{ id: string; name: string; webViewLink?: string; folderId?: string }> {
  // Obtain or create the target folder
  const folderId = await getOrCreateDiaVetFolder(token, folderName);

  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: mimeType
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,parents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Drive API error (${response.status}): ${errText}`);
  }

  const result = await response.json();
  return { ...result, folderId };
}

/**
 * Upload index.html content directly to Google Drive
 */
export async function uploadIndexHtmlToDrive(
  token: string, 
  fileContent: string, 
  fileName: string = 'index.html'
): Promise<{ id: string; name: string; webViewLink?: string }> {
  return uploadFileToDiaVetFolder(token, fileContent, fileName, 'text/html');
}

/**
 * Upload Inscriptions / Leads Data directly to Google Drive in folder
 */
export async function uploadInscriptionsDataToDrive(
  token: string, 
  dataContent: string, 
  fileName: string = 'diavet-inscriptions-registrations.txt',
  mimeType: string = 'text/plain'
): Promise<{ id: string; name: string; webViewLink?: string }> {
  return uploadFileToDiaVetFolder(token, dataContent, fileName, mimeType);
}

/**
 * Upload the official Excel workbook (.xls) with full registration records and multi-pets profiles directly into Google Drive folder
 */
export async function uploadExcelToDrive(
  token: string, 
  excelHtmlContent: string, 
  fileName: string = `DiaVet_Inscriptions_Registre_${new Date().toISOString().slice(0,10)}.xls`
): Promise<{ id: string; name: string; webViewLink?: string }> {
  return uploadFileToDiaVetFolder(
    token,
    excelHtmlContent,
    fileName,
    'application/vnd.ms-excel'
  );
}

/**
 * Attempts to automatically sync the latest Excel spreadsheet to Google Drive folder if a token is available
 */
export async function autoSyncLatestExcelToDrive(excelContent: string): Promise<boolean> {
  try {
    const token = cachedAccessToken || localStorage.getItem('diavet_gdrive_token');
    if (!token) return false;
    await uploadExcelToDrive(token, excelContent);
    return true;
  } catch (e) {
    console.warn('Silent auto-sync Excel to Drive folder error:', e);
    return false;
  }
}

/**
 * Automatically uploads a newly submitted visitor registration (propriétaire ou vétérinaire)
 * directly into the Google Drive folder "DiaVet donner et informations"
 */
export async function autoSyncRegistrationDossierToDrive(lead: any): Promise<boolean> {
  try {
    const token = cachedAccessToken || localStorage.getItem('diavet_gdrive_token');
    
    // Store in pending queue if token is not currently present, so it syncs when admin connects
    const queueRaw = localStorage.getItem('diavet_pending_drive_sync');
    const queue = queueRaw ? JSON.parse(queueRaw) : [];
    queue.push({ lead, timestamp: new Date().toISOString() });
    localStorage.setItem('diavet_pending_drive_sync', JSON.stringify(queue.slice(-50)));

    if (!token) return false;

    // Generate clean individual dossier
    const safeName = (lead.name || 'Visiteur').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `Dossier_${lead.role?.toUpperCase() || 'MEMBRE'}_${safeName}_${lead.vipCode || 'PASS'}.html`;
    
    const dossierHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>DiaVet Inscription - ${lead.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; color: #0f172a; background: #f8fafc; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 2rem; max-width: 700px; margin: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    h1 { color: #0284c7; margin-top: 0; font-size: 1.5rem; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: bold; font-size: 0.8rem; background: #e0f2fe; color: #0369a1; }
    .row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; }
    .label { font-weight: 600; color: #64748b; }
    .value { font-weight: 700; color: #0f172a; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">DiaVet Algérie • ${lead.role === 'vet' ? '🩺 VÉTÉRINAIRE' : '🐾 PROPRIÉTAIRE'}</span>
    <h1>Dossier d'inscription : ${lead.name}</h1>
    <div class="row"><span class="label">Date & Heure :</span><span class="value">${lead.submittedAt || new Date().toLocaleString('fr-DZ')}</span></div>
    <div class="row"><span class="label">Téléphone DZ :</span><span class="value">${lead.phone}</span></div>
    <div class="row"><span class="label">Wilaya :</span><span class="value">${lead.wilaya} (${lead.commune || 'Centre'})</span></div>
    <div class="row"><span class="label">Compagnon / Clinique :</span><span class="value">${lead.petNameOrClinic || 'N/A'}</span></div>
    <div class="row"><span class="label">Espèces / Spécialités :</span><span class="value">${Array.isArray(lead.animalTypesOrSpecialties) ? lead.animalTypesOrSpecialties.join(', ') : lead.animalTypesOrSpecialties}</span></div>
    <div class="row"><span class="label">Code VIP Remis :</span><span class="value" style="color:#0284c7;">${lead.vipCode || 'N/A'}</span></div>
    <div class="row"><span class="label">Détails & Besoins :</span><span class="value">${Array.isArray(lead.expectedFeatures) ? lead.expectedFeatures.join(', ') : 'Standards'}</span></div>
  </div>
</body>
</html>
    `.trim();

    await uploadFileToDiaVetFolder(token, dossierHtml, fileName, 'text/html');
    return true;
  } catch (err) {
    console.warn('Auto registration dossier sync error:', err);
    return false;
  }
}

/**
 * Flush all pending inscriptions to Google Drive when admin connects
 */
export async function flushPendingRegistrationsToDrive(token: string): Promise<number> {
  try {
    const queueRaw = localStorage.getItem('diavet_pending_drive_sync');
    if (!queueRaw) return 0;
    const queue = JSON.parse(queueRaw);
    if (!Array.isArray(queue) || queue.length === 0) return 0;

    let count = 0;
    for (const item of queue) {
      if (item.lead) {
        await autoSyncRegistrationDossierToDrive(item.lead);
        count++;
      }
    }
    localStorage.removeItem('diavet_pending_drive_sync');
    return count;
  } catch (err) {
    console.warn('Error flushing pending registrations:', err);
    return 0;
  }
}
