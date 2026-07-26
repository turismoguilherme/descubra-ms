import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Tela de abertura só no app nativo (não altera o site no browser).
 * Guatá grande + “Carregando…” até o app estabilizar.
 */
export function NativeBootSplash() {
  const [visible, setVisible] = useState(() => Capacitor.isNativePlatform());

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const hide = () => setVisible(false);
    const t1 = window.setTimeout(hide, 2200);
    const onReady = () => {
      window.setTimeout(hide, 400);
    };

    if (document.readyState === "complete") {
      onReady();
    } else {
      window.addEventListener("load", onReady, { once: true });
    }

    return () => {
      window.clearTimeout(t1);
      window.removeEventListener("load", onReady);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B3D2E] px-8"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <img
        src="/images/logo-descubra-ms.png"
        alt="Descubra Mato Grosso do Sul"
        className="w-[72vw] max-w-[320px] h-auto drop-shadow-2xl"
      />
      <div className="mt-10 flex flex-col items-center gap-3">
        <div className="h-1.5 w-36 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-white/80" />
        </div>
        <p className="text-white/90 text-sm font-medium tracking-wide">
          Carregando…
        </p>
      </div>
    </div>
  );
}
