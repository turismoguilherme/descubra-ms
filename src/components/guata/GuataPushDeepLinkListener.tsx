import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { setupPushNotificationHandlers } from '@/services/appPushService';

function toAppPath(link: string): string {
  try {
    if (link.startsWith('/')) return link;
    const url = new URL(link);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/descubrams/eventos';
  }
}

/** Escuta toque na notificação e abre o deep link (ex.: evento). */
export function GuataPushDeepLinkListener() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cleanup: (() => void) | undefined;
    void setupPushNotificationHandlers((link) => {
      navigate(toAppPath(link));
    }).then((fn) => {
      cleanup = fn;
    });
    return () => cleanup?.();
  }, [navigate]);

  return null;
}
