import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.florial.chantdesion',
  appName: 'Chant de Sion',
  webDir: 'dist',

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,          // show ~1.2s on cold start
      launchAutoHide: true,              // auto hide after duration
      launchFadeOutDuration: 250,        // smooth fade out
      backgroundColor: '#417956',        // your accent
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashImmersive: true,
      useDialog: false
    }
  }
};

export default config;
