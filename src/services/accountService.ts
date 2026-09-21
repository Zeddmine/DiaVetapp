import { UserProfile } from '../types';
import { recordRegistrationLead } from './adminDb';

export interface RegisteredAccount {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  wilaya: string;
  commune: string;
  role: 'owner' | 'vet';
  passwordHash?: string;
  petName?: string;
  petType?: string;
  petBreed?: string;
  clinicName?: string;
  orderNumber?: string;
  isEmailVerified: boolean;
  vipCode: string;
  points: number;
  registeredAt: string;
  verifiedAt?: string;
}

interface PendingVerification {
  email: string;
  code: string;
  generatedAt: number;
  expiresAt: number;
  accountData: Partial<RegisteredAccount>;
}

const ACCOUNTS_STORAGE_KEY = 'diavet_registered_accounts';
const PENDING_CODE_STORAGE_KEY = 'diavet_pending_verifications';

// Initial demo accounts
const INITIAL_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'acc-demo-owner',
    email: 'contact@diavet.com',
    fullName: 'Docteur Yacine DiaVet',
    phone: '0555001122',
    wilaya: '16 - Alger',
    commune: 'Hydra',
    role: 'owner',
    petName: 'Rex',
    petType: 'Chien',
    isEmailVerified: true,
    vipCode: 'DZ-VIP-778899',
    points: 350,
    registeredAt: '2026-02-15 10:30:00',
    verifiedAt: '2026-02-15 10:30:00',
  }
];

export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    const parsed: RegisteredAccount[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ACCOUNTS;
  } catch {
    return INITIAL_ACCOUNTS;
  }
}

export function saveRegisteredAccounts(accounts: RegisteredAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save registered accounts:', e);
  }
}

/**
 * Global key for registered email tracking
 */
const GLOBAL_EMAILS_KEY = 'diavet_registered_emails_list';

export function registerEmailInGlobalList(email: string): void {
  if (!email) return;
  const normalized = email.trim().toLowerCase();
  try {
    const raw = localStorage.getItem(GLOBAL_EMAILS_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(normalized)) {
      list.push(normalized);
      localStorage.setItem(GLOBAL_EMAILS_KEY, JSON.stringify(list));
    }
  } catch {}
}

/**
 * Strict check if an email is already registered anywhere in the platform
 */
export function isEmailAlreadyRegistered(email: string): boolean {
  if (!email || !email.trim()) return false;
  const normalized = email.trim().toLowerCase();

  // 1. Check registered accounts
  const accounts = getRegisteredAccounts();
  if (accounts.some(acc => acc.email.toLowerCase() === normalized)) {
    return true;
  }

  // 2. Check global email list
  try {
    const raw = localStorage.getItem(GLOBAL_EMAILS_KEY);
    if (raw) {
      const list: string[] = JSON.parse(raw);
      if (Array.isArray(list) && list.map(e => e.toLowerCase()).includes(normalized)) {
        return true;
      }
    }
  } catch {}

  return false;
}

/**
 * Get an account by email
 */
export function findAccountByEmail(email: string): RegisteredAccount | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  return accounts.find(acc => acc.email.toLowerCase() === normalized) || null;
}

/**
 * Generate a 6-digit confirmation code and store pending verification for 15 minutes
 */
