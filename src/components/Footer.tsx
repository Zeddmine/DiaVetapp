import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { 
  Heart, 
  Instagram, 
  Mail, 
  Database, 
  MessageCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import DiaVetLogo from './DiaVetLogo';
import { DIAVET_OFFICIAL_EMAIL } from '../services/firebase';
import { FAQ_DATA, FAQ_CATEGORIES, FAQCategory } from '../data/faq';

interface FooterProps {
  currentLang: Language;
  userRole?: 'owner' | 'vet';
  onNavigate: (screen: any) => void;
  onOpenContact?: () => void;
}

export default function Footer({ currentLang, userRole = 'owner', onNavigate, onOpenContact }: FooterProps) {
  const t = translations[currentLang] || translations.fr;
  const isRtl = currentLang === 'ar';
  const isEn = currentLang === 'en';

  // FAQ Component States
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>('all');
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(['faq-1']);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');

  const toggleFaq = (id: string) => {
    setOpenFaqIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const qText = (item.question[currentLang] || item.question.fr).toLowerCase();
      const aText = (item.answer[currentLang] || item.answer.fr).toLowerCase();
      const query = faqSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || qText.includes(query) || aText.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, faqSearchQuery, currentLang]);

  return (
    <footer className={`border-t border-white/10 dark:border-white/10 light:border-slate-200 bg-slate-950/90 dark:bg-slate-950/90 light:bg-slate-50 mt-16 sm:mt-24 transition-colors relative z-10 backdrop-blur-md ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* ========================================================================= */}
      {/* FOIRE AUX QUESTIONS (FAQ) SECTION EMBEDDED IN FOOTER                      */}
      {/* ========================================================================= */}
      <div id="diavet-faq-section" className="border-b border-white/10 dark:border-white/10 light:border-slate-200 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          
          {/* Header FAQ */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-3">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>
                  {isRtl ? "مركز المساعدة والاستفسارات · الجزائر 🇩🇿" : isEn ? "Help Center & FAQ · Algeria 🇩🇿" : "Centre d'Aide & Questions Fréquentes · Algérie 🇩🇿"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
                {isRtl ? "الأسئلة الشائعة (FAQ)" : isEn ? "Frequently Asked Questions (FAQ)" : "Foire Aux Questions (FAQ)"}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                {isRtl 
                  ? "كل ما تود معرفته حول دفتر الصحة الرقمي، دليل العيادات بالـ 58 ولاية، بطاقة VIP والخدمات البيطرية المعتمدة."
                  : isEn
                  ? "Everything you need to know about the digital health passport, 58 Wilayas clinic directory, VIP Pass, and verified veterinary care."
                  : "Tout ce qu'il faut savoir sur le carnet de santé digital, l'annuaire des cliniques dans les 58 Wilayas, le Pass VIP et les outils vétérinaires."}
              </p>
            </div>

            {/* Quick Search */}
            <div className="w-full md:w-80 relative">
              <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder={isRtl ? "ابحث في الأسئلة..." : isEn ? "Search questions..." : "Rechercher une question..."}
                className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 rounded-2xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-colors`}
              />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            {FAQ_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label[currentLang] || cat.label.fr}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion List */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqIds.includes(faq.id);
                const question = faq.question[currentLang] || faq.question.fr;
                const answer = faq.answer[currentLang] || faq.answer.fr;
                const badge = faq.badge ? (faq.badge[currentLang] || faq.badge.fr) : null;

                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'bg-slate-950 dark:bg-slate-950 light:bg-white border-cyan-500/30 light:border-cyan-600/30 shadow-lg shadow-cyan-500/5'
                        : 'bg-slate-950/50 dark:bg-slate-950/50 light:bg-white/80 border-white/5 light:border-slate-200 hover:border-white/15 light:hover:border-slate-300'
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className={`w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors ${isRtl ? 'text-right' : 'text-left'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${isOpen ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span className="text-xs sm:text-sm font-black text-white dark:text-white light:text-slate-900">
                          {question}
                        </span>
                        {badge && (
                          <span className="hidden sm:inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                            {badge}
                          </span>
                        )}
                      </div>

                      <div className="p-1.5 rounded-lg bg-white/5 light:bg-slate-100 text-slate-400 light:text-slate-600 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-300 sm:text-sm leading-relaxed border-t border-white/5 light:border-slate-100 animate-in fade-in duration-200">
                        <p className="max-w-4xl text-slate-300 dark:text-slate-300 light:text-slate-700 font-normal">
                          {answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-white/5">
              <p className="text-slate-400 text-xs">
                {isRtl ? "لم يتم العثور على أي سؤال يطابق البحث." : isEn ? "No questions match your search query." : "Aucune question trouvée pour cette recherche."}
              </p>
            </div>
          )}

          {/* Need help badge */}
          <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {isRtl ? "هل لديك سؤال آخر لم تجد إجابته هنا؟" : isEn ? "Have another question not answered here?" : "Vous avez une autre question spécifique ?"}
              </span>
            </div>
            <button
              onClick={onOpenContact}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{isRtl ? "تواصل مع فريق الدعم" : isEn ? "Contact Support" : "Écrire au support"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN FOOTER NAVIGATION & BRANDING                                        */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <DiaVetLogo size="md" variant="visitor" />
              <span className="text-2xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
                Dia<span className="text-emerald-400">Vet</span>
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

              <div
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold"
              >
                <MessageCircle className="w-4 h-4 text-amber-400" />
                <span>WhatsApp DZ</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
                  {currentLang === 'ar' ? 'قيد التطوير' : currentLang === 'en' ? 'In Dev' : 'En dev'}
                </span>
              </div>
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
                  onClick={() => onNavigate('videos')} 
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  🎬 {currentLang === 'ar' ? "فيديوهات DiaVet TV وتدريب" : currentLang === 'en' ? "DiaVet TV & Video Masterclasses" : "DiaVet TV & Vidéos Masterclasses"}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('adoption')} 
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  🐾 {isRtl ? "التبني والإنقاذ" : isEn ? "Pet Adoption" : "Adoption Solidaire"}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('marketplace')} 
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  🛒 {isRtl ? "المتجر والمنتجات" : isEn ? "Marketplace" : "Marketplace Vétérinaire"}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('ideas')} 
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  💡 {isRtl ? "صندوق الأفكار" : isEn ? "Ideas Box" : "Boîte à Idées"}
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
