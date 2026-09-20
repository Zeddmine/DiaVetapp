import { useState } from 'react';
import { Language, AdoptionPet } from '../types';
import { translations } from '../data/translations';
import { INITIAL_ADOPTION_PETS } from '../data/adoptionData';
import { ALGERIAN_WILAYAS } from '../data/mockData';
import { 
  Heart, MapPin, Phone, ShieldCheck, Filter, Search, 
  ChevronLeft, Plus, X, Sparkles, CheckCircle2, AlertTriangle, MessageCircle
} from 'lucide-react';

interface AdoptionSectionProps {
  currentLang: Language;
  onGoHome: () => void;
}

export default function AdoptionSection({ currentLang, onGoHome }: AdoptionSectionProps) {
  const t = translations[currentLang];
  const [pets, setPets] = useState<AdoptionPet[]>(() => {
    try {
      const saved = localStorage.getItem('diavet_adoption_pets');
      return saved ? JSON.parse(saved) : INITIAL_ADOPTION_PETS;
    } catch {
      return INITIAL_ADOPTION_PETS;
    }
  });

  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat' | 'other'>('all');
  const [selectedWilaya, setSelectedWilaya] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPetForContact, setSelectedPetForContact] = useState<AdoptionPet | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New pet submission form state
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'dog' | 'cat' | 'bird' | 'horse' | 'other'>('cat');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetAge, setNewPetAge] = useState('');
  const [newPetGender, setNewPetGender] = useState<'Mâle' | 'Femelle'>('Mâle');
  const [newPetWilaya, setNewPetWilaya] = useState('16 - Alger');
  const [newPetCity, setNewPetCity] = useState('');
  const [newPetPhone, setNewPetPhone] = useState('');
  const [newPetDesc, setNewPetDesc] = useState('');
  const [newPetVaccinated, setNewPetVaccinated] = useState(true);
  const [newPetSterilized, setNewPetSterilized] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredPets = pets.filter(pet => {
    const matchesSpecies = selectedSpecies === 'all' || pet.species === selectedSpecies;
    const matchesWilaya = selectedWilaya === 'all' || pet.wilaya === selectedWilaya;
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pet.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pet.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecies && matchesWilaya && matchesSearch;
  });

  const handleCreatePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim() || !newPetCity.trim() || !newPetPhone.trim() || !newPetDesc.trim()) {
      setFormError('Veuillez remplir tous les champs obligatoires (nom, ville, téléphone et description).');
      return;
    }

    const defaultImg = newPetSpecies === 'dog'
      ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800'
      : newPetSpecies === 'cat'
      ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800'
      : 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=800';

    const newPet: AdoptionPet = {
      id: `adopt-user-${Date.now()}`,
      name: newPetName.trim(),
      species: newPetSpecies,
      breed: newPetBreed.trim() || 'Croisé / Européen',
      age: newPetAge.trim() || 'Non précisé',
      gender: newPetGender,
      wilaya: newPetWilaya,
      city: newPetCity.trim(),
      imageUrl: defaultImg,
      description: newPetDesc.trim(),
      isVaccinated: newPetVaccinated,
      isSterilized: newPetSterilized,
      associationOrOwner: 'Particulier Bienveillant',
      contactPhone: newPetPhone.trim(),
      publishedDate: 'À l’instant'
    };

    const updated = [newPet, ...pets];
    setPets(updated);
    try {
      localStorage.setItem('diavet_adoption_pets', JSON.stringify(updated));
    } catch {}

    setIsAddModalOpen(false);
    setSuccessMessage(`L'annonce d'adoption pour « ${newPet.name} » a été publiée avec succès !`);
    setTimeout(() => setSuccessMessage(null), 5000);

    // Reset form
    setNewPetName('');
    setNewPetBreed('');
    setNewPetAge('');
    setNewPetCity('');
    setNewPetPhone('');
    setNewPetDesc('');
    setFormError(null);
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold mb-2">
              <Heart className="w-3.5 h-3.5 fill-rose-400 animate-pulse" />
              <span>Adoption Solidaire & Sauvetage · Algérie 🇩🇿</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Offrez-leur une Seconde Chance
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl">
              Trouvez votre futur compagnon de vie parmi les animaux rescapés par des bénévoles et refuges partenaires à travers les 58 Wilayas d'Algérie.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Proposer un animal à l'adoption</span>
          </button>
        </div>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-xl mb-8 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Species tabs */}
          <div className="md:col-span-4 flex items-center bg-slate-900 p-1 rounded-2xl border border-white/10">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'dog', label: '🐕 Chiens' },
              { id: 'cat', label: '🐈 Chats' },
              { id: 'other', label: '🐰 NAC' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedSpecies(tab.id as any)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  selectedSpecies === tab.id
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par prénom, race, ville ou mot-clé..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Wilaya Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedWilaya}
              onChange={e => setSelectedWilaya(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-rose-400 cursor-pointer"
            >
              <option value="all">Toutes les wilayas</option>
              {ALGERIAN_WILAYAS.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
          <span>{filteredPets.length} animaux en attente d'un foyer aimant</span>
          <span className="text-rose-400 font-semibold">Adoption 100% responsable & gratuite</span>
        </div>
      </div>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPets.map(pet => (
          <div
            key={pet.id}
            className="rounded-3xl bg-slate-950/80 border border-white/10 hover:border-rose-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-xl backdrop-blur-xl"
          >
            <div>
              {/* Pet Photo */}
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                
                {pet.isUrgent && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-lg animate-pulse">
                    Urgent Sauvetage
                  </span>
                )}

                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                  {pet.gender} · {pet.age}
                </span>

                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-2xl font-black text-white">{pet.name}</h3>
                  <p className="text-xs text-slate-300 font-medium">{pet.breed}</p>
                </div>
              </div>

              {/* Body details */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{pet.city}, <strong>{pet.wilaya}</strong></span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {pet.description}
                </p>

                {/* Health badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pet.isVaccinated && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      ✓ Vacciné
                    </span>
                  )}
                  {pet.isSterilized && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      ✓ Stérilisé
                    </span>
                  )}
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                    {pet.associationOrOwner}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 pt-0">
              <button
                onClick={() => setSelectedPetForContact(pet)}
                className="w-full py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-extrabold text-xs transition-all border border-rose-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Rencontrer & Adopter {pet.name}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {filteredPets.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-950/60 border border-white/10">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-white font-bold text-base">Aucun animal trouvé pour ces critères</p>
          <p className="text-slate-400 text-xs mt-1">
            Essayez de sélectionner « Toutes les wilayas » ou proposez un animal rescapé à l'adoption.
          </p>
        </div>
      )}

      {/* ADOPTION CONTACT MODAL */}
      {selectedPetForContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-rose-500/40 p-6 sm:p-8 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedPetForContact(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Adopter {selectedPetForContact.name}</h3>
                <p className="text-xs text-slate-400">{selectedPetForContact.city}, {selectedPetForContact.wilaya}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Pour rencontrer <strong>{selectedPetForContact.name}</strong> et organiser une adoption responsable, contactez directement son tuteur ou l'association en charge :
            </p>

            <div className="space-y-3 mb-6">
              <a
                href={`tel:${selectedPetForContact.contactPhone}`}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Appeler : {selectedPetForContact.contactPhone}</span>
              </a>

              <a
                href={`https://wa.me/213${selectedPetForContact.contactPhone.replace(/\D/g, '').replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-emerald-500/30"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Écrire sur WhatsApp</span>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400">
              💡 <em>L'adoption d'un animal est un engagement sur 10 à 15 ans. DiaVet encourage les adoptions bienveillantes, la stérilisation et le suivi vaccinal obligatoire en Algérie.</em>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ADOPTION PET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="max-w-lg w-full rounded-3xl bg-slate-900 border border-white/20 p-6 sm:p-8 shadow-2xl relative my-8 text-left">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-black text-white mb-1">Publier un Animal à l'Adoption</h3>
            <p className="text-xs text-slate-400 mb-6">Gratuit pour les particuliers, refuges et sauveteurs en Algérie.</p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePet} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Prénom de l'animal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Caramel, Max..."
                    value={newPetName}
                    onChange={e => setNewPetName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Espèce *</label>
                  <select
                    value={newPetSpecies}
                    onChange={e => setNewPetSpecies(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs cursor-pointer"
                  >
                    <option value="cat">Chat</option>
                    <option value="dog">Chien</option>
                    <option value="other">Lapin / Rongeur / Oiseau</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Race ou type</label>
                  <input
                    type="text"
                    placeholder="Ex: Européen, Berger..."
                    value={newPetBreed}
                    onChange={e => setNewPetBreed(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Âge approximatif</label>
                  <input
                    type="text"
                    placeholder="Ex: 6 mois, 2 ans..."
                    value={newPetAge}
                    onChange={e => setNewPetAge(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Wilaya *</label>
                  <select
                    value={newPetWilaya}
                    onChange={e => setNewPetWilaya(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs cursor-pointer"
                  >
                    {ALGERIAN_WILAYAS.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Commune / Ville *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Kouba, Canastel..."
                    value={newPetCity}
                    onChange={e => setNewPetCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Numéro de téléphone contact *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 0550 12 34 56"
                  value={newPetPhone}
                  onChange={e => setNewPetPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Histoire & Caractère *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Décrivez son caractère, ses ententes avec d'autres animaux, son état de santé..."
                  value={newPetDesc}
                  onChange={e => setNewPetDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPetVaccinated}
                    onChange={e => setNewPetVaccinated(e.target.checked)}
                    className="rounded text-rose-600 cursor-pointer"
                  />
                  <span>Vacciné</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPetSterilized}
                    onChange={e => setNewPetSterilized(e.target.checked)}
                    className="rounded text-rose-600 cursor-pointer"
                  />
                  <span>Stérilisé</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  Publier l'annonce d'adoption
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
