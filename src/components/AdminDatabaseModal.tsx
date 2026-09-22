import { useState, useEffect } from 'react';
import { AdminLead } from '../types';
import { 
  getAdminLeads, 
  saveAdminLeads, 
  exportLeadsToCsv, 
  exportLeadsToJson, 
  generateMailtoForLead,
  fetchAndMergeCloudLeads,
  mergeCloudSubmissionsIntoLeads
} from '../services/adminDb';
import { 
  fetchSubmissionsFromFirestore, 
  subscribeToSubmissionsFromFirestore,
  DIAVET_OFFICIAL_EMAIL, 
  OWNER_TARGET_EMAIL 
} from '../services/firebase';
import { 
  ShieldCheck, Lock, Unlock, Download, Search, Filter, 
  Trash2, RefreshCw, X, Eye, Phone, MapPin, Calendar, 
  Award, Stethoscope, Heart, User, CheckCircle2, Mail, 
  Database, Cloud, Send, ExternalLink, Wifi, Bell, BellRing
} from 'lucide-react';
import { 
  requestPushNotificationPermission, 
  dispatchNativePushNotification, 
  getNotificationPermissionStatus 
} from '../services/firebaseMessaging';
import { soundEngine } from '../utils/soundEngine';
import DiaVetLogo from './DiaVetLogo';

