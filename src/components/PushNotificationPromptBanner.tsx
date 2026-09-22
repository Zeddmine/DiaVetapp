import { useState, useEffect } from 'react';
import { Bell, Sparkles, Check, X, ShieldCheck } from 'lucide-react';
import { 
  getNotificationPermissionStatus, 
  requestPushNotificationPermission, 
  dispatchNativePushNotification 
} from '../services/firebaseMessaging';
import { soundEngine } from '../utils/soundEngine';
import { Language } from '../types';

interface PushNotificationPromptBannerProps {
  currentLang: Language;
  onOpenPushCenter?: () => void;
}

export default function PushNotificationPromptBanner({
  currentLang,
  onOpenPushCenter
}: PushNotificationPromptBannerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(getNotificationPermissionStatus());
    }
  }, []);

  // If already granted, denied, or dismissed, do not display
  if (permission === 'granted' || isDismissed) {
    return null;
  }

  const handleActivate = async () => {
    soundEngine.playCyberClick();
    setIsLoading(true);

    try {
      const res = await requestPushNotificationPermission('vet', {
        userName: 'Développeur / Admin DiaVet',
        wilaya: '16 - Alger'
      });

      setPermission(res.permission);
      setIsLoading(false);

      if (res.permission === 'granted' || res.success) {
        soundEngine.playCelebration();
        setShowSuccess(true);

        // Send instant test notification confirming native OS reception
        dispatchNativePushNotification("🔔 Notifications DiaVet Activées !", {
          body: "Parfait ! Vous recevrez désormais chaque inscription et alerte en direct sur votre appareil.",
          icon: '/pwa-192x192.png',
          tag: 'diavet-init-success',
          actionUrl: '/'
        });

        setTimeout(() => {
          setIsDismissed(true);
        }, 3000);
      } else {
        setIsDismissed(true);
      }
    } catch (err) {
      setIsLoading(false);
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    soundEngine.playCyberClick();
    setIsDismissed(true);
  };

  const texts = {
    fr: {
      title: "Activer les notifications directes",
      desc: "Recevez chaque inscription et alerte clinique instantanément sur votre écran.",
      btn: "Activer en 1 clic",
      success: "Notifications activées avec succès !"
    },
    en: {
      title: "Enable Direct Push Alerts",
      desc: "Get every new sign-up and clinical alert instantly on your screen.",
      btn: "Enable in 1 click",
      success: "Notifications enabled successfully!"
    },
    ar: {
      title: "تفعيل الإشعارات الفورية",
      desc: "استقبل كل تسجيل جديد وتنبيه صحي مباشرة على شاشتك.",
      btn: "تفعيل بنقرة واحدة",
      success: "تم تفعيل الإشعارات بنجاح !"
    }
  }[currentLang];

  return (
    <div className="fixed bottom-5 right-5 left-5 sm:left-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative rounded-2xl bg-slate-900/95 border-2 border-cyan-400/60 p-4 text-white shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
        
        {/* Glow corner */}
        <div className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
            {showSuccess ? (
              <Check className="w-5 h-5 text-white animate-bounce" />
            ) : (
              <Bell className="w-5 h-5 text-white animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-sm text-cyan-200 flex items-center gap-1.5">
              <span>{showSuccess ? texts.success : texts.title}</span>
              {!showSuccess && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {showSuccess ? "Votre appareil est maintenant synchronisé en temps réel." : texts.desc}
            </p>

            {!showSuccess && (
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleActivate}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-md shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isLoading ? "Activation..." : texts.btn}</span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Plus tard
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
