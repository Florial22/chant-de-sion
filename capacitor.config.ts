import type { CapacitorConfig } from "@capacitor/cli";


type ConfigWithAssets = CapacitorConfig & {
  assets?: {
    ios?: {
      image?: string;
      backgroundColor?: string;
      darkImage?: string;
      darkBackgroundColor?: string;
    };
    android?: {
      image?: string;
      backgroundColor?: string;
      darkImage?: string;
      darkBackgroundColor?: string;
    };
  };
};

const config: ConfigWithAssets = {
  appId: "com.florial.chantdesion",
  appName: "Chant de Sion",
  webDir: "dist",

  // Native WebView background colors 
  ios: { backgroundColor: "#417956" },
  android: { backgroundColor: "#417956" },

  // Used by @capacitor/assets generator
  assets: {
    ios: {
      image: "assets/splash/splash.png",         // <-- make sure this file exists
      backgroundColor: "#E2EEE4",
      // dark mode support for updates
      // darkImage: "assets/splash/splash-dark.png",
      // darkBackgroundColor: "#0B0B0B",
    },
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      launchFadeOutDuration: 250,
      backgroundColor: "#417956",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashImmersive: true,
      useDialog: false,
    },
  },
};

export default config;
