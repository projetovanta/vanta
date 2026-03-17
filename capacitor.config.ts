import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.maisvanta.app',
  appName: 'VANTA',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Deep links: hostname que o app intercepta
    hostname: 'maisvanta.com',
  },
  // App Links (Android) + Universal Links (iOS)
  // Configurar nos projetos nativos:
  //   iOS: Associated Domains → applinks:maisvanta.com
  //   Android: intent-filter em AndroidManifest.xml → maisvanta.com
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#050505',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#050505',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
