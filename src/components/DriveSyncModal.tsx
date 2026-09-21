import { useState } from 'react';
import { Cloud, CheckCircle, Loader2, AlertCircle, ArrowUpRight, Database, FileText } from 'lucide-react';
import { googleSignIn, uploadIndexHtmlToDrive, uploadInscriptionsDataToDrive } from '../services/googleDrive';
import { getAdminLeads, formatLeadsAsCsv } from '../services/adminDb';
import { soundEngine } from '../utils/soundEngine';

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DriveSyncModal({ isOpen, onClose }: DriveSyncModalProps) {
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'uploading' | 'success' | 'error'>('idle');
  const [syncType, setSyncType] = useState<'all' | 'inscriptions' | 'html'>('all');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{ id: string; name: string; webViewLink?: string } | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  if (!isOpen) return null;

  const handleStartDriveTransfer = async (type: 'all' | 'inscriptions' | 'html' = 'all') => {
    soundEngine.playCyberClick();
    setSyncType(type);
    setStatus('authorizing');
    setErrorMessage('');

    try {
      // 1. Sign in with Google Popup and obtain Workspace OAuth access token
      const authResult = await googleSignIn();
      if (!authResult || !authResult.accessToken) {
        throw new Error('Connexion Google interrompue ou jeton manquant.');
      }

      setUserEmail(authResult.user.email || 'Propriétaire DiaVet');
      setStatus('uploading');

      let lastUploadedFile: { id: string; name: string; webViewLink?: string } | null = null;

      // Upload Inscriptions Data if requested or ALL
      if (type === 'all' || type === 'inscriptions') {
        const leads = getAdminLeads();
        const csvContent = formatLeadsAsCsv(leads);
        const jsonContent = JSON.stringify(leads, null, 2);

        // Upload CSV
        const csvFile = await uploadInscriptionsDataToDrive(
          authResult.accessToken,
          csvContent,
          `diavet-inscriptions-${new Date().toISOString().slice(0,10)}.csv`,
          'text/csv'
        );

        // Upload JSON formatted
        await uploadInscriptionsDataToDrive(
          authResult.accessToken,
          jsonContent,
          `diavet-inscriptions-${new Date().toISOString().slice(0,10)}.json`,
          'application/json'
        );

        lastUploadedFile = csvFile;
      }

      // Upload Standalone HTML if requested or ALL
      if (type === 'all' || type === 'html') {
        const response = await fetch('/diavet-standalone.html');
        let htmlContent = '';
        if (response.ok) {
          htmlContent = await response.text();
        } else {
          const fallbackRes = await fetch('/index.html');
          htmlContent = await fallbackRes.text();
        }

        if (htmlContent && htmlContent.length >= 100) {
          const driveFile = await uploadIndexHtmlToDrive(
            authResult.accessToken, 
            htmlContent, 
            'index.html'
          );
          if (!lastUploadedFile) lastUploadedFile = driveFile;
        }
      }

      setUploadedFile(lastUploadedFile);
      setStatus('success');
      try {
        soundEngine.playSuccess();
      } catch (e) {
        // ignore audio errors
      }
    } catch (err: any) {
      console.error('Erreur de transfert Google Drive:', err);
      setErrorMessage(err.message || 'Une erreur est survenue lors du transfert.');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-slate-900 border border-cyan-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-cyan-950/50 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Cloud className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Google Drive Cloud Sync
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">1-Clic</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transférer vos inscriptions & fichiers directement sur votre Google Drive
            </p>
          </div>
        </div>

        {/* Content depending on status */}
        {status === 'idle' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Transfert Cloud Sécurisé
              </p>
              Connectez votre compte Google pour transférer automatiquement la base de données des membres inscrits (CSV/JSON) et le fichier autonome <span className="text-cyan-300 font-mono">index.html</span> sur votre Google Drive.
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => handleStartDriveTransfer('all')}
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Cloud className="w-4.5 h-4.5" />
                <span>Synchroniser TOUT (Inscriptions + Application)</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleStartDriveTransfer('inscriptions')}
                  className="py-3 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Inscriptions (CSV/JSON)</span>
                </button>
                <button
                  onClick={() => handleStartDriveTransfer('html')}
                  className="py-3 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Code index.html</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl font-medium text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {(status === 'authorizing' || status === 'uploading') && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-spin">
              <Loader2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-bold text-white">
                {status === 'authorizing' ? 'Connexion à votre compte Google...' : 'Enregistrement de index.html sur Google Drive...'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Veuillez patienter quelques secondes.
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Transfert Cloud réussi avec succès !</h4>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Les fichiers d'inscriptions (<span className="font-mono font-bold text-emerald-300">CSV & JSON</span>) et le code source de l'application ont été synchronisés sur votre Google Drive (<span className="font-semibold text-white">{userEmail}</span>).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3.5 px-5 rounded-2xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Ouvrir Google Drive</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <button
                onClick={onClose}
                className="py-3.5 px-6 rounded-2xl font-medium text-xs text-slate-300 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-rose-300">Échec du transfert</p>
                <p className="text-rose-200/80 mt-1">{errorMessage}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStartDriveTransfer}
                className="flex-1 py-3 px-5 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-colors"
              >
                Réessayer
              </button>
              <button
                onClick={onClose}
                className="py-3 px-5 rounded-2xl font-medium text-xs text-slate-400 hover:text-white bg-transparent border border-slate-700"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
