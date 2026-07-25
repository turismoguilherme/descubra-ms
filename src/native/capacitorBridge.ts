import { Capacitor } from "@capacitor/core";

/**
 * Inicializa plugins nativos só quando rodando dentro do app Capacitor.
 * No browser (site) não faz nada.
 */
export async function initNativeApp(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#0B3D2E" });
    }
  } catch (error) {
    console.warn("[native] StatusBar:", error);
  }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch (error) {
    console.warn("[native] SplashScreen:", error);
  }

  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (error) {
    console.warn("[native] App backButton:", error);
  }
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export function getNativePlatform(): string {
  return Capacitor.getPlatform();
}
