import { useState } from 'react';
import { 
  Stethoscope, FileText, Activity, Users, QrCode, 
  CheckCircle2, Sparkles, Clock, 
  Layers, ChevronRight
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { soundEngine } from '../utils/soundEngine';

interface VeterinaryShowcaseSectionProps {
  currentLang?: Language;
  onOpenFullVetPortal: () => void;
  onSelectOwnerPortal?: () => void;
  userRole?: 'owner' | 'vet';
  onSwitchRole?: (newRole: 'owner' | 'vet') => void;
}

export default function VeterinaryShowcaseSection({
  currentLang = 'fr',
  onOpenFullVetPortal,
  userRole = 'owner',
  onSwitchRole
}: VeterinaryShowcaseSectionProps) {
  const t = translations[currentLang] || translations.fr;
  const isAr = currentLang === 'ar';
  const isEn = currentLang === 'en';

  const [activeClinicalTab, setActiveClinicalTab] = useState<'records' | 'rx' | 'imaging' | 'stats'>('records');
  
  // Interactive mini Rx simulator
  const [rxPetName, setRxPetName] = useState(
    isAr ? 'ماكس (غولدن ريتريفر)' : isEn ? 'Max (Golden Retriever)' : 'Max (Golden Retriever)'
  );
  const [rxDrug, setRxDrug] = useState(
    isAr ? 'سينولوكس 250 مغ (أموكسيسيلين + حمض كلافولانيك)' : isEn ? 'Synulox 250mg (Amoxicillin + Clavulanic Acid)' : 'Synulox 250mg (Amoxicilline + Ac. Clavulanique)'
  );
  const [rxPosology, setRxPosology] = useState(
    isAr ? 'قرص واحد صباحاً ومساءً لمدة 8 أيام أثناء الوجبات' : isEn ? '1 tablet morning & evening for 8 days with meals' : '1 comprimé matin & soir pendant 8 jours au cours des repas'
  );
  const [, setRxCreated] = useState(false);

  // Interactive patient list
  const patients = [
    { 
      id: 1, 
      name: isAr ? 'أوسكار (قط فارسي)' : isEn ? 'Oscar (Persian Cat)' : 'Oscar (Chat Persan)', 
      owner: isAr ? 'أمين ك. (باب الوادي)' : isEn ? 'Amine K. (Bab El Oued)' : 'Amine K. (Bab El Oued)', 
      reason: isAr ? 'تنظيف الأسنان وفحص الكلى' : isEn ? 'Dental Scaling & Renal Function Test' : 'Détartrage & Bilan Rénal', 
      status: isAr ? 'مكتمل' : isEn ? 'Completed' : 'Terminé', 
      urgency: isAr ? 'منخفض' : isEn ? 'Low' : 'Faible' 
    },
    { 
      id: 2, 
      name: isAr ? 'بيلا (راعي أبيض)' : isEn ? 'Bella (White Shepherd)' : 'Bella (Berger Blanc)', 
      owner: isAr ? 'سارة ت. (حيدرة)' : isEn ? 'Sarah T. (Hydra)' : 'Sarah T. (Hydra)', 
      reason: isAr ? 'تلقيح داء الكلب + CHPPI' : isEn ? 'Rabies Vaccination + CHPPI' : 'Vaccination Rage + CHPPI', 
      status: isAr ? 'جارٍ' : isEn ? 'In Progress' : 'En cours', 
      urgency: isAr ? 'عادي' : isEn ? 'Normal' : 'Normal' 
    },
    { 
      id: 3, 
      name: isAr ? 'سيمبا (جرو هاسكي)' : isEn ? 'Simba (Husky Puppy)' : 'Simba (Chiot Husky)', 
      owner: isAr ? 'كريم ل. (الأبيار)' : isEn ? 'Karim L. (El Biar)' : 'Karim L. (El Biar)', 
      reason: isAr ? 'إصابة في القائمة اليمنى (أشعة مطلوبة)' : isEn ? 'Right Paw Trauma (X-Ray required)' : 'Trauma Patte Droite (Radio requise)', 
      status: isAr ? 'في الانتظار' : isEn ? 'Waiting' : 'En attente', 
      urgency: isAr ? 'مرتفع' : isEn ? 'High' : 'Élevé' 
    },
    { 
      id: 4, 
      name: isAr ? 'برالين (خنزير غينيا)' : isEn ? 'Praline (Guinea Pig)' : "Praline (Cochon d'Inde)", 
      owner: isAr ? 'ياسمين ب. (القبة)' : isEn ? 'Yasmine B. (Kouba)' : 'Yasmine B. (Kouba)', 
      reason: isAr ? 'فحص أسنان وقص مخالب' : isEn ? 'Dental checkup & nail trimming' : 'Problème dentaire & coupe griffes', 
      status: isAr ? 'في الانتظار' : isEn ? 'Waiting' : 'En attente', 
      urgency: isAr ? 'عادي' : isEn ? 'Normal' : 'Normal' 
    }
  ];

  const handlePatientClick = (patient: typeof patients[0]) => {
    soundEngine.playAnimalSound(patient.name);
  };

  const handleGenerateRx = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playHoloScan();
    setRxCreated(true);
    setTimeout(() => {
      soundEngine.playCyberClick();
    }, 400);
  };

  const handleSwitchToVet = () => {
    soundEngine.playWarpSwitch();
    if (onSwitchRole) onSwitchRole('vet');
    onOpenFullVetPortal();
  };

  return (
    <section id="section-veterinaire" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-black uppercase tracking-wider mb-4 shadow-lg shadow-emerald-500/10">
          <Stethoscope className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'القسم الطبي وبرنامج العيادة البيطرية في الجزائر' : isEn ? 'Clinical Medical Suite & Algerian Veterinary Software' : 'Section Médicale & Logiciel Clinique Vétérinaire DZ'}</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {isAr ? (
            <>المنظومة المهنية المتطورة <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">للأطباء البيطريين</span></>
          ) : isEn ? (
            <>The Professional Suite for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Veterinary Doctors</span></>
          ) : (
            <>La Suite Professionnelle pour les <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Docteurs Vétérinaires</span></>
          )}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
          {isAr ? 'إدارة عيادتك البيطرية في الجزائر : ملفات طبية إلكترونية، وصفات معتمدة، تصوير إشعاعي ومتابعة المرضى في 58 ولاية.' : isEn ? 'Run your veterinary practice in Algeria: electronic health records, certified prescriptions, digital imaging, and patient tracking across 58 Wilayas.' : 'Gérez votre cabinet vétérinaire en Algérie : dossiers médicaux électroniques, ordonnances homologuées, imagerie numérique, et suivi patientèle 58 Wilayas.'}
        </p>

        {/* Quick Launch & Mode Switch Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={onOpenFullVetPortal}
            className="px-6 py-3 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:scale-105 transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            <span>{isAr ? 'فتح البرنامج السريري الكامل ←' : isEn ? 'Open Full Clinical Software →' : 'Ouvrir le Logiciel Clinique Complet →'}</span>
          </button>

          {userRole !== 'vet' && (
            <button
              onClick={handleSwitchToVet}
              className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'تفعيل ملف الطبيب البيطري' : isEn ? 'Activate Veterinarian Profile' : 'Activer mon profil Vétérinaire'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Cyber Glassmorphic Clinic Workbench Showcase */}
      <div className="rounded-[2.5rem] p-6 sm:p-10 border border-emerald-500/30 bg-slate-950/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        
        {/* Top Control Bar with Status & Navigation Tabs */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-emerald-400 font-black">
                🩺
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{isAr ? 'العيادة البيطرية الرقمية' : isEn ? 'Digital Veterinary Clinic' : 'Cabinet Vétérinaire Numérique'}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  {isAr ? 'متصل · خادم الجزائر DZ' : isEn ? 'ONLINE · DZ SERVER' : 'EN LIGNE · SERVEUR DZ'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{isAr ? 'د. أمين بن علي · اعتماد رقم 16/2024 · ولاية الجزائر' : isEn ? 'Dr. Amine Benali · License # 16/2024 · Algiers' : "Dr. Amine Benali · Agrément N° 16/2024 · Wilaya d'Alger"}</p>
            </div>
          </div>

          {/* Clinical Workspace Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                soundEngine.playCyberClick();
                setActiveClinicalTab('records');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeClinicalTab === 'records'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isAr ? 'ملفات المرضى' : isEn ? 'Patient Records' : 'Dossiers Patients'}</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playCyberClick();
                setActiveClinicalTab('rx');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeClinicalTab === 'rx'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isAr ? 'الوصفات الطبية DZ' : isEn ? 'Prescription Generator' : "Générateur d'Ordonnance DZ"}</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playCyberClick();
                setActiveClinicalTab('imaging');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeClinicalTab === 'imaging'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAr ? 'الأشعة والتصوير' : isEn ? 'Imaging & X-Rays' : 'Imagerie & Radios'}</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playCyberClick();
                setActiveClinicalTab('stats');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeClinicalTab === 'stats'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isAr ? 'إحصائيات 58 ولاية' : isEn ? '58 Wilayas Statistics' : 'Statistiques 58 Wilayas'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Live Patient Records & Consultations */}
        {activeClinicalTab === 'records' && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base sm:text-lg font-black text-white">{isAr ? 'قائمة الاستشارات النشطة لليوم' : isEn ? "Today's Active Clinical Consultations" : 'File active des consultations du jour'}</h4>
                <p className="text-xs text-slate-400">{isAr ? 'انقر على مريض للاستماع لصوته ومعاينة علاماته الحيوية.' : isEn ? 'Click a patient to hear audio and inspect vital signs.' : 'Cliquez sur un patient pour entendre son vocalise et voir ses constantes.'}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <Clock className="w-3.5 h-3.5" />
                <span>{isAr ? 'تحديث فوري' : isEn ? 'Real-Time Sync' : 'Mise à jour temps réel'}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {patients.map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => handlePatientClick(pat)}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-400/60 hover:bg-slate-850 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {pat.name.includes('Chat') || pat.name.includes('قط') || pat.name.includes('Cat') ? '🐱' : pat.name.includes('Chien') || pat.name.includes('Berger') || pat.name.includes('Husky') || pat.name.includes('كلب') || pat.name.includes('Dog') || pat.name.includes('Shepherd') ? '🐶' : '🐹'}
                        </span>
                        <h5 className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {pat.name}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{isAr ? 'المربي : ' : isEn ? 'Owner: ' : 'Propriétaire : '}{pat.owner}</p>
                      <p className="text-xs text-emerald-400 font-medium mt-1">{isAr ? 'السبب : ' : isEn ? 'Reason: ' : 'Motif : '}{pat.reason}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        pat.status === 'Terminé' || pat.status === 'Completed' || pat.status === 'مكتمل'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : pat.status === 'En cours' || pat.status === 'In Progress' || pat.status === 'جارٍ'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {pat.status}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">{isAr ? 'الحالة : ' : isEn ? 'Urgency: ' : 'Urgence : '}{pat.urgency}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 group-hover:text-emerald-400">
                      <span>🔊 {isAr ? 'الاستماع للصوت' : isEn ? 'Play sound' : 'Écouter vocalise'}</span>
                    </span>
                    <span className="text-emerald-400 font-bold group-hover:underline">
                      {isAr ? 'فتح الملف الكامل ←' : isEn ? 'Open Full Chart →' : 'Ouvrir dossier complet →'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Algerian Electronic Rx Maker */}
        {activeClinicalTab === 'rx' && (
          <div className="mt-8 grid lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
            {/* Form */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <FileText className="w-4 h-4" />
                <span>{isAr ? 'تحرير وصفة طبية بيطرية رسمية DZ' : isEn ? 'Draft Certified Algerian Veterinary Prescription' : 'Rédiger une Ordonnance Homologuée DZ'}</span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr ? 'توليد فوري لوصفات طبية آمنة مع رمز QR للصيدليات والعيادات في الجزائر.' : isEn ? 'Instantly generate secure prescriptions with QR authentication for Algerian pharmacies.' : "Générez instantanément des ordonnances sécurisées avec code QR d'authenticité pour les pharmacies et cliniques en Algérie."}
              </p>

              <form onSubmit={handleGenerateRx} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{isAr ? 'المريض والنوع' : isEn ? 'Patient & Species' : 'Patient & Espèce'}</label>
                  <input
                    type="text"
                    value={rxPetName}
                    onChange={(e) => setRxPetName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{isAr ? 'العلاج / الدواء الموصوف' : isEn ? 'Prescribed Treatment / Drug' : 'Traitement / Médicament prescrit'}</label>
                  <input
                    type="text"
                    value={rxDrug}
                    onChange={(e) => setRxDrug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{isAr ? 'الجرعة والمدة' : isEn ? 'Dosage & Duration' : 'Posologie & Durée'}</label>
                  <textarea
                    rows={2}
                    value={rxPosology}
                    onChange={(e) => setRxPosology(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAr ? 'توليد مع الختم ورمز QR' : isEn ? 'Generate with Seal & QR Code' : 'Générer avec Cachet & QR Code'}</span>
                </button>
              </form>
            </div>

            {/* Live Electronic Prescription Preview Card */}
            <div className="p-6 rounded-2xl bg-white text-slate-900 shadow-2xl relative flex flex-col justify-between font-sans">
              <div>
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h5 className="font-black text-sm tracking-tight text-slate-950">DR. AMINE BENALI</h5>
                    <p className="text-[10px] text-slate-600 font-semibold">{isAr ? 'دكتور في الطب البيطري · اعتماد 16/2024' : isEn ? 'Doctor of Veterinary Medicine · License 16/2024' : 'Docteur en Médecine Vétérinaire · Agrément 16/2024'}</p>
                    <p className="text-[10px] text-slate-500">{isAr ? 'العيادة البيطرية - الجزائر · هاتف: 0550123456' : isEn ? 'Algiers Veterinary Clinic · Tel: +213 (0) 550 12 34 56' : "Cabinet Médical Vétérinaire d'Alger · Tél: +213 (0) 550 12 34 56"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {isAr ? 'وصفة رسمية' : isEn ? 'OFFICIAL PRESCRIPTION' : 'ORDONNANCE OFFICIELLE'}
                    </span>
                    <p className="text-[9px] text-slate-400 mt-1">{isAr ? 'الجزائر، ' : isEn ? 'Algiers, ' : 'Alger, le '}{new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-DZ' : currentLang === 'en' ? 'en-US' : 'fr-FR')}</p>
                  </div>
                </div>

                <div className="my-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{isAr ? 'المريض : ' : isEn ? 'Patient: ' : 'Patient : '}<span className="font-extrabold text-blue-700">{rxPetName}</span></p>
                </div>

                <div className="space-y-2 py-2">
                  <div className="text-xs">
                    <p className="font-black text-slate-900">Rx 1 : {rxDrug}</p>
                    <p className="text-[11px] text-slate-600 pl-4 mt-0.5">↳ {rxPosology}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-slate-100 border border-slate-300 rounded p-1 flex items-center justify-center">
                    <QrCode className="w-full h-full text-slate-800" />
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-slate-700 font-bold">DZ-VET-RX-884920</p>
                    <p className="text-[9px] text-slate-500">{isAr ? 'قابل للتحقق عبر diavet.dz' : isEn ? 'Verifiable on diavet.dz' : 'Vérifiable sur diavet.dz'}</p>
                  </div>
                </div>

                {/* Algerian Official Seal Stamp */}
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-600/70 p-1 flex items-center justify-center text-center rotate-[-12deg]">
                  <p className="text-[8px] font-black text-emerald-700 leading-tight">
                    {isAr ? 'عمادة الأطباء البيطريين' : isEn ? 'ORDER OF VETERINARIANS' : 'ORDRE DES VÉTÉRINAIRES'}<br />
                    ★ ALGERIE ★
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Cyber Imaging & Radiography */}
        {activeClinicalTab === 'imaging' && (
          <div className="mt-8 grid md:grid-cols-3 gap-4 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-cyan-400 transition-all cursor-pointer group">
              <div className="h-40 rounded-xl bg-slate-950 overflow-hidden relative mb-3">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600"
                  alt="Radiographie féline"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-70"
                />
                <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay"></div>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  {isAr ? 'أشعة صدر القط' : isEn ? 'Cat Chest X-Ray' : 'Radio Thorax Chat'}
                </span>
              </div>
              <p className="font-bold text-xs text-white">{isAr ? 'الصدر والرئتان (قط 4 سنوات)' : isEn ? 'Thorax & Lungs (4yo Feline)' : 'Thorax & Poumons (Félin 4 ans)'}</p>
              <p className="text-[11px] text-slate-400 mt-1">{isAr ? 'فحص الربو والالتهابات. تحليل الذكاء الاصطناعي : سليم.' : isEn ? 'Asthma screening. AI Analysis: Normal.' : 'Recherche de bronchite asthmatiforme. Analyse IA : Négatif.'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-emerald-400 transition-all cursor-pointer group">
              <div className="h-40 rounded-xl bg-slate-950 overflow-hidden relative mb-3">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600"
                  alt="Échographie abdominale"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-70"
                />
                <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay"></div>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  {isAr ? 'سونار البطن' : isEn ? 'Abdominal Ultrasound' : 'Échographie Abdominale'}
                </span>
              </div>
              <p className="font-bold text-xs text-white">{isAr ? 'سونار بطن كلب (7 سنوات)' : isEn ? 'Canine Abdominal Ultrasound (7yo)' : 'Écho Abdominale Chien (Canin 7 ans)'}</p>
              <p className="text-[11px] text-slate-400 mt-1">{isAr ? 'فحص الكبد والطحال بدقة عالية 3D.' : isEn ? 'Liver and spleen exploration. Clear 3D imaging.' : 'Exploration hépatomégalie & rate. Image nette 3D.'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 hover:border-purple-400 transition-all cursor-pointer group">
              <div className="h-40 rounded-xl bg-slate-950 overflow-hidden relative mb-3">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600"
                  alt="Scanner crânien"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-70"
                />
                <div className="absolute inset-0 bg-purple-500/10 mix-blend-overlay"></div>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                  {isAr ? 'فحص أسنان القوارض' : isEn ? 'Rodent Dental Scan' : 'Scan Dentaire Rongeur'}
                </span>
              </div>
              <p className="font-bold text-xs text-white">{isAr ? 'فحص أسنان خنزير غينيا' : isEn ? 'Guinea Pig Dental Exam' : "Examen Dentaire Cochon d'Inde"}</p>
              <p className="text-[11px] text-slate-400 mt-1">{isAr ? 'التحقق من نمو الأضراس السفلية.' : isEn ? 'Checking lower molar occlusion.' : 'Vérification malocclusion des molaires inférieures.'}</p>
            </div>
          </div>
        )}

        {/* Tab 4: 58 Wilayas Statistics & Epidemiology */}
        {activeClinicalTab === 'stats' && (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
              <p className="text-xs text-slate-400 font-bold">{isAr ? 'تلقيحات داء الكلب 2026' : isEn ? 'Rabies Vaccines 2026' : 'Vaccinations Rage 2026'}</p>
              <p className="text-3xl font-black text-emerald-400 mt-1">94.8%</p>
              <p className="text-[10px] text-slate-500 mt-1">{isAr ? 'نسبة التغطية المصرح بها' : isEn ? 'Reported vaccine coverage' : 'Couverture vaccinale déclarée'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
              <p className="text-xs text-slate-400 font-bold">{isAr ? 'الاستشارات المنجزة' : isEn ? 'Completed Consultations' : 'Consultations traitées'}</p>
              <p className="text-3xl font-black text-cyan-400 mt-1">1,420</p>
              <p className="text-[10px] text-slate-500 mt-1">{isAr ? 'خلال الـ 30 يوماً الماضية' : isEn ? 'Past 30 days total' : 'Sur les 30 derniers jours'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
              <p className="text-xs text-slate-400 font-bold">{isAr ? 'توزيع الحيوانات' : isEn ? 'Species Breakdown' : 'Répartition des Espèces'}</p>
              <p className="text-xl font-black text-white mt-1">{isAr ? '54% قطط · 38% كلاب' : isEn ? '54% Cats · 38% Dogs' : '54% Chats · 38% Chiens'}</p>
              <p className="text-[10px] text-slate-500 mt-1">{isAr ? '8% طيور وحيوانات أخرى' : isEn ? '8% Exotic & Birds' : '8% NAC & Oiseaux'}</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
              <p className="text-xs text-slate-400 font-bold">{isAr ? 'مراكز المناوبة المستمرة' : isEn ? 'On-Call Emergency Shifts' : 'Permanences de Garde'}</p>
              <p className="text-3xl font-black text-amber-400 mt-1">58 {isAr ? 'ولاية' : isEn ? 'Wilayas' : 'Wilayas'}</p>
              <p className="text-[10px] text-slate-500 mt-1">{isAr ? 'شبكة طوارئ 24/24' : isEn ? '24/7 on-call network' : "Réseau d'astreinte 24h/24"}</p>
            </div>
          </div>
        )}

        {/* Bottom Callout */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span className="text-emerald-400 font-bold">{isAr ? 'وحدة DiaVet Pro البيطرية : ' : isEn ? 'DiaVet Pro Veterinary Suite: ' : 'Module Vétérinaire DiaVet Pro : '}</span>
            {isAr ? 'جميع البيانات السريرية متزامنة مع الدفتر الصحي الرقمي للحيوان.' : isEn ? 'All clinical data is instantly synced with the pet digital health passport.' : "Toutes les données cliniques sont synchronisées avec le carnet de santé de l'animal."}
          </div>
          <button
            onClick={onOpenFullVetPortal}
            className="px-6 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 hover:scale-105"
          >
            <span>{isAr ? 'استكشاف المنظومة البرمجية الكاملة' : isEn ? 'Explore Complete Software Suite' : 'Explorer la suite logicielle complète'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </section>
  );
}
