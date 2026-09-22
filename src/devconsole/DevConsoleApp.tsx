import React, { useState, useEffect } from 'react';
import { 
  Terminal, Database, Users, Stethoscope, Heart, RefreshCw, 
  Download, Search, Filter, ShieldCheck, Mail, Phone, MapPin, 
  Calendar, CheckCircle2, Cloud, ExternalLink, BellRing, Eye, X,
  FileSpreadsheet, ArrowLeft
} from 'lucide-react';
import { AdminLead } from '../types';
import { 
  getAdminLeads, 
  exportLeadsToCsv, 
  exportLeadsToJson, 
  exportLeadsToExcel,
  fetchAndMergeCloudLeads,
  mergeCloudSubmissionsIntoLeads 
} from '../services/adminDb';
import { 
  fetchSubmissionsFromFirestore, 
  subscribeToSubmissionsFromFirestore,
  subscribeToRegisteredAccountsFromFirestore,
  DIAVET_OFFICIAL_EMAIL,
  OWNER_TARGET_EMAIL
} from '../services/firebase';
import { soundEngine } from '../utils/soundEngine';
import DiaVetLogo from '../components/DiaVetLogo';

export default function DevConsoleApp() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'vet'>('all');
  const [selectedLead, setSelectedLead] = useState<AdminLead | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveSyncActive, setLiveSyncActive] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load and subscribe to real-time Firestore leads and submissions
  useEffect(() => {
    // Initial fetch
    refreshData();

    // Real-time listener for questionnaire submissions
    const unsubSubmissions = subscribeToSubmissionsFromFirestore((submissions) => {
      mergeCloudSubmissionsIntoLeads(submissions);
      setLeads(getAdminLeads());
    });

    // Real-time listener for registered user accounts
    const unsubAccounts = subscribeToRegisteredAccountsFromFirestore((accounts) => {
      const formatted: AdminLead[] = accounts.map((acc: any) => ({
        id: acc.id || acc.uid || `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: acc.name || 'Utilisateur DiaVet',
        email: acc.email || '',
        phone: acc.phone || 'Non renseigné',
        wilaya: acc.wilaya || '16 - Alger',
        commune: acc.commune || 'Centre',
        role: (acc.userRole === 'vet' ? 'vet' : 'owner') as 'vet' | 'owner',
        petNameOrClinic: acc.clinicName || acc.petName || (acc.userRole === 'vet' ? 'Cabinet Vétérinaire' : 'Animal'),
        animalTypesOrSpecialties: acc.userRole === 'vet' ? ['Praticien Vétérinaire'] : ['Animal'],
        vipCode: acc.vipCode || `VIP-DZ-${Math.floor(1000 + Math.random() * 9000)}`,
        challenges: [],
        expectedFeatures: [],
        submittedAt: acc.createdAt || new Date().toLocaleString('fr-DZ'),
        rawDetails: acc
      }));
      setLeads(prev => {
        const merged = [...formatted, ...prev.filter(p => !formatted.some(f => f.email && f.email === p.email))];
        return merged;
      });
    });

    return () => {
      unsubSubmissions();
      unsubAccounts();
    };
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    soundEngine.playCyberClick();
    try {
      await fetchAndMergeCloudLeads();
      const submissions = await fetchSubmissionsFromFirestore();
      if (submissions && submissions.length > 0) {
        mergeCloudSubmissionsIntoLeads(submissions);
      }
      setLeads(getAdminLeads());
      setStatusMessage('Synchronisation serveur Firestore réussie');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportExcel = () => {
    soundEngine.playCyberClick();
    exportLeadsToExcel(leads);
    setStatusMessage('Fichier Excel (.xls) téléchargé avec succès');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleExportCsv = () => {
    soundEngine.playCyberClick();
    exportLeadsToCsv(leads);
  };

  const handleExportJson = () => {
    soundEngine.playCyberClick();
    exportLeadsToJson(leads);
  };

  // Filtered leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.wilaya.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone && lead.phone.includes(searchTerm));
    const matchesRole = roleFilter === 'all' || lead.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalVets = leads.filter(l => l.role === 'vet').length;
  const totalOwners = leads.filter(l => l.role === 'owner').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      
      {/* Top Cyber Console Header */}
      <header className="border-b border-cyan-500/20 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <DiaVetLogo size="sm" variant="developer" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  DiaVet <span className="text-cyan-400">DevConsole</span>
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  V2.5 LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Serveur Cloud Firestore partagé • Surveillance activité en temps réel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.location.href = window.location.pathname;
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Retourner à l'application principale DiaVet (Propriétaires & Vétérinaires)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Aller sur DiaVetapp</span>
            </button>

            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="p-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1 transition-all cursor-pointer"
              title="Actualiser les données Firestore"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>
      </header>

      {/* Main Console Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Status Toast Banner */}
        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Real-time KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Inscrits Cloud</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2 font-mono">
              {leads.length}
            </div>
            <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Synchronisation temps réel active
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 shadow-lg shadow-emerald-950/20">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Docteurs Vétérinaires</span>
              <Stethoscope className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 font-mono">
              {totalVets}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Cliniques & cabinets répertoriés
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/20 shadow-lg shadow-rose-950/20">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Propriétaires d'animaux</span>
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-2 font-mono">
              {totalOwners}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Carnets de santé & profils
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/20 shadow-lg shadow-blue-950/20">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Couverture Wilayas</span>
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-2 font-mono">
              {new Set(leads.map(l => l.wilaya)).size} / 58
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Territoire national couvert
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Export */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, wilaya, téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-white/10 text-xs font-bold shrink-0">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                roleFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous ({leads.length})
            </button>
            <button
              onClick={() => setRoleFilter('vet')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                roleFilter === 'vet' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3 h-3" />
              Vétérinaires ({totalVets})
            </button>
            <button
              onClick={() => setRoleFilter('owner')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                roleFilter === 'owner' ? 'bg-rose-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3 h-3" />
              Propriétaires ({totalOwners})
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
              title="Exporter le registre national des leads sous Excel (.xls)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel (.xls)</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-2.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-1 cursor-pointer"
              title="Exporter en CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>

        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Utilisateur / Nom</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Wilaya</th>
                  <th className="py-3 px-4">Date Inscription</th>
                  <th className="py-3 px-4 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Aucune inscription trouvée pour ce critère.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr 
                      key={lead.id}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${lead.role === 'vet' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                          <span>{lead.name}</span>
                        </div>
                        {lead.petNameOrClinic && (
                          <div className={`text-[11px] font-normal ${lead.role === 'vet' ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                            {lead.role === 'vet' ? 'Clinique / Cabinet' : 'Animal'} : {lead.petNameOrClinic}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                          lead.role === 'vet'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}>
                          {lead.role === 'vet' ? <Stethoscope className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
                          {lead.role === 'vet' ? 'Vétérinaire Pro' : 'Propriétaire'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="text-xs font-mono">{lead.email}</div>
                        {lead.phone && <div className="text-[11px] text-slate-400 font-mono">{lead.phone}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {lead.wilaya}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                        {lead.submittedAt}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all cursor-pointer"
                          title="Voir fiche complète"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${selectedLead.role === 'vet' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                <h3 className="text-lg font-black text-white">{selectedLead.name}</h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Rôle :</span>
                <span className="font-bold text-white uppercase">{selectedLead.role === 'vet' ? 'Vétérinaire Pro' : 'Propriétaire'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Email :</span>
                <span className="font-mono text-cyan-300">{selectedLead.email}</span>
              </div>
              {selectedLead.phone && (
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Téléphone :</span>
                  <span className="font-mono text-white">{selectedLead.phone}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Wilaya :</span>
                <span className="font-bold text-white">{selectedLead.wilaya}</span>
              </div>
              {selectedLead.petNameOrClinic && (
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">{selectedLead.role === 'vet' ? 'Clinique / Cabinet :' : 'Animal :'}</span>
                  <span className={`font-bold ${selectedLead.role === 'vet' ? 'text-emerald-400' : 'text-rose-400'}`}>{selectedLead.petNameOrClinic}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-400">Date d'enregistrement :</span>
                <span className="font-mono text-slate-300">{selectedLead.submittedAt}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-3 text-center text-xs text-slate-500 font-mono">
        DiaVet-DevConsole • Lead Dev Console • Serveur Cloud Firestore diavet-applet
      </footer>

    </div>
  );
}
