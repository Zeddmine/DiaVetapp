import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Download, Search, Users, ShieldCheck, 
  X, RefreshCw, CheckCircle2, Phone, MapPin, Calendar, Heart, Stethoscope
} from 'lucide-react';
import { AdminLead, Language } from '../types';
import { getAdminLeads, exportLeadsToExcel, exportLeadsToCsv, exportLeadsToJson } from '../services/adminDb';
import { soundEngine } from '../utils/soundEngine';

interface ExcelLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang?: Language;
}

export default function ExcelLeadsModal({
  isOpen,
  onClose,
  currentLang = 'fr'
}: ExcelLeadsModalProps) {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'vet'>('all');
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLeads(getAdminLeads());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLeads = leads.filter(lead => {
    const matchesRole = roleFilter === 'all' || lead.role === roleFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesRole;

    const matchesQuery = 
      (lead.name || '').toLowerCase().includes(query) ||
      (lead.phone || '').toLowerCase().includes(query) ||
      (lead.wilaya || '').toLowerCase().includes(query) ||
      (lead.petNameOrClinic || '').toLowerCase().includes(query) ||
      (lead.vipCode || '').toLowerCase().includes(query);

    return matchesRole && matchesQuery;
  });

  const handleExcelExport = () => {
    soundEngine.playSuccess();
    exportLeadsToExcel(leads);
  };

  const handleCsvExport = () => {
    soundEngine.playCyberClick();
    exportLeadsToCsv(leads);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Registre Officiel DiaVet Algérie
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Export Excel & CSV
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {leads.length} membres enregistrés (Propriétaires & Vétérinaires 58 Wilayas)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Search */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, wilaya, téléphone, pass..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs sm:text-sm text-white focus:border-emerald-400 outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                roleFilter === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous ({leads.length})
            </button>
            <button
              onClick={() => setRoleFilter('owner')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                roleFilter === 'owner' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>Propriétaires ({leads.filter(l => l.role === 'owner').length})</span>
            </button>
            <button
              onClick={() => setRoleFilter('vet')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                roleFilter === 'vet' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3 h-3" />
              <span>Vétérinaires ({leads.filter(l => l.role === 'vet').length})</span>
            </button>
          </div>

          {/* Direct Download Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExcelExport}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger Excel (.xls)</span>
            </button>

            <button
              onClick={handleCsvExport}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-white/10 cursor-pointer transition-all"
            >
              <span>Format CSV</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-600 animate-pulse" />
              <p className="font-semibold">Aucun membre ne correspond à cette recherche.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Nom & Prénom</th>
                    <th className="py-2.5 px-3">Téléphone</th>
                    <th className="py-2.5 px-3">Wilaya & Commune</th>
                    <th className="py-2.5 px-3">Animal / Clinique</th>
                    <th className="py-2.5 px-3">Code VIP</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          lead.role === 'vet'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {lead.role === 'vet' ? <Stethoscope className="w-2.5 h-2.5" /> : <Heart className="w-2.5 h-2.5" />}
                          <span>{lead.role === 'vet' ? 'Vétérinaire' : 'Propriétaire'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        {lead.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-cyan-300">
                        {lead.phone}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <div>{lead.wilaya}</div>
                        {lead.commune && <div className="text-[10px] text-slate-500">{lead.commune}</div>}
                      </td>
                      <td className="py-3 px-3 text-slate-200 font-medium">
                        {lead.petNameOrClinic}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {lead.vipCode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[10px]">
                        {lead.submittedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Données cryptées & conformes au RGPD / Législation algérienne</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
