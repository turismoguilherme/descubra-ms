import { supabase } from '@/integrations/supabase/client';
import { ContentVersion } from '@/types/admin';

export const contentService = {
  async getContentVersions(platform: 'viajar' | 'descubra_ms', contentKey?: string) {
    let query = supabase
      .from('content_versions')
      .select('*')
      .eq('platform', platform)
      .order('created_at', { ascending: false });
    
    if (contentKey) {
      query = query.eq('content_key', contentKey);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async getPublishedContent(platform: 'viajar' | 'descubra_ms', contentKey: string) {
    const { data, error } = await supabase
      .from('content_versions')
      .select('*')
      .eq('platform', platform)
      .eq('content_key', contentKey)
      .eq('is_published', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return data;
  },
};

