import { supabase } from "@/integrations/supabase/client";
import { ReportTemplate, ReportData, ReportSchedule, ReportCategory } from "@/types/reports";

export const reportService = {
  // --- Templates ---
  async createTemplate(template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ReportTemplate | null> {
    const { data, error } = await supabase
      .from('report_templates')
      .insert(template)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getTemplates(category?: string, isPublic?: boolean): Promise<ReportTemplate[]> {
    let query = supabase
      .from('report_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);
    if (isPublic !== undefined) query = query.eq('is_public', isPublic);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getTemplate(id: string): Promise<ReportTemplate | null> {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async updateTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate | null> {
    const { data, error } = await supabase
      .from('report_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('report_templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // --- Report Generation ---
  async generateReport(templateId: string, parameters: Record<string, any>, userId: string): Promise<ReportData | null> {
    // First, create a pending report record
    const { data: reportData, error: createError } = await supabase
      .from('report_data')
      .insert({
        template_id: templateId,
        name: `Report ${new Date().toISOString()}`,
        parameters,
        data: [],
        generated_by: userId,
        status: 'generating'
      })
      .select()
      .single();

    if (createError) throw createError;

    try {
      // Get template configuration
      const template = await this.getTemplate(templateId);
      if (!template) throw new Error('Template not found');

      // Generate data based on template
      const data = await this.executeReportQuery(template, parameters);
      
      // Update report with generated data
      const { data: updatedReport, error: updateError } = await supabase
        .from('report_data')
        .update({
          data,
          status: 'completed',
          generated_at: new Date().toISOString()
        })
        .eq('id', reportData.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedReport;
    } catch (error) {
      // Update report status to failed
      await supabase
        .from('report_data')
        .update({ status: 'failed' })
        .eq('id', reportData.id);
      throw error;
    }
  },

  async executeReportQuery(template: ReportTemplate, parameters: Record<string, any>): Promise<any[]> {
    // This is a simplified implementation
    // In a real scenario, you'd have a query builder or use stored procedures
    
    let query = supabase.from(template.data_source).select('*');
    
    // Apply filters based on template configuration
    template.filters.forEach(filter => {
      const value = parameters[filter.field];
      if (value !== undefined && value !== null && value !== '') {
        switch (filter.type) {
          case 'text':
            query = query.ilike(filter.field, `%${value}%`);
            break;
          case 'date_range':
            if (value.start) query = query.gte(filter.field, value.start);
            if (value.end) query = query.lte(filter.field, value.end);
            break;
          case 'number_range':
            if (value.min) query = query.gte(filter.field, value.min);
            if (value.max) query = query.lte(filter.field, value.max);
            break;
          case 'select':
            if (Array.isArray(value)) {
              query = query.in(filter.field, value);
            } else {
              query = query.eq(filter.field, value);
            }
            break;
          case 'boolean':
            query = query.eq(filter.field, value);
            break;
        }
      }
    });

    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  },

  async getReportData(reportId: string): Promise<ReportData | null> {
    const { data, error } = await supabase
      .from('report_data')
      .select('*')
      .eq('id', reportId)
      .single();
    if (error) throw error;
    return data;
  },

  async getUserReports(userId: string, limit = 20, offset = 0): Promise<{ reports: ReportData[], count: number }> {
    const { data, error, count } = await supabase
      .from('report_data')
      .select('*', { count: 'exact' })
      .eq('generated_by', userId)
      .order('generated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { reports: data || [], count: count || 0 };
  },

  // --- Schedules ---
  async createSchedule(schedule: Omit<ReportSchedule, 'id' | 'created_at' | 'next_run'>): Promise<ReportSchedule | null> {
    const nextRun = this.calculateNextRun(schedule.frequency, schedule.time, schedule.day_of_week, schedule.day_of_month);
    
    const { data, error } = await supabase
      .from('report_schedules')
      .insert({
        ...schedule,
        next_run: nextRun
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getSchedules(userId: string): Promise<ReportSchedule[]> {
    const { data, error } = await supabase
      .from('report_schedules')
      .select('*')
      .eq('created_by', userId)
      .order('next_run', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async updateSchedule(id: string, updates: Partial<ReportSchedule>): Promise<ReportSchedule | null> {
    const { data, error } = await supabase
      .from('report_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('report_schedules')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // --- Categories ---
  async getCategories(): Promise<ReportCategory[]> {
    const { data, error } = await supabase
      .from('report_categories')
      .select('*')
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // --- Analytics ---
  async getReportStats(userId: string): Promise<{
    totalReports: number;
    reportsThisMonth: number;
    avgGenerationTime: number;
    mostUsedTemplate: string | null;
  }> {
    const { data: totalData, error: totalError } = await supabase
      .from('report_data')
      .select('count', { count: 'exact', head: true })
      .eq('generated_by', userId);
    if (totalError) throw totalError;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const { data: monthData, error: monthError } = await supabase
      .from('report_data')
      .select('count', { count: 'exact', head: true })
      .eq('generated_by', userId)
      .gte('generated_at', thisMonth.toISOString());
    if (monthError) throw monthError;

    const { data: templateData, error: templateError } = await supabase
      .from('report_data')
      .select('template_id')
      .eq('generated_by', userId)
      .eq('status', 'completed');
    if (templateError) throw templateError;

    // Count template usage
    const templateCounts = (templateData || []).reduce((acc: Record<string, number>, item) => {
      acc[item.template_id] = (acc[item.template_id] || 0) + 1;
      return acc;
    }, {});

    const mostUsedTemplate = Object.keys(templateCounts).reduce((a, b) => 
      templateCounts[a] > templateCounts[b] ? a : b, null
    );

    return {
      totalReports: totalData?.count || 0,
      reportsThisMonth: monthData?.count || 0,
      avgGenerationTime: 0, // Would need to track generation time
      mostUsedTemplate
    };
  },

  // Helper function to calculate next run time
  calculateNextRun(frequency: string, time: string, dayOfWeek?: number, dayOfMonth?: number): string {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'weekly':
        if (dayOfWeek !== undefined) {
          const daysUntilTarget = (dayOfWeek - nextRun.getDay() + 7) % 7;
          nextRun.setDate(nextRun.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
        }
        break;
      case 'monthly':
        if (dayOfMonth !== undefined) {
          nextRun.setDate(dayOfMonth);
          if (nextRun <= now) {
            nextRun.setMonth(nextRun.getMonth() + 1);
          }
        }
        break;
      case 'quarterly':
        nextRun.setMonth(nextRun.getMonth() + 3);
        break;
    }

    return nextRun.toISOString();
  }
};
