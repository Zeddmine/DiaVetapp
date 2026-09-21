import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Scale, TrendingUp, TrendingDown, Plus, Trash2, Calendar, Check, Info } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export interface WeightRecord {
  id: string;
  date: string;       // Formatted date: "18 Mar 2026"
  rawDate: string;    // "2026-03-18"
  weight: number;     // in kg
  note?: string;
}

interface PetWeightTrackerProps {
  petName: string;
  initialWeight?: number;
  onWeightChange?: (currentWeight: number) => void;
}

const DEFAULT_HISTORY: WeightRecord[] = [
  { id: 'w1', rawDate: '2025-11-10', date: '10 Nov 2025', weight: 27.2, note: 'Bilan automne' },
  { id: 'w2', rawDate: '2025-12-20', date: '20 Déc 2025', weight: 27.6, note: 'Pesée clinique' },
  { id: 'w3', rawDate: '2026-01-25', date: '25 Jan 2026', weight: 28.0, note: 'Contrôle hiver' },
  { id: 'w4', rawDate: '2026-02-28', date: '28 Fév 2026', weight: 28.2, note: 'Transition croquettes' },
  { id: 'w5', rawDate: '2026-03-21', date: '21 Mar 2026', weight: 28.4, note: 'Pesée de routine' },
];

