// Firebase Cloud Messaging Service Worker for DiaVet DZ
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId
const firebaseConfig = {
  apiKey: "AIzaSyC9JHJOlL63H-CpZiCyCx4wx4W7lrVcOwI",
  authDomain: "gen-lang-client-0335742396.firebaseapp.com",
  projectId: "gen-lang-client-0335742396",
  storageBucket: "gen-lang-client-0335742396.firebasestorage.app",
  messagingSenderId: "470382290950",
  appId: "1:470382290950:web:5f3f9ddb7b7c2c5e937b87"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Background message handler
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background Push Notification received:', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'DiaVet Algérie — Alerte Santé';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'Vous avez reçu une notification clinique importante.',
      icon: payload.notification?.icon || '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      image: payload.notification?.image || payload.data?.image,
      tag: payload.data?.tag || 'diavet-health-alert',
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      data: {
        url: payload.data?.url || payload.fcmOptions?.link || '/',
        petName: payload.data?.petName,
        alertType: payload.data?.alertType,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'open_portal',
          title: '📋 Voir le carnet',
          icon: '/pwa-192x192.png'
        },
        {
          action: 'call_vet',
          title: '📞 Clinique',
          icon: '/pwa-192x192.png'
        }
      ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.warn('[firebase-messaging-sw.js] FCM background initialization note:', e);
}

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  if (event.action === 'call_vet') {
    event.waitUntil(
      clients.openWindow('tel:+213550123456')
    );
    return;
  }

  // Open the target app window or focus existing
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
