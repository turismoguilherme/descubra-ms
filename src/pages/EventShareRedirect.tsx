import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingFallback from '@/components/ui/loading-fallback';
import { buildEventAppUrl } from '@/utils/eventShare';

/**
 * Fallback SPA para /evento/:id em desenvolvimento local (sem API Vercel).
 * Em produção, /evento/:id é atendido por api/evento/[id].ts com Open Graph.
 */
const EventShareRedirect = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (eventId) {
      navigate(buildEventAppUrl(eventId), { replace: true });
    } else {
      navigate('/descubrams/eventos', { replace: true });
    }
  }, [eventId, navigate]);

  return <LoadingFallback />;
};

export default EventShareRedirect;
