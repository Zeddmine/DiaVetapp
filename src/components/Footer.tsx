import { Language } from '../types';
import { translations } from '../data/translations';
import { Heart, Instagram, Mail, Database, ShieldCheck } from 'lucide-react';
import DiaVetLogo from './DiaVetLogo';
import { DIAVET_OFFICIAL_EMAIL } from '../services/firebase';

interface FooterProps {
  currentLang: Language;
  userRole?: 'owner' | 'vet';
  onNavigate: (screen: any) => void;
  onOpenContact?: () => void;
}

export default function Footer({ currentLang, userRole = 'owner', onNavigate, onOpenContact }: FooterProps) {
  const t = translations[currentLang] || translations.fr;
  const isRtl = currentLang === 'ar';

  return (
    <footer className={`border-t border-white/10 dark:border-white/10 light:border-slate-200 bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 mt-16 sm:mt-24 transition-colors relative z-10 backdrop-blur-md ${isRtl ? 'text-right' : 'text-left'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <DiaVetLogo size="md" />
              <span className="text-2xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
                Dia<span className="text-cyan-400">Vet</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              {currentLang === 'ar'
                ? "المنظومة الرقمية الموحدة لصحة الحيوان في الجزائر. ربط المربين بالأطباء البيطريين لرعاية طبية حديثة، آمنة وموثوقة."
                : currentLang === 'en'
                ? "The unified animal health platform for Algeria. Connecting pet owners with veterinarians for modern, safe, and transparent healthcare."
                : "La plateforme unifiée pour la santé animale en Algérie. Connecter les propriétaires avec leurs vétérinaires pour un suivi médical moderne, sécurisé et transparent."}
            </p>

            {/* Official Contact & Instagram Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={onOpenContact}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all hover:scale-105 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>{DIAVET_OFFICIAL_EMAIL}</span>
              </button>

              <a
                href="https://instagram.com/dia__vet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/40 text-pink-300 text-xs font-bold transition-all hover:scale-105 cursor-pointer"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>@dia__vet</span>
              </a>
            </div>

            <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Base Cloud Firestore Active</span>
              </span>
              <span>•</span>
              <span>🇩🇿 58 Wilayas</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-300 dark:text-slate-300 light:text-slate-800">
              {currentLang === 'ar' ? "الفضاءات والخدمات" : currentLang === 'en' ? "Portals & Services" : "Espaces & Services"}
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => onNavigate('roles')} 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {currentLang === 'ar' ? "اختيار الملف الشخصي" : currentLang === 'en' ? "Choose Profile (Roles)" : "Choisir mon profil (Rôles)"}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('questionnaire-owner')} 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {currentLang === 'ar' ? "استبيان المربي (بطاقة VIP)" : currentLang === 'en' ? "Pet Owner Survey (VIP Pass)" : "Questionnaire Propriétaire (Pass VIP)"}
                </button>
              </li>
              {userRole === 'vet' && (
                <li>
                  <button 
                    onClick={() => onNavigate('questionnaire-vet')} 
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {currentLang === 'ar' ? "استبيان الطبيب البيطري (شريك معتمد)" : currentLang === 'en' ? "Veterinary Survey (Partner Pass)" : "Questionnaire Vétérinaire (Pass Partenaire)"}
                  </button>
                </li>
              )}
              <li>
                <button 
                  onClick={() => onNavigate('articles')} 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  📖 {t.navArticles || "Conseils & Articles Vétérinaires"}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('profile')} 
                  className="hover:text-amber-300 transition-colors cursor-pointer"
                >
                  🏆 {t.navProfile || "Mon Profil & Badges Débloqués"}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('dz-directory')} 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {t.navEmergencies || "Annuaire Vétérinaire (58 Wilayas)"}
                </button>
              </li>
            </ul>
          </div>

          {/* Demos & Contact */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-300 dark:text-slate-300 light:text-slate-800">
              {currentLang === 'ar' ? "المعاينة والتواصل" : currentLang === 'en' ? "Previews & Contact" : "Démonstrateurs & Équipe"}
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => onNavigate('owner-portal')} 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  📱 {t.navOwnerSpace || "Espace Propriétaire (Aperçu)"}
                </button>
              </li>
              {userRole === 'vet' && (
                <li>
                  <button 
                    onClick={() => onNavigate('vet-portal')} 
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    🩺 {t.navVetSpace || "Logiciel Cabinet (Aperçu)"}
                  </button>
                </li>
              )}
              <li className="pt-2">
                <button
                  onClick={onOpenContact}
                  className="text-cyan-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{DIAVET_OFFICIAL_EMAIL}</span>
                </button>
              </li>
              <li className="text-[11px] text-slate-500">
                Support technique & messagerie certifiée DiaVet DZ
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2026 DiaVet Algérie. {currentLang === 'ar' ? "جميع الحقوق محفوظة." : currentLang === 'en' ? "All rights reserved." : "Tous droits réservés."}
          </p>
          <div className="flex items-center gap-1">
            <span>{currentLang === 'ar' ? "صُنع بشغف لتعزيز صحة ورفاهية الحيوان في الجزائر" : currentLang === 'en' ? "Crafted with passion for animal welfare across Algeria" : "Fait avec passion pour le bien-être animal en Algérie"}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
}