interface AdminDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminDatabaseModal({ isOpen, onClose }: AdminDatabaseModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'vet'>('all');
  const [selectedLead, setSelectedLead] = useState<AdminLead | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncedCount, setCloudSyncedCount] = useState<number | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('fr-DZ'));

  useEffect(() => {
    if (!isOpen) return;

    // 1. Initial load from local cache
    const initial = getAdminLeads();
    setLeads(initial);

    // 2. Fetch from Cloud Firestore immediately
    setIsSyncingCloud(true);
    fetchAndMergeCloudLeads()
      .then(merged => {
        setLeads(merged);
        setCloudSyncedCount(merged.length);
        setLastSyncTime(new Date().toLocaleTimeString('fr-DZ'));
      })
      .catch(err => console.warn('Cloud fetch notice:', err))
      .finally(() => setIsSyncingCloud(false));

    // 3. Realtime onSnapshot subscription from Cloud Firestore
    const unsubscribe = subscribeToSubmissionsFromFirestore((submissions) => {
      if (submissions && submissions.length > 0) {
        const merged = mergeCloudSubmissionsIntoLeads(submissions);
        setLeads(merged);
        setCloudSyncedCount(submissions.length);
        setLastSyncTime(new Date().toLocaleTimeString('fr-DZ'));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: DIAVET2026 or 2026
    if (pinInput.trim().toUpperCase() === 'DIAVET2026' || pinInput.trim() === '2026') {
      setIsAuthenticated(true);
      setPinError(false);
      handleRefresh();
    } else {
      setPinError(true);
    }
  };

  const handleQuickUnlock = () => {
    setIsAuthenticated(true);
    handleRefresh();
  };

  const handleRefresh = async () => {
    setIsSyncingCloud(true);
    try {
      const merged = await fetchAndMergeCloudLeads();
      setLeads(merged);
      setCloudSyncedCount(merged.length);
      setLastSyncTime(new Date().toLocaleTimeString('fr-DZ'));
    } catch (e) {
      console.warn('Manual cloud sync caught:', e);
      setLeads(getAdminLeads());
    } finally {
      setIsSyncingCloud(false);
    }
  };


  const handleDeleteLead = (id: string) => {
    const updated = leads.filter(l => l.id !== id);
    setLeads(updated);
    saveAdminLeads(updated);
    if (selectedLead?.id === id) {
      setSelectedLead(null);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesRole = roleFilter === 'all' || lead.role === roleFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      lead.name.toLowerCase().includes(term) ||
      lead.wilaya.toLowerCase().includes(term) ||
      lead.petNameOrClinic.toLowerCase().includes(term) ||
      lead.phone.toLowerCase().includes(term) ||
      lead.vipCode.toLowerCase().includes(term);
    return matchesRole && matchesSearch;
  });

  const ownersCount = leads.filter(l => l.role === 'owner').length;
  const vetsCount = leads.filter(l => l.role === 'vet').length;
  const uniqueWilayas = new Set(leads.map(l => l.wilaya)).size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl shadow-cyan-500/15 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-slate-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <DiaVetLogo size="sm" variant="developer" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  DiaVet — Base de Données Cloud & Inbox
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  Console Dev Pro
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Liaison officielle : <strong className="text-cyan-300 font-mono">{DIAVET_OFFICIAL_EMAIL}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AUTHENTICATION GATE */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-12 flex flex-col items-center justify-center max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-white">
              Espace Administrateur Sécurisé
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 mb-6">
              Cette base de données collecte en temps réel les réponses des questionnaires et les coordonnées pour le déploiement en Algérie.
            </p>

            <form onSubmit={handleVerifyPin} className="w-full space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="Code secret (ex: DIAVET2026)"
                  value={pinInput}
                  onChange={e => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-center font-mono text-sm text-white placeholder-slate-500 focus:outline-none ${
                    pinError ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-white/15 focus:border-cyan-400'
                  }`}
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-1.5 font-medium">
                    Code incorrect. Veuillez réessayer.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                Déverrouiller la base
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 w-full flex items-center justify-between text-xs text-slate-500">
              <span>Code par défaut : DIAVET2026</span>
              <button
                onClick={handleQuickUnlock}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
              >
                Accès direct staff
              </button>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED DATABASE VIEW */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* KPI Overview Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-6 bg-slate-900/40 border-b border-white/5">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-[11px] font-bold text-slate-400">Total Réponses</p>
                <p className="text-xl sm:text-2xl font-black text-cyan-400 mt-0.5">{leads.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-[11px] font-bold text-slate-400">Propriétaires</p>
                <p className="text-xl sm:text-2xl font-black text-blue-400 mt-0.5">{ownersCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-[11px] font-bold text-slate-400">Vétérinaires</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{vetsCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-[11px] font-bold text-slate-400">Routage Boîte Mail</p>
                <p className="text-xs font-mono font-bold text-amber-300 mt-1 truncate">
                  {OWNER_TARGET_EMAIL}
                </p>
              </div>
            </div>

            {/* Filter and Action Bar */}
            <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, wilaya, téléphone, animal, code VIP..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex rounded-xl bg-slate-900 p-1 border border-white/10 text-xs">
                  <button
                    onClick={() => setRoleFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      roleFilter === 'all' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tous ({leads.length})
                  </button>
                  <button
                    onClick={() => setRoleFilter('owner')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      roleFilter === 'owner' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Propriétaires ({ownersCount})
                  </button>
                  <button
                    onClick={() => setRoleFilter('vet')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      roleFilter === 'vet' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Vétérinaires ({vetsCount})
                  </button>
                </div>
              </div>

              {/* Exports & Refresh */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isSyncingCloud}
                  title="Synchroniser avec Firebase Cloud Firestore"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                  <span>Sync Cloud</span>
                </button>

                <button
                  onClick={() => exportLeadsToCsv(leads)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel (CSV)</span>
                </button>

                <button
                  onClick={() => exportLeadsToJson(leads)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>

                <button
                  onClick={async () => {
                    soundEngine.playCyberClick();
                    const status = getNotificationPermissionStatus();
                    if (status !== 'granted') {
                      await requestPushNotificationPermission('vet', { userName: 'Admin DiaVet', wilaya: '16 - Alger' });
                    }
                    soundEngine.playCelebration();
                    dispatchNativePushNotification("🔔 Test Notification Push Développeur", {
                      body: "Le canal de notification instantanée DiaVet est connecté et opérationnel à 100% !",
                      icon: '/pwa-192x192.png',
                      tag: 'admin-test-notif'
                    });
                  }}
                  title="Tester et activer les notifications push sur votre appareil"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Activer/Tester Push</span>
                </button>
              </div>
            </div>

            {/* Table of Leads */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-900/30">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-3">Rôle</th>
                      <th className="p-3">Nom / Contact</th>
                      <th className="p-3">Wilaya & Commune</th>
                      <th className="p-3">Animal / Structure</th>
                      <th className="p-3">Code VIP</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Routage Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3">
                          {lead.role === 'owner' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                              <User className="w-3 h-3" />
                              Propriétaire
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                              <Stethoscope className="w-3 h-3" />
                              Vétérinaire
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-white text-sm">{lead.name}</p>
                          <p className="text-slate-400 font-mono text-[11px] mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-cyan-400" />
                            {lead.phone}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-200">{lead.wilaya}</p>
                          <p className="text-slate-500 text-[11px]">{lead.commune}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-cyan-300">{lead.petNameOrClinic}</p>
                          <p className="text-slate-400 text-[11px]">
                            {lead.animalTypesOrSpecialties.slice(0, 2).join(', ')}
                            {lead.animalTypesOrSpecialties.length > 2 && '...'}
                          </p>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-300">
                          {lead.vipCode}
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {lead.submittedAt}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={generateMailtoForLead(lead)}
                              title={`Envoyer le récapitulatif complet vers ${OWNER_TARGET_EMAIL}`}
                              className="p-1.5 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Notifier</span>
                            </a>
                            <button
                              onClick={() => setSelectedLead(lead)}
                              title="Voir tous les détails"
                              className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              title="Supprimer"
                              className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredLeads.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Aucune entrée trouvée correspondant aux critères de recherche.
                  </div>
                )}
              </div>
            </div>

            {/* Selected Lead Details Modal / Drawer */}
            {selectedLead && (
              <div className="p-4 sm:p-6 border-t border-white/10 bg-slate-900/90 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      Détails Complets : {selectedLead.name}
                    </span>
                    <span className="font-mono text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {selectedLead.vipCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={generateMailtoForLead(selectedLead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Transférer par email</span>
                    </a>
                    <button
                      onClick={() => setSelectedLead(null)}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer ml-2"
                    >
                      Fermer
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-slate-400 font-bold mb-1">Coordonnées :</p>
                    <p>Téléphone : <span className="text-white font-mono">{selectedLead.phone}</span></p>
                    <p>Wilaya : <span className="text-white">{selectedLead.wilaya}</span></p>
                    <p>Commune : <span className="text-white">{selectedLead.commune}</span></p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-slate-400 font-bold mb-1">Défis en Algérie :</p>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                      {selectedLead.challenges.length > 0 ? (
                        selectedLead.challenges.map((c, i) => <li key={i}>{c}</li>)
                      ) : (
                        <li>Aucun renseigné</li>
                      )}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-slate-400 font-bold mb-1">Fonctionnalités Prioritaires :</p>
                    <ul className="list-disc list-inside text-cyan-300 space-y-0.5">
                      {selectedLead.expectedFeatures.length > 0 ? (
                        selectedLead.expectedFeatures.map((f, i) => <li key={i}>{f}</li>)
                      ) : (
                        <li>Aucun renseigné</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
