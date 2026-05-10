import { useCallback, useEffect, useMemo, useState } from 'react';
import { platformContentService } from '@/services/admin/platformContentService';
import guataFallbackLogo from '@/assets/guata-labs-logo.png';

export const GUATA_LABS_CONTENT_KEYS = [
  'guata_navbar_logo_url',
  'guata_mascot_hero',
  'guata_mascot_floating',
  'guata_mascot_about',
  'guata_mascot_404',
  'guata_mascot_cta',
  'guata_msg_floating_home',
  'guata_msg_floating_casos',
  'guata_msg_floating_contato',
  'guata_tip_hero',
  'guata_tip_what_we_do',
  'guata_tip_benefits',
  'guata_tip_how_it_works',
  'guata_tip_success',
  'guata_brand_name',
  'guata_brand_tagline',
] as const;

export type GuataLabsContentKey = (typeof GUATA_LABS_CONTENT_KEYS)[number];

const DEFAULTS: Record<GuataLabsContentKey, string> = {
  guata_navbar_logo_url: '',
  guata_mascot_hero: '',
  guata_mascot_floating: '',
  guata_mascot_about: '',
  guata_mascot_404: '',
  guata_mascot_cta: '',
  guata_msg_floating_home:
    'Olá! Sou o Guatá. Que tal uma demonstração da nossa plataforma?',
  guata_msg_floating_casos: 'Quer ver como outros destinos usam a Guatá Labs?',
  guata_msg_floating_contato: 'Estamos por aqui — envie sua mensagem ou agende uma demo.',
  guata_tip_hero: 'Tecnologia e turismo a serviço de quem decide.',
  guata_tip_what_we_do: 'Da gestão pública ao empresário: soluções modulares para o turismo.',
  guata_tip_benefits: 'Cada módulo foi pensado para gestores e empresários do turismo.',
  guata_tip_how_it_works: 'Implementação guiada, do diagnóstico ao uso no dia a dia.',
  guata_tip_success: 'Cases reais: do estado ao chatbot internacional.',
  guata_brand_name: 'Guatá Labs',
  guata_brand_tagline: 'Ecossistema inteligente de turismo com IA.',
};

export function useGuataLabsContent() {
  const [map, setMap] = useState<Partial<Record<GuataLabsContentKey, string>>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await platformContentService.getContent([...GUATA_LABS_CONTENT_KEYS]);
      const next: Partial<Record<GuataLabsContentKey, string>> = {};
      rows.forEach((r) => {
        const k = r.content_key as GuataLabsContentKey;
        if (GUATA_LABS_CONTENT_KEYS.includes(k)) {
          next[k] = r.content_value ?? '';
        }
      });
      setMap(next);
    } catch {
      setMap({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const get = useCallback(
    (key: GuataLabsContentKey, fallback?: string) => {
      const v = map[key]?.trim();
      if (v) return v;
      return fallback ?? DEFAULTS[key];
    },
    [map]
  );

  const imageUrl = useCallback(
    (key: GuataLabsContentKey) => {
      const v = map[key]?.trim();
      if (v) return v;
      return guataFallbackLogo;
    },
    [map]
  );

  const navbarLogoSrc = useCallback(() => {
    const v = map.guata_navbar_logo_url?.trim();
    if (v) return v;
    return guataFallbackLogo;
  }, [map]);

  /** Variação leve por horário usando a mesma URL base (ou três slots futuros no CMS). */
  const heroMascotUrl = useMemo(() => {
    const base = imageUrl('guata_mascot_hero');
    const hour = new Date().getHours();
    if (hour < 12) return base;
    if (hour < 18) return base;
    return base;
  }, [imageUrl]);

  return {
    loading,
    reload: load,
    get,
    imageUrl,
    heroMascotUrl,
    navbarLogoSrc,
    fallbackLogo: guataFallbackLogo,
    brandName: get('guata_brand_name'),
    brandTagline: get('guata_brand_tagline'),
  };
}
