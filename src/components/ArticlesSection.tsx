import { useState } from 'react';
import { Language, Article } from '../types';
import { translations } from '../data/translations';
import { 
  BookOpen, Bookmark, Heart, Search, Filter, Plus, 
  Clock, Calendar, User, ChevronLeft, X, Check, 
  Sparkles, ShieldCheck, Share2, Tag, ArrowRight, ExternalLink
} from 'lucide-react';

interface ArticlesSectionProps {
  currentLang: Language;
  articles: Article[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onAddArticle: (article: Article) => void;
  onGoHome: () => void;
}

export default function ArticlesSection({
  currentLang,
  articles,
  favoriteIds,
  onToggleFavorite,
  onAddArticle,
  onGoHome
}: ArticlesSectionProps) {
  const t = translations[currentLang];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Admin New Article Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'health' | 'nutrition' | 'care' | 'emergency'>('health');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('Dr. Amine Benali');
  const [newAuthorRole, setNewAuthorRole] = useState('Clinique Vétérinaire El Biar, Alger');
  const [newReadTime, setNewReadTime] = useState('4 min');
  const [newImageUrl, setNewImageUrl] = useState('https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800');
  const [newTags, setNewTags] = useState('Santé, Prévention, Algérie');

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || favoriteIds.includes(article.id);

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim() || !newContent.trim()) return;

    const created: Article = {
      id: `art-${Date.now()}`,
      title: newTitle.trim(),
      summary: newSummary.trim(),
      content: newContent.trim(),
      category: newCategory,
      author: newAuthor.trim() || 'Dr. Vétérinaire DiaVet',
      authorRole: newAuthorRole.trim() || 'Réseau Praticiens Algérie',
      readTime: newReadTime.trim() || '3 min',
      imageUrl: newImageUrl.trim() || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800',
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      isVetVerified: true
    };

    onAddArticle(created);
    setShowAdminModal(false);

