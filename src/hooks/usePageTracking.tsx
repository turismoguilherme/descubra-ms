
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { InteractionTracker } from '@/services/tracking/InteractionTrackerService';

interface PageTrackingOptions {
  target_id?: string;
  target_name?: string;
}

export const usePageTracking = (options?: PageTrackingOptions) => {
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Registra a visualização da página quando o componente é montado
    const trackPageView = () => {
      startTimeRef.current = Date.now();
      InteractionTracker.track({
        interaction_type: 'page_view',
        path: location.pathname,
        target_id: options?.target_id,
        target_name: options?.target_name,
      });
    };

    trackPageView();

    // Registra a duração quando o componente é desmontado
    return () => {
      const endTime = Date.now();
      const duration_seconds = Math.round((endTime - startTimeRef.current) / 1000);
      
      // Podemos enviar uma nova interação 'page_duration' ou atualizar a 'page_view'
      // Por simplicidade, vamos enviar uma nova interação para não complicar a lógica de 'track'
      // Em uma implementação mais avançada, poderíamos ter um método 'updateInteraction'
      if (duration_seconds > 1) { // Só registra se for um tempo significativo
        InteractionTracker.track({
            interaction_type: 'page_view', // Mantemos o mesmo tipo, mas com duração
            path: location.pathname,
            target_id: options?.target_id,
            target_name: options?.target_name,
            duration_seconds: duration_seconds,
            details: { event: 'duration' }
          });
      }
    };
  }, [location.pathname, options?.target_id, options?.target_name]); // Re-executa se a rota ou o alvo mudar
}; 