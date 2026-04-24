import { supabase } from '@/integrations/supabase/client';

export const PARTNER_ACCEPTING_NEW_APPLICATIONS_KEY = 'partner_accepting_new_applications';

/** Interpreta setting_value (jsonb) do site_settings; default true se ausente. */
export function parsePartnerAcceptingNewApplicationsValue(value: unknown): boolean {
  if (value === false || value === 'false') return false;
  if (value === true || value === 'true') return true;
  if (typeof value === 'string') return value.trim().toLowerCase() !== 'false';
  return true;
}

export async function fetchPartnerAcceptingNewApplications(): Promise<boolean> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('platform', 'ms')
    .eq('setting_key', PARTNER_ACCEPTING_NEW_APPLICATIONS_KEY)
    .maybeSingle();

  if (error) {
    console.warn('[partnerAcceptingApplications] Falha ao ler config, assumindo aberto:', error);
    return true;
  }
  if (data?.setting_value === undefined || data?.setting_value === null) return true;
  return parsePartnerAcceptingNewApplicationsValue(data.setting_value);
}
