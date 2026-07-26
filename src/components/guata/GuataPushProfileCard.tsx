import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Bell, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  getStoredPushCity,
  getStoredPushPrefs,
  setEventsNearbyPushEnabled,
} from '@/services/appPushService';

/** Preferência de avisos do Guatá — só no app nativo. */
export function GuataPushProfileCard() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(() => getStoredPushPrefs().eventsNearby);
  const [city] = useState(() => getStoredPushCity());
  const [busy, setBusy] = useState(false);

  if (!Capacitor.isNativePlatform()) return null;

  const onToggle = async (next: boolean) => {
    setBusy(true);
    const res = await setEventsNearbyPushEnabled(next);
    setBusy(false);
    if (!res.ok) {
      toast({
        title: 'Não foi possível atualizar',
        description:
          res.reason === 'geo_denied'
            ? 'Permita a localização para ativar avisos por cidade.'
            : res.reason === 'push_denied'
              ? 'Permita notificações nas configurações do aparelho.'
              : 'Tente de novo em instantes.',
        variant: 'destructive',
      });
      return;
    }
    setEnabled(next);
    toast({
      title: next ? 'Avisos ligados' : 'Avisos desligados',
      description: next
        ? city
          ? `Guatá avisa eventos em ${city}.`
          : 'Guatá avisa eventos na cidade do GPS.'
        : 'Você não receberá pushes de eventos por enquanto.',
    });
  };

  return (
    <Card className="shadow-lg border-0 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Bell className="h-5 w-5 text-emerald-700" />
          Avisos do Guatá
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Label htmlFor="guata-events-push" className="text-sm font-medium text-gray-900">
              Eventos na cidade atual
            </Label>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Notificação quando houver evento novo ou em breve onde você está.
            </p>
          </div>
          <Switch
            id="guata-events-push"
            checked={enabled}
            disabled={busy}
            onCheckedChange={(v) => void onToggle(v)}
          />
        </div>
        {city && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 rounded-lg px-2.5 py-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            Cidade registrada: {city}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
