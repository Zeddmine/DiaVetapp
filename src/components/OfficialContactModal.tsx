import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Send, CheckCircle2, ShieldCheck, Database, 
  ExternalLink, Sparkles, X, Copy, Check, Server, Radio
} from 'lucide-react';
import { sendContactMessageToFirestore, DIAVET_OFFICIAL_EMAIL, OWNER_TARGET_EMAIL } from '../services/firebase';
import { soundEngine } from '../utils/soundEngine';
import { Language } from '../types';

interface OfficialContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang?: Language;
}

export default function OfficialContactModal({
  isOpen,
  onClose,
  currentLang = 'fr'
}: OfficialContactModalProps) {
  const isRtl = currentLang === 'ar';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Demande de partenariat / Renseignement DiaVet');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSending(true);
    soundEngine.playCyberClick();

    try {
      const res = await sendContactMessageToFirestore({
        name,
        email,
        phone,
        subject,
        message
      });

      setIsSending(false);
      setIsSuccess(true);
      soundEngine.playSuccess();

      // Open mail client or mailto
      setTimeout(() => {
        window.location.href = res.mailtoUrl;
      }, 1200);

    } catch (err) {
      console.error('Contact submit error:', err);
      setIsSending(false);
    }
  };

  const handleCopyEmail = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedEmail(true);
    soundEngine.playPop();
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-slate-950 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 overflow-hidden text-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header HUD */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                Liaison Directe Cloud & Email
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Contact Officiel DiaVet Algérie
            </h3>
          </div>
        </div>

        {/* Live Infrastructure Status Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-cyan-500/30 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Database className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Base de Données Firestore</span>
              <span className="text-[11px] font-mono text-emerald-400">Actif & Connecté (2026)</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Boîte de Réception Dédiée</span>
              <span className="text-[11px] font-mono text-cyan-300 truncate block">
                {DIAVET_OFFICIAL_EMAIL}
              </span>
            </div>
          </div>
        </div>

        {/* Main Form or Success Screen */}
        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-black text-white">
              Message Enregistré dans la Base & Transmis !
            </h4>

            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Votre message a été enregistré dans la base de données cloud Firestore et retransmis à l'équipe <span className="font-mono text-amber-300 font-bold">{DIAVET_OFFICIAL_EMAIL}</span>.
            </p>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Dr. Karima / Yacine"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 focus:border-cyan-400 text-white text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Votre Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre.email@domaine.dz"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 focus:border-cyan-400 text-white text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Numéro de Téléphone DZ
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="05 / 06 / 07..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 focus:border-cyan-400 text-white text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Sujet
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Partenariat, Clinique, Support..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 focus:border-cyan-400 text-white text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Votre Message *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Décrivez votre besoin, proposition ou question..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 focus:border-cyan-400 text-white text-sm outline-none transition-colors resize-none"
              />
            </div>

            {/* Official Routing Notice */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Adresse officielle : <strong className="text-cyan-300 font-mono">{DIAVET_OFFICIAL_EMAIL}</strong></span>
              </span>
              <button
                type="button"
                onClick={() => handleCopyEmail(DIAVET_OFFICIAL_EMAIL)}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? 'Copié' : 'Copier'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                {isSending ? (
                  <>
                    <Server className="w-4 h-4 animate-spin" />
                    <span>Enregistrement Cloud...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer le Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </motion.div>
    </div>
  );
}