    // Reset form
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
  };

  const loadAdminTemplate = () => {
    setNewTitle('Guide de vermifugation des chiots et chatons en Algérie');
    setNewCategory('care');
    setNewSummary('Le protocole indispensable dès l\'âge de 15 jours pour éviter les retards de croissance et les zoonoses transmissibles aux enfants.');
    setNewContent(`## L'importance vitale du déparasitage précoce

En Algérie, les ascaris (Toxocara canis/cati) infectent près de 90% des jeunes chiots et chatons dès la naissance via le placenta ou l'allaitement. 

### Calendrier recommandé par les vétérinaires :
- **Dès l'âge de 15 jours :** Premier vermifuge en pâte orale.
- **Puis tous les 15 jours :** À 1 mois, 1 mois et demi et 2 mois.
- **De 2 à 6 mois :** Une fois par mois sans faute.
- **À l'âge adulte :** Au moins 4 fois par an (à chaque changement de saison).

### Choix du vermifuge :
Consultez toujours votre vétérinaire avant d'administrer un produit. Ne donnez jamais de vermifuge pour grand chien à un chiot ou un chat (risque d'intoxication létale à l'ivermectine ou pyréthrinoïdes).`);
    setNewAuthor('Dr. Sarah Khelifi');
    setNewAuthorRole('Cabinet Bahia Pets, Oran');
    setNewReadTime('3 min');
    setNewImageUrl('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800');
    setNewTags('Vermifuge, Chiots, Chatons, Soins préventifs');
  };

  const handleShare = (article: Article) => {
    navigator.clipboard?.writeText(`https://diavet.dz/articles/${article.id}`);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const getCategoryBadge = (cat: Article['category']) => {
    switch (cat) {
      case 'emergency':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'nutrition':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'care':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'health':
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  const getCategoryLabel = (cat: Article['category']) => {
    switch (cat) {
      case 'emergency': return 'Urgence Vitale';
      case 'nutrition': return 'Nutrition & Régime';
      case 'care': return 'Soins & Hygiène';
      case 'health': default: return 'Santé & Médecine';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white mb-2 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.btnBack}</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
              Conseils & Articles
            </h1>
            <span className="hidden sm:inline-block text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
              Rédigé par des vétérinaires DZ
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl">
            Guides cliniques, bonnes pratiques de nutrition et fiches d'urgence adaptées au climat et aux réalités de l'Algérie.
          </p>
        </div>

        {/* Action Controls: Admin Add Article */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="admin-add-article-btn"
            onClick={() => setShowAdminModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un article (Admin / Véto)</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-xl mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Keyword Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par mot-clé (chaleur, vaccin, alimentation, dentisterie...)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Category Selector Chips */}
          <div className="md:col-span-4 flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'health', label: 'Santé' },
              { id: 'nutrition', label: 'Nutrition' },
              { id: 'care', label: 'Soins' },
              { id: 'emergency', label: 'Urgences' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Favorites Only Toggle */}
          <div className="md:col-span-2 flex items-center">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`w-full py-3 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                showFavoritesOnly
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/20'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>Favoris ({favoriteIds.length})</span>
            </button>
          </div>

        </div>
      </div>

      {/* FEATURED ARTICLE HERO (If no active filter) */}
      {!searchTerm && selectedCategory === 'all' && !showFavoritesOnly && featuredArticle && (
        <div className="relative rounded-[2.5rem] overflow-hidden border border-cyan-500/30 bg-slate-950/80 shadow-2xl mb-12 group">
          <div className="grid md:grid-cols-12 items-center">
            
            {/* Image Banner */}
            <div className="md:col-span-7 relative h-72 sm:h-96 overflow-hidden">
              <img
                src={featuredArticle.imageUrl}
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500 text-slate-950 shadow-md">
                  À la une
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(featuredArticle.category)}`}>
                  {getCategoryLabel(featuredArticle.category)}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="md:col-span-5 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{featuredArticle.readTime} de lecture</span>
                <span>•</span>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{featuredArticle.date}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {featuredArticle.title}
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-3">
                {featuredArticle.summary}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <div className="text-xs">
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{featuredArticle.author}</span>
                  </p>
                  <p className="text-[10px] text-slate-400">{featuredArticle.authorRole}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleFavorite(featuredArticle.id)}
                    className="p-2.5 rounded-xl border border-white/10 bg-slate-900 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Ajouter aux favoris"
                  >
                    <Bookmark className={`w-4 h-4 ${favoriteIds.includes(featuredArticle.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  <button
                    onClick={() => setSelectedArticle(featuredArticle)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 hover:from-blue-500 hover:to-cyan-400 transition-all cursor-pointer"
                  >
                    <span>Lire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ARTICLES GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(article => {
          const isFav = favoriteIds.includes(article.id);
          return (
            <div
              key={article.id}
              className="group rounded-3xl border border-white/10 bg-slate-950/70 hover:border-cyan-500/40 backdrop-blur-xl transition-all duration-300 shadow-lg flex flex-col justify-between overflow-hidden"
            >
              {/* Card Media */}
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${getCategoryBadge(article.category)}`}>
                      {getCategoryLabel(article.category)}
                    </span>

                    {/* Bookmark Toggle Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(article.id);
                      }}
                      className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                        isFav
                          ? 'bg-rose-500/80 text-white border-rose-400 shadow-md shadow-rose-500/30'
                          : 'bg-slate-950/70 text-slate-300 hover:text-white border-white/10 hover:border-white/30'
                      }`}
                      title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-3 flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{article.readTime}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2.5">
                  <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {article.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] font-medium text-slate-400 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs">
                  <p className="font-bold text-slate-200 text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>{article.author}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{article.authorRole}</p>
                </div>

                <button
                  onClick={() => setSelectedArticle(article)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-bold border border-white/10 hover:border-cyan-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Lire l'article</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-16 text-slate-400 bg-slate-950/40 rounded-3xl border border-white/5 p-8">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-lg font-bold text-white">Aucun article ne correspond à votre recherche.</p>
          <p className="text-xs mt-1">Modifiez vos critères ou retirez le filtre des favoris.</p>
        </div>
      )}

      {/* FULL ARTICLE READING MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-950 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-y-auto flex flex-col">
            
            {/* Modal Header Image */}
            <div className="relative h-64 sm:h-80 shrink-0">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-950/80 text-white hover:bg-slate-900 border border-white/20 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(selectedArticle.category)}`}>
                  {getCategoryLabel(selectedArticle.category)}
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-white mt-2 leading-tight">
                  {selectedArticle.title}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 flex-1">
              
              {/* Meta bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-slate-300">
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{selectedArticle.author}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">{selectedArticle.authorRole}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {selectedArticle.readTime}
                  </span>

                  <button
                    onClick={() => onToggleFavorite(selectedArticle.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      favoriteIds.includes(selectedArticle.id)
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${favoriteIds.includes(selectedArticle.id) ? 'fill-rose-400 text-rose-400' : ''}`} />
                    <span>{favoriteIds.includes(selectedArticle.id) ? 'Favori' : 'Sauvegarder'}</span>
                  </button>

                  <button
                    onClick={() => handleShare(selectedArticle)}
                    className="p-1.5 rounded-xl bg-white/5 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                    title="Partager"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {copiedNotification && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center">
                  ✓ Lien de l'article copié dans votre presse-papier !
                </div>
              )}

              {/* Formatted Content */}
              <div className="prose prose-invert prose-cyan max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                {selectedArticle.content.split('\n\n').map((block, idx) => {
                  if (block.startsWith('## ')) {
                    return <h3 key={idx} className="text-lg sm:text-xl font-bold text-white pt-2">{block.replace('## ', '')}</h3>;
                  }
                  if (block.startsWith('### ')) {
                    return <h4 key={idx} className="text-base font-bold text-cyan-300 pt-1">{block.replace('### ', '')}</h4>;
                  }
                  if (block.startsWith('- ')) {
                    const items = block.split('\n');
                    return (
                      <ul key={idx} className="list-disc list-inside space-y-1 pl-2 text-slate-300">
                        {items.map((item, i) => (
                          <li key={i}>{item.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.match(/^[0-9]\. /)) {
                    const items = block.split('\n');
                    return (
                      <ol key={idx} className="list-decimal list-inside space-y-1 pl-2 text-slate-300">
                        {items.map((item, i) => (
                          <li key={i}>{item.replace(/^[0-9]\. /, '')}</li>
                        ))}
                      </ol>
                    );
                  }
                  return <p key={idx}>{block}</p>;
                })}
              </div>

              {/* Tags */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Mots-clés :</span>
                {selectedArticle.tags.map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                    #{t}
                  </span>
                ))}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-white/10 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Fermer la lecture
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADMINISTRATOR ADD ARTICLE MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-950 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-y-auto flex flex-col p-6 sm:p-8">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  ✍️
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">Espace Administrateur & Vétérinaire</h3>
                  <p className="text-xs text-slate-400">Publier un nouvel article ou conseil médical sur DiaVet</p>
                </div>
              </div>

              <button
                onClick={() => setShowAdminModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Demo Pre-fill */}
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-medium">Remplir rapidement avec un exemple médical validé :</span>
              <button
                type="button"
                onClick={loadAdminTemplate}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                Charger un exemple
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateArticle} className="space-y-4 text-xs sm:text-sm">
              
              <div>
                <label className="block font-bold text-slate-300 mb-1">Titre de l'article :</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex : Guide de prévention contre la parvovirose..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Catégorie :</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="health">Santé & Médecine</option>
                    <option value="nutrition">Nutrition & Alimentation</option>
                    <option value="care">Soins & Hygiène</option>
                    <option value="emergency">Urgence Vitale</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Temps de lecture estimé :</label>
                  <input
                    type="text"
                    value={newReadTime}
                    onChange={e => setNewReadTime(e.target.value)}
                    placeholder="Ex : 4 min"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Auteur (Vétérinaire) :</label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={e => setNewAuthor(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Établissement / Wilaya :</label>
                  <input
                    type="text"
                    value={newAuthorRole}
                    onChange={e => setNewAuthorRole(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Image de couverture (URL) :</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Résumé court :</label>
                <textarea
                  rows={2}
                  required
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  placeholder="Bref résumé accrocheur affiché sur la carte..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Contenu complet de l'article (Supporte les titres ## et listes -) :</label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Écrivez le corps médical de l'article ici..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-400 font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Mots-clés (séparés par des virgules) :</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="Chiens, Vaccin, Urgence, Algérie..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Publier l'article en direct</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
