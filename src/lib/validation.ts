import { z } from 'zod';
import { Language } from '../types';

// Algerian phone number regex helper:
// Accepts: 05/06/07/02/03/04 followed by 7-8 digits, or +213/00213 followed by 5/6/7/2/3/4 + 8 digits
export const isValidAlgerianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
  if (!cleaned) return false;
  
  // Local format: 05/06/07/02/03/04... with 9 or 10 digits
  const localRegex = /^0(5|6|7|2|3|4)[0-9]{7,8}$/;
  
  // International format: +213 or 00213 followed by 5/6/7/2/3/4 and 8 digits
  const intlRegex = /^(\+213|00213)(5|6|7|2|3|4)[0-9]{8}$/;
  
  // General fallback: if length is 9-10 digits starting with 5/6/7
  const shortRegex = /^(5|6|7)[0-9]{8}$/;

  return localRegex.test(cleaned) || intlRegex.test(cleaned) || shortRegex.test(cleaned);
};

// Password Strength Evaluation
export interface PasswordStrength {
  score: number; // 0 to 4
  label: { fr: string; ar: string; en: string };
  color: string; // Tailwind color class
}

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return {
      score: 0,
      label: { fr: 'Vide', ar: 'فارغة', en: 'Empty' },
      color: 'bg-slate-700'
    };
  }

  let score = 0;
  if (password.length >= 4) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Cap at 4
  const finalScore = Math.min(score, 4);

  switch (finalScore) {
    case 1:
      return {
        score: 1,
        label: { fr: 'Faible (min 6 car.)', ar: 'ضعيفة (6 حروف على الأقل)', en: 'Weak (min 6 chars)' },
        color: 'bg-rose-500'
      };
    case 2:
      return {
        score: 2,
        label: { fr: 'Moyen', ar: 'متوسطة', en: 'Moderate' },
        color: 'bg-amber-500'
      };
    case 3:
      return {
        score: 3,
        label: { fr: 'Bon', ar: 'جيدة', en: 'Good' },
        color: 'bg-cyan-500'
      };
    case 4:
      return {
        score: 4,
        label: { fr: 'Très robuste 🔒', ar: 'قوية ومحمية 🔒', en: 'Strong 🔒' },
        color: 'bg-emerald-500'
      };
    default:
      return {
        score: 0,
        label: { fr: 'Trop court', ar: 'قصيرة جداً', en: 'Too short' },
        color: 'bg-slate-700'
      };
  }
};

// Factory to create Zod Schema with localized error messages
export const getRegistrationSchema = (lang: Language = 'fr') => {
  const isRtl = lang === 'ar';
  const isEn = lang === 'en';

  const messages = {
    nameRequired: isRtl ? 'الرجاء إدخال الاسم واللقب الكامل' : isEn ? 'Full name is required' : 'Le nom complet est obligatoire',
    nameMin: isRtl ? 'الاسم يجب أن يحتوي على حرفين على الأقل' : isEn ? 'Name must be at least 2 characters' : 'Le nom doit contenir au moins 2 caractères',
    nameMax: isRtl ? 'الاسم طويل جداً' : isEn ? 'Name is too long' : 'Le nom est trop long',
    emailRequired: isRtl ? 'البريد الإلكتروني مطلوب' : isEn ? 'Email address is required' : "L'adresse email est requise",
    emailInvalid: isRtl ? 'صيغة البريد الإلكتروني غير صحيحة (مثال: nom@gmail.com)' : isEn ? 'Invalid email format (e.g., name@gmail.com)' : 'Format email invalide (ex: nom@gmail.com)',
    phoneRequired: isRtl ? 'رقم الهاتف مطلوب' : isEn ? 'Phone number is required' : 'Le numéro de téléphone est requis',
    phoneInvalid: isRtl ? 'رقم هاتف جزائري غير صالح (05 / 06 / 07 / +213)' : isEn ? 'Invalid Algerian phone number (05/06/07/+213)' : 'Numéro algérien invalide (ex: 05, 06, 07 ou +213)',
    passwordRequired: isRtl ? 'كلمة المرور مطلوبة' : isEn ? 'Password is required' : 'Le mot de passe est obligatoire',
    passwordMin: isRtl ? 'كلمة المرور يجب ألا تقل عن 4 رموز أو أرقام' : isEn ? 'Password must be at least 4 characters or digits' : 'Le mot de passe doit comporter au moins 4 caractères ou chiffres',
    wilayaRequired: isRtl ? 'الرجاء تحديد الولاية' : isEn ? 'Wilaya is required' : 'Veuillez sélectionner la wilaya'
  };

  return z.object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: messages.nameMin })
      .max(80, { message: messages.nameMax }),
    email: z
      .string()
      .trim()
      .min(1, { message: messages.emailRequired })
      .email({ message: messages.emailInvalid }),
    phone: z
      .string()
      .trim()
      .min(1, { message: messages.phoneRequired })
      .refine(isValidAlgerianPhone, { message: messages.phoneInvalid }),
    wilaya: z
      .string()
      .min(1, { message: messages.wilayaRequired }),
    password: z
      .string()
      .min(4, { message: messages.passwordMin }),
    role: z.enum(['owner', 'vet']),
    petName: z.string().optional(),
    petType: z.string().optional(),
    clinicName: z.string().optional(),
    orderNumber: z.string().optional(),
  });
};

export type RegistrationFormData = z.infer<ReturnType<typeof getRegistrationSchema>>;

export function extractZodError(result: any, fallbackMessage: string = 'Valeur non valide'): string {
  if (!result || result.success) return fallbackMessage;
  const err = result?.error;
  if (!err) return fallbackMessage;
  
  // Zod 3 provides err.issues array
  const issuesList = Array.isArray(err.issues) ? err.issues : Array.isArray(err['issues']) ? err['issues'] : Array.isArray(err['errors']) ? err['errors'] : null;
  if (issuesList && issuesList.length > 0) {
    const item = issuesList[0];
    if (item && typeof item.message === 'string') {
      return item.message;
    }
  }
  if (typeof err.message === 'string' && err.message) {
    return err.message;
  }
  return fallbackMessage;
}

// Real-time Single Field Validator
export const validateField = (
  fieldName: 'fullName' | 'email' | 'phone' | 'password' | 'wilaya',
  value: string,
  lang: Language = 'fr'
): { isValid: boolean; error: string | null } => {
  const schema = getRegistrationSchema(lang);
  const fieldSchema = schema.shape[fieldName];
  
  if (!fieldSchema) {
    return { isValid: true, error: null };
  }

  const result = fieldSchema.safeParse(value);
  if (result.success) {
    return { isValid: true, error: null };
  } else {
    const firstError = extractZodError(result, 'Valeur non valide');
    return { isValid: false, error: firstError };
  }
};
