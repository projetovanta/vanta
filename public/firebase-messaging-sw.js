/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging Service Worker
 * Recebe push notifications em background.
 *
 * Para ativar: substituir PLACEHOLDER pelas credenciais reais do projeto Firebase.
 */

importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCb2DXFoGvF8z-Fl3uE3xjAIfM8rs59-5s',
  authDomain: 'projetovanta-1c58a.firebaseapp.com',
  projectId: 'projetovanta-1c58a',
  storageBucket: 'projetovanta-1c58a.firebasestorage.app',
  messagingSenderId: '57820969484',
  appId: '1:57820969484:web:57463d47a99b9b90d28c29',
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
