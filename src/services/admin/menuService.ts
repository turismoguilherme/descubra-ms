import { supabase } from '@/integrations/supabase/client';
import { DynamicMenu } from '@/types/admin';

export const menuService = {
  async getMenus(platform: 'viajar' | 'descubra_ms', menuType?: DynamicMenu['menu_type']) {
    let query = supabase
      .from('dynamic_menus')
      .select('*')
      .eq('platform', platform)
      .order('order_index', { ascending: true });
    
    if (menuType) {
      query = query.eq('menu_type', menuType);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async reorderMenus(menuIds: string[]) {
    const updates = menuIds.map((id, index) => ({
      id,
      order_index: index,
    }));

    for (const update of updates) {
      await supabase
        .from('dynamic_menus')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }
  },
};

