/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging Service Worker
 * Recebe push notifications em background.
 *
 * Para ativar: substituir PLACEHOLDER pelas credenciais reais do projeto Firebase.
 */

importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDs2p2ifLYhke1QjCBhjZkfSjptpEyR1l4',
  authDomain: 'mais-vanta.firebaseapp.com',
  projectId: 'mais-vanta',
  storageBucket: 'mais-vanta.firebasestorage.app',
  messagingSenderId: '274540560263',
  appId: '1:274540560263:web:07faacbbea3c3029f1dd22',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  const notificationOptions = {
    body: body || 'Nova notificação VANTA',
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'vanta-push',
    data: payload.data || {},
    vibrate: [100, 50, 100],
  };

  self.registration.showNotification(title || 'VANTA', notificationOptions);
});

// Ao clicar na notificação, abre o app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
