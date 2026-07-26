import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Bell, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  enableGuataEventPush,
  wasPushPromptDone,
  markPushPromptDone,
} from '@/services/appPushService';

/**
 * Opt-in de avisos do Guatá (eventos na cidade do GPS).
 * Só aparece no app nativo, uma vez (ou até aceitar/recusar).
 */
export function GuataPushOptIn() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    if (wasPushPromptDone()) return;
    const t = window.setTimeout(() => setOpen(true), 4500);
    return () => window.clearTimeout(t);
  }, []);

  if (!open) return null;

  const dismiss = () => {
    markPushPromptDone();
    setOpen(false);
  };

  const accept = async () => {
    setBusy(true);
    setResult(null);
    const res = await enableGuataEventPush();
    setBusy(false);
    if (res.ok) {
      setResult(
        res.city
          ? `Pronto! Vou avisar eventos em ${res.city}.`
          : 'Pronto! Ativei os avisos de eventos perto de você.'
      );
      window.setTimeout(dismiss, 2200);
    } else if (res.reason === 'geo_denied') {
      setResult('Preciso da localização para saber a cidade dos eventos.');
    } else if (res.reason === 'push_denied') {
      setResult('Sem permissão de notificação não consigo te avisar.');
    } else {
      setResult(
        'Ainda estamos configurando o Firebase neste aparelho. Tente de novo após a atualização.'
      );
      markPushPromptDone();
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-md rounded-2xl bg-[#0B3D2E] text-white shadow-2xl border border-white/10 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-white/15 p-2 shrink-0">
            <Bell className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-base leading-snug">
                Guatá pode te avisar de eventos
              </h2>
              <button
                type="button"
                onClick={dismiss}
                className="text-white/70 hover:text-white p-0.5"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-white/85 text-sm mt-1.5 leading-relaxed">
              Com a sua localização, aviso quando tiver evento na cidade em que você está.
              É só tocar e abrir o evento.
            </p>
            <p className="flex items-center gap-1.5 text-white/60 text-xs mt-2">
              <MapPin className="h-3.5 w-3.5" />
              Usamos a cidade atual (GPS), não a o tempo todo em segundo plano.
            </p>
            {result && (
              <p className="text-amber-200 text-sm mt-2">{result}</p>
            )}
            <div className="flex gap-2 mt-3">
              <Button
                type="button"
                disabled={busy}
                onClick={() => void accept()}
                className="flex-1 bg-white text-[#0B3D2E] hover:bg-emerald-50 font-semibold"
              >
                {busy ? 'Ativando…' : 'Quero avisos'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={dismiss}
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                Agora não
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
