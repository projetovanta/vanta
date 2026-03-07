/**
 * Firebase Config — inicialização lazy com dynamic import.
 * Firebase (~150KB) só é carregado quando getFirebaseApp() é chamado pela primeira vez.
 *
 * Para ativar: criar projeto Firebase, copiar credenciais e setar as VITE_FIREBASE_* no .env
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'PLACEHOLDER',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'PLACEHOLDER.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'PLACEHOLDER',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'PLACEHOLDER.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:000000000000:web:0000000000000000',
};

let app: import('firebase/app').FirebaseApp | null = null;
let messaging: import('firebase/messaging').Messaging | null = null;

const isConfigured = (): boolean =>
  firebaseConfig.apiKey !== 'PLACEHOLDER' && firebaseConfig.projectId !== 'PLACEHOLDER';

export const getFirebaseApp = async (): Promise<import('firebase/app').FirebaseApp | null> => {
  if (!isConfigured()) {
    console.warn('[Firebase] Credenciais não configuradas. Defina VITE_FIREBASE_* no .env'); // audit-ok: aviso de config
    return null;
  }
  if (!app) {
    const { initializeApp } = await import('firebase/app');
    app = initializeApp(firebaseConfig);
  }
  return app;
};

export const getFirebaseMessaging = async (): Promise<import('firebase/messaging').Messaging | null> => {
  const firebaseApp = await getFirebaseApp();
  if (!firebaseApp) return null;
  if (!messaging) {
    const { getMessaging } = await import('firebase/messaging');
    messaging = getMessaging(firebaseApp);
  }
  return messaging;
};

export { isConfigured as isFirebaseConfigured };
