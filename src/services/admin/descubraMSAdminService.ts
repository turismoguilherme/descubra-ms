import { supabase } from '@/integrations/supabase/client';
import { ContentVersion, DynamicMenu } from '@/types/admin';

export const descubraMSAdminService = {
  // Content
  async getContentVersions(platform: 'viajar' | 'descubra_ms') {
    const { data, error } = await supabase
      .from('content_versions')
      .select('*')
      .eq('platform', platform)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createContentVersion(content: Omit<ContentVersion, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('content_versions')
      .insert([content])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateContentVersion(id: string, updates: Partial<ContentVersion>) {
    const { data, error } = await supabase
      .from('content_versions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Menus
  async getMenus(platform: 'viajar' | 'descubra_ms') {
    const { data, error } = await supabase
      .from('dynamic_menus')
      .select('*')
      .eq('platform', platform)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createMenu(menu: Omit<DynamicMenu, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('dynamic_menus')
      .insert([menu])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateMenu(id: string, updates: Partial<DynamicMenu>) {
    const { data, error } = await supabase
      .from('dynamic_menus')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteMenu(id: string) {
    const { error } = await supabase
      .from('dynamic_menus')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Users
  async listUsers() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        role:user_roles(
          role,
          city_id,
          region_id
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateUser(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async banUser(userId: string) {
    // Marcar usuário como banido (pode criar uma coluna is_banned ou usar uma flag)
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ is_banned: true, banned_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

