import { supabase } from "@/integrations/supabase/client";
import { Lead, LeadSource, LeadStatus, LeadPriority, LeadActivity, LeadPipeline, LeadFilter, LeadStats } from "@/types/leads";

export const leadService = {
  // --- Leads CRUD ---
  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getLeads(filter: LeadFilter = {}, limit = 50, offset = 0): Promise<{ leads: Lead[], count: number }> {
    let query = supabase
      .from('leads')
      .select(`
        *,
        source:lead_sources(name, color),
        status:lead_statuses(name, color, order),
        priority:lead_priorities(name, color, order),
        assigned_user:profiles(full_name, email)
      `, { count: 'exact' });

    // Apply filters
    if (filter.status && filter.status.length > 0) {
      query = query.in('status_id', filter.status);
    }
    if (filter.source && filter.source.length > 0) {
      query = query.in('source_id', filter.source);
    }
    if (filter.priority && filter.priority.length > 0) {
      query = query.in('priority_id', filter.priority);
    }
    if (filter.assigned_to && filter.assigned_to.length > 0) {
      query = query.in('assigned_to', filter.assigned_to);
    }
    if (filter.created_date_from) {
      query = query.gte('created_at', filter.created_date_from);
    }
    if (filter.created_date_to) {
      query = query.lte('created_at', filter.created_date_to);
    }
    if (filter.value_min) {
      query = query.gte('value', filter.value_min);
    }
    if (filter.value_max) {
      query = query.lte('value', filter.value_max);
    }
    if (filter.tags && filter.tags.length > 0) {
      query = query.overlaps('tags', filter.tags);
    }
    if (filter.search) {
      query = query.or(`name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,company.ilike.%${filter.search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { leads: data || [], count: count || 0 };
  },

  async getLead(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        source:lead_sources(name, color),
        status:lead_statuses(name, color, order),
        priority:lead_priorities(name, color, order),
        assigned_user:profiles(full_name, email)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // --- Lead Sources ---
  async getSources(): Promise<LeadSource[]> {
    const { data, error } = await supabase
      .from('lead_sources')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createSource(source: Omit<LeadSource, 'id' | 'created_at'>): Promise<LeadSource | null> {
    const { data, error } = await supabase
      .from('lead_sources')
      .insert(source)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Lead Statuses ---
  async getStatuses(): Promise<LeadStatus[]> {
    const { data, error } = await supabase
      .from('lead_statuses')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createStatus(status: Omit<LeadStatus, 'id' | 'created_at'>): Promise<LeadStatus | null> {
    const { data, error } = await supabase
      .from('lead_statuses')
      .insert(status)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Lead Priorities ---
  async getPriorities(): Promise<LeadPriority[]> {
    const { data, error } = await supabase
      .from('lead_priorities')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createPriority(priority: Omit<LeadPriority, 'id' | 'created_at'>): Promise<LeadPriority | null> {
    const { data, error } = await supabase
      .from('lead_priorities')
      .insert(priority)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Lead Activities ---
  async getLeadActivities(leadId: string, limit = 20, offset = 0): Promise<{ activities: LeadActivity[], count: number }> {
    const { data, error, count } = await supabase
      .from('lead_activities')
      .select(`
        *,
        created_by_user:profiles(full_name, email)
      `, { count: 'exact' })
      .eq('lead_id', leadId)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { activities: data || [], count: count || 0 };
  },

  async createActivity(activity: Omit<LeadActivity, 'id' | 'created_at'>): Promise<LeadActivity | null> {
    const { data, error } = await supabase
      .from('lead_activities')
      .insert(activity)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Lead Pipelines ---
  async getPipelines(): Promise<LeadPipeline[]> {
    const { data, error } = await supabase
      .from('lead_pipelines')
      .select(`
        *,
        stages:lead_pipeline_stages(*)
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createPipeline(pipeline: Omit<LeadPipeline, 'id' | 'created_at'>): Promise<LeadPipeline | null> {
    const { data, error } = await supabase
      .from('lead_pipelines')
      .insert(pipeline)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // --- Analytics & Stats ---
  async getLeadStats(userId?: string, dateFrom?: string, dateTo?: string): Promise<LeadStats> {
    let query = supabase.from('leads').select('*');
    
    if (userId) {
      query = query.eq('created_by', userId);
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data: leads, error } = await query;
    if (error) throw error;

    const leadsData = leads || [];
    const totalLeads = leadsData.length;
    const newLeads = leadsData.filter(lead => {
      const createdDate = new Date(lead.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    }).length;

    const qualifiedLeads = leadsData.filter(lead => 
      lead.status_id === 'qualified' || lead.status_id === 'proposal'
    ).length;

    const convertedLeads = leadsData.filter(lead => 
      lead.status_id === 'won' || lead.status_id === 'closed-won'
    ).length;

    const totalValue = leadsData.reduce((sum, lead) => sum + (lead.value || 0), 0);
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const avgDealSize = convertedLeads > 0 ? totalValue / convertedLeads : 0;

    // Group by status
    const leadsByStatus = leadsData.reduce((acc: Record<string, { count: number; value: number }>, lead) => {
      const status = lead.status_id || 'unknown';
      if (!acc[status]) {
        acc[status] = { count: 0, value: 0 };
      }
      acc[status].count++;
      acc[status].value += lead.value || 0;
      return acc;
    }, {});

    // Group by source
    const leadsBySource = leadsData.reduce((acc: Record<string, { count: number; value: number }>, lead) => {
      const source = lead.source_id || 'unknown';
      if (!acc[source]) {
        acc[source] = { count: 0, value: 0 };
      }
      acc[source].count++;
      acc[source].value += lead.value || 0;
      return acc;
    }, {});

    // Group by month
    const leadsByMonth = leadsData.reduce((acc: Record<string, { count: number; value: number }>, lead) => {
      const month = new Date(lead.created_at).toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { count: 0, value: 0 };
      }
      acc[month].count++;
      acc[month].value += lead.value || 0;
      return acc;
    }, {});

    return {
      total_leads: totalLeads,
      new_leads: newLeads,
      qualified_leads: qualifiedLeads,
      converted_leads: convertedLeads,
      total_value: totalValue,
      conversion_rate: parseFloat(conversionRate.toFixed(2)),
      avg_deal_size: parseFloat(avgDealSize.toFixed(2)),
      leads_by_status: Object.entries(leadsByStatus).map(([status, data]) => ({
        status,
        count: data.count,
        value: data.value
      })),
      leads_by_source: Object.entries(leadsBySource).map(([source, data]) => ({
        source,
        count: data.count,
        value: data.value
      })),
      leads_by_month: Object.entries(leadsByMonth).map(([month, data]) => ({
        month,
        count: data.count,
        value: data.value
      }))
    };
  },

  // --- Bulk Operations ---
  async bulkUpdateLeads(leadIds: string[], updates: Partial<Lead>): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .in('id', leadIds);
    if (error) throw error;
  },

  async bulkDeleteLeads(leadIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', leadIds);
    if (error) throw error;
  },

  // --- Import/Export ---
  async exportLeads(filter: LeadFilter = {}): Promise<Lead[]> {
    const { leads } = await this.getLeads(filter, 10000, 0); // Large limit for export
    return leads;
  },

  async importLeads(leads: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (const lead of leads) {
      try {
        await this.createLead(lead);
        success++;
      } catch (error: any) {
        errors.push(`Lead ${lead.email}: ${error.message}`);
      }
    }

    return { success, errors };
  }
};
