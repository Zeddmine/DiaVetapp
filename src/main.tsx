import { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { LoadingProvider } from './context/LoadingContext.tsx';
import './index.css';

// Filter harmless offline/reconnect notices from @firebase/firestore so they don't trigger false error alarms
if (typeof window !== 'undefined') {
  const origWarn = console.warn;
  const origError = console.error;
  
  const isFirestoreOfflineNotice = (...args: any[]) => {
    const str = args.map(a => (typeof a === 'string' ? a : (a?.message || ''))).join(' ');
    return str.includes('@firebase/firestore') || 
           str.includes('Could not reach Cloud Firestore backend') ||
           str.includes('operate in offline mode until it is able to successfully connect');
  };

  console.warn = (...args: any[]) => {
    if (isFirestoreOfflineNotice(...args)) {
      console.debug('[DiaVet Offline Cache Mode]', ...args);
      return;
    }
    origWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    if (isFirestoreOfflineNotice(...args)) {
      console.debug('[DiaVet Offline Cache Mode]', ...args);
      return;
    }
    origError.apply(console, args);
  };
}

// Register PWA service worker safely in production
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          console.log('Nouvelle version DiaVet PWA disponible - rafraîchissement...');
          updateSW(true);
        },
        onOfflineReady() {
          console.log('DiaVet PWA prêt pour utilisation hors-ligne');
        },
      });
    })
    .catch((pwaErr) => {
      console.warn('PWA registration skipped or constrained:', pwaErr);
    });
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Erreur inattendue' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DiaVet Global Crash Caught:', error, errorInfo);
  }

  handleFullCleanReset = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Reset error:', e);
    }
    window.location.href = window.location.pathname + '?v=' + Date.now();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 text-center font-sans">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center mx-auto text-2xl font-black">
              🐾
            </div>
            <h1 className="text-2xl font-black text-white">DiaVet Algérie 🇩🇿</h1>
            <p className="text-sm text-slate-300">
              Mise à jour de sécurité et synchronisation de l'application.
            </p>
            {this.state.errorMessage && (
              <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-500/20 p-2.5 rounded-xl font-mono text-left overflow-auto max-h-24">
                {this.state.errorMessage}
              </p>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleFullCleanReset}
                className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Actualiser & Nettoyer le Cache
              </button>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-white/10 active:scale-95 transition-all cursor-pointer"
              >
                Continuer quand même vers DiaVet
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <LanguageProvider>
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </LanguageProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
);

