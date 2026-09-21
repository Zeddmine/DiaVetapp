import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, VetAnswers } from '../types';
import { translations, getTranslations } from '../data/translations';
import { tabContentVariants } from '../utils/transitions';
import { 
  Stethoscope, Calendar, Users, FileText, Pill, 
  Boxes, ChevronLeft, Check, Printer, AlertCircle, Plus, QrCode,
  BarChart3
} from 'lucide-react';
import DiaVetLogo from './DiaVetLogo';
import AnalyticsDashboard from './AnalyticsDashboard';
import VetVisitsChart from './VetVisitsChart';

interface VetPortalPreviewProps {
  currentLang: Language;
  onGoHome: () => void;
  userAnswers?: VetAnswers;
}

export default function VetPortalPreview({
  currentLang,
  onGoHome,
  userAnswers
}: VetPortalPreviewProps) {
  const t = getTranslations(currentLang);
  const isRtl = currentLang === 'ar';
  const isEn = currentLang === 'en';
  const [activeTab, setActiveTab] = useState<'analytics' | 'schedule' | 'rx' | 'stock'>('analytics');

  // Ordonnance generator state
  const [rxPatient, setRxPatient] = useState('Max (Chien Golden - M. Karim)');
  const [rxDrug, setRxDrug] = useState('Amoxicilline + Acide Clavulanique (Synulox 250mg)');
  const [rxDose, setRxDose] = useState('1 comprimé matin et soir pendant 7 jours');
  const [rxGenerated, setRxGenerated] = useState(false);

  // Patient queue
  const [patients, setPatients] = useState([
    { id: 1, name: 'Max (Golden Retriever)', owner: 'Karim M.', time: '09:30', reason: 'Vaccin annuel Rage & CHPPiL', status: 'Terminé' },
    { id: 2, name: 'Minou (Siamois)', owner: 'Amira B.', time: '10:15', reason: 'Dermatite atopique & prurit', status: 'En cours' },
    { id: 3, name: 'Rocky (Berger Allemand)', owner: 'Sofiane K.', time: '11:00', reason: 'Boiterie patte avant droite', status: 'En attente' },
    { id: 4, name: 'Luna (Chat de gouttière)', owner: 'Yasmine D.', time: '11:45', reason: 'Contrôle post-stérilisation', status: 'En attente' }
  ]);

  const togglePatientStatus = (id: number) => {
    setPatients(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'En attente' ? 'En cours' : p.status === 'En cours' ? 'Terminé' : 'En attente';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const wilaya = userAnswers?.wilaya || '16 - Alger';
  const clinicName = userAnswers?.clinicName || (isRtl ? 'عيادة الأبيار البيطرية' : isEn ? 'El Biar Veterinary Clinic' : 'Cabinet El Biar');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white mb-2 cursor-pointer"
          >
            <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            <span>{t.btnBack}</span>
          </button>
          <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
            <span>{isRtl ? 'بوابة الطبيب البيطري' : isEn ? 'Veterinary Portal' : 'Espace Vétérinaire'}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
              {isRtl ? 'برنامج العيادة DZ' : isEn ? 'Clinic System DZ' : 'Logiciel Cabinet DZ'}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className={`${isRtl ? 'text-left' : 'text-right'} hidden sm:block`}>
            <p className="text-sm font-bold text-white">Dr. Amine Benali</p>
            <p className="text-xs text-emerald-400 font-medium">{clinicName} · {wilaya}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
            🩺
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
          <p className="text-xs font-semibold text-slate-400">
            {isRtl ? 'استشارات اليوم' : isEn ? "Today's Consultations" : 'Consultations du jour'}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">14</p>
          <span className="text-[10px] text-emerald-400 font-bold">
            {isRtl ? '● 4 مكتملة' : isEn ? '● 4 completed' : '● 4 terminées'}
          </span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
          <p className="text-xs font-semibold text-slate-400">
            {isRtl ? 'تذكيرات SMS مرسلة' : isEn ? 'SMS Reminders Sent' : 'Rappels SMS envoyés'}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">32</p>
          <span className="text-[10px] text-cyan-300 font-bold">
            {isRtl ? 'تلقيحات ومواعيد DZ' : isEn ? 'Vaccines & Appointments' : 'Vaccins & rdv DZ'}
          </span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
          <p className="text-xs font-semibold text-slate-400">
            {isRtl ? 'الإيرادات اليومية' : isEn ? 'Estimated Daily Revenue' : 'Recettes estimées (DZD)'}
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">48,500 DZD</p>
          <span className="text-[10px] text-slate-400">
            {isRtl ? 'متوسط الفحص 3,500 دج' : isEn ? 'Avg consult 3,500 DZD' : 'Moyenne consultation 3,500'}
          </span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
          <p className="text-xs font-semibold text-slate-400">
            {isRtl ? 'تنبيه مخزون اللقاح' : isEn ? 'Vaccine Stock Alert' : 'Alerte Stock Vaccin'}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">2</p>
          <span className="text-[10px] text-amber-300 font-bold">
            {isRtl ? 'مخزون حرج' : isEn ? 'Critical Stock' : 'Rupture imminente'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 mb-8 max-w-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{isRtl ? 'إحصائيات الزيارات' : isEn ? 'Visits & Analytics' : 'Statistiques Visites'}</span>
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'schedule'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{isRtl ? 'جدول المواعيد' : isEn ? 'Daily Schedule' : 'Planning du Jour'}</span>
        </button>
        <button
          onClick={() => setActiveTab('rx')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'rx'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isRtl ? 'محرر الوصفات' : isEn ? 'Rx Generator' : 'Ordonnances'}</span>
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'stock'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>{isRtl ? 'المخزون والأدوية' : isEn ? 'Stock & Pharmacy' : 'Stocks & Pharmacie'}</span>
        </button>
      </div>

      {/* Animated Tabs Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          {/* TAB 0: D3 ANALYTICS DASHBOARD */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              currentLang={currentLang}
              wilaya={wilaya}
              clinicName={clinicName}
            />
          )}

          {/* TAB 1: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="rounded-3xl p-6 border border-white/10 bg-slate-950/70 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <span>File d'attente des consultations</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Cliquez sur un statut pour le changer en temps réel</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">Date : Aujourd'hui</span>
              </div>

              <div className="space-y-3">
                {patients.map(patient => (
                  <div
                    key={patient.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-12 h-10 rounded-xl bg-slate-900 border border-white/10 font-mono font-bold text-xs text-cyan-400 flex items-center justify-center">
                        {patient.time}
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-white">{patient.name}</p>
                        <p className="text-xs text-slate-400">Propriétaire : {patient.owner} · Motif : {patient.reason}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePatientStatus(patient.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        patient.status === 'Terminé'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : patient.status === 'En cours'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-300 border-white/10'
                      }`}
                    >
                      {patient.status}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ORDONNANCE GENERATOR */}
          {activeTab === 'rx' && (
            <div className="grid lg:grid-cols-12 gap-8">
              
              {/* Form */}
              <div className="lg:col-span-6 rounded-3xl p-6 border border-white/10 bg-slate-950/70 backdrop-blur-xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Générer une ordonnance homologuée</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Patient & Propriétaire :</label>
                  <input
                    type="text"
                    value={rxPatient}
                    onChange={e => setRxPatient(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Médicament vétérinaire prescrit :</label>
                  <input
                    type="text"
                    value={rxDrug}
                    onChange={e => setRxDrug(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Posologie & Mode d'emploi :</label>
                  <textarea
                    value={rxDose}
                    onChange={e => setRxDose(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                  />
                </div>

                <button
                  onClick={() => setRxGenerated(true)}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Générer la feuille d'ordonnance</span>
                </button>
              </div>

              {/* Printable Preview */}
              <div className="lg:col-span-6">
                <div className="rounded-3xl p-6 border-2 border-emerald-500/40 bg-white text-slate-900 shadow-2xl relative overflow-hidden font-sans">
                  {/* Header */}
                  <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-wider text-emerald-700">
                        Dr. Amine Benali
                      </h4>
                      <p className="text-[11px] font-bold text-slate-700">Docteur en Médecine Vétérinaire</p>
                      <p className="text-[10px] text-slate-600">N° Ordre National des Vétérinaires DZ : 16/4892</p>
                      <p className="text-[10px] text-slate-500">Cabinet El Biar, Alger · Tél : +213 21 92 14 00</p>
                    </div>
                    <div className="text-right">
                      <div className="flex justify-end">
                        <DiaVetLogo size="xs" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 mt-1 block">Ord. Numérique DiaVet</span>
                    </div>
                  </div>

                  {/* Patient info */}
                  <div className="bg-slate-100 p-2.5 rounded-lg mb-4 text-xs font-semibold">
                    <span className="text-slate-500">Patient : </span>
                    <span className="text-slate-900 font-bold">{rxPatient}</span>
                  </div>

                  {/* Prescription Body */}
                  <div className="min-h-[140px] space-y-3 text-xs">
                    <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">Prescription :</p>
                    <div className="pl-3 border-l-2 border-emerald-500">
                      <p className="font-extrabold text-sm text-slate-900">{rxDrug}</p>
                      <p className="text-slate-700 mt-1">{rxDose}</p>
                    </div>
                  </div>

                  {/* Footer with Signature and QR */}
                  <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-end">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <QrCode className="w-9 h-9 text-slate-800" />
                      <span>Vérification ordonnance DZ<br/>Anti-falsification</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Date : 19 Septembre 2026</p>
                      <p className="text-xs font-serif italic font-bold text-emerald-800 mt-1">Signature & Cachet Dr. Benali</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PHARMACY STOCK */}
          {activeTab === 'stock' && (
            <div className="rounded-3xl p-6 border border-white/10 bg-slate-950/70 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-emerald-400" />
                  <span>Stock Médicaments & Vaccins</span>
                </h3>
                <span className="text-xs font-bold text-emerald-400">Inventaire en temps réel</span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Rabisin (Vaccin Antirabique Monodose)</p>
                    <p className="text-xs text-slate-400">Laboratoire Boehringer / Merial · Lot: 884-DZ</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                      4 flacons (Stock critique)
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Canigen CHPPiL (Vaccin Combiné Chien)</p>
                    <p className="text-xs text-slate-400">Virbac · Lot: V-2026-09</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                      28 doses disponibles
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">Bravecto Comprimés Chien (20-40kg)</p>
                    <p className="text-xs text-slate-400">MSD Santé Animale</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                      15 boîtes en stock
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
