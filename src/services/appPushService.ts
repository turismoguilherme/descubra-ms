import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export type PushPrefs = {
  eventsNearby: boolean;
  guataTips: boolean;
};

const PREFS_KEY = 'descubra_push_prefs';
const PROMPT_KEY = 'descubra_push_prompt_done';

export function getStoredPushPrefs(): PushPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { eventsNearby: true, guataTips: true };
    return { ...{ eventsNearby: true, guataTips: true }, ...JSON.parse(raw) };
  } catch {
    return { eventsNearby: true, guataTips: true };
  }
}

export function setStoredPushPrefs(prefs: PushPrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function wasPushPromptDone(): boolean {
  return localStorage.getItem(PROMPT_KEY) === '1';
}

export function markPushPromptDone() {
  localStorage.setItem(PROMPT_KEY, '1');
}

/** Reverse geocode leve (Nominatim) → cidade */
export async function reverseGeocodeCity(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'DescubraMS-App/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data?.address || {};
    const city =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.village ||
      addr.county ||
      null;
    return typeof city === 'string' ? city.trim() : null;
  } catch {
    return null;
  }
}

export async function registerPushTokenWithBackend(payload: {
  token: string;
  platform: 'android' | 'ios' | 'web';
  city_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  events_nearby?: boolean;
  guata_tips?: boolean;
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const { data, error } = await supabase.functions.invoke('register-app-push-token', {
    body: payload,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  if (error) throw error;
  return data;
}

/**
 * Ativa push + GPS cidade no app nativo.
 * Requer google-services.json (Firebase) no Android para obter token.
 */
export async function enableGuataEventPush(): Promise<{
  ok: boolean;
  city?: string | null;
  reason?: string;
}> {
  if (!Capacitor.isNativePlatform()) {
    return { ok: false, reason: 'only_native' };
  }

  const prefs = getStoredPushPrefs();

  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const { PushNotifications } = await import('@capacitor/push-notifications');

    const permGeo = await Geolocation.requestPermissions();
    if (permGeo.location !== 'granted' && permGeo.coarseLocation !== 'granted') {
      return { ok: false, reason: 'geo_denied' };
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 15000,
    });
    const { latitude, longitude } = position.coords;
    const city = await reverseGeocodeCity(latitude, longitude);

    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== 'granted') {
      return { ok: false, reason: 'push_denied', city };
    }

    await PushNotifications.register();

    const token = await new Promise<string>((resolve, reject) => {
      const t = window.setTimeout(() => reject(new Error('timeout_token')), 20000);
      PushNotifications.addListener('registration', (tokenEvent) => {
        window.clearTimeout(t);
        resolve(tokenEvent.value);
      });
      PushNotifications.addListener('registrationError', (err) => {
        window.clearTimeout(t);
        reject(err);
      });
    });

    const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
    await registerPushTokenWithBackend({
      token,
      platform,
      city_name: city,
      latitude,
      longitude,
      events_nearby: prefs.eventsNearby,
      guata_tips: prefs.guataTips,
    });

    setStoredPushPrefs({ ...prefs, eventsNearby: true });
    markPushPromptDone();
    return { ok: true, city };
  } catch (e) {
    console.warn('[push] enableGuataEventPush', e);
    return { ok: false, reason: String((e as Error)?.message || e) };
  }
}

export async function setupPushNotificationHandlers(
  onOpenDeepLink: (pathOrUrl: string) => void
) {
  if (!Capacitor.isNativePlatform()) return () => {};

  const { PushNotifications } = await import('@capacitor/push-notifications');
  const { App } = await import('@capacitor/app');

  const openFromData = (data: Record<string, string> | undefined) => {
    const link = data?.deep_link || data?.deepLink;
    if (link) onOpenDeepLink(link);
  };

  const subAction = await PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (event) => {
      openFromData(event.notification.data as Record<string, string>);
    }
  );

  const subReceive = await PushNotifications.addListener(
    'pushNotificationReceived',
    () => {
      /* foreground: opcional toast depois */
    }
  );

  const subUrl = await App.addListener('appUrlOpen', ({ url }) => {
    onOpenDeepLink(url);
  });

  return () => {
    void subAction.remove();
    void subReceive.remove();
    void subUrl.remove();
  };
}
