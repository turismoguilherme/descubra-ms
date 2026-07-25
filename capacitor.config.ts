import type { CapacitorConfig } from "@capacitor/cli";

/**
 * App nativo Descubra MS (Android + iOS) via Capacitor.
 * Bundle ID provisório — alinhar com contas Play Store / Apple Developer antes do publish.
 */
const config: CapacitorConfig = {
  appId: "com.descubrams.app",
  appName: "Descubra MS",
  webDir: "dist",
  server: {
    androidScheme: "https",
    iosScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0B3D2E",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0B3D2E",
    },
    Keyboard: {
      resize: "body",
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#0B3D2E",
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
  },
};

export default config;