export default function PetWeightTracker({
  petName,
  initialWeight = 28.4,
  onWeightChange
}: PetWeightTrackerProps) {
  const storageKey = `diavet_pet_weights_${petName.toLowerCase().replace(/\s+/g, '_')}`;

  const [records, setRecords] = useState<WeightRecord[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore JSON parse error
    }
    return DEFAULT_HISTORY;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [inputDate, setInputDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [inputNote, setInputNote] = useState('');
  const [formError, setFormError] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  // Save to localStorage whenever records change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(records));
    } catch {
      // ignore
    }
    if (records.length > 0) {
      const latest = records[records.length - 1].weight;
      onWeightChange?.(latest);
    }
  }, [records, storageKey, onWeightChange]);

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const val = parseFloat(inputWeight.replace(',', '.'));
    if (isNaN(val) || val <= 0 || val > 300) {
      setFormError('Veuillez renseigner un poids valide (ex: 28.5)');
      return;
    }

    if (!inputDate) {
      setFormError('Veuillez sélectionner une date');
      return;
    }

    // Format date in French
    const dateObj = new Date(inputDate + 'T12:00:00');
    const formattedDate = dateObj.toLocaleDateString('fr-DZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newEntry: WeightRecord = {
      id: 'w_' + Date.now(),
      rawDate: inputDate,
      date: formattedDate,
      weight: Math.round(val * 10) / 10,
      note: inputNote.trim() || undefined
    };

    // Sort chronologically
    const updated = [...records, newEntry].sort((a, b) => 
      a.rawDate.localeCompare(b.rawDate)
    );

    setRecords(updated);
    setInputWeight('');
    setInputNote('');
    setShowAddForm(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 3000);

    try {
      soundEngine.playSuccess();
    } catch {
      // ignore
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (records.length <= 1) return;
    const filtered = records.filter(r => r.id !== id);
    setRecords(filtered);
    try {
      soundEngine.playCyberClick();
    } catch {
      // ignore
    }
  };

  // Metrics
  const currentRecord = records.length > 0 ? records[records.length - 1] : null;
  const currentWeight = currentRecord ? currentRecord.weight : initialWeight;
  const firstRecord = records.length > 0 ? records[0] : null;
  const weightDiff = firstRecord && currentRecord ? Math.round((currentRecord.weight - firstRecord.weight) * 10) / 10 : 0;
  
  const minWeight = records.length > 0 ? Math.min(...records.map(r => r.weight)) : currentWeight;
  const maxWeight = records.length > 0 ? Math.max(...records.map(r => r.weight)) : currentWeight;

  return (
    <div className="rounded-3xl p-6 sm:p-7 border border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl shadow-xl space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Suivi du Poids & Évolution
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {petName}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Historique des pesées régulières avec analyse de la courbe de croissance
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            try { soundEngine.playCyberClick(); } catch {}
          }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Fermer le formulaire' : 'Enregistrer une pesée'}</span>
        </button>
      </div>

      {/* Success alert banner */}
      {justAdded && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold text-emerald-300 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Nouvelle pesée enregistrée avec succès dans le carnet !</span>
        </div>
      )}

      {/* Inline Form to add weight */}
      {showAddForm && (
        <form 
          onSubmit={handleAddWeight}
          className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Ajouter une nouvelle mesure</span>
            </h4>
            <span className="text-[11px] text-slate-400">Précision à 0.1 kg</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Poids (en kg) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="300"
                  placeholder="ex: 28.5"
                  value={inputWeight}
                  onChange={e => setInputWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400 transition-colors pr-10"
                  required
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  kg
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Date de pesée <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={inputDate}
                onChange={e => setInputDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Motif ou note (facultatif)
              </label>
              <input
                type="text"
                placeholder="ex: Pesée clinique, après régime..."
                value={inputNote}
                onChange={e => setInputNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {formError && (
            <p className="text-xs text-rose-400 font-medium">{formError}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/20 cursor-pointer transition-all"
            >
              Valider la pesée
            </button>
          </div>
        </form>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Poids Actuel
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-cyan-300">{currentWeight}</span>
            <span className="text-xs text-slate-400 font-bold">kg</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
            Dernière mesure : {currentRecord?.date || 'Récent'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Évolution Globale
          </span>
          <div className="flex items-center gap-1.5">
            {weightDiff > 0 ? (
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            ) : weightDiff < 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            ) : (
              <span className="text-slate-400 font-bold text-xs">=</span>
            )}
            <span className={`text-lg sm:text-xl font-black ${
              weightDiff > 0 ? 'text-cyan-300' : weightDiff < 0 ? 'text-emerald-300' : 'text-slate-300'
            }`}>
              {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Depuis la 1ère pesée
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Plage (Min - Max)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold text-slate-200">{minWeight} - {maxWeight}</span>
            <span className="text-xs text-slate-400 font-bold">kg</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {records.length} relevé{records.length > 1 ? 's' : ''} au total
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Statut Morphologique
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-black text-emerald-300">Poids Idéal</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Conforme au gabarit
          </span>
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <span>Courbe de progression pondérale</span>
          </h4>
          <span className="text-[11px] text-cyan-400 font-mono">
            Unité : Kilogrammes (kg)
          </span>
        </div>

        <div className="w-full h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={records} 
              margin={{ top: 12, right: 16, left: -20, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                dy={6}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                domain={[(dataMin: number) => Math.floor(dataMin - 1), (dataMax: number) => Math.ceil(dataMax + 1)]}
                unit=" kg"
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as WeightRecord;
                    return (
                      <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-xl text-xs space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-400">{data.date}</span>
                          <span className="font-black text-cyan-300 text-sm">{data.weight} kg</span>
                        </div>
                        {data.note && (
                          <p className="text-[11px] text-slate-300 italic pt-1 border-t border-white/10">
                            {data.note}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#06b6d4" 
                strokeWidth={3}
                dot={{ fill: '#0891b2', stroke: '#22d3ee', strokeWidth: 2, r: 4 }}
                activeDot={{ fill: '#22d3ee', stroke: '#ffffff', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Entries Log */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span>Historique des pesées récentes</span>
          <span>{records.length} entrées</span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {[...records].reverse().map((record) => (
            <div 
              key={record.id}
              className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-black text-xs">
                  {record.weight}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{record.weight} kg</span>
                    <span className="text-[10px] text-slate-400">· {record.date}</span>
                  </div>
                  {record.note && (
                    <p className="text-[11px] text-slate-400 leading-none mt-0.5">{record.note}</p>
                  )}
                </div>
              </div>

              {records.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteRecord(record.id)}
                  title="Supprimer cette mesure"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Advice Banner */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-200">Conseil DiaVet :</strong> Une pesée mensuelle régulière permet de détecter précocement d'éventuelles variations métaboliques ou dérèglements chez {petName}.
        </span>
      </div>

    </div>
  );
}
