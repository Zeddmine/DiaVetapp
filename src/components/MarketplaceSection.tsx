import { useState } from 'react';
import { Language, MarketplaceItem } from '../types';
import { translations } from '../data/translations';
import { INITIAL_MARKETPLACE_ITEMS, UPCOMING_SERVICES } from '../data/marketplaceData';
import { 
  ShoppingBag, Sparkles, Filter, Search, ChevronLeft, 
  CheckCircle2, Clock, Truck, ShieldCheck, Tag, Star, Bell, ArrowRight
} from 'lucide-react';

interface MarketplaceSectionProps {
  currentLang: Language;
  onGoHome: () => void;
}

export default function MarketplaceSection({ currentLang, onGoHome }: MarketplaceSectionProps) {
  const t = translations[currentLang];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [preorderModalItem, setPreorderModalItem] = useState<MarketplaceItem | null>(null);
  const [notificationEmailOrPhone, setNotificationEmailOrPhone] = useState('');
  const [preorderSuccess, setPreorderSuccess] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Tout voir' },
    { id: 'nutrition', label: '🥩 Nutrition & Croquettes' },
    { id: 'antiparasitaire', label: '🛡️ Antiparasitaires DZ' },
    { id: 'accessoire', label: '🎒 Transport & Confort' },
    { id: 'hygiene', label: '✨ Hygiène & Litières' }
  ];

  const filteredItems = INITIAL_MARKETPLACE_ITEMS.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationEmailOrPhone.trim()) return;

    setPreorderSuccess(`Votre demande d’alerte pour « ${preorderModalItem?.name} » est bien enregistrée !`);
    setPreorderModalItem(null);
    setNotificationEmailOrPhone('');
    setTimeout(() => setPreorderSuccess(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white mb-3 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t.btnBack}</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
              <ShoppingBag className="w-3.5 h-3.5 animate-bounce" />
              <span>Boutique Animalerie Officielle & Nouveautés · Algérie 🇩🇿</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Marketplace & Produits Vétérinaires
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl">
              Alimentation certifiée, antiparasitaires aux normes algériennes et accessoires livrés directement chez vous ou en retrait clinique dans les 58 Wilayas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>Livraison 58 Wilayas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {preorderSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{preorderSuccess}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 scale-105'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="rounded-3xl bg-slate-950/80 border border-white/10 hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-xl backdrop-blur-xl"
          >
            <div>
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                
                {item.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg">
                    {item.badge}
                  </span>
                )}

                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">{item.brand}</span>
                  <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded-lg border border-white/10">
                    <Star className="w-3 h-3 fill-amber-300" />
                    <span>{item.rating}</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Price & Action */}
            <div className="p-4 pt-0">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {item.priceDzd.toLocaleString()} DZD
                </span>
                {item.oldPriceDzd && (
                  <span className="text-xs text-slate-500 line-through font-mono">
                    {item.oldPriceDzd.toLocaleString()} DZD
                  </span>
                )}
              </div>

              <button
                onClick={() => setPreorderModalItem(item)}
                className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs transition-all border border-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Commander / Réserver</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* UPCOMING SERVICES SECTION ("Trucs prochain" requested by user) */}
      <div className="p-6 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Feuille de Route & Nouveautés en Préparation</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Les Prochains Services DiaVet en Algérie
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2">
            Voici les nouveaux services en cours de finalisation avec les professionnels conventionnés. Inscrivez-vous pour bénéficier d'un accès anticipé réservé aux porteurs du Pass VIP.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {UPCOMING_SERVICES.map(srv => (
            <div
              key={srv.id}
              className="p-6 rounded-3xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-2xl flex items-center justify-center shrink-0">
                    {srv.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {srv.badge}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white mb-1">{srv.title}</h3>
                <p className="text-xs font-semibold text-emerald-400 mb-2">{srv.subtitle}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{srv.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Lancement prévu : <strong>{srv.availableDate}</strong></span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  Inclus dans le Pass VIP ✓
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRE-ORDER MODAL */}
      {preorderModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl relative text-left">
            <h3 className="text-xl font-black text-white mb-1">Pré-commander / Réserver</h3>
            <p className="text-xs text-slate-400 mb-4">{preorderModalItem.name} — <strong className="text-emerald-400">{preorderModalItem.priceDzd} DZD</strong></p>

            <form onSubmit={handleNotifyMe} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Votre Numéro Téléphone DZ ou Email *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 0550 12 34 56 ou contact@email.com"
                  value={notificationEmailOrPhone}
                  onChange={e => setNotificationEmailOrPhone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Notre équipe logistique vous contactera par SMS / WhatsApp dès validation de la disponibilité dans votre Wilaya.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPreorderModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  Confirmer ma réservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
