import { supabase } from '@/integrations/supabase/client';
import { ContentVersion } from '@/types/admin';

export const contentService = {
  async getContentVersions(platform: 'viajar' | 'descubra_ms', contentKey?: string) {
    let query = (supabase as any)
      .from('content_versions')
      .select('*')
      .eq('platform', platform)
      .order('created_at', { ascending: false });
    
    if (contentKey) {
      query = query.eq('content_key', contentKey);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []) as ContentVersion[];
  },

  async getPublishedContent(platform: 'viajar' | 'descubra_ms', contentKey: string) {
    const { data, error } = await (supabase as any)
      .from('content_versions')
      .select('*')
      .eq('platform', platform)
      .eq('content_key', contentKey)
      .eq('is_published', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as ContentVersion | null;
  },
};
