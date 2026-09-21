import { useState } from 'react';
import { Language, UserFeedback } from '../types';
import { translations, getTranslations } from '../data/translations';
import { INITIAL_COMMUNITY_IDEAS } from '../data/ideasData';
import { ALGERIAN_WILAYAS } from '../data/mockData';
import { 
  Lightbulb, Star, ThumbsUp, Send, 
  ChevronLeft, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface IdeasSectionProps {
  currentLang: Language;
  onGoHome: () => void;
}

export default function IdeasSection({ currentLang, onGoHome }: IdeasSectionProps) {
  const t = getTranslations(currentLang);
  const isRtl = currentLang === 'ar';
  const isEn = currentLang === 'en';

  const [ideas, setIdeas] = useState<UserFeedback[]>(() => {
    try {
      const saved = localStorage.getItem('diavet_community_ideas');
      return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_IDEAS;
    } catch {
      return INITIAL_COMMUNITY_IDEAS;
    }
  });

  const [upvotedIds, setUpvotedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('diavet_upvoted_ideas');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filterType, setFilterType] = useState<string>('all');
  const [isSubmitOpen, setIsSubmitOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New feedback form
  const [formType, setFormType] = useState<'suggestion' | 'review' | 'idea' | 'feature_request'>('idea');
  const [formRole, setFormRole] = useState<'owner' | 'vet' | 'lover'>('owner');
  const [formRating, setFormRating] = useState<number>(5);
  const [formAuthor, setFormAuthor] = useState<string>('');
  const [formWilaya, setFormWilaya] = useState<string>('16 - Alger');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formMessage, setFormMessage] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const filteredIdeas = ideas.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const handleUpvote = (id: string) => {
    const alreadyUpvoted = upvotedIds.includes(id);
    const updatedUpvoted = alreadyUpvoted
      ? upvotedIds.filter(i => i !== id)
      : [...upvotedIds, id];
    setUpvotedIds(updatedUpvoted);
    try {
      localStorage.setItem('diavet_upvoted_ideas', JSON.stringify(updatedUpvoted));
    } catch {}

    setIdeas(prev => {
      const next = prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            upvotes: alreadyUpvoted ? item.upvotes - 1 : item.upvotes + 1
          };
        }
        return item;
      });
      try {
        localStorage.setItem('diavet_community_ideas', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthor.trim() || !formTitle.trim() || !formMessage.trim()) {
      setFormError(
        isRtl 
          ? 'يرجى إدخال اسمك، عنوان الفكرة وتفاصيل الرسالة.'
          : isEn
          ? 'Please provide your name, title, and feedback details.'
          : 'Veuillez renseigner votre nom, le titre et le contenu de votre idée.'
      );
      return;
    }

    const newIdea: UserFeedback = {
      id: `idea-${Date.now()}`,
      type: formType,
      authorName: formAuthor.trim(),
      userRole: formRole,
      wilaya: formWilaya,
      rating: formRating,
      title: formTitle.trim(),
      message: formMessage.trim(),
      upvotes: 1,
      submittedAt: isRtl ? 'الآن' : isEn ? 'Just now' : 'À l’instant',
      status: 'planned'
    };

    const updated = [newIdea, ...ideas];
    setIdeas(updated);
    try {
      localStorage.setItem('diavet_community_ideas', JSON.stringify(updated));
    } catch {}

    setIsSubmitOpen(false);
    setSuccessToast(
      isRtl
        ? `شكراً ${newIdea.authorName} ! تمت إضافة فكرتك إلى لوحة مجتمع DiaVet الجزائر بنجاح.`
        : isEn
        ? `Thank you ${newIdea.authorName}! Your suggestion has been added to the DiaVet community board.`
        : `Merci ${newIdea.authorName} ! Votre suggestion a été ajoutée au tableau communautaire.`
    );
    setTimeout(() => setSuccessToast(null), 5000);

    // Reset form
    setFormTitle('');
    setFormMessage('');
    setFormError(null);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-300 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Top Navigation */}
      <div className="mb-8">
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white mb-3 cursor-pointer"
        >
          <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          <span>{t.btnBack}</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{t.ideasBadge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {t.ideasTitle}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl">
              {t.ideasDesc}
            </p>
          </div>

          <button
            onClick={() => setIsSubmitOpen(!isSubmitOpen)}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Lightbulb className="w-4 h-4" />
            <span>{isSubmitOpen ? t.ideasBtnCloseForm : t.ideasBtnOpenForm}</span>
          </button>
        </div>
      </div>

      {/* Success banner */}
      {successToast && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Interactive Form Panel */}
      {isSubmitOpen && (
        <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-slate-950/90 border-2 border-amber-500/40 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
          <h3 className="text-xl font-black text-white mb-1">
            {t.ideasFormTitle}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            {t.ideasFormSubtitle}
          </p>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {t.ideasFormRole}
                </label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs cursor-pointer"
                >
                  <option value="owner">{t.ideasFormRoleOwner}</option>
                  <option value="vet">{t.ideasFormRoleVet}</option>
                  <option value="lover">{t.ideasFormRoleLover}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {t.ideasFormType}
                </label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs cursor-pointer"
                >
                  <option value="idea">{t.ideasFormTypeIdea}</option>
                  <option value="suggestion">{t.ideasFormTypeSuggestion}</option>
                  <option value="review">{t.ideasFormTypeReview}</option>
                  <option value="feature_request">{t.ideasFormTypeClinical}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {t.ideasFormRating}
                </label>
                <div className="flex items-center gap-1 p-2 bg-slate-900 rounded-xl border border-white/10">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className="cursor-pointer text-amber-400 p-0.5 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= formRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-300 mx-2">{formRating}/5</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {t.ideasFormAuthor}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.ideasFormAuthorPlaceholder}
                  value={formAuthor}
                  onChange={e => setFormAuthor(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {t.ideasFormWilaya}
                </label>
                <select
                  value={formWilaya}
                  onChange={e => setFormWilaya(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs cursor-pointer"
                >
                  {ALGERIAN_WILAYAS.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {t.ideasFormIdeaTitle}
              </label>
              <input
                type="text"
                required
                placeholder={t.ideasFormIdeaTitlePlaceholder}
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {t.ideasFormMessage}
              </label>
              <textarea
                required
                rows={3}
                placeholder={t.ideasFormMessagePlaceholder}
                value={formMessage}
                onChange={e => setFormMessage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                {t.adoptFormBtnCancel || "Annuler"}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{t.ideasFormBtnSubmit}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {[
          { id: 'all', label: t.ideasFilterAll },
          { id: 'idea', label: t.ideasFilterFeatures },
          { id: 'review', label: t.ideasFilterReviews },
          { id: 'suggestion', label: t.ideasFilterClinical }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterType(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterType === cat.id
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Ideas Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIdeas.map(item => {
          const isUpvoted = upvotedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-xl backdrop-blur-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {item.type === 'idea' 
                        ? (isRtl ? '💡 فكرة' : isEn ? '💡 Idea' : '💡 Idée') 
                        : item.type === 'review' 
                        ? (isRtl ? '⭐ تقييم' : isEn ? '⭐ Review' : '⭐ Avis') 
                        : (isRtl ? '✨ مقترح' : isEn ? '✨ Suggestion' : '✨ Suggestion')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {item.wilaya}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <h3 className="text-base font-black text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{item.message}</p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  {isRtl ? "بواسطة " : isEn ? "By " : "Par "}<strong className="text-white">{item.authorName}</strong> ({item.userRole === 'vet' ? (isRtl ? 'د. بيطري' : isEn ? 'Dr. Vet' : 'Dr. Vétérinaire') : (isRtl ? 'مربي' : isEn ? 'Pet Owner' : 'Propriétaire')}) · {item.submittedAt}
                </div>

                {/* Upvote Button */}
                <button
                  onClick={() => handleUpvote(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isUpvoted
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{item.upvotes}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
