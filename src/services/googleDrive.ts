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

/**
 * Upload index.html content directly to the user's Google Drive root folder
 */
export async function uploadIndexHtmlToDrive(
  token: string, 
  fileContent: string, 
  fileName: string = 'index.html'
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const metadata = {
    name: fileName,
    mimeType: 'text/html'
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/html\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
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
  return result;
}

/**
 * Upload Inscriptions / Leads Data directly to Google Drive
 */
export async function uploadInscriptionsDataToDrive(
  token: string, 
  dataContent: string, 
  fileName: string = 'diavet-inscriptions-registrations.txt',
  mimeType: string = 'text/plain'
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const metadata = {
    name: fileName,
    mimeType: mimeType
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    dataContent +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
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
  return result;
}

/**
 * Upload the official Excel workbook (.xls) with full registration records and multi-pets profiles directly into Google Drive
 */
export async function uploadExcelToDrive(
  token: string, 
  excelHtmlContent: string, 
  fileName: string = `DiaVet_Inscriptions_Registre_${new Date().toISOString().slice(0,10)}.xls`
): Promise<{ id: string; name: string; webViewLink?: string }> {
  return uploadInscriptionsDataToDrive(
    token,
    excelHtmlContent,
    fileName,
    'application/vnd.ms-excel'
  );
}

/**
 * Attempts to automatically sync the latest Excel spreadsheet to Google Drive if a token is available
 */
export async function autoSyncLatestExcelToDrive(excelContent: string): Promise<boolean> {
  try {
    const token = cachedAccessToken || localStorage.getItem('diavet_gdrive_token');
    if (!token) return false;
    await uploadExcelToDrive(token, excelContent);
    return true;
  } catch (e) {
    console.warn('Silent auto-sync Excel to Drive error:', e);
    return false;
  }
}
