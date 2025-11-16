import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  totalVisitors: number;
  activeEvents: number;
  catsCount: number;
  attractionsCount: number;
}

export const useDashboardMetrics = () => {
  const query = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      return {
        totalVisitors: 0,
        activeEvents: 0,
        catsCount: 0,
        attractionsCount: 0
      };
    }
  });

  return {
    metrics: query.data,
    loading: query.isLoading,
    alerts: [],
    isRealtime: false,
    refresh: query.refetch,
    useDashboardMetrics: () => query
  };
};
