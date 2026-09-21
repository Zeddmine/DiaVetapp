import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, MapPin, Building, ShieldCheck, 
  Sparkles, Save, X, Award, CheckCircle, FileText, QrCode, Download, Send
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { ALGERIAN_WILAYAS } from '../data/mockData';
import { soundEngine } from '../utils/soundEngine';
import { isEmailAlreadyRegistered, saveRegisteredAccounts, getRegisteredAccounts } from '../services/accountService';

interface ProfileEditModalProps {
  currentLang?: Language;
  userProfile: UserProfile;
  onSaveProfile: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
}

export default function ProfileEditModal({
  currentLang = 'fr',
  userProfile,
  onSaveProfile,
  onClose
}: ProfileEditModalProps) {
  const isRtl = currentLang === 'ar';
  const isEn = currentLang === 'en';

  const [name, setName] = useState(userProfile.name || '');
  const [email] = useState(userProfile.email || 'adherent@diavet.dz'); // Readonly email for single email constraint
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [wilaya, setWilaya] = useState(userProfile.wilaya || '16 - Alger');
  const [commune, setCommune] = useState(userProfile.commune || '');
  const [petName, setPetName] = useState(userProfile.petName || '');
  const [clinicName, setClinicName] = useState(userProfile.clinicName || '');

  const [isSaved, setIsSaved] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const vipCode = userProfile.vipCode || (userProfile.userRole === 'vet' ? 'DV-VET-2026-8899' : 'DV-VIP-2026-4422');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playLevelUp();

    const updatedData: Partial<UserProfile> = {
      name,
      phone,
      wilaya,
      commune,
      petName,
      clinicName
    };

    // Also update registered account in localStorage
    try {
      const accounts = getRegisteredAccounts();
      const updatedAccounts = accounts.map(acc => {
        if (acc.email.toLowerCase() === email.toLowerCase()) {
          return {
            ...acc,
            fullName: name,
            phone,
            wilaya,
            commune,
            petName,
            clinicName
          };
        }
        return acc;
      });
      saveRegisteredAccounts(updatedAccounts);
    } catch {}

    onSaveProfile(updatedData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleSendInvoiceEmail = () => {
    soundEngine.playCyberClick();
    const subject = encodeURIComponent(`[DiaVet DZ] Facture & Pass VIP Offert - Code: ${vipCode}`);
    const body = encodeURIComponent(
`Bonjour ${name},

Voici votre Pass VIP Officiel & Facture de confirmation d'adhésion sur DiaVet Algérie :

--------------------------------------------------
DOCUMENT DE FACTURATION & PASS VIP SOURCÉ
--------------------------------------------------
Titulaire : ${name}
Rôle : ${userProfile.userRole === 'vet' ? 'Docteur Vétérinaire Praticien' : 'Propriétaire d\'Animal'}
Code Pass VIP : ${vipCode}
Wilaya / Commune : ${wilaya} - ${commune || 'Centre'}
E-mail associé : ${email}
Organisme : DiaVet Algérie (https://diavet.dz)

DÉTAIL FINANCIER AUTO-FACTURÉ :
- Adhésion Programme Fondateur : 0,00 DZD (Offre Spéciale Lancement 100% Offerte)
- Carnet Numérique & Fiche Santé : Inclus
- Statut : Confirmé & Actif sur les 58 Wilayas

Merci de faire partie de la communauté DiaVet DZ !
L'équipe DiaVet Algérie`
    );

    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950 border-2 border-cyan-500/40 p-5 sm:p-8 shadow-2xl shadow-cyan-500/20 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isRtl ? 'Mon Profil & Facturation DiaVet' : isEn ? 'My DiaVet Profile & Billing' : 'Mon Profil & Facturation DiaVet'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRtl ? 'Consultez et modifiez vos informations personnelles en tout temps' : isEn ? 'View and edit your personal account details anytime' : 'Consultez et modifiez vos informations personnelles en tout temps'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unique Email Badge Info */}
        <div className="p-3 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm mb-6 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">
              {isRtl ? 'حساب موثق ببريد إلكتروني فريد' : isEn ? 'Verified Account with Single Unique Email' : 'Compte vérifié avec E-mail Unique'}
            </span>
            <p className="text-emerald-200/90 text-xs">
              {isRtl 
                ? `عنوان البريد الإلكتروني الخاص بك (${email}) محمي ومسجل بصورة فريدة. لا يمكن تكراره.`
                : isEn
                ? `Your email address (${email}) is uniquely bound to your profile and protected against duplicates.`
                : `Votre adresse e-mail (${email}) est associée de manière unique à votre profil et protégée contre les doublons.`}
            </p>
          </div>
        </div>

        {/* Pass VIP & Auto-Invoicing Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-500/30 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                {isRtl ? 'بطاقة VIP والفوترة التلقائية 🇩🇿' : isEn ? 'VIP Pass & Auto-Invoicing 🇩🇿' : 'Pass VIP & Auto-Facturation 🇩🇿'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-lg font-black text-amber-300">
                  {vipCode}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  0 DZD (Gratuit Lancement)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendInvoiceEmail}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{emailSent ? 'E-mail Envoyé !' : 'Recevoir la Facture par Mail'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* SAVED AI WELCOME BANNER DISPLAY */}
          {userProfile.welcomeBannerUrl && (
            <div className="rounded-2xl overflow-hidden border border-cyan-500/30 relative group shadow-lg">
              <div className="absolute top-2 left-2 z-10 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-[10px] font-black uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Bannière AI Imagen Personnalisée</span>
              </div>
              <img 
                src={userProfile.welcomeBannerUrl} 
                alt="DiaVet AI Welcome Banner"
                referrerPolicy="no-referrer"
                className="w-full h-28 sm:h-36 object-cover"
              />
            </div>
          )}

          {/* DEFINITIVE USER ROLE BADGE (LOCKED) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 flex items-center justify-center font-bold text-lg">
                {userProfile.userRole === 'vet' ? '🩺' : '🐾'}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider block">
                  {isRtl ? 'الصفة الرسمية للحساب (نهائية 🔒)' : isEn ? 'Official Account Role (Definitive 🔒)' : 'Rôle Officiel du Compte (Définitif 🔒)'}
                </span>
                <p className="text-sm font-black text-white">
                  {userProfile.userRole === 'vet' 
                    ? (isRtl ? 'Docteur Vétérinaire Agréé (طبيب بيطري معتمد)' : isEn ? 'Licensed Veterinarian (ONMV)' : 'Docteur Vétérinaire Praticien (ONMV)')
                    : (isRtl ? 'Propriétaire d\'Animal (مربي / صاحب حيوان)' : isEn ? 'Pet Owner' : 'Propriétaire d\'Animal de Compagnie')}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shrink-0">
              {isRtl ? 'ثابت ولا يمكن تغييره' : isEn ? 'Definitive Choice' : 'Choix Définitif Non Modifiable'}
            </span>
          </div>
          
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isRtl ? 'الاسم واللقب' : isEn ? 'Full Name' : 'Nom & Prénom'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isRtl ? 'البريد الإلكتروني (غير قابل للتغيير)' : isEn ? 'Email Address (Unique - Cannot be changed)' : 'Adresse E-mail (Unique - Non modifiable)'}
            </label>
            <div className="relative opacity-80">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={email}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-300 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {isRtl ? 'رقم الهاتف' : isEn ? 'Phone Number' : 'Numéro de Téléphone DZ'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0550123456"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Wilaya & Commune */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isRtl ? 'الولاية' : isEn ? 'Wilaya' : 'Wilaya'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  {ALGERIAN_WILAYAS.map(w => (
                    <option key={w} value={w} className="bg-slate-900 text-white">
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isRtl ? 'البلدية' : isEn ? 'Commune' : 'Commune'}
              </label>
              <input
                type="text"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                placeholder="Centre"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Role specific info */}
          {userProfile.userRole === 'vet' ? (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isRtl ? 'اسم العيادة أو العيادة الخاصة' : isEn ? 'Clinic or Practice Name' : 'Nom de la Clinique / Cabinet'}
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Cabinet Vétérinaire El-Chifa"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isRtl ? 'اسم الحيوان الأليف' : isEn ? 'Pet Name' : 'Nom de l\'Animal'}
              </label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Rex, Max, Minou..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          )}

          {/* Save Action Button */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaved 
                  ? (isRtl ? 'تم الحفظ بنجاح ✓' : isEn ? 'Changes Saved! ✓' : 'Enregistré avec succès ! ✓')
                  : (isRtl ? 'حفظ التعديلات' : isEn ? 'Save Profile Changes' : 'Enregistrer les Modifications')}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
