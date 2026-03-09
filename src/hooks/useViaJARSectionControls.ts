import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SectionControl {
  id: string;
  section_key: string;
  section_title: string;
  is_active: boolean;
  admin_notes: string | null;
  updated_at: string;
}

interface MetricConfig {
  id: string;
  section_key: string;
  metric_key: string;
  display_value: string;
  label: string;
  is_active: boolean;
  is_projected: boolean;
  display_order: number;
  admin_notes: string | null;
}

export function useViaJARSectionControls() {
  const [sections, setSections] = useState<SectionControl[]>([]);
  const [metrics, setMetrics] = useState<MetricConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [sectionsRes, metricsRes] = await Promise.all([
        supabase.from('viajar_section_controls').select('*').order('section_key'),
        supabase.from('viajar_metrics_config').select('*').order('display_order')
      ]);

      if (sectionsRes.data) setSections(sectionsRes.data as SectionControl[]);
      if (metricsRes.data) setMetrics(metricsRes.data as MetricConfig[]);
    } catch (error) {
      console.error('Erro ao carregar controles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const isSectionActive = useCallback((sectionKey: string): boolean => {
    const section = sections.find(s => s.section_key === sectionKey);
    return section?.is_active ?? false;
  }, [sections]);

  const getActiveMetrics = useCallback((sectionKey: string): MetricConfig[] => {
    return metrics
      .filter(m => m.section_key === sectionKey && m.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }, [metrics]);

  const toggleSection = useCallback(async (sectionKey: string, isActive: boolean) => {
    const { error } = await supabase
      .from('viajar_section_controls')
      .update({ is_active: isActive, updated_by: (await supabase.auth.getUser()).data.user?.id })
      .eq('section_key', sectionKey);

    if (error) throw error;
    setSections(prev => prev.map(s => s.section_key === sectionKey ? { ...s, is_active: isActive } : s));
  }, []);

  const toggleMetric = useCallback(async (metricKey: string, isActive: boolean) => {
    const { error } = await supabase
      .from('viajar_metrics_config')
      .update({ is_active: isActive, updated_by: (await supabase.auth.getUser()).data.user?.id })
      .eq('metric_key', metricKey);

    if (error) throw error;
    setMetrics(prev => prev.map(m => m.metric_key === metricKey ? { ...m, is_active: isActive } : m));
  }, []);

  const updateMetric = useCallback(async (metricKey: string, updates: Partial<Pick<MetricConfig, 'display_value' | 'label' | 'is_projected'>>) => {
    const { error } = await supabase
      .from('viajar_metrics_config')
      .update({ ...updates, updated_by: (await supabase.auth.getUser()).data.user?.id })
      .eq('metric_key', metricKey);

    if (error) throw error;
    setMetrics(prev => prev.map(m => m.metric_key === metricKey ? { ...m, ...updates } : m));
  }, []);

  const updateSectionNotes = useCallback(async (sectionKey: string, notes: string) => {
    const { error } = await supabase
      .from('viajar_section_controls')
      .update({ admin_notes: notes })
      .eq('section_key', sectionKey);

    if (error) throw error;
    setSections(prev => prev.map(s => s.section_key === sectionKey ? { ...s, admin_notes: notes } : s));
  }, []);

  return {
    sections,
    metrics,
    loading,
    isSectionActive,
    getActiveMetrics,
    toggleSection,
    toggleMetric,
    updateMetric,
    updateSectionNotes,
    refresh: loadAll
  };
}