export function generateVerificationCode(email: string, accountData: Partial<RegisteredAccount>): {
  code: string;
  expiresAt: number;
} {
  const normalized = email.trim().toLowerCase();
  // Generate random 6-digit code between 100000 and 999999
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const expiresAt = now + 15 * 60 * 1000; // 15 minutes validity

  const pending: PendingVerification = {
    email: normalized,
    code,
    generatedAt: now,
    expiresAt,
    accountData
  };

  try {
    const raw = localStorage.getItem(PENDING_CODE_STORAGE_KEY);
    const existing: Record<string, PendingVerification> = raw ? JSON.parse(raw) : {};
    existing[normalized] = pending;
    localStorage.setItem(PENDING_CODE_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save pending verification code:', e);
  }

  return { code, expiresAt };
}

/**
 * Get current pending verification for an email
 */
export function getPendingVerification(email: string): PendingVerification | null {
  try {
    const raw = localStorage.getItem(PENDING_CODE_STORAGE_KEY);
    if (!raw) return null;
    const existing: Record<string, PendingVerification> = JSON.parse(raw);
    const normalized = email.trim().toLowerCase();
    const pending = existing[normalized];
    if (!pending) return null;

    // Check if expired
    if (Date.now() > pending.expiresAt) {
      delete existing[normalized];
      localStorage.setItem(PENDING_CODE_STORAGE_KEY, JSON.stringify(existing));
      return null;
    }

    return pending;
  } catch {
    return null;
  }
}

/**
 * Verify code and activate account with multilingual responses
 */
export function verifyEmailCode(
  email: string,
  enteredCode: string,
  lang: 'fr' | 'en' | 'ar' = 'fr'
): { success: boolean; message: string; account?: RegisteredAccount } {
  const normalized = email.trim().toLowerCase();
  const trimmedCode = enteredCode.trim().replace(/\s+/g, '');

  const pending = getPendingVerification(normalized);

  if (!pending) {
    const message = 
      lang === 'ar'
        ? 'لا يوجد رمز نشط لهذا البريد الإلكتروني أو انتهت صلاحيته. يرجى طلب رمز جديد.'
        : lang === 'en'
        ? 'No active verification code found for this email or it has expired. Please request a new code.'
        : 'Aucun code actif pour cette adresse email ou le code a expiré. Veuillez demander un nouveau code.';
    return { success: false, message };
  }

  if (Date.now() > pending.expiresAt) {
    const message =
      lang === 'ar'
        ? 'انتهت صلاحية الرمز. يرجى النقر على إعادة إرسال الرمز.'
        : lang === 'en'
        ? 'The verification code has expired. Please click Resend Code.'
        : 'Le code a expiré. Veuillez cliquer sur Renvoyer le code.';
    return { success: false, message };
  }

  if (pending.code !== trimmedCode) {
    const message =
      lang === 'ar'
        ? 'رمز التأكيد غير صحيح. يرجى التحقق من الأرقام الـ 6 المستلمة في بريدك الإلكتروني.'
        : lang === 'en'
        ? 'Incorrect confirmation code. Please check the 6 digits sent to your email.'
        : 'Code de confirmation incorrect. Veuillez vérifier les 6 chiffres reçus par email.';
    return { success: false, message };
  }

  // Code is valid! Create / activate account
  const accounts = getRegisteredAccounts();
  const existingIdx = accounts.findIndex(a => a.email.toLowerCase() === normalized);

  const vipCode = pending.accountData.vipCode || `DZ-${Math.floor(100000 + Math.random() * 900000)}`;
  const points = pending.accountData.role === 'vet' ? 250 : 150;

  const newAccount: RegisteredAccount = {
    id: 'acc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    email: normalized,
    fullName: pending.accountData.fullName || 'Membre DiaVet',
    phone: pending.accountData.phone || '0550000000',
    wilaya: pending.accountData.wilaya || '16 - Alger',
    commune: pending.accountData.commune || 'Centre',
    role: pending.accountData.role || 'owner',
    passwordHash: pending.accountData.passwordHash || '',
    petName: pending.accountData.petName,
    petType: pending.accountData.petType,
    petBreed: pending.accountData.petBreed,
    clinicName: pending.accountData.clinicName,
    orderNumber: pending.accountData.orderNumber,
    isEmailVerified: true,
    vipCode,
    points,
    registeredAt: new Date().toLocaleString('fr-DZ'),
    verifiedAt: new Date().toLocaleString('fr-DZ'),
  };

  if (existingIdx >= 0) {
    accounts[existingIdx] = {
      ...accounts[existingIdx],
      ...newAccount,
      isEmailVerified: true,
      verifiedAt: new Date().toLocaleString('fr-DZ')
    };
  } else {
    accounts.push(newAccount);
  }

  saveRegisteredAccounts(accounts);
  registerEmailInGlobalList(normalized);

  // Clear pending verification
  try {
    const raw = localStorage.getItem(PENDING_CODE_STORAGE_KEY);
    if (raw) {
      const existing: Record<string, PendingVerification> = JSON.parse(raw);
      delete existing[normalized];
      localStorage.setItem(PENDING_CODE_STORAGE_KEY, JSON.stringify(existing));
    }
  } catch {}

  // Record in lead registry for Excel exports
  recordRegistrationLead(
    {
      name: newAccount.fullName,
      email: newAccount.email,
      phone: newAccount.phone,
      wilaya: newAccount.wilaya,
      commune: newAccount.commune,
      petName: newAccount.petName || '',
      clinicName: newAccount.clinicName || '',
      vipCode: newAccount.vipCode,
    } as UserProfile,
    newAccount.role
  );

  return {
    success: true,
    message: 'Compte confirmé avec succès !',
    account: newAccount
  };
}
